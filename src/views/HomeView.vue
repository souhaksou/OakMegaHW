<template>
  <div class="map-container">
    <!-- Leaflet 地圖容器 -->
    <div id="map" class="leaflet-map"></div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import L from "leaflet";

onMounted(() => {
  // 1️⃣ 初始化地圖（座標：台北；Zoom 13）
  const map = L.map("map").setView([25.012222, 121.465556], 13);

  // 2️⃣ 設定底圖（OpenStreetMap）
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);
  L.marker([24.972663, 121.443671]).addTo(map);

  // 3️⃣ 畫一個 polygon（示範用）
  // const polygonCoords = [
  //   [25.033964, 121.564468],
  //   [25.035, 121.568],
  //   [25.032, 121.57],
  //   [25.03, 121.565],
  // ];

  // L.polygon(polygonCoords, {
  //   color: "red",
  //   fillColor: "#f03",
  //   fillOpacity: 0.3,
  // }).addTo(map);
});
</script>

<style scoped>
/* 🚨 地圖一定要給高度，否則不會顯示 */
.leaflet-map {
  width: 400px;
  height: 400px;
  /* 直接佔滿整個畫面 */
}
</style>
