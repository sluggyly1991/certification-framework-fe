<script>
import { required, email, helpers } from "@vuelidate/validators"
import useVuelidate from "@vuelidate/core"

export default {
  setup() {
    return { v$: useVuelidate() }
  },

  data() {
    return {
      email: "",
      password: "",
      processing: false,
      authError: null,
    }
  },

  validations() {
    return {
      email: {
        required: helpers.withMessage("Email is required", required),
        email: helpers.withMessage("Please enter valid email", email),
      },
      password: {
        required: helpers.withMessage("Password is required", required),
      },
    }
  },

  methods: {
    async submitLogin() {
      this.authError = null
      this.processing = true

      this.v$.$touch()
      if (this.v$.$invalid) {
        this.processing = false
        return
      }

      try {
        await this.$store.dispatch("auth/login", {
          email: this.email,
          password: this.password,
        })

        // 🔥 nach erfolgreichem Login redirecten
        this.$router.push({ name: "dashboard" })
      } catch (err) {
        this.authError = err?.message || "Login failed"
      }

      this.processing = false
    }
  },
}
</script>

<template>
  <div class="auth-page-wrapper pt-5">
    <div class="auth-one-bg-position auth-one-bg" id="auth-particles">
      <div class="bg-overlay"></div>

      <div class="shape">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
             viewBox="0 0 1440 120">
          <path d="M 0,36 C 144,53.6 432,123.2 720,124 C 1008,124.8 1296,56.8 1440,40L1440 140L0 140z"></path>
        </svg>
      </div>
    </div>

    <div class="auth-page-content">
      <BContainer>
        <BRow class="justify-content-center">
          <BCol md="8" lg="6" xl="5">
            <BCard no-body class="mt-4">
              <BCardBody class="p-4">
                <div class="text-center mt-2">
                  <h5 class="text-primary">Welcome Back!</h5>
                  <p class="text-muted">Sign in to continue.</p>
                </div>

                <div class="p-2 mt-4">

                  <b-alert
                      v-if="authError"
                      variant="danger"
                      class="mt-3"
                      dismissible
                  >
                    {{ authError }}
                  </b-alert>

                  <form @submit.prevent="submitLogin">

                    <div class="mb-3">
                      <label class="form-label">Email</label>
                      <input
                          v-model="email"
                          type="email"
                          class="form-control"
                          placeholder="Enter email"
                      />
                      <small class="text-danger" v-if="v$.email.$error">
                        {{ v$.email.$errors[0].$message }}
                      </small>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Password</label>
                      <input
                          v-model="password"
                          type="password"
                          class="form-control"
                          placeholder="Enter password"
                      />
                      <small class="text-danger" v-if="v$.password.$error">
                        {{ v$.password.$errors[0].$message }}
                      </small>
                    </div>

                    <div class="mt-4">
                      <BButton
                          variant="success"
                          class="w-100"
                          type="submit"
                          :disabled="processing"
                      >
                        {{ processing ? "Please wait..." : "Sign In" }}
                      </BButton>
                    </div>

                  </form>

                </div>
              </BCardBody>
            </BCard>
          </BCol>
        </BRow>
      </BContainer>
    </div>
  </div>
</template>
