<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import axios from "axios";

export default {
  name: "MemberUserAssign",

  data() {
    return {
      loading: true,
      error: null,

      member: null,
      users: [],
      selectedUserId: "",

      createNew: false,
      form: {
        email: "",
        password: ""
      }
    };
  },

  async mounted() {
    await this.fetchData();
  },

  methods: {
    async fetchData() {
      this.loading = true;
      try {
        // Member laden
        const memberRes = await axios.get(
            `/members/${this.$route.params.id}`
        );
        this.member = memberRes.data.data;

        // User der Company laden
        const usersRes = await axios.get("/user");
        this.users = usersRes.data.data ?? [];
      } catch (e) {
        this.error = e;
      }
      this.loading = false;
    },

    async save() {
      try {
        let payload = {};

        if (this.createNew) {
          if (!this.form.email || !this.form.password) {
            alert("E-Mail und Passwort erforderlich");
            return;
          }

          payload = {
            create: true,
            email: this.form.email,
            password: this.form.password
          };
        } else {
          if (!this.selectedUserId) {
            alert("Bitte einen User auswählen");
            return;
          }

          payload = {
            userId: this.selectedUserId
          };
        }

        await axios.post(
            `/members/${this.member.id}/user`,
            payload
        );

        this.$router.push("/members");
      } catch (e) {
        alert(
            e.response?.data?.message ??
            "Fehler beim Zuweisen des Users"
        );
      }
    }
  },

  components: {
    Layout,
    PageHeader
  }
};
</script>
<template>
  <Layout>
    <PageHeader
        :title="$t('t-assign-user')"
        :breadcrumbs="[
        { label: $t('t-members'), to: '/members' },
        { label: member?.fields?.name ?? '', active: true }
      ]"
    />

    <div class="card">
      <div class="card-body">

        <div v-if="loading" class="text-center p-4">
          <div class="spinner-border"></div>
        </div>

        <div v-if="error" class="alert alert-danger">
          {{ error.message }}
        </div>

        <div v-if="!loading">

          <!-- Toggle -->
          <div class="form-check form-switch mb-3">
            <input
                class="form-check-input"
                type="checkbox"
                v-model="createNew"
            />
            <label class="form-check-label">
              {{ $t('t-create-new-user') }}
            </label>
          </div>

          <!-- Select existing -->
          <div v-if="!createNew">
            <label class="form-label">{{ $t('t-select-user') }}</label>
            <select v-model="selectedUserId" class="form-select">
              <option value="">{{ $t('t-please-select') }}</option>
              <option
                  v-for="u in users"
                  :key="u.id"
                  :value="u.id"
              >
                {{ u.email }}
              </option>
            </select>
          </div>

          <!-- Create new -->
          <div v-else>
            <div class="mb-3">
              <label class="form-label">E-Mail</label>
              <input
                  v-model="form.email"
                  type="email"
                  class="form-control"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Passwort</label>
              <input
                  type="password"
                  v-model="form.password"
                  class="form-control"
              />
            </div>
          </div>

          <!-- Save -->
          <div class="text-end mt-4">
            <button class="btn btn-primary" @click="save">
              {{ $t('t-save') }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </Layout>
</template>
