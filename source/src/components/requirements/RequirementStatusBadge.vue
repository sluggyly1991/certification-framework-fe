<!-- src/components/requirements/RequirementStatusBadge.vue -->
<script>
export default {
  name: "RequirementStatusBadge",
  props: {
    completed: {
      type: Boolean,
      default: false,
    },
    validated: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    variant() {
      if (this.validated) return "badge bg-success";
      if (this.completed) return "badge bg-warning text-dark";
      return "badge bg-secondary";
    },
    text() {
      if (this.validated) return "Validiert";
      if (this.completed) return "Eingereicht";
      return "Offen";
    },
  },
};
</script>

<template>
  <span :class="variant">
    {{ text }}
  </span>
</template>
