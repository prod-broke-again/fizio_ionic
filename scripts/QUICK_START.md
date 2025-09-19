# ⚡ Быстрый старт - Fizio App

## 🚀 Основные команды

### Разработка
```bash
npm run dev          # Запуск dev сервера
npm run build        # Сборка для продакшена
npm run preview      # Предварительный просмотр
```

### Мобильные приложения
```bash
# Android
npm run build && npx cap sync android && npx cap open android

# iOS (macOS)
npm run build && npx cap sync ios && npx cap open ios
```

### Деплой
```bash
npm run deploy:prod  # Полный деплой
npm run deploy:auto  # Автоматический деплой с паролем
```

## 📱 Android сборка

### Требования
- Android Studio
- JDK 17+
- Android SDK API 33+

### Шаги
1. `npm run build`
2. `npx cap sync android`
3. `npx cap open android`
4. В Android Studio: Build → Build Bundle(s) / APK(s)

## 🍎 iOS сборка

### Требования
- macOS
- Xcode 14+
- iOS Simulator

### Шаги
1. `npm run build`
2. `npx cap sync ios`
3. `npx cap open ios`
4. В Xcode: Product → Run

## 🔧 Полезные команды

```bash
# Очистка кеша
npx cap clean android
npx cap clean ios

# Проверка конфигурации
npx cap doctor

# Оптимизация изображений
node scripts/optimize-images.js

# Тестирование
npm run test:unit
npm run test:e2e
```

## 🚨 Частые проблемы

### Android
- **Ошибка сборки**: Очистите `android/app/build`
- **SDK не найден**: Проверьте `ANDROID_HOME`
- **Java версия**: Используйте JDK 17+

### iOS
- **Pod install**: Выполните `cd ios && pod install`
- **Signing**: Настройте в Xcode
- **Simulator**: Убедитесь что запущен

### Общие
- **Node modules**: `rm -rf node_modules && npm install`
- **Dist папка**: `rm -rf dist && npm run build`
- **Capacitor**: `npx cap sync`

---

**Подробная документация**: [scripts/README.md](README.md)
