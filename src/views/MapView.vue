<template>
  <div class="p:32 flex jc:center">
    <div ref="mapContainer" class="leaflet-map"></div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted } from 'vue';
import L from 'leaflet';

// 測試資料
import api1 from '@/assets/api1.json';
import api2 from '@/assets/api2.json';

const userPin = ref([25.012222, 121.465556]);

const mapContainer = ref(null);
const map = shallowRef(null);
const initMap = () => {
  map.value = L.map(mapContainer.value, {
    center: userPin.value,
    zoom: 13,
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value);

  const myIcon = L.divIcon({
    className: '',
    html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#6B4BFF" class="bi bi-person-walking" viewBox="0 0 16 16">
    <path d="M9.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M6.44 3.752A.75.75 0 0 1 7 3.5h1.445c.742 0 1.32.643 1.243 1.38l-.43 4.083a1.8 1.8 0 0 1-.088.395l-.318.906.213.242a.8.8 0 0 1 .114.175l2 4.25a.75.75 0 1 1-1.357.638l-1.956-4.154-1.68-1.921A.75.75 0 0 1 6 8.96l.138-2.613-.435.489-.464 2.786a.75.75 0 1 1-1.48-.246l.5-3a.75.75 0 0 1 .18-.375l2-2.25Z"/>
    <path d="M6.25 11.745v-1.418l1.204 1.375.261.524a.8.8 0 0 1-.12.231l-2.5 3.25a.75.75 0 1 1-1.19-.914zm4.22-4.215-.494-.494.205-1.843.006-.067 1.124 1.124h1.44a.75.75 0 0 1 0 1.5H11a.75.75 0 0 1-.531-.22Z"/>
    </svg>
  `,
    iconSize: [32, 42],
    iconAnchor: [16, 42]
  });

  L.marker(userPin.value, { icon: myIcon })
    .addTo(map.value)
    .bindTooltip(`
      <p>google</p><br />
      <p>facebook</p>
    `);
};

const drawMarkers = () => {
  const list = api1.result;

  // 1公里內，最多10筆
  let nearbyList = list
    .filter(item => item.distance <= 1) // 距離內
    .slice(0, 10);                      // 最多十筆

  // 若距離內沒有 → fallback 到前10筆
  if (nearbyList.length === 0) {
    nearbyList = list.slice(0, 10);
  }


  nearbyList.forEach((item) => {
    if (!item.latitude || !item.longitude) return;
    L.marker([item.latitude, item.longitude])
      .addTo(map.value)
      .bindTooltip(`
      <b>${item.stop_name}</b><br />
      ${item.name}<br />
      距離：${item.distance}
    `);
  });
};

const drawPolygon = () => {
  L.geoJSON(api2.result, {
    style: {
      color: "#ff6600",
      weight: 2,
      fillOpacity: 0.25,
    },
  }).addTo(map.value);
};



onMounted(() => {
  initMap();
  drawMarkers();
  drawPolygon();
});
</script>

<style scoped>
.leaflet-map {
  width: 800px;
  height: 600px;
}
</style>
