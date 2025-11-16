import * as XLSX from 'xlsx';

export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'txt';

export interface ExportData {
  headers: string[];
  rows: any[][];
  filename: string;
}

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: ExportData) => {
  const { headers, rows, filename } = data;
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape cells containing commas or quotes
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(','))
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
};

/**
 * Export data to Excel format
 */
export const exportToExcel = (data: ExportData) => {
  const { headers, rows, filename } = data;
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  
  // Write file
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

/**
 * Export data to JSON format
 */
export const exportToJSON = (data: ExportData) => {
  const { headers, rows, filename } = data;
  
  // Convert to array of objects
  const jsonData = rows.map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  // Create blob and download
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { 
    type: 'application/json;charset=utf-8;' 
  });
  downloadBlob(blob, `${filename}.json`);
};

/**
 * Helper function to download a blob
 */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export data to TXT format
 */
export const exportToTXT = (data: ExportData) => {
  const { headers, rows, filename } = data;
  
  // Create TXT content (tab-separated)
  const txtContent = [
    headers.join('\t'),
    ...rows.map(row => row.join('\t'))
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
  downloadBlob(blob, `${filename}.txt`);
};

/**
 * Main export function
 */
export const exportData = (data: ExportData, format: ExportFormat) => {
  switch (format) {
    case 'csv':
      exportToCSV(data);
      break;
    case 'xlsx':
      exportToExcel(data);
      break;
    case 'json':
      exportToJSON(data);
      break;
    case 'txt':
      exportToTXT(data);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};
