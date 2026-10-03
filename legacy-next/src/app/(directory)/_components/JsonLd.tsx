import { jsonLdString } from "@/lib/directory/jsonLd";

/**
 * A page's structured data as a plain `<script type="application/ld+json">`
 * in the body, per the Next JSON-LD guide, `<` escaped.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />
  );
}
