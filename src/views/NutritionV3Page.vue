<template>
  <ion-page>
    <ion-content :fullscreen="true" class="nutrition-v3-content">
      <!-- Баннер сверху -->
      <div class="banner">
        <div class="banner-text">Составляйте меню сами!</div>
      </div>

      <!-- Основной контент -->
      <div class="main-content">
        <!-- Пустая тарелка -->
        <div v-if="currentState === 'empty'" class="plate-container">
          <div class="plate" :class="{ 'swipe-left': swipeDirection === 'left', 'swipe-right': swipeDirection === 'right' }">
            <!-- Пустая тарелка, без содержимого -->
          </div>
          
          <!-- Индикатор свайпа под тарелкой -->
          <div class="swipe-indicator">
            <div class="swipe-button"></div>
          </div>
        </div>

        <!-- Выбор блюд -->
        <div v-else class="selection-container">
          <!-- Заголовок -->
          <div class="selection-header">
            <button class="back-btn" @click="goBack">
              <ion-icon :icon="chevronBackOutline"></ion-icon>
            </button>
            <span class="selection-title">
              {{ currentState === 'left-selection' ? 'Выберите первое блюдо' : 'Выберите второе блюдо' }}
            </span>
            <button class="confirm-btn" @click="goBack">
              <ion-icon :icon="checkmarkOutline"></ion-icon>
            </button>
          </div>

          <!-- Контент выбора -->
          <div class="selection-content">
            <!-- Список блюд слева -->
            <div class="dishes-list">
              <div 
                v-for="dish in availableDishes" 
                :key="dish.id"
                :class="['dish-item', { 
                  'locked': dish.locked,
                  'selected': isDishSelected(dish)
                }]"
                @click="selectDish(dish)"
              >
                <div class="dish-content">
                  <div class="dish-name">{{ dish.name }}</div>
                  <div v-if="dish.locked" class="lock-icon">
                    <ion-icon :icon="lockClosedOutline"></ion-icon>
                  </div>
                </div>
              </div>
            </div>

            <!-- Информация о выбранном блюде справа -->
            <div class="dish-info">
              <!-- Половина тарелки с блюдом -->
              <div class="half-plate" :class="{ 'left-half': currentState === 'left-selection', 'right-half': currentState === 'right-selection' }">
                <div class="plate-half">
                  <div class="food-arrangement">
                    <img :src="getCurrentDish().image" :alt="getCurrentDish().name" class="food-image" />
                  </div>
                </div>
              </div>
              
              <!-- Информация о питательности -->
              <div class="nutrition-info">
                <div class="nutrition-item">
                  <span class="label">Калорийность</span>
                  <span class="value">{{ getCurrentDish().calories }} Ккал</span>
                </div>
                <div class="nutrition-item">
                  <span class="label">Белки</span>
                  <span class="value">{{ getCurrentDish().proteins }} г</span>
                </div>
                <div class="nutrition-item">
                  <span class="label">Жиры</span>
                  <span class="value">{{ getCurrentDish().fats }} г</span>
                </div>
                <div class="nutrition-item">
                  <span class="label">Углеводы</span>
                  <span class="value">{{ getCurrentDish().carbs }} г</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки управления (только для пустой тарелки) -->
        <div v-if="currentState === 'empty'" class="control-buttons">
          <div class="control-item">
            <button class="control-icon-btn" @click="goToLeftSide">
              <ion-icon :icon="chevronBackOutline"></ion-icon>
            </button>
            <span class="control-text">Выберите первое блюдо</span>
            <button class="control-icon-btn" @click="goToLeftSide">
              <ion-icon :icon="chevronForwardOutline"></ion-icon>
            </button>
          </div>
          
          <div class="control-item">
            <button class="control-icon-btn" @click="goToRightSide">
              <ion-icon :icon="chevronBackOutline"></ion-icon>
            </button>
            <span class="control-text">Выберите второе блюдо</span>
            <button class="control-icon-btn" @click="goToRightSide">
              <ion-icon :icon="chevronForwardOutline"></ion-icon>
            </button>
          </div>
          
          <div class="control-item">
            <div class="control-spacer"></div>
            <span class="control-text">Добавить продукт</span>
            <button class="control-icon-btn qr-btn" @click="openQRScanner">
              <ion-icon :icon="qrCodeOutline"></ion-icon>
            </button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { 
  chevronBackOutline,
  chevronForwardOutline,
  qrCodeOutline,
  checkmarkOutline,
  lockClosedOutline
} from 'ionicons/icons';

