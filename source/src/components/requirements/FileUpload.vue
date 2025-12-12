<!-- src/components/requirements/FileUpload.vue -->
<script>
export default {
  name: "FileUpload",
  props: {
    files: {
      type: Array,
      default: () => [],
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    accept: {
      type: String,
      default: "", // z.B. ".pdf,.png"
    },
    uploading: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: "Datei hochladen",
    },
  },
  emits: ["upload", "remove"],
  methods: {
    onFileChange(event) {
      const files = event.target.files;
      if (!files || !files.length) return;
      this.$emit("upload", files);
      // Input zurücksetzen, damit der gleiche File erneut gewählt werden kann
      event.target.value = "";
    },
    onRemove(file) {
      this.$emit("remove", file);
    },
  },
};
</script>

<template>
  <div class="file-upload-component">
    <label class="form-label d-block">{{ label }}</label>

    <div class="input-group mb-2">
      <input
          type="file"
          class="form-control"
          :multiple="multiple"
          :accept="accept"
          @change="onFileChange"
          :disabled="uploading"
      />
      <button
          class="btn btn-outline-secondary"
          type="button"
          disabled
      >
        <span
            v-if="uploading"
            class="spinner-border spinner-border-sm me-1"
        ></span>
        Upload
      </button>
    </div>

    <ul v-if="files && files.length" class="list-group">
      <li
          v-for="file in files"
          :key="file.id || file.filename"
          class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div class="me-2">
          <i class="ri-file-2-line me-1"></i>
          <a
              v-if="file.url"
              :href="file.url"
              target="_blank"
              rel="noopener"
          >
            {{ file.filename }}
          </a>
          <span v-else>{{ file.filename }}</span>
        </div>

        <button
            type="button"
            class="btn btn-sm btn-soft-danger"
            @click="onRemove(file)"
        >
          <i class="ri-delete-bin-line"></i>
        </button>
      </li>
    </ul>

    <p v-else class="text-muted small mb-0">
      Noch keine Dateien hochgeladen.
    </p>
  </div>
</template>

<style scoped>
.file-upload-component {
  margin-bottom: 1rem;
}
</style>
