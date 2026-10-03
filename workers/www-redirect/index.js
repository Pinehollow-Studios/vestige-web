// www.vestige.golf -> vestige.golf, keeping the path and query (a 308, as
// on Vercel). The main site's static pages are served before any Worker
// code runs, so the host redirect lives in this tiny Worker of its own.
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = "vestige.golf";
    return Response.redirect(url.toString(), 308);
  },
};
