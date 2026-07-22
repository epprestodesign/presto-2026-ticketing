// APP SHELL / Stepper — the top-of-page journey progress bar: full-width underline
// step tabs (Stays · Event Tickets · Event Packages · Review) whose top edge is a
// continuous progress line that animates as you move between steps. Shown
// standalone and composed directly under the Hero Banner, as it appears in the
// app shell. Both stories are interactive — click any step to move the bar.
import { ref, watch } from 'vue'
import AppStepper from '../../components/AppStepper.vue'
import defaultBg from '../../../background-img/defaultBackgroundImage.png'
import epLogoWhite from '../../assets/eventpipe logos/eventpipe-logo-fff.svg'

const STEPS = ['Stays', 'Event Tickets', 'Event Packages', 'Review']
const EVENT_NAME = 'New England Patriots v Buffalo Bills'
const EVENT_DATES = 'Sat, Dec 6, 2026'

export default {
  title: 'App Shell/Stepper',
  component: AppStepper,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'The **App Shell Stepper** — the journey progress bar that sits flush under the global nav / hero banner. Full-width underline step tabs; the top edge is a continuous progress line whose brand fill **animates** to the current step. **Click any step** (these demos set `allow-ahead`) to move the bar forward or back and watch it slide. Use the **`current`** control to set the starting step.' } },
  },
  argTypes: {
    current: {
      name: 'Current step',
      control: { type: 'range', min: 0, max: 3, step: 1 },
    },
    clickable: { name: 'Steps clickable' },
  },
  args: { steps: STEPS, current: 1, clickable: true },
}

// A live current-step that clicking updates, kept in sync with the `current`
// control so dragging the slider still works.
const interactiveSetup = (args) => {
  const step = ref(args.current)
  watch(() => args.current, (v) => { step.value = v })
  return { args, step, defaultBg, epLogoWhite, EVENT_NAME, EVENT_DATES }
}

/** The stepper on its own — click any step (or drag `current`) to animate the bar. */
export const Default = {
  name: 'Stepper',
  render: (args) => ({
    components: { AppStepper },
    setup: () => interactiveSetup(args),
    template: `<AppStepper :steps="args.steps" :current="step" :clickable="args.clickable" allow-ahead @navigate="(i) => step = i" />`,
  }),
}

/** Composed as it appears in the app shell — directly beneath the Hero Banner. */
export const UnderHeroBanner = {
  name: 'Under Hero Banner',
  render: (args) => ({
    components: { AppStepper },
    setup: () => interactiveSetup(args),
    template: `
      <div style="font-family:var(--ds-font-family);">
        <section :style="{ position:'relative', backgroundColor:'#000', color:'#fff', overflow:'hidden', backgroundImage:'linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)), url(' + defaultBg + ')', backgroundSize:'cover', backgroundPosition:'center', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', width:'100%', aspectRatio:'1440 / 200' }">
          <div style="padding:0 24px; max-width:760px">
            <img :src="epLogoWhite" alt="EventPipe" style="height:30px;width:auto;display:block;margin:0 auto 12px" />
            <div class="text-h5" style="font-weight:700; line-height:1.15; margin:0">{{ EVENT_NAME }}</div>
            <div class="text-body1" style="margin-top:6px">{{ EVENT_DATES }}</div>
          </div>
        </section>
        <AppStepper :steps="args.steps" :current="step" :clickable="args.clickable" allow-ahead @navigate="(i) => step = i" />
      </div>`,
  }),
}
