<script>
// import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'

import isbnSearch from '@/util/isbnSearch'
import CreatorsWidget from '@/components/CreatorsWidget'

export default {
  components: {
    CreatorsWidget,
  },
  props: ['modelValue', 'disabled', 'searchDb', 'searchOnStart'],
  emits: ['update:modelValue', 'book-selected', 'isbn-search-state', 'isbn-search-result'],
  data() {
    return {
      isbn: this.modelValue || '',
      loading: false,
      searches: [],
      mode: 'view',
    }
  },
  watch: {
    modelValue(next, prev) {
      this.isbn = next
    },
  },
  methods: {
    searchGlobal() {
      this.loading = true
      this.$emit('isbn-search-state', this.loading)
      isbnSearch(this.isbn)
        .then(book => {
          this.loading = false
          this.$emit('isbn-search-state', this.loading)
          this.$emit('isbn-search-result', book)
        })
        .catch(err => {
          console.error('error', err)
          this.loading = false
          this.$emit('isbn-search-state', this.loading)
          this.$emit('isbn-search-result', null)
        })
    },
    doSearch(e) {
      if (!this.searchDb) {
        return
      }
      const search = e.target.value.toLowerCase()
      this.isbn = search
      this.$emit('update:modelValue', search)
      this.book = null
      this.searches = this.$store.state.booksList.filter(
        book => search.length && book.isbn.includes(search),
      )
    },
    hideSearch() {
      this.searches = []
    },
    fillBook(b) {
      this.hideSearch()
      this.isbn = b.isbn
      this.$emit('update:modelValue', this.isbn)
      this.$emit('book-selected', b)
    },
    onDivClick() {
      if (this.disabled) {
        return
      }
      this.mode = 'edit'
      // on the moment of function execution $refs.input
      // is still not exists beacuse of v-if
      // so timeout 0 used to wait it to be created
      setTimeout(() => {
        this.$refs.input.focus()
      }, 0)
    },
    onClickOutside(e) {
      this.searches = []
      if (e.target === this.$refs.input) {
        return
      }
      this.mode = 'view'
    },
    onEnter() {
      this.searches = []
      this.mode = 'view'
    },
    onInputBlur() {
      if (this.searches.length) {
        return
      }
      this.mode = 'view'
    },
    onEsc() {
      if (this.searches.length) {
        this.searches = []
        return
      }
      this.mode = 'view'
    },
  },
}
</script>

<template>
  <div class="control">
    <div class="field is-grouped">
      <div class="control">
        <button
          :disabled="disabled || loading || !isbn.length"
          :class="{ 'is-loading': loading }"
          class="is-flat"
          @click="searchGlobal"
        >
          <i class="fas fa-search" />
        </button>
      </div>
      <div class="control w-50">
        <div
          v-if="mode === 'view'"
          class="w-50 pointer"
          :class="{ disabled: disabled }"
          @click="onDivClick"
        >
          {{ isbn }}
        </div>
        <input
          v-if="mode === 'edit'"
          ref="input"
          v-model="isbn"
          type="text"
          class="input"
          @blur="onInputBlur"
          @keyup.enter="onEnter"
          @keyup.escape="onEsc"
          @input="doSearch"
        />
        <div v-if="searches.length" v-click-outside="onClickOutside" class="search-wrap">
          <div class="search-results">
            <div
              v-for="res of searches"
              :key="res.id"
              class="media p-2"
              @click.prevent="fillBook(res, si)"
            >
              <div class="media-left">
                <img :src="res.cover" />
              </div>
              <div class="media-right">
                <b>{{ res.title }}</b
                ><br />
                <small>{{ res.isbn }}</small
                ><br />
                <CreatorsWidget :name="res.authors[0]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.is-flat {
  margin-left: -9px;
}

.input {
  margin-top: -0.25rem;
  margin-left: -0.25rem;
  padding: 0.2rem;
  height: 2rem;
}

.pointer {
  cursor: text;
  &.disabled {
    color: #ddd;
  }
}

.w-50 {
  min-width: 50%;
  min-height: 24px;
}

.w-100 {
  width: 100%;
}

.search-wrap {
  position: relative;
  min-width: 250px;
  .search-results {
    position: absolute;
    width: 100%;
    max-height: 400px;
    overflow-y: scroll;
    left: 0;
    top: 0;
    z-index: $zField;
    background: #fff;
    border: 1px solid;

    img {
      max-height: 60px;
    }

    .media {
      margin: 0 !important;

      &:hover {
        background: #eee;
      }

      img {
        max-width: 50px;
      }
    }
  }
}
</style>
