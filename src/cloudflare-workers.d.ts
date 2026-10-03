/** The Worker's bindings module (provided by workerd at runtime). Typed at the use site: lib/server/worker-env.ts. */
declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}
