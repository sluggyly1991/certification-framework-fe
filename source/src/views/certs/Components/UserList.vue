<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import axios from "axios";
import { BRow, BCol, BCard, BCardHeader, BCardBody, BButton } from "bootstrap-vue-next";

export default {
  name: "UserList",

  data() {
    return {
      loading: true,
      error: null,
      users: [],
    };
  },

  async mounted() {
    await this.fetchUsers();
  },

  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        const res = await axios.get("/user");
        this.users = res.data.data ?? [];
      } catch (e) {
        this.error = e;
      }
      this.loading = false;
    },

    createUser() {
      this.$router.push("/users/create");
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
        title="User"
        :breadcrumbs="[
        { label: $t('t-dashboard'), to: '/' },
        { label: $t('t-users'), active: true }
      ]"
    />

    <BRow>
      <BCol lg="12">
        <BCard no-body>

          <BCardHeader class="border-bottom-dashed d-flex justify-content-between">
            <h5 class="card-title mb-0">{{ $t('t-users') }}</h5>

            <BButton variant="primary" @click="createUser">
              <i class="ri-add-line"></i>
              {{ $t('t-add-user') }}
            </BButton>
          </BCardHeader>

          <BCardBody>

            <div v-if="loading" class="text-center p-5">
              <div class="spinner-border"></div>
            </div>

            <div v-if="error" class="alert alert-danger">
              {{ error.message }}
            </div>

            <table
                v-if="!loading && users.length"
                class="table align-middle table-hover"
            >
              <thead class="table-light">
              <tr>
                <th>Email</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>{{ u.email }}</td>
              </tr>
              </tbody>
            </table>

            <div v-if="!loading && !users.length" class="text-center p-4">
              {{ $t('t-no-users-found') }}
            </div>

          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </Layout>
</template>
