import React, { useState } from 'react';
import { 
  FileText, Calendar, HardDrive, Tag, Image, Clock, Hash, Shield, 
  Zap, Code, Globe, User, BookOpen, Layers, Monitor, Camera,
  ChevronDown, ChevronRight, Copy, Check, AlertTriangle
} from 'lucide-react';
import { ExtendedMetadata } from '../utils/metadataExtractor';

interface MetadataDisplayProps {
  metadata: ExtendedMetadata;
}

const MetadataDisplay: React.FC<MetadataDisplayProps> = ({ metadata }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBitrate = (bitrate: number): string => {
    if (bitrate > 1000000) return `${(bitrate / 1000000).toFixed(1)} Mbps`;
    if (bitrate > 1000) return `${(bitrate / 1000).toFixed(1)} Kbps`;
    return `${bitrate} bps`;
  };

  const getFileCategory = (type: string): string => {
    if (type.startsWith('image/')) return 'Image';
    if (type.startsWith('video/')) return 'Video';
    if (type.startsWith('audio/')) return 'Audio';
    if (type.includes('pdf')) return 'PDF Document';
    if (type.includes('document') || type.includes('word')) return 'Document';
    if (type.includes('spreadsheet') || type.includes('excel')) return 'Spreadsheet';
    if (type.includes('presentation') || type.includes('powerpoint')) return 'Presentation';
    if (type.includes('zip') || type.includes('archive')) return 'Archive';
    if (type.includes('text')) return 'Text File';
    return 'Unknown';
  };

  const MetadataItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    copyable?: boolean;
    warning?: boolean;
  }> = ({ icon, label, value, copyable = false, warning = false }) => (
    <div className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
      warning ? 'bg-yellow-50 hover:bg-yellow-100' : 'bg-gray-50 hover:bg-gray-100'
    }`}>
      <div className="flex-shrink-0 mt-0.5">
        {warning ? <AlertTriangle className="w-5 h-5 text-yellow-500" /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <dt className="text-sm font-medium text-gray-600 mb-1">
          {label}
        </dt>
        <dd className="text-sm text-gray-900 break-all">
          {value}
        </dd>
      </div>
      {copyable && (
        <button
          onClick={() => copyToClipboard(String(value), label)}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Copy to clipboard"
        >
          {copiedField === label ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );

  const Section: React.FC<{
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ id, title, icon, children }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {icon}
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {isExpanded && (
          <div className="p-4 space-y-3">
            {children}
          </div>
        )}
      </div>
    );
  };

  const basicItems = [
    {
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      label: 'File Name',
      value: metadata.name,
      copyable: true
    },
    {
      icon: <Tag className="w-5 h-5 text-green-500" />,
      label: 'File Type',
      value: getFileCategory(metadata.type)
    },
    {
      icon: <Tag className="w-5 h-5 text-purple-500" />,
      label: 'MIME Type',
      value: metadata.type,
      copyable: true
    },
    {
      icon: <Tag className="w-5 h-5 text-indigo-500" />,
      label: 'Extension',
      value: metadata.extension.toUpperCase()
    },
    {
      icon: <HardDrive className="w-5 h-5 text-orange-500" />,
      label: 'File Size',
      value: formatFileSize(metadata.size)
    },
    {
      icon: <Calendar className="w-5 h-5 text-red-500" />,
      label: 'Last Modified',
      value: formatDate(metadata.lastModified)
    }
  ];

  const technicalItems = [
    metadata.fileSignature && {
      icon: <Code className="w-5 h-5 text-gray-500" />,
      label: 'File Signature',
      value: metadata.fileSignature,
      copyable: true
    },
    metadata.entropy !== undefined && {
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      label: 'Entropy',
      value: `${metadata.entropy}/8.0 bits`,
      warning: metadata.entropy > 7.5
    },
    metadata.encoding && {
      icon: <Globe className="w-5 h-5 text-blue-500" />,
      label: 'Encoding',
      value: metadata.encoding
    },
    metadata.isExecutable !== undefined && {
      icon: <Shield className="w-5 h-5 text-red-500" />,
      label: 'Executable',
      value: metadata.isExecutable ? 'Yes' : 'No',
      warning: metadata.isExecutable
    },
    metadata.isEncrypted !== undefined && {
      icon: <Shield className="w-5 h-5 text-purple-500" />,
      label: 'Encrypted',
      value: metadata.isEncrypted ? 'Possibly' : 'No',
      warning: metadata.isEncrypted
    },
    metadata.hasMetadata !== undefined && {
      icon: <Layers className="w-5 h-5 text-green-500" />,
      label: 'Has Embedded Metadata',
      value: metadata.hasMetadata ? 'Yes' : 'No'
    },
    metadata.processingTime && {
      icon: <Clock className="w-5 h-5 text-indigo-500" />,
      label: 'Processing Time',
      value: `${metadata.processingTime}ms`
    }
  ].filter(Boolean);

  const securityItems = [
    metadata.checksum && {
      icon: <Hash className="w-5 h-5 text-green-500" />,
      label: 'SHA-256 Checksum',
      value: metadata.checksum,
      copyable: true
    },
    metadata.md5 && {
      icon: <Hash className="w-5 h-5 text-blue-500" />,
      label: 'MD5 Hash',
      value: metadata.md5,
      copyable: true
    }
  ].filter(Boolean);

  const mediaItems = [
    metadata.dimensions && {
      icon: <Monitor className="w-5 h-5 text-blue-500" />,
      label: 'Dimensions',
      value: `${metadata.dimensions.width} × ${metadata.dimensions.height} pixels`
    },
    metadata.aspectRatio && {
      icon: <Monitor className="w-5 h-5 text-purple-500" />,
      label: 'Aspect Ratio',
      value: metadata.aspectRatio
    },
    metadata.duration !== undefined && {
      icon: <Clock className="w-5 h-5 text-indigo-500" />,
      label: 'Duration',
      value: formatDuration(metadata.duration)
    },
    metadata.bitrate && {
      icon: <Zap className="w-5 h-5 text-orange-500" />,
      label: 'Bitrate',
      value: formatBitrate(metadata.bitrate)
    },
    metadata.colorDepth && {
      icon: <Image className="w-5 h-5 text-pink-500" />,
      label: 'Color Depth',
      value: `${metadata.colorDepth}-bit`
    },
    metadata.hasAlpha !== undefined && {
      icon: <Layers className="w-5 h-5 text-green-500" />,
      label: 'Alpha Channel',
      value: metadata.hasAlpha ? 'Yes' : 'No'
    },
    metadata.dpi && {
      icon: <Camera className="w-5 h-5 text-red-500" />,
      label: 'DPI',
      value: `${metadata.dpi.x} × ${metadata.dpi.y}`
    }
  ].filter(Boolean);

  const contentItems = [
    metadata.wordCount !== undefined && {
      icon: <BookOpen className="w-5 h-5 text-blue-500" />,
      label: 'Word Count',
      value: metadata.wordCount.toLocaleString()
    },
    metadata.characterCount !== undefined && {
      icon: <FileText className="w-5 h-5 text-green-500" />,
      label: 'Character Count',
      value: metadata.characterCount.toLocaleString()
    },
    metadata.lineCount !== undefined && {
      icon: <FileText className="w-5 h-5 text-purple-500" />,
      label: 'Line Count',
      value: metadata.lineCount.toLocaleString()
    },
    metadata.pageCount !== undefined && {
      icon: <BookOpen className="w-5 h-5 text-orange-500" />,
      label: 'Page Count',
      value: metadata.pageCount.toLocaleString()
    },
    metadata.language && {
      icon: <Globe className="w-5 h-5 text-indigo-500" />,
      label: 'Language',
      value: metadata.language
    },
    metadata.compressionRatio && {
      icon: <HardDrive className="w-5 h-5 text-yellow-500" />,
      label: 'Compression Ratio',
      value: `${metadata.compressionRatio}:1`
    }
  ].filter(Boolean);

  const metadataItems = [
    metadata.creator && {
      icon: <User className="w-5 h-5 text-blue-500" />,
      label: 'Creator/Author',
      value: metadata.creator
    },
    metadata.subject && {
      icon: <BookOpen className="w-5 h-5 text-green-500" />,
      label: 'Subject/Title',
      value: metadata.subject
    },
    metadata.keywords && metadata.keywords.length > 0 && {
      icon: <Tag className="w-5 h-5 text-purple-500" />,
      label: 'Keywords',
      value: metadata.keywords.join(', ')
    }
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <Section id="basic" title="Basic Information" icon={<FileText className="w-6 h-6 text-blue-600" />}>
        {basicItems.map((item, index) => (
          <MetadataItem key={index} {...item} />
        ))}
      </Section>

      {technicalItems.length > 0 && (
        <Section id="technical" title="Technical Details" icon={<Code className="w-6 h-6 text-gray-600" />}>
          {technicalItems.map((item, index) => (
            <MetadataItem key={index} {...item} />
          ))}
        </Section>
      )}

      {securityItems.length > 0 && (
        <Section id="security" title="Security & Integrity" icon={<Shield className="w-6 h-6 text-red-600" />}>
          {securityItems.map((item, index) => (
            <MetadataItem key={index} {...item} />
          ))}
        </Section>
      )}

      {mediaItems.length > 0 && (
        <Section id="media" title="Media Properties" icon={<Image className="w-6 h-6 text-purple-600" />}>
          {mediaItems.map((item, index) => (
            <MetadataItem key={index} {...item} />
          ))}
        </Section>
      )}

      {contentItems.length > 0 && (
        <Section id="content" title="Content Analysis" icon={<BookOpen className="w-6 h-6 text-green-600" />}>
          {contentItems.map((item, index) => (
            <MetadataItem key={index} {...item} />
          ))}
        </Section>
      )}

      {metadataItems.length > 0 && (
        <Section id="embedded" title="Embedded Metadata" icon={<Layers className="w-6 h-6 text-indigo-600" />}>
          {metadataItems.map((item, index) => (
            <MetadataItem key={index} {...item} />
          ))}
        </Section>
      )}

      {metadata.exifData && Object.keys(metadata.exifData).length > 0 && (
        <Section id="exif" title="EXIF Data" icon={<Camera className="w-6 h-6 text-pink-600" />}>
          {Object.entries(metadata.exifData).map(([key, value], index) => (
            <MetadataItem
              key={index}
              icon={<Camera className="w-5 h-5 text-pink-500" />}
              label={key}
              value={String(value)}
              copyable={true}
            />
          ))}
        </Section>
      )}
    </div>
  );
};

export default MetadataDisplay;