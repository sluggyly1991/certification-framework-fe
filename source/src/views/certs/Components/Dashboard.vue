<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";

import {
  AlertTriangleIcon,
  UsersIcon,
  MapPinIcon,
  TagIcon,
  CheckCircleIcon,
  ClockIcon,
  ClipboardIcon,
  ListIcon
} from "@zhuowenli/vue-feather-icons";

export default {
  name: "Dashboard",
  components: {
    Layout,
    PageHeader,
    AlertTriangleIcon,
    UsersIcon,
    MapPinIcon,
    TagIcon,
    CheckCircleIcon,
    ClockIcon,
    ClipboardIcon,
    ListIcon
  },
  data() {
    return {
      // =====================
      // 🔔 Alerts
      // =====================
      alerts: [
        {
          severity: "danger",
          message: "2 Anforderungen sind überfällig"
        },
        {
          severity: "warning",
          message: "1 Aufgabe ist überfällig"
        }
      ],

      // =====================
      // 👥 Member
      // =====================
      members: {
        total: 12,
        active: 10,
        invited: 2
      },

      // =====================
      // 🏢 Units
      // =====================
      units: {
        total: 3,
        items: ["Praxis Münster", "Praxis Hamm", "Praxis Dortmund"]
      },

      // =====================
      // 🏷️ Tags
      // =====================
      tags: {
        total: 8,
        top: ["Hygiene", "QM", "Datenschutz", "IT", "Personal"]
      },

      // =====================
      // 🧾 REQUIREMENTS (Zertifikat)
      // =====================
      requirements: {
        total: 32,
        fulfilled: 25,
        open: 5,
        overdue: 2
      },

      // =====================
      // 📋 TASKS (operativ)
      // =====================
      tasks: {
        total: 24,
        done: 12,
        inProgress: 6,
        open: 5,
        overdue: 1
      }
    };
  }
};
</script>

<template>
  <Layout>
    <PageHeader title="Dashboard" pageTitle="Übersicht" />

    <!-- 🔔 ALERTS -->
    <BRow v-if="alerts.length">
      <BCol cols="12">
        <BAlert
            v-for="(alert, index) in alerts"
            :key="index"
            :variant="alert.severity"
            class="d-flex align-items-center"
        >
          <AlertTriangleIcon class="me-2" />
          {{ alert.message }}
        </BAlert>
      </BCol>
    </BRow>

    <!-- 👥 / 🏢 / 🏷️ -->
    <BRow class="mt-3">
      <BCol xl="4">
        <BCard>
          <UsersIcon class="me-2" />
          <h6>Member</h6>
          <h3>{{ members.total }}</h3>
          <small>{{ members.active }} aktiv · {{ members.invited }} eingeladen</small>
        </BCard>
      </BCol>

      <BCol xl="4">
        <BCard>
          <MapPinIcon class="me-2" />
          <h6>Standorte</h6>
          <h3>{{ units.total }}</h3>
          <ul class="list-unstyled mb-0">
            <li v-for="(u, i) in units.items" :key="i">{{ u }}</li>
          </ul>
        </BCard>
      </BCol>

      <BCol xl="4">
        <BCard>
          <TagIcon class="me-2" />
          <h6>Tags</h6>
          <p>{{ tags.total }} aktiv</p>
          <BBadge
              v-for="(tag, index) in tags.top"
              :key="index"
              variant="soft-primary"
              class="me-1 mb-1"
          >
            {{ tag }}
          </BBadge>
        </BCard>
      </BCol>
    </BRow>

    <!-- 🧾 REQUIREMENTS -->
    <BRow class="mt-4">
      <BCol xl="6">
        <BCard>
          <ClipboardIcon class="me-2 text-primary" />
          <h5>Anforderungen (Zertifikat)</h5>

          <BRow class="text-center mt-3">
            <BCol>
              <CheckCircleIcon class="text-success" />
              <h4>{{ requirements.fulfilled }}</h4>
              <small>Erfüllt</small>
            </BCol>
            <BCol>
              <ClockIcon class="text-warning" />
              <h4>{{ requirements.open }}</h4>
              <small>Offen</small>
            </BCol>
            <BCol>
              <AlertTriangleIcon class="text-danger" />
              <h4>{{ requirements.overdue }}</h4>
              <small>Überfällig</small>
            </BCol>
          </BRow>

          <BProgress
              class="mt-3"
              height="8px"
              :value="(requirements.fulfilled / requirements.total) * 100"
          />
          <small class="text-muted">
            {{ requirements.fulfilled }} von {{ requirements.total }} Anforderungen erfüllt
          </small>
        </BCard>
      </BCol>

      <!-- 📋 TASKS -->
      <BCol xl="6">
        <BCard>
          <ListIcon class="me-2 text-dark" />
          <h5>Aufgaben (operativ)</h5>

          <BRow class="text-center mt-3">
            <BCol>
              <CheckCircleIcon class="text-success" />
              <h4>{{ tasks.done }}</h4>
              <small>Erledigt</small>
            </BCol>
            <BCol>
              <ClockIcon class="text-warning" />
              <h4>{{ tasks.inProgress }}</h4>
              <small>In Bearbeitung</small>
            </BCol>
            <BCol>
              <ListIcon class="text-primary" />
              <h4>{{ tasks.open }}</h4>
              <small>Offen</small>
            </BCol>
            <BCol>
              <AlertTriangleIcon class="text-danger" />
              <h4>{{ tasks.overdue }}</h4>
              <small>Überfällig</small>
            </BCol>
          </BRow>

          <BProgress
              class="mt-3"
              height="8px"
              :value="(tasks.done / tasks.total) * 100"
          />
          <small class="text-muted">
            {{ tasks.done }} von {{ tasks.total }} Aufgaben erledigt
          </small>
        </BCard>
      </BCol>
    </BRow>

  </Layout>
</template>
