import VueRouter from 'vue-router';

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '*', component: () => import('@/components/Opener') },
    { path: '/live/:stream', component: () => import('@/components/live/Live') },
  ],
});
