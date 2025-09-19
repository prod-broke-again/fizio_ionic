<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Потребление воды</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="water-container">
        <div class="total-water-display">
          <div class="total-value">{{ totalWater.toFixed(2) }}</div>
          <div class="total-label">литров</div>
        </div>

        <p class="info-text">
          Каждый стакан добавляет 0.25 л к вашему дневному потреблению.
        </p>

        <div class="glasses-grid">
          <div 
            v-for="i in maxGlasses" 
            :key="i" 
            class="glass-wrapper"
            :class="{ 'filled': i <= glassesDrunk }"
            @click="toggleGlass(i)"
          >
            <ion-icon :icon="waterOutline" class="glass-icon"></ion-icon>
          </div>
        </div>
        
        <ion-button expand="block" @click="openModal" class="add-button">
          <ion-icon slot="start" :icon="addOutline"></ion-icon>
          Добавить воду
        </ion-button>
        
        <ion-button expand="block" fill="outline" @click="resetWater" class="reset-button">
          <ion-icon slot="start" :icon="refreshOutline"></ion-icon>
          Сбросить
        </ion-button>
      </div>
      <WaterAddModal v-model="modalOpen" @updated="onUpdated" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonBackButton,
  IonIcon,
  IonButton
} from '@ionic/vue';
import { waterOutline, addOutline, refreshOutline } from 'ionicons/icons';
import WaterAddModal from '@/components/WaterAddModal.vue';
import { format } from 'date-fns';

const glassesDrunk = ref(0);
const glassVolume = 0.25; // 250ml
const maxGlasses = ref(16); // 4 литра

const totalWater = computed(() => glassesDrunk.value * glassVolume);

const getStorageKey = () => {
  const today = new Date();
  return `water_intake_${format(today, 'yyyy-MM-dd')}`;
};

const loadWaterIntake = () => {
  const storedValue = localStorage.getItem(getStorageKey());
  if (storedValue) {
    glassesDrunk.value = parseInt(storedValue, 10);
  }
};

const saveWaterIntake = () => {
  localStorage.setItem(getStorageKey(), glassesDrunk.value.toString());
};

onMounted(() => {
  loadWaterIntake();
});

const modalOpen = ref(false);
const openModal = () => { modalOpen.value = true; };
const onUpdated = (liters:number)=>{
  // синхронизируем из модалки в отображение
  const glasses = Math.round(liters/0.25);
  glassesDrunk.value = Math.min(glasses, maxGlasses.value);
  saveWaterIntake();
};

const toggleGlass = (glassNumber: number) => {
    if (glassNumber === glassesDrunk.value) {
        // Если кликнули по последнему заполненному стакану - убираем его
        glassesDrunk.value--;
    } else {
        // Иначе устанавливаем количество равное номеру стакана
        glassesDrunk.value = glassNumber;
    }
    saveWaterIntake();
};

const resetWater = () => {
  glassesDrunk.value = 0;
  saveWaterIntake();
};
</script>

<style scoped>
.water-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
}

.total-water-display {
  text-align: center;
  margin-bottom: 24px;
}

.total-value {
  font-size: 72px;
  font-weight: 700;
  color: var(--ion-color-primary);
  line-height: 1;
}

.total-label {
  font-size: 20px;
  color: var(--ion-color-medium-shade);
  margin-top: 8px;
}

.info-text {
  text-align: center;
  color: var(--ion-color-medium);
  margin-bottom: 32px;
}

.glasses-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 300px;
  margin-bottom: 32px;
}

.glass-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.glass-wrapper:active {
    transform: scale(0.9);
}

.glass-icon {
  font-size: 48px;
  color: var(--ion-color-medium);
  transition: color 0.3s ease;
}

.glass-wrapper.filled .glass-icon {
  color: var(--ion-color-primary);
}

.add-button {
  margin-bottom: 12px;
}
</style> 