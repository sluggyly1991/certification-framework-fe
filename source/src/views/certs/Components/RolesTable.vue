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
  name: "Roles",

  data() {
    return {
      loading: true,
      error: null,

      roles: [],
      searchQuery: ""
    };
  },

  async mounted() {
    await this.fetchRoles();
  },

  computed: {
    filteredRoles() {
      if (!this.searchQuery) return this.roles;

      const s = this.searchQuery.toLowerCase();
      return this.roles.filter(r =>
          r.label.toLowerCase().includes(s)
      );
    }
  },

  methods: {
    async fetchRoles() {
      this.loading = true;

      try {
        const res = await axios.get("/roles");
        this.roles = res.data.data ?? [];
      } catch (e) {
        this.error = e;
      }

      this.loading = false;
    },

    goToPermissions(role) {
      this.$router.push(`/roles/${role.id}/permissions`);
    },

    goToUsers(role) {
      this.$router.push(`/roles/${role.id}/user`);
    },

    createRole() {
      this.$router.push("/roles/create");
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
        title="Rollen"
        :breadcrumbs="[
        { label: 'Dashboard', to: '/' },
        { label: 'Rollen', active: true }
      ]"
    />

    <BRow>
      <BCol lg="12">
        <BCard no-body>

          <!-- HEADER -->
          <BCardHeader class="border-bottom-dashed">
            <BRow class="g-4 align-items-center">
              <BCol sm>
                <h5 class="card-title mb-0">Rollenübersicht</h5>
              </BCol>

              <BCol sm="auto" class="d-flex align-items-center gap-2">

                <!-- Neue Rolle -->
                <BButton
                    variant="primary"
                    @click="createRole"
                >
                  <i class="ri-add-line"></i>
                  Neue Rolle
                </BButton>

                <!-- Search -->
                <div class="search-box">
                  <input
                      type="text"
                      class="form-control search"
                      placeholder="Rolle suchen..."
                      v-model="searchQuery"
                  />
                  <i class="ri-search-line search-icon"></i>
                </div>

              </BCol>
            </BRow>
          </BCardHeader>

          <!-- BODY -->
          <BCardBody>

            <div v-if="loading" class="text-center p-5">
              <div class="spinner-border"></div>
            </div>

            <div v-if="error" class="alert alert-danger">
              Fehler: {{ error.message }}
            </div>

            <div
                v-if="!loading && filteredRoles.length > 0"
                class="table-responsive table-card"
            >
              <table class="table align-middle table-hover">
                <thead class="table-light text-muted">
                <tr>
                  <th>Rolle</th>
                  <th class="text-end">Aktionen</th>
                </tr>
                </thead>

                <tbody>
                <tr
                    v-for="role in filteredRoles"
                    :key="role.id"
                >
                  <td class="fw-semibold">
                    {{ role.label }}
                  </td>

                  <td class="text-end">

                    <!-- Permissions -->
                    <BButton
                        size="sm"
                        variant="soft-primary"
                        class="me-2"
                        @click="goToPermissions(role)"
                    >
                      <i class="ri-shield-keyhole-line"></i>
                      Berechtigungen
                    </BButton>

                    <!-- Assign Users -->
                    <BButton
                        size="sm"
                        variant="soft-success"
                        @click="goToUsers(role)"
                    >
                      <i class="ri-user-add-line"></i>
                      User zuweisen
                    </BButton>

                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            <div
                v-if="!loading && filteredRoles.length === 0"
                class="text-center p-4"
            >
              <h5>Keine Rollen gefunden</h5>
            </div>

          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </Layout>
</template>

<style scoped>
.search-box {
  position: relative;
}

.search-box .search {
  padding-left: 2.5rem;
}

.search-box .search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}
</style>