// Состояние
const swipeDirection = ref<'left' | 'right' | null>(null);
const currentState = ref<'empty' | 'left-selection' | 'right-selection'>('empty');
const selectedLeftDish = ref<any>(null);
const selectedRightDish = ref<any>(null);

// Тестовые данные блюд
const availableDishes = ref([
  {
    id: 1,
    name: 'Помидоры с базиликом',
    image: '/src/assets/images/eda/pomid.png',
    calories: 102,
    proteins: 20,
    fats: 0.2,
    carbs: 0.2,
    locked: false
  },
  {
    id: 2,
    name: 'Котлеты из говядины',
    image: '/src/assets/images/eda/kotleti.png',
    calories: 250,
    proteins: 25,
    fats: 15,
    carbs: 5,
    locked: false
  },
  {
    id: 3,
    name: 'Помидоры с базиликом',
    image: '/src/assets/images/eda/pomid.png',
    calories: 102,
    proteins: 20,
    fats: 0.2,
    carbs: 0.2,
    locked: true
  },
  {
    id: 4,
    name: 'Помидоры с базиликом',
    image: '/src/assets/images/eda/pomid.png',
    calories: 102,
    proteins: 20,
    fats: 0.2,
    carbs: 0.2,
    locked: true
  },
  {
    id: 5,
    name: 'Помидоры с базиликом',
    image: '/src/assets/images/eda/pomid.png',
    calories: 102,
    proteins: 20,
    fats: 0.2,
    carbs: 0.2,
    locked: true
  }
]);

// Методы
const goToLeftSide = () => {
  currentState.value = 'left-selection';
  swipeDirection.value = 'right';
  setTimeout(() => {
    swipeDirection.value = null;
  }, 300);
};

const goToRightSide = () => {
  currentState.value = 'right-selection';
  swipeDirection.value = 'left';
  setTimeout(() => {
    swipeDirection.value = null;
  }, 300);
};

const selectDish = (dish: any) => {
  if (dish.locked) return;
  
  if (currentState.value === 'left-selection') {
    selectedLeftDish.value = dish;
  } else if (currentState.value === 'right-selection') {
    selectedRightDish.value = dish;
  }
};

const getCurrentDish = () => {
  if (currentState.value === 'left-selection' && selectedLeftDish.value) {
    return selectedLeftDish.value;
  } else if (currentState.value === 'right-selection' && selectedRightDish.value) {
    return selectedRightDish.value;
  }
  return availableDishes.value[0]; // По умолчанию первое блюдо
};

const isDishSelected = (dish: any) => {
  if (currentState.value === 'left-selection') {
    return selectedLeftDish.value && selectedLeftDish.value.id === dish.id;
  } else if (currentState.value === 'right-selection') {
    return selectedRightDish.value && selectedRightDish.value.id === dish.id;
  }
  return false;
};

const goBack = () => {
  currentState.value = 'empty';
};

const openQRScanner = () => {
  // Открытие QR-сканера
  console.log('Открытие QR-сканера');
};

// Удален неиспользуемый метод removeFromMenu

// Обработка свайпов
let startX = 0;
let startY = 0;

const handleTouchStart = (e: TouchEvent) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
};

