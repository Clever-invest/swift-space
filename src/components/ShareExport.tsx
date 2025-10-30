// =====================================
// КОМПОНЕНТ ШАРИНГА И ЭКСПОРТА
// =====================================

import React, { useState } from 'react';
import { Share2, Download, FileText, Save } from 'lucide-react';
import type { DealInput, DealOutputsProject, DealOutputsInvestor } from '../calculations/types';
import { createShareUrl } from '../utils/share';
import { exportToCSV, exportToPDF } from '../utils/export';

interface ShareExportProps {
  input: DealInput;
  project: DealOutputsProject;
  investor: DealOutputsInvestor;
}

export const ShareExport: React.FC<ShareExportProps> = ({ input, project, investor }) => {
  const [copied, setCopied] = useState(false);
  
  const handleShare = async () => {
    const url = createShareUrl(input);
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Не удалось скопировать ссылку. Попробуйте вручную: ' + url);
    }
  };
  
  const handleCSVExport = () => {
    exportToCSV(input, project, investor);
  };
  
  const handlePDFExport = () => {
    exportToPDF(input, project, investor);
  };
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">📤 Экспорт и шаринг</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          <Share2 size={20} />
          {copied ? 'Скопировано!' : 'Поделиться ссылкой'}
        </button>
        
        <button
          onClick={handlePDFExport}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
        >
          <FileText size={20} />
          Экспорт PDF
        </button>
        
        <button
          onClick={handleCSVExport}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
        >
          <Download size={20} />
          Экспорт CSV
        </button>
        
        <button
          disabled
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-300 text-gray-600 font-semibold rounded-lg cursor-not-allowed"
          title="Автосохранение активно"
        >
          <Save size={20} />
          Автосохранение ✓
        </button>
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Автосохранение:</strong> Ваши данные автоматически сохраняются в браузере при каждом изменении.
        </p>
      </div>
    </div>
  );
};
