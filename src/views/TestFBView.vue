<script setup>
import { ref, onMounted } from "vue";

const FB_APP_ID = import.meta.env.VITE_FB_ID;

// const facebookBtn = ref(null);
const facebookBtnShow = ref(false);
const facebookUser = ref(null);

const triggerFacebookBtn = () => {
  facebookBtnShow.value = true;
};

/* --- 初始化 Facebook SDK --- */
const initFacebookSDK = () => {
  // FB SDK 會自動建立 window.FB
  if (!window.FB) return;

  window.FB.init({
    appId: FB_APP_ID,
    cookie: true,
    xfbml: false,
    version: "v19.0",
  });
};

/* --- 觸發 FB 登入 --- */
const loginWithFacebook = () => {
  if (!window.FB) {
    alert("Facebook SDK 尚未載入完成");
    return;
  }

  window.FB.login(
    (response) => {
      if (response.status === "connected") {
        getFacebookUser();
      } else {
        alert("Facebook 登入取消或失敗");
      }
    },
    { scope: "" }
  );
};

const getFacebookUser = () => {
  window.FB.api("/me", { fields: "id,name,picture" }, (res) => {
    facebookUser.value = {
      id: res.id,
      name: res.name,
      avatar: res.picture?.data?.url,
    };
  });
};

onMounted(() => {
  const checkFB = setInterval(() => {
    if (window.FB) {
      clearInterval(checkFB);
      initFacebookSDK();
    }
  }, 300);
});
</script>

<template>
  <div>
    <!-- 觸發按鈕 -->
    <div @click="triggerFacebookBtn">my FB button</div>

    <!-- 真正的 FB login 按鈕（你可自行做 UI） -->
    <div v-show="facebookBtnShow">
      <button @click="loginWithFacebook">Login with Facebook</button>
    </div>

    <!-- 顯示 user 資料 -->
    <pre>{{ facebookUser }}</pre>
  </div>
</template>
