import theme from '@/assets/theme.json';

const colors = {};
theme.forEach(item => {
  colors[item.name_en] = item.hex;
});

/** @type {import('@master/css').Config} */
export default {
  variables: {
    color: colors
  }
}
