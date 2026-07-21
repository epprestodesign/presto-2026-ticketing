// Localized professional-football / fan-experience imagery for the ticketing
// prototypes (packaging heroes, event pages, presentations). Downloaded from
// Unsplash and bundled under src/assets/gameday/ so nothing is fetched at
// runtime. Unsplash guidelines require visible attribution — render `credit`.
const img = (f) => new URL(`../assets/gameday/${f}`, import.meta.url).href

export const GAMEDAY_IMAGERY = [
  { id: 'gear', category: 'Gameday', src: img('gear-vieira.jpg'), alt: 'Fan holding team colors', photographer: 'Emerson Vieira', photographerUrl: 'https://unsplash.com/@emersonvieira', photoUrl: 'https://unsplash.com/photos/V6kZMhjWveo' },
  { id: 'field', category: 'Gameday', src: img('field-clark.jpg'), alt: 'Quarterback throwing on the field', photographer: 'Ashton Clark', photographerUrl: 'https://unsplash.com/@official_jeww', photoUrl: 'https://unsplash.com/photos/02bN29Dz9Sg' },
  { id: 'stadium', category: 'Stadium', src: img('stadium-crowd-gago.jpg'), alt: 'Packed stadium under the lights', photographer: 'Piero Huerto Gago', photographerUrl: 'https://unsplash.com/@piero_hg', photoUrl: 'https://unsplash.com/photos/2rjjnfdlwGY' },
  { id: 'audience', category: 'Stadium', src: img('audience-dau.jpg'), alt: 'Crowd in the stands', photographer: 'Emma Dau', photographerUrl: 'https://unsplash.com/@daugirl', photoUrl: 'https://unsplash.com/photos/5o8vbsN6ryA' },
  { id: 'tailgate', category: 'Tailgate', src: img('tailgate-lu.jpg'), alt: 'Stadium parking lot before the game', photographer: 'Hanson Lu', photographerUrl: 'https://unsplash.com/@hansonluu', photoUrl: 'https://unsplash.com/photos/WrNbw7UeNqI' },
  { id: 'fans', category: 'Fans', src: img('fans-shen.jpg'), alt: 'Fans in team colors', photographer: 'Justin Shen', photographerUrl: 'https://unsplash.com/@shenny_visuals', photoUrl: 'https://unsplash.com/photos/IlqOGT4qWFY' },
  { id: 'fanmarch', category: 'Fans', src: img('fanmarch-black.jpg'), alt: 'Supporters walking to the match', photographer: 'Ben Black', photographerUrl: 'https://unsplash.com/@benjamin92black', photoUrl: 'https://unsplash.com/photos/fxY-lmUO8g4' },
  { id: 'celebrate', category: 'Celebration', src: img('celebrate-tabitha.jpg'), alt: 'Fan celebrating a win', photographer: 'Elin Tabitha', photographerUrl: 'https://unsplash.com/@elintabitha', photoUrl: 'https://unsplash.com/photos/Iszu-5lWxiA' },
  { id: 'night-lights', category: 'Night', src: img('night-tuman.jpg'), alt: 'Stadium at night with fans and bright lights', photographer: 'lesha tuman', photographerUrl: 'https://unsplash.com/@leshatuman', photoUrl: 'https://unsplash.com/photos/kP60kmDQcq8' },
  { id: 'night-crowd', category: 'Night', src: img('night-barrow.jpg'), alt: 'Stadium lights over a night crowd', photographer: 'Bruce Barrow', photographerUrl: 'https://unsplash.com/@bruceb_uk', photoUrl: 'https://unsplash.com/photos/yc-mnCDQA-8' },
  { id: 'stadium-day', category: 'Stadium', src: img('stadium-day-rasyid.jpg'), alt: 'Fans watching football on a bright day', photographer: 'Fikri Rasyid', photographerUrl: 'https://unsplash.com/@fikrirasyid', photoUrl: 'https://unsplash.com/photos/xl7675LXTO0' },
  { id: 'bleachers', category: 'Stadium', src: img('bleachers-lehner.jpg'), alt: 'Fans in the bleachers', photographer: 'Stefan Lehner', photographerUrl: 'https://unsplash.com/@st_lehner', photoUrl: 'https://unsplash.com/photos/fOFs1-T7Hi0' },
  { id: 'entry-line', category: 'Entry', src: img('entry-redwood.jpg'), alt: 'Fans lining up to enter the venue', photographer: 'Colin redwood', photographerUrl: 'https://unsplash.com/@credwood', photoUrl: 'https://unsplash.com/photos/9di-2dOL6VQ' },
  { id: 'arriving', category: 'Entry', src: img('arrive-yamin.jpg'), alt: 'Fans arriving at the venue', photographer: 'Omri Yamin', photographerUrl: 'https://unsplash.com/@omriz', photoUrl: 'https://unsplash.com/photos/5B-ueJdzAX8' },
]

export const GAMEDAY_CATEGORIES = ['Gameday', 'Stadium', 'Night', 'Tailgate', 'Entry', 'Fans', 'Celebration']

/** Images grouped by category, in a stable order. */
export function gamedayByCategory() {
  return GAMEDAY_CATEGORIES.map((category) => ({
    category,
    images: GAMEDAY_IMAGERY.filter((i) => i.category === category),
  })).filter((g) => g.images.length)
}

/** Pick a representative image for a package theme (best-effort by keyword). */
export function imageForTheme(theme = '') {
  const t = theme.toLowerCase()
  if (t.includes('tailgate')) return GAMEDAY_IMAGERY.find((i) => i.id === 'tailgate')
  if (t.includes('family') || t.includes('kids')) return GAMEDAY_IMAGERY.find((i) => i.id === 'fans')
  if (t.includes('vip')) return GAMEDAY_IMAGERY.find((i) => i.id === 'field')
  if (t.includes('tour')) return GAMEDAY_IMAGERY.find((i) => i.id === 'stadium')
  return GAMEDAY_IMAGERY.find((i) => i.id === 'gear')
}
