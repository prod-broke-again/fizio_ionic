<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="tab1" href="/tabs/tab1">
          <ion-icon aria-hidden="true" :icon="fitness" />
          <ion-label>Тренировки</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2">
          <ion-icon aria-hidden="true" :icon="analytics" />
          <ion-label>Статистика</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/tab3">
          <ion-icon aria-hidden="true" :icon="nutrition" />
          <ion-label>Питание</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="settings" href="/tabs/settings">
          <ion-icon aria-hidden="true" :icon="settings" />
          <ion-label>Настройки</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { settings, fitness, analytics, nutrition } from 'ionicons/icons';

// При загрузке приложения проверяем сохраненный режим темы
const checkSavedTheme = () => {
  const savedDarkMode = localStorage.getItem('darkMode');
  
  if (savedDarkMode === 'true') {
    document.documentElement.classList.add('ion-palette-dark');
  } else if (savedDarkMode === 'false') {
    document.documentElement.classList.remove('ion-palette-dark');
  } else {
    // Если настройка не сохранена, используем системные предпочтения
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('ion-palette-dark', prefersDark);
    localStorage.setItem('darkMode', prefersDark ? 'true' : 'false');
  }
};

// Вызываем функцию проверки темы сразу
checkSavedTheme();
</script>
