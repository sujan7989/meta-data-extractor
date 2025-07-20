import React, { useState } from 'react';
import { Database, RefreshCw, Github, Heart, Zap, Shield, FileSearch } from 'lucide-react';
import FileUpload from './components/FileUpload';
import MetadataDisplay from './components/MetadataDisplay';
import { MetadataExtractor, ExtendedMetadata } from './utils/metadataExtractor';

function App() {
  const [metadata, setMetadata] = useState<ExtendedMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      const fileMetadata = await MetadataExtractor.extractMetadata(file);
      setMetadata(fileMetadata);
    } catch (error) {
      console.error('Error extracting metadata:', error);
      setError('Failed to extract metadata. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setMetadata(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MetaExtractor</h1>
                <p className="text-xs text-gray-500">Professional File Metadata Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced File Metadata Analysis
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload any file to instantly view comprehensive metadata including EXIF data, security analysis, content statistics, and technical details.
          </p>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          {/* File Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Metadata Display Section */}
          {metadata && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-800">Analysis Results</h3>
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Analyze Another File</span>
                </button>
              </div>
              
              <MetadataDisplay metadata={metadata} />
            </div>
          )}
        </div>

        {/* Features Section */}
        {!metadata && (
          <div className="mt-16 grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileSearch className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Comprehensive Analysis</h3>
              <p className="text-gray-600 text-sm">Extract detailed metadata from any file type including EXIF data, dimensions, and technical properties.</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Instant Results</h3>
              <p className="text-gray-600 text-sm">Get immediate analysis results with advanced entropy calculation and file signature detection.</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Security Analysis</h3>
              <p className="text-gray-600 text-sm">Detect encryption, calculate checksums, and identify potentially executable files.</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Privacy First</h3>
              <p className="text-gray-600 text-sm">Your files never leave your device. All analysis is performed locally in your browser.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            Built with <Heart className="inline w-4 h-4 text-red-500" /> for developers and content creators
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;