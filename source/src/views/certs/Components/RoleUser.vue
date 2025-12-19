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
  name: "RoleMembers",

  data() {
    return {
      loading: true,
      error: null,

      role: null,
      members: [],              // alle Member des Zertifikats
      selectedMemberIds: []     // Tags
    };
  },

  async mounted() {
    await this.fetchData();
  },

  computed: {
    selectedMembers() {
      return this.members.filter(m =>
          this.selectedMemberIds.includes(m.id)
      );
    },

    availableMembers() {
      return this.members.filter(
          m => !this.selectedMemberIds.includes(m.id)
      );
    }
  },

  methods: {
    async fetchData() {
      this.loading = true;

      try {
        const res = await axios.get(
            `/roles/${this.$route.params.id}/members`
        );

        this.role = res.data.data.role;
        this.members = res.data.data.members;

        this.selectedMemberIds = this.members
            .filter(m => m.assigned)
            .map(m => m.id);

      } catch (e) {
        this.error = e;
      }

      this.loading = false;
    },

    addMember(memberId) {
      if (!this.selectedMemberIds.includes(memberId)) {
        this.selectedMemberIds.push(memberId);
      }
    },

    removeMember(memberId) {
      this.selectedMemberIds = this.selectedMemberIds.filter(
          id => id !== memberId
      );
    },

    async save() {
      try {
        await axios.post(
            `/roles/${this.$route.params.id}/members`,
            { members: this.selectedMemberIds }
        );

        this.$toast?.success?.(
            this.$t("t-saved-successfully")
        );
      } catch (e) {
        alert(this.$t("t-save-error"));
      }
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
        :title="`${$t('t-members')} – ${role?.label ?? ''}`"
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
              {{ $t('t-assign-members-to-role') }}
            </h5>
          </BCardHeader>

          <BCardBody>

            <div v-if="loading" class="text-center p-5">
              <div class="spinner-border"></div>
            </div>

            <div v-if="error" class="alert alert-danger">
              {{ error.message }}
            </div>

            <div v-if="!loading">

              <!-- TAGS -->
              <div class="mb-3">
                <span
                    v-for="member in selectedMembers"
                    :key="member.id"
                    class="badge bg-primary me-2 mb-2 d-inline-flex align-items-center"
                >
                  {{ member.label }}
                  <small class="ms-1 text-light">
                    ({{ member.email }})
                  </small>
                  <i
                      class="ri-close-line ms-2 cursor-pointer"
                      @click="removeMember(member.id)"
                  ></i>
                </span>

                <span v-if="selectedMembers.length === 0"
                      class="text-muted">
                  {{ $t('t-no-members-assigned') }}
                </span>
              </div>

              <!-- ADD MEMBER -->
              <select
                  class="form-select mb-3"
                  @change="addMember(Number($event.target.value))"
              >
                <option value="">
                  {{ $t('t-add-member') }}
                </option>

                <option
                    v-for="member in availableMembers"
                    :key="member.id"
                    :value="member.id"
                >
                  {{ member.label }} ({{ member.email }})
                </option>
              </select>

              <div class="text-end">
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
