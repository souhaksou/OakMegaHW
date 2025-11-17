<template>
  <div class="p:32 flex jc:center">
    <div ref="mapContainer" class="leaflet-map"></div>
    <br>
  </div>
  <div class="max-w:800 mx:auto flex jc:start ai:center">
    <button @click="acceptLocation" class="inline-block p:4|8 r:4 b:1|solid|black">
      <i class="f:14 bi bi-person-walking"></i><span class="ml:4">移動</span>
    </button>
    <div class="w:32"></div>
    <div>
      <span>距離</span>
      <select v-model="maxDistance" class="mx:8">
        <option :value="1.0">1.0</option>
        <option :value="1.5">1.5</option>
        <option :value="2.0">2.0</option>
      </select>
      <span>km</span>
    </div>
    <div class="w:32"></div>
    <div>
      <span>顯示</span>
      <select v-model="maxCount" class="mx:8">
        <option :value="10">10</option>
        <option :value="15">15</option>
        <option :value="20">20</option>
      </select>
      <span>筆</span>
    </div>
    <div class="w:32"></div>
    <div><input type="text" class="inline-block p:4|8 r:4 b:1|solid|black mr:8">
      <button class="inline-block p:4|8 r:4 b:1|solid|black"><i class="bi bi-search"></i></button>
    </div>
  </div>
  <div>
    <p>list</p>
    <div v-for="(item, index) in filterData" :key="item.id">
      <p><span>第 {{ index }} 項</span>{{ item }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, onUnmounted } from 'vue';
import L from 'leaflet';

// 測試資料
import api1 from '@/assets/api1.json';

// Marker
let currentMarker = null;
let previousMarker = null;

// 座標
const currentPin = ref([25.012222, 121.465556]);
const previousPin = ref(null);

// 建立 icon
const createUserIcon = (color) => {
  return L.divIcon({
    className: '',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="${color}" class="bi bi-person-walking" viewBox="0 0 16 16">
      <path d="M9.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M6.44 3.752A.75.75 0 0 1 7 3.5h1.445c.742 0 1.32.643 1.243 1.38l-.43 4.083a1.8 1.8 0 0 1-.088.395l-.318.906.213.242a.8.8 0 0 1 .114.175l2 4.25a.75.75 0 1 1-1.357.638l-1.956-4.154-1.68-1.921A.75.75 0 0 1 6 8.96l.138-2.613-.435.489-.464 2.786a.75.75 0 1 1-1.48-.246l.5-3a.75.75 0 0 1 .18-.375l2-2.25Z"/>
      <path d="M6.25 11.745v-1.418l1.204 1.375.261.524a.8.8 0 0 1-.12.231l-2.5 3.25a.75.75 0 1 1-1.19-.914zm4.22-4.215-.494-.494.205-1.843.006-.067 1.124 1.124h1.44a.75.75 0 0 1 0 1.5H11a.75.75 0 0 1-.531-.22Z"/>
      </svg>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42]
  });
};

const mapContainer = ref(null);
const map = shallowRef(null);
const initMap = () => {
  map.value = L.map(mapContainer.value, {
    center: currentPin.value,
    zoom: 13,
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map.value);

  // 初始化 marker
  currentMarker = L.marker(currentPin.value, { icon: createUserIcon('#6B4BFF') })
    .addTo(map.value)
    .bindTooltip('<p>google</p><br /><p>facebook</p>');

  map.value.on('click', handleMapClick);
};

// 點擊地圖處理
const handleMapClick = (e) => {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  // 1. 如果還沒有舊 marker，產生舊 marker
  if (!previousMarker && currentMarker) {
    previousMarker = L.marker([...currentPin.value], { icon: createUserIcon('black') })
      .addTo(map.value)
      .bindTooltip('<p>google</p><br /><p>facebook</p>');
    previousPin.value = [...currentPin.value];
  }

  // 2. 移動 marker 到新位置
  if (currentMarker) {
    currentMarker.setLatLng([lat, lng]);
  } else {
    currentMarker = L.marker([lat, lng], { icon: createUserIcon('#6B4BFF') })
      .addTo(map.value)
      .bindTooltip('<p>google</p><br /><p>facebook</p>');
  }

  // 3. 更新最新座標
  currentPin.value = [lat, lng];
};

// 接受按鈕
const acceptLocation = () => {
  if (previousMarker) {
    map.value.removeLayer(previousMarker);
    previousMarker = null;
    previousPin.value = null;
  }
  console.log(currentPin.value);
  map.value.panTo([...currentPin.value]);
  drawMarkers(JSON.parse(JSON.stringify(filterData.value)));
};

const list = ref([]);
let markers = [];
const drawMarkers = (list) => {
  // 先清除舊的 markers
  markers.forEach(marker => {
    map.value.removeLayer(marker); // 移除舊 marker
  });
  markers = []; // 清空陣列
  list.forEach((item) => {
    if (!item.latitude || !item.longitude) return;
    const marker = L.marker([item.latitude, item.longitude])
      .addTo(map.value)
      .bindTooltip(`
      <b>${item.stop_name}</b><br />
      ${item.name}<br />
      距離：${item.distance}
    `);
    // 把新 marker 存入 markers 陣列
    markers.push(marker);
  });
};

const maxDistance = ref(1.0);
const maxCount = ref(10);

const filterData = computed(() => {
  const temp = JSON.parse(JSON.stringify(list.value));
  // 過濾距離
  let nearbyList = temp
    .filter(item => item.distance <= maxDistance.value)
    .slice(0, maxCount.value);
  // 若指定距離內沒有任何資料 → fallback 前 N 筆
  if (nearbyList.length === 0) {
    nearbyList = temp.slice(0, maxCount.value);
  }
  return nearbyList.map(({ id, stop_name, name, longitude, latitude, distance }) =>
    ({ id, stop_name, name, longitude, latitude, distance })
  );
});
// const filterData = (data, maxDistance = 1, maxCount = 10) => {
//   // 過濾距離
//   let nearbyList = data
//     .filter(item => item.distance <= maxDistance)
//     .slice(0, maxCount);

//   // 若指定距離內沒有任何資料 → fallback 前 N 筆
//   if (nearbyList.length === 0) {
//     nearbyList = data.slice(0, maxCount);
//   }
//   return nearbyList;
// };

onMounted(() => {
  initMap();
  const rawData = api1.result;
  list.value = rawData;
});

onUnmounted(() => {
  if (map.value) {
    map.value.off('click', handleMapClick);
    map.value.remove(); // 同時移除地圖物件
  }
});

</script>

<style scoped>
.leaflet-map {
  width: 800px;
  height: 600px;
}
</style>
