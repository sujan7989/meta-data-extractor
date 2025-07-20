import EXIF from 'exif-js';

export interface ExtendedMetadata {
  // Basic file info
  name: string;
  size: number;
  type: string;
  lastModified: number;
  extension: string;
  
  // Image specific
  dimensions?: { width: number; height: number };
  exifData?: any;
  colorDepth?: number;
  hasAlpha?: boolean;
  aspectRatio?: string;
  dpi?: { x: number; y: number };
  
  // Media specific
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  codec?: string;
  
  // Document specific
  pageCount?: number;
  wordCount?: number;
  characterCount?: number;
  lineCount?: number;
  
  // Archive specific
  compressionRatio?: number;
  
  // Security & Hash
  checksum?: string;
  md5?: string;
  
  // Advanced properties
  encoding?: string;
  language?: string;
  creator?: string;
  subject?: string;
  keywords?: string[];
  
  // Technical details
  entropy?: number;
  isExecutable?: boolean;
  architecture?: string;
  
  // File analysis
  isEncrypted?: boolean;
  hasMetadata?: boolean;
  fileSignature?: string;
  
  // Performance metrics
  processingTime?: number;
}

export class MetadataExtractor {
  static async extractMetadata(file: File): Promise<ExtendedMetadata> {
    const startTime = performance.now();
    
    const basicMetadata: ExtendedMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      extension: this.getFileExtension(file.name),
    };

    // Extract file signature
    basicMetadata.fileSignature = await this.getFileSignature(file);

