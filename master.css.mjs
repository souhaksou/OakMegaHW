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
  // components: {
  //     btn: {
  //         '': 'inline-flex p:4|8 r:4 b:1|solid|black',
  //     }
  // }
}
