<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import axios from "axios";
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";

export default {
  name: "MemberForm",

  props: {
    id: {
      type: [String, Number],
      default: null,
    },
  },

  data() {
    return {
      activeStep: 1,

      basicFields: [],
      advancedFields: null,

      form: {},           // Basisfelder
      dynamicFields: {},  // Units + Tags

      memberId: null,
      loading: false,
    };
  },

  computed: {
    breadcrumbs() {
      return [
        { label: this.$t("t-dashboard"), to: "/" },
        { label: this.$t("t-members"), to: "/members" },
        this.id
            ? { label: this.$t("t-edit-member") }
            : { label: this.$t("t-add-member") }
      ];
    }
  },

  async mounted() {
    await this.fetchFieldDefinitions();

    if (this.id) {
      await this.fetchMember(this.id);
      this.memberId = this.id;
      this.activeStep = 1; // Immer Step 1 starten — aber Step 2 frei
    }
  },

  methods: {
    // --------------------------------------------------------
    // FELDER LADEN
    // --------------------------------------------------------
    async fetchFieldDefinitions() {
      const res = await axios.get("/members/fields");
      const fields = res.data.data.fields;

      this.basicFields = fields.basic;
      this.advancedFields = fields.advanced;

      // Basis init
      this.basicFields.forEach(f => {
        this.form[f.source] = "";
      });

      // Units init
      if (fields.advanced?.units) {
        this.dynamicFields.units = [];
      }

      // Tags init
      if (fields.advanced?.tags) {
        fields.advanced.tags.forEach(g => {
          this.dynamicFields[g.group] = [];
        });
      }
    },

    // --------------------------------------------------------
    // MEMBER LADEN (EDIT)
    // --------------------------------------------------------
    async fetchMember(id) {
      const res = await axios.get(`/members/edit/${id}`);
      const m = res.data.data;

      this.memberId = m.id;

      // Basisdaten
      this.form = {
        name: m.fields.basic.name ?? "",
        email: m.fields.basic.email ?? "",
        phone: m.fields.basic.phone ?? "",
      };

      // Units
      this.dynamicFields.units = m.fields.advanced.units || [];

      // Tags
      if (m.fields.advanced.tags) {
        Object.keys(m.fields.advanced.tags).forEach(group => {
          this.dynamicFields[group] = m.fields.advanced.tags[group] || [];
        });
      }
    },

    // --------------------------------------------------------
    // STEP 1 SPEICHERN
    // CREATE → POST /members
    // EDIT   → kein Save
    // --------------------------------------------------------
    async saveStep1() {
      this.loading = true;

      try {
        if (!this.id) {
          // CREATE
          const res = await axios.post("/members/", this.form);
          this.memberId = res.data.data.id;
        }

        // EDIT → kein Save, direkt weiter
        this.activeStep = 2;

      } catch (e) {
        console.error(e);
        alert("Fehler beim Erstellen.");
      }

      this.loading = false;
    },

    // --------------------------------------------------------
    // STEP 2 FINAL SPEICHERN
    // --------------------------------------------------------
    async saveStep2() {
      this.loading = true;

      try {
        await axios.post(`/members/edit/${this.memberId}`, {
          fields: {
            basic: this.form,
            advanced: this.dynamicFields,
          }
        });

        this.$router.push(`/members/${this.memberId}`);

      } catch (e) {
        console.error(e);
        alert("Fehler beim Speichern der Zusatzfelder.");
      }

      this.loading = false;
    },

    goStep(step) {
      // Bei create kann step 2 erst nach Save betreten werden
      if (!this.id && step === 2 && !this.memberId) {
        alert("Bitte zuerst Step 1 speichern.");
        return;
      }
      this.activeStep = step;
    }
  },

  components: {
    Layout,
    PageHeader,
    Multiselect,
  },
};
</script>


<template>
  <Layout>
    <PageHeader
        :title="id ? $t('t-edit-member') : $t('t-add-member')"
        :breadcrumbs="breadcrumbs"
    />

    <BRow>
      <BCol lg="8" class="mx-auto">
        <BCard>
          <BCardBody>

            <!-- NAVIGATION -->
            <ul class="nav nav-pills nav-justified mb-4">
              <li class="nav-item">
                <button
                    class="nav-link"
                    :class="{ active: activeStep === 1 }"
                    @click="goStep(1)"
                >
                  1. {{ $t("t-basic-data") }}
                </button>
              </li>

              <li class="nav-item">
                <button
                    class="nav-link"
                    :class="{ active: activeStep === 2 }"
                    @click="goStep(2)"
                >
                  2. {{ $t("t-additional-fields") }}
                </button>
              </li>
            </ul>

            <!-- STEP 1 -->
            <div v-if="activeStep === 1">
              <h4 class="mb-3">{{ $t("t-basic-data") }}</h4>

              <BRow class="gy-3">
                <BCol cols="12"
                      v-for="f in basicFields"
                      :key="f.source"
                >
                  <label class="form-label">{{ f.label }}</label>
                  <input
                      :type="f.type"
                      class="form-control"
                      v-model="form[f.source]"
                  />
                </BCol>
              </BRow>

              <div class="text-end mt-4">
                <BButton variant="primary" @click="saveStep1">
                  {{ $t("t-next-step") }}
                </BButton>
              </div>
            </div>

            <!-- STEP 2 -->
            <div v-if="activeStep === 2">
              <h4 class="mb-3">{{ $t("t-additional-fields") }}</h4>

              <!-- UNITS -->
              <div v-if="advancedFields?.units" class="mb-4">
                <label class="form-label">{{ advancedFields.units.label }}</label>
                <Multiselect
                    v-model="dynamicFields.units"
                    :options="advancedFields.units.options"
                    mode="tags"
                    :searchable="true"
                    :create-option="true"
                    placeholder="Standorte auswählen oder hinzufügen"
                />
              </div>

              <!-- TAG GROUPS -->
              <div
                  v-for="group in advancedFields?.tags"
                  :key="group.group"
                  class="mb-4"
              >
                <label class="form-label">{{ group.label }}</label>

                <Multiselect
                    v-model="dynamicFields[group.group]"
                    :options="group.options"
                    mode="tags"
                    :searchable="true"
                    :create-option="true"
                    placeholder="Tags auswählen oder hinzufügen"
                />
              </div>

              <div class="d-flex justify-content-between mt-4">
                <BButton variant="light" @click="goStep(1)">
                  {{ $t("t-back") }}
                </BButton>

                <BButton variant="success" @click="saveStep2">
                  {{ $t("t-save-member") }}
                </BButton>
              </div>
            </div>

          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </Layout>
</template>


<style scoped>
.nav-link {
  cursor: pointer;
}
.nav-link.active {
  font-weight: bold;
}
</style>
