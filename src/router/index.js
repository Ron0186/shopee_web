
import SearchResult from '@/components/SearchResult.vue'
import HelpCenter from '@/views/pages/HelpCenter.vue'
import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'hc-link',
      component: HelpCenter,
    },
    {
      path: '/search',
      name: 'search-link',
      component: SearchResult,
      props: route => ({ query: route.query.q })
    },
    {
      path: '/article/:id',
      name: 'article-link',
      component: HelpCenter,
      props: true
    },
  ],
})

export default router
