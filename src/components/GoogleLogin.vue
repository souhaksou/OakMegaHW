<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_ID;

const auth = useAuthStore();

const googleButtonRef = ref(null);
const showGoogleButton = ref(false);

const showGoogleButtonHandler = () => {
  showGoogleButton.value = true;
};

const onGoogleCredentialReceived = (response) => {
  const payload = decodeGoogleJwt(response.credential);
  auth.setGoogleUser({
    name: payload.name,
    avatar: payload.picture
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
    <div @click="showGoogleButtonHandler">my button</div>
    <div ref="googleButtonRef" v-show="showGoogleButton"></div>
  </div>
</template>