const handleTouchEnd = (e: TouchEvent) => {
  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;
  const diffX = endX - startX;
  const diffY = endY - startY;
  
  // Проверяем, что это горизонтальный свайп
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
    if (currentState.value === 'empty') {
      if (diffX > 0) {
        // Свайп вправо - переход к левой части тарелки
        goToLeftSide();
      } else {
        // Свайп влево - переход к правой части тарелки
        goToRightSide();
      }
    } else {
      // Если в режиме выбора, свайп возвращает к пустой тарелке
      goBack();
    }
  }
};

onMounted(() => {
  // Добавляем обработчики свайпов
  const plate = document.querySelector('.plate');
  if (plate) {
    plate.addEventListener('touchstart', handleTouchStart);
    plate.addEventListener('touchend', handleTouchEnd);
  }
});
</script>

<style>
#background-content {
    background-repeat: no-repeat;
	background-size: cover;
	background-position: center;
}

.nutrition-v3-content {
  --background: url('/src/assets/images/eda/fon.png');
  min-height: 100vh;
}

.banner {
  background: rgba(51, 51, 51, 0.8);
  border-radius: 25px;
  margin: 16px;
  padding: 12px 20px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.banner-text {
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.main-content {
  padding: 0 16px 80px 16px;
}

.plate-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  justify-content: center;
  margin-bottom: 30px;
}

.plate {
  width: 420px;
  height: 420px;
  background-image: url('/src/assets/images/eda/tarel.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
  overflow: hidden;
}

.plate.swipe-left {
  transform: translateX(-20px) rotate(-5deg);
}

.plate.swipe-right {
  transform: translateX(20px) rotate(5deg);
}

.plate-content {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
}

.plate-left,
.plate-right {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.food-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.food-item {
  max-width: 60px;
  max-height: 60px;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.swipe-indicator {
  display: flex;
  justify-content: center;
  position: absolute;
  bottom: -10px;
}

.swipe-button {
  background-image: url('/src/assets/images/eda/swipe.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border: none;
  border-radius: 50%;
  width: 85px;
  height: 85px;
  cursor: pointer;
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 20px 0;
}

.control-item {
  background: rgba(51, 51, 51, 0.6);
  border-radius: 30px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(10px);
}

.control-text {
  flex: 1;
  color: white;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
}

.control-spacer {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
}

.control-icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.control-icon-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-icon-btn.qr-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.control-icon-btn.qr-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Состояние выбора блюд */
.selection-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.selection-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(51, 51, 51, 0.8);
  border-radius: 25px;
  margin: 16px;
  backdrop-filter: blur(10px);
}

.back-btn, .confirm-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.confirm-btn {
  background: rgba(52, 168, 83, 0.8);
}

.selection-title {
  color: white;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  flex: 1;
}

.selection-content {
  display: flex;
  flex: 1;
  gap: 16px;
  padding: 0 16px;
}

.dishes-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dish-item {
  background: rgba(51, 51, 51, 0.6);
  border-radius: 20px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.dish-item.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.dish-item.selected {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
}

.dish-item.selected .dish-name {
  color: #333;
  font-weight: 600;
}

.dish-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dish-name {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.lock-icon {
  color: #ffd700;
  font-size: 18px;
}

.dish-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.half-plate {
  width: 200px;
  height: 200px;
  position: relative;
  overflow: hidden;
}

.plate-half {
  width: 100%;
  height: 100%;
  background-image: url('/src/assets/images/eda/tarel.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.left-half .plate-half {
  clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
}

.right-half .plate-half {
  clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
}

.food-arrangement {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.food-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.nutrition-info {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 12px;
  color: white;
  min-width: 200px;
  backdrop-filter: blur(10px);
}

.nutrition-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.nutrition-item:last-child {
  margin-bottom: 0;
}

.nutrition-item .label {
  color: #ccc;
}

.nutrition-item .value {
  font-weight: 600;
  color: white;
}

/* Мобильное приложение - единые размеры */
.main-content {
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}
</style>
