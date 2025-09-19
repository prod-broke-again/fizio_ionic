# 📋 Инструкции по сборке и деплою Fizio App

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка окружения
```bash
# Скопируйте пример конфигурации
cp .env.example .env

# Отредактируйте .env файл с вашими настройками
# Особенно важно настроить SSH_PASSWORD для деплоя
```

### 3. Разработка
```bash
# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build

# Предварительный просмотр сборки
npm run preview
```

## 📱 Сборка для Android

### Предварительные требования
1. **Android Studio** установлен и настроен
2. **Java Development Kit (JDK) 17+**
3. **Android SDK** с API Level 33+
4. **Capacitor CLI** (уже в зависимостях)

### Пошаговая инструкция

#### 1. Подготовка проекта
```bash
# Сборка веб-версии
npm run build

# Синхронизация с Android проектом
npx cap sync android
```

#### 2. Открытие в Android Studio
```bash
# Открыть Android проект в Android Studio
npx cap open android
```

#### 3. Настройка в Android Studio
1. **File → Sync Project with Gradle Files**
2. **Build → Clean Project**
3. **Build → Rebuild Project**

#### 4. Сборка APK
```bash
# Debug версия
npx cap run android

# Или через Android Studio:
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

#### 5. Сборка AAB (для Google Play)
```bash
# В Android Studio:
# Build → Generate Signed Bundle / APK
# Выберите Android App Bundle
# Создайте или выберите keystore
# Соберите release версию
```

### Конфигурация Android

#### capacitor.config.ts
```typescript
const config: CapacitorConfig = {
  appId: 'com.fizio.app',
  appName: 'Fizio',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};
```

#### android/app/build.gradle
```gradle
android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.fizio.app"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

## 🍎 Сборка для iOS

### Предварительные требования
1. **macOS** (обязательно)
2. **Xcode 14+**
3. **iOS Simulator** или физическое устройство
4. **CocoaPods** установлен

### Пошаговая инструкция

#### 1. Подготовка проекта
```bash
# Сборка веб-версии
npm run build

# Синхронизация с iOS проектом
npx cap sync ios
```

#### 2. Открытие в Xcode
```bash
npx cap open ios
```

#### 3. Настройка в Xcode
1. **Product → Clean Build Folder**
2. **Product → Build**
3. Настройте **Signing & Capabilities**

#### 4. Сборка и запуск
```bash
# Запуск в симуляторе
npx cap run ios

# Или через Xcode:
# Product → Run (⌘+R)
```

## 🌐 Деплой на сервер

### Автоматический деплой
```bash
# Полный деплой (сборка + загрузка)
npm run deploy:prod

# Автоматический деплой с паролем
npm run deploy:auto
```

### Ручной деплой
```bash
# 1. Сборка
npm run build

# 2. Архивирование
tar -czf dist.tar.gz dist

# 3. Загрузка на сервер
scp dist.tar.gz user@server:/tmp/

# 4. Распаковка на сервере
ssh user@server "cd /var/www/fizio && tar -xzf /tmp/dist.tar.gz -C public --strip-components=1"
```

### Конфигурация деплоя

#### .env файл
```env
# Доступ к серверу
SSH_HOST=your_server_ip
SSH_USER=root
SSH_PORT=22

# Аутентификация (выберите один способ)
SSH_PASSWORD=your_strong_password
# ИЛИ
SSH_KEY=/path/to/private/key

# Пути на сервере
REMOTE_PATH=/var/www/fizio
PUBLIC_PATH=/var/www/fizio/public

# Отладка
DEPLOY_DEBUG=1
```

## 🛠️ Полезные скрипты

### Оптимизация изображений
```bash
# Оптимизация изображений для сетки
node scripts/optimize-images.js

# Или CommonJS версия
node scripts/optimize-images.cjs
```

### Тестирование
```bash
# Unit тесты
npm run test:unit

# E2E тесты
npm run test:e2e

# Линтинг
npm run lint
```

### Отладка
```bash
# Запуск с отладкой
DEBUG=1 npm run dev

# Проверка конфигурации
node -e "console.log(require('./capacitor.config.ts'))"
```

## 🔧 Устранение проблем

### Android
```bash
# Очистка кеша
npx cap clean android
rm -rf android/app/build
npx cap sync android

# Проверка Java версии
java -version

# Проверка Android SDK
echo $ANDROID_HOME
```

### iOS
```bash
# Очистка кеша
npx cap clean ios
cd ios && pod install && cd ..
npx cap sync ios

# Проверка Xcode
xcode-select --print-path
```

### Общие проблемы
```bash
# Очистка node_modules
rm -rf node_modules package-lock.json
npm install

# Очистка dist
rm -rf dist
npm run build

# Проверка версий
node --version
npm --version
npx cap --version
```

## 📦 Структура проекта

```
fizio_app/
├── src/                    # Исходный код
│   ├── components/         # Vue компоненты
│   ├── views/             # Страницы приложения
│   ├── services/          # API сервисы
│   ├── stores/            # Pinia stores
│   └── assets/            # Статические ресурсы
├── android/               # Android проект
├── ios/                   # iOS проект
├── dist/                  # Собранная веб-версия
├── scripts/               # Скрипты сборки и деплоя
│   ├── deploy.js          # Основной деплой скрипт
│   ├── deploy.cjs         # CommonJS версия
│   ├── deploy-auto.cjs    # Автоматический деплой
│   └── optimize-images.js # Оптимизация изображений
└── .env.example           # Пример конфигурации
```

## 🚨 Важные замечания

1. **Безопасность**: Никогда не коммитьте `.env` файлы с паролями
2. **Версии**: Используйте Node.js 18+ и npm 9+
3. **Память**: Для Android сборки требуется минимум 4GB RAM
4. **Сеть**: Для деплоя нужен стабильный интернет
5. **Права**: Убедитесь в правильных правах доступа к файлам

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сборки
2. Убедитесь в правильности конфигурации
3. Очистите кеш и пересоберите проект
4. Проверьте версии зависимостей

---

**Удачной сборки! 🚀**
