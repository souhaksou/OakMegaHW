<script setup>
import { useAuthStore } from '@/stores/auth'

import GoogleLogin from '@/components/GoogleLogin.vue'
import FacebookLogin from '@/components/FacebookLogin.vue'

const auth = useAuthStore()
</script>

<template>
  <div>
    login
  </div>
  <div class="login-page">
    <h2>請完成兩項登入後進入系統</h2>

    <GoogleLogin />
    <FacebookLogin />


    <pre>{{ auth }}</pre>
  </div>
</template>


<!-- <script setup>
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import GoogleLogin from '@/components/GoogleLogin.vue'
import FacebookLogin from '@/components/FacebookLogin.vue'

const auth = useAuthStore()
const router = useRouter()

// 監聽兩者都登入成功
watch(
  () => auth.isAuthenticated,
  (done) => {
    if (done) router.push('/')
  }
)
</script>

<template>
  <div class="login-page">
    <h2>請完成兩項登入後進入系統</h2>

    <GoogleLogin />
    <FacebookLogin />

 
    <pre>{{ auth }}</pre>
  </div>
</template> -->
