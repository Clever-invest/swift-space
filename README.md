# Flip Calculator

Интерактивное приложение для расчёта метрик инвестиционной сделки по флиппингу недвижимости в Дубае. Проект собран на React + Vite с визуализациями на основе [Recharts](https://recharts.org/) и иконками [lucide-react](https://github.com/lucide-icons/lucide#react).

## Скрипты

- `npm install` — установка зависимостей
- `npm run dev` — запуск dev-сервера Vite
- `npm run build` — сборка production-версии в каталог `dist`
- `npm run preview` — предпросмотр production-сборки

## Tailwind CSS

Tailwind подключён через [Play CDN](https://tailwindcss.com/docs/installation/play-cdn) и загружается в `index.html`, поэтому дополнительная конфигурация не требуется.

## GitHub Pages

Проект предназначен для публикации на GitHub Pages с базовым путём `/flip-calculator/`. Workflow GitHub Actions (`.github/workflows/deploy.yml`) автоматически собирает приложение и разворачивает его в Pages при пуше в ветку `main`.
