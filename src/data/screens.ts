import type { ImageMetadata } from "astro";
import homeMap from "../assets/screens/home-map.jpg";
import feedRound from "../assets/screens/feed-round.jpg";
import profile from "../assets/screens/profile.jpg";
import courseHankley from "../assets/screens/course-hankley-common.jpg";
import courseHankleySatellite from "../assets/screens/course-hankley-common-satellite.jpg";
import listTop100 from "../assets/screens/list-top-100-england.jpg";
import courseWentworth from "../assets/screens/course-wentworth.jpg";
import toPlay from "../assets/screens/to-play.jpg";

/**
 * Real screenshots of the app (iOS 26, dark appearance), from Tom's phone.
 * Status bars are normalised to 9:41 with full signal and battery by
 * scripts/clean-status-bar.sh; nothing else is altered.
 */
export type Screen = { src: ImageMetadata; alt: string };

export const screens = {
  homeMap: {
    src: homeMap,
    alt: "Vestige's home screen: a dark map of England's counties with your played courses glowing, and 7 of 1,811 courses collected.",
  },
  feedRound: {
    src: feedRound,
    alt: "A friend's round in the Vestige feed: Farnham Golf Club, a photo of the green at dusk, 92 strokes, liked by friends.",
  },
  profile: {
    src: profile,
    alt: "A Vestige profile: 7 courses and 3 of 47 counties, with a top three of Hankley Common, Pine Ridge and Brookdale.",
  },
  courseHankley: {
    src: courseHankley,
    alt: "Hankley Common Golf Club in Vestige: number 22 on the Vestige Top 100, Vestige Index 92, marked played, with holes, par, yards and the year it was founded.",
  },
  courseHankleySatellite: {
    src: courseHankleySatellite,
    alt: "Hankley Common outlined on a satellite map in Vestige, with its course card below: number 22, marked played.",
  },
  listTop100: {
    src: listTop100,
    alt: "The Top 100 England list in Vestige, a curated ranking, with 1 of 100 played.",
  },
  courseWentworth: {
    src: courseWentworth,
    alt: "Wentworth Golf Club in Vestige: number 27 on the Vestige Top 100, Vestige Index 91, saved to play.",
  },
  toPlay: {
    src: toPlay,
    alt: "A Vestige to-play list, with Wentworth up next, 160 miles away.",
  },
} satisfies Record<string, Screen>;
