import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";

/**
 * The bunker calls this when course data changes (DIRECTORY_REVALIDATE_URL).
 * The directory is prerendered, so a change means a rebuild: with the
 * shared secret checked, this triggers the Cloudflare deploy hook
 * (DEPLOY_HOOK_URL, once Workers Builds is connected to GitHub). Cloudflare
 * limits a hook to 10 builds a minute; a busy editing session simply
 * queues one build behind another.
 */
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const secret = getSecret("DIRECTORY_REVALIDATE_SECRET");
  if (!secret) return Response.json({ error: "Not configured." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }
  const hook = getSecret("DEPLOY_HOOK_URL");
  if (!hook) return Response.json({ queued: false, reason: "No deploy hook yet." }, { status: 202 });
  const res = await fetch(hook, { method: "POST" });
  return Response.json({ queued: res.ok }, { status: res.ok ? 202 : 502 });
};
