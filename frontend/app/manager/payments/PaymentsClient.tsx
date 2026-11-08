"use client";

import { useState } from "react";
import { BadgeDollarSign, CreditCard, WalletCards } from "lucide-react";

const expiredMembers = [
  { name: "Marcus Hill", memberId: "M-2084", balance: "$120.00", lastRenewal: "Aug 18" },
  { name: "Olivia Scott", memberId: "M-3761", balance: "$89.00", lastRenewal: "Aug 25" },
  { name: "Noah Reed", memberId: "M-4448", balance: "$95.00", lastRenewal: "Sep 02" },
];

export default function ManagerPaymentsPage() {
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [selectedMember, setSelectedMember] = useState(expiredMembers[0].name);

  return (
    <main className="min-h-screen bg-[#0b1120] text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Front desk
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Membership renewals
          </h1>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Expired members</h2>
              <span className="rounded-full bg-rose-400/10 px-2.5 py-1 text-[10px] font-medium text-rose-300">
                {expiredMembers.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {expiredMembers.map((member) => (
                <button
                  key={member.memberId}
                  type="button"
                  onClick={() => setSelectedMember(member.name)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                    selectedMember === member.name
                      ? "border-cyan-400/40 bg-cyan-400/5"
                      : "border-slate-800 bg-slate-950/30 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200">{member.name}</p>
                    <p className="mt-1 text-[11px] text-slate-500">#{member.memberId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-rose-300">{member.balance}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Since {member.lastRenewal}</p>
                  </div>
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Renewal payment</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Process payment for {selectedMember}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <BadgeDollarSign size={18} />
              </div>
            </div>

            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-slate-300">
                  Membership tier
                  <select className="mt-1.5 h-11 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-3 text-slate-200 outline-none focus:border-cyan-400/50">
                    <option>1 Month</option>
                    <option>3 Months</option>
                    <option>6 Months</option>
                    <option>12 Months</option>
                  </select>
                </label>
                <label className="block text-sm text-slate-300">
                  Amount due
                  <input
                    defaultValue="$120.00"
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-3 text-slate-200 outline-none focus:border-cyan-400/50"
                  />
                </label>
              </div>

              <div>
                <p className="mb-2 text-sm text-slate-300">Payment method</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { label: "Card", icon: CreditCard },
                    { label: "Cash", icon: WalletCards },
                  ].map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setPaymentMethod(label)}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                        paymentMethod === label
                          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                          : "border-slate-700 bg-slate-950/30 text-slate-300"
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Membership renewal</span>
                  <span className="text-slate-200">$120.00</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
                  <span>Processing fee</span>
                  <span className="text-slate-200">$0.00</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3 text-base font-semibold text-white">
                  <span>Total</span>
                  <span>$120.00</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Process {paymentMethod} payment
              </button>
            </form>
          </article>
        </section>
      </div>
    </main>
  );
}
