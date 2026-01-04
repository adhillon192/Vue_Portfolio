<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt'
import { SpeedInsights } from '@vercel/speed-insights/vue'
</script>

<template>
  <div>
    <Analytics />
    <SpeedInsights />
    <UContainer class="sm:border-x border-default pt-10">
      <AppHeader :links="navLinks" />
      <slot />
      <AppFooter />
    </UContainer>
  </div>
</template>
