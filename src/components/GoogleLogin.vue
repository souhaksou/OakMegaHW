<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_ID;

const auth = useAuthStore();
const { google } = storeToRefs(auth);

const googleButtonRef = ref(null);

const onGoogleCredentialReceived = (response) => {
  const payload = decodeGoogleJwt(response.credential);
  auth.setGoogleUser({
    name: payload.name,
    avatar: payload.picture
  });
  Swal.fire({
    title: '成功!',
    text: `${payload.name} 成功登入`,
    icon: 'success',
    timer: 1000,
    showConfirmButton: false,
  });
};

const initGoogleSDK = (clientId, callback) => {
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback
  });
};

const decodeGoogleJwt = (jwt) => {
  const base64Url = jwt.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
};

/* --- 等待 window.google ready --- */
onMounted(() => {
  const googleCheck = setInterval(() => {
    if (window.google) {
      clearInterval(googleCheck);

      initGoogleSDK(GOOGLE_CLIENT_ID, onGoogleCredentialReceived);

      window.google.accounts.id.renderButton(
        googleButtonRef.value,
        { theme: 'outline', size: 'large' }
      );
    }
  }, 200);
});
</script>

<template>
  <div>
    <p class="fg:text-sub mb:16"><span>Google</span><span v-show="!google.loggedIn" class="ml:16 fg:error">（未登入）</span>
    </p>
    <div ref="googleButtonRef" v-show="!google.loggedIn"></div>
    <p v-show="google.loggedIn" class="fg:success">{{ `${google.name} 已經成功登入` }}</p>
  </div>
</template>
