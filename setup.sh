#!/bin/bash

echo "╔══════════════════════════════════════╗"
echo "║        AI HUB - SETUP SCRIPT         ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Cek Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js tidak ditemukan. Install dulu:"
  echo "   pkg install nodejs"
  exit 1
fi

# Cek npm
if ! command -v npm &> /dev/null; then
  echo "❌ npm tidak ditemukan."
  exit 1
fi

echo "✅ Node.js: $(node -v)"
echo "✅ npm: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "❌ npm install gagal"
  exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Compile TypeScript
echo "🔨 Compiling TypeScript handlers..."
npx tsc
if [ $? -ne 0 ]; then
  echo "⚠️  Ada error saat compile, tapi coba lanjut dulu..."
fi
echo "✅ Compile selesai"
echo ""

# Cek hasil compile
COMPILED=$(ls dist/handlers/*.js 2>/dev/null | wc -l)
echo "📁 Handler ter-compile: $COMPILED file"
echo ""

echo "╔══════════════════════════════════════╗"
echo "║             SETUP SELESAI!           ║"
echo "╠══════════════════════════════════════╣"
echo "║  Jalankan server:                    ║"
echo "║    node index.js                     ║"
echo "║                                      ║"
echo "║  Atau mode dev (auto-restart):       ║"
echo "║    node --watch index.js             ║"
echo "╚══════════════════════════════════════╝"
