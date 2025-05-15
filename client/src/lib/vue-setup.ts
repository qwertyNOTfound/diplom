import { createApp } from 'vue';
import { createStore } from 'vuex';
import { createRouter, createWebHistory } from 'vue-router';
import { createQueryClient } from './queryClient';

// Store setup
export function setupStore() {
  return createStore({
    state() {
      return {
        user: null,
        isLoading: true,
        error: null,
        toast: {
          show: false,
          message: '',
          type: 'info', // 'info', 'success', 'warning', 'error'
          duration: 3000
        }
      };
    },
    mutations: {
      setUser(state, user) {
        state.user = user;
      },
      setLoading(state, loading) {
        state.isLoading = loading;
      },
      setError(state, error) {
        state.error = error;
      },
      showToast(state, { message, type = 'info', duration = 3000 }) {
        state.toast = {
          show: true,
          message,
          type,
          duration
        };
      },
      hideToast(state) {
        state.toast.show = false;
      }
    },
    actions: {
      async fetchCurrentUser({ commit }) {
        commit('setLoading', true);
        try {
          const response = await fetch('/api/user', {
            credentials: 'include'
          });
          
          if (!response.ok) {
            if (response.status === 401) {
              commit('setUser', null);
              return null;
            }
            throw new Error(`${response.status}: ${response.statusText}`);
          }
          
          const user = await response.json();
          commit('setUser', user);
          return user;
        } catch (error) {
          commit('setError', error.message);
          return null;
        } finally {
          commit('setLoading', false);
        }
      },
      async login({ commit, dispatch }, credentials) {
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials),
            credentials: 'include'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
          }
          
          const user = await response.json();
          commit('setUser', user);
          commit('showToast', {
            message: 'Успішний вхід в систему!',
            type: 'success'
          });
          return user;
        } catch (error) {
          commit('showToast', {
            message: error.message,
            type: 'error'
          });
          throw error;
        }
      },
      async register({ commit }, userData) {
        try {
          const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData),
            credentials: 'include'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
          }
          
          const result = await response.json();
          commit('showToast', {
            message: 'Реєстрація успішна! Перевірте пошту для підтвердження.',
            type: 'success'
          });
          return result;
        } catch (error) {
          commit('showToast', {
            message: error.message,
            type: 'error'
          });
          throw error;
        }
      },
      async verifyEmail({ commit, dispatch }, { userId, code }) {
        try {
          const response = await fetch('/api/verify-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, code }),
            credentials: 'include'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Verification failed');
          }
          
          const user = await response.json();
          commit('setUser', user);
          commit('showToast', {
            message: 'Email успішно підтверджено!',
            type: 'success'
          });
          return user;
        } catch (error) {
          commit('showToast', {
            message: error.message,
            type: 'error'
          });
          throw error;
        }
      },
      async resendVerification({ commit }, email) {
        try {
          const response = await fetch('/api/resend-verification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }),
            credentials: 'include'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to resend verification');
          }
          
          const result = await response.json();
          commit('showToast', {
            message: 'Код підтвердження надіслано повторно!',
            type: 'success'
          });
          return result;
        } catch (error) {
          commit('showToast', {
            message: error.message,
            type: 'error'
          });
          throw error;
        }
      },
      async logout({ commit }) {
        try {
          const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Logout failed');
          }
          
          commit('setUser', null);
          commit('showToast', {
            message: 'Ви вийшли з системи',
            type: 'info'
          });
        } catch (error) {
          commit('showToast', {
            message: error.message,
            type: 'error'
          });
          throw error;
        }
      }
    },
    getters: {
      isAuthenticated(state) {
        return !!state.user;
      },
      isAdmin(state) {
        return state.user && state.user.isAdmin;
      },
      isVerified(state) {
        return state.user && state.user.isVerified;
      }
    }
  });
}

// Router setup
export function setupRouter() {
  const routes = [
    { path: '/', component: () => import('../pages/home-page.vue') },
    { path: '/auth', component: () => import('../pages/auth-page.vue') },
    { path: '/search', component: () => import('../pages/search-page.vue') },
    { path: '/properties/:id', component: () => import('../pages/property-details.vue') },
    { path: '/create-listing', component: () => import('../pages/create-listing.vue'), meta: { requiresAuth: true } },
    { path: '/profile', component: () => import('../pages/user-profile.vue'), meta: { requiresAuth: true } },
    { path: '/admin', component: () => import('../pages/admin-panel.vue'), meta: { requiresAdmin: true } },
    { path: '/:pathMatch(.*)*', component: () => import('../pages/not-found.vue') }
  ];

  const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      } else {
        return { top: 0 };
      }
    }
  });

  // Navigation guards
  router.beforeEach(async (to, from, next) => {
    const store = useStore();
    
    // Fetch user if not already loaded
    if (store.state.isLoading) {
      await store.dispatch('fetchCurrentUser');
    }
    
    const isAuthenticated = store.getters.isAuthenticated;
    const isAdmin = store.getters.isAdmin;
    
    if (to.meta.requiresAuth && !isAuthenticated) {
      next('/auth');
    } else if (to.meta.requiresAdmin && !isAdmin) {
      next('/');
    } else {
      next();
    }
  });

  return router;
}

// Main Vue app setup
export function setupVue() {
  const app = createApp({
    template: '<div id="app"></div>'
  });
  
  const store = setupStore();
  const router = setupRouter();
  const queryClient = createQueryClient();
  
  app.use(store);
  app.use(router);
  
  // Global properties
  app.config.globalProperties.$query = queryClient;
  
  // Global components
  app.component('Button', import('../components/ui/button.vue'));
  app.component('Input', import('../components/ui/input.vue'));
  app.component('Card', import('../components/ui/card.vue'));
  
  return app;
}

// Store access helper
export function useStore() {
  return createStore();
}
