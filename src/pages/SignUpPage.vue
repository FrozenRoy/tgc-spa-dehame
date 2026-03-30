<template>
  <div class="sign-up-page">
    <NCard title="Inscription" class="auth-card">
      <NForm ref="formRef" :model="formData" :rules="rules">
        <NFormItem label="Nom d'utilisateur" path="username">
          <NInput
            v-model:value="formData.username"
            placeholder="votre_pseudo"
            @keyup.enter="handleSignUp"
          />
        </NFormItem>
        <NFormItem label="Email" path="email">
          <NInput
            v-model:value="formData.email"
            type="email"
            placeholder="votre@email.com"
            @keyup.enter="handleSignUp"
          />
        </NFormItem>
        <NFormItem label="Mot de passe" path="password">
          <NInput
            v-model:value="formData.password"
            type="password"
            placeholder="••••••••"
            show-password-on="click"
            @keyup.enter="handleSignUp"
          />
        </NFormItem>
        <NSpace vertical :size="12">
          <NButton
            type="primary"
            block
            :loading="loading"
            @click="handleSignUp"
          >
            S'inscrire
          </NButton>
          <NText depth="3" style="text-align: center; display: block">
            Déjà un compte ?
            <RouterLink to="/signin">Se connecter</RouterLink>
          </NText>
        </NSpace>
      </NForm>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '../composables/useApi'
import { useAuthStore } from '../store/auth'
import type { SignUpPayload } from '../types/auth'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()
const api = useApi()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const formData = ref<SignUpPayload>({
  username: '',
  email: '',
  password: '',
})

const rules: FormRules = {
  username: [
    { required: true, message: "Nom d'utilisateur requis", trigger: 'blur' },
    { min: 3, message: 'Au moins 3 caractères', trigger: 'blur' },
  ],
  email: [
    { required: true, message: 'Email requis', trigger: 'blur' },
    { type: 'email', message: 'Email invalide', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Mot de passe requis', trigger: 'blur' },
    { min: 6, message: 'Au moins 6 caractères', trigger: 'blur' },
  ],
}

const handleSignUp = async () => {
  await formRef.value?.validate(async (errors) => {
    if (errors) return

    loading.value = true
    try {
      const response = await api.signUp(formData.value)
      authStore.login(response.token, response.user)
      message.success(`Compte créé ! Bienvenue ${response.user.username} !`)
      router.push('/')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur lors de l'inscription"
      message.error(errorMessage)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.sign-up-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
}

.auth-card {
  width: min(100%, 420px);
}

@media (min-width: 768px) {
  .sign-up-page {
    padding: 40px 16px;
  }
}
</style>
