# 🚀 Быстрый старт версии 2

## ✅ Все установлено и готово!

Все зависимости успешно установлены. Версия 2 готова к запуску!

---

## 🎯 Запуск приложения

### 1. Активируйте Node.js (если нужно)

```bash
source ~/.nvm/nvm.sh
nvm use
```

### 2. Запустите dev-сервер

```bash
npm run dev
```

Откройте http://localhost:5173 в браузере

### 3. Или запустите тесты

```bash
npm test           # Все тесты
npm run test:ui    # UI для тестов
```

---

## 📊 Статус установки

✅ **Node.js**: v24.11.0  
✅ **npm**: v11.6.1  
✅ **TypeScript**: v5.9.3  
✅ **Vitest**: v4.0.5  
✅ **React**: v18.3.1  
✅ **Все типы установлены**  
✅ **Тесты пройдены**: 33/33  

---

## 🔧 Установленные пакеты

### Production
- react 18.3.1
- react-dom 18.3.1
- lucide-react 0.344.0
- recharts 2.15.4

### Development
- typescript 5.9.3
- @types/react 19.2.2
- @types/react-dom 19.2.2
- vitest 4.0.5
- @vitest/ui 4.0.5
- jsdom 27.0.1
- @testing-library/react 16.3.0
- @testing-library/jest-dom 6.9.1
- vite 5.4.21
- tailwindcss 3.4.18

---

## 📝 Перед первым запуском

### Измените src/main.jsx

Откройте `src/main.jsx` и измените импорт:

```jsx
// Было:
import App from './App'

// Стало:
import App from './App_v2'
```

Сохраните файл.

---

## 🎮 Команды

```bash
# Разработка
npm run dev              # Запуск dev-сервера
npm run build            # Сборка для production
npm run preview          # Предпросмотр сборки

# Тестирование
npm test                 # Запуск тестов
npm run test:ui          # UI для тестов
npm run test:coverage    # Покрытие кода
```

---

## 🐛 Если что-то не работает

### Проблема: "command not found: npm"

**Решение:**
```bash
source ~/.nvm/nvm.sh
nvm use
```

### Проблема: Порт 5173 занят

**Решение:**
```bash
npm run dev -- --port 3000
```

### Проблема: Ошибки TypeScript в IDE

**Решение:** Перезапустите IDE или TypeScript сервер:
- VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"
- WebStorm: File → Invalidate Caches / Restart

---

## 📚 Документация

- **README_V2.md** - полное описание
- **SETUP_V2.md** - детальная установка
- **CHANGELOG_V2.md** - список изменений
- **VERSION_2_SUMMARY.md** - итоговое резюме

---

## ✨ Готово!

Все зависимости установлены, тесты пройдены, проект готов к работе!

```bash
npm run dev
```

**Наслаждайтесь! 🎉**
