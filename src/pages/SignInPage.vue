<template>
  <div class="sign-in-page">
    <NCard title="Connexion" style="max-width: 400px; margin: 80px auto">
      <NForm ref="formRef" :model="formData" :rules="rules">
        <NFormItem label="Email" path="email">
          <NInput
            v-model:value="formData.email"
            type="email"
            placeholder="votre@email.com"
            @keyup.enter="handleSignIn"
          />
        </NFormItem>
        <NFormItem label="Mot de passe" path="password">
          <NInput
            v-model:value="formData.password"
            type="password"
            placeholder="••••••••"
            show-password-on="click"
            @keyup.enter="handleSignIn"
          />
        </NFormItem>
        <NSpace vertical :size="12">
          <NButton
            type="primary"
            block
            :loading="loading"
            @click="handleSignIn"
          >
            Se connecter
          </NButton>
          <NText depth="3" style="text-align: center; display: block">
            Pas encore de compte ?
            <RouterLink to="/signup">S'inscrire</RouterLink>
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
import type { SignInPayload } from '../types/auth'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()
const api = useApi()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const formData = ref<SignInPayload>({
  email: '',
  password: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: 'Email requis', trigger: 'blur' },
    { type: 'email', message: 'Email invalide', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Mot de passe requis', trigger: 'blur' },
    { min: 6, message: 'Au moins 6 caractères', trigger: 'blur' },
  ],
}

const handleSignIn = async () => {
  await formRef.value?.validate(async (errors) => {
    if (errors) return

    loading.value = true
    try {
      const response = await api.signIn(formData.value)
      authStore.login(response.token, response.user)
      message.success(`Bienvenue ${response.user.username} !`)
      router.push('/')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur de connexion'
      message.error(errorMessage)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.sign-in-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
