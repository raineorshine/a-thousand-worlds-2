<script>
import { useHead } from '@vueuse/head'
import store from '@/store'
import Content from '@/components/Content'
import HeartIcon from '@/assets/icons/heart.svg'

const PaypalButtons = {
  any: process.env.VUE_APP_SUPPORT_PAYPAL_ANY,
  3: process.env.VUE_APP_SUPPORT_PAYPAL_3,
  5: process.env.VUE_APP_SUPPORT_PAYPAL_5,
  7: process.env.VUE_APP_SUPPORT_PAYPAL_7,
  10: process.env.VUE_APP_SUPPORT_PAYPAL_10,
  15: process.env.VUE_APP_SUPPORT_PAYPAL_15,
}

if (!process.env.VUE_APP_SUPPORT_PAYPAL_ANY) {
  console.error('Any Amount: PayPal Button ID environment variable not configured')
}
if (!process.env.VUE_APP_SUPPORT_PAYPAL_3) {
  console.error('$3: PayPal Button ID environment variable not configured')
}
if (!process.env.VUE_APP_SUPPORT_PAYPAL_5) {
  console.error('$5: PayPal Button ID environment variable not configured')
}
if (!process.env.VUE_APP_SUPPORT_PAYPAL_7) {
  console.error('$7: PayPal Button ID environment variable not configured')
}
if (!process.env.VUE_APP_SUPPORT_PAYPAL_10) {
  console.error('$10: PayPal Button ID environment variable not configured')
}
if (!process.env.VUE_APP_SUPPORT_PAYPAL_15) {
  console.error('$15: PayPal Button ID environment variable not configured')
}

export default {
  name: 'Support',
  components: {
    Content,
    HeartIcon,
  },
  setup() {
    const description = `Donate to support BIPOC children's book creators!`
    useHead({
      meta: [
        { name: 'og:description', content: description },
        { name: 'twitter:description', content: description },
      ],
    })
    store.dispatch('structuredData/set', { path: 'description', value: description })
  },
  data: () => ({
    PaypalButtons,
    monthly: 'any',
  }),
  computed: {
    btcAddress: () => process.env.VUE_APP_SUPPORT_BITCOIN || null,
  },
}
</script>

<template>
  <div class="columns m-20">
    <div class="column p-0 is-half-desktop is-offset-one-quarter-desktop">
      <Content name="support/title" format="inline" class="title page-title">Support</Content>
      <Content name="support/body" placeholder="Enter page content here" />
    </div>
  </div>

  <div class="columns m-20 is-desktop">
    <div class="column is-full is-one-quarter-desktop is-offset-one-quarter-desktop">
      <h2>Donate</h2>
      <h3 class="is-uppercase divider-bottom">Monthly donation</h3>
      <ul>
        <li @click="monthly = 3">
          <HeartIcon :class="{ 'fill-primary': monthly === 3 }" />
          <span class="ml-2">$3/month</span>
        </li>
        <li @click="monthly = 5">
          <HeartIcon :class="{ 'fill-primary': monthly === 5 }" />
          <span class="ml-2">$5/month</span>
        </li>
        <li @click="monthly = 7">
          <HeartIcon :class="{ 'fill-primary': monthly === 7 }" />
          <span class="ml-2">$7/month</span>
        </li>
        <li @click="monthly = 10">
          <HeartIcon :class="{ 'fill-primary': monthly === 10 }" />
          <span class="ml-2">$10/month</span>
        </li>
        <li @click="monthly = 15">
          <HeartIcon :class="{ 'fill-primary': monthly === 15 }" />
          <span class="ml-2">$15/month</span>
        </li>
      </ul>
      <form action="https://www.paypal.com/donate" method="post" target="_top" class="field">
        <input type="hidden" name="cmd" value="_s-xclick" />
        <input type="hidden" name="hosted_button_id" :value="PaypalButtons[monthly]" />
        <button type="submit" class="button is-primary is-uppercase is-rounded mt-3">
          Start Now
        </button>
      </form>
      <h3 class="is-uppercase divider-bottom mt-6">One-time donation</h3>
      <p>You can also support with a one-time donation in any time</p>
      <div class="field">
        <form
          action="https://www.paypal.com/cgi-bin/webscr"
          method="post"
          target="_top"
          class="field"
        >
          <input type="hidden" name="cmd" value="_s-xclick" />
          <input type="hidden" name="hosted_button_id" :value="PaypalButtons.any" />
          <button type="submit" class="button is-primary is-uppercase is-rounded mt-2">
            Give now
          </button>
        </form>
      </div>
      <div v-if="btcAddress">
        <h3 class="is-uppercase divider-bottom mt-6">Donate with bitcoins</h3>
        <p>{{ btcAddress }}</p>
      </div>
    </div>
    <div class="column is-full is-one-quarter-desktop">
      <div class="is-hidden-desktop mt-30" />
      <h2>Participate</h2>
      <h3 class="is-uppercase is-hidden-desktop divider-bottom">
        <span>Submit a book recommendation</span>
      </h3>
      <!-- squeeze in the text on two lines on desktop size -->
      <h3 class="is-uppercase is-hidden-touch divider-bottom" style="margin-right: -50px">
        <span>Submit a book recommendation</span>
      </h3>
      <div class="field">
        <button
          @click="
            $router.push({
              name: 'Contact',
              query: { subject: 'I am a BIPOC Leader in the book industry' },
            })
          "
          class="button is-primary is-uppercase is-rounded"
        >
          You are a BIPOC Leader
        </button>
      </div>
      <div class="field">
        <button
          @click="
            $router.push({
              name: 'Contact',
              query: { subject: 'Nominate BIPOC Leader(s) to A Thousand Worlds' },
            })
          "
          class="button is-primary is-uppercase is-rounded mt-2"
        >
          You know a BIPOC Leader
        </button>
      </div>
    </div>
  </div>
</template>

<style>
li {
  cursor: pointer;
}
</style>
