<script setup lang="ts">
import { computed } from 'vue'
import type { IndexCollectionItem } from '@nuxt/content'

const props = defineProps<{
  page: IndexCollectionItem
}>()

const aboutParagraphs = computed(() =>
  (props.page.about?.description || '')
    .split(/\n+/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
)
</script>

<template>
  <UPageSection
    :title="page.about.title"
    :ui="{
      container: '!p-0',
      title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
      description: 'text-left mt-3 text-sm sm:text-md lg:text-sm text-muted'
    }"
  >
    <template #description>
      <p
        v-for="(paragraph, idx) in aboutParagraphs"
        :key="idx"
        class="text-left mt-3 text-sm sm:text-md lg:text-sm text-muted"
      >
        {{ paragraph }}
      </p>
    </template>
  </UPageSection>
</template>

<style scoped>

</style>
