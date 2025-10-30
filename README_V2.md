# Калькулятор флиппинга недвижимости v2

Модульный SPA-калькулятор для расчета доходности флиппинга недвижимости с двухпоточной моделью (без XIRR).

## 🎯 Особенности версии 2

- ✅ **Двухпоточная модель**: все затраты в t0, один приток на продаже
- ✅ **Без XIRR**: IRR рассчитывается по формуле MOIC^(12/месяцы) − 1
- ✅ **Модульная архитектура**: TypeScript, чистые функции, юнит-тесты
- ✅ **Sticky KPI-шапка**: ключевые метрики всегда на виду
- ✅ **Две витрины**: Проект и Инвестор
- ✅ **Анализ чувствительности**: по цене, срокам, бюджету ремонта
- ✅ **Сценарии A/B/C**: консервативный, базовый, оптимистичный
- ✅ **Шаринг и экспорт**: URL, PDF, CSV
- ✅ **Автосохранение**: данные сохраняются в localStorage
- ✅ **Доступность**: ARIA-атрибуты, контрастность WCAG AA
- ✅ **Темная тема**: поддержка prefers-color-scheme

## 🚀 Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Запуск dev-сервера

```bash
npm run dev
```

### Запуск тестов

```bash
npm test                  # запуск всех тестов
npm run test:ui           # UI для тестов
npm run test:coverage     # покрытие кода
```

### Сборка для production

```bash
npm run build
npm run preview           # предпросмотр сборки
```

## 📊 Формулы расчета

### Основные метрики

```typescript
totalCosts = purchasePrice + dld + buyerFee + buyerFeeVAT + 
             renovationTotal + carryingTotal + trusteeFee

netProceeds = salePrice - sellerFee - sellerFeeVAT

profit = netProceeds - totalCosts
moic = netProceeds / totalCosts
roiPeriod = profit / totalCosts
irrAnnual = moic^(12/monthsTotal) - 1
```

### Точка безубыточности

```typescript
breakEvenSalePrice = totalCosts / (1 - sellerFeePct * (1 + sellerFeeVatPct))
```

### Метрики инвестора

```typescript
investorCapital = totalCosts
investorProfitShare = profit * investorProfitSharePct
investorCashBack = investorCapital + investorProfitShare
investorMOIC = investorCashBack / investorCapital
investorIRR = investorMOIC^(12/monthsTotal) - 1
```

## 📁 Структура проекта

```
src/
├── calculations/          # Модули расчетов
│   ├── types.ts          # TypeScript типы
│   ├── money.ts          # Форматирование денег
│   └── core.ts           # Основные расчеты
├── components/           # React компоненты
│   ├── KPIHeader.tsx     # Sticky шапка с KPI
│   ├── Tabs.tsx          # Табы Проект/Инвестор
│   ├── InputField.tsx    # Поле ввода с маской
│   ├── Section*.tsx      # Секции ввода данных
│   ├── Sensitivity.tsx   # Анализ чувствительности
│   ├── Scenarios.tsx     # Сценарии A/B/C
│   ├── InvestorView.tsx  # Витрина инвестора
│   └── ShareExport.tsx   # Шаринг и экспорт
├── utils/                # Утилиты
│   ├── share.ts          # Шаринг и сохранение
│   └── export.ts         # Экспорт PDF/CSV
├── tests/                # Юнит-тесты
│   ├── calculations.test.ts
│   └── formatting.test.ts
└── App_v2.tsx            # Главный компонент
```

## 🧪 Тестирование

Проект включает полный набор юнит-тестов для проверки корректности расчетов:

### Контрольные числа

Для входных данных:
- Цена покупки: 1,390,000 AED
- Цена продажи: 2,300,000 AED
- Бюджет ремонта: 250,000 AED
- Срок: 6 месяцев

Ожидаемые результаты:
- **Total Costs**: 1,773,290 AED
- **NET Proceeds**: 2,203,400 AED
- **Profit**: 430,110 AED
- **ROI**: 24.3%
- **IRR**: 54.4%
- **Break-even**: 1,851,033 AED
- **Investor ROI**: 12.1%
- **Investor IRR**: 25.7%

## 📤 Экспорт и шаринг

### Создание shareable URL

Калькулятор автоматически кодирует данные в URL:
```
https://yoursite.com/?deal=eyJwcCI6MTM5MDAwMCwic3AiOjIzMDAwMDB9...
```

### Экспорт PDF

Генерирует полный отчет с:
- Входными параметрами
- Метриками проекта
- Распределением прибыли
- Методикой расчета

### Экспорт CSV

Экспортирует все данные в формате CSV для анализа в Excel/Google Sheets.

## 🎨 Кастомизация

### Изменение значений по умолчанию

Отредактируйте `defaultInput` в `/src/App_v2.tsx`:

```typescript
const defaultInput: DealInput = {
  purchasePrice: 1390000,
  salePrice: 2300000,
  // ... другие параметры
};
```

### Настройка стилей

Проект использует Tailwind CSS. Конфигурация в `tailwind.config.js`.

## 🔧 Технологии

- **React 18** - UI фреймворк
- **TypeScript** - типизация
- **Vite** - сборщик
- **Tailwind CSS** - стилизация
- **Recharts** - графики
- **Vitest** - тестирование
- **Lucide React** - иконки

## 📝 Методика

### Двухпоточная модель

Калькулятор использует упрощенную модель:
1. **t0 (старт)**: все затраты (покупка, комиссии, ремонт, носимые расходы)
2. **t=N (продажа)**: один приток (NET-выручка)

### Расчет IRR

IRR рассчитывается аналитически без итераций:
```
IRR = MOIC^(12/months) - 1
```

Где MOIC = NET-выручка / Общие затраты

### NET-выручка

Чистая выручка учитывает комиссию продавца и VAT:
```
NET = SalePrice - SellerFee - SellerFeeVAT
```

## 🐛 Известные ограничения

1. Не поддерживает промежуточные денежные потоки
2. Не учитывает аренду во время владения
3. Фиксированный сплит прибыли (без waterfall)
4. Не учитывает налоги (кроме VAT на комиссии)

## 📄 Лицензия

MIT License - используйте свободно для коммерческих и некоммерческих проектов.

## 🤝 Вклад

Для вопросов и предложений создавайте issues в репозитории проекта.

## 📞 Поддержка

Если у вас возникли вопросы по использованию калькулятора, обратитесь к этому README или изучите код в директории `/src`.
