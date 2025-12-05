<script>
import Layout from "@/layouts/main.vue";
import axios from "axios";
import Sortable from "sortablejs";
import PageHeader from "@/components/page-header.vue";

export default {
  name: "MemberSingle",

  data() {
    return {
      loading: true,
      memberId: null,

      // dynamic data
      fields: {},
      columns: [],
      editColumns: [],
      possibleFields: [],
      newField: null,

      showSettings: false,
      isAdmin: true,
    };
  },

  async mounted() {
    this.memberId = this.$route.params.id;

    await Promise.all([
      this.fetchColumns(),
      this.fetchPossibleFields(),
      this.fetchMember(),
    ]);

    this.prepareEditColumns();

    this.$nextTick(() => this.initSortable());

    this.loading = false;
  },

  methods: {
    async fetchColumns() {
      const res = await axios.get("/settings/display/members/single");
      this.columns = res.data.data.columns.sort((a, b) => a.position - b.position);
    },

    async fetchPossibleFields() {
      const res = await axios.get("/settings/display/members/possible-fields");
      this.possibleFields = res.data.data.fields;
    },

    async fetchMember() {
      const res = await axios.get(`/members/${this.memberId}`);
      this.fields = res.data.data.fields;
    },

    prepareEditColumns() {
      this.editColumns = JSON.parse(JSON.stringify(this.columns));
    },

    initSortable() {
      const el = document.getElementById("single-fields-sort");

      if (!el) return;

      Sortable.create(el, {
        animation: 150,
        handle: ".drag-handle",
        onEnd: (evt) => {
          const moved = this.editColumns.splice(evt.oldIndex, 1)[0];
          this.editColumns.splice(evt.newIndex, 0, moved);
          this.updatePositions();
        },
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
        position: this.editColumns.length + 1,
      });

      this.newField = null;

      this.$nextTick(() => this.initSortable());
    },

    async saveSettings() {
      const normalized = this.editColumns.map((c, i) => ({
        ...c,
        position: i + 1,
      }));

      await axios.post("/settings/display/members/single", {
        columns: normalized,
      });

      this.showSettings = false;
      await this.fetchColumns();
    },
  },

  components: {
    PageHeader,
    Layout,
  },
};
</script>

