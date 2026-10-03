import type { ImageMetadata } from "astro";
import fairwayShadows from "../assets/photos/hankley-common-fairway-shadows.jpg";
import teeHeather from "../assets/photos/hankley-common-tee-heather.jpg";
import pinesSunset from "../assets/photos/hankley-common-pines-sunset.jpg";
import arthursSeat from "../assets/photos/edinburgh-arthurs-seat.jpg";
import cityTee from "../assets/photos/edinburgh-city-tee.jpg";
import manchesterSkyline from "../assets/photos/oldham-manchester-skyline.jpg";
import pineRidge from "../assets/photos/pine-ridge-pines.jpg";
import farnhamEvening from "../assets/photos/farnham-park-evening.jpg";

/**
 * The site's photographs. Every one is Tom's or Jack's own, resized from
 * ~/Documents/VESTIGE/photos with the location data stripped.
 *
 * `place` is where the photo was taken, worked out from its GPS against
 * the course data. A photo is only captioned with a named course once
 * `confirmed` is true (docs/rebuild-plan.md: never name a course we
 * haven't verified); until then the caption falls back to `area`.
 */
export type Photo = {
  src: ImageMetadata;
  alt: string;
  /** The course, from the photo's GPS. Shown only when confirmed. */
  place: string;
  /** A safe, general caption: the town or county. */
  area: string;
  confirmed: boolean;
};

export const photos = {
  fairwayShadows: {
    src: fairwayShadows,
    alt: "Two golfers' long shadows side by side on a sunlit fairway lined with Scots pines, under a clear blue sky.",
    place: "Hankley Common",
    area: "Surrey",
    confirmed: false,
  },
  teeHeather: {
    src: teeHeather,
    alt: "A golfer addressing the ball on a tee, with heather and a pine-lined fairway stretching away below in evening light.",
    place: "Hankley Common",
    area: "Surrey",
    confirmed: false,
  },
  pinesSunset: {
    src: pinesSunset,
    alt: "The low sun bursting through a stand of Scots pines, throwing long shadows across a fairway.",
    place: "Hankley Common",
    area: "Surrey",
    confirmed: false,
  },
  arthursSeat: {
    src: arthursSeat,
    alt: "A golfer on a fairway edged with yellow gorse, with Arthur's Seat and the Edinburgh skyline behind under a big sky.",
    place: "Braid Hills",
    area: "Edinburgh",
    confirmed: false,
  },
  cityTee: {
    src: cityTee,
    alt: "A golfer on a high tee above Edinburgh, a bag on the grass nearby, the city and the Forth spread out below.",
    place: "Braid Hills",
    area: "Edinburgh",
    confirmed: false,
  },
  manchesterSkyline: {
    src: manchesterSkyline,
    alt: "A golfer on a green on the edge of the Pennines, fields falling away to the Manchester skyline on the horizon.",
    place: "Oldham Golf Club",
    area: "Greater Manchester",
    confirmed: false,
  },
  pineRidge: {
    src: pineRidge,
    alt: "Golfers walking down a wide fairway beneath tall pines on a grey winter day.",
    place: "Pine Ridge",
    area: "Surrey",
    confirmed: false,
  },
  farnhamEvening: {
    src: farnhamEvening,
    alt: "A golfer with a bag on a summer evening fairway, cloud lit gold behind the trees.",
    place: "Farnham Park",
    area: "Surrey",
    confirmed: false,
  },
} satisfies Record<string, Photo>;

/** The caption a photo may carry: the course once confirmed, else the area. */
export function caption(photo: Photo): string {
  return photo.confirmed ? `${photo.place}, ${photo.area}` : photo.area;
}
