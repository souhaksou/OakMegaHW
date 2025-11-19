<script setup>
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import GoogleLogin from '@/components/GoogleLogin.vue';
import FacebookLogin from '@/components/FacebookLogin.vue';

import Swal from 'sweetalert2';

const router = useRouter();
const auth = useAuthStore();

// 監聽兩者都登入成功
watch(
  () => auth.isAuthenticated,
  (done) => {
    if (done) {
      setTimeout(() => {
        let timerInterval = null;
        Swal.fire({
          title: '即將進入系統…',
          html: '這個視窗將在 <b></b> 秒後關閉',
          timer: 2000,
          timerProgressBar: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            const b = Swal.getHtmlContainer().querySelector('b')
            timerInterval = setInterval(() => {
              b.textContent = (Swal.getTimerLeft() / 1000).toFixed(1)
            }, 100)
            Swal.showLoading()
          },
          didClose: () => {
            clearInterval(timerInterval);
            timerInterval = null;
            router.push('/')
          }
        });
      }, 2000);
    }
  }
);
</script>

<template>
  <section class="bg:purple-sub-light w:100vw h:100vh overflow:hidden flex jc:center ai:center p:16 p:32@xs">
    <div class="bg:background-white w:full max-w:screen-3xs h:400 r:8 p:16 p:32@xs">
      <p class="t:center f:24 f:bold fg:text-main p:32|8">請完成兩項登入後進入系統</p>
      <GoogleLogin />
      <div class="h:32"></div>
      <FacebookLogin />
    </div>
  </section>
</template>
