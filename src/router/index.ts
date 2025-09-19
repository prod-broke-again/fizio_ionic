import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import DashboardPage from '../views/DashboardPage.vue';
import WorkoutCategoriesPage from '../views/WorkoutCategoriesPage.vue'; // Старая страница категорий тренировок
import WorkoutsPageV2 from '../views/WorkoutsPageV2.vue'; // Новая страница тренировок V2
import WorkoutProgramsPage from '../views/WorkoutProgramsPage.vue'; // Страница программ в категории
import WorkoutProgramDetailsPage from '../views/WorkoutProgramDetailsPage.vue'; // Страница деталей программы
import WorkoutSessionPage from '../views/WorkoutSessionPage.vue'; // Страница выполнения тренировки
// import WorkoutsPage from '../views/WorkoutsPage.vue'; // Старая страница - временно отключена
import AIPage from '../views/AIPage.vue';
import ProfilePage from '../views/ProfilePage.vue';
import SettingsPage from '../views/SettingsPage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import GoalSelectionPage from '../views/GoalSelectionPage.vue';
import OnboardingPage from '../views/OnboardingPage.vue';
import EditProfilePage from '../views/EditProfilePage.vue';
import NotificationsPage from '../views/NotificationsPage.vue';
import WaterIntakePage from '../views/WaterIntakePage.vue';
import ApiService from '../services/api';

// Маршруты для страниц аутентификации и онбординга
const authRoutes: Array<RouteRecordRaw> = [
  // Важно: не делаем мгновенный редирект с '/' на '/welcome',
  // чтобы не потерять Telegram hash до инициализации в App.vue
  {
    path: '/',
    component: () => import('../views/WelcomePage.vue'),
    meta: { requiresGuest: false }
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: () => import('../views/WelcomePage.vue'),
    meta: { requiresGuest: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/goal-selection',
    name: 'GoalSelection',
    component: GoalSelectionPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: OnboardingPage,
    meta: { requiresAuth: true }
  }
];

// Маршруты для основных страниц приложения (с табами)
const appRoutes: Array<RouteRecordRaw> = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/workouts',
    name: 'Workouts',
    component: WorkoutsPageV2, // Новая страница тренировок V2
    meta: { requiresAuth: true }
  },
  {
    path: '/workouts-v1',
    name: 'WorkoutsV1',
    component: WorkoutCategoriesPage, // Старая страница категорий тренировок (для обратной совместимости)
    meta: { requiresAuth: true }
  },
  {
    path: '/workout-programs/:categoryId',
    name: 'WorkoutPrograms',
    component: WorkoutProgramsPage,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/workout-program-details/:programId',
    name: 'WorkoutProgramDetails',
    component: WorkoutProgramDetailsPage,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/workout-session/:programId',
    name: 'WorkoutSession',
    component: WorkoutSessionPage,
    props: true,
    meta: { 
      requiresAuth: true,
      title: 'Тренировка'
    }
  },
  // {
  //   path: '/workouts-old',
  //   name: 'WorkoutsOld',
  //   component: WorkoutsPage, // Старая страница - доступна по /workouts-old для тестирования
  //   meta: { requiresAuth: true }
  // },
  {
    path: '/nutrition_old',
    name: 'Nutrition',
    component: () => import('@/views/NewNutritionPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ai',
    name: 'AI',
    component: AIPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-profile',
    name: 'EditProfile',
    component: EditProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: NotificationsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/water-intake',
    name: 'WaterIntake',
    component: WaterIntakePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/recipes',
    name: 'Recipes',
    component: () => import('@/views/RecipesPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/nutrition',
    name: 'Nutrition',
    component: () => import('@/views/NutritionV2Page.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/nutrition-v3',
    name: 'NutritionV3',
    component: () => import('@/views/NutritionV3Page.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/nutrition-test',
    name: 'NutritionTest',
    component: () => import('@/views/NutritionTestPage.vue'),
    meta: { requiresAuth: true }
  }
];

// Объединяем все маршруты
const routes = [...authRoutes, ...appRoutes];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Защита маршрутов и проверка авторизации
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  
  const isAuthenticated = ApiService.isAuthenticated();
  
  // Если приложение открыто из Telegram (есть tgWebAppData в hash или sessionStorage),
  // даём App.vue обработать автологин и показать лоадер, не перетирая hash редиректом
  let telegramInStorage = false;
  try {
    telegramInStorage = sessionStorage.getItem('tgWebAppData') !== null;
  } catch (e) {
    // ignore
  }
  const telegramInHash = typeof window !== 'undefined' && window.location?.hash?.includes('tgWebAppData=');
  const isTelegramPendingAuth = Boolean(telegramInHash || telegramInStorage);
  
  // Специальная логика для главной страницы
  if (to.path === '/') {
    // ВРЕМЕННО: Всегда показываем WelcomePage как сплеш-скрин
    // TODO: Вернуть проверку авторизации после доработки
    next();
  } else if (requiresAuth && !isAuthenticated) {
    // Если маршрут требует авторизации, а пользователь не вошел в систему
    if (isTelegramPendingAuth) {
      next();
    } else {
      next('/');
    }
  } else if (requiresGuest && isAuthenticated) {
    // Если маршрут только для гостей, а пользователь уже авторизован
    next('/dashboard');
  } else if (requiresGuest && !isAuthenticated) {
    // ВРЕМЕННО: Разрешаем доступ к страницам авторизации (login, register)
    // TODO: Вернуть редирект на WelcomePage после доработки авторизации
    if (to.path === '/login' || to.path === '/register') {
      next(); // Разрешаем доступ к страницам авторизации
    } else if (to.path !== '/') {
      next('/');
    } else {
      next();
    }
  } else {
    // В остальных случаях разрешаем переход
    next();
  }
});

export default router;
