import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

instance.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default instance;
