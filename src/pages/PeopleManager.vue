<script>
import _ from 'lodash'
import dayjs from 'dayjs'
import PersonDetailLink from '@/components/PersonDetailLink'
import SortableTableHeading from '@/components/SortableTableHeading'
import StaticCoverImage from '@/components/StaticCoverImage'
import { remove as diacritics } from 'diacritics'

/** Generates a sort token that will sort empty strings to the end regardless of sort direction. */
const sortEmptyToEnd = (s, dir) =>
  `${dir === 'asc' && s === '' ? 1 : 0}-${s}`

export default {
  name: 'PeopleManager',
  components: {
    PersonDetailLink,
    SortableTableHeading,
    StaticCoverImage,
  },
  data() {
    return {
      search: '',
      sortConfig: {
        field: 'created',
        dir: 'desc',
      },
    }
  },

  computed: {

    people() {

      // sort people by the sort config
      const sort = list => {
        const sorted = _.sortBy(list, [
          // person => this.sortConfig.field === 'authors' ? sortEmptyToEnd(this.authors(person.creators), this.sortConfig.dir)
          // : this.sortConfig.field === 'illustrators' ? sortEmptyToEnd(this.illustrators(person.creators), this.sortConfig.dir)
          person => this.sortConfig.field === 'title' ? sortEmptyToEnd((person.title || person.role || '').toLowerCase(), this.sortConfig.dir)
          : this.sortConfig.field === 'created' ? dayjs(person.created)
          : this.sortConfig.field === 'updated' ? dayjs(person.updated)
          : (person[this.sortConfig.field] || '').toLowerCase(),
          'nameLower'
        ])
        return this.sortConfig.dir === 'desc' ? _.reverse(sorted) : sorted
      }

      // filter people by the active search
      const filter = list => this.search
        ? list.filter(person => diacritics([
          person.created,
          person.name,
          person.title,
          person.role,
        ].join(' ')).toLowerCase().includes(diacritics(this.search.trim()).toLowerCase()))
        : list

      return sort(filter(this.peopleList))
    },

    peopleList() {
      return this.$store.getters['people/list']()
        .map(person => ({
          ...person,
          nameLower: person.name.toLowerCase(),
        }))
    }

  },

  methods: {

    formatDate(d) {
      return dayjs(d).format('M/D/YYYY hh:mm')
    },

    async remove(id) {
      this.$store.commit('ui/setBusy', true)
      try {
        await this.$store.dispatch('people/remove', id)
      }
      finally {
        this.$store.commit('ui/setBusy', false)
      }
    },

  }
}

</script>

<template>

  <div class="is-flex is-justify-content-center m-20 mb-40">
    <div class="is-flex-grow-1 mx-20" style="max-width: 900px;">

      <div class="mb-5">
        <router-link :to="{ name: 'Dashboard' }" class="is-uppercase is-primary">&lt; Back to Dashboard</router-link>
      </div>

      <h1 class="title divider-bottom mb-30">People Manager</h1>

      <div class="mb-30 is-flex is-justify-content-space-between">
        <router-link class="button is-rounded is-primary mr-20" :to="{name:'BookManagerAddForm'}">Add Person</router-link>
        <div class="is-flex is-align-items-center">
          <i class="fas fa-search" style="transform: translateX(23px); z-index: 10; opacity: 0.3;" />
          <input v-model="search" class="input" placeholder="Search" style="padding-left: 30px;">
        </div>
      </div>

      <div v-if="!people.length" class="w-100 my-100 has-text-centered">
        <h2 class="mb-20">No matching people</h2>
        <p><a @click.prevent="search = ''" class="button is-rounded is-primary">Reset Search</a></p>
      </div>

      <table v-else class="table w-100">
        <thead>
          <tr>
            <td />
            <SortableTableHeading id="nameLower" v-model="sortConfig">Name</SortableTableHeading>
            <SortableTableHeading id="title" v-model="sortConfig">Title</SortableTableHeading>
            <SortableTableHeading id="created" v-model="sortConfig" default="desc" class="has-text-right pr-20">Created</SortableTableHeading>
            <th class="has-text-right">Delete</th>
          </tr>
        </thead>
        <tbody>

          <tr v-for="person of people" :key="person.id" :data-person-id="person.id">

            <!-- photo -->
            <td>
              <PersonDetailLink :person="person">
                <StaticCoverImage :item="person" style="width: 150px; min-width: 50px; min-height: auto;" />
              </PersonDetailLink>
            </td>

            <!-- name -->
            <td>{{ person.name }}</td>

            <!-- title -->
            <td>{{ person.title || person.role }}</td>

            <!-- created -->
            <td class="has-text-right">{{ formatDate(person.created) }}</td>

            <!-- edit/delete -->
            <td class="has-text-right">
              <div class="field is-grouped is-justify-content-flex-end">
                <p class="control">
                  <button :disabled="$uiBusy" class="button is-flat" @click.prevent="remove(person.id)">
                    <i class="fas fa-times" />
                  </button></p>
              </div>
            </td>

          </tr>

        </tbody>
      </table>

    </div>
  </div>

</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/elements/table.sass";
</style>