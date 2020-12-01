import { createRouter, createWebHistory } from 'vue-router'
// import Home from '@/pages/Home.vue'
import NotFound from '@/pages/NotFound.vue'

const routes = [
  { // Non authorized pages
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "guest" */ './pages/Home.vue')
  }, {
    path: '/bundles',
    name: 'Bundles',
    component: () => import(/* webpackChunkName: "guest" */ './pages/Bundles.vue')
  }, {
    path: '/people',
    name: 'People',
    component: () => import(/* webpackChunkName: "guest" */ './pages/People.vue')
  }, {
    path: '/instagram',
    name: 'Instagram',
    component: () => import(/* webpackChunkName: "guest" */ './pages/Instagram.vue')
  }, {
    path: '/support',
    name: 'Support',
    component: () => import(/* webpackChunkName: "guest" */ './pages/Support.vue')
  }, {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "guest" */ './pages/About.vue')
  }, {
    path: '/login',
    name: 'LogIn',
    component: () => import(/* webpackChunkName: "guest" */ './pages/LogIn.vue')
  }, {
    path: '/password-reset',
    name: 'PasswordReset',
    component: () => import(/* webpackChunkName: "guest" */ './pages/PasswordReset.vue')
  }, {
    path: '/register',
    name: 'Register',
    component: () => import(/* webpackChunkName: "guest" */ './pages/Register.vue')
  }, { // User authorized paged
    path: '/profile',
    name: 'Profile',
    component: () => import(/* webpackChunkName: "user" */ './pages/Profile.vue'),
    meta: {
      access: 'authorized'
    }
  }, {
    path: '/suggest/book',
    name: 'BookSuggest',
    component: () => import(/* webpackChunkName: "user" */ './pages/BookSuggestionForm.vue'),
    meta: {
      access: 'authorized'
    }
  }, {
    path: '/logout',
    name: 'LogOut',
    component: () => import(/* webpackChunkName: "user" */ './pages/LogOut.vue')
  }, { // Admin pages
    path: '/tags-manager',
    name: 'TagsManager',
    component: () => import(/* webpackChunkName: "admin" */ './pages/TagsManager.vue'),
    meta: {
      access: 'superadmin'
    }
  }, {
    path: '/admin/people',
    name: 'PeopleManager',
    component: () => import(/* webpackChunkName: "admin" */ './pages/PeopleManagerList.vue'),
    meta: {
      access: 'superadmin'
    }
  }, {
    path: '/admin/people/add',
    name: 'PeopleManagerAddForm',
    component: () => import(/* webpackChunkName: "admin" */ './pages/PersonManagerForm.vue'),
    meta: {
      access: 'superadmin'
    }
  }, {
    path: '/admin/people/update/:uid',
    name: 'PersonManagerUpdateForm',
    component: () => import(/* webpackChunkName: "admin" */ './pages/PersonManagerForm.vue'),
    meta: {
      access: 'superadmin'
    }
  }, {
    path: '/admin/books',
    name: 'BooksManager',
    component: () => import(/* webpackChunkName: "admin" */ './pages/BooksManagerList.vue'),
    meta: {
      access: 'superadmin'
    }
  }, {
    path: '/admin/books/update/:bid',
    name: 'BookManagerUpdateForm',
    component: () => import(/* webpackChunkName: "admin" */ './pages/BookManagerForm.vue'),
    meta: {
      access: 'superadmin'
    }
  }, {
    path: '/admin/books/add',
    name: 'BookManagerAddForm',
    component: () => import(/* webpackChunkName: "admin" */ './pages/BookManagerForm.vue'),
    meta: {
      access: 'superadmin'
    }
  }, {
    path: '/admin/bundles',
    name: 'BundlesManager',
    component: () => import(/* webpackChunkName: "admin" */ './pages/BundleManagerList.vue'),
    meta: {
      access: 'superadmin'
    }
  }, {
    path: '/admin/bundles/update/:bid',
    name: 'BundleManagerUpdateForm',
    component: () => import(/* webpackChunkName: "admin" */ './pages/BundleManagerForm.vue'),
    meta: {
      access: 'superadmin'
    }
  }, {
    path: '/admin/bundles/add',
    name: 'BundleManagerNewForm',
    component: () => import(/* webpackChunkName: "admin" */ './pages/BundleManagerForm.vue'),
    meta: {
      access: 'superadmin'
    }
  }, {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFound,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
