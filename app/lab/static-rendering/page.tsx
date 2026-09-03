import { Metadata } from 'next';

// This page has no dynamic data — Next.js will render it at build time
// and cache the result, revalidating only when revalidatePath/revalidateTag is called
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Static Rendering — Lab',
};

export default function StaticRenderingPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Static Rendering</h1>
      <p className="text-muted-foreground mb-4">
        This page is statically rendered at build time. No dynamic data is fetched.
        The HTML is cached and served from the CDN.
      </p>
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Rendered at build time:{' '}
          <span className="font-mono">{new Date().toISOString()}</span>
        </p>
      </div>
    </div>
  );
}
