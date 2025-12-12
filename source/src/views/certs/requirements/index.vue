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
  BBadge,
  BTabs,
  BTab
} from "bootstrap-vue-next";

export default {
  name: "Requirements",

  data() {
    return {
      loading: true,
      error: null,

      certificate: null,
      description: null,

      requirements: [],
      grouped: {},
      valuesMap: {},

      // Filter states
      filterInput: false,
      filterCompleted: false,
      filterNotValidated: false,
    };
  },

  async mounted() {
    await this.fetchRequirements();
    await this.fetchValues();
  },

  methods: {
    async fetchRequirements() {
      try {
        const res = await axios.get("/requirements");
        const data = res.data.data;

        this.certificate = data.certificate;
        this.description = data.description;
        this.requirements = data.requirements;

        // Gruppierung nach Top-Level (z. B. struktur, versorgung, bericht)
        this.grouped = this.groupByTopLevel(this.requirements);

      } catch (e) {
        this.error = e;
      }
      this.loading = false;
    },

    async fetchValues() {
      try {
        const res = await axios.get("/requirements/values");
        const list = res.data.data.values;

        // Map für schnellen Zugriff
        this.valuesMap = Object.fromEntries(
            list.map(v => [v.key, v])
        );

      } catch (e) {
        console.error("Fehler beim Laden der Values", e);
      }
    },

    groupByTopLevel(list) {
      const groups = {};
      list.forEach(req => {
        const top = req.group.split(".")[0];
        if (!groups[top]) groups[top] = [];
        groups[top].push(req);
      });
      return groups;
    },

    filteredGroup(items) {
      return items.filter(req => {
        const v = this.valuesMap[req.key] || {};

        if (this.filterInput && !req.input) return false;
        if (this.filterCompleted && !v.completed) return false;
        if (this.filterNotValidated && v.validated) return false; // nicht validierte markieren

        return true;
      });
    },

    getTypeIcon(req) {
      if (req.type === "form") return "ri-pencil-line text-primary";
      if (req.type === "upload") return "ri-upload-2-line text-success";
      return "ri-information-line text-muted"; // auto
    },

    goToSingle(req) {
      this.$router.push(`/requirements/${req.key}`);
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
    BBadge,
    BTabs,
    BTab
  }
};
</script>

<template>
  <Layout>
    <PageHeader
        title="Anforderungen"
        :breadcrumbs="[
        { label: 'Dashboard', to: '/' },
        { label: 'Anforderungen', active: true }
      ]"
    />

    <BRow>
      <BCol lg="12">
        <BCard no-body>

          <!-- HEADER -->
          <BCardHeader>
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h4 class="mb-1">{{ certificate }}</h4>
                <p class="text-muted mb-0">{{ description }}</p>
              </div>

              <!-- FILTER -->
              <div class="d-flex align-items-center gap-4">

                <label class="form-check form-switch mb-0">
                  <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="filterInput"
                  >
                  <span class="form-check-label">Nur Eingaben</span>
                </label>

                <label class="form-check form-switch mb-0">
                  <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="filterCompleted"
                  >
                  <span class="form-check-label">Nur Completed</span>
                </label>

                <label class="form-check form-switch mb-0">
                  <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="filterNotValidated"
                  >
                  <span class="form-check-label">Nur nicht validierte</span>
                </label>

              </div>
            </div>
          </BCardHeader>

          <!-- BODY -->
          <BCardBody>

            <div v-if="loading" class="text-center p-5">
              <div class="spinner-border"></div>
            </div>

            <div v-if="error" class="alert alert-danger">
              Fehler beim Laden der Anforderungen.
            </div>

            <!-- TABS -->
            <div v-if="!loading">
              <BTabs nav-class="mb-3" content-class="mt-3" pills justified>

                <BTab
                    v-for="(items, group) in grouped"
                    :key="group"
                >
                  <template #title>
                    {{ group.charAt(0).toUpperCase() + group.slice(1) }}
                    <span class="badge bg-primary ms-2">
                      {{ filteredGroup(items).length }}
                    </span>
                  </template>

                  <!-- REQUIREMENTS in diesem TAB -->
                  <div
                      v-for="req in filteredGroup(items)"
                      :key="req.key"
                      class="p-3 border rounded mb-3 bg-light requirement-card"
                      :class="{ clickable: req.input }"
                      @click="req.input && goToSingle(req)"
                  >

                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="mb-1 d-flex align-items-center">
                          <i :class="getTypeIcon(req)" class="me-2"></i>
                          {{ req.title }}
                        </h6>
                        <p class="text-muted small mb-0">{{ req.description }}</p>
                      </div>
                    </div>

                    <!-- STATUS BADGES -->
                    <div class="mt-2">

                      <BBadge
                          v-if="valuesMap[req.key]?.completed"
                          variant="success"
                          class="me-2"
                      >
                        Completed
                      </BBadge>

                      <BBadge
                          v-if="valuesMap[req.key]?.validated"
                          variant="info"
                      >
                        Validated
                      </BBadge>

                    </div>

                  </div>
                </BTab>

              </BTabs>
            </div>

          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </Layout>
</template>

<style scoped>
.requirement-card.clickable {
  cursor: pointer;
}
.requirement-card.clickable:hover {
  background: #eef3ff;
  border-color: #bfcaff;
}
</style>
