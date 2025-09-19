// @ts-nocheck
<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Питание</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="nv2">
        <!-- Недельный календарь -->
        <div class="week">
          <div class="week-head">
            <button class="nav" @click="prevWeek"><ion-icon :icon="chevronBackOutline" /></button>
            <div class="week-title">{{ weekRangeTitle }}</div>
            <button class="nav" @click="nextWeek"><ion-icon :icon="chevronForwardOutline" /></button>
          </div>
          <div class="week-days">
            <button v-for="(d,idx) in weekDays" :key="idx" :class="['day', d.isToday && 'day-today', d.iso===selectedDate && 'day-active']" @click="selectDay(d.iso)">
              <div class="dn">{{ d.label }}</div>
              <div class="dd">{{ d.date }}</div>
            </button>
          </div>
          <div class="week-actions">
            <button class="today" @click="goToday">Сегодня</button>
          </div>
        </div>

        <!-- Переключатель вида -->
        <div class="view-switch">
          <button :class="['vs', viewMode==='day' && 'vs-active']" @click="viewMode='day'">День</button>
          <button :class="['vs', viewMode==='week' && 'vs-active']" @click="viewMode='week'">Неделя</button>
        </div>

        <!-- План выбранного дня -->
        <div class="day-plan" v-if="viewMode==='day'">
          <div class="dp-head">План на {{ selectedDate }}</div>
          <div v-if="loadingDay" class="dp-loading"><ion-spinner name="crescent" /> Загружаю...</div>
          <div v-else-if="!dayMeals.length" class="dp-empty">Нет записей на этот день</div>
          <div v-else class="meals">
            <div class="meal" v-for="(m,idx) in dayMeals" :key="idx">
              <div class="meal-head">
                <div class="type-chip">
                  <ion-icon :icon="iconByType(m.type || m.mealType)" />
                  <span>{{ mapType(m.type || m.mealType) }}</span>
                </div>
                <div class="badges">
                  <div v-if="m.time" class="badge"><ion-icon :icon="timeOutline" />{{ m.time }}</div>
                  <div class="badge status" :class="m.completed ? 'ok' : 'pending'">
                    <ion-icon :icon="m.completed ? checkmarkCircleOutline : closeCircleOutline" />
                    {{ m.completed ? 'Выполнено' : 'Не выполнено' }}
                  </div>
                </div>
              </div>
              <div class="meal-title">{{ m.name || mapType(m.type || m.mealType) }}</div>
              <div class="macro-row">
                <div class="macro kcal"><ion-icon :icon="flameOutline" /> {{ Math.round(m.calories || 0) }} ккал</div>
                <div class="macro chip">Б {{ formatNumber(m.proteins || 0) }}</div>
                <div class="macro chip">Ж {{ formatNumber(m.fats || 0) }}</div>
                <div class="macro chip">У {{ formatNumber(m.carbs || 0) }}</div>
              </div>
              <div v-if="m.items && m.items.length" class="meal-items">
                <div class="mi" v-for="(it, i2) in m.items" :key="i2">
                  <img v-if="it.product && it.product.image" :src="it.product.image" class="mi-img" alt="" />
                  <div class="mi-body">
                    <div class="mi-title">{{ getItemTitle(it) }}</div>
                    <div class="mi-sub">{{ formatNumber(it.grams) }} г · {{ formatNumber(it.calories) }} ккал</div>
                  </div>
                </div>
              </div>
              <div class="meal-actions">
                <button class="m-act done" @click="toggleMealComplete(m)"><ion-icon :icon="checkmarkCircleOutline" /> {{ m.completed ? 'Отменить' : 'Выполнено' }}</button>
                <button class="m-act danger" @click="deleteMeal(m)"><ion-icon :icon="trashOutline" /> Удалить</button>
              </div>
            </div>
          </div>
        </div>

        <!-- План на неделю -->
        <div class="week-plan" v-else>
          <div class="wp-list">
            <div class="wp-day" v-for="(d,di) in weekData" :key="di">
              <div class="wp-head" @click="selectDay(d.date)">
                <div class="wp-date">{{ d.dayName || d.date }}</div>
                <div class="wp-sub">{{ d.date }}</div>
              </div>
              <div v-if="!d.meals || !d.meals.length" class="dp-empty">Нет записей</div>
              <div v-else class="meals">
                <div class="meal" v-for="(m,mi) in d.meals" :key="mi">
                  <div class="meal-head">
                    <div class="type-chip">
                      <ion-icon :icon="iconByType(m.type || m.mealType)" />
                      <span>{{ mapType(m.type || m.mealType) }}</span>
                    </div>
                    <div class="badges">
                      <div v-if="m.time" class="badge"><ion-icon :icon="timeOutline" />{{ m.time }}</div>
                      <div class="badge status" :class="m.completed ? 'ok' : 'pending'">
                        <ion-icon :icon="m.completed ? checkmarkCircleOutline : closeCircleOutline" />
                        {{ m.completed ? 'Выполнено' : 'Не выполнено' }}
                      </div>
                    </div>
                  </div>
                  <div class="meal-title">{{ m.name || mapType(m.type || m.mealType) }}</div>
                  <div class="macro-row">
                    <div class="macro kcal"><ion-icon :icon="flameOutline" /> {{ Math.round(m.calories || 0) }} ккал</div>
                    <div class="macro chip">Б {{ formatNumber(m.proteins || 0) }}</div>
                    <div class="macro chip">Ж {{ formatNumber(m.fats || 0) }}</div>
                    <div class="macro chip">У {{ formatNumber(m.carbs || 0) }}</div>
                  </div>
                  <div v-if="m.items && m.items.length" class="meal-items">
                    <div class="mi" v-for="(it, i2) in m.items" :key="i2">
                      <img v-if="it.product && it.product.image" :src="it.product.image" class="mi-img" alt="" />
                      <div class="mi-body">
                        <div class="mi-title">{{ getItemTitle(it) }}</div>
                        <div class="mi-sub">{{ formatNumber(it.grams) }} г · {{ formatNumber(it.calories) }} ккал</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FAB для добавления -->
        <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="fab-add">
          <ion-fab-button @click="openAddModal"><ion-icon :icon="addOutline" /></ion-fab-button>
        </ion-fab>
      </div>
    </ion-content>

    <!-- Модалка добавления (внутри ion-page) -->
    <ion-modal :is-open="isAddOpen" @didDismiss="closeAddModal">
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <ion-title>Добавить в план</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeAddModal"><ion-icon :icon="closeOutline" /></ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="nv2">
          <div class="search">
            <ion-icon :icon="searchOutline" class="search-icon" />
            <input v-model="query" @input="onSearch" type="text" class="search-input" placeholder="Найти продукт..." />
            <ion-icon v-if="query" :icon="closeOutline" class="search-clear" @click="clearSearch" />
          </div>
          <div v-if="loadingSearch" class="search-loading"><ion-spinner name="crescent" /><span>Поиск...</span></div>
          <div v-if="results.length" class="results">
            <div v-for="item in results" :key="item.id" class="result" @click="addToBasket(item)">
              <img :src="item.image || placeholder" alt="img" class="result-img" />
              <div class="result-body">
                <div class="result-title">{{ item.title }}</div>
                <div class="result-sub">100 г · {{ item.per100.calories }} ккал</div>
              </div>
              <ion-icon :icon="addOutline" class="result-add" />
            </div>
          </div>
          <div class="basket" v-if="basket.length">
            <div class="basket-head">Выбрано</div>
            <div class="basket-list">
              <div class="basket-item" v-for="(bi,idx) in basket" :key="idx">
                <div class="bi-title">{{ bi.title }}</div>
                <div class="bi-controls">
                  <button class="qty" @click="bi.grams=Math.max(1,bi.grams-10);updatePreview()">-</button>
                  <div class="qty-val">{{ bi.grams }} г</div>
                  <button class="qty" @click="bi.grams+=10;updatePreview()">+</button>
                  <button class="del" @click="removeFromBasket(idx)"><ion-icon :icon="trashOutline" /></button>
                </div>
              </div>
            </div>
          </div>
          <div class="apply">
            <div class="apply-row">
              <div class="apply-label">Приём</div>
              <div class="apply-seg">
                <button :class="['seg', type==='breakfast' && 'seg-active']" @click="setType('breakfast')"><ion-icon :icon="sunnyOutline" /> Завтрак</button>
                <button :class="['seg', type==='lunch' && 'seg-active']" @click="setType('lunch')"><ion-icon :icon="restaurantOutline" /> Обед</button>
                <button :class="['seg', type==='dinner' && 'seg-active']" @click="setType('dinner')"><ion-icon :icon="moonOutline" /> Ужин</button>
              </div>
            </div>
            <div class="apply-row">
              <div class="apply-label">Когда</div>
              <div class="apply-date">
                <input type="date" v-model="dateFrom" @change="onDatesChanged" />
                <span class="dash">—</span>
                <input type="date" v-model="dateTo" @change="onDatesChanged" />
              </div>
              <div class="weekdays">
                <button v-for="(w,i) in wd" :key="i" :class="['wd', w.active && 'wd-active']" @click="toggleWd(i)">{{ w.label }}</button>
              </div>
            </div>
            <div class="apply-row">
              <div class="apply-label">Стратегия</div>
              <div class="apply-seg">
                <button :class="['seg', strategy==='append' && 'seg-active']" @click="strategy='append'">Добавить</button>
                <button :class="['seg', strategy==='overwrite' && 'seg-active']" @click="strategy='overwrite'">Заменить</button>
                <button :class="['seg', strategy==='skip' && 'seg-active']" @click="strategy='skip'">Пропустить</button>
              </div>
            </div>
          </div>
          <div v-if="preview" class="totals">
            <div class="tot"><div class="tot-val">{{ preview.totals.calories || 0 }}</div><div class="tot-lbl">ккал</div></div>
            <div class="tot"><div class="tot-val">{{ preview.totals.proteins || 0 }}г</div><div class="tot-lbl">белки</div></div>
            <div class="tot"><div class="tot-val">{{ preview.totals.fats || 0 }}г</div><div class="tot-lbl">жиры</div></div>
            <div class="tot"><div class="tot-val">{{ preview.totals.carbs || 0 }}г</div><div class="tot-lbl">углеводы</div></div>
          </div>
          <div class="actions">
            <button class="primary" :disabled="!basket.length || applying" @click="applyPlan"><ion-icon :icon="addOutline" /><span>{{ applying ? 'Применяю...' : 'Добавить в план' }}</span></button>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonIcon, IonFab, IonFabButton, IonModal, IonButtons, IonButton } from '@ionic/vue';
