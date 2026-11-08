import RoleUserModal from "@/components/admin/RoleUserModal";
import UserList from "@/components/admin/UserList";

export const instant = false;

export default function TrainersPage() {
  return (
    <main>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">
            Workspace / Trainers
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Trainers
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            View trainer accounts and their current status.
          </p>
        </div>
        <RoleUserModal role="TRAINER" />
      </header>
      <UserList role="TRAINER" />
    </main>
  );
}
