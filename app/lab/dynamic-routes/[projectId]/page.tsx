export default function DynamicRoutePage({ params }: { params: { projectId: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dynamic Route</h1>
      <p className="text-muted-foreground">Project ID: <code className="rounded bg-muted px-1">{params.projectId}</code></p>
    </div>
  );
}