<template>
  <Layout>
    <PageHeader
        :title="$t('t-members-single')"
        :breadcrumbs="[
    { label: $t('t-dashboard'), to: '/' },
    { label: $t('t-members-list'), to: '/members' },
    { label: $t('t-members-single'), active: true }
  ]"
    />
    <div v-if="loading" class="text-center p-5">
      <div class="spinner-border"></div>
    </div>

    <div v-else>
      <div class="profile-foreground position-relative mx-n4 mt-n4">
        <div class="profile-wid-bg">
          <img src="@/assets/images/profile-bg.jpg" alt="" class="profile-wid-img" />
        </div>
      </div>

      <div class="pt-4 mb-4 mb-lg-3 pb-lg-4 profile-wrapper">
        <BRow class="g-4">
          <BCol cols="auto">
            <div class="avatar-lg">
              <img src="@/assets/images/users/avatar-1.jpg" alt="user-img" class="img-thumbnail rounded-circle" />
            </div>
          </BCol>

          <BCol>
            <div class="p-2">
              <h3 class="text-white mb-1">{{ fields[1] ?? "Name" }}</h3>
            </div>
          </BCol>
        </BRow>
      </div>

      <!-- ================= MAIN CONTENT ================= -->
      <BRow>
        <BCol lg="12">
          <div>
            <BTabs nav-class="animation-nav profile-nav gap-2 gap-lg-3 pt-4 text-muted" pills>

              <!-- =====================================================
                   TAB: OVERVIEW
              ===================================================== -->
              <BTab title="Overview" class="nav-item pt-4">
                <template #title>
                  <i class="ri-airplay-fill d-inline-block d-md-none"></i>
                  <span class="d-none d-md-inline-block">Overview</span>
                </template>

                <BRow>
                  <!-- ================= LEFT COLUMN ================= -->
                  <BCol xxl="3">

                    <!-- Complete profile card (unchanged) -->
                    <BCard no-body>
                      <BCardBody>
                        <h5 class="card-title mb-5">Complete Your Profile</h5>
                        <BProgress class="animated-progress custom-progress progress-label">
                          <BProgressBar :value="30" variant="danger">
                            <div class="label">30%</div>
                          </BProgressBar>
                        </BProgress>
                      </BCardBody>
                    </BCard>

                    <!-- ===================== INFO CARD (DYNAMIC!) ===================== -->
                    <BCard no-body>
                      <BCardBody>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                          <h5 class="card-title mb-0">Info</h5>

                          <button
                              v-if="isAdmin"
                              class="btn btn-soft-primary btn-sm"
                              @click="showSettings = !showSettings; $nextTick(()=>initSortable())"
                          >
                            <i class="ri-settings-3-line"></i>
                          </button>
                        </div>

                        <!-- SETTINGS PANEL -->
                        <div v-if="showSettings" class="p-3 border rounded bg-light mb-4">
                          <h6 class="mb-3">Felder bearbeiten</h6>

                          <div id="single-fields-sort">
                            <div
                                v-for="(col, i) in editColumns"
                                :key="col.id"
                                class="d-flex align-items-center gap-3 p-2 bg-white border rounded mb-2 shadow-sm"
                            >
                              <i class="ri-draggable drag-handle fs-4"></i>

                              <input v-model="col.title" class="form-control w-25" />

                              <small class="text-muted">{{ col.source }}</small>

                              <input type="checkbox" v-model="col.visible" /> sichtbar

                              <button class="btn btn-sm btn-soft-danger ms-auto" @click="editColumns.splice(i,1)">
                                <i class="ri-close-line"></i>
                              </button>
                            </div>
                          </div>

                          <hr />

                          <div class="d-flex gap-2">
                            <select v-model="newField" class="form-select w-50">
                              <option disabled value="">+ Feld auswählen…</option>
                              <option
                                  v-for="f in possibleFields"
                                  :key="f.source"
                                  :value="f"
                              >
                                {{ f.label }} ({{ f.source }})
                              </option>
                            </select>

                            <button class="btn btn-success" @click="addField">Hinzufügen</button>
                          </div>

                          <div class="text-end mt-3">
                            <button class="btn btn-light me-2" @click="showSettings=false">Abbrechen</button>
                            <button class="btn btn-primary" @click="saveSettings">Speichern</button>
                          </div>
                        </div>

                        <!-- DISPLAY INFO -->
                        <div class="table-responsive">
                          <table class="table table-borderless mb-0">
                            <tbody>
                            <tr
                                v-for="col in columns.filter(c => c.visible)"
                                :key="col.id"
                            >
                              <th class="ps-0" scope="row">{{ col.title }} :</th>
                              <td class="text-muted">{{ fields[col.id] ?? "" }}</td>
                            </tr>
                            </tbody>
                          </table>
                        </div>

                      </BCardBody>
                    </BCard>

                    <!-- other Velzon boxes untouched -->
                    <slot name="other-left-boxes"></slot>

                  </BCol>

                  <!-- ================= RIGHT COLUMN (unchanged) ================= -->
                  <BCol xxl="9">
                    <slot name="right-column"></slot>
                  </BCol>
                </BRow>
              </BTab>

              <!-- ================= OTHER TABS UNTOUCHED ================= -->
              <slot name="tabs"></slot>

            </BTabs>
          </div>
        </BCol>
      </BRow>
    </div>
  </Layout>
</template>

<style scoped>
.drag-handle {
  cursor: grab;
  opacity: 0.7;
}
.drag-handle:hover {
  opacity: 1;
}

.sortable-ghost {
  background: rgba(67, 94, 190, 0.15) !important;
  border-radius: 8px;
}

#single-fields-sort .shadow-sm:hover {
  box-shadow: 0 4px 14px rgba(67, 94, 190, 0.2) !important;
}

.btn-soft-primary {
  background: rgba(67, 94, 190, 0.15) !important;
  color: #435ebe !important;
}

.btn-soft-danger {
  background: rgba(220, 53, 69, 0.15) !important;
  color: #dc3545 !important;
}
</style>
