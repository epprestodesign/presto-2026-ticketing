<script setup>
// LandingPage — the event landing page, composed top to bottom:
//   Global Nav → Hero Banner (event name + dates over the default imagery)
//   → Booking Widget (search) → Event description (intro, benefits, who's
//   attending, event information, closing) → Display Ads → Footer.
// `mode` switches the widget + cart between Book Reservations ('reservations')
// and Group Block ('group'). All copy is prop-driven; defaults describe a
// sample EventPipe client-appreciation gameday (Patriots v Bills, Gillette Stadium).
import defaultBg from '../../background-img/defaultBackgroundImage.png'
import GlobalNav from './GlobalNav.vue'
import BookingWidget from './BookingWidget.vue'
import DisplayAd from './DisplayAd.vue'
import epLogo from '../assets/eventpipe logos/eventpipe-logo.svg'
import epLogoWhite from '../assets/eventpipe logos/eventpipe-logo-fff.svg'

const props = defineProps({
  mode: { type: String, default: 'reservations' }, // 'reservations' | 'group'
  brand: { type: String, default: 'Presto' },
  eventName: { type: String, default: 'New England Patriots v Buffalo Bills' },
  eventDates: { type: String, default: 'Sat, Dec 6, 2026' },

  // Event description content (the centered copy block).
  intro: {
    type: Array,
    default: () => [
      "EventPipe is treating the companies on its client list to an unforgettable day at Gillette Stadium. As the New England Patriots host the Buffalo Bills for a marquee AFC East matchup, we're bringing corporate groups, client guests, families, and passionate fans together for a premium client-appreciation gameday in Foxborough.",
      "Hosted at Gillette Stadium in Foxborough, Massachusetts, this client-appreciation outing pairs an unforgettable game with a stay that keeps your group close to the action. Whether you're hosting VIP clients, rewarding your team, or bringing the family, Presto makes it easy to plan the trip and take care of everyone.",
    ],
  },
  benefits: {
    type: Array,
    default: () => [
      'Official event hotel options near Gillette Stadium',
      'Exclusive group and hospitality rates when available',
      'Flexible accommodations for clients, employees, and families',
      'Easy online booking with instant confirmation',
      'Stay together with your company or group',
      'Convenient access to restaurants, shopping, and local attractions',
    ],
  },
  attendingTitle: { type: String, default: "Who's Attending?" },
  attending: {
    type: Array,
    default: () => [
      { title: 'Corporate Groups', text: 'Host clients and employees for a premium day at Gillette Stadium with hotel options that keep your whole group together and the logistics effortless.' },
      { title: 'Client Guests', text: "Enjoy a first-class client-appreciation experience — from a comfortable stay near the stadium to kickoff — all taken care of by EventPipe and your host company." },
      { title: 'Families', text: 'Make a weekend of it in Foxborough, with family-friendly dining, shopping, and entertainment surrounding an unforgettable Patriots gameday.' },
      { title: 'Fans', text: "Experience the electric atmosphere of Patriots v Bills at Gillette Stadium, one of the NFL's premier AFC East rivalries." },
    ],
  },
  eventInfoTitle: { type: String, default: 'Event Information' },
  eventInfo: {
    type: Object,
    default: () => ({
      dates: 'December 6, 2026',
      lines: [
        'Venue: Gillette Stadium',
        '1 Patriot Place',
        'Foxborough, Massachusetts 02035',
      ],
    }),
  },
  closing: {
    type: Array,
    default: () => [
      'Your gameday hospitality and tickets are arranged through EventPipe and your host company, making it a premium, worry-free experience for clients, employees, and families alike.',
      'Book your accommodations early to secure the best available rates and stay close to Gillette Stadium throughout the weekend.',
    ],
  },

  ads: { type: Number, default: 3 },
  // Booking Widget state: true = Teams Booking Widget (Registered Team(s) field),
  // false = Core Booking Widget (generic search, no team field).
  showTeams: { type: Boolean, default: true },
})

// Same hero treatment as Foundations / Hero Banner → Landing Page (scrim + image).
const scrim = 'linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5))'
const heroStyle = { backgroundImage: `${scrim}, url(${defaultBg})` }
</script>

