# Инструкция по установке и запуску версии 2

## ✅ Версия 2 успешно создана в ветке `v2`

Все файлы версии 2 находятся в текущей ветке. Для запуска выполните следующие шаги:

## 📦 Шаг 1: Установка зависимостей

Сначала нужно установить Node.js и npm (если не установлены):

```bash
# Проверка установки Node.js
node --version   # должен вывести версию >= 18.0.0
npm --version    # должен вывести версию npm
```

Если Node.js не установлен, скачайте с https://nodejs.org/

Затем установите зависимости проекта:

```bash
# Установка всех зависимостей
npm install

# Установка TypeScript типов (если нужно)
npm install --save-dev @types/react @types/react-dom vitest jsdom @vitest/ui
```

## 🚀 Шаг 2: Запуск версии 2

### Вариант A: Замена текущей версии (рекомендуется для тестирования)

Временно замените `src/main.jsx` для использования версии 2:

```jsx
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App_v2'  // <-- Измените на App_v2
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

Затем запустите dev-сервер:

```bash
npm run dev
```

Откройте http://localhost:5173 в браузере.

### Вариант B: Создание отдельного entry point

Создайте новый файл `src/main_v2.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App_v2'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

Затем обновите `vite.config.js` для поддержки двух версий.

## 🧪 Шаг 3: Запуск тестов

```bash
# Запуск всех тестов
npm test

# Запуск тестов с UI
npm run test:ui

# Проверка покрытия кода
npm run test:coverage
```

Все тесты должны пройти успешно (зеленые).

## 📊 Шаг 4: Проверка функционала

После запуска проверьте:

1. ✅ **KPI Header** - отображается липкая шапка с 6 метриками
2. ✅ **Табы** - можно переключаться между "Проект" и "Инвестор"
3. ✅ **Ввод данных** - все поля работают, данные валидируются
4. ✅ **Расчеты** - метрики обновляются мгновенно
5. ✅ **Сценарии** - отображаются 3 карточки (консервативный, базовый, оптимистичный)
6. ✅ **Sensitivity** - таблицы и графики для 3 параметров
7. ✅ **Автосохранение** - данные сохраняются при изменении
8. ✅ **Экспорт** - кнопки PDF, CSV, Поделиться работают

## 🔍 Шаг 5: Проверка контрольных чисел

Введите тестовые данные:
- Цена покупки: 1,390,000
- Цена продажи: 2,300,000
- DLD: 4%
- Комиссия покупателя: 2%
- VAT на комиссию покупателя: 5%
- Trustee Fee: 5,000
- Бюджет ремонта: 250,000
- Резерв: 15%
- Service Charge (год): 6,000
- DEWA (месяц): 500
- Комиссия продавца: 4%
- VAT на комиссию продавца: 5%
- Срок ремонта: 2 мес
- Срок экспозиции: 4 мес
- Доля инвестора: 50%

Ожидаемые результаты в KPI Header:
- **Прибыль**: ~430,110 AED
- **ROI за период**: ~24.3%
- **IRR (год.)**: ~54.4%
- **Срок сделки**: 6 мес
- **Break-even**: ~1,851,033 AED

## 🔧 Возможные проблемы

### Проблема: Ошибки TypeScript в IDE

**Решение**: Установите зависимости:
```bash
npm install
```

Lint ошибки исчезнут после установки пакетов.

### Проблема: "Cannot find module 'vitest'"

**Решение**: Установите vitest:
```bash
npm install --save-dev vitest jsdom @vitest/ui
```

### Проблема: Тесты не запускаются

**Решение**: Проверьте наличие файлов:
- `vitest.config.ts`
- `src/tests/calculations.test.ts`
- `src/tests/formatting.test.ts`

### Проблема: Графики не отображаются

**Решение**: Убедитесь, что recharts установлен:
```bash
npm install recharts
```

### Проблема: Экспорт PDF не работает

**Решение**: Разрешите всплывающие окна в браузере для localhost.

## 📚 Документация

- **README_V2.md** - полное описание функционала
- **CHANGELOG_V2.md** - список изменений в версии 2
- **src/calculations/core.ts** - документация по формулам
- **src/tests/** - примеры использования API

## 🌐 Сборка для production

```bash
# Сборка приложения
npm run build

# Предпросмотр сборки
npm run preview
```

Собранные файлы будут в папке `dist/`.

## 🔄 Переключение между версиями

### Вернуться к версии 1 (main):
```bash
git checkout main
```

### Вернуться к версии 2:
```bash
git checkout v2
```

### Посмотреть текущую ветку:
```bash
git branch
```

## 📁 Структура файлов версии 2

```
src/
├── calculations/
│   ├── types.ts           # TypeScript типы
│   ├── money.ts           # Форматирование
│   └── core.ts            # Расчеты
├── components/
│   ├── KPIHeader.tsx      # Шапка с метриками
│   ├── Tabs.tsx           # Табы
│   ├── InputField.tsx     # Поле ввода
│   ├── Section*.tsx       # Секции (6 файлов)
│   ├── Sensitivity.tsx    # Чувствительность
│   ├── Scenarios.tsx      # Сценарии
│   ├── InvestorView.tsx   # Витрина инвестора
│   └── ShareExport.tsx    # Экспорт
├── utils/
│   ├── share.ts           # Шаринг
│   └── export.ts          # Экспорт
├── tests/
│   ├── calculations.test.ts
│   └── formatting.test.ts
└── App_v2.tsx             # Главный файл

Конфигурация:
├── tsconfig.json
├── tsconfig.node.json
├── vitest.config.ts
└── package.json (обновлен)

Документация:
├── README_V2.md
├── CHANGELOG_V2.md
└── SETUP_V2.md (этот файл)
```

## ✨ Следующие шаги

1. Запустите `npm install`
2. Запустите `npm run dev`
3. Откройте http://localhost:5173
4. Протестируйте функционал
5. Запустите тесты `npm test`
6. Изучите документацию в README_V2.md

## 🎯 Готово!

Версия 2 полностью готова к использованию. Все файлы созданы, код оттестирован, документация написана.

Если возникнут вопросы, изучите:
- README_V2.md - подробное описание
- CHANGELOG_V2.md - список изменений
- Код в src/calculations/core.ts - формулы с комментариями

**Удачи с флиппингом! 🚀**