import { searchOutline, closeOutline, addOutline, sunnyOutline, restaurantOutline, moonOutline, trashOutline, chevronBackOutline, chevronForwardOutline, timeOutline, checkmarkCircleOutline, closeCircleOutline, flameOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ProductSearchApi, type ProductSearchItem } from '@/services/api/productSearch';
import { WeekPlanService } from '@/services/api/weekPlanService';
import { MealApi } from '@/services/api/mealService';

addIcons({ searchOutline, closeOutline, addOutline, sunnyOutline, restaurantOutline, moonOutline, trashOutline, chevronBackOutline, chevronForwardOutline, timeOutline, checkmarkCircleOutline, closeCircleOutline, flameOutline });

// Лёгкое логирование для диагностики дат (выключено по умолчанию)
const NV2_DEBUG: boolean = (() => {
    try {
        const url = new URL(window.location.href);
        if (url.searchParams.get('nv2dbg') === '1') return true;
    } catch (_) {}
    try {
        return localStorage.getItem('nv2_debug') === '1';
    } catch (_) { return false; }
})();
const log = (m:string, v?:any)=>{ if(!NV2_DEBUG) return; try{ console.log(`[NV2] ${m}`, v ?? ''); }catch(_){} };

// Календарь недели
function toLocalISO(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}
const now = new Date();
const todayIso = toLocalISO(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
log('init', { now: now.toString(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone, tzOffset: now.getTimezoneOffset(), todayIso });
const selectedDate = ref<string>(todayIso);
const weekOffset = ref<number>(0); // 0 — текущая неделя
const weekPlanApi = new WeekPlanService();
const loadingDay = ref<boolean>(false);
const dayMeals = ref<any[]>([]);
  const loadingWeek = ref<boolean>(false);
  const weekData = ref<any[]>([]);
  const viewMode = ref<'day'|'week'>('day');

const weekStart = computed(()=>{
    // Берём «сегодня» локально и смещаем к началу недели (Пн)
    const local = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = local.getDay() === 0 ? 7 : local.getDay(); // 1..7, где 1=Пн
    const base = new Date(local);
    base.setDate(base.getDate() - (day-1) + weekOffset.value*7);
    log('weekStart->base', { base: base.toString(), iso: toLocalISO(base), weekOffset: weekOffset.value });
    return base;
});

const weekDays = computed(()=>{
    const res:any[]=[]; const labels=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for(let i=0;i<7;i++){
        const d = new Date(weekStart.value);
        d.setDate(d.getDate()+i);
        // Принудительно отбрасываем время
        const dLocal = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const iso = toLocalISO(dLocal);
        res.push({
            iso,
            label: labels[i],
            date: dLocal.getDate(),
            isToday: dLocal.getTime() === todayLocal.getTime()
        });
    }
    log('weekDays', res);
    return res;
});

const weekRangeTitle = computed(()=>{
    const s = new Date(weekStart.value);
    // Сдвиг в московскую зону для форматтера (костыль для WebView)
    const msk = new Date(s.getTime() + 3*60*60*1000);
    const e = new Date(weekStart.value); e.setDate(e.getDate()+6);
    const em = new Date(e.getTime() + 3*60*60*1000);
    const fmt = (dt:Date)=> dt.toLocaleDateString('ru-RU', { day:'2-digit', month:'short', timeZone: 'Europe/Moscow' });
    const title = `${fmt(msk)} — ${fmt(em)}`;
    log('weekRangeTitle', title);
    return title;
});

function selectDay(iso:string){
	selectedDate.value = iso;
	dateFrom.value = iso;
	dateTo.value = iso;
	wd.value.forEach(w=>w.active=false);
	loadDayPlan();
}
function goToday(){
    weekOffset.value=0;
    selectDay(todayIso);
}
function prevWeek(){ weekOffset.value--; syncSelectedIntoWeek(); }
function nextWeek(){ weekOffset.value++; syncSelectedIntoWeek(); }
function syncSelectedIntoWeek(){
	const startIso = toLocalISO(weekStart.value);
	const end = new Date(weekStart.value); end.setDate(end.getDate()+6);
	const endIso = toLocalISO(end);
	if(selectedDate.value < startIso || selectedDate.value > endIso){
		selectDay(startIso);
	}
  // При смене недели обновляем недельный план, если открыт режим недели
  if(viewMode.value==='week'){
    loadWeekPlan();
  }
}

onMounted(()=>{ selectDay(todayIso); loadWeekPlan(); });
watch(selectedDate, v=> log('selectedDate', v));

const query = ref('');
const loadingSearch = ref(false);
const results = ref<ProductSearchItem[]>([]);
const placeholder = '/assets/images/product-placeholder.svg';

const basket = ref<Array<{ id: string|number; title: string; grams: number }>>([]);

const type = ref<'breakfast'|'lunch'|'dinner'>('breakfast');
const dateFrom = ref<string>(todayIso);
const dateTo = ref<string>(todayIso);
const strategy = ref<'append'|'overwrite'|'skip'>('append');
const wd = ref([
  {label:'Пн', d:1, active:false},{label:'Вт',d:2,active:false},{label:'Ср',d:3,active:false},
  {label:'Чт', d:4, active:false},{label:'Пт',d:5,active:false},{label:'Сб',d:6,active:false},{label:'Вс',d:7,active:false}
]);

const preview = ref<any|null>(null);
const applying = ref(false);
const isAddOpen = ref(false);

let searchTimer: any;
function onSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    if (!query.value || query.value.trim().length < 2) { results.value = []; return; }
    loadingSearch.value = true;
    try {
      const resp = await ProductSearchApi.search(query.value.trim(), 1);
      results.value = resp.items || [];
    } finally { loadingSearch.value = false; }
  }, 350);
}
function clearSearch(){ query.value=''; results.value=[]; }

