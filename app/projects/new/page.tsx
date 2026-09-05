import Link from 'next/link';
import { createProject } from '@/app/actions/projects';

export default function CreateProjectPage() {
  return (
    <div className="mx-auto max-w-xl p-8">
      <div className="mb-6">
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to projects
        </Link>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight mb-6">New Project</h1>
      <form action={createProject} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Project name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder="e.g. Marketing Campaign Q1"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description <span className="text-muted-foreground">(optional)</span></label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={1000}
            placeholder="What is this project about?"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Create Project
        </button>
      </form>
    </div>
  );
}
