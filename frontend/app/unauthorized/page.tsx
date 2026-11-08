import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0b1120] px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
        Access denied
      </p>
      <h1 className="mt-3 text-3xl font-bold text-white">
        You do not have access to this page.
      </h1>
      <Link
        className="mt-7 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300"
        href="/"
      >
        Go to your workspace
      </Link>
    </main>
  );
}
