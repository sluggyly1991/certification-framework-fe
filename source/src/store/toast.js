export default {
    namespaced: true,

    state: {
        type: null,
        message: null,
    },

    mutations: {
        SET_SUCCESS(state, message) {
            state.type = 'success';
            state.message = message;
        },

        SET_ERROR(state, message) {
            state.type = 'error';
            state.message = message;
        },

        CLEAR(state) {
            state.type = null;
            state.message = null;
        }
    },

    actions: {
        success({ commit }, message) {
            commit('SET_SUCCESS', message);
        },

        error({ commit }, message) {
            commit('SET_ERROR', message);
        },

        clear({ commit }) {
            commit('CLEAR');
        }
    }
}
