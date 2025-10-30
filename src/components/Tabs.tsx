// =====================================
// ТАБЫ ДЛЯ ПЕРЕКЛЮЧЕНИЯ ПРОЕКТ/ИНВЕСТОР
// =====================================

import React from 'react';

interface TabsProps {
  activeTab: 'project' | 'investor';
  onTabChange: (tab: 'project' | 'investor') => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-2 border-b border-gray-200 mb-6">
      <button
        onClick={() => onTabChange('project')}
        className={`px-6 py-3 font-semibold transition-colors ${
          activeTab === 'project'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-gray-800'
        }`}
        aria-label="Вкладка Проект"
        aria-selected={activeTab === 'project'}
        role="tab"
      >
        Проект
      </button>
      <button
        onClick={() => onTabChange('investor')}
        className={`px-6 py-3 font-semibold transition-colors ${
          activeTab === 'investor'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-gray-800'
        }`}
        aria-label="Вкладка Инвестор"
        aria-selected={activeTab === 'investor'}
        role="tab"
      >
        Инвестор
      </button>
    </div>
  );
};
