<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    breadcrumbs: {
      type: Array,
      default: () => []
    }
  }
};
</script>

<template>
  <BRow>
    <BCol cols="12">
      <div class="page-title-box d-sm-flex align-items-center justify-content-between">

        <!-- Title -->
        <h4 class="mb-sm-0">{{ title }}</h4>

        <!-- Breadcrumbs -->
        <div class="page-title-right">
          <ol class="breadcrumb m-0">

            <!-- Iterate breadcrumb items -->
            <li
                v-for="(item, index) in breadcrumbs"
                :key="index"
                class="breadcrumb-item"
                :class="{ active: index === breadcrumbs.length - 1 }"
            >

              <!-- Last item → plain text -->
              <span v-if="index === breadcrumbs.length - 1">
                {{ item.label }}
              </span>

              <!-- Normal breadcrumb with link -->
              <router-link
                  v-else-if="item.to"
                  :to="item.to"
              >
                {{ item.label }}
              </router-link>

              <!-- Normal breadcrumb without link -->
              <span v-else>{{ item.label }}</span>

            </li>

          </ol>
        </div>
      </div>
    </BCol>
  </BRow>
</template>
