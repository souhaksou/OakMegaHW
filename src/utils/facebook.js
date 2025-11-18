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

export { initFacebookSdk, fetchFacebookProfile }