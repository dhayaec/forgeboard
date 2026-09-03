import { Metadata } from 'next';

// Opt out of static rendering — this page is rendered on every request
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dynamic Rendering — Lab',
};

export default function DynamicRenderingPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dynamic Rendering</h1>
      <p className="text-muted-foreground mb-4">
        This page is dynamically rendered on every request.
        Use when content is personalized, user-specific, or changes frequently.
      </p>
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Rendered at request time:{' '}
          <span className="font-mono">{new Date().toISOString()}</span>
        </p>
      </div>
    </div>
  );
}
