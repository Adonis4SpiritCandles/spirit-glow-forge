import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

interface ExportData {
  products: any[];
  orders: any[];
  customers: any[];
}

interface AdminExportProps {
  data: ExportData;
}

const AdminExport = ({ data }: AdminExportProps) => {
  const { t } = useLanguage();
  const [exportType, setExportType] = useState<'products' | 'orders' | 'customers'>('orders');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');

  const convertToCSV = (data: any[], type: string) => {
    if (!data.length) return '';
    
    let headers: string[];
    let rows: string[][];

    switch (type) {
      case 'products':
        headers = ['ID', 'Name (EN)', 'Name (PL)', 'Category', 'Price PLN', 'Price EUR', 'Stock', 'Created At'];
        rows = data.map(item => [
          item.id,
          item.name_en,
          item.name_pl,
          item.category,
          (item.price_pln / 100).toString(),
          (item.price_eur / 100).toString(),
          item.stock_quantity.toString(),
          new Date(item.created_at).toLocaleDateString()
        ]);
        break;
      case 'orders':
        headers = ['ID', 'User ID', 'Status', 'Total PLN', 'Total EUR', 'Created At'];
        rows = data.map(item => [
          item.id,
          item.user_id,
          item.status,
          (item.total_pln / 100).toString(),
          (item.total_eur / 100).toString(),
          new Date(item.created_at).toLocaleDateString()
        ]);
        break;
      case 'customers':
        headers = ['ID', 'Email', 'First Name', 'Last Name', 'Role', 'Created At'];
        rows = data.map(item => [
          item.id,
          item.email,
          item.first_name || '',
          item.last_name || '',
          item.role,
          new Date(item.created_at).toLocaleDateString()
        ]);
        break;
      default:
        return '';
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { 
      type: type === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    try {
      const selectedData = data[exportType];
      if (!selectedData || selectedData.length === 0) {
        toast({
          title: "No Data",
          description: `No ${exportType} data available to export`,
          variant: "destructive",
        });
        return;
      }

      let content: string;
      let filename: string;

      if (format === 'csv') {
        content = convertToCSV(selectedData, exportType);
        filename = `spirit_candles_${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        content = JSON.stringify(selectedData, null, 2);
        filename = `spirit_candles_${exportType}_${new Date().toISOString().split('T')[0]}.json`;
      }

      downloadFile(content, filename, format);
      
      toast({
        title: "Export Successful",
        description: `${exportType} data exported successfully`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-playfair flex items-center gap-2">
          <Download className="h-5 w-5" />
          {t('exportData')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Data Type</label>
          <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="products">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  {t('products')} ({data.products?.length || 0} items)
                </div>
              </SelectItem>
              <SelectItem value="orders">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('orders')} ({data.orders?.length || 0} items)
                </div>
              </SelectItem>
              <SelectItem value="customers">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('customers')} ({data.customers?.length || 0} items)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Format</label>
          <Select value={format} onValueChange={(value: any) => setFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV (Excel compatible)
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  JSON (Developer format)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleExport}
          className="w-full"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Export {exportType} as {format.toUpperCase()}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminExport;