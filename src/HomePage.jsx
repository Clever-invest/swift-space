import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Sparkles, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Калькулятор флиппинга
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Выберите версию калькулятора для анализа сделки
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Основная версия */}
          <Link to="/v1" className="group">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">Версия 1</h2>
                  <Calculator className="w-8 h-8" />
                </div>
                <p className="text-blue-100">Классическая версия</p>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Особенности:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Полный контроль над всеми параметрами</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Пошаговый анализ каждого этапа сделки</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Сохранение и экспорт проектов</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Интеграция с картами локаций</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Визуализация waterfall-графиков</span>
                  </li>
                </ul>
                
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Рекомендуется для детального анализа</span>
                  <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Версия 2 */}
          <Link to="/v2" className="group">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 border-purple-200">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">Версия 2</h2>
                  <Calculator className="w-8 h-8" />
                </div>
                <p className="text-blue-100">Модульная архитектура</p>
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full">
                    НОВАЯ
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Особенности:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>TypeScript для надежности кода</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>Модульная структура расчетов</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>Упрощенная формула IRR без XIRR</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>Раздельные view для проекта и инвестора</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>Сценарный анализ и чувствительность</span>
                  </li>
                </ul>
                
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Современный подход к расчетам</span>
                  <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Совет</h3>
            <p className="text-blue-800 text-sm">
              Обе версии используют одинаковые принципы расчета, но отличаются архитектурой и возможностями. 
              Версия 1 подходит для подробного анализа с сохранением проектов, 
              Версия 2 — для быстрых расчетов с современным интерфейсом.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
