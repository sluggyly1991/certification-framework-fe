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
  BButton
} from "bootstrap-vue-next";

export default {
  name: "RolePermissions",

  data() {
    return {
      loading: true,
      error: null,

      role: null,
      permissions: [] // flat list
    };
  },

  async mounted() {
    await this.fetchPermissions();
  },

  computed: {
    /**
     * Permissions nach Gruppe gruppieren
     * { members: [...], tasks: [...] }
     */
    groupedPermissions() {
      const groups = {};
      this.permissions.forEach(p => {
        if (!groups[p.group]) {
          groups[p.group] = [];
        }
        groups[p.group].push(p);
      });
      return groups;
    }
  },

  methods: {
    async fetchPermissions() {
      this.loading = true;

      try {
        const res = await axios.get(
            `/roles/${this.$route.params.id}/permissions`
        );

        this.role = res.data.data.role;
        this.permissions = res.data.data.permissions;
      } catch (e) {
        this.error = e;
      }

      this.loading = false;
    },

    /**
     * 2 Permissions pro Zeile (pro Gruppe)
     */
    groupRows(group) {
      const rows = [];
      for (let i = 0; i < group.length; i += 2) {
        rows.push(group.slice(i, i + 2));
      }
      return rows;
    },

    /**
     * Gruppen-Switch: alles an / aus
     */
    toggleGroup(groupKey, value) {
      this.groupedPermissions[groupKey].forEach(p => {
        p.allowed = value;
      });
    },

    /**
     * true, wenn ALLE Permissions der Gruppe aktiv
     */
    isGroupEnabled(groupKey) {
      return this.groupedPermissions[groupKey]
          .every(p => p.allowed === true);
    },

    async save() {
      const payload = {};
      this.permissions.forEach(p => {
        payload[p.code] = p.allowed === true;
      });

      try {
        await axios.post(
            `/roles/${this.$route.params.id}/permissions`,
            { permissions: payload }
        );

        this.$toast?.success?.(
            this.$t("t-saved-successfully")
        );
      } catch (e) {
        alert("Fehler beim Speichern der Berechtigungen.");
      }
    },

    /**
     * Übersetzter Gruppen-Titel
     */
    groupTitle(groupKey) {
      return this.$t(`t-${groupKey}`);
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
    BButton
  }
};
</script>


<template>
  <Layout>
    <PageHeader
        :title="`Berechtigungen – ${role?.label ?? ''}`"
        :breadcrumbs="[
        { label: $t('t-dashboard'), to: '/' },
        { label: $t('t-roles'), to: '/roles' },
        { label: role?.label ?? '', active: true }
      ]"
    />

    <BRow>
      <BCol lg="12">
        <BCard no-body>

          <BCardHeader class="border-bottom-dashed">
            <h5 class="card-title mb-0">
              {{ $t('t-edit-permissions') }}
            </h5>
          </BCardHeader>

          <BCardBody>

            <div v-if="loading" class="text-center p-5">
              <div class="spinner-border"></div>
            </div>

            <div v-if="error" class="alert alert-danger">
              {{ error.message }}
            </div>

            <!-- Gruppen -->
            <div v-if="!loading">
              <div
                  v-for="(group, groupKey) in groupedPermissions"
                  :key="groupKey"
                  class="mb-4"
              >

                <!-- Gruppen-Header -->
                <div
                    class="d-flex justify-content-between align-items-center mb-3"
                >
                  <h6 class="mb-0 text-uppercase text-muted">
                    {{ groupTitle(groupKey) }}
                  </h6>

                  <!-- Gruppen-Switch -->
                  <div class="form-check form-switch form-switch-lg form-switch-info">
                    <input
                        class="form-check-input"
                        type="checkbox"
                        role="switch"
                        :checked="isGroupEnabled(groupKey)"
                        @change="toggleGroup(groupKey, $event.target.checked)"
                    />
                  </div>
                </div>

                <div
                    v-for="(row, index) in groupRows(group)"
                    :key="index"
                    class="row mb-3"
                >
                  <div
                      v-for="perm in row"
                      :key="perm.code"
                      class="col-md-6"
                  >
                    <div
                        class="border rounded p-3 h-100 d-flex justify-content-between align-items-start permission-card"
                    >
                      <div>
                        <div class="fw-semibold">
                          {{ perm.description }}
                        </div>
                        <div class="text-muted small">
                          {{ perm.code }}
                        </div>
                      </div>

                      <!-- Einzel-Switch -->
                      <div class="form-check form-switch form-switch-md form-switch-info">
                        <input
                            class="form-check-input"
                            type="checkbox"
                            role="switch"
                            v-model="perm.allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Save -->
              <div class="text-end mt-4">
                <BButton variant="primary" @click="save">
                  {{ $t('t-save') }}
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
.permission-card {
  transition: background 0.15s ease-in-out;
}

.permission-card:hover {
  background: rgba(67, 94, 190, 0.05);
}
</style>
