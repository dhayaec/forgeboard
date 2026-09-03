import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  searchParams: Promise<{ trigger?: string }>;
}

export default async function NotFoundBehaviorPage({ searchParams }: Props) {
  const { trigger } = await searchParams;

  if (trigger === 'not-found') {
    notFound();
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">notFound() Behavior</h1>
      <p className="text-muted-foreground mb-4">
        Click below to trigger the not-found boundary. The URL segment closest to
        the trigger renders the <code>not-found.tsx</code> file.
      </p>
      <Link
        href="/lab/not-found-behavior?trigger=not-found"
        className="inline-block rounded-lg bg-destructive px-4 py-2 text-sm text-destructive-foreground"
      >
        Trigger notFound()
      </Link>
    </div>
  );
}
