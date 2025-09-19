// @ts-nocheck
<template>
<ion-modal :is-open="modelValue" @didDismiss="close" :initial-breakpoint="0.6" :breakpoints="[0.4,0.6,0.9]">
		<ion-header class="ion-no-border">
			<ion-toolbar>
				<ion-title>Вода</ion-title>
				<ion-buttons slot="end">
					<ion-button @click="close"><ion-icon :icon="closeOutline" /></ion-button>
				</ion-buttons>
			</ion-toolbar>
		</ion-header>
<ion-content :scroll-y="true">
			<div class="wm">
				<div class="wm-total">
					<div class="wm-liters">{{ liters.toFixed(2) }} л</div>
					<div class="wm-sub">цель 2.00 л</div>
				</div>
				<div class="wm-quick">
					<button class="chip" @click="add(0.25)">+0.25</button>
					<button class="chip" @click="add(0.5)">+0.5</button>
					<button class="chip" @click="add(1)">+1.0</button>
				</div>
				<div class="wm-controls">
					<button class="round" @click="sub(0.25)"><ion-icon :icon="removeOutline" /></button>
					<div class="wm-value">{{ liters.toFixed(2) }} л</div>
					<button class="round" @click="add(0.25)"><ion-icon :icon="addOutline" /></button>
				</div>
				<div class="wm-actions">
					<button class="primary" @click="saveAndClose"><ion-icon :icon="waterOutline" /> Сохранить</button>
					<button class="link" @click="reset">Сбросить</button>
				</div>
			</div>
		</ion-content>
	</ion-modal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon } from '@ionic/vue';
import { addOutline, removeOutline, closeOutline, waterOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

addIcons({ addOutline, removeOutline, closeOutline, waterOutline });

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue', 'updated']);

const liters = ref(0);

function getKey(){
	const d = new Date();
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth()+1).padStart(2,'0');
	const dd = String(d.getDate()).padStart(2,'0');
	return `water_intake_${yyyy}-${mm}-${dd}`;
}

function load(){
	try{
		const v = localStorage.getItem(getKey());
		liters.value = v ? parseInt(v,10)*0.25 : 0;
	}catch{}
}
function persist(){
	try{
		const glasses = Math.round((liters.value/0.25));
		localStorage.setItem(getKey(), String(glasses));
	}catch{}
}

function close(){ emit('update:modelValue', false); }
function add(v:number){ liters.value = Math.max(0, +(liters.value+v).toFixed(2)); }
function sub(v:number){ liters.value = Math.max(0, +(liters.value-v).toFixed(2)); }
function reset(){ liters.value = 0; persist(); emit('updated', liters.value); }
function saveAndClose(){ persist(); emit('updated', liters.value); close(); }

onMounted(load);
watch(()=>props.modelValue, (o)=>{ if(o){ load(); } });
</script>

<style scoped>

.wm{ padding:12px 14px 16px; min-height: 40vh; display:flex; flex-direction:column; gap:10px; }
.wm-total{ display:flex; align-items:baseline; gap:8px; margin:4px 2px 10px; }
.wm-quick{ display:flex; gap:8px; margin:10px 0 6px; }
.wm-controls{ display:flex; align-items:center; justify-content:center; gap:12px; margin:6px 0 8px; }
.wm-actions{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:8px; }
.primary{ flex:1; height:44px; border:none; border-radius:12px; background:#8560ff; color:#fff; font-weight:800; display:flex; align-items:center; justify-content:center; gap:8px; font-size:14px; }

/* Light theme */
:root .wm-liters{ font-size:28px; font-weight:800; color:#333; }
:root .wm-sub{ font-size:12px; color:#666; }
:root .chip{ background:#f1f1f4; color:#333; border:1px solid #e6e6ea; border-radius:999px; padding:8px 10px; font-size:13px; }
:root .round{ width:44px; height:44px; border-radius:999px; border:1px solid #e0e0e4; background:#f9f9fb; color:#333; display:flex; align-items:center; justify-content:center; }
:root .wm-value{ color:#333; font-weight:800; font-size:18px; min-width:100px; text-align:center; }
:root .link{ background:transparent; border:none; color:#666; font-size:13px; }

/* Dark theme */
.ion-palette-dark .wm-liters{ color:#fff; }
.ion-palette-dark .wm-sub{ color:#9aa0a6; }
.ion-palette-dark .chip{ background:#2b2b2e; color:#fff; border:1px solid rgba(255,255,255,.08); }
.ion-palette-dark .round{ border:1px solid rgba(255,255,255,.12); background:#2b2b2e; color:#fff; }
.ion-palette-dark .wm-value{ color:#fff; }
.ion-palette-dark .link{ color:#9aa0a6; }

/* Компактная модалка: задаём явную высоту, иначе ion-content (100%) схлопывается */
:global(ion-modal){ --width: 92vw; --max-width: 520px; --height: 60vh; --max-height: 70vh; --border-radius: 16px; }
</style>


