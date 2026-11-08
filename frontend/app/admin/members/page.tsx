import UserList from "@/components/admin/UserList";

export const instant = false;

export default function MembersPage() {
  return (
    <main>
      <header className="mb-8">
        <p className="mb-1 text-xs font-medium text-slate-500">
          Workspace / Members
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Members
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          View member accounts and their current status.
        </p>
      </header>
      <UserList role="MEMBER" />
    </main>
  );
}
