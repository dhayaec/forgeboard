export default function OptionalCatchAllPage({ params }: { params: { slug?: string[] } }) {
  const segments = params.slug ?? [];
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Optional Catch-all Route</h1>
      <p className="text-muted-foreground">Slug segments: <code className="rounded bg-muted px-1">{JSON.stringify(segments)}</code></p>
    </div>
  );
}
