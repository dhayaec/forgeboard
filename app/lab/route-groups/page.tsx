// Phase 2 Lab: Route Groups — URL-independent grouping
// These routes don't add path segments to the URL
// Example: (marketing) and (auth) can share the same root layout but have independent pages

export default function RouteGroupsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Route Groups</h1>
      <p>These pages share the same root (/) but are grouped by feature.</p>
    </div>
  );
}
