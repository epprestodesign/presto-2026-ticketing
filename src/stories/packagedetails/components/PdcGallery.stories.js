// PACKAGE DETAILS / Components / Gallery — the photo gallery hero building block.
import GalleryHero from '../../../components/details/GalleryHero.vue'
import { gallery, pad } from '../_pd-components-data.js'

export default {
  title: 'Package Details/Components/Gallery',
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  name: 'Gallery',
  render: () => ({ components: { GalleryHero }, setup: () => ({ gallery }), template: pad(`<GalleryHero :images="gallery" :all-images="gallery" modal-title="Gameday & experiences" />`) }),
}
