<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Тест страниц питания</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <div class="test-container">
        <h2>Доступные страницы питания:</h2>
        
        <div class="button-group">
          <ion-button 
            expand="block" 
            @click="$router.push('/nutrition_old')"
            class="test-button"
          >
            Старая страница питания (NewNutritionPage)
          </ion-button>
          
          <ion-button 
            expand="block" 
            @click="$router.push('/nutrition')"
            class="test-button"
          >
            Страница питания V2 (NutritionV2Page)
          </ion-button>
          
          <ion-button 
            expand="block" 
            @click="$router.push('/nutrition-v3')"
            class="test-button primary"
          >
            Новая страница питания V3 (NutritionV3Page) ⭐
          </ion-button>
        </div>
        
        <div class="description">
          <h3>Описание новой страницы V3:</h3>
          <ul>
            <li>✅ Интерактивная тарелка с анимацией свайпа</li>
            <li>✅ Управление меню (добавить/удалить блюда)</li>
            <li>✅ Тестовые данные с помидорами и котлетами</li>
            <li>✅ Адаптивный дизайн для мобильных устройств</li>
            <li>✅ Темная тема с мраморным фоном</li>
            <li>✅ Блокировка премиум контента</li>
          </ul>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/vue';
</script>

<style scoped>
.test-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  color: var(--ion-color-primary);
  margin-bottom: 20px;
  text-align: center;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.test-button {
  --border-radius: 12px;
  height: 50px;
  font-weight: 500;
}

.test-button.primary {
  --background: var(--ion-color-primary);
  --color: white;
  font-weight: 600;
}

.description {
  background: var(--ion-color-light);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.description h3 {
  color: var(--ion-color-primary);
  margin-bottom: 15px;
}

.description ul {
  margin: 0;
  padding-left: 20px;
}

.description li {
  margin-bottom: 8px;
  color: var(--ion-color-dark);
  line-height: 1.4;
}
</style>
