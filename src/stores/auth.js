import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const GOOGLE_DEFAULT_AVATAR = 'GOOGLE_DEFAULT_AVATAR';
const FACEBOOK_DEFAULT_AVATAR = 'FACEBOOK_DEFAULT_AVATAR';

export const useAuthStore = defineStore('auth', () => {

  /* --- Google 狀態物件 --- */
  const google = ref({
    loggedIn: false,
    name: null,
    avatar: null
  });

  /* --- Facebook 狀態物件 --- */
  const facebook = ref({
    loggedIn: false,
    name: null,
    avatar: null
  });

  /* --- 判斷登入完成：Google + FB 都登入 --- */
  const isAuthenticated = computed(() => {
    return google.value.loggedIn && facebook.value.loggedIn;
  });

  /* --- Actions --- */
  const setGoogleUser = ({ name, avatar }) => {
    google.value = {
      loggedIn: true,
      name: name ?? 'Unknown User',
      avatar: avatar || GOOGLE_DEFAULT_AVATAR
    };
  };

  const setFacebookUser = ({ name, avatar }) => {
    facebook.value = {
      loggedIn: true,
      name: name ?? 'Unknown User',
      avatar: avatar || FACEBOOK_DEFAULT_AVATAR
    };
  };

  const logout = () => {
    google.value = { loggedIn: false, name: null, avatar: null };
    facebook.value = { loggedIn: false, name: null, avatar: null };
  };

  return {
    google,
    facebook,
    isAuthenticated,
    setGoogleUser,
    setFacebookUser,
    logout,
  }
}, {
  persist: {
    storage: sessionStorage, // 瀏覽器關閉時自動清除
    key: 'pinia_auth'
  }
});
