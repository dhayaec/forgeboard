export default function Loading() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-lg border p-3">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="mt-1 h-3 w-48 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
