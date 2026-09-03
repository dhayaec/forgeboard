export type User = { id: string; name: string; email: string };

const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Chen', email: 'alice@example.com' },
  { id: '2', name: 'Bob Martinez', email: 'bob@example.com' },
  { id: '3', name: 'Carol Johnson', email: 'carol@example.com' },
  { id: '4', name: 'David Kim', email: 'david@example.com' },
  { id: '5', name: 'Emma Wilson', email: 'emma@example.com' },
];

export async function getUsers(query: string, page: number, pageSize = 5): Promise<User[]> {
  await new Promise((r) => setTimeout(r, 100));
  const filtered = MOCK_USERS.filter(
    (u) =>
      !query ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );
  const start = (page - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
}
