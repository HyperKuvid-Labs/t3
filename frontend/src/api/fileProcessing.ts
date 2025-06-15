import { createWorker } from 'tesseract.js';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import JSZip from 'jszip';

export interface ProcessedFile {
  filename: string;
  content: string;
  type: string;
  metadata?: {
    pageCount?: number;
    sheetCount?: number;
    slideCount?: number;
    fileSize?: number;
    wordCount?: number;
    characterCount?: number;
    hasImages?: boolean;
    warnings?: number;
    sheets?: string[];
    hasNotes?: boolean;
    slideTitles?: string[];
    originalLength?: number;
    extractedLength?: number;
    hasScripts?: boolean;
    hasStyles?: boolean;
    rootElement?: string;
    rowCount?: number;
    columnCount?: number;
    headers?: string[];
    encoding?: string;
  };
  error?: string;
}

export interface FileProcessorConfig {
  enableOCR: boolean;
  enableImageAnalysis: boolean;
  maxFileSize: number;
  supportedFormats: string[];
  backendUrl: string;
}

export class FileProcessor {
  private static config: FileProcessorConfig = {
    enableOCR: true,
    enableImageAnalysis: false,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    backendUrl: 'http://localhost:8000', // Your Python backend URL
    supportedFormats: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'text/plain',
      'text/csv',
      'application/json',
      'text/html',
      'text/xml',
      'application/xml'
    ]
  };

  private static validateFile(file: File): void {
    if (file.size > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.config.maxFileSize / (1024 * 1024)}MB`);
    }

    if (!this.config.supportedFormats.includes(file.type) && !file.type.startsWith('text/')) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  }

  private static async processTextFile(file: File): Promise<{ content: string; metadata: any }> {
    const content = await file.text();
    return {
      content,
      metadata: {
        fileSize: file.size,
        encoding: 'UTF-8',
        characterCount: content.length,
        wordCount: content.split(/\s+/).filter(word => word.length > 0).length
      }
    };
  }

  // Send PDF to Python backend for processing
  private static async processPDF(file: File): Promise<{ content: string; metadata: any }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', 'pdf');

      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.config.backendUrl}/process-file`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        content: result.content,
        metadata: {
          pageCount: result.metadata?.page_count || 0,
          fileSize: file.size,
          wordCount: result.metadata?.word_count || 0,
          characterCount: result.metadata?.character_count || 0,
          ...result.metadata
        }
      };
    } catch (error) {
      throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async processExcel(file: File): Promise<{ content: string; metadata: any }> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    let content = '';
    const metadata = {
      sheetCount: workbook.SheetNames.length,
      fileSize: file.size,
      sheets: workbook.SheetNames
    };

    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      content += `--- Sheet ${index + 1}: ${sheetName} ---\n`;
      content += `Dimensions: ${range.e.c + 1} columns × ${range.e.r + 1} rows\n`;
      
      sheetData.forEach((row: any, rowIndex) => {
        if (Array.isArray(row) && row.length > 0) {
          content += `Row ${rowIndex + 1}: ${row.join(' | ')}\n`;
        }
      });
      content += '\n';
    });

    return { content, metadata };
  }

  private static async processDocx(file: File): Promise<{ content: string; metadata: any }> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    const styleResult = await mammoth.convertToHtml({ arrayBuffer });
    const wordCount = result.value.split(/\s+/).filter(word => word.length > 0).length;
    
    const metadata = {
      fileSize: file.size,
      wordCount,
      characterCount: result.value.length,
      hasImages: styleResult.value.includes('<img'),
      warnings: result.messages.length
    };

    return {
      content: result.value,
      metadata
    };
  }

  private static async processPowerPoint(file: File): Promise<{ content: string; metadata: any }> {
    const arrayBuffer = await file.arrayBuffer();
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(arrayBuffer);
    
    let content = '';
    let slideCount = 0;
    const slides: string[] = [];

    const slideFiles = Object.keys(zipContent.files).filter(filename => 
      filename.startsWith('ppt/slides/slide') && filename.endsWith('.xml')
    );

    slideCount = slideFiles.length;

    for (const slideFile of slideFiles.sort()) {
      const slideXml = await zipContent.files[slideFile].async('text');
      const slideNumber = slideFile.match(/slide(\d+)\.xml/)?.[1] || '?';
      
      const textMatches = slideXml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
      const slideText = textMatches
        .map(match => match.replace(/<[^>]*>/g, ''))
        .filter(text => text.trim().length > 0)
        .join(' ');

      if (slideText.trim()) {
        content += `--- Slide ${slideNumber} ---\n${slideText}\n\n`;
        slides.push(slideText);
      }
    }

    const notesFiles = Object.keys(zipContent.files).filter(filename => 
      filename.startsWith('ppt/notesSlides/notesSlide') && filename.endsWith('.xml')
    );

    if (notesFiles.length > 0) {
      content += '\n--- Speaker Notes ---\n';
      for (const notesFile of notesFiles.sort()) {
        const notesXml = await zipContent.files[notesFile].async('text');
        const notesMatches = notesXml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
        const notesText = notesMatches
          .map(match => match.replace(/<[^>]*>/g, ''))
          .filter(text => text.trim().length > 0)
          .join(' ');
        
        if (notesText.trim()) {
          const slideNumber = notesFile.match(/notesSlide(\d+)\.xml/)?.[1] || '?';
          content += `Slide ${slideNumber} Notes: ${notesText}\n`;
        }
      }
    }

    const metadata = {
      slideCount,
      fileSize: file.size,
      hasNotes: notesFiles.length > 0,
      slideTitles: slides.slice(0, 5),
      wordCount: content.split(/\s+/).filter(word => word.length > 0).length
    };

    return { content, metadata };
  }

  private static async processHTML(file: File): Promise<{ content: string; metadata: any }> {
    const htmlContent = await file.text();
    
    const textContent = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const metadata = {
      fileSize: file.size,
      originalLength: htmlContent.length,
      extractedLength: textContent.length,
      hasScripts: /<script/i.test(htmlContent),
      hasStyles: /<style/i.test(htmlContent),
      wordCount: textContent.split(/\s+/).filter(word => word.length > 0).length
    };

    return { content: textContent, metadata };
  }

  private static async processXML(file: File): Promise<{ content: string; metadata: any }> {
    const xmlContent = await file.text();
    
    const textContent = xmlContent
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const metadata = {
      fileSize: file.size,
      originalLength: xmlContent.length,
      extractedLength: textContent.length,
      rootElement: xmlContent.match(/<(\w+)[^>]*>/)?.[1] || 'unknown',
      wordCount: textContent.split(/\s+/).filter(word => word.length > 0).length
    };

    return { content: textContent, metadata };
  }

  private static async processCSV(file: File): Promise<{ content: string; metadata: any }> {
    const csvContent = await file.text();
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    let content = '';
    const headers = lines[0]?.split(',') || [];
    
    content += `CSV File Analysis:\n`;
    content += `Headers: ${headers.join(' | ')}\n`;
    content += `Total Rows: ${lines.length}\n\n`;
    
    content += '--- Sample Data ---\n';
    lines.slice(0, Math.min(10, lines.length)).forEach((line, index) => {
      content += `Row ${index + 1}: ${line}\n`;
    });

    const metadata = {
      fileSize: file.size,
      rowCount: lines.length,
      columnCount: headers.length,
      headers: headers
    };

    return { content, metadata };
  }

  private static async processJSON(file: File): Promise<{ content: string; metadata: any }> {
    const jsonContent = await file.text();
    
    try {
      const jsonData = JSON.parse(jsonContent);
      const formattedContent = JSON.stringify(jsonData, null, 2);
      
      const metadata = {
        fileSize: file.size,
        isValidJSON: true,
        objectKeys: typeof jsonData === 'object' ? Object.keys(jsonData).length : 0,
        dataType: Array.isArray(jsonData) ? 'array' : typeof jsonData
      };

      return { content: formattedContent, metadata };
    } catch (error) {
      const metadata = {
        fileSize: file.size,
        isValidJSON: false,
        error: 'Invalid JSON format'
      };

      return { content: jsonContent, metadata };
    }
  }

  static async processFile(file: File): Promise<ProcessedFile> {
    try {
      this.validateFile(file);
      
      let result: { content: string; metadata: any };
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      // Send PDF files to Python backend, process others locally
      if (file.type === 'application/pdf') {
        result = await this.processPDF(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.type === 'application/vnd.ms-excel' ||
                 fileExtension === 'xlsx' || fileExtension === 'xls') {
        result = await this.processExcel(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 file.type === 'application/msword' ||
                 fileExtension === 'docx' || fileExtension === 'doc') {
        result = await this.processDocx(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
                 file.type === 'application/vnd.ms-powerpoint' ||
                 fileExtension === 'pptx' || fileExtension === 'ppt') {
        result = await this.processPowerPoint(file);
      } else if (file.type === 'text/html' || fileExtension === 'html' || fileExtension === 'htm') {
        result = await this.processHTML(file);
      } else if (file.type === 'text/xml' || file.type === 'application/xml' || fileExtension === 'xml') {
        result = await this.processXML(file);
      } else if (file.type === 'text/csv' || fileExtension === 'csv') {
        result = await this.processCSV(file);
      } else if (file.type === 'application/json' || fileExtension === 'json') {
        result = await this.processJSON(file);
      } else if (file.type.startsWith('text/')) {
        result = await this.processTextFile(file);
      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      return {
        filename: file.name,
        content: result.content,
        type: file.type,
        metadata: result.metadata
      };
    } catch (error: any) {
      return {
        filename: file.name,
        content: '',
        type: file.type,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async processFiles(files: File[]): Promise<ProcessedFile[]> {
    const results: ProcessedFile[] = [];
    
    const batchSize = 3;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(file => this.processFile(file))
      );
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            filename: batch[index].name,
            content: '',
            type: batch[index].type,
            error: `Processing failed: ${result.reason}`
          });
        }
      });
    }
    
    return results;
  }

  static formatProcessedFiles(files: ProcessedFile[]): string {
    return files
      .map(file => {
        if (file.error) {
          return `❌ [Error processing ${file.filename}]: ${file.error}\n`;
        }
        
        let output = `📄 [Content from ${file.filename}]:\n`;
        
        if (file.metadata) {
          output += `📊 Metadata: ${JSON.stringify(file.metadata, null, 2)}\n`;
        }
        
        output += `📝 Content:\n${file.content}\n`;
        output += '─'.repeat(80) + '\n';
        
        return output;
      })
      .join('\n');
  }

  static getProcessingStats(files: ProcessedFile[]): {
    total: number;
    successful: number;
    failed: number;
    byType: Record<string, number>;
    totalWords: number;
    totalCharacters: number;
  } {
    const stats = {
      total: files.length,
      successful: files.filter(f => !f.error).length,
      failed: files.filter(f => f.error).length,
      byType: {} as Record<string, number>,
      totalWords: 0,
      totalCharacters: 0
    };

    files.forEach(file => {
      const type = file.type.split('/')[1] || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      if (file.metadata?.wordCount) {
        stats.totalWords += file.metadata.wordCount;
      }
      if (file.metadata?.characterCount) {
        stats.totalCharacters += file.metadata.characterCount;
      }
    });

    return stats;
  }

  static updateConfig(newConfig: Partial<FileProcessorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  static getConfig(): FileProcessorConfig {
    return { ...this.config };
  }

  static getSupportedExtensions(): string[] {
    return [
      'pdf', 'xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt',
      'txt', 'csv', 'json', 'html', 'htm', 'xml'
    ];
  }

  static isFileSupported(file: File): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return this.getSupportedExtensions().includes(extension || '') ||
           this.config.supportedFormats.includes(file.type) ||
           file.type.startsWith('text/');
  }
}

// Usage example and utility functions
export class FileProcessorUtils {
  static async processFileWithProgress(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ProcessedFile> {
    onProgress?.(0);
    
    const result = await FileProcessor.processFile(file);
    
    onProgress?.(100);
    return result;
  }

  static async processFilesWithProgress(
    files: File[],
    onProgress?: (current: number, total: number, filename: string) => void
  ): Promise<ProcessedFile[]> {
    const results: ProcessedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      onProgress?.(i, files.length, files[i].name);
      const result = await FileProcessor.processFile(files[i]);
      results.push(result);
    }
    
    onProgress?.(files.length, files.length, 'Complete');
    return results;
  }

  static validateFileBeforeProcessing(file: File): { valid: boolean; reason?: string } {
    try {
      const config = FileProcessor.getConfig();
      
      if (file.size > config.maxFileSize) {
        return { 
          valid: false, 
          reason: `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB > ${config.maxFileSize / 1024 / 1024}MB)` 
        };
      }
      
      if (!FileProcessor.isFileSupported(file)) {
        return { valid: false, reason: `Unsupported file type: ${file.type}` };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Validation error' };
    }
  }
}
