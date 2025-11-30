import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { TransactionTable } from './components/TransactionTable';
import { analyzeStatement } from './services/geminiService';
import { Transaction, ProcessingState, ProcessingStatus } from './types';
import { Loader2, Download, Copy, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<ProcessingState>({
    status: ProcessingStatus.IDLE,
    data: [],
  });
  const [filename, setFilename] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setFilename(file.name);
    setState({ status: ProcessingStatus.PROCESSING, data: [] });

    try {
      const transactions = await analyzeStatement(file);
      setState({
        status: ProcessingStatus.SUCCESS,
        data: transactions,
      });
    } catch (error) {
      console.error(error);
      setState({
        status: ProcessingStatus.ERROR,
        data: [],
        error: "Failed to process the document. Please ensure it's a clear image or PDF of a bank statement.",
      });
    }
  };

  const handleReset = () => {
    setState({ status: ProcessingStatus.IDLE, data: [] });
    setFilename(null);
  };

  const generateCSV = (transactions: Transaction[]) => {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Notes'];
    const rows = transactions.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
      t.amount,
      t.category,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  const handleDownloadCSV = () => {
    if (state.data.length === 0) return;
    const csvContent = generateCSV(state.data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCSV = () => {
    if (state.data.length === 0) return;
    const csvContent = generateCSV(state.data);
    navigator.clipboard.writeText(csvContent);
    alert("CSV copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Statement<span className="text-indigo-600">OCR</span></h1>
          </div>
          <div className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-500 rounded-full border border-slate-200">
             Powered by Gemini 3 Pro
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro / Upload Section */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Ktuntum Bank Statements Data App</h2>
            <p className="text-slate-500 text-lg">Upload your PDF or image bank statements to automatically extract transactions into a clean CSV format.</p>
          </div>

          <div className="max-w-xl mx-auto">
             {state.status === ProcessingStatus.IDLE && (
                <FileUpload 
                  onFileSelect={handleFileSelect} 
                  disabled={false} 
                />
             )}
             
             {state.status !== ProcessingStatus.IDLE && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                           {state.status === ProcessingStatus.PROCESSING ? (
                             <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                           ) : state.status === ProcessingStatus.SUCCESS ? (
                             <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                           ) : (
                             <FileText className="w-5 h-5 text-rose-600" />
                           )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{filename}</p>
                          <p className="text-xs text-slate-500">
                             {state.status === ProcessingStatus.PROCESSING ? 'Analyzing document...' : 
                              state.status === ProcessingStatus.SUCCESS ? 'Analysis complete' : 'Analysis failed'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={handleReset}
                        className="text-xs flex items-center space-x-1 text-slate-500 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-md hover:bg-slate-50"
                      >
                         <RefreshCw size={14} />
                         <span>Process New File</span>
                      </button>
                   </div>
                   
                   {state.status === ProcessingStatus.ERROR && (
                      <div className="bg-rose-50 text-rose-700 text-sm p-3 rounded-lg border border-rose-100 mb-2">
                         {state.error}
                      </div>
                   )}
                </div>
             )}
          </div>
        </div>

        {/* Results Section */}
        {state.status === ProcessingStatus.SUCCESS && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                Extracted Transactions
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                   {state.data.length} items
                </span>
              </h3>
              <div className="flex space-x-3">
                <button 
                  onClick={handleCopyCSV}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
                >
                  <Copy size={16} />
                  <span>Copy CSV</span>
                </button>
                <button 
                  onClick={handleDownloadCSV}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
                >
                  <Download size={16} />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            <TransactionTable transactions={state.data} />
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 flex items-start gap-3">
               <div className="mt-0.5">
                  <FileText className="w-4 h-4 text-blue-600" />
               </div>
               <div>
                  <p className="font-semibold mb-1">Tip for Google Sheets / Excel</p>
                  <p className="opacity-90">
                     Click "Copy CSV" above, then paste directly into cell A1 of your spreadsheet. 
                     If it doesn't format automatically, use the "Data > Split Text to Columns" feature.
                  </p>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;