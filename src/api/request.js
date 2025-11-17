import axios from '@/api/axios';

export const apiRequest = async (method, url, data = {}, config = {}) => {
  try {
    const response = await axios({
      method,
      url,
      data,
      ...config,
    });
    return {
      ok: true,
      data: response,
      error: null
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      error
    };
  }
}
