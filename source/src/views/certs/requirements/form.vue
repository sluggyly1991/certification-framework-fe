<!-- src/views/certs/requirements/RequirementForm.vue -->
<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import {
  BRow,
  BCol,
  BCard,
  BCardBody,
  BCardHeader,
  BButton,
} from "bootstrap-vue-next";

import axios from "@/axios";

import DynamicField from "@/components/requirements/DynamicField.vue";
import RequirementStatusBadge from "@/components/requirements/RequirementStatusBadge.vue";

export default {
  name: "RequirementForm",

  components: {
    Layout,
    PageHeader,
    BRow,
    BCol,
    BCard,
    BCardBody,
    BCardHeader,
    BButton,
    DynamicField,
    RequirementStatusBadge,
  },

  data() {
    return {
      loading: true,
      saving: false,
      uploading: false,
      error: null,

      key: this.$route.params.key,

      requirement: null,
      valueData: null,

      formValue: "",
    };
  },

  async mounted() {
    await this.loadForm();
  },

  methods: {
    async loadForm() {
      this.loading = true;
      this.error = null;

      try {
        const res = await axios.get(`/requirements/form/${this.key}`);
        this.requirement = res.data.data;

        try {
          const val = await axios.get(`/requirements/value/${this.key}`);
          this.valueData = val.data.data || null;
        } catch (e) {
          if (e.response && e.response.status === 404) {
            this.valueData = null;
          } else {
            throw e;
          }
        }

        this.formValue = this.valueData?.value ?? "";
      } catch (e) {
        console.error(e);
        this.error = e;
      }

      this.loading = false;
    },

    //
    // SAVE TEXT / NON-FILE VALUES
    //
    async save() {
      this.saving = true;

      try {
        await axios.post(`/requirements/value`, {
          values: {
            [this.key]: this.formValue,
          },
        });

        // Reload after save
        try {
          const val = await axios.get(`/requirements/value/${this.key}`);
          this.valueData = val.data.data || null;
        } catch {}

        this.$bvToast?.toast("Gespeichert!", {
          title: "Erfolg",
          variant: "success",
          solid: true,
        });
      } catch (e) {
        console.error(e);
        this.$bvToast?.toast("Fehler beim Speichern", {
          title: "Fehler",
          variant: "danger",
          solid: true,
        });
      }

      this.saving = false;
    },

    //
    // FILE UPLOAD
    //
    async handleUploadFiles(files) {
      this.uploading = true;

      try {
        const formData = new FormData();
        files.forEach(file => formData.append("files", file));

        // API Endpoint: POST /requirements/value/{key}/upload
        const res = await axios.post(
            `/requirements/value/${this.key}/upload`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
        );

        if (!this.valueData) this.valueData = {};

        this.valueData.files = res.data.data.files || [];
        this.valueData.completed = res.data.data.completed ?? this.valueData.completed;
        this.valueData.validated = res.data.data.validated ?? this.valueData.validated;
      } catch (e) {
        console.error(e);
        this.$bvToast?.toast("Fehler beim Upload", {
          title: "Fehler",
          variant: "danger",
          solid: true,
        });
      }

      this.uploading = false;
    },

    //
    // DELETE FILE
    //
    async handleRemoveFile(file) {
      try {
        await axios.delete(
            `/requirements/value/${this.key}/files/${file.id}`
        );

        if (this.valueData?.files) {
          this.valueData.files = this.valueData.files.filter(
              (f) => f.id !== file.id
          );
        }
      } catch (e) {
        console.error(e);
        this.$bvToast?.toast("Fehler beim Löschen der Datei", {
          title: "Fehler",
          variant: "danger",
          solid: true,
        });
      }
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader
        :title="requirement ? requirement.title : 'Laden…'"
        :breadcrumbs="[
        { label: 'Dashboard', to: '/' },
        { label: 'Anforderungen', to: '/requirements' },
        { label: requirement?.title ?? 'Laden…', active: true },
      ]"
    />

    <BRow>
      <BCol lg="8" class="mx-auto">
        <BCard no-body>
          <BCardHeader>
            <h4 class="mb-1">{{ requirement?.title }}</h4>
            <p class="text-muted mb-2">{{ requirement?.description }}</p>

            <div class="d-flex align-items-center gap-2">
              <RequirementStatusBadge
                  :completed="valueData?.completed ?? false"
                  :validated="valueData?.validated ?? false"
              />

              <span v-if="valueData?.updated" class="text-muted small">
                Letzte Aktualisierung:
                {{ new Date(valueData.updated).toLocaleString() }}
              </span>
            </div>
          </BCardHeader>

          <BCardBody>
            <div v-if="loading" class="text-center p-4">
              <div class="spinner-border"></div>
            </div>

            <div v-if="!loading && error" class="alert alert-danger">
              Fehler beim Laden.
            </div>

            <div v-if="!loading && !error && requirement">
              <DynamicField
                  :requirement="requirement"
                  v-model="formValue"
                  :valueData="valueData"
                  :disabled="saving || uploading"
                  @upload-files="handleUploadFiles"
                  @remove-file="handleRemoveFile"
              />

              <div class="mt-4 d-flex justify-content-between">
                <BButton
                    variant="light"
                    @click="$router.push('/requirements')"
                >
                  Zurück
                </BButton>

                <BButton
                    v-if="requirement.input !== false && requirement.type !== 'auto'"
                    variant="primary"
                    @click="save"
                    :disabled="saving"
                >
                  <span
                      v-if="saving"
                      class="spinner-border spinner-border-sm me-2"
                  ></span>
                  Speichern
                </BButton>
              </div>
            </div>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </Layout>
</template>

<style scoped></style>