function addToBasket(item: ProductSearchItem){
  basket.value.push({ id: item.id, title: item.title, grams: 100 });
  updatePreview();
}
function removeFromBasket(idx:number){ basket.value.splice(idx,1); updatePreview(); }

function setType(t:'breakfast'|'lunch'|'dinner'){ type.value=t; }
function toggleWd(i:number){ wd.value[i].active = !wd.value[i].active; }
function onDatesChanged(){ if(dateFrom.value>dateTo.value) dateTo.value=dateFrom.value; }

async function updatePreview(){
  if(!basket.value.length){ preview.value=null; return; }
  const items = basket.value.map(b=>({ product_id: b.id, grams: b.grams }));
  try { preview.value = await MealApi.preview({ items }); } catch { /* ignore */ }
}

async function applyPlan(){
  if(!basket.value.length) return;
  applying.value = true;
  try {
    const activeWd = wd.value.filter(w=>w.active).map(w=>w.d);
    const apply_to = (dateFrom.value===dateTo.value && !activeWd.length)
      ? { dates: [dateFrom.value] }
      : { date_range: { from: dateFrom.value, to: dateTo.value }, weekdays: activeWd.length?activeWd:undefined };
    // Бэкенд принимает product_id как штрих‑код (code) и сам маппит на products.id
    const items = basket.value.map(b=>({ product_id: b.id, grams: b.grams }));
    const payload = { apply_to, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, type: type.value, strategy: strategy.value, items };
    const applyResp = await MealApi.apply(payload);
    basket.value=[]; preview.value=null; query.value=''; results.value=[];
    await loadDayPlan();
    await loadWeekPlan();
    isAddOpen.value = false;
  } finally { applying.value=false; }
}

