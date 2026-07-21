// Localized hotel / hospitality imagery for the ticketing prototypes
// (accommodation packages, hotel detail pages, presentations). Downloaded from
// Unsplash and bundled under src/assets/hotel-library/ so nothing is fetched at
// runtime. Unsplash guidelines require visible attribution — render `credit`.
const img = (f) => new URL(`../assets/hotel-library/${f}`, import.meta.url).href

export const HOTEL_IMAGERY = [
  // Exterior
  { id: 'exterior-1', category: 'Exterior', src: img('exterior-1.jpg'), alt: 'Hotel with a pool and lounge chairs alongside', photographer: 'Colin Watts', photographerUrl: 'https://unsplash.com/@colinwatts', photoUrl: 'https://unsplash.com/photos/OW2u0PnIdGk' },
  { id: 'exterior-2', category: 'Exterior', src: img('exterior-2.jpg'), alt: 'Modern hotel building with balconies and city views', photographer: 'Shalev Cohen', photographerUrl: 'https://unsplash.com/@shalevcohen', photoUrl: 'https://unsplash.com/photos/QL4mjbvl9XI' },
  { id: 'exterior-3', category: 'Exterior', src: img('exterior-3.jpg'), alt: 'Grand hotel facade with ornate balconies', photographer: 'Raymond Petrik', photographerUrl: 'https://unsplash.com/@raymondpetrik', photoUrl: 'https://unsplash.com/photos/xHbgCcqQ2Yo' },
  { id: 'exterior-4', category: 'Exterior', src: img('exterior-4.jpg'), alt: 'Modern hotel building at dusk with illuminated windows', photographer: 'Suryaman shrestha', photographerUrl: 'https://unsplash.com/@stha123surya', photoUrl: 'https://unsplash.com/photos/sh9oD826VtY' },
  { id: 'exterior-5', category: 'Exterior', src: img('exterior-5.jpg'), alt: 'Grand hotel illuminated at night', photographer: 'Ahmed Atef', photographerUrl: 'https://unsplash.com/@ahmedatef19', photoUrl: 'https://unsplash.com/photos/OdiTPaeXIOE' },
  { id: 'exterior-6', category: 'Exterior', src: img('exterior-6.jpg'), alt: 'Modern resort building overlooking a lush garden', photographer: 'mcpeter', photographerUrl: 'https://unsplash.com/@thisismcpeter', photoUrl: 'https://unsplash.com/photos/xPCfrfNaLDo' },

  // Lobby
  { id: 'lobby-1', category: 'Lobby', src: img('lobby-1.jpg'), alt: 'A grand hotel lobby filled with sunlight', photographer: 'Zoshua Colah', photographerUrl: 'https://unsplash.com/@zoshuacolah', photoUrl: 'https://unsplash.com/photos/SXePqzrArfY' },
  { id: 'lobby-2', category: 'Lobby', src: img('lobby-2.jpg'), alt: 'Hotel reception desk with modern wooden furniture', photographer: 'Neon Wang', photographerUrl: 'https://unsplash.com/@neonwangphotography', photoUrl: 'https://unsplash.com/photos/kfnWOD1Tbp8' },
  { id: 'lobby-3', category: 'Lobby', src: img('lobby-3.jpg'), alt: 'Luxurious hotel lobby with modern decor', photographer: 'Dynamic Hong Kong', photographerUrl: 'https://unsplash.com/@dynamic_hk', photoUrl: 'https://unsplash.com/photos/q2jfK0Fq6XA' },
  { id: 'lobby-4', category: 'Lobby', src: img('lobby-4.jpg'), alt: 'Elegant hotel lobby with modern seating', photographer: 'Josh Hild', photographerUrl: 'https://unsplash.com/@joshhild', photoUrl: 'https://unsplash.com/photos/clYssEhptao' },
  { id: 'lobby-5', category: 'Lobby', src: img('lobby-5.jpg'), alt: 'People relaxing in a modern, spacious hotel lobby', photographer: 'Grace Anne Bobadilla', photographerUrl: 'https://unsplash.com/@graceannefully', photoUrl: 'https://unsplash.com/photos/VlvzT9Vhp4c' },
  { id: 'lobby-6', category: 'Lobby', src: img('lobby-6.jpg'), alt: 'Modern hotel lobby with elevator doors', photographer: 'Andy Wang', photographerUrl: 'https://unsplash.com/@space_launch_system', photoUrl: 'https://unsplash.com/photos/hV1myjiP9yI' },

  // Rooms
  { id: 'rooms-1', category: 'Rooms', src: img('rooms-1.jpg'), alt: 'A bedroom with a white bed and a wooden headboard', photographer: 'Antonio Araujo', photographerUrl: 'https://unsplash.com/@antonioaaaraujo', photoUrl: 'https://unsplash.com/photos/WWYF8Lts8Ho' },
  { id: 'rooms-2', category: 'Rooms', src: img('rooms-2.jpg'), alt: 'A hotel room with a bed, chair, desk and television', photographer: 'Mohamed Jamil Latrach', photographerUrl: 'https://unsplash.com/@jamillatrach', photoUrl: 'https://unsplash.com/photos/2YgoP7wLq8k' },
  { id: 'rooms-3', category: 'Rooms', src: img('rooms-3.jpg'), alt: 'A hotel room with a bed and a chair', photographer: 'Yosuke Ota', photographerUrl: 'https://unsplash.com/@yosuke_ota', photoUrl: 'https://unsplash.com/photos/0R1GMsc2E7w' },
  { id: 'rooms-4', category: 'Rooms', src: img('rooms-4.jpg'), alt: 'A bedroom with a bed and a night stand', photographer: 'aiden patrissi', photographerUrl: 'https://unsplash.com/@apatrissi', photoUrl: 'https://unsplash.com/photos/yfYN_AqmEQ4' },
  { id: 'rooms-5', category: 'Rooms', src: img('rooms-5.jpg'), alt: 'Table lamp turned on near a bed', photographer: 'Jp Valery', photographerUrl: 'https://unsplash.com/@jpvalery', photoUrl: 'https://unsplash.com/photos/DE9MM2voqKc' },
  { id: 'rooms-6', category: 'Rooms', src: img('rooms-6.jpg'), alt: 'Vacant white bed near the window', photographer: 'Andrew Neel', photographerUrl: 'https://unsplash.com/@andrewtneel', photoUrl: 'https://unsplash.com/photos/B4rEJ09-Puo' },

  // Suites
  { id: 'suites-1', category: 'Suites', src: img('suites-1.jpg'), alt: 'Luxurious hotel room with city view and large windows', photographer: 'Dynamic Hong Kong', photographerUrl: 'https://unsplash.com/@dynamic_hk', photoUrl: 'https://unsplash.com/photos/km5I2E-mJbo' },
  { id: 'suites-2', category: 'Suites', src: img('suites-2.jpg'), alt: 'Modern living room with city view through windows', photographer: 'Dynamic Hong Kong', photographerUrl: 'https://unsplash.com/@dynamic_hk', photoUrl: 'https://unsplash.com/photos/uXH0I1SDU7o' },
  { id: 'suites-3', category: 'Suites', src: img('suites-3.jpg'), alt: 'Luxurious hotel room with balcony overlooking the city', photographer: 'Huy Phan', photographerUrl: 'https://unsplash.com/@huyphan2602', photoUrl: 'https://unsplash.com/photos/IZ8akRW_5BY' },
  { id: 'suites-4', category: 'Suites', src: img('suites-4.jpg'), alt: 'Luxury hotel room with city view and bathtub', photographer: 'Dynamic Hong Kong', photographerUrl: 'https://unsplash.com/@dynamic_hk', photoUrl: 'https://unsplash.com/photos/Yo-OcToq2XE' },
  { id: 'suites-5', category: 'Suites', src: img('suites-5.jpg'), alt: 'Luxurious bedroom with modern decor and large windows', photographer: 'Aalo Lens', photographerUrl: 'https://unsplash.com/@aalolens', photoUrl: 'https://unsplash.com/photos/Xph_EJ-22vE' },
  { id: 'suites-6', category: 'Suites', src: img('suites-6.jpg'), alt: 'A well-lit hotel room with seating and a desk', photographer: 'Antonio Araujo', photographerUrl: 'https://unsplash.com/@antonioaaaraujo', photoUrl: 'https://unsplash.com/photos/xQbmc2FnK3Y' },

  // Pool
  { id: 'pool-1', category: 'Pool', src: img('pool-1.jpg'), alt: 'Infinity pool with a bridge', photographer: 'Shawn Lee', photographerUrl: 'https://unsplash.com/@shawn99lee', photoUrl: 'https://unsplash.com/photos/0sSJMTfLXUI' },
  { id: 'pool-2', category: 'Pool', src: img('pool-2.jpg'), alt: 'Rooftop pool overlooking city buildings', photographer: 'Antonio Araujo', photographerUrl: 'https://unsplash.com/@antonioaaaraujo', photoUrl: 'https://unsplash.com/photos/GoQjOQ69V5Q' },
  { id: 'pool-3', category: 'Pool', src: img('pool-3.jpg'), alt: 'Indoor swimming pool with lounge chairs', photographer: 'Latitude Suites', photographerUrl: 'https://unsplash.com/@latitude_suites', photoUrl: 'https://unsplash.com/photos/xsrNukGoNz8' },
  { id: 'pool-4', category: 'Pool', src: img('pool-4.jpg'), alt: 'A large swimming pool with a row of windows', photographer: 'Pierre-Henry Soria', photographerUrl: 'https://unsplash.com/@pierrehenry', photoUrl: 'https://unsplash.com/photos/mrel7lxdpUY' },
  { id: 'pool-5', category: 'Pool', src: img('pool-5.jpg'), alt: 'Rooftop swimming pool and lounge area with umbrellas', photographer: 'Antonio Araujo', photographerUrl: 'https://unsplash.com/@antonioaaaraujo', photoUrl: 'https://unsplash.com/photos/Hg3ebVbSzsc' },
  { id: 'pool-6', category: 'Pool', src: img('pool-6.jpg'), alt: 'Yellow loungers lining the blue poolside', photographer: 'Humphrey M', photographerUrl: 'https://unsplash.com/@good_citizen', photoUrl: 'https://unsplash.com/photos/HSr-sfDLC0g' },

  // Spa
  { id: 'spa-1', category: 'Spa', src: img('spa-1.jpg'), alt: 'White ceramic bathtub in a spa setting', photographer: 'Jared Rice', photographerUrl: 'https://unsplash.com/@jareddrice', photoUrl: 'https://unsplash.com/photos/PibraWHb4h8' },
  { id: 'spa-2', category: 'Spa', src: img('spa-2.jpg'), alt: 'A modern steam room with a candle and ambient lighting', photographer: 'Dominik Neuner', photographerUrl: 'https://unsplash.com/@moalach', photoUrl: 'https://unsplash.com/photos/9qYFu1NzpS8' },
  { id: 'spa-3', category: 'Spa', src: img('spa-3.jpg'), alt: 'Wooden sauna interior with steps', photographer: 'Antonio Araujo', photographerUrl: 'https://unsplash.com/@antonioaaaraujo', photoUrl: 'https://unsplash.com/photos/i1wR9DiCABc' },
  { id: 'spa-4', category: 'Spa', src: img('spa-4.jpg'), alt: 'Luxurious spa bathtub filled with flower petals', photographer: 'Sokhna Khoudia Saliou MBACKE', photographerUrl: 'https://unsplash.com/@snx_khoudja', photoUrl: 'https://unsplash.com/photos/nxxjtC1sLvE' },
  { id: 'spa-5', category: 'Spa', src: img('spa-5.jpg'), alt: 'Relaxing lounge chairs in a sunlit spa room', photographer: 'Virginia Marinova', photographerUrl: 'https://unsplash.com/@virginiaphotostories', photoUrl: 'https://unsplash.com/photos/FkB2CUuqU_c' },
  { id: 'spa-6', category: 'Spa', src: img('spa-6.jpg'), alt: 'Spa treatment with a person lying in prone position', photographer: 'alan caishan', photographerUrl: 'https://unsplash.com/@caishan119', photoUrl: 'https://unsplash.com/photos/cU53ZFBr3lk' },

  // Dining
  { id: 'dining-1', category: 'Dining', src: img('dining-1.jpg'), alt: 'A restaurant filled with tables and chairs', photographer: 'Samuel Wibisono', photographerUrl: 'https://unsplash.com/@mas_wibi', photoUrl: 'https://unsplash.com/photos/ZlcMrbZS9ug' },
  { id: 'dining-2', category: 'Dining', src: img('dining-2.jpg'), alt: 'Dining tables under pendant lamps', photographer: 'Yiran Ding', photographerUrl: 'https://unsplash.com/@yiranding', photoUrl: 'https://unsplash.com/photos/izGX42k9nM4' },
  { id: 'dining-3', category: 'Dining', src: img('dining-3.jpg'), alt: 'A hotel buffet with various food and drink options', photographer: 'Bayu Syaits', photographerUrl: 'https://unsplash.com/@bayusyaits', photoUrl: 'https://unsplash.com/photos/404a15A062o' },
  { id: 'dining-4', category: 'Dining', src: img('dining-4.jpg'), alt: 'An elegant restaurant with buffet tables', photographer: 'Aritra Neogi', photographerUrl: 'https://unsplash.com/@aritraneogi', photoUrl: 'https://unsplash.com/photos/v2CrrVbgu2A' },
  { id: 'dining-5', category: 'Dining', src: img('dining-5.jpg'), alt: 'A large dining room with many tables and chairs', photographer: 'Olena Kamenetska', photographerUrl: 'https://unsplash.com/@elen_cam', photoUrl: 'https://unsplash.com/photos/672nEWhK8i8' },
  { id: 'dining-6', category: 'Dining', src: img('dining-6.jpg'), alt: 'A dining room with a lot of tables and chairs', photographer: 'Zoshua Colah', photographerUrl: 'https://unsplash.com/@zoshuacolah', photoUrl: 'https://unsplash.com/photos/vG-HDgrepRg' },
]

export const HOTEL_CATEGORIES = ['Exterior', 'Lobby', 'Rooms', 'Suites', 'Pool', 'Spa', 'Dining']

/** Images grouped by category, in a stable order. */
export function hotelByCategory() {
  return HOTEL_CATEGORIES.map((category) => ({
    category,
    images: HOTEL_IMAGERY.filter((i) => i.category === category),
  })).filter((g) => g.images.length)
}
