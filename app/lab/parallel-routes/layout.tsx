export default function ParallelLayout({
  header,
  sidebar,
}: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-muted/40 p-4">{sidebar}</aside>
      <main className="flex-1 p-8">
        <header className="mb-4 rounded-lg border bg-card p-4">{header}</header>
        <div className="rounded-lg border bg-card p-8">Page content</div>
      </main>
    </div>
  );
}
