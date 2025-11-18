import { apiRequest } from '@/api/request';

// 取得附近的都更地點
const calculateDistance = (data) => {
  return apiRequest('post', '/calc-distance', data);
};

// 查詢都更地點Polygon
const getPolygons = (query = {}) => {
  return apiRequest('get', '/geolocation-json', {}, { params: query });
};

export { calculateDistance, getPolygons }