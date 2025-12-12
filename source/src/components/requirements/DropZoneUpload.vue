<script>
import { ref, watch } from "vue";
import DropZone from "@/components/widgets/dropZone";

export default {
  name: "DropZoneUpload",

  components: { DropZone },

  props: {
    existingFiles: {
      type: Array,
      default: () => [],
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    accept: {
      type: String,
      default: "",
    },
  },

  emits: ["upload", "remove"],

  setup(props, { emit }) {
    const files = ref([...props.existingFiles]); // bestehende + neue

    // Datei per Drag & Drop
    const drop = (e) => {
      const droppedFiles = Array.from(e.dataTransfer.files);

      droppedFiles.forEach((f) => files.value.push(f));
      emit("upload", droppedFiles);
    };

    // Datei per Auswahldialog
    const selectedFile = (event) => {
      const selected = Array.from(event.target.files);

      selected.forEach((f) => files.value.push(f));
      emit("upload", selected);

      // Reset input
      event.target.value = "";
    };

    const removeFile = (file) => {
      files.value = files.value.filter((f) => f !== file);
      emit("remove", file);
    };

    return {
      files,
      drop,
      selectedFile,
      removeFile,
    };
  },
};
</script>

<template>
  <div class="dropzone-wrapper">

    <DropZone
        @drop.prevent="drop"
        @change="selectedFile"
        :accept="accept"
        :multiple="multiple"
    />

    <!-- Preview -->
    <ul class="list-unstyled mb-0 mt-3">
      <li
          v-for="(file, index) in files"
          :key="index"
          class="border rounded p-2 mb-2 d-flex justify-content-between align-items-center"
      >
        <div class="me-2">
          <strong>{{ file.name || file.filename }}</strong>
          <div class="text-muted small">
            {{ (file.size / 1024).toFixed(1) }} KB
          </div>
        </div>

        <button
            class="btn btn-sm btn-soft-danger"
            @click="removeFile(file)"
        >
          <i class="ri-delete-bin-line"></i>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.dropzone-wrapper {
  border: 2px dashed #ced4da;
  padding: 10px;
  border-radius: 6px;
}
</style>
