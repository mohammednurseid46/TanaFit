import MemberAIAssistant from "@/components/member/MemberAIAssistant";

export default function MemberAIPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6 sm:pt-9">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300/75">
          Tana AI
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Your fitness assistant
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Get personalized guidance for your workouts, exercises, progress, and fitness questions.
        </p>
      </header>
      <MemberAIAssistant />
    </main>
  );
}
