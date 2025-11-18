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


// import { createRouter, createWebHistory } from 'vue-router'
// import { useAuthStore } from '@/stores/auth'

// import LoginView from '@/views/LoginView.vue'
// import MapView from '@/views/MapView.vue'

// const router = createRouter({
//   history: createWebHistory(),
//   routes: [
//     {
//       path: '/',
//       name: 'map',
//       component: MapView,
//       meta: { requiresAuth: true }
//     },
//     {
//       path: '/login',
//       name: 'login',
//       component: LoginView
//     }
//   ]
// })

// router.beforeEach((to, from, next) => {
//   const auth = useAuthStore()

//   // 如果路由需要登入但尚未登入
//   if (to.meta.requiresAuth && !auth.isAuthenticated) {
//     next('/login')
//     return
//   }

//   // 如果已經登入，卻又跑去 /login → 強制回首頁
//   if (to.path === '/login' && auth.isAuthenticated) {
//     next('/')
//     return
//   }

//   next()
// })

// export default router
