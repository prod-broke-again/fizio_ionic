<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Добавить продукт</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div class="search-container">
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Найти продукт"
          @ionInput="onSearchInput"
          :debounce="500"
          class="custom-searchbar"
        ></ion-searchbar>
      </div>
      
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Поиск продуктов...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
        <p>{{ error }}</p>
      </div>
      
      <ion-list v-else-if="searchResults.length > 0" class="results-list">
        <ion-item
          v-for="product in searchResults"
          :key="product.id"
          @click="selectProduct(product)"
          button
          class="product-item"
        >
          <ion-thumbnail slot="start" v-if="product.image">
            <img :src="product.image" :alt="product.name">
          </ion-thumbnail>
          <ion-label>
            <h2>{{ product.name }}</h2>
            <p v-if="product.brand" class="brand">{{ product.brand }}</p>
            <p class="nutrition-info">
              Ккал: {{ product.calories }}, Б: {{ product.protein }}г, Ж: {{ product.fat }}г, У: {{ product.carbs }}г
            </p>
            <p v-if="product.nutriscore && product.nutriscore !== 'UNKNOWN'" class="nutriscore">
              Nutri-Score: {{ product.nutriscore.toUpperCase() }}
            </p>
          </ion-label>
        </ion-item>
      </ion-list>
      
      <div v-else-if="searchQuery.length > 2" class="no-results">
        <ion-icon :icon="searchOutline" class="no-results-icon"></ion-icon>
        <p>Продукты не найдены</p>
      </div>
      
      <div v-else class="search-prompt">
        <ion-icon :icon="searchOutline" class="search-prompt-icon"></ion-icon>
        <p>Введите название продукта для поиска</p>
      </div>

      <div class="barcode-scan-container">
        <ion-button expand="block" fill="outline" @click="startBarcodeScan">
          <ion-icon slot="start" :icon="barcodeOutline"></ion-icon>
          Сканировать штрих-код
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
// @ts-nocheck
import { ref } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  modalController,
  toastController
} from '@ionic/vue';
import {
  closeOutline,
  barcodeOutline,
  searchOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { productService, type Product } from '@/services/api/productService';

const searchQuery = ref('');
const searchResults = ref<Product[]>([]);
const isLoading = ref(false);
const error = ref('');

const onSearchInput = async (event: CustomEvent) => {
  const query = event.detail.value;
  searchQuery.value = query;
  
  if (query.length > 2) {
    await searchProducts(query);
  } else {
    searchResults.value = [];
    error.value = '';
  }
};

const searchProducts = async (query: string) => {
  try {
    isLoading.value = true;
    error.value = '';
    const results = await productService.searchProducts(query);
    searchResults.value = results.products;
  } catch (err) {
    console.error('Error searching products:', err);
    error.value = 'Ошибка при поиске продуктов. Попробуйте позже.';
    searchResults.value = [];
  } finally {
    isLoading.value = false;
  }
};

const formatNutritionInfo = (serving: any) => {
  return `Калории: ${serving.calories} ккал, Б: ${serving.protein}г, Ж: ${serving.fat}г, У: ${serving.carbohydrate}г (${serving.serving_description})`;
};

const selectProduct = async (product: Product) => {
  try {
    isLoading.value = true;
    const details = await productService.getProductDetails(product.id, product.source);
    modalController.dismiss({ selectedProduct: details });
  } catch (err) {
    console.error('Error getting product details:', err);
    const toast = await toastController.create({
      message: 'Ошибка при получении информации о продукте',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};

const startBarcodeScan = async () => {
  try {
    // TODO: Реализовать сканирование штрих-кода
    const barcode = '123456789'; // Временный пример
    const product = await productService.searchByBarcode(barcode);
    if (product) {
      modalController.dismiss({ selectedProduct: product });
    } else {
      const toast = await toastController.create({
        message: 'Продукт не найден',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
    }
  } catch (err) {
    console.error('Error scanning barcode:', err);
    const toast = await toastController.create({
      message: 'Ошибка при сканировании штрих-кода',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
};

const closeModal = () => {
  modalController.dismiss();
};
</script>

<style scoped>
.search-container {
  margin-bottom: 16px;
}

.custom-searchbar {
  --border-radius: 12px;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-container,
.error-container,
.no-results,
.search-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}

.loading-container ion-spinner {
  margin-bottom: 16px;
}

.error-container .error-icon,
.no-results-icon,
.search-prompt-icon {
  font-size: 48px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.results-list {
  margin: 0 -16px;
}

.product-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
}

.product-item ion-thumbnail {
  --size: 60px;
  margin-right: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.product-item ion-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-item ion-label h2 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.product-item ion-label .brand {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.product-item ion-label .nutrition-info {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.product-item ion-label .nutriscore {
  font-size: 12px;
  font-weight: 500;
  color: var(--ion-color-primary);
  margin: 0;
}

/* Темная тема для изображений */
.ion-palette-dark .product-item ion-thumbnail {
  background: rgba(255, 255, 255, 0.1);
}

/* Светлая тема для изображений */
:root .product-item ion-thumbnail {
  background: rgba(0, 0, 0, 0.05);
}

.barcode-scan-container {
  margin-top: 24px;
  padding: 0 16px;
}

.barcode-scan-container ion-button {
  --border-radius: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
}
</style> 