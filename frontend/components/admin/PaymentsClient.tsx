"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, Plus } from "lucide-react";

import RecordPaymentModal from "@/components/admin/RecordPaymentModal";

interface PaymentRecord {
  id: string;
  memberName: string;
  amount: string;
  paymentMethod: string;
  transactionRef: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

function isPaymentRecordList(value: unknown): value is PaymentRecord[] {
  return (
    Array.isArray(value) &&
    value.every(
      (payment) =>
        typeof payment === "object" &&
        payment !== null &&
        "id" in payment &&
        typeof payment.id === "string" &&
        "memberName" in payment &&
        typeof payment.memberName === "string" &&
        "amount" in payment &&
        typeof payment.amount === "string" &&
        "paymentMethod" in payment &&
        typeof payment.paymentMethod === "string" &&
        "status" in payment &&
        typeof payment.status === "string" &&
        "createdAt" in payment &&
        typeof payment.createdAt === "string" &&
        "paidAt" in payment &&
        (typeof payment.paidAt === "string" || payment.paidAt === null) &&
        "transactionRef" in payment &&
        (typeof payment.transactionRef === "string" ||
          payment.transactionRef === null),
    )
  );
}

function formatAmount(amount: string) {
  const value = Number(amount);
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value)
    : amount;
}

function formatDate(date: string) {
  const value = new Date(date);
  return Number.isNaN(value.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(value);
}

export default function PaymentsClient() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/payments", {
        cache: "no-store",
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const detail =
          typeof payload === "object" &&
          payload !== null &&
          "detail" in payload &&
          typeof payload.detail === "string"
            ? payload.detail
            : "Unable to load payment history.";
        throw new Error(detail);
      }
      if (!isPaymentRecordList(payload)) {
        throw new Error("The administration service returned invalid payments.");
      }
      setPayments(payload);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load payment history.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadPayments(), 0);
    window.addEventListener("gym:payments-updated", loadPayments);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("gym:payments-updated", loadPayments);
    };
  }, [loadPayments]);

  return (
    <>
      {modalOpen ? (
        <RecordPaymentModal
          onClose={() => setModalOpen(false)}
          onRecorded={() =>
            window.dispatchEvent(new Event("gym:payments-updated"))
          }
        />
      ) : null}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">
            Workspace / Payments
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Payments
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Review recorded payments and invoice activity.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          onClick={() => setModalOpen(true)}
          type="button"
        >
          <Plus size={16} />
          Record Payment
        </button>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0f172a]">
        {loading ? (
          <p className="p-6 text-sm text-slate-400" role="status">
            Loading payment history…
          </p>
        ) : error ? (
          <p
            aria-live="polite"
            className="p-6 text-sm text-rose-200"
            role="alert"
          >
            {error}
          </p>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
              <CreditCard size={22} />
            </span>
            <p className="mt-4 text-sm font-semibold text-white">
              No payments recorded
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Recorded payments will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/40 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Member</th>
                  <th className="px-5 py-4 font-medium">Amount</th>
                  <th className="px-5 py-4 font-medium">Method</th>
                  <th className="px-5 py-4 font-medium">Reference</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {payments.map((payment) => (
                  <tr className="text-slate-300" key={payment.id}>
                    <td className="px-5 py-4 font-medium text-white">
                      {payment.memberName}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-100">
                      {formatAmount(payment.amount)}
                    </td>
                    <td className="px-5 py-4 capitalize">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-5 py-4">
                      {payment.transactionRef || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          payment.status.toLowerCase() === "completed"
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-amber-400/10 text-amber-300"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {formatDate(payment.paidAt ?? payment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
