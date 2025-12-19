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
  BButton,
  BFormInput
} from "bootstrap-vue-next";

export default {
  name: "RoleCreate",

  data() {
    return {
      loading: false,
      error: null,

      label: ""
    };
  },

  methods: {
    async save() {
      if (!this.label.trim()) {
        this.error = "Bitte einen Rollennamen eingeben";
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const res = await axios.post("/roles/create", {
          label: this.label
        });

        const roleId = res.data.data.id;

        // direkt zu Permissions weiter
        this.$router.push(`/roles/${roleId}/permissions`);
      } catch (e) {
        this.error = e.response?.data?.message ?? "Fehler beim Anlegen der Rolle";
      }

      this.loading = false;
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
    BButton,
    BFormInput
  }
};
</script>

<template>
  <Layout>
    <PageHeader
        :title="$t('t-create-role')"
        :breadcrumbs="[
        { label: $t('t-dashboard'), to: '/' },
        { label: $t('t-roles'), to: '/roles' },
        { label: $t('t-create-role'), active: true }
      ]"
    />

    <BRow>
      <BCol lg="12">
        <BCard no-body>

          <BCardHeader class="border-bottom-dashed">
            <h5 class="card-title mb-0">
              {{ $t('t-create-role') }}
            </h5>
          </BCardHeader>

          <BCardBody>

            <div v-if="error" class="alert alert-danger">
              {{ error }}
            </div>

            <div class="mb-3">
              <label class="form-label">
                {{ $t('t-role-name') }}
              </label>

              <BFormInput
                  v-model="label"
                  :placeholder="$t('t-role-name-placeholder')"
              />
            </div>

            <div class="text-end">
              <BButton
                  variant="light"
                  class="me-2"
                  @click="$router.push('/roles')"
              >
                {{ $t('t-cancel') }}
              </BButton>

              <BButton
                  variant="primary"
                  :disabled="loading"
                  @click="save"
              >
                {{ $t('t-create') }}
              </BButton>
            </div>

          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </Layout>
</template>
