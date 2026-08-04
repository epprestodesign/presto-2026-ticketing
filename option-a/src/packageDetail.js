// The written detail behind a package (Aug 4 rework v3).
//
// With the Package Details page retired, the modal carries everything a guest
// needs to decide — so a package-only SKU still fills two columns: what's
// included spelled out item by item, the gameday timeline, and the policies.
// Prototype copy; the library supplies only the package's experience labels.
import { EVENT_VENUE, STAY_LABEL } from './event.js'

// Per-experience detail, keyed by the theme the library generates. Anything not
// listed falls back to a generic entry so a new theme never renders blank.
const EXPERIENCE_DETAIL = {
  'Stadium Tour': [
    { icon: 'stadium', title: 'Guided stadium & locker-room tour', text: '90 minutes with a team host, starting three hours before kickoff. Field level, press box, and the visitors\' locker room.' },
    { icon: 'emoji_events', title: 'Patriots Hall of Fame visit', text: 'Same-day access to the Hall, self-guided, with your gameday credential.' },
    { icon: 'photo_camera', title: 'Pregame field photo op', text: 'A group photo on the field during warmups. Groups of up to eight at a time.' },
  ],
  Tailgate: [
    { icon: 'outdoor_grill', title: 'Hosted tailgate, three hours pregame', text: 'Reserved lot space with catered New England barbecue, local beer, and games.' },
    { icon: 'local_parking', title: 'Reserved gameday parking', text: 'One pass per four guests in the closest available lot to your tailgate.' },
    { icon: 'sports_football', title: 'Alumni appearance', text: 'A former player drops by for photos and autographs during the tailgate.' },
  ],
  'Field Level': [
    { icon: 'sports', title: 'Pregame sideline access', text: 'Watch warmups from the sideline with a team host, up to 45 minutes before kickoff.' },
    { icon: 'restaurant', title: 'Premium club dining', text: 'All-inclusive buffet and bar in the club lounge, open two hours pregame through halftime.' },
    { icon: 'redeem', title: 'Commemorative gift', text: 'A personalised gameday item waiting at your seat.' },
  ],
  Family: [
    { icon: 'family_restroom', title: 'Family fun zone access', text: 'Inflatables, kids\' games, and face painting in the family zone, open at gates.' },
    { icon: 'icecream', title: 'Kids\' concession credit', text: '$20 per child toward food and drinks anywhere in the stadium.' },
    { icon: 'sports_football', title: 'Mascot meet & greet', text: 'Photos with Pat Patriot before kickoff at the family zone stage.' },
  ],
}

const GENERIC_DETAIL = (label) => ({
  icon: 'auto_awesome',
  title: label,
  text: `Included with this package at ${EVENT_VENUE}, arranged by EventPipe on gameday.`,
})

/**
 * The itemised inclusions for a package: its ticket, its stay (if any), and each
 * signature experience with real detail rather than a bare label.
 */
export function inclusionsFor(pkg) {
  if (!pkg) return []
  const themed = EXPERIENCE_DETAIL[pkg.theme]
  const labels = (pkg.experiences || []).map((e) => e.label || e)
  const experiences = themed || labels.map(GENERIC_DETAIL)

  const items = [
    {
      icon: 'confirmation_number',
      title: 'Event tickets',
      text: 'Seats together in your chosen tier, delivered to the EventPipe app before gameday. Transferable to your guests.',
    },
    ...experiences,
  ]

  if (pkg.hotel) {
    items.push({
      icon: 'hotel',
      title: `${pkg.nights || 1}-night hotel stay`,
      text: `${STAY_LABEL}. Choose from the hotels covered by this package — the room is confirmed with your order.`,
    })
  }
  return items
}

/** The shape of the day, pregame through kickoff. */
export const GAMEDAY_TIMELINE = [
  { time: '10:00 AM', title: 'Arrive & check in', text: 'EventPipe host desk at the main gate. Credentials and any parking passes are issued here.' },
  { time: '10:30 AM', title: 'Your experience begins', text: 'Tour, tailgate or club access — whatever your package includes starts now.' },
  { time: '12:00 PM', title: 'Gates open', text: 'Head to your seats, or stay in the club until kickoff.' },
  { time: '1:00 PM', title: 'Kickoff', text: 'Pittsburgh Steelers at New England Patriots.' },
  { time: '4:15 PM', title: 'Postgame', text: 'Lots clear on a staggered release; your host is reachable in the app until 6:00 PM.' },
]

/** Good-to-know policies, rendered as an accordion. */
export const PACKAGE_POLICIES = [
  { title: 'Mobile entry', body: 'Tickets are delivered to the EventPipe app before gameday and scanned at the gate — no printouts needed.' },
  { title: 'Transfers & resale', body: 'You can transfer tickets to your party from the app up until the event begins.' },
  { title: 'Refunds & cancellations', body: 'If the event is cancelled or rescheduled, EventPipe will notify you with your refund or exchange options. Hotel stays follow the property\'s own policy.' },
  { title: 'Event changes', body: 'Date, time and lineup are set by the venue and may change. We\'ll email you if anything about your order changes.' },
  { title: 'Accessibility', body: 'Accessible seating and rooms are available in every tier — tell your host at check-in, or ask us before gameday.' },
]