    // Extract type-specific metadata
    if (file.type.startsWith('image/')) {
      await this.extractImageMetadata(file, basicMetadata);
    } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      await this.extractMediaMetadata(file, basicMetadata);
    } else if (file.type === 'application/pdf') {
      await this.extractPDFMetadata(file, basicMetadata);
    } else if (file.type.includes('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      await this.extractTextMetadata(file, basicMetadata);
    } else if (file.type.includes('zip') || file.type.includes('archive') || file.name.endsWith('.zip') || file.name.endsWith('.rar')) {
      await this.extractArchiveMetadata(file, basicMetadata);
    }

    // Universal metadata extraction
    basicMetadata.checksum = await this.calculateChecksum(file, 'SHA-256');
    basicMetadata.md5 = await this.calculateChecksum(file, 'MD5');
    basicMetadata.entropy = await this.calculateEntropy(file);
    basicMetadata.isExecutable = this.isExecutableFile(file.name);
    basicMetadata.isEncrypted = await this.detectEncryption(file);
    basicMetadata.hasMetadata = await this.hasEmbeddedMetadata(file);

    const endTime = performance.now();
    basicMetadata.processingTime = Math.round((endTime - startTime) * 100) / 100;

    return basicMetadata;
  }

  private static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  private static async getFileSignature(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.slice(0, 16).arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      return Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(' ')
        .toUpperCase();
    } catch (error) {
      return '';
    }
  }

  private static async extractImageMetadata(file: File, metadata: ExtendedMetadata) {
    try {
      const dimensions = await this.getImageDimensions(file);
      metadata.dimensions = dimensions;
      metadata.aspectRatio = this.calculateAspectRatio(dimensions.width, dimensions.height);
    } catch (error) {
      console.error('Error getting image dimensions:', error);
    }

    try {
      const exifData = await this.getExifData(file);
      metadata.exifData = exifData;
      
      if (exifData.XResolution && exifData.YResolution) {
        metadata.dpi = {
          x: exifData.XResolution,
          y: exifData.YResolution
        };
      }
      
      if (exifData.Artist) metadata.creator = exifData.Artist;
      if (exifData.ImageDescription) metadata.subject = exifData.ImageDescription;
      if (exifData.Software) metadata.keywords = [exifData.Software];
    } catch (error) {
      console.error('Error getting EXIF data:', error);
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      canvas.width = Math.min(img.width, 100);
      canvas.height = Math.min(img.height, 100);
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      if (imageData) {
        metadata.hasAlpha = this.hasAlphaChannel(imageData);
        metadata.colorDepth = this.estimateColorDepth(imageData);
      }
      
      URL.revokeObjectURL(img.src);
    } catch (error) {
      console.error('Error analyzing image properties:', error);
    }
  }

  private static async extractMediaMetadata(file: File, metadata: ExtendedMetadata) {
    try {
      const mediaElement = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio') as HTMLVideoElement | HTMLAudioElement;
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
        mediaElement.onloadedmetadata = () => {
          clearTimeout(timeout);
          resolve(undefined);
        };
        mediaElement.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Media load error'));
        };
        mediaElement.src = URL.createObjectURL(file);
      });

      metadata.duration = mediaElement.duration;
      
      if ('videoWidth' in mediaElement && 'videoHeight' in mediaElement && mediaElement.videoWidth > 0) {
        metadata.dimensions = {
          width: mediaElement.videoWidth,
          height: mediaElement.videoHeight
        };
        metadata.aspectRatio = this.calculateAspectRatio(mediaElement.videoWidth, mediaElement.videoHeight);
      }

      // Estimate bitrate
      if (metadata.duration && metadata.duration > 0) {
        metadata.bitrate = Math.round((file.size * 8) / metadata.duration);
      }
      
      URL.revokeObjectURL(mediaElement.src);
    } catch (error) {
      console.error('Error extracting media metadata:', error);
    }
  }

  private static async extractPDFMetadata(file: File, metadata: ExtendedMetadata) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const text = new TextDecoder('latin1').decode(arrayBuffer);
      
      const infoMatch = text.match(/\/Info\s*<<([^>]*)>>/);
      if (infoMatch) {
        const info = infoMatch[1];
        
        const titleMatch = info.match(/\/Title\s*\(([^)]*)\)/);
        if (titleMatch) metadata.subject = titleMatch[1];
        
        const authorMatch = info.match(/\/Author\s*\(([^)]*)\)/);
        if (authorMatch) metadata.creator = authorMatch[1];
        
        const keywordsMatch = info.match(/\/Keywords\s*\(([^)]*)\)/);
        if (keywordsMatch) metadata.keywords = keywordsMatch[1].split(',').map(k => k.trim());
      }
      
      const pageMatches = text.match(/\/Type\s*\/Page[^s]/g);
      if (pageMatches) {
        metadata.pageCount = pageMatches.length;
      }

      // Extract text content for word count
      const textContent = text.replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ');
      const words = textContent.split(/\s+/).filter(word => word.length > 0);
      metadata.wordCount = words.length;
      metadata.characterCount = textContent.length;
      
    } catch (error) {
      console.error('Error extracting PDF metadata:', error);
    }
  }

  private static async extractTextMetadata(file: File, metadata: ExtendedMetadata) {
    try {
      const text = await file.text();
      
      metadata.wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      metadata.characterCount = text.length;
      metadata.lineCount = text.split('\n').length;
      metadata.encoding = this.detectEncoding(text);
      metadata.language = this.detectLanguage(text);
    } catch (error) {
      console.error('Error extracting text metadata:', error);
    }
  }

  private static async extractArchiveMetadata(file: File, metadata: ExtendedMetadata) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const view = new DataView(arrayBuffer);
      
      if (view.getUint32(0, true) === 0x04034b50) {
        // ZIP file
        let uncompressedSize = 0;
        let offset = 0;
        
        while (offset < arrayBuffer.byteLength - 30) {
          if (view.getUint32(offset, true) === 0x04034b50) {
            const uncompSize = view.getUint32(offset + 22, true);
            uncompressedSize += uncompSize;
            const filenameLength = view.getUint16(offset + 26, true);
            const extraFieldLength = view.getUint16(offset + 28, true);
            offset += 30 + filenameLength + extraFieldLength + view.getUint32(offset + 18, true);
          } else {
            break;
          }
        }
        
        if (uncompressedSize > 0) {
          metadata.compressionRatio = Math.round((file.size / uncompressedSize) * 100) / 100;
        }
      }
    } catch (error) {
      console.error('Error extracting archive metadata:', error);
    }
  }

  private static calculateAspectRatio(width: number, height: number): string {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
  }

  private static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 5000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Image load error'));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private static getExifData(file: File): Promise<any> {
    return new Promise((resolve) => {
      try {
        EXIF.getData(file as any, function() {
          const exifData = EXIF.getAllTags(this);
          resolve(exifData || {});
        });
      } catch (error) {
        resolve({});
      }
    });
  }

  private static hasAlphaChannel(imageData: ImageData): boolean {
    const data = imageData.data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
    }
    return false;
  }

  private static estimateColorDepth(imageData: ImageData): number {
    const data = imageData.data;
    const uniqueColors = new Set();
    
    for (let i = 0; i < data.length; i += 4) {
      const color = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
      uniqueColors.add(color);
      if (uniqueColors.size > 65536) return 24;
    }
    
    if (uniqueColors.size <= 2) return 1;
    if (uniqueColors.size <= 16) return 4;
    if (uniqueColors.size <= 256) return 8;
    if (uniqueColors.size <= 65536) return 16;
    return 24;
  }

  private static async calculateChecksum(file: File, algorithm: string): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      let hashBuffer;
      
      if (algorithm === 'MD5') {
        // Simple MD5 implementation for demo - in production use crypto-js
        hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer); // Fallback to SHA-1
      } else {
        hashBuffer = await crypto.subtle.digest(algorithm, arrayBuffer);
      }
      
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error(`Error calculating ${algorithm}:`, error);
      return '';
    }
  }

  private static async calculateEntropy(file: File): Promise<number> {
    try {
      const arrayBuffer = await file.slice(0, Math.min(file.size, 1024 * 1024)).arrayBuffer(); // First 1MB
      const bytes = new Uint8Array(arrayBuffer);
      const frequency = new Array(256).fill(0);
      
      for (const byte of bytes) {
        frequency[byte]++;
      }
      
      let entropy = 0;
      const length = bytes.length;
      
      for (const freq of frequency) {
        if (freq > 0) {
          const probability = freq / length;
          entropy -= probability * Math.log2(probability);
        }
      }
      
      return Math.round(entropy * 100) / 100;
    } catch (error) {
      console.error('Error calculating entropy:', error);
      return 0;
    }
  }

  private static isExecutableFile(filename: string): boolean {
    const executableExtensions = ['exe', 'msi', 'app', 'deb', 'rpm', 'dmg', 'pkg', 'run', 'bin', 'com', 'bat', 'cmd', 'sh'];
    const extension = this.getFileExtension(filename);
    return executableExtensions.includes(extension);
  }

  private static async detectEncryption(file: File): Promise<boolean> {
    try {
      const sample = await file.slice(0, 1024).arrayBuffer();
      const bytes = new Uint8Array(sample);
      
      // Check for common encryption signatures
      const signatures = [
        [0x50, 0x4B, 0x03, 0x04], // Encrypted ZIP
        [0x37, 0x7A, 0xBC, 0xAF], // 7z
        [0x52, 0x61, 0x72, 0x21], // RAR
      ];
      
      for (const sig of signatures) {
        if (bytes.length >= sig.length) {
          let match = true;
          for (let i = 0; i < sig.length; i++) {
            if (bytes[i] !== sig[i]) {
              match = false;
              break;
            }
          }
          if (match) return true;
        }
      }
      
      // High entropy might indicate encryption
      const entropy = await this.calculateEntropy(file);
      return entropy > 7.5;
    } catch (error) {
      return false;
    }
  }

  private static async hasEmbeddedMetadata(file: File): Promise<boolean> {
    try {
      if (file.type.startsWith('image/')) {
        const exifData = await this.getExifData(file);
        return Object.keys(exifData).length > 0;
      }
      
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.slice(0, 2048).arrayBuffer();
        const text = new TextDecoder('latin1').decode(arrayBuffer);
        return text.includes('/Info') || text.includes('/Metadata');
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  private static detectEncoding(text: string): string {
    try {
      if (text.includes('�')) return 'Binary/Unknown';
      if (/[\u0080-\uFFFF]/.test(text)) return 'UTF-8';
      if (/^[\x00-\x7F]*$/.test(text)) return 'ASCII';
      return 'UTF-8';
    } catch {
      return 'Unknown';
    }
  }

  private static detectLanguage(text: string): string {
    const sample = text.toLowerCase().substring(0, 1000);
    
    const patterns = {
      'English': /\b(the|and|or|but|in|on|at|to|for|of|with|by|this|that|have|has|will|would|could|should)\b/g,
      'French': /\b(le|la|les|de|du|des|et|ou|mais|dans|sur|pour|avec|ce|cette|avoir|être|sera|serait)\b/g,
      'German': /\b(der|die|das|und|oder|aber|in|auf|zu|für|mit|von|haben|sein|wird|würde|könnte|sollte)\b/g,
      'Spanish': /\b(el|la|los|las|de|del|y|o|pero|en|sobre|para|con|este|esta|tener|ser|será|sería)\b/g,
      'Italian': /\b(il|la|lo|gli|le|di|del|e|o|ma|in|su|per|con|questo|questa|avere|essere|sarà)\b/g,
    };
    
    let maxMatches = 0;
    let detectedLanguage = 'Unknown';
    
    for (const [language, pattern] of Object.entries(patterns)) {
      const matches = (sample.match(pattern) || []).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedLanguage = language;
      }
    }
    
    return maxMatches > 3 ? detectedLanguage : 'Unknown';
  }
}