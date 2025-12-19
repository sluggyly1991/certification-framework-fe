<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import axios from "axios";

import {
  BRow,
  BCol,
  BCard,
  BCardHeader,
  BCardBody,
  BProgress
} from "bootstrap-vue-next";

export default {
  name: "TaskSeries",

  data() {
    return {
      loading: true,
      error: null,
      tasks: [],
      searchQuery: "",

      // Filter: "open" | "completed"
      taskFilter: "open"
    };
  },

  async mounted() {
    await this.fetchTasks();
  },

  computed: {
    filteredTasks() {
      return this.tasks.filter(task => {
        // Status-Filter
        if (this.taskFilter === "open" && task.completed) return false;
        if (this.taskFilter === "completed" && !task.completed) return false;

        // Suche
        if (this.searchQuery) {
          const s = this.searchQuery.toLowerCase();
          const match = [task.title, task.description]
              .some(v => String(v || "").toLowerCase().includes(s));
          if (!match) return false;
        }

        return true;
      });
    }
  },

  methods: {
    async fetchTasks() {
      this.loading = true;
      try {
        const res = await axios.get("/tasks/series");
        this.tasks = res.data?.data?.tasks ?? [];
      } catch (e) {
        this.error = e;
      }
      this.loading = false;
    },

    formatDate(ts) {
      if (!ts?.date) return "-";
      return new Date(ts.date).toLocaleString("de-DE");
    },

    // 🔗 Navigation zu Detailseite
    goToTask(task) {
      this.$router.push(`/tasks/series/${task.id}`);
    }
  },

  components: {
    Layout,
    PageHeader,
    BRow,
    BCol,
    BCard,
    BCardHeader,
    BCardBody,
    BProgress
  }
};
</script>

<template>
  <Layout>
    <PageHeader
        title="Aufgaben-Serien"
        :breadcrumbs="[
        { label: 'Dashboard', to: '/' },
        { label: 'Aufgaben', active: true }
      ]"
    />

    <BRow>
      <BCol lg="12">
        <BCard no-body>

          <!-- Header -->
          <BCardHeader class="border-bottom-dashed">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <h5 class="mb-0">Aufgabenübersicht</h5>

              <div class="d-flex align-items-center gap-3">

                <!-- ➕ Neue Aufgabe -->
                <router-link
                    to="/tasks/series/create"
                    class="btn btn-success"
                >
                  <i class="bx bx-plus me-1"></i>
                  Neue Aufgabe erstellen
                </router-link>

                <!-- Filter -->
                <div class="btn-group">
                  <button
                      class="btn"
                      :class="taskFilter === 'open'
        ? 'btn-primary'
        : 'btn-outline-primary'"
                      @click="taskFilter = 'open'"
                  >
                    Nur offene
                  </button>

                  <button
                      class="btn"
                      :class="taskFilter === 'completed'
        ? 'btn-primary'
        : 'btn-outline-primary'"
                      @click="taskFilter = 'completed'"
                  >
                    Erledigte anzeigen
                  </button>
                </div>

                <!-- Suche -->
                <input
                    type="text"
                    class="form-control"
                    style="width: 220px"
                    placeholder="Suchen…"
                    v-model="searchQuery"
                />
              </div>

            </div>
          </BCardHeader>

          <BCardBody>

            <!-- Loading -->
            <div v-if="loading" class="text-center p-5">
              <div class="spinner-border"></div>
            </div>

            <!-- Error -->
            <div v-if="error" class="alert alert-danger">
              Fehler: {{ error.message }}
            </div>

            <!-- Tabelle -->
            <div
                v-if="!loading && filteredTasks.length > 0"
                class="table-responsive table-card"
            >
              <table class="table align-middle table-hover">
                <thead class="table-light text-muted">
                <tr>
                  <th>Titel</th>
                  <th>Beschreibung</th>
                  <th>Fortschritt</th>
                  <th>Status</th>
                  <th>Aktualisiert</th>
                </tr>
                </thead>

                <tbody>
                <tr
                    v-for="task in filteredTasks"
                    :key="task.id"
                    class="clickable-row"
                    @click="goToTask(task)"
                >
                  <td class="fw-semibold">{{ task.title }}</td>

                  <td class="text-muted">
                    {{ task.description }}
                  </td>

                  <td style="width: 180px">
                    <BProgress
                        :value="task.progress"
                        max="100"
                        height="8px"
                    />
                    <small class="text-muted">
                      {{ task.progress }} %
                    </small>
                  </td>

                  <td>
                      <span
                          v-if="task.completed"
                          class="badge bg-success-subtle text-success"
                      >
                        Erledigt
                      </span>
                    <span
                        v-else
                        class="badge bg-warning-subtle text-warning"
                    >
                        Offen
                      </span>
                  </td>

                  <td class="text-muted">
                    {{ formatDate(task.updated) }}
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            <!-- Leer -->
            <div
                v-if="!loading && filteredTasks.length === 0"
                class="text-center p-4"
            >
              <h5>Keine Aufgaben gefunden</h5>
            </div>

          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </Layout>
</template>

<style scoped>
.clickable-row {
  cursor: pointer;
}

.table-hover tbody tr:hover {
  background: rgba(67, 94, 190, 0.08);
}
</style>
