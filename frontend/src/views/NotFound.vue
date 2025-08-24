<template>
  <div class="not-found">
    <div class="container">
      <van-empty description="Page not found">
        <template #image>
          <van-icon name="warning-o" size="100" color="#ee0a24" />
        </template>
      </van-empty>
      
      <div class="actions">
        <van-button type="primary" @click="goHome">
          Go to Dashboard
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.not-found {
  padding: 2rem 1rem;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions {
  text-align: center;
  margin-top: 2rem;
}
</style>