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
  BButton,
  BModal
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
      isAdmin: true,

      // Modals
      showDeleteModal: false,
      showDisableModal: false,
      showEnableModal: false,   // 🔵 NEU: Aktivieren-Modal
      memberToDelete: null,
      memberToDisable: null,
      memberToEnable: null      // 🔵 NEU
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

    editMember(id) {
      this.$router.push(`/members/edit/${id}`);
    },

    disableMember(member) {
      this.memberToDisable = member;
      this.showDisableModal = true;
    },

    // 🔵 NEU: Aktivieren-Flow
    enableMember(member) {
      this.memberToEnable = member;
      this.showEnableModal = true;
    },

    openDeleteModal(member) {
      this.memberToDelete = member;
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      try {
        await axios.delete(`/members/${this.memberToDelete.id}`);
        this.showDeleteModal = false;
        this.memberToDelete = null;
        await this.fetchMembers();
      } catch (e) {
        console.error(e);
        alert("Fehler beim Löschen des Members.");
      }
    },

    async confirmDisable() {
      try {
        await axios.post(`/members/${this.memberToDisable.id}/disable`);
        this.showDisableModal = false;
        this.memberToDisable = null;
        await this.fetchMembers();
      } catch (e) {
        console.error(e);
        alert("Fehler beim Deaktivieren.");
      }
    },

    // 🔵 NEU: Aktivieren-Request
    async confirmEnable() {
      try {
        await axios.post(`/members/${this.memberToEnable.id}/enable`);
        this.showEnableModal = false;
        this.memberToEnable = null;
        await this.fetchMembers();
      } catch (e) {
        console.error(e);
        alert("Fehler beim Aktivieren.");
      }
    },

    getMemberDisplayName(member) {
      if (!member) return "";
      const nameCol = this.columns.find(c => c.source === "name");
      if (!nameCol) return member.id;
      return member.fields[nameCol.id] || member.id;
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
    BButton,
    BModal
  }
};
</script>

<template>
  <Layout>
    <PageHeader
        :title="$t('t-members-list')"
        :breadcrumbs="[
        { label: $t('t-dashboard'), to: '/' },
        { label: $t('t-members-list'), active: true }
      ]"
    />

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

          <!-- TABLE & MODALS -->
          <BCardBody>

            <!-- Delete Modal -->
            <BModal
                v-model="showDeleteModal"
                title="Member löschen"
                centered
                hide-footer
                modal-class="zoomIn"
                class="v-modal-custom"
            >
              <p>
                Willst du
                <strong>{{ getMemberDisplayName(memberToDelete) }}</strong>
                wirklich löschen?
              </p>

              <div class="text-end mt-3">
                <BButton variant="light" @click="showDeleteModal = false">
                  Abbrechen
                </BButton>
                <BButton variant="danger" @click="confirmDelete">
                  Löschen
                </BButton>
              </div>
            </BModal>

            <!-- Disable Modal -->
            <BModal
                v-model="showDisableModal"
                title="Mitglied deaktivieren"
                centered
                hide-footer
                modal-class="zoomIn"
                class="v-modal-custom"
            >
              <p>
                Soll
                <strong>{{ getMemberDisplayName(memberToDisable) }}</strong>
                deaktiviert werden? Dieses Mitglied erscheint nicht mehr in der Liste.
              </p>

              <div class="text-end mt-3">
                <BButton variant="light" @click="showDisableModal = false">
                  Abbrechen
                </BButton>
                <BButton variant="warning" @click="confirmDisable">
                  Deaktivieren
                </BButton>
              </div>
            </BModal>

            <!-- 🔵 Enable Modal (NEU) -->
            <BModal
                v-model="showEnableModal"
                title="Mitglied aktivieren"
                centered
                hide-footer
                modal-class="zoomIn"
                class="v-modal-custom"
            >
              <p>
                Soll
                <strong>{{ getMemberDisplayName(memberToEnable) }}</strong>
                wieder aktiviert werden?
              </p>

              <div class="text-end mt-3">
                <BButton variant="light" @click="showEnableModal = false">
                  Abbrechen
                </BButton>
                <BButton variant="success" @click="confirmEnable">
                  Aktivieren
                </BButton>
              </div>
            </BModal>

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
                  <th class="text-end">Aktionen</th>
                </tr>
                </thead>

                <tbody>
                <tr v-for="m in filteredMembers" :key="m.id">
                  <!-- Dynamische Felder -->
                  <td
                      v-for="col in columns"
                      :key="col.id"
                      @click="goToDetail(m.id)"
                      class="clickable-cell"
                  >
                    <!-- Boolean TRUE -->
                    <span v-if="m.fields[col.id] === true">
                        <i class="ri-check-line text-success fw-bold"></i>
                      </span>

                    <!-- Boolean FALSE -->
                    <span v-else-if="m.fields[col.id] === false">
                        <i class="ri-close-line text-danger fw-bold"></i>
                      </span>

                    <!-- Normaler Text -->
                    <span v-else>
                        {{ m.fields[col.id] ?? '' }}
                      </span>
                  </td>

                  <!-- Aktionen -->
                  <td class="text-end">

                    <!-- Edit -->
                    <BButton
                        size="sm"
                        variant="soft-primary"
                        class="me-2"
                        @click.stop="editMember(m.id)"
                    >
                      <i class="ri-edit-line"></i>
                    </BButton>

                    <!-- Toggle Aktiv / Inaktiv -->
                    <BButton
                        v-if="m.active"
                        size="sm"
                        variant="soft-warning"
                        class="me-2"
                        @click.stop="disableMember(m)"
                    >
                      <i class="ri-user-unfollow-line"></i>
                    </BButton>

                    <BButton
                        v-else
                        size="sm"
                        variant="soft-success"
                        class="me-2"
                        @click.stop="enableMember(m)"
                    >
                      <i class="ri-user-follow-line"></i>
                    </BButton>

                    <!-- Delete -->
                    <BButton
                        size="sm"
                        variant="soft-danger"
                        @click.stop="openDeleteModal(m)"
                    >
                      <i class="ri-delete-bin-line"></i>
                    </BButton>

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

                <li
                    v-for="p in pages"
                    :key="p"
                    class="page-item"
                    :class="{ active: p === page }"
                >
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
.clickable-cell {
  cursor: pointer;
}

.clickable-cell:hover {
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

.vertical-overlay {
  display: none !important;
}
</style>
