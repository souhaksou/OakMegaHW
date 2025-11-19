<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  setTimeout(() => {
    router.push('/')
  }, 3000);
})
</script>

<template>
  <section class="w:100vw h:100vh bg:background-white flex jc:center ai:center p:16 p:32@xs">
    <div class="t:center">
      <p class="mb:32 fg:purple-sub f:bold f:24 f:32@xs">抱歉，<br class="hidden@xs">你要找的頁面不存在。</p>
      <p class="f:16">3 秒後自動<br class="hidden@xs">返回首頁...</p>
    </div>
  </section>
</template>

<style></style>
