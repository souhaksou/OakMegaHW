<script setup>
import { ref, shallowRef, onMounted } from 'vue';
import L from 'leaflet';
// import { getPolygons } from '@/api/userApi';

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
  }).addTo(map.value);
};

const renderPolygon = () => {
  L.geoJSON(api2.result, {
    style: {
      color: "#ff6600",
      weight: 2,
      fillOpacity: 0.25,
    },
  }).addTo(map.value);
};

onMounted(async () => {
  initMap();
  renderPolygon();

  // const res = await getPolygons({ directory: 'tucheng.json' });
  // console.log('res = ', res);

});
</script>

<template>
  <div class="p:32 flex jc:center">
    <div ref="mapContainer" class="leaflet-map"></div>
  </div>
</template>

<style scoped>
.leaflet-map {
  width: 800px;
  height: 600px;
}
</style>
