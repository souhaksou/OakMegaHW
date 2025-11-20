<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import Swal from 'sweetalert2';

const router = useRouter();
const auth = useAuthStore();

const logoutAll = () => {
  try {
    auth.logout();
    // 暫時跳過 facebook 登入
    // if (window.FB && window.FB.getLoginStatus) {
    //   window.FB.getLoginStatus(response => {
    //     if (response.status === 'connected') {
    //       window.FB.logout();
    //     }
    //   });
    // }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    setTimeout(() => {
      let timerInterval = null;
      Swal.fire({
        title: '即將登出系統…',
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
          router.push('/login')
        }
      });
    }, 500);
  }
};
</script>

<template>
  <button @click="logoutAll" class="inline-block p:4|8 r:4 abs fixed bottom:16 right:16 fg:white bg:text-sub">
    <i class="bi bi-person-circle"></i><span class="ml:8">登出</span></button>
</template>

<style></style>
