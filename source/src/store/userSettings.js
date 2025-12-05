import axios from '../axios'

export default {
    namespaced: true,

    state: {
        settings: {},
        loaded: false,
        needsReload: false
    },

    mutations: {
        SET(state, settings) {
            state.settings = settings
            state.loaded = true
        },
        UPDATE(state, { key, value }) {
            state.settings[key] = value
        },
        setNeedsReload(state, value) {
            state.needsReload = value
        }
    },

    actions: {
        async load({ commit }) {
            const res = await axios.get('/user/settings')
            commit('SET', res.data?.data)
        },

        set({ commit }, { key, value }) {
            commit('UPDATE', { key, value })
        },

        async saveAll({ state }) {
            await axios.post('/user/settings', state.settings)
        }
    }
}
