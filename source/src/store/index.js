import { createStore } from 'vuex'

import auth from './auth'
import userSettings from './userSettings'
import layout from './layout'
import toast from './toast'

export default createStore({
    modules: {
        auth,
        userSettings,
        layout,
        toast
    }
})
