<script>
import Dropdown from '@/components/Dropdown.vue'
import { allowedInvitees } from '@/rights'

export default {
  components: {
    Dropdown,
  },
  data() {
    return {
      roleOptions: Object.keys(allowedInvitees)
        .filter(role => role !== 'owner')
        .map(role => ({ id: role, text: role })),
    }
  },
  computed: {
    role() {
      return this.$store.state.user.impersonate
    },
  },
  methods: {
    impersonate(role) {
      this.$store.commit('user/impersonate', role)
    },
  },
}
</script>

<template>
  <div v-if="role">
    <div style="height: 50px" />
    <div
      class="bg-primary py-2 has-text-centered"
      style="position: fixed; z-index: 99; top: 0; width: 100%; height: 50px; line-height: 2em"
    >
      Viewing site as:

      <!-- <Dropdown style="font-weight: bold; text-transform: uppercase">{{ role }}</span> -->

      <Dropdown
        :options="roleOptions"
        :v-model="role"
        @update:modelValue="impersonate"
        :label="role"
        labelStyle="text-transform: uppercase; font-weight: bold; color: #fff;"
        placeholder="Choose Role"
        style="display: inline-block"
        class="has-text-left"
      >
        <template #beforeOptions>
          <a
            @click.prevent="impersonate(null)"
            class="dropdown-item is-capitalized is-uppercase"
            style="color: #000; font-weight: bold"
            >None</a
          >
        </template>
      </Dropdown>
    </div>
  </div>
</template>
