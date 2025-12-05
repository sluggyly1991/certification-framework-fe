import axios from 'axios'
import router from './router'
import store from './store'
import { jwtDecode } from 'jwt-decode'
import appConfig from '../app.config'

axios.defaults.baseURL = appConfig.apiUrl
// ===============================
// Initial Token setzen (Seitenreload)
// ===============================
const token = localStorage.getItem('token')
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// ===============================
// REQUEST INTERCEPTOR
// ===============================
axios.interceptors.request.use((config) => {

    const auth = store.state.auth
    const settings = store.state.userSettings

    // ===============================
    // JWT EXPIRATION CHECK
    // ===============================
    if (auth.token) {
        try {
            const decoded = jwtDecode(auth.token)
            const now = Date.now() / 1000

            if (decoded.exp < now) {
                store.dispatch('auth/logout')
                router.push('/login')
                return Promise.reject('JWT expired')
            }

            config.headers.Authorization = `Bearer ${auth.token}`

        } catch (err) {
            store.dispatch('auth/logout')
            router.push('/login')
            return Promise.reject('Invalid JWT')
        }
    }

    // ===============================
    // DYNAMIC USER SETTINGS HEADERS
    // ===============================
    if (settings.loaded) {
        if (settings.settings?.current_company) {
            config.headers['X-Current-Company'] = settings.settings.current_company
        }

        if (settings.settings?.current_certificate) {
            config.headers['X-Current-Certificate'] = settings.settings.current_certificate
        }

        if (settings.settings?.current_level) {
            config.headers['X-Current-Level'] = settings.settings.current_level
        }
    }

    return config
})

// ===============================
// RESPONSE INTERCEPTOR
// ===============================
axios.interceptors.response.use(
    (response) => {

        console.log(response.headers)
        if (
            response.headers['x-usersettings-reload'] === '1' ||
            response.data?.reload_settings === true
        ) {
            store.commit('userSettings/setNeedsReload', true);
        }

        return response;
    },

    (error) => {
        const jsend = error.response?.data

        // ========== JSend ERROR ==========
        if (jsend?.status === 'error') {
            store.dispatch('toast/show', {
                message: jsend.message || 'Ein Fehler ist aufgetreten',
                type: 'error'
            })
        }

        // ========== JSend FAIL ==========
        if (jsend?.status === 'fail') {
            store.dispatch('toast/show', {
                message: jsend.message || 'Bitte Eingaben prüfen',
                type: 'warning'
            })
        }

        // ========== Unauthorized ==========
        if (error.response?.status === 401) {
            store.dispatch('auth/logout')
            router.push('/login')
        }

        return Promise.reject(error)
    }
)

export default axios
