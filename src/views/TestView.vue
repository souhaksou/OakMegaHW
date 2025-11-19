<script setup>
import Swal from 'sweetalert2';

import theme from '@/assets/theme.json';

const showAlert = () => {
  Swal.fire({
    title: '成功!',
    text: '這是 SweetAlert2 在 Vue3 中的使用範例',
    icon: 'success',
  })
}

</script>

<template>
  <div class="max-w:800 mx:auto">
    <div>color</div>
    <div class="my:16"><button @click="showAlert" class="p:4|8 r:4 b:1|solid|black">showAlert</button></div>
    <div v-for="item in theme" :key="item.name_zh" class="mb:16 flex jc:start ai:center">
      <div class="w:32 h:32 b:1|solid|black" :class="`bg:${item.hex}`"></div>
      <div class="w:16"></div>
      <p>{{ item.name_zh }}</p>
    </div>
  </div>
</template>

<style></style>
