import React from 'react';
import { Transaction } from '../types';
import { TrendingUp, TrendingDown, Calendar, Tag, FileText } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <div className="text-slate-400 mb-2">No transactions found</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="w-full overflow-hidden bg-white shadow-sm rounded-lg border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((t, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                  {t.date}
                </td>
                <td className="px-6 py-4 text-sm text-slate-800">
                  {t.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {t.category}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                   <span className="flex items-center justify-end gap-1">
                     {t.amount >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                     {formatCurrency(t.amount)}
                   </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 italic">
                  {t.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
        <span>{transactions.length} transactions found</span>
        <span>Net Total: {formatCurrency(transactions.reduce((acc, curr) => acc + curr.amount, 0))}</span>
      </div>
    </div>
  );
};