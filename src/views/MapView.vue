<template>
  <div class="p:32 flex jc:center">
    <div ref="mapContainer" class="leaflet-map"></div>
    <br>
  </div>
  <div class="max-w:800 mx:auto flex jc:start ai:center">
    <div>
      <span>距離</span>
      <select v-model="maxDistance" class="mx:8">
        <option :value="1">1</option>
        <option :value="2">2</option>
        <option :value="3">3</option>
      </select>
      <span>km</span>
    </div>
    <div class="w:32"></div>
    <div>
      <span>最多</span>
      <select v-model="maxCount" class="mx:8">
        <option :value="10">10</option>
        <option :value="15">15</option>
        <option :value="20">20</option>
      </select>
      <span>筆</span>
    </div>
    <div class="w:32"></div>
    <button @click="searchData" class="inline-block p:4|8 r:4 b:1|solid|black">
      <i class="f:14 bi bi-person-walking"></i><span class="ml:4">查詢</span>
    </button>
    <div class="w:32"></div>
    <div><input ref="keywordInput" v-model="keyword" type="text" class="inline-block p:4|8 r:4 b:1|solid|black mr:8">
      <button @click="clearKeyword" class="inline-block p:4|8 r:4 b:1|solid|black"><i class="bi bi-x"></i></button>
    </div>
  </div>
  <div class="max-w:800 mx:auto">
    <p>list</p>
    <template v-for="(item, index) in filteredList" :key="item.id">
      <div v-show="paginationShow(index)" @click="highlightMarker(item.id)"
        class="flex jc:space-between ai:center p:4|8 b:1|solid|blue {b:1|solid|red;}.highlight"
        :class="{ highlight: item.id === highlightedId }">
        <p>{{ item.stop_name }}</p>
        <p>{{ item.name }}</p>
        <p>{{ item.distance }} km</p>
      </div>
    </template>
    <div>
      <PaginationControl :length="filteredList.length" :max="max" :show="show" :current="current"
        @current="currentChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, watch, onMounted, onUnmounted } from 'vue';
import L from 'leaflet';
import goldIconImg from '@/assets/images/goldIcon.png';
import PaginationControl from '@/components/PaginationControl.vue';

// 測試資料
import api1 from '@/assets/api1.json';

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
const initializeMap = () => {
  map.value = L.map(mapContainer.value, {
    center: currentPosition.value,
    zoom: 13,
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map.value);

  // 初始化 marker
  currentMarker = L.marker(currentPosition.value, { icon: createUserIcon('#6B4BFF') })
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
    previousMarker = L.marker([...currentPosition.value], { icon: createUserIcon('black') })
      .addTo(map.value)
      .bindTooltip('<p>google</p><br /><p>facebook</p>');
    previousPosition.value = [...currentPosition.value];
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
  currentPosition.value = [lat, lng];
};

// 接受按鈕
const confirmUserPosition = () => {
  if (previousMarker) {
    map.value.removeLayer(previousMarker);
    previousMarker = null;
    previousPosition.value = null;
  }
  console.log(currentPosition.value);
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
const searchData = () => {
  if (!map.value) return;
  const rawData = api1.result;
  list.value = filterData(rawData, maxDistance.value, maxCount.value);
  confirmUserPosition();
  renderMarkers(list.value);
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

onMounted(() => {
  initializeMap();
});

onUnmounted(() => {
  if (map.value) {
    map.value.off('click', handleMapClick);
    map.value.remove(); // 同時移除地圖物件
  }
});

/* 🎨 UI 層（地圖頁、Vue Component）決定實際圖片路徑 在地圖頁（MapView.vue 或 MapPage.vue）
你做： const googleDefaultAvatar = new URL('../assets/google-default.png', import.meta.url).href; 
const facebookDefaultAvatar = new URL('../assets/facebook-default.png', import.meta.url).href; 
然後建立 resolver： const resolveAvatar = (val) =>
 { if (val === 'GOOGLE_DEFAULT_AVATAR') { return googleDefaultAvatar; } 
  if (val === 'FACEBOOK_DEFAULT_AVATAR') { return facebookDefaultAvatar; } return val; // 真實的使用者頭貼 }; 
  // 然後： const googleAvatar = resolveAvatar(auth.google.avatar); 
  // const facebookAvatar = resolveAvatar(auth.facebook.avatar);
  //  🗺 Leaflet Tooltip 用起來就像這樣
  //  const tooltip = <div class="tooltip-container">
  // <img class="avatar" src="${googleAvatar}"
  // > <img class="avatar" src="${facebookAvatar}"> </div> ; 
*/
</script>

<style scoped>
.leaflet-map {
  width: 800px;
  height: 600px;
}
</style>
