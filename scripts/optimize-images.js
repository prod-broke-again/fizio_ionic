/**
 * Скрипт для создания оптимизированных изображений
 * Запуск: node scripts/optimize-images.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'images', 'bg');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'images', 'optimized');
const TARGET_WIDTH = 150;
const TARGET_HEIGHT = 300;
const MAX_SIZE_KB = 100;

// Создаем папку для оптимизированных изображений
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function optimizeImage(inputPath, outputName) {
  try {
    console.log(`Обрабатываем ${inputPath}...`);
    
    // Создаем WebP версию
    const webpPath = path.join(OUTPUT_DIR, `${outputName}_150x300.webp`);
    await sharp(inputPath)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ 
        quality: 85,
        effort: 6
      })
      .toFile(webpPath);
    
    // Создаем JPEG версию
    const jpegPath = path.join(OUTPUT_DIR, `${outputName}_150x300.jpg`);
    await sharp(inputPath)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 80,
        progressive: true
      })
      .toFile(jpegPath);
    
    // Проверяем размеры файлов
    const webpStats = fs.statSync(webpPath);
    const jpegStats = fs.statSync(jpegPath);
    
    const webpSizeKB = Math.round(webpStats.size / 1024);
    const jpegSizeKB = Math.round(jpegStats.size / 1024);
    
    console.log(`✅ ${outputName}:`);
    console.log(`   WebP: ${webpSizeKB}KB`);
    console.log(`   JPEG: ${jpegSizeKB}KB`);
    
    if (webpSizeKB > MAX_SIZE_KB || jpegSizeKB > MAX_SIZE_KB) {
      console.warn(`⚠️  ${outputName} превышает лимит ${MAX_SIZE_KB}KB`);
    }
    
    return {
      webp: webpSizeKB,
      jpeg: jpegSizeKB
    };
    
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${inputPath}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Начинаем оптимизацию изображений...');
  console.log(`📐 Целевой размер: ${TARGET_WIDTH}x${TARGET_HEIGHT}px`);
  console.log(`📦 Максимальный размер: ${MAX_SIZE_KB}KB`);
  console.log('');
  
  const files = fs.readdirSync(INPUT_DIR);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png)$/i.test(file)
  );
  
  if (imageFiles.length === 0) {
    console.error('❌ Не найдено изображений в папке', INPUT_DIR);
    return;
  }
  
  let totalWebpSize = 0;
  let totalJpegSize = 0;
  let processedCount = 0;

  // Определяем следующий доступный номер для bg_(N)
  const existingFiles = fs.readdirSync(OUTPUT_DIR).filter(file =>
    file.match(/bg_\s*\(\d+\)_150x300\.(webp|jpg)$/)
  );

  let nextBgNumber = 1;
  existingFiles.forEach(file => {
    const match = file.match(/bg_\s*\((\d+)\)_150x300\./);
    if (match) {
      const num = parseInt(match[1]);
      if (num >= nextBgNumber) {
        nextBgNumber = num + 1;
      }
    }
  });

  console.log(`📝 Следующий доступный номер: bg_(${nextBgNumber})`);
  console.log('');

  for (const file of imageFiles) {
    const inputPath = path.join(INPUT_DIR, file);
    const fileName = path.parse(file).name;

    // Проверяем, является ли файл уже оптимизированным (bg_(N))
    let outputName;
    if (fileName.match(/bg_\s*\(\d+\)$/)) {
      // Файл уже имеет правильное имя
      outputName = fileName;
    } else {
      // Новый файл - присваиваем следующий номер
      outputName = `bg_ (${nextBgNumber})`;
      nextBgNumber++;
    }

    const result = await optimizeImage(inputPath, outputName);
    
    if (result) {
      totalWebpSize += result.webp;
      totalJpegSize += result.jpeg;
      processedCount++;
    }
  }
  
  console.log('');
  console.log('📊 Итоговая статистика:');
  console.log(`   Обработано файлов: ${processedCount}`);
  console.log(`   Общий размер WebP: ${totalWebpSize}KB`);
  console.log(`   Общий размер JPEG: ${totalJpegSize}KB`);
  console.log(`   Средний размер WebP: ${Math.round(totalWebpSize / processedCount)}KB`);
  console.log(`   Средний размер JPEG: ${Math.round(totalJpegSize / processedCount)}KB`);
  console.log('');
  console.log('✅ Оптимизация завершена!');
}

// Проверяем наличие sharp
try {
  // В ES модулях sharp уже импортирован в начале файла
  if (sharp) {
    main().catch(console.error);
  }
} catch (error) {
  console.error('❌ Sharp не установлен. Установите его командой:');
  console.error('npm install sharp');
  console.error('');
  console.error('Или используйте альтернативный метод оптимизации.');
}
