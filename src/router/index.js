import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const login = () => import('components/common/login/Login')
const home = () => import('views/home/Home')
const welcome = () => import('views/home/Welcome')
const users = () => import('views/user/User')
const rights = () => import('views/power/Rights')
const roles = () => import('views/power/Roles')
const category = () => import('views/goods/Category')
const list = () => import('views/goods/List')
const params = () => import('views/goods/Params')
const add = () => import('views/goods/Add')
const order = () => import('views/order/Order')

const routes = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: '/login',
    component: login
  },
  {
    path: '/home',
    component: home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: welcome
      },
      {
        path: '/users',
        component: users
      },
      {
        path: '/rights',
        component: rights
      },
      {
        path: '/roles',
        component: roles
      },
      {
        path: '/categories',
        component: category
      },
      {
        path: '/params',
        component: params
      },
      {
        path: '/goods',
        component: list
      },
      {
        path: '/add',
        component: add
      },
      {
        path: '/orders',
        component: order
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
/*导航守卫；对未登录的用户进行拦截*/
router.beforeEach((to, from, next) => {
  //如果用户访问登录页，直接放行
  if (to.path === '/login') return next()
  //如果访问其他页面，需判断token是否存在
  const token = window.sessionStorage.getItem("token")
  //token不存在，跳转到登录页面
  if (token === null) return next('/login')
  else next()
})

export default router
