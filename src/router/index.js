import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('@/views/MapView.vue'),
    },
    {
      path: '/polygon',
      name: 'polygon',
      component: () => import('@/views/PolygonView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/testgoogle',
      name: 'testgoogle',
      component: () => import('@/views/TestGoogleView.vue'),
    },
    {
      path: '/testfb',
      name: 'testfb',
      component: () => import('@/views/TestFBView.vue'),
    },
  ],
})

export default router
