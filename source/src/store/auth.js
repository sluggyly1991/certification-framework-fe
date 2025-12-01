import axios from '../axios'
import router from '../router'

export default {
    namespaced: true,

    state: {
        token: localStorage.getItem('token') || null,
        user: null,
    },

    // 🟢 WICHTIG: Getter für den Router-Guard
    getters: {
        isAuthenticated(state) {
            return !!state.token
        },
        user(state) {
            return state.user
        }
    },

    mutations: {
        SET_TOKEN(state, token) {
            state.token = token
            localStorage.setItem('token', token)
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        },
        SET_USER(state, user) {
            state.user = user
        },
        LOGOUT(state) {
            state.token = null
            state.user = null
            localStorage.removeItem('token')
            delete axios.defaults.headers.common['Authorization']
        }
    },

    actions: {
        async login({ commit, dispatch }, { email, password }) {
            const res = await axios.post('/login', { email, password })

            const token = res.data?.data?.token
            if (!token) throw new Error('Token missing in response')

            commit('SET_TOKEN', token)

            // User + Settings laden – aber Login nicht abbrechen, falls das schiefgeht
            try {
                await dispatch('fetchUser')
                await dispatch('userSettings/load', null, { root: true })
            } catch (e) {
                console.warn('Could not fetch user/settings, continuing anyway …', e)
            }

            // damit dein login.vue schön darauf warten kann
            return true
        },

        async fetchUser({ commit }) {
            const res = await axios.get('/me')   // → baseURL + '/me' = https://certs.ddev.site/api/me
            commit('SET_USER', res.data?.data)
        },

        logout({ commit, dispatch }) {
            commit('LOGOUT')
            router.push('/login')

            dispatch('toast/show', {
                message: 'Erfolgreich abgemeldet',
                type: 'info'
            }, { root: true })
        }
    }
}
