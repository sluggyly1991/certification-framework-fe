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

      // 🔧 Display Settings
      columns: [],
      editColumns: [],
      possibleFields: [],
      showSettings: false,
      newField: null,

      // 👤 Members
      members: [],
      page: 1,
      limit: 10,
      total: 0,
      pages: 1,

      searchQuery: "",

      // 🔐 später per Permission ersetzen
      isAdmin: true,

      // 🪟 Modals
      showDeleteModal: false,
      showDisableModal: false,
      showEnableModal: false,
      memberToDelete: null,
      memberToDisable: null,
      memberToEnable: null
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
          Object.values(m.fields).some(v =>
              String(v ?? "").toLowerCase().includes(s)
          )
      );
    }
  },

  methods: {
    /* ===============================
     * DISPLAY SETTINGS
     * =============================== */
    async fetchDisplaySettings() {
      try {
        const res = await axios.get("/settings/display/members/overview");

        this.columns = res.data.data.columns
            .filter(c => c.visible !== false)
            .sort((a, b) => a.position - b.position);

        this.editColumns = JSON.parse(JSON.stringify(res.data.data.columns));

        const f = await axios.get("/settings/display/members/possible-fields");
        this.possibleFields = f.data?.data?.fields ?? [];

        this.$nextTick(this.initSortable);
      } catch (e) {
        this.error = e;
      }
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

    updatePositions() {
      this.editColumns.forEach((c, i) => (c.position = i + 1));
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
      this.$nextTick(this.initSortable);
    },

    removeField(index) {
      this.editColumns.splice(index, 1);
      this.updatePositions();
    },

    async saveSettings() {
      await axios.post("/settings/display/members/overview", {
        columns: this.editColumns
      });

      this.showSettings = false;
      await this.fetchDisplaySettings();
      await this.fetchMembers();
    },

    /* ===============================
     * MEMBERS
     * =============================== */
    async fetchMembers() {
      this.loading = true;
      try {
        const res = await axios.get("/members", {
          params: { page: this.page, limit: this.limit }
        });

        const d = res.data.data;
        this.members = d.items;
        this.total = d.total;
        this.pages = d.pages;
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

    assignUser(member) {
      this.$router.push(`/members/${member.id}/user`);
    },

    disableMember(member) {
      this.memberToDisable = member;
      this.showDisableModal = true;
    },

    enableMember(member) {
      this.memberToEnable = member;
      this.showEnableModal = true;
    },

    openDeleteModal(member) {
      this.memberToDelete = member;
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      await axios.delete(`/members/${this.memberToDelete.id}`);
      this.showDeleteModal = false;
      await this.fetchMembers();
    },

    async confirmDisable() {
      await axios.post(`/members/${this.memberToDisable.id}/disable`);
      this.showDisableModal = false;
      await this.fetchMembers();
    },

    async confirmEnable() {
      await axios.post(`/members/${this.memberToEnable.id}/enable`);
      this.showEnableModal = false;
      await this.fetchMembers();
    },

    getMemberDisplayName(member) {
      const nameCol = this.columns.find(c => c.source === "name");
      return nameCol ? member.fields[nameCol.id] : member.id;
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
        title="Mitglieder"
        :breadcrumbs="[
        { label: 'Dashboard', to: '/' },
        { label: 'Mitglieder', active: true }
      ]"
    />

    <BRow>
      <BCol>
        <BCard no-body>
          <BCardHeader class="border-bottom-dashed">
            <BRow class="align-items-center g-3">
              <BCol>
                <h5 class="mb-0">Mitgliederliste</h5>
              </BCol>

              <BCol sm="auto" class="d-flex gap-2">
                <BButton
                    v-if="isAdmin"
                    variant="soft-primary"
                    @click="showSettings = !showSettings; $nextTick(initSortable)"
                >
                  <i class="ri-settings-3-line"></i>
                </BButton>

                <div class="search-box">
                  <input
                      class="form-control"
                      placeholder="Suchen…"
                      v-model="searchQuery"
                  />
                </div>
              </BCol>
            </BRow>

            <!-- SETTINGS -->
            <div v-if="showSettings" class="mt-3 p-3 bg-light rounded">
              <div id="columns-list">
                <div
                    v-for="(col, i) in editColumns"
                    :key="col.id"
                    class="d-flex gap-3 align-items-center mb-2 p-2 bg-white border rounded"
                >
                  <i class="ri-draggable drag-handle"></i>
                  <BFormInput v-model="col.title" />
                  <small>{{ col.source }}</small>
                  <BFormCheckbox v-model="col.visible" />
                  <BButton size="sm" variant="soft-danger" @click="removeField(i)">
                    <i class="ri-close-line" />
                  </BButton>
                </div>
              </div>

              <div class="mt-2 d-flex gap-2">
                <select v-model="newField" class="form-select">
                  <option disabled value="">Feld hinzufügen</option>
                  <option v-for="f in possibleFields" :key="f.source" :value="f">
                    {{ f.label }}
                  </option>
                </select>
                <BButton variant="success" @click="addField">+</BButton>
              </div>

              <div class="text-end mt-3">
                <BButton variant="primary" @click="saveSettings">
                  Speichern
                </BButton>
              </div>
            </div>
          </BCardHeader>

          <BCardBody>
            <div v-if="loading" class="text-center p-5">
              <div class="spinner-border" />
            </div>

            <table v-if="!loading" class="table table-hover align-middle">
              <thead>
              <tr>
                <th v-for="c in columns" :key="c.id">{{ c.title }}</th>
                <th class="text-end">Aktionen</th>
              </tr>
              </thead>

              <tbody>
              <tr v-for="m in filteredMembers" :key="m.id">
                <td v-for="c in columns" :key="c.id">
                  <span v-if="m.fields[c.id] === true">✔</span>
                  <span v-else-if="m.fields[c.id] === false">✖</span>
                  <span v-else>{{ m.fields[c.id] }}</span>
                </td>

                <td class="text-end">
                  <BButton size="sm" variant="soft-primary" @click="editMember(m.id)">
                    <i class="ri-edit-line" />
                  </BButton>

                  <BButton
                      v-if="!m.hasUser"
                      size="sm"
                      variant="soft-info"
                      class="ms-1"
                      @click="assignUser(m)"
                  >
                    <i class="ri-user-add-line" />
                  </BButton>

                  <BButton
                      size="sm"
                      :variant="m.active ? 'soft-warning' : 'soft-success'"
                      class="ms-1"
                      @click="m.active ? disableMember(m) : enableMember(m)"
                  >
                    <i :class="m.active ? 'ri-user-unfollow-line' : 'ri-user-follow-line'" />
                  </BButton>

                  <BButton
                      size="sm"
                      variant="soft-danger"
                      class="ms-1"
                      @click="openDeleteModal(m)"
                  >
                    <i class="ri-delete-bin-line" />
                  </BButton>
                </td>
              </tr>
              </tbody>
            </table>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </Layout>
</template>

<style scoped>
.drag-handle {
  cursor: grab;
}
</style>
