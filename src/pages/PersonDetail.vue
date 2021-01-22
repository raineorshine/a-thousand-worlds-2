<script>
import * as slugify from '@sindresorhus/slugify'
import BookListView from '@/components/BookListView'
import Filter from '@/components/Filter'
import PrevNext from '@/components/PrevNext'
import Tag from '@/components/Tag'

export default {
  components: {
    BookListView,
    Filter,
    PrevNext,
    Tag,
  },
  data() {
    return {
      pageUrl: window.location.href,
    }
  },
  computed: {
    bgImage() {
      return this.person.photo
    },
    books() {
      return this.person ? this.$store.getters['books/list']().filter(book =>
        (book.authors || []).includes(this.person.name) ||
        (book.illustrators || []).includes(this.person.name) ||
        Object.keys(book.creators || {}).includes(this.person.id)
      ) : []
    },
    isAuthor() {
      return this.person ? this.person.role === 'author' : true
    },
    name() {
      return this.$route.params.name
    },
    person() {
      return this.$store.getters['people/findBy']('name', name => slugify(name) === this.name)
    },
    tags() {
      const peopleTags = this.$store.state.tags.people.data || {}
      return Object.keys(this.person?.identities || [])
        .map(id => peopleTags[id])
        .filter(x => x)
    }
  },
  watch: {
    '$store.state.people.data'(next, prev) {
      if (next && Object.keys(next).length && !next[this.person.id]) {
        // person not found! drop to 404
        // timeout to make router finish any his current work, if doing any
        setTimeout(() => {
          this.$router.push('/404')
        }, 0)
      }
    }
  },
}

</script>

<template>

  <teleport to="#people-filter-menu">
    <Filter type="people" />
  </teleport>

  <div v-if="person" class="mx-5">

    <div class="wide-page">
      <div class="columns mb-5">

        <div class="column is-narrow">
          <router-link :to="{ name: 'People' }" class="is-uppercase is-primary">&lt; Back to People</router-link>
        </div>

        <PrevNext v-if="person" type="people" :item="person" class="column" />
      </div>

      <div class="is-flex is-flex-direction-row is-flex-wrap-wrap">
        <div class="column-person" :class="{'with-bookmarks': $store.state.ui.bookmarksOpen}">
          <div class="cover-wrapper mb-20">
            <div v-if="person.photo && person.photo.length" :style="{backgroundImage: 'url('+bgImage+')'}" class="cover-photo bg-secondary" />
          </div>

          <div class="title-container divider-30">
            <div class="name">{{ isAuthor ? 'Author' : 'Illustrator' }}</div>
            <h1 class="title mt-5">{{ person.name }}</h1>
            <div v-if="tags" class="tags mt-20">
              <Tag v-for="tag of tags" :key="tag.id" :tag="tag" type="people" />
            </div>
          </div>

          <p class="person-bio" :innerHTML="person.bio" />

        </div>

        <div class="column-books" :class="{'with-bookmarks': $store.state.ui.bookmarksOpen}">
          <BookListView v-for="book of books" :key="book.id" :book="book" />
        </div>

      </div>

    </div>
  </div>

  <!-- Add a bottom spacer so that fixed position footer clears content when scrolled to the bottom. -->
  <div class="mb-7" />

</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";
@import '@/assets/style/mixins.scss';
@import '@/assets/style/vars.scss';

.wide-page {
  margin: 0 20px;
  max-width: $widescreen;
  @include from($desktop) {
    margin: 0 60px;
  }
}

.directory-nav-link {
  color: black;
}

.column-person {
  width: 100%;
  text-align: center;

  @include from($widescreen) {
    width: calc(50% - 20px);
    margin-right: 20px;
    text-align: left;
  }

  &.with-bookmarks {
    width: 100%;
    text-align: center;
  }
}

.column-books {
  width: 100%;

  @include from($widescreen) {
    width: calc(50% - 20px);
    margin-left: 20px;
  }

  &.with-bookmarks {
    width: 100%;
  }
}

.cover-wrapper {
  max-width: 180px;
  max-height: 180px;
  text-align: center;
  margin: auto;

  @include from($widescreen) {
    text-align: left;
    margin: 0;
  }
}

.cover-photo {
  @include primary(border-color);
  padding-top: 100%;
  width: 100%;
  border: 1px solid;
  border-radius: 50%;
  background-size: cover;
}

.title {
  line-height: 1;
  margin-bottom: 0;
}

.person-bio {
  @include primary(border-color);
  font-size: 22px;
  text-align: justify;
  padding-bottom: 30px;
  margin-bottom: 30px;
  border-bottom: solid 1px #ddd;

  @include from($widescreen) {
    text-align: left;
    border-bottom: none;
    padding-bottom: 0.5rem;
  }
}
</style>