async function loadDayPlan(){
  try{
    loadingDay.value = true;
    const day = await weekPlanApi.getDayPlan(selectedDate.value);
    dayMeals.value = (day?.meals) || [];
  }catch(e){ dayMeals.value = []; }
  finally{ loadingDay.value = false; }
}

async function loadWeekPlan(){
  try{
    loadingWeek.value = true;
    const data = await weekPlanApi.getWeekPlan(weekStart.value);
    weekData.value = Array.isArray(data) ? data : [];
  }catch(e){ weekData.value = []; }
  finally{ loadingWeek.value = false; }
}

function mapType(t:any){
  if(!t) return 'Приём';
  const v = typeof t === 'string' ? t : String(t);
  if(v==='breakfast') return 'Завтрак';
  if(v==='lunch') return 'Обед';
  if(v==='dinner') return 'Ужин';
  return 'Перекус';
}

function iconByType(t:any){
  const v = typeof t === 'string' ? t : String(t);
  if(v==='breakfast') return sunnyOutline;
  if(v==='lunch') return restaurantOutline;
  if(v==='dinner') return moonOutline;
  return restaurantOutline;
}

function formatNumber(n:any){
  const num = typeof n === 'string' ? parseFloat(n) : (n||0);
  return Number.isFinite(num) ? (Math.round(num*10)/10) : 0;
}

