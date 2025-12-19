<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import axios from "axios";
import {
  BRow,
  BCol,
  BCard,
  BCardBody,
  BButton,
  BFormInput,
  BFormCheckbox
} from "bootstrap-vue-next";

export default {
  name: "UserCreate",

  data() {
    return {
      loading: false,
      error: null,

      form: {
        email: "",
        password: "",
        createMember: true,
        memberName: ""
      }
    };
  },

  methods: {
    async save() {
      this.loading = true;
      this.error = null;

      try {
        await axios.post("/user/create", {
          email: this.form.email,
          password: this.form.password,
          createMember: this.form.createMember,
          member: this.form.createMember
              ? { name: this.form.memberName }
              : null
        });

        this.$router.push("/user");
      } catch (e) {
        this.error = e.response?.data?.message ?? "Fehler";
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
    BCardBody,
    BButton,
    BFormInput,
    BFormCheckbox
  }
};
</script>

<template>
  <Layout>
    <PageHeader
        :title="$t('t-add-user')"
        :breadcrumbs="[
        { label: $t('t-users'), to: '/users' },
        { label: $t('t-add'), active: true }
      ]"
    />

    <BRow>
      <BCol lg="6">
        <BCard>
          <BCardBody>

            <div v-if="error" class="alert alert-danger">
              {{ error }}
            </div>

            <!-- EMAIL -->
            <div class="mb-3">
              <label class="form-label">{{ $t('t-email') }}</label>
              <BFormInput v-model="form.email" type="email" />
            </div>

            <!-- PASSWORD -->
            <div class="mb-3">
              <label class="form-label">{{ $t('t-password') }}</label>
              <BFormInput v-model="form.password" type="password" />
            </div>

            <!-- MEMBER -->
            <div class="mb-3">
              <BFormCheckbox v-model="form.createMember">
                {{ $t('t-create-member-for-certificate') }}
              </BFormCheckbox>
            </div>

            <div v-if="form.createMember" class="mb-3">
              <label class="form-label">{{ $t('t-member-name') }}</label>
              <BFormInput v-model="form.memberName" />
            </div>

            <!-- SAVE -->
            <div class="text-end">
              <BButton
                  variant="primary"
                  :disabled="loading"
                  @click="save"
              >
                {{ $t('t-save') }}
              </BButton>
            </div>

          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </Layout>
</template>