<template>
  <div class="lp">
    <!-- Global nav -->
    <!-- No cart on the landing page (nothing has been added yet). -->
    <global-nav :brand="brand" :cart-mode="mode === 'group' ? 'hold' : 'reserve'" :show-cart="false" />

    <!-- Hero (Foundations / Hero Banner — Landing Page imagery) -->
    <section class="lp__hero" :style="heroStyle">
      <div class="lp__hero-inner">
        <img :src="epLogoWhite" alt="EventPipe" class="lp__hero-logo" />
        <h1 class="lp__event text-h3">{{ eventName }}</h1>
        <p class="lp__dates text-h6">{{ eventDates }}</p>
      </div>
    </section>

    <!-- Booking Widget -->
    <section class="lp__widget">
      <div class="lp__widget-card">
        <!-- DES-91: the landing booking type starts blank (no default selection),
             independent of the page's cart context. -->
        <booking-widget mode="" :tabs="false" :show-teams="showTeams" />
      </div>
    </section>

    <!-- Event description -->
    <section class="lp__content">
      <p v-for="(p, i) in intro" :key="'i' + i" class="lp__para">{{ p }}</p>

      <ul class="lp__benefits">
        <li v-for="(b, i) in benefits" :key="'b' + i">
          <span class="lp__check" aria-hidden="true">✔</span> {{ b }}
        </li>
      </ul>

      <h2 class="lp__section-title">{{ attendingTitle }}</h2>
      <div v-for="(a, i) in attending" :key="'a' + i" class="lp__attend">
        <h3 class="lp__attend-title">{{ a.title }}</h3>
        <p class="lp__para">{{ a.text }}</p>
      </div>

      <h2 class="lp__section-title">{{ eventInfoTitle }}</h2>
      <p class="lp__para lp__info"><strong>Dates:</strong> {{ eventInfo.dates }}</p>
      <p v-for="(l, i) in eventInfo.lines" :key="'l' + i" class="lp__para lp__info">{{ l }}</p>

      <p v-for="(c, i) in closing" :key="'c' + i" class="lp__para lp__closing">{{ c }}</p>
    </section>

    <!-- Display ads -->
    <section class="lp__section lp__ads">
      <display-ad v-for="n in ads" :key="n" />
    </section>

    <!-- Footer -->
    <footer class="lp__footer">
      <div class="lp__footer-inner">
        <img :src="epLogo" alt="EventPipe" class="lp__logo" />
        <span class="lp__legal">© 2026 EventPipe · Terms · Privacy · Contact</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.lp {
  background: var(--ds-color-surface);
  color: var(--ds-color-text);
}

/* Hero */
.lp__hero {
  min-height: 400px;
  background-color: #000;
  background-size: cover;
  background-position: center;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.lp__hero-inner { padding: 0 24px; max-width: 820px; }
.lp__hero-logo { height: 44px; width: auto; margin: 0 auto 18px; display: block; }
.lp__event { font-weight: 700; line-height: 1.1; margin: 0; text-wrap: balance; }
.lp__dates { font-weight: 400; margin: 10px 0 0; }

/* Booking widget — tucked up onto the hero. */
.lp__widget {
  max-width: 1040px;
  margin: -48px auto 0;
  padding: 0 24px;
  position: relative;
  z-index: 2;
}
.lp__widget-card {
  background: var(--ds-color-surface);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow-2);
}

/* Event description — centered copy block. */
.lp__content {
  max-width: 860px;
  margin: 0 auto;
  padding: 56px 24px 8px;
  text-align: center;
}
.lp__para { margin: 0 0 22px; line-height: 1.6; font-size: 1rem; }
.lp__benefits {
  list-style: none;
  padding: 0;
  margin: 4px 0 34px;
}
.lp__benefits li { margin: 8px 0; line-height: 1.5; }
.lp__check { font-weight: 700; }
.lp__section-title {
  font-size: 1.25rem;
  font-weight: 400;
  margin: 40px 0 26px;
}
.lp__attend { margin-bottom: 30px; }
.lp__attend-title { font-size: 1rem; font-weight: 700; margin: 0 0 8px; }
.lp__info { margin: 0 0 4px; }
.lp__closing { margin-top: 22px; }

/* Shared content section (ads) */
.lp__section {
  max-width: 1180px;
  margin: 0 auto;
  padding: 40px 24px 0;
}
.lp__ads {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

/* Footer */
.lp__footer {
  margin-top: 56px;
  border-top: 1px solid var(--ds-color-border);
  background: var(--ds-color-surface);
}
.lp__footer-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.lp__logo { height: 30px; width: auto; display: block; }
.lp__legal { color: var(--ds-color-text-subtle); font-size: 0.8125rem; }
</style>
