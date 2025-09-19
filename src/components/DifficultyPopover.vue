<template>
  <ion-list>
    <ion-item button @click="selectDifficulty('')">
      <ion-label>Все уровни</ion-label>
    </ion-item>
    <ion-item button @click="selectDifficulty('beginner')">
      <ion-label>Новичок</ion-label>
    </ion-item>
    <ion-item button @click="selectDifficulty('intermediate')">
      <ion-label>Средний</ion-label>
    </ion-item>
    <ion-item button @click="selectDifficulty('advanced')">
      <ion-label>Продвинутый</ion-label>
    </ion-item>
  </ion-list>
</template>

<script setup lang="ts">
import { IonList, IonItem, IonLabel } from '@ionic/vue';
import { popoverController } from '@ionic/vue';

interface Props {
  currentDifficulty: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [difficulty: string];
}>();

const selectDifficulty = async (difficulty: string) => {
  await popoverController.dismiss(difficulty, 'select');
};
</script>

<style scoped>
ion-list {
  --background: transparent;
  margin: 0;
}

ion-item {
  --background: transparent;
  --background-hover: rgba(var(--ion-color-primary-rgb), 0.1);
  --color: var(--ion-text-color);
  --border-radius: 8px;
  margin: 4px 8px;
}

ion-label {
  font-size: 16px;
  font-weight: 500;
}
</style>
