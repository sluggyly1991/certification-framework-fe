<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import DropZoneUpload from "@/components/requirements/DropZoneUpload.vue";
import axios from "@/axios";

export default {
  name: "TaskSeriesForm",

  data() {
    return {
      activeStep: 1,
      loading: false,

      form: {
        title: "",
        description: "",
        requirement: null,
      },


      templateFile: null,

      // 🔒 STABILE, FLACHE LISTEN
      tags: [],
      units: [],
      members: [],

      selected: {
        tags: [],
        units: [],
        members: [],
      },

      requirements: [],

      // Live-Auswertung
      resolvedCount: null,
      resolving: false,
    };
  },

  async mounted() {
    await this.loadLists();
    await this.fetchRequirements();
  },

  methods: {
    // ------------------------------------------------
    // LOAD & NORMALIZE (KEINE GROUPS IM UI)
    // ------------------------------------------------
    async loadLists() {
      const [tagsRes, unitsRes, membersRes] = await Promise.all([
        axios.get("/company/tags"),
        axios.get("/company/units"),
        axios.get("/company/members"),
      ]);

      this.tags = (tagsRes.data.data ?? []).flatMap(g =>
          (g.tags ?? []).map(t => ({
            id: `${t.id}`,
            rawId: t.id,
            label: t.label,
          }))
      );


      this.units = (unitsRes.data.data ?? []).flatMap(g =>
          (g.units ?? []).map(u => ({
            id: `${u.id}`,
            rawId: u.id,
            label: u.label,
          }))
      );

      this.members = (membersRes.data.data ?? []).flatMap(g =>
          (g.members ?? []).map(m => ({
            id: `${m.id}`,
            rawId: m.id,
            label: m.label,
          }))
      );
    },

    async fetchRequirements() {
      try {
        const res = await axios.get("/requirements");
        const list = res.data.data?.requirements ?? [];

        this.requirements = list.map(r => ({
          id: r.key,              // ✅ EINDEUTIG
          label: r.title,
          description: r.description,
        }));
      } catch (e) {
        console.error(e);
        this.requirements = [];
      }
    },

    goStep(step) {
      this.activeStep = step;
    },

    handleUpload(files) {
      const file = files?.[0];
      if (file instanceof File) {
        this.templateFile = file;
      }
    },

    handleRemove() {
      this.templateFile = null;
    },

    async resolveSelection() {
      this.resolving = true;

      try {
        const res = await axios.post("/tasks/series/resolve", {
          tags: this.selected.tags,
          units: this.selected.units,
          members: this.selected.members,
        });

        this.resolvedCount = res.data.data.selectedMembers;
      } catch (e) {
        console.error(e);
        this.resolvedCount = null;
      }

      this.resolving = false;
    },

    // ------------------------------------------------
    // FINAL SUBMIT
    // ------------------------------------------------
    async submit() {
      this.loading = true;

      try {
        let documentId = null;

        if (this.templateFile) {
          const fd = new FormData();
          fd.append("file", this.templateFile);
          fd.append("type", "template");

          const uploadRes = await axios.post("/tasks/series/upload", fd);
          documentId = uploadRes.data.data.document.id;
        }

        await axios.post("/tasks/series/create", {
          values: this.form,
          documentId,
          tags: this.selected.tags,
          units: this.selected.units,
          members: this.selected.members,
        });

        this.$router.push("/taskseries");
      } catch (e) {
        console.error(e);
      }

      this.loading = false;
    },
  },

  components: {
    Layout,
    PageHeader,
    Multiselect,
    DropZoneUpload,
  },
};
</script>

<template>
  <Layout>
    <PageHeader title="Serienaufgabe erstellen" />

    <!-- ✔ ZENTRIERT, NICHT VOLLE BREITE -->
    <BRow>
      <BCol lg="8" xl="7" class="mx-auto">
        <BCard>
          <BCardBody>

            <!-- STEP 1 -->
            <div v-if="activeStep === 1">
              <input
                  class="form-control mb-3"
                  v-model="form.title"
                  placeholder="Titel"
              />

              <Multiselect
                  v-model="form.requirement"
                  :options="requirements"
                  label="label"
                  value-prop="id"
                  track-by="id"
                  mode="single"
                  :searchable="true"
                  placeholder="Anforderung auswählen (optional)"
                  class="form-control mb-3"
              />

              <small
                  v-if="form.requirement"
                  class="text-muted d-block mb-3"
              >
                {{
                  requirements.find(r => r.id === form.requirement)?.description
                }}
              </small>

              <textarea
                  class="form-control mb-3"
                  rows="4"
                  v-model="form.description"
                  placeholder="Beschreibung"
              />

              <DropZoneUpload
                  :existingFiles="templateFile ? [templateFile] : []"
                  :multiple="false"
                  @upload="handleUpload"
                  @remove="handleRemove"
              />

              <div class="text-end mt-3">
                <BButton variant="primary" @click="goStep(2)">
                  Weiter
                </BButton>
              </div>
            </div>

            <!-- STEP 2 -->
            <div v-if="activeStep === 2">
              <label class="form-label">Tags</label>
              <Multiselect
                  v-model="selected.tags"
                  :options="tags"
                  label="label"
                  value-prop="id"
                  track-by="id"
                  mode="tags"
                  :searchable="true"
                  :close-on-select="false"
                  :hide-selected="false"
                  @update:modelValue="resolveSelection"
                  />


              <label class="form-label mt-3">Units</label>
              <Multiselect
                  v-model="selected.units"
                  :options="units"
                  label="label"
                  value-prop="id"
                  track-by="id"
                  mode="tags"
                  :close-on-select="false"
                  :searchable="true"
                  :hide-selected="false"
                  @update:modelValue="resolveSelection"
              />

              <label class="form-label mt-3">Members</label>
              <Multiselect
                  v-model="selected.members"
                  :options="members"
                  label="label"
                  value-prop="id"
                  track-by="id"
                  mode="tags"
                  :close-on-select="false"
                  :searchable="true"
                  :hide-selected="false"
                  @update:modelValue="resolveSelection"
              />

              <!-- LIVE INFO -->
              <div class="alert alert-info mt-3">
                <span v-if="resolving">
                  Berechne betroffene Mitglieder…
                </span>
                <span v-else-if="(resolvedCount !== null && resolvedCount !== 0)">
                  Betrifft <strong>{{ resolvedCount }}</strong> Mitglieder
                </span>
                <span v-else>
                  Betrifft alle Mitglieder
                </span>
              </div>

              <div class="d-flex justify-content-between mt-4">
                <BButton variant="light" @click="goStep(1)">
                  Zurück
                </BButton>

                <BButton
                    variant="success"
                    :disabled="loading"
                    @click="submit"
                >
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

<style scoped>
.multiselect {
  --ms-border-color: #dee2e6;
  --ms-tag-bg: #435ebe;
  --ms-tag-color: #fff;
}
.multiselect-option.is-selected {
  opacity: 0.5;
}
</style>
