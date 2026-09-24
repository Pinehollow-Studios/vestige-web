import type { Metadata } from "next";
import Link from "next/link";

/**
 * A `notFound()` inside the course directory - an unknown course, county or
 * list slug. Renders inside the directory's own layout, so it follows the
 * reader's light / dark. A URL that matches no route at all gets the site's
 * global 404 (app/global-not-found.tsx) instead.
 */

export const metadata: Metadata = {
  title: "Course not found",
};

export default function DirectoryNotFound() {
  return (
    <div className="dx-empty">
      <h1 className="dx-title">We can&rsquo;t find that one</h1>
      <p>
        There&rsquo;s no course, county or list at this address. It may have been mistyped, or
        the page may have moved.
      </p>
      <p>
        <Link href="/">Back to Vestige</Link>
      </p>
    </div>
  );
}
