<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import axios from "@/axios";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

import Portfolio from "./portfolio.vue";
import MarketGraph from "./market-graph.vue";
import News from "./news.vue";
import RecentActivity from "./recent-activity.vue";
import TopProgram from "./top-performers.vue";
import Currencies from "./currencies.vue";
import Trading from "./trading.vue";

import { BCard, BCol, BRow, BProgress, BCardBody } from "bootstrap-vue-next";

export default {
  data() {
    return {
      loading: true,
      error: null,

      // Certificate kommt direkt in dieses Objekt
      dashboardData: null,

      keypoints: [
        { id: 1, icon: "ri-list-check", label: "Gesamtanforderungen", value: 0 },
        { id: 2, icon: "ri-checkbox-circle-fill", label: "Erledigte Anforderungen", value: 0 },
        { id: 3, icon: "ri-error-warning-fill", label: "Offene Anforderungen", value: 0 },
      ],

      Autoplay,
    };
  },

  async mounted() {
    await this.loadDashboard();
  },

  methods: {
    async loadDashboard() {
      try {
        const res = await axios.get("/dashboard");

        // server liefert: data.certificate
        const certificate = res.data?.data?.certificate;

        if (!certificate) {
          this.error = "Ungültige Dashboard-Daten.";
          return;
        }

        this.dashboardData = certificate;

        // Keypoints setzen
        this.keypoints[0].value = certificate.totalRequirements;
        this.keypoints[1].value = certificate.completedRequirements;
        this.keypoints[2].value = certificate.openRequirements;

      } catch (err) {
        this.error = "Dashboard konnte nicht geladen werden.";
      } finally {
        this.loading = false;
      }
    },
  },

  components: {
    BCard,
    BCol,
    BRow,
    BProgress,
    BCardBody,
    Layout,
    PageHeader,
    Portfolio,
    MarketGraph,
    RecentActivity,
    TopProgram,
    News,
    Currencies,
    Trading,
    Swiper,
    SwiperSlide,
  },
};
</script>

<template>
  <Layout>
    <PageHeader title="Dashboard" pageTitle="Übersicht" />

    <!-- LOADING STATE -->
    <div v-if="loading" class="text-center py-5">
      <b-spinner label="Loading"></b-spinner>
    </div>

    <!-- ERROR STATE -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- MAIN DASHBOARD -->
    <div v-else>

      <!-- ===========================
           PROGRESSBAR OBEN
      ============================ -->
      <BRow>
        <BCol md="12">
          <BCard>
            <div class="d-flex justify-content-between mb-1">
              <span class="fw-medium">Zertifikatsfortschritt</span>
              <span class="fw-semibold">{{ dashboardData.progress }}%</span>
            </div>

            <BProgress
                animated
                :value="dashboardData.progress"
                variant="primary"
                class="progress-lg"
            />
          </BCard>
        </BCol>
      </BRow>

      <!-- ===========================
           3 KEYPOINT BOXEN
      ============================ -->
      <BRow class="mt-3">
        <BCol lg="4" md="6" v-for="item in keypoints" :key="item.id">
          <BCard no-body>
            <BCardBody>
              <div class="d-flex align-items-center">
                <div class="avatar-sm flex-shrink-0">
                  <span class="avatar-title bg-light text-primary rounded-circle fs-3">
                    <i :class="`${item.icon} align-middle`"></i>
                  </span>
                </div>

                <div class="flex-grow-1 ms-3">
                  <p class="text-uppercase fw-medium fs-12 text-muted mb-1">
                    {{ item.label }}
                  </p>
                  <h4 class="mb-0">
                    <span class="counter-value">{{ item.value }}</span>
                  </h4>
                </div>
              </div>
            </BCardBody>
          </BCard>
        </BCol>
      </BRow>

      <!-- ===========================
           REST DES DASHBOARDS
      ============================ -->

      <BRow class="mt-4">
        <BCol xxl="3">
          <Portfolio />
        </BCol>

        <BCol xxl="9" order-xxl="0" class="order-first">
          <MarketGraph />
        </BCol>
      </BRow>

      <BRow class="mt-4">
        <BCol xl="8">
          <Currencies />
        </BCol>
        <BCol xl="4">
          <Trading />
        </BCol>
      </BRow>

      <BRow class="mt-4">
        <BCol xxl="4" lg="6">
          <RecentActivity />
        </BCol>
        <BCol xxl="4" lg="6">
          <TopProgram />
        </BCol>
        <BCol xxl="4" lg="6">
          <News />
        </BCol>
      </BRow>

    </div>
  </Layout>
</template>
