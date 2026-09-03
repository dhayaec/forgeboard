import { Suspense } from 'react';
import { getUsers } from './actions';
import Loading from './loading';

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchParamsPage({ searchParams }: Props) {
  const { q = '', page = '1' } = await searchParams;
  const pageNum = Number(page);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Search Params (URL-driven filters)</h1>
      <p className="text-muted-foreground mb-6">
        Filters are in the URL — shareable, bookmarkable, SSR-friendly. No client state for filters.
      </p>

      <form className="mb-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search users..."
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
          Search
        </button>
      </form>

      <Suspense fallback={<Loading />}>
        <UserList query={q} page={pageNum} />
      </Suspense>
    </div>
  );
}

async function UserList({ query, page }: { query: string; page: number }) {
  // In production: replace with actual DB query
  await new Promise((r) => setTimeout(r, 300));
  const users = await getUsers(query, page);

  return (
    <div className="space-y-2">
      {users.length === 0 ? (
        <p className="text-muted-foreground">No users found for &quot;{query}&quot;</p>
      ) : (
        users.map((u) => (
          <div key={u.id} className="rounded-lg border p-3">
            <p className="font-medium">{u.name}</p>
            <p className="text-sm text-muted-foreground">{u.email}</p>
          </div>
        ))
      )}
    </div>
  );
}
