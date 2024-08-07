import GameView from '@/views/GameView.vue'
import ReviewView from '@/views/ReviewView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    }, {
      path: '/game/:id',
      component: GameView,
    }, {
      path: '/review/:id',
      component: ReviewView,
    }
  ]
})

export default router
