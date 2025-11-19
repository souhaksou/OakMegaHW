<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';

const FB_APP_ID = import.meta.env.VITE_FB_ID;

/* --- Pinia --- */
const auth = useAuthStore();
const { facebook } = storeToRefs(auth);

/* --- FB Login --- */
const handleFacebookLogin = () => {
  window.FB.login((response) => {
    if (response.status === 'connected') {
      onFacebookLoginSuccess();
    } else {
      Swal.fire({
        title: '失敗!',
        text: 'Facebook 登入取消或失敗',
        icon: 'error',
      });
    }
  })
};

const onFacebookLoginSuccess = async () => {
  const profile = await fetchFacebookProfile();

  auth.setFacebookUser({
    name: profile.name,
    avatar: profile.avatar
  });
  Swal.fire({
    title: '成功!',
    text: `${profile.name} 成功登入`,
    icon: 'success',
    timer: 1000,
    showConfirmButton: false,
  });
};

const initFacebookSdk = (appId) => {
  window.FB.init({
    appId,
    cookie: true,
    xfbml: false,
    version: 'v19.0',
  });
};

const fetchFacebookProfile = () => {
  return new Promise((resolve) => {
    window.FB.api(
      '/me',
      { fields: 'id,name,picture' },
      (res) => {
        resolve({
          id: res.id,
          name: res.name,
          avatar: res.picture?.data?.url,
        });
      }
    );
  });
};

/* --- 初始化 SDK --- */
onMounted(() => {
  const fbCheck = setInterval(() => {
    if (window.FB) {
      clearInterval(fbCheck);
      initFacebookSdk(FB_APP_ID);
    }
  }, 300);
});
</script>

<template>
  <div>
    <p class="fg:text-sub mb:16">Facebook<span v-show="!facebook.loggedIn" class="ml:16 fg:error">（未登入）</span></p>
    <div v-show="!facebook.loggedIn">
      <button @click="handleFacebookLogin" class="inline-block p:8|32 r:4 fg:white bg:#1877F2">登入 Facebook</button>
    </div>
    <p v-show="facebook.loggedIn" class="fg:success">{{ `${facebook.name} 已經成功登入` }}</p>
  </div>
</template>
