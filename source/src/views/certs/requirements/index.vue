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
      activeLevel: null,

      requirements: [],
      grouped: {},

      values: [],
      valuesMap: {}, // Map für schnellen Zugriff auf completed/validated
    };
  },

  async mounted() {
    await this.fetchRequirements();
    await this.fetchValues();
  },

  methods: {
    /** Lade die Stammdaten der Anforderungen */
    async fetchRequirements() {
      this.loading = true;
      try {
        const res = await axios.get("/requirements");
        const data = res.data.data;

        this.certificate = data.certificate;
        this.description = data.description;
        this.activeLevel = data.active_level;
        this.requirements = data.requirements;

        // Gruppiert nach "struktur", "versorgung", "bericht" usw.
        this.grouped = this.groupByTopLevel(this.requirements);
      } catch (e) {
        this.error = e;
      }
      this.loading = false;
    },

    /** Lade die gespeicherten Werte der Anforderungen */
    async fetchValues() {
      try {
        const res = await axios.get("/requirements/values");
        this.values = res.data.data.values;

        // Map: { netz_name: {...}, therapiekoordination: {...} }
        this.valuesMap = Object.fromEntries(
            this.values.map(v => [v.key, v])
        );
      } catch (e) {
        console.error("Fehler beim Laden der Values", e);
      }
    },

    /** Gruppierung nach dem ersten Punkt von group */
    groupByTopLevel(list) {
      const groups = {};
      list.forEach(req => {
        const top = req.group.split(".")[0]; // "struktur", "versorgung", ...
        if (!groups[top]) groups[top] = [];
        groups[top].push(req);
      });
      return groups;
    },

    /** Icon passend zum Requirement-Typ */
    getTypeIcon(req) {
      if (req.type === "form") return "ri-pencil-line text-primary";
      if (req.type === "upload") return "ri-upload-2-line text-success";
      return "ri-information-line text-muted"; // auto
    },

    /** Farben für Level-Badge */
    getLevelColor(level) {
      if (level === "basis") return "primary";
      if (level === "stufe1") return "warning";
      if (level === "stufe2") return "danger";
      return "secondary";
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
          <BCardHeader>
            <h4 class="mb-1">{{ certificate }}</h4>
            <p class="text-muted mb-0">{{ description }}</p>
          </BCardHeader>

          <BCardBody>

            <!-- LOADING -->
            <div v-if="loading" class="text-center p-5">
              <div class="spinner-border"></div>
            </div>

            <!-- ERROR -->
            <div v-if="error" class="alert alert-danger">
              Fehler beim Laden der Anforderungen.
            </div>

            <!-- TABS -->
            <div v-if="!loading">
              <BTabs nav-class="mb-3" content-class="mt-3" pills justified>

                <!-- EIN TAB PRO GROUP -->
                <BTab
                    v-for="(items, group) in grouped"
                    :key="group"
                >
                  <!-- TAB TITLE -->
                  <template #title>
                    {{ group.charAt(0).toUpperCase() + group.slice(1) }}
                    <span class="badge bg-primary ms-2">{{ items.length }}</span>
                  </template>

                  <!-- INHALT DES TABS -->
                  <div
                      v-for="req in items"
                      :key="req.key"
                      class="p-3 border rounded mb-3 bg-light"
                  >

                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="mb-1">
                          <i :class="getTypeIcon(req)" class="me-2"></i>
                          {{ req.title }}
                        </h6>
                        <p class="text-muted small mb-0">{{ req.description }}</p>
                      </div>

                      <!-- LEVEL BADGE -->
                      <BBadge :variant="getLevelColor(req.level)">
                        {{ req.level }}
                      </BBadge>
                    </div>

                    <!-- STATUS BADGES -->
                    <div class="mt-2">

                      <!-- COMPLETED -->
                      <BBadge
                          v-if="valuesMap[req.key]?.completed"
                          variant="success"
                          class="me-2"
                      >
                        Completed
                      </BBadge>

                      <!-- VALIDATED -->
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
.bg-light {
  background: #f8f9fa !important;
}
</style>
