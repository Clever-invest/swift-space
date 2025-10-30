#!/bin/bash

# ==================================================
# БЫСТРЫЙ ЗАПУСК FLIP CALCULATOR
# ==================================================

echo "🚀 Запуск Flip Calculator..."
echo ""

# Инициализация NVM и Node.js
echo "📦 Инициализация Node.js через NVM..."
source ~/.nvm/nvm.sh
nvm use 20

echo ""
echo "✅ Node.js $(node -v) активирован"
echo "✅ npm $(npm -v) готов к работе"
echo ""

# Проверка установки зависимостей
if [ ! -d "node_modules" ]; then
    echo "📥 Установка зависимостей..."
    npm install
    echo ""
fi

# Запуск dev сервера
echo "🌐 Запуск dev сервера..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Flip Calculator готов!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  📍 Маршруты:"
echo "     • /           - Выбор версии"
echo "     • /v1         - Версия 1 (классическая)"
echo "     • /v2         - Версия 2 (модульная)"
echo ""
echo "  🔧 Команды:"
echo "     • Ctrl+C      - Остановить сервер"
echo "     • npm run dev - Перезапустить"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev
