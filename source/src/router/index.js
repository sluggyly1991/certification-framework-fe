import { createWebHistory, createRouter } from "vue-router";
import routes from "./routes";
import appConfig from "../../app.config";
import store from "../store";

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        return savedPosition || { top: 0 }
    },
});

// ============================================================
// Helper – lädt UserSettings nur einmal
// ============================================================
let settingsLoading = null

async function ensureSettingsLoaded() {
    if (store.state.userSettings.loaded) return true

    if (!settingsLoading) {
        settingsLoading = store.dispatch("userSettings/load")
            .catch(() => {})
            .finally(() => settingsLoading = null)
    }

    return settingsLoading
}

// ============================================================
// GLOBAL AUTH + SETTINGS GUARD
// ============================================================
router.beforeEach(async (to, from, next) => {
    const isAuthenticated = store.getters["auth/isAuthenticated"];

    // 1) Guest routes blockieren
    if (to.meta.guest && isAuthenticated) {
        return next({ name: "dashboard-home" });
    }

    // 2) Auth-required routes
    if (to.meta.authRequired) {

        // Wenn NICHT eingeloggt: redirect login
        if (!isAuthenticated) {
            return next({
                name: "login",
                query: { redirectFrom: to.fullPath }
            });
        }

        // 🚀 NEU:
        // Wenn Settings fehlen → erst laden → dann weiter
        if (!store.state.userSettings.loaded) {
            await ensureSettingsLoaded()
        }
    }

    next();
});

// ============================================================
// TITLE HANDLER
// ============================================================
router.beforeResolve((to, from, next) => {
    document.title = `${to.meta.title} | ${appConfig.title}`;
    next();
});

export default router;
