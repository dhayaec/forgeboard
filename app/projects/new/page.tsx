import Link from 'next/link';

export default function CreateProjectPage() {
  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6">New Project</h1>
      <form className="space-y-4" action="#" method="post">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Project name</label>
          <input id="name" name="name" type="text" required
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
          <textarea id="description" name="description" rows={3}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm" />
        </div>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Create</button>
      </form>
    </div>
  );
}
