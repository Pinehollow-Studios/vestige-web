/**
 * The site share card, attached to every marketing page. The image itself
 * lives in app/opengraph-image.tsx, which keeps serving the old
 * `/opengraph-image` URL that shares made before the route groups point at;
 * a metadata image at the app root no longer reaches pages inside a route
 * group, so this file attaches the same card to them (served at
 * `/opengraph-image-<hash>`, Next's suffix for images inside a group).
 */
export { default, alt, size, contentType } from "../opengraph-image";
