<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import axios from "axios";

import {
  BRow,
  BCol,
  BCard,
  BCardBody,
  BBadge
} from "bootstrap-vue-next";

export default {
  name: "TaskSingle",

  data() {
    return {
      loading: true,
      error: null,
      task: null
    };
  },

  async mounted() {
    await this.fetchTask();
  },

  methods: {
    async fetchTask() {
      this.loading = true;
      try {
        const res = await axios.get(`/tasks/${this.$route.params.id}`);
        this.task = res.data?.data?.tasks ?? null;
      } catch (e) {
        this.error = e;
      }
      this.loading = false;
    },

    formatDate(ts) {
      if (!ts?.date) return "-";
      return new Date(ts.date).toLocaleString("de-DE");
    }
  },

  components: {
    Layout,
    PageHeader,
    BRow,
    BCol,
    BCard,
    BCardBody,
    BBadge
  }
};
</script>

<template>
  <Layout>
    <PageHeader
        title="Task Details"
        :breadcrumbs="[
        { label: 'Dashboard', to: '/' },
        { label: 'Aufgaben', to: '/tasks/series' },
        { label: task?.title || 'Details', active: true }
      ]"
    />

    <!-- Loading -->
    <div v-if="loading" class="text-center p-5">
      <div class="spinner-border"></div>
    </div>

    <!-- Error -->
    <div v-if="error" class="alert alert-danger">
      Fehler beim Laden des Tasks.
    </div>

    <!-- CONTENT -->
    <BRow v-if="!loading && task">
      <!-- LEFT COLUMN -->
      <BCol md="4" lg="3">
        <!-- STATUS / META -->
        <BCard no-body class="mb-3">
          <BCardBody>
            <h6 class="card-title mb-3">Task Status</h6>

            <BBadge
                :variant="task.isCompleted ? 'success' : 'warning'"
                class="mb-3"
            >
              {{ task.isCompleted ? 'Erledigt' : 'Offen' }}
            </BBadge>

            <table class="table table-sm mb-0">
              <tbody>
              <tr>
                <td class="fw-medium">Titel</td>
                <td>{{ task.title }}</td>
              </tr>

              <tr v-if="task.requirement">
                <td class="fw-medium">Anforderung</td>
                <td>
                  <router-link
                      :to="`/requirements/${task.requirement}`"
                      class="req-link"
                  >
                    <i class="ri-clipboard-line me-1"></i>
                    {{ task.requirement }}
                  </router-link>
                </td>
              </tr>

              <tr>
                <td class="fw-medium">Erstellt</td>
                <td>{{ formatDate(task.timestamp) }}</td>
              </tr>

              <tr>
                <td class="fw-medium">Aktualisiert</td>
                <td>{{ formatDate(task.updated) }}</td>
              </tr>
              </tbody>
            </table>
          </BCardBody>
        </BCard>

        <!-- ASSIGNMENTS -->
        <BCard no-body>
          <BCardBody>
            <h6 class="card-title mb-3">Zugewiesen an</h6>

            <div
                v-for="(a, i) in task.assignments"
                :key="i"
                class="assignment-row"
            >
              <router-link
                  :to="`/members/${a.member.id}`"
                  class="member-pill"
              >
                <i class="ri-user-3-line me-1"></i>
                {{ a.member.name }}
              </router-link>

              <span
                  class="assignment-status"
                  :class="a.submitDate ? 'done' : 'open'"
              >
                <i
                    :class="a.submitDate
                    ? 'ri-check-line'
                    : 'ri-time-line'"
                ></i>
                {{ a.submitDate ? 'Abgegeben' : 'Offen' }}
              </span>
            </div>

            <div
                v-if="task.assignments.length === 0"
                class="text-muted"
            >
              Keine Zuweisungen vorhanden
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <!-- RIGHT COLUMN -->
      <BCol md="8" lg="9">
        <!-- DESCRIPTION -->
        <BCard no-body class="mb-3">
          <BCardBody>
            <h5 class="mb-3">Beschreibung</h5>
            <p class="text-muted mb-0">
              {{ task.description || 'Keine Beschreibung vorhanden.' }}
            </p>
          </BCardBody>
        </BCard>

        <!-- DOCUMENTS -->
        <BCard
            v-if="task.documents?.length"
            no-body
        >
          <BCardBody>
            <h5 class="mb-3">
              <i class="ri-attachment-2 me-1"></i>
              Dokumente
            </h5>

            <ul class="list-group list-group-flush">
              <li
                  v-for="(doc, i) in task.documents"
                  :key="i"
                  class="list-group-item d-flex justify-content-between align-items-center"
              >
                <a
                    :href="doc.url"
                    target="_blank"
                    class="doc-link"
                >
                  <i class="ri-file-line me-2"></i>
                  {{ doc.name }}
                </a>
                <i class="ri-external-link-line text-muted"></i>
              </li>
            </ul>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </Layout>
</template>

<style scoped>
/* Requirement */
.req-link {
  color: #405189;
  font-weight: 500;
  text-decoration: none;
}
.req-link:hover {
  text-decoration: underline;
}

/* Assignments */
.assignment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.member-pill {
  background: #f3f6f9;
  border-radius: 20px;
  padding: 6px 14px;
  font-weight: 500;
  color: #212529;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.member-pill:hover {
  background: #e9edf2;
}

.assignment-status {
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.assignment-status.done {
  color: #198754;
}
.assignment-status.open {
  color: #6c757d;
}

/* Documents */
.doc-link {
  color: #212529;
  text-decoration: none;
  font-weight: 500;
}
.doc-link:hover {
  text-decoration: underline;
}
</style>
