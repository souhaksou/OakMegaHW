import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/stores/auth';

import NotFound from '@/views/NotFound.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
      meta: { requiresAuth: true }
    },
  ],
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  // 如果路由需要登入但尚未登入
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login');
    return;
  }
  // 如果已經登入，卻又跑去 /login → 強制回首頁
  if (to.path === '/login' && auth.isAuthenticated) {
    next('/');
    return;
  }
  next();
});

export default router;