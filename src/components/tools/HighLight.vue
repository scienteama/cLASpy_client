<template>
  <highlightjs :language="language" :code="code" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Dark } from 'quasar';
import 'highlight.js/lib/common';
import hljsVuePlugin from '@highlightjs/vue-plugin';

export default defineComponent({
  name: 'HighLight',

  components: {
    highlightjs: hljsVuePlugin.component,
  },

  props: {
    code: {
      type: String,
      required: true,
      default: "console.log('Hello World');",
    },
    language: {
      type: String,
      default: 'javascript',
    },
  },

  async mounted() {
    await this.loadTheme(Dark.isActive);
  },

  watch: {
    async '$q.dark.isActive'(isDark: boolean) {
      await this.loadTheme(isDark);
    },
  },

  methods: {
    async loadTheme(isDark: boolean) {
      if (isDark) {
        await import('highlight.js/styles/atom-one-dark.css');
      } else {
        await import('highlight.js/styles/atom-one-light.css');
      }
    },
  },
});
</script>
