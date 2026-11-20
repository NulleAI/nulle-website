import type { StaticImageData } from "next/image";

import amalfi from "@/assets/atlas/amalfi.jpg";
import bamboo from "@/assets/atlas/bamboo.jpg";
import gion from "@/assets/atlas/gion.jpg";
import inari from "@/assets/atlas/inari.jpg";
import kaiseki from "@/assets/atlas/kaiseki.jpg";
import katsura from "@/assets/atlas/katsura.jpg";
import kyotoHero from "@/assets/atlas/kyoto-hero.jpg";
import kyoto from "@/assets/atlas/kyoto.jpg";
import marrakech from "@/assets/atlas/marrakech.jpg";
import philosopher from "@/assets/atlas/philosopher.jpg";
import ryokan from "@/assets/atlas/ryokan.jpg";
import tea from "@/assets/atlas/tea.jpg";

import type { PhotoId } from "./scenarios";

/**
 * Photographs in Atlas. All are real photographs from Wikimedia Commons,
 * used under the licence named on each, resized and compressed for the
 * web (the originals are linked). Credits are shown beside the demo.
 */
export type Photo = {
  src: StaticImageData;
  alt: string;
  /** CSS object-position, to keep the subject in frame when cropped. */
  focus?: string;
  credit: { title: string; author: string; licence: string; licenceUrl: string; source: string };
};

export const photos: Record<PhotoId, Photo> = {
  kyoto: {
    src: kyoto,
    alt: "Yasaka-dori in the early morning, with street lanterns and the Yasaka pagoda",
    focus: "38% 50%",
    credit: {
      title: "Yasaka-dori early morning with street lanterns and the Tower of Yasaka (Hokan-ji Temple), Kyoto, Japan",
      author: "Basile Morin",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Yasaka-dori_early_morning_with_street_lanterns_and_the_Tower_of_Yasaka_(Hokan-ji_Temple),_Kyoto,_Japan.jpg",
    },
  },
  kyotoHero: {
    src: kyotoHero,
    alt: "Kiyomizu-dera on its wooden stage above autumn maples",
    focus: "58% 50%",
    credit: {
      title: "Kiyomizu-dera, Kyoto, November 2016 -01",
      author: "Martin Falbisoner",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Kiyomizu-dera,_Kyoto,_November_2016_-01.jpg",
    },
  },
  amalfi: {
    src: amalfi,
    alt: "Positano's houses climbing the cliffs above the sea",
    focus: "62% 50%",
    credit: {
      title: "Positano (Italy) 03",
      author: "Bernard Gagnon",
      licence: "CC BY 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Positano_(Italy)_03.jpg",
    },
  },
  marrakech: {
    src: marrakech,
    alt: "A carved stucco arch and bench against the blue walls of the Majorelle Garden",
    credit: {
      title: "Bench and stuccos in the Villa Majorelle, Morocco",
      author: "M0tty",
      licence: "CC BY-SA 3.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Bench_and_stuccos_in_the_Villa_Majorelle,_Morocco.jpg",
    },
  },
  ryokan: {
    src: ryokan,
    alt: "The lantern-lit inner garden of a Kyoto ryokan",
    credit: {
      title: "Inner garden of Toshiharu Ryokan",
      author: "Maarten Heerlien",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
      source: "https://commons.wikimedia.org/wiki/File:Inner_garden_of_Toshiharu_Ryokan_(48885681682).jpg",
    },
  },
  gion: {
    src: gion,
    alt: "A lantern-lit lane in Gion in the evening",
    credit: {
      title: "Japan Road Through Gion",
      author: "Yiannis Theologos Michellis",
      licence: "CC0",
      licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      source: "https://commons.wikimedia.org/wiki/File:Japan_Road_Through_Gion_(14125414632).jpg",
    },
  },
  kaiseki: {
    src: kaiseki,
    alt: "A kaiseki course of seasonal small dishes",
    credit: {
      title: "Kaiseki 001",
      author: "Yuya Tamai",
      licence: "CC BY 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by/2.0",
      source: "https://commons.wikimedia.org/wiki/File:Kaiseki_001.jpg",
    },
  },
  inari: {
    src: inari,
    alt: "A tunnel of vermilion torii gates at Fushimi Inari-taisha",
    credit: {
      title: "Torii, Fushimi Inari-Taisha",
      author: "Marco Almbauer",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Torii,_Fushimi_Inari-Taisha.jpg",
    },
  },
  tea: {
    src: tea,
    alt: "A teahouse among autumn trees in a Kyoto garden",
    focus: "45% 50%",
    credit: {
      title: "241214 Shozan Resort Kyoto Kyoto Japan18s3",
      author: "663highland",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:241214_Shozan_Resort_Kyoto_Kyoto_Japan18s3.jpg",
    },
  },
  philosopher: {
    src: philosopher,
    alt: "Red maples over the canal on the Philosopher’s Path",
    focus: "50% 35%",
    credit: {
      title: "Along the Path of Philosophy, Kyoto",
      author: "KimonBerlin",
      licence: "CC BY-SA 2.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source: "https://commons.wikimedia.org/wiki/File:Along_the_Path_of_Philosophy,_Kyoto_(2634778181).jpg",
    },
  },
  bamboo: {
    src: bamboo,
    alt: "A path through the bamboo forest at Sagano, Arashiyama",
    credit: {
      title: "2021 Sagano Bamboo forest in Arashiyama, Kyoto, Japan",
      author: "Naokijp",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:2021_Sagano_Bamboo_forest_in_Arashiyama,_Kyoto,_Japan.jpg",
    },
  },
  katsura: {
    src: katsura,
    alt: "Togetsukyo bridge over the Katsura River at golden hour",
    credit: {
      title: "Togetsu-kyō bridge at golden hour, Kyoto, Japan",
      author: "Basile Morin",
      licence: "CC BY-SA 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Togetsu-ky%C5%8D_bridge_at_golden_hour,_Kyoto,_Japan.jpg",
    },
  },
};

/** Photos in the order they appear, for the credits list. */
export const photoOrder: PhotoId[] = [
  "kyoto",
  "amalfi",
  "marrakech",
  "ryokan",
  "kaiseki",
  "inari",
  "kyotoHero",
  "gion",
  "tea",
  "philosopher",
  "bamboo",
  "katsura",
];
