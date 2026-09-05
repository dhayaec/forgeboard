import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          ForgeBoard
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Production-grade multi-tenant project management SaaS
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Next.js 16 · TypeScript · PostgreSQL · Terraform
        </p>
      </div>

      <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        <FeatureCard
          href="/dashboard"
          title="App Dashboard"
          description="Authenticated application shell"
        />
        <FeatureCard
          href="/lab"
          title="Routing Lab"
          description="Next.js routing patterns demo"
        />
        <FeatureCard
          href="/projects/new"
          title="Create Project"
          description="Server Actions demo"
        />
        <FeatureCard
          href="/api/health"
          title="Health API"
          description="Route Handler demo"
        />
      </div>

      <div className="mt-4 flex gap-4">
        <Link
          // @ts-ignore Next.js 16 typed Link
          href="/auth/login"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Sign In
        </Link>
        <Link
          // @ts-ignore Next.js 16 typed Link
          href="/auth/register"
          className="rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          Get Started
        </Link>
      </div>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        Phase 1 scaffold committed · Phase 2 routing lab next
      </footer>
    </main>
  );
}

function FeatureCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      // @ts-ignore href type
      href={href}
      className="group flex flex-col gap-1 rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className="text-sm font-semibold text-foreground group-hover:text-primary">
        {title}
      </span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </Link>
  );
}
