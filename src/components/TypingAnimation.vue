<template>
  <div class="typing-animation">
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  </div>
</template>

<script setup lang="ts">
// Компонент для отображения анимации печатания
</script>

<style scoped>
.typing-animation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 10px;
  height: 20px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #87B1FF;
  opacity: 0.6;
  animation: typing-animation 1.4s infinite ease-in-out both;
}

.typing-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing-animation {
  0%, 80%, 100% { 
    transform: scale(0);
    opacity: 0.6;
  } 
  40% { 
    transform: scale(1);
    opacity: 1;
  }
}
</style> 