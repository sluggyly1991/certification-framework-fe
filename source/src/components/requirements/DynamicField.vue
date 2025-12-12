<!-- src/components/requirements/DynamicField.vue -->
<script>
import FileUpload from "./FileUpload.vue";
import DropZoneUpload from "./DropZoneUpload.vue";

export default {
  name: "DynamicField",
  components: {
    FileUpload,
    DropZoneUpload,
  },
  props: {
    requirement: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: [String, Number, Array, Object, null],
      default: "",
    },
    valueData: {
      // kompletter Value-Block aus API (inkl. files, completed, validated)
      type: Object,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "upload-files", "remove-file"],
  computed: {
    formDef() {
      return this.requirement.form || {};
    },
    isFileField() {
      return this.formDef.type === "file";
    },
    isSelect() {
      return this.formDef.type === "select";
    },
    isMultiSelect() {
      return this.formDef.type === "multiselect";
    },
    isTextarea() {
      return this.formDef.type === "textarea";
    },
    isRichtext() {
      return this.formDef.type === "richtext";
    },
    isInputField() {
      return (
          !this.isFileField &&
          !this.isSelect &&
          !this.isMultiSelect &&
          !this.isTextarea &&
          !this.isRichtext
      );
    },
    inputType() {
      // mappt generische Formtypen auf HTML input types
      switch (this.formDef.type) {
        case "email":
          return "email";
        case "number":
          return "number";
        case "url":
          return "url";
        case "password":
          return "password";
        default:
          return "text";
      }
    },
    multipleFiles() {
      return !!this.formDef.multiple;
    },
    acceptString() {
      // z.B. ["pdf","png"] => ".pdf,.png"
      if (Array.isArray(this.formDef.extensions) && this.formDef.extensions.length) {
        return this.formDef.extensions.map(ext => "." + ext).join(",");
      }
      return "";
    },
    files() {
      return this.valueData?.files ?? [];
    },
  },
  methods: {
    updateValue(val) {
      this.$emit("update:modelValue", val);
    },
    handleUpload(files) {
      this.$emit("upload-files", files);
    },
    handleRemove(file) {
      this.$emit("remove-file", file);
    },
  },
};
</script>

<template>
  <div class="dynamic-field">
    <label class="form-label">
      {{ requirement.title }}
      <span
          v-if="formDef.required"
          class="text-danger"
      >
        *
      </span>
    </label>

    <p class="text-muted small mb-2">
      {{ requirement.description }}
    </p>

    <!-- AUTO / read-only (type: auto oder input === false) -->
    <div v-if="requirement.input === false || requirement.type === 'auto'">
      <div class="form-control-plaintext border rounded bg-light px-2 py-1">
        {{ modelValue || "Wird automatisch berechnet / aus Datenquellen ermittelt." }}
      </div>
    </div>

    <!-- TEXTAREA -->
    <div v-else-if="isTextarea">
      <textarea
          class="form-control"
          rows="4"
          :required="formDef.required"
          :disabled="disabled"
          :placeholder="formDef.placeholder || ''"
          :value="modelValue"
          @input="updateValue($event.target.value)"
      ></textarea>
    </div>

    <!-- RICHTEXT (hier erstmal einfache Textarea, kann später z.B. CKEditor werden) -->
    <div v-else-if="isRichtext">
      <!-- TODO: CKEditor-Integration, z.B. <ckeditor v-model="..." /> -->
      <textarea
          class="form-control"
          rows="6"
          :required="formDef.required"
          :disabled="disabled"
          :placeholder="formDef.placeholder || ''"
          :value="modelValue"
          @input="updateValue($event.target.value)"
      ></textarea>
      <div class="form-text">
        Rich-Text-Unterstützung kann hier später via Editor eingebunden werden.
      </div>
    </div>

    <!-- SELECT -->
    <div v-else-if="isSelect">
      <select
          class="form-select"
          :required="formDef.required"
          :disabled="disabled"
          :value="modelValue"
          @change="updateValue($event.target.value)"
      >
        <option value="">
          {{ formDef.placeholder || "Bitte auswählen…" }}
        </option>
        <option
            v-for="opt in formDef.options || []"
            :key="opt"
            :value="opt"
        >
          {{ opt }}
        </option>
      </select>
    </div>

    <!-- MULTISELECT -->
    <div v-else-if="isMultiSelect">
      <select
          class="form-select"
          multiple
          :disabled="disabled"
          @change="updateValue(Array.from($event.target.selectedOptions).map(o => o.value))"
      >
        <option
            v-for="opt in formDef.options || []"
            :key="opt"
            :value="opt"
            :selected="Array.isArray(modelValue) ? modelValue.includes(opt) : false"
        >
          {{ opt }}
        </option>
      </select>
      <div class="form-text">
        Mehrfachauswahl mit STRG/CMD bzw. SHIFT.
      </div>
    </div>

    <!-- FILE / MULTIFILE -->
    <div v-else-if="isFileField">
      <DropZoneUpload
          :existingFiles="files"
          :multiple="multipleFiles"
          :accept="acceptString"
          @upload="handleUpload"
          @remove="handleRemove"
      />
    </div>

    <!-- STANDARD INPUT (text, email, url, number, …) -->
    <div v-else-if="isInputField">
      <input
          :type="inputType"
          class="form-control"
          :required="formDef.required"
          :disabled="disabled"
          :placeholder="formDef.placeholder || ''"
          :value="modelValue"
          @input="updateValue($event.target.value)"
      />
    </div>

    <!-- Fallback -->
    <div v-else>
      <input
          type="text"
          class="form-control"
          :value="modelValue"
          @input="updateValue($event.target.value)"
      />
    </div>
  </div>
</template>

<style scoped>
.dynamic-field {
  margin-bottom: 1.5rem;
}
</style>
