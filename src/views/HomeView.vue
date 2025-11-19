<script setup>
import { ref, shallowRef, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';

import L from 'leaflet';
import goldIconImg from '@/assets/images/goldIcon.png';
import PaginationControl from '@/components/PaginationControl.vue';
import LogoutControl from '@/components/LogoutControl.vue';

const auth = useAuthStore();

// api
import { calculateDistance, getPolygons } from '@/api/userApi';

// Marker
let currentMarker = null;
let previousMarker = null;
// 座標
const currentPosition = ref([25.012222, 121.465556]);
const previousPosition = ref(null);

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
let googleBlobUrl = null;
let facebookBlobUrl = null;
const initializeMap = async () => {
  map.value = L.map(mapContainer.value, {
    center: currentPosition.value,
    zoom: 13,
  });
  const primaryUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const backupUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  let tileLayer = L.tileLayer(primaryUrl, { maxZoom: 19 }).addTo(map.value);
  tileLayer.on('tileerror', (errorEvent) => {
    console.error(errorEvent, '主要背景載入失敗，切換到備用背景');
    // 移除原來的 TileLayer
    map.value.removeLayer(tileLayer);
    // 加上備用 TileLayer
    tileLayer = L.tileLayer(backupUrl, { maxZoom: 19 }).addTo(map.value);
  });

  googleBlobUrl = await loadImageToBlobURL(auth.google.avatar);
  facebookBlobUrl = await loadImageToBlobURL(auth.facebook.avatar);
  if (googleBlobUrl === 'default') {
    googleBlobUrl = new URL('../assets/images/defaultGoogle.svg', import.meta.url).href;
  }
  if (facebookBlobUrl === 'default') {
    facebookBlobUrl = new URL('../assets/images/defaultFacebook.svg', import.meta.url).href;
  }

  currentMarker = L.marker(currentPosition.value, { icon: createUserIcon('#5D38DF') })
    .addTo(map.value)
    .bindTooltip(`
    <div class="w:72 r:4 flex jc:space-between ai:center">
    <img class="inline-block r:50% w:32 h:32" src="" id="dynamic-google-avatar" alt="google avatar"/>
    <div class="w:8"></div>
    <img class="inline-block r:50% w:32 h:32" src="" id="dynamic-facebook-avatar" alt="facebook avatar"/>
    </div>
    `, {
      direction: 'top',
      offset: [0, -60]
    });
  // 監聽 tooltipopen 事件
  currentMarker.on('tooltipopen', (e) => {
    const tooltipEl = e.tooltip.getElement();
    const googleImg = tooltipEl.querySelector('#dynamic-google-avatar');
    const fbImg = tooltipEl.querySelector('#dynamic-facebook-avatar');
    if (googleImg) {
      googleImg.src = googleBlobUrl;
    }
    if (fbImg) {
      fbImg.src = facebookBlobUrl;
    }
  });

  map.value.on('click', handleMapClick);
};

const loadImageToBlobURL = async (downloadUrl) => {
  try {
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    // 檢查 MIME type 是否為圖片
    if (!blob.type.startsWith('image/')) {
      console.error('Fetched blob is not an image:', blob.type);
      return 'default'
    }
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error loading image:', error);
    return 'default';
  }
};

// 點擊地圖處理
const handleMapClick = (e) => {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  // 1. 如果還沒有舊 marker，產生舊 marker
  if (!previousMarker && currentMarker) {
    previousMarker = L.marker([...currentPosition.value], { icon: createUserIcon('gray') })
      .addTo(map.value)
      .bindTooltip('<p>上一個位置</p>', {
        direction: 'top',
        offset: [0, -20]
      });
    previousPosition.value = [...currentPosition.value];
  }

  // 2. 移動 marker 到新位置
  if (currentMarker) {
    currentMarker.setLatLng([lat, lng]);
  } else {
    currentMarker = L.marker([lat, lng], { icon: createUserIcon('#5D38DF') })
      .addTo(map.value)
      .bindTooltip('<p>google</p><br /><p>facebook</p>');
  }

  // 3. 更新最新座標
  currentPosition.value = [lat, lng];
};

// 接受按鈕
const confirmUserPosition = () => {
  if (previousMarker) {
    map.value.removeLayer(previousMarker);
    previousMarker = null;
    previousPosition.value = null;
  }
  map.value.panTo([...currentPosition.value]);
};

const list = ref([]);
let markers = [];
const highlightIcon = L.icon({
  iconUrl: goldIconImg,
  iconSize: [27, 44],   // 輕微放大版
  iconAnchor: [13, 44], // anchor 也要跟著調整
});
const highlightedId = ref(null);
const renderMarkers = (list) => {
  // 先清除舊的 markers
  markers.forEach(marker => {
    map.value.removeLayer(marker); // 移除舊 marker
  });
  markers = []; // 清空陣列
  list.forEach((item) => {
    if (item.latitude == null || item.longitude == null) return;
    const marker = L.marker([item.latitude, item.longitude])
      .addTo(map.value)
      .bindTooltip(`
      <b>${item.stop_name}</b><br />
      ${item.name}<br />
      距離：${item.distance}
    `);
    marker._originalIcon = marker.options.icon;
    marker.itemId = item.id;
    marker.on('click', () => {
      highlightedId.value = marker.itemId;
      const targetIndex = filteredList.value.findIndex(l => l.id === marker.itemId);
      if (targetIndex !== -1) {
        const page = Math.floor(targetIndex / show) + 1;
        currentChange(page);
      }
      // 1 秒後取消 highlight
      setTimeout(() => { highlightedId.value = null; }, 1000);
    });
    markers.push(marker);
  });
};

const maxDistance = ref(1.0);
const maxCount = ref(10);
const searchData = async () => {
  if (!map.value) return;
  const [lat, lng] = currentPosition.value;
  const res = await calculateDistance({ lat, lng });
  if (res.ok) {
    const rawData = res.data.result;
    list.value = filterData(rawData, maxDistance.value, maxCount.value);
    confirmUserPosition();
    renderMarkers(list.value);
  } else {
    Swal.fire({
      title: '錯誤',
      text: '附近的都更地點資料取得失敗',
      icon: 'error',
    });
  }
};
const filterData = (data, maxDistance = 1, maxCount = 10) => {
  // 過濾距離
  let nearbyList = data
    .filter(item => item.distance <= maxDistance)
    .slice(0, maxCount);
  // 若指定距離內沒有任何資料 → fallback 前 N 筆
  if (nearbyList.length === 0) {
    nearbyList = data.slice(0, maxCount);
  }
  return nearbyList;
};

const keyword = ref('');
const keywordInput = ref(null);
const clearKeyword = () => {
  keyword.value = '';
  keywordInput.value.focus();
};
const filteredList = computed(() => {
  return list.value.filter(item => item.stop_name.toLowerCase().includes(keyword.value.toLowerCase()));
});
watch(filteredList, () => {
  currentChange(1);
});

const show = 5;
const max = computed(() => {
  return Math.ceil(filteredList.value.length / show);
});
const current = ref(1);
const currentChange = (value) => {
  current.value = value;
};
const paginationShow = (num) => {
  if (num < current.value * show && num >= (current.value - 1) * show) {
    return true;
  }
  else {
    return false;
  }
};

const highlightMarker = (id) => {
  const target = markers.find(m => m.itemId === id);
  if (!target) return;

  // 移動地圖到該 marker
  map.value.setView(target.getLatLng());

  // 換成你匯入的黃色 icon
  target.setIcon(highlightIcon);

  // 1 秒後換回原本的（預設藍色那顆）
  setTimeout(() => {
    if (target._originalIcon) {
      target.setIcon(target._originalIcon);
    }
  }, 1000);
};

const renderPolygon = async () => {
  const res = await getPolygons({ directory: 'tucheng.json' });
  if (res.ok) {
    L.geoJSON(res.data.result, {
      style: {
        color: "#ff6600",
        weight: 2,
        fillOpacity: 0.25,
      },
    }).addTo(map.value);
  } else {
    Swal.fire({
      title: '錯誤',
      text: '都更地點 Polygon 資料取得失敗',
      icon: 'error',
    });
  }
};

onMounted(async () => {
  await nextTick();
  await initializeMap();
  await renderPolygon();
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
  if (googleBlobUrl) URL.revokeObjectURL(googleBlobUrl);
  if (facebookBlobUrl) URL.revokeObjectURL(facebookBlobUrl);
});
</script>

<template>
  <section class="rel w:100vw min-h:100vh bg:background-white p:16 p:32@xs">
    <div class="w:full max-w:screen-sm mx:auto">
      <div ref="mapContainer" class="leaflet-map"></div>
      <div class="w:full flex jc:start ai:center my:16 grid-cols:1 gap:16 {grid-cols:2;gap:32;}@xs">
        <div class="flex jc:space-between ai:center">
          <div class="fg:text-main">
            <span>距離</span>
            <select v-model="maxDistance" class="mx:8">
              <option :value="1">1</option>
              <option :value="2">2</option>
              <option :value="3">3</option>
            </select>
            <span>km</span>
            <span class="inline-block w:32"></span>
            <span>最多</span>
            <select v-model="maxCount" class="mx:8">
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="20">20</option>
            </select>
            <span>筆</span>
          </div>
          <button @click="searchData" class="inline-block p:4|8 r:4 fg:white bg:purple-sub b:1|solid|purple-sub
          ~duration:400ms {fg:purple-sub;bg:white;}:hover">
            <i class="f:14 bi bi-person-walking"></i><span class="ml:4">查詢</span>
          </button>
        </div>
        <div class="flex jc:end ai:center rel">
          <input ref="keywordInput" v-model="keyword" type="text" placeholder="請輸入要查詢的站名"
            class="inline-block w:full max-w:400 p:8|16 r:4 b:1|solid|text-sub bg:soft max-w:320@xs">
          <button @click="clearKeyword"
            class="inline-block p:4|8 r:4 abs top:50% right:4 translateY(-50%) fg:white bg:error"><i
              class="bi bi-x"></i></button>
        </div>
      </div>
      <div class="mb:16">
        <PaginationControl :length="filteredList.length" :max="max" :show="show" :current="current"
          @current="currentChange" />
      </div>
      <div class="overflow-x:auto">
        <table class="w:full white-space:nowrap">
          <thead>
            <tr class="f:18 fg:text-main bg:purple-sub-light {t:start;p:4|8;}>th">
              <th>站名</th>
              <th>名稱</th>
              <th>距離</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(item, index) in filteredList" :key="item.id">
              <tr v-show="paginationShow(index)" @click="highlightMarker(item.id)"
                class="cursor:pointer {p:4|8;bb:1|solid|gray;}>td ~duration:400ms; {bg:orange-light;}:hover {bg:orange-main;}.highlight"
                :class="{ highlight: item.id === highlightedId }">
                <td>{{ item.stop_name }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.distance }} km</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
    <LogoutControl />
  </section>
</template>

<style scoped>
.leaflet-map {
  width: 100%;
  height: 360px;
}

@media (min-width: 768px) {
  .leaflet-map {
    height: 560px;
  }
}
</style>
