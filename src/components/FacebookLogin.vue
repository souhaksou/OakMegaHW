<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const FB_APP_ID = import.meta.env.VITE_FB_ID;

/* --- Pinia --- */
const auth = useAuthStore();

/* --- UI State --- */
const showFacebookButton = ref(false);

/* --- 顯示 FB 按鈕 --- */
const showFacebookButtonHandler = () => {
  showFacebookButton.value = true;
}

/* --- FB Login --- */
const handleFacebookLogin = () => {
  window.FB.login((response) => {
    if (response.status === 'connected') {
      onFacebookLoginSuccess()
    } else {
      alert('Facebook 登入取消或失敗')
    }
  })
}

const onFacebookLoginSuccess = async () => {
  const profile = await fetchFacebookProfile();

  auth.setFacebookUser({
    name: profile.name,
    avatar: profile.avatar
  });

  console.log('Facebook login success:', auth.facebook);
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
    <!-- 自製按鈕 -->
    <div @click="showFacebookButtonHandler">my FB button</div>

    <!-- FB login 按鈕 -->
    <div v-show="showFacebookButton">
      <button @click="handleFacebookLogin">Login with Facebook</button>
    </div>

    <!-- Debug -->
    <pre>{{ auth.facebook }}</pre>
  </div>
</template>
