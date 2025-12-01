<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import axios from "axios";
import Sortable from "sortablejs";

import {
  BRow,
  BCol,
  BCard,
  BCardHeader,
  BCardBody,
  BLink,
  BFormInput,
  BFormCheckbox,
  BButton
} from "bootstrap-vue-next";

export default {
  name: "Members",

  data() {
    return {
      loading: true,
      error: null,

      // Display Settings
      columns: [],          // aktive Settings aus API
      editColumns: [],      // kopie für Bearbeiten
      possibleFields: [],   // Felder, die hinzugefügt werden können
      showSettings: false,
      newField: null,

      // Members
      members: [],
      page: 1,
      limit: 10,
      total: 0,
      pages: 1,

      searchQuery: "",

      // Admin
      isAdmin: true
    };
  },

  watch: {
    page() {
      this.fetchMembers();
    }
  },

  async mounted() {
    await this.fetchDisplaySettings();
    await this.fetchMembers();
  },

  computed: {
    filteredMembers() {
      if (!this.searchQuery) return this.members;
      const s = this.searchQuery.toLowerCase();

      return this.members.filter(m =>
          Object.values(m.fields).some(value =>
              String(value || "").toLowerCase().includes(s)
          )
      );
    }
  },

  methods: {
    async fetchDisplaySettings() {
      this.loading = true;

      try {
        const res = await axios.get("/settings/display/members/overview");
        this.columns = res.data.data.columns
            .filter(c => c.visible !== false)
            .sort((a, b) => a.position - b.position);

        this.editColumns = JSON.parse(JSON.stringify(res.data.data.columns));

        const f = await axios.get("/settings/display/members/possible-fields");
        this.possibleFields = f.data?.data?.fields ?? [];

        this.$nextTick(() => this.initSortable());

      } catch (e) {
        this.error = e;
      }

      this.loading = false;
    },

    async fetchMembers() {
      this.loading = true;

      try {
        const res = await axios.get("/members", {
          params: { page: this.page, limit: this.limit }
        });

        const data = res.data.data;
        this.members = data.items;
        this.total = data.total;
        this.pages = data.pages;

      } catch (e) {
        this.error = e;
      }

      this.loading = false;
    },

    goToDetail(id) {
      this.$router.push(`/members/${id}`);
    },

    addField() {
      if (!this.newField) return;

      this.editColumns.push({
        id: Date.now(),
        title: this.newField.label,
        source: this.newField.source,
        visible: true,
        position: this.editColumns.length + 1
      });

      this.newField = null;

      // Drag&Drop erneut initialisieren
      this.$nextTick(() => this.initSortable());
    },

    removeField(index) {
      this.editColumns.splice(index, 1);
      this.updatePositions();
    },

    updatePositions() {
      this.editColumns.forEach((c, i) => {
        c.position = i + 1;
      });
    },

    initSortable() {
      const el = document.getElementById("columns-list");
      if (!el) return;

      Sortable.create(el, {
        handle: ".drag-handle",
        animation: 150,

        onEnd: evt => {
          const moved = this.editColumns.splice(evt.oldIndex, 1)[0];
          this.editColumns.splice(evt.newIndex, 0, moved);
          this.updatePositions();
        }
      });
    },

    async saveSettings() {
      const normalized = this.editColumns.map((c, index) => ({
        ...c,
        position: index + 1
      }));

      await axios.post("/settings/display/members/overview", {
        columns: normalized
      });

      this.showSettings = false;

      await this.fetchDisplaySettings();
      await this.fetchMembers();
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
    BLink,
    BFormInput,
    BFormCheckbox,
    BButton
  }
};
</script>

<template>
  <Layout>
    <PageHeader title="Mitglieder" pageTitle="Praxisnetz" />

    <BRow>
      <BCol lg="12">
        <BCard no-body>

          <!-- HEADER -->
          <BCardHeader class="border-bottom-dashed">
            <BRow class="g-4 align-items-center">
              <BCol sm>
                <h5 class="card-title mb-0">Mitgliederliste</h5>
              </BCol>

              <BCol sm="auto" class="d-flex align-items-center gap-2">

                <!-- Admin Settings Button -->
                <BButton
                    v-if="isAdmin"
                    variant="soft-primary"
                    @click="showSettings = !showSettings; $nextTick(()=>initSortable())"
                >
                  <i class="ri-settings-3-line"></i> Ansicht anpassen
                </BButton>

                <!-- Search -->
                <div class="search-box">
                  <input
                      type="text"
                      class="form-control search"
                      placeholder="Suche nach Mitgliedern..."
                      v-model="searchQuery"
                  />
                  <i class="ri-search-line search-icon"></i>
                </div>

              </BCol>
            </BRow>

            <!-- SETTINGS PANEL -->
            <div v-if="showSettings" class="mt-3 p-3 border rounded bg-light">

              <h6 class="mb-3">Tabellenansicht bearbeiten</h6>

              <div id="columns-list">
                <div
                    v-for="(col, index) in editColumns"
                    :key="col.id"
                    class="d-flex align-items-center mb-2 gap-3 p-2 bg-white border rounded"
                >
                  <i class="ri-draggable drag-handle" style="cursor: grab"></i>

                  <BFormInput v-model="col.title" class="w-25" />

                  <small class="text-muted">{{ col.source }}</small>

                  <BFormCheckbox v-model="col.visible">sichtbar</BFormCheckbox>

                  <BButton variant="soft-danger" size="sm" @click="removeField(index)">
                    <i class="ri-close-line"></i>
                  </BButton>
                </div>
              </div>

              <hr />

              <!-- Add new field -->
              <div class="d-flex align-items-center gap-2">
                <select v-model="newField" class="form-select w-50">
                  <option disabled value="">+ Feld auswählen…</option>
                  <option v-for="f in possibleFields" :key="f.source" :value="f">
                    {{ f.label }} ({{ f.source }})
                  </option>
                </select>

                <BButton variant="success" @click="addField">
                  Hinzufügen
                </BButton>
              </div>

              <!-- Save -->
              <div class="mt-3 text-end">
                <BButton class="me-2" variant="light" @click="showSettings = false">
                  Abbrechen
                </BButton>

                <BButton variant="primary" @click="saveSettings">
                  Speichern
                </BButton>
              </div>

            </div>
          </BCardHeader>

          <!-- TABLE -->
          <BCardBody>
            <div v-if="loading" class="text-center p-5">
              <div class="spinner-border"></div>
            </div>

            <div v-if="error" class="alert alert-danger">
              Fehler: {{ error.message }}
            </div>

            <div v-if="!loading && filteredMembers.length > 0" class="table-responsive table-card mb-1">
              <table class="table align-middle table-hover">
                <thead class="table-light text-muted">
                <tr>
                  <th v-for="col in columns" :key="col.id">{{ col.title }}</th>
                </tr>
                </thead>

                <tbody>
                <tr
                    v-for="m in filteredMembers"
                    :key="m.id"
                    class="clickable-row"
                    @click="goToDetail(m.id)"
                >
                  <td v-for="col in columns" :key="col.id">
                    {{ m.fields[col.id] ?? '' }}
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            <div v-if="!loading && filteredMembers.length === 0" class="text-center p-4">
              <h5>Keine Mitglieder gefunden</h5>
            </div>

            <!-- Pagination -->
            <div v-if="pages > 1" class="d-flex justify-content-end mt-3">
              <ul class="pagination hstack gap-2">
                <li class="page-item" :class="{ disabled: page === 1 }">
                  <a class="page-link" href="#" @click="page > 1 && (page--)">Zurück</a>
                </li>

                <li v-for="p in pages" :key="p" class="page-item" :class="{ active: p === page }">
                  <a class="page-link" href="#" @click="page = p">{{ p }}</a>
                </li>

                <li class="page-item" :class="{ disabled: page === pages }">
                  <a class="page-link" href="#" @click="page < pages && (page++)">Weiter</a>
                </li>
              </ul>
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
.clickable-row:hover {
  background: rgba(67, 94, 190, 0.07);
}

.drag-handle {
  font-size: 20px;
  opacity: 0.6;
}

.sortable-ghost {
  background-color: rgba(67, 94, 190, 0.15);
  border-radius: 8px;
}
</style>
