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

export { initGoogleSDK, decodeGoogleJwt }