function getItemTitle(it:any){
  return it?.product?.name || it?.name || it?.title || it?.free_text || 'Продукт';
}

function openAddModal(){ isAddOpen.value = true; }
function closeAddModal(){ isAddOpen.value = false; }

async function toggleMealComplete(m:any){
  try{
    await weekPlanApi.toggleMeal(selectedDate.value, String(m.id));
    await loadDayPlan();
    await loadWeekPlan();
  }catch(e){ /* noop */ }
}

async function deleteMeal(m:any){
  try{
    await weekPlanApi.deleteMeal(selectedDate.value, String(m.id));
    await loadDayPlan();
    await loadWeekPlan();
  }catch(e){ /* noop */ }
}
</script>

<style scoped>
.nv2{ padding:12px; }
.search{ position:sticky; top:0; z-index:5; display:flex; align-items:center; gap:8px; background:#1f1f20; border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:10px 12px; }
.search-input{ flex:1; background:transparent; border:none; outline:none; color:#fff; font-size:15px; }
.search-icon,.search-clear{ color:rgba(255,255,255,.6); font-size:18px; }
.search-loading{ display:flex; align-items:center; gap:10px; padding:10px 2px; color:rgba(255,255,255,.7); }
.results{ margin-top:10px; display:flex; flex-direction:column; gap:8px; }
.result{ display:flex; align-items:center; gap:10px; background:#262628; border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:8px 10px; }
.result-img{ width:44px; height:44px; border-radius:10px; object-fit:cover; background:rgba(255,255,255,.06); }
.result-title{ color:#fff; font-weight:600; font-size:14px; }
.result-sub{ color:rgba(255,255,255,.6); font-size:12px; }
.result-add{ margin-left:auto; color:#8560ff; font-size:20px; }

.basket{ margin-top:12px; background:#212123; border:1px solid rgba(255,255,255,.06); border-radius:12px; }
.basket-head{ padding:10px 12px; font-weight:700; color:#fff; border-bottom:1px solid rgba(255,255,255,.08); }
.basket-list{ display:flex; flex-direction:column; }
.basket-item{ display:flex; align-items:center; justify-content:space-between; padding:10px 12px; gap:10px; }
.bi-title{ color:#fff; font-size:14px; font-weight:600; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.bi-controls{ display:flex; align-items:center; gap:8px; }
.qty{ width:36px; height:36px; border-radius:10px; border:none; background:#333; color:#fff; }
.qty-val{ width:64px; text-align:center; color:#fff; font-weight:700; }
.del{ width:36px; height:36px; border-radius:10px; border:1px solid rgba(255,255,255,.12); background:transparent; color:#ff6b6b; display:flex; align-items:center; justify-content:center; }

.apply{ margin-top:14px; display:flex; flex-direction:column; gap:12px; }
.apply-row{ background:#212123; border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:10px 12px; }
.apply-label{ color:#9aa0a6; font-size:12px; margin-bottom:8px; font-weight:700; text-transform:uppercase; letter-spacing:.4px; }
.apply-seg{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.seg{ background:#2b2b2e; color:#fff; border:1px solid rgba(255,255,255,.08); border-radius:10px; padding:10px 8px; font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px; }
.seg-active{ border-color:#8560ff; background:rgba(133,96,255,.18); }
.apply-date{ display:flex; align-items:center; gap:8px; }
.apply-date input{ flex:1; background:#2b2b2e; color:#fff; border:1px solid rgba(255,255,255,.08); border-radius:10px; padding:8px; font-size:13px; }
.dash{ color:#777; }
.weekdays{ margin-top:8px; display:grid; grid-template-columns:repeat(7,1fr); gap:6px; }
.wd{ background:#2b2b2e; color:#fff; border:1px solid rgba(255,255,255,.08); border-radius:8px; padding:8px 0; font-size:12px; }
.wd-active{ border-color:#34a853; background:rgba(52,168,83,.15); }

.totals{ margin-top:12px; display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
.tot{ background:#212123; border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:10px 8px; text-align:center; }
.tot-val{ color:#fff; font-weight:800; font-size:16px; }
.tot-lbl{ color:#9aa0a6; font-size:11px; }

.actions{ position:sticky; bottom:0; left:0; right:0; padding:12px 0 8px; background:transparent;}
.primary{ width:100%; height:44px; border:none; border-radius:12px; background:#8560ff; color:#fff; font-weight:800; display:flex; align-items:center; justify-content:center; gap:8px; font-size:14px; }
.primary:disabled{ opacity:.6; }

/* iOS safe area */
@supports(padding:max(0px)){
  .nv2{ padding-bottom:max(12px, env(safe-area-inset-bottom)); }
}

.week{ background:#1e1e20; border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:10px 12px; margin-bottom:12px; }
.week-head{ display:flex; align-items:center; justify-content:space-between; }
.week-title{ color:#fff; font-weight:800; font-size:14px; }
.nav{ width:36px; height:36px; border-radius:10px; background:#2b2b2e; color:#fff; border:1px solid rgba(255,255,255,.08); display:flex; align-items:center; justify-content:center; }
.week-days{ margin-top:8px; display:grid; grid-template-columns:repeat(7,1fr); gap:6px; }
.day{ background:#2b2b2e; border:1px solid rgba(255,255,255,.08); border-radius:10px; padding:6px 0; text-align:center; color:#fff; }
.dn{ font-size:11px; color:#9aa0a6; font-weight:700; text-transform:uppercase; }
.dd{ font-size:15px; font-weight:800; }
.day-today{ border-color:#34a853; }
.day-active{ background:rgba(133,96,255,.18); border-color:#8560ff; }
.week-actions{ margin-top:8px; display:flex; justify-content:flex-end; }
.today{ background:#2b2b2e; border:1px solid rgba(255,255,255,.08); color:#fff; border-radius:10px; padding:6px 10px; font-size:12px; }

/* Переключатель День/Неделя */
.view-switch{ display:flex; gap:8px; margin:8px 0; }
.vs{ flex:1; background:#2b2b2e; color:#fff; border:1px solid rgba(255,255,255,.08); border-radius:10px; padding:8px; font-size:13px; }
.vs-active{ border-color:#8560ff; background:rgba(133,96,255,.18); }

/* FAB выше таббара */
.fab-add{ position: fixed !important; right: 16px; bottom: calc(15px + env(safe-area-inset-bottom)); z-index: 1000; }

/* День плана */
.day-plan{ margin-top:12px; display:flex; flex-direction:column; gap:8px; }
.dp-head{ color:#fff; font-weight:800; font-size:14px; padding:6px 2px; opacity:.9; }
.dp-loading{ color:#9aa0a6; display:flex; align-items:center; gap:8px; padding:8px 2px; }
.dp-empty{ color:#9aa0a6; padding:10px 12px; background:#212123; border:1px solid rgba(255,255,255,.06); border-radius:12px; }
.meals{ display:flex; flex-direction:column; gap:10px; }
.meal{ background:#212123; border:1px solid rgba(255,255,255,.06); border-radius:14px; padding:12px; }
.meal-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.type-chip{ display:flex; align-items:center; gap:8px; background:#2b2b2e; border:1px solid rgba(255,255,255,.08); color:#fff; border-radius:999px; padding:6px 10px; font-size:12px; }
.badges{ display:flex; align-items:center; gap:6px; }
.badge{ display:flex; align-items:center; gap:6px; background:#2b2b2e; border:1px solid rgba(255,255,255,.08); color:#fff; border-radius:999px; padding:6px 10px; font-size:12px; }
.badge.status.ok{ border-color:#34a853; background:rgba(52,168,83,.15); }
.badge.status.pending{ border-color:#9aa0a6; }
.meal-title{ color:#fff; font-weight:800; font-size:16px; margin:2px 0 8px; }
.macro-row{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:8px; }
.macro{ display:flex; align-items:center; gap:6px; color:#bfc2c7; font-size:12px; background:#1b1b1d; border:1px solid rgba(255,255,255,.06); border-radius:10px; padding:6px 8px; }
.macro.kcal{ color:#ffd166; border-color:rgba(255,209,102,.3); }
.meal-actions{ margin-top:8px; display:flex; gap:8px; }
.m-act{ flex:0 0 auto; padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,.08); background:#2b2b2e; color:#fff; font-size:12px; }
.m-act.danger{ border-color: rgba(255,107,107,.4); color:#ff6b6b; }
.m-act.done{ border-color:#34a853; }
.meal-items{ margin-top:6px; display:flex; flex-direction:column; gap:8px; }
.mi{ display:flex; align-items:center; gap:10px; }
.mi-img{ width:36px; height:36px; border-radius:8px; object-fit:cover; background:rgba(255,255,255,.06); }
.mi-body{ display:flex; flex-direction:column; }
.mi-title{ color:#fff; font-size:14px; font-weight:600; }
.mi-sub{ color:#9aa0a6; font-size:12px; }

/* Неделя */
.week-plan{ margin-top:12px; display:flex; flex-direction:column; gap:8px; }
.wp-list{ display:flex; flex-direction:column; gap:10px; }
.wp-day{ background:#1e1e20; border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:10px 12px; }
.wp-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; cursor:pointer; }
.wp-date{ color:#fff; font-weight:800; }
.wp-sub{ color:#9aa0a6; font-size:12px; }
</style>

<style scoped>
/* Light theme overrides (только когда НЕ включена тёмная палитра Ionic) */
:global(html:not(.ion-palette-dark)) .search{ background:#ffffff; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .search-input{ color:#333; }
:global(html:not(.ion-palette-dark)) .search-icon,:global(html:not(.ion-palette-dark)) .search-clear{ color:#666; }
:global(html:not(.ion-palette-dark)) .result{ background:#fafafa; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .result-img{ background:#f1f1f4; }
:global(html:not(.ion-palette-dark)) .result-title{ color:#222; }
:global(html:not(.ion-palette-dark)) .result-sub{ color:#666; }

:global(html:not(.ion-palette-dark)) .basket{ background:#ffffff; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .basket-head{ color:#111; border-color:#ececf2; }
:global(html:not(.ion-palette-dark)) .qty{ background:#f1f1f4; color:#111; }
:global(html:not(.ion-palette-dark)) .qty-val{ color:#111; }
:global(html:not(.ion-palette-dark)) .del{ border:1px solid #ececf2; color:#e05d5d; background:transparent; }

:global(html:not(.ion-palette-dark)) .apply-row{ background:#ffffff; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .apply-label{ color:#6b7280; }
:global(html:not(.ion-palette-dark)) .seg{ background:#f7f7fa; color:#111; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .apply-date input{ background:#fafafa; color:#111; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .wd{ background:#f7f7fa; color:#111; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .wd-active{ background:rgba(52,168,83,.10); border-color:#34a853; }

:global(html:not(.ion-palette-dark)) .tot{ background:#ffffff; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .tot-val{ color:#111; }
:global(html:not(.ion-palette-dark)) .tot-lbl{ color:#6b7280; }

:global(html:not(.ion-palette-dark)) .week{ background:#ffffff; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .week-title{ color:#111; }
:global(html:not(.ion-palette-dark)) .nav{ background:#f7f7fa; color:#111; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .day{ background:#f7f7fa; color:#111; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .dn{ color:#6b7280; }
:global(html:not(.ion-palette-dark)) .today{ background:#f7f7fa; color:#111; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .vs{ background:#f7f7fa; color:#111; border:1px solid #ececf2; }

/* Важные состояния дня для светлой темы */
:global(html:not(.ion-palette-dark)) .day.day-active{ background:rgba(133,96,255,.18); border-color:#8560ff; }
:global(html:not(.ion-palette-dark)) .day.day-today{ border-color:#34a853; }

:global(html:not(.ion-palette-dark)) .dp-head{ color:#111; }
:global(html:not(.ion-palette-dark)) .dp-loading{ color:#6b7280; }
:global(html:not(.ion-palette-dark)) .dp-empty{ color:#6b7280; background:#ffffff; border:1px solid #ececf2; }

:global(html:not(.ion-palette-dark)) .meal{ background:#ffffff; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .type-chip{ background:#f7f7fa; color:#111; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .badge{ background:#f7f7fa; color:#111; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .meal-title{ color:#111; }
:global(html:not(.ion-palette-dark)) .macro{ color:#4b5563; background:#f7f7fa; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .m-act{ border:1px solid #e5e7eb; background:#f7f7fa; color:#111; }
:global(html:not(.ion-palette-dark)) .mi-img{ background:#f1f1f4; }
:global(html:not(.ion-palette-dark)) .mi-title{ color:#111; }
:global(html:not(.ion-palette-dark)) .mi-sub{ color:#6b7280; }

:global(html:not(.ion-palette-dark)) .wp-day{ background:#ffffff; border:1px solid #ececf2; }
:global(html:not(.ion-palette-dark)) .wp-date{ color:#111; }

</style>

