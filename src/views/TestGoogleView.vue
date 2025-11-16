<script setup>
import { ref, onMounted } from "vue";

const GoogleID = import.meta.env.VITE_GOOGLE_ID;

const googleBtn = ref(null);
const googleBtnShow = ref(false);
const triggerGoogleBtn = () => {
  googleBtnShow.value = true;
};

const googleUser = ref(null);

const handleCredentialResponse = (response) => {
  console.log("Google Credential Response:", response);

  const base64Url = response.credential.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  const payload = JSON.parse(jsonPayload);
  googleUser.value = {
    name: payload.name,
    avatar: payload.picture
  };

  console.log("Google User:", googleUser.value);
}

onMounted(() => {
  /* global google */
  google.accounts.id.initialize({
    client_id: GoogleID,
    callback: handleCredentialResponse
  });
  google.accounts.id.renderButton(
    googleBtn.value,
    { theme: "outline", size: "large" }
  );
});
</script>

<template>
  <div>
    <div @click="triggerGoogleBtn">my button</div>
    <div ref="googleBtn" v-show="googleBtnShow"></div>
    <pre>{{ googleUser }}</pre>
  </div>
</template>
