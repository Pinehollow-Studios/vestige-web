import type { APIRoute } from "astro";

/**
 * The scraper trap. Every directory page links here with a hidden, nofollow
 * link, and robots.txt disallows it, so search engines never come. Whatever
 * does is logged (Workers observability) and gets nothing; Cloudflare's
 * firewall blocks the path outright once its rule is on.
 */
export const prerender = false;

const handler: APIRoute = ({ request }) => {
  console.log(
    "[trap]",
    JSON.stringify({
      ip: request.headers.get("cf-connecting-ip"),
      ua: request.headers.get("user-agent"),
      asn: (request as Request & { cf?: { asn?: number } }).cf?.asn ?? null,
    })
  );
  return new Response("Not found.", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex, nofollow" },
  });
};

export const GET = handler;
export const HEAD = handler;
