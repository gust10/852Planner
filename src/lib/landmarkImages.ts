// Prefer bundled assets in src/assets/landmarks when available. These imports
// ensure Vite will include and serve them correctly.
import avenueOfStarsImg from '@/assets/landmarks/avenueofstars_img.jpg';
import disneylandImg from '@/assets/landmarks/disneyland_img.png';
import dragonsBackImg from '@/assets/landmarks/dragonsback_img.jpg';
import mPlusMuseumImg from '@/assets/landmarks/m+museum_img.png';
import oceanParkImg from '@/assets/landmarks/oceanpark_img.jpg';
import templeStreetImg from '@/assets/landmarks/templestreet_img.jpeg';
import victoriaHarbourImg from '@/assets/landmarks/victoriaharbour_img.jpg';
import victoriaPeakImg from '@/assets/landmarks/victoriapeak_img.jpg';

const LANDMARK_MAP: Record<string, string> = {
  'avenue-stars': avenueOfStarsImg,
  'avenue-of-stars': avenueOfStarsImg,
  'disneyland': disneylandImg,
  'dragons-back': dragonsBackImg,
  'm-plus': mPlusMuseumImg,
  'm-plus-museum': mPlusMuseumImg,
  'ocean-park': oceanParkImg,
  'temple-street': templeStreetImg,
  'temple-street-night-market': templeStreetImg,
  'victoria-harbour': victoriaHarbourImg,
  'victoria-peak': victoriaPeakImg,
};

export const getLandmarkImageUrl = (id: string) => {
  if (LANDMARK_MAP[id]) return LANDMARK_MAP[id];
  // fallback to public placeholder
  return '/landmarks/placeholder.svg';
};

export const DEFAULT_LANDMARK_IDS = Object.keys(LANDMARK_MAP);

export default getLandmarkImageUrl;
