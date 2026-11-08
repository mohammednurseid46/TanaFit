import UserList from "@/components/admin/UserList";

export const instant = false;

export default function ManagersPage() {
  return (
    <main>
      <header className="mb-8">
        <p className="mb-1 text-xs font-medium text-slate-500">
          Workspace / Managers
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Managers
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          View manager accounts and their current status.
        </p>
      </header>
      <UserList role="MANAGER" />
    </main>
  );
}
