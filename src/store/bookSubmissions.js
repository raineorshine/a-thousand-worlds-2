import mergeOne from '@/util/mergeOne'
import collection from '@/store/collection/imaged'
import { v4 } from 'uuid'
import dayjs from 'dayjs'

const module = mergeOne(collection('submits/books', 'cover'), {
  getters: {
    list: state => state.loaded
      ? Object.keys(state.data)
        .map(id => state.data[id])
      : [],
    filtered: state => state.loaded
      ? Object.keys(state.data)
        .map(id => state.data[id])
        .filter(book => {
          if (!state.filters.length) return true
          return state.filters.every(tag => (book.tags || []).includes(tag))
        })
      : []
  },
  actions: {
    /** Submit books suggestions to Firebase */
    submit: async (context, list) => {
      /**/
      const ids = []
      const submissionGroupId = v4()
      const profile = context.rootState.user.user.profile
      profile.draftBooks = []
      if (!profile.submissions) {
        profile.submissions = {}
      }
      // eslint-disable-next-line  fp/no-loops
      for (const sub of list) {
        // eslint-disable-next-line  fp/no-mutating-methods
        const sid = v4()
        // const ref = await firebase.database().ref(`submits/books/${sid}`)
        // console.log('set ref', ref, id)
        const subData = {
          id: sid,
          group: submissionGroupId,
          type: 'book',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          approveComment: '',
          title: sub.title,
          authors: Array.isArray(sub.authors) ? sub.authors.join(', ') : sub.authors || '',
          description: sub.description || '',
          year: sub.year || '',
          publisher: sub.publisher || '',
          cover: sub.cover ? { ...sub.cover } : { url: '', base64: '', width: 0, height: 0 },
          illustrators: Array.isArray(sub.illustrators) ? sub.illustrators.join('. ') : sub.illustrators || '',
          isbn: sub.isbn || '',
          tags: sub.tags || {},
          otherTag: sub.otherTag || ''
        }
        console.log('saving sub', sub, subData)
        await context.dispatch('saveWithImage', { key: sid, value: subData })
        profile.submissions[sid] = 'review'
        context.commit('setOne', { key: sid, value: subData })
        // eslint-disable-next-line  fp/no-mutating-methods
        ids.push(sid)
      }
      await context.dispatch('user/saveProfile', profile, { root: true })
      /**/
    },
    /** Reject submission */
    reject: async (context, sub) => {
      console.log('rejecting submission', sub)
      // const ref = await firebase.database().ref(`submits/${sub.type}s/${sub.id}`)
      const now = dayjs()
      sub.approvedBy = context.rootState.user.user.uid
      sub.approvedAt = now.format()
      await context.dispatch('save', { key: sub.id, value: sub })
      context.commit('setOne', { key: sub.id, value: sub })
      const profile = context.rootState.user.user.profile
      profile.submissions[sub.id] = 'reject'
      await context.dispatch('user/saveProfile', profile, { root: true })
    },
    /** Approves submissions group */
    approve: async (context, list) => {
      console.log('approvimg submissions group', list)

      // eslint-disable-next-line  fp/no-loops
      for (const sub of list) {

        // create tags if required
        if (sub.otherTag?.length) {
          const tagId = v4()
          await context.dispatch('tags/save', { key: tagId, value: {
            id: tagId,
            tag: sub.otherTag,
            showOnFront: false,
            sortOrder: 50
          } }, { root: true })
          if (!sub.tags) sub.tags = {}
          sub.tags[tagId] = true
        }

        // collect creators and create not existing people
        const authors = sub.authors.split(',').map(x => x.trim()).filter(x => x?.length)
        const illustrators = sub.illustrators.split(',').map(x => x.trim()).filter(x => x?.length)
        const creators = {}
        // eslint-disable-next-line  fp/no-loops
        for (const author of authors) {
          let cid = context.rootGetters['creators/list']
            .reduce((acc, person) => person.name.toLowerCase() === author.toLowerCase() ? person.id : acc, null)
          if (!cid) {
            console.log('creating person', author)
            cid = v4()
            await context.dispatch('creators/save', { key: cid, value: { id: cid, name: author, approvedBy: context.rootState.user.user.uid } }, { root: true })
          }
          creators[cid] = creators[cid] ? 'both' : 'author'
        }
        // eslint-disable-next-line  fp/no-loops
        for (const author of illustrators) {
          let cid = context.rootGetters['creators/list']
            .reduce((acc, person) => person.name.toLowerCase() === author.toLowerCase() ? person.id : acc, null)
          if (!cid) {
            console.log('creating person', author)
            cid = v4()
            await context.dispatch('creators/save', { key: cid, value: { id: cid, name: author, approvedBy: context.rootState.user.user.uid } }, { root: true })
          }
          creators[cid] = creators[cid] ? 'both' : 'illustrator'
        }

        // push imaged collection download and resave book cover at Firesore books collection path
        const cover = sub.cover
        if (cover.url?.length) cover.downloadUrl = cover.url

        // saving book
        console.log('submission before book', sub, creators)
        const bookId = v4()
        await context.dispatch('books/saveWithImage', { key: bookId, value: {
          id: bookId,
          submissionId: sub.id,
          title: sub.title,
          creators: creators,
          cover: cover,
          description: sub.description,
          isbn: sub.isbn,
          goodread: sub.goodread || '',
          year: sub.year,
          publisher: sub.publisher,
          tags: sub.tags,
          approvedBy: context.rootState.user.user.uid,
          createdBy: sub.createdBy
        } }, { root: true })

        // updating user profile
        const profile = context.rootState.user.user.profile
        profile.submissions[sub.id] = 'approve'
        await context.dispatch('user/saveProfile', profile, { root: true })

        // updating submission
        sub.approvedBy = context.rootState.user.user.uid
        sub.approved = true
        await context.dispatch('save', { key: sub.id, value: sub })
      }

    },
    /** Delete submission from Firebase */
    delete: async (context, sid) => {
      await context.dispatch('removeWithImage', sid)
      const profile = context.rootState.user.user.profile
      profile.submissions = Object.keys(profile.submissions)
        .filter(id => id !== sid)
        .reduce((acc, id) => {
          acc[id] = profile.submissions[id]
          return acc
        }, {})
      await context.dispatch('user/saveProfile', profile, { root: true })
    }
  }
})

export default module