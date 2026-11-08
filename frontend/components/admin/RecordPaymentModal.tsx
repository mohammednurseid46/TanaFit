"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CreditCard, X } from "lucide-react";

interface PayableInvoice {
  id: string;
  memberId: string;
  memberName: string;
  totalAmount: string;
  remainingAmount: string;
}

function isPayableInvoiceList(value: unknown): value is PayableInvoice[] {
  return (
    Array.isArray(value) &&
    value.every(
      (invoice) =>
        typeof invoice === "object" &&
        invoice !== null &&
        "id" in invoice &&
        typeof invoice.id === "string" &&
        "memberId" in invoice &&
        typeof invoice.memberId === "string" &&
        "memberName" in invoice &&
        typeof invoice.memberName === "string" &&
        "totalAmount" in invoice &&
        typeof invoice.totalAmount === "string" &&
        "remainingAmount" in invoice &&
        typeof invoice.remainingAmount === "string",
    )
  );
}

export default function RecordPaymentModal({
  onClose,
  onRecorded,
}: {
  onClose(): void;
  onRecorded(): void;
}) {
  const [invoices, setInvoices] = useState<PayableInvoice[]>([]);
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionRef, setTransactionRef] = useState("");
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInvoices() {
      try {
        const response = await fetch("/api/admin/payment-invoices", {
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
              : "Unable to load unpaid invoices.";
          throw new Error(detail);
        }
        if (!isPayableInvoiceList(payload)) {
          throw new Error("The administration service returned invalid invoices.");
        }
        if (active) {
          setInvoices(payload);
          setInvoiceId(payload[0]?.id ?? "");
        }
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error ? cause.message : "Unable to load invoices.",
          );
        }
      } finally {
        if (active) {
          setLoadingInvoices(false);
        }
      }
    }

    void loadInvoices();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, submitting]);

  const selectedInvoice = invoices.find((invoice) => invoice.id === invoiceId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: invoiceId,
          amount,
          payment_method: paymentMethod,
          transaction_ref: transactionRef.trim() || null,
        }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const detail =
          typeof payload === "object" &&
          payload !== null &&
          "detail" in payload &&
          typeof payload.detail === "string"
            ? payload.detail
            : "Unable to record this payment.";
        throw new Error(detail);
      }

      onRecorded();
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to record this payment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <section
        aria-labelledby="record-payment-title"
        aria-modal="true"
        className="my-auto w-full max-w-xl rounded-2xl border border-cyan-300/15 bg-[#0f172a] p-5 shadow-2xl shadow-black/40 sm:p-6"
        role="dialog"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
              Admin workspace
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white" id="record-payment-title">
              Record Payment
            </h2>
          </div>
          <button
            aria-label="Close dialog"
            className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
            disabled={submitting}
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {loadingInvoices ? (
            <p className="text-sm text-slate-400" role="status">
              Loading unpaid invoices…
            </p>
          ) : invoices.length === 0 ? (
            <p className="rounded-xl border border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-300">
              There are no unpaid invoices to record a payment against.
            </p>
          ) : (
            <>
              <label className="block space-y-2 text-sm font-medium text-slate-300">
                Member invoice
                <select
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  onChange={(event) => setInvoiceId(event.target.value)}
                  required
                  value={invoiceId}
                >
                  {invoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.memberName} · Balance ${invoice.remainingAmount}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-300">
                Amount
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  max={selectedInvoice?.remainingAmount}
                  min="0.01"
                  onChange={(event) => setAmount(event.target.value)}
                  required
                  step="0.01"
                  type="number"
                  value={amount}
                />
                {selectedInvoice ? (
                  <span className="block text-xs text-slate-500">
                    Remaining invoice balance: ${selectedInvoice.remainingAmount}
                  </span>
                ) : null}
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-300">
                Payment method
                <select
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  value={paymentMethod}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank transfer">Bank transfer</option>
                  <option value="mobile money">Mobile money</option>
                </select>
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-300">
                Transaction reference <span className="text-slate-500">(optional)</span>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  onChange={(event) => setTransactionRef(event.target.value)}
                  value={transactionRef}
                />
              </label>
            </>
          )}

          {error ? (
            <p
              aria-live="polite"
              className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
              disabled={submitting}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting || loadingInvoices || invoices.length === 0}
              type="submit"
            >
              <CreditCard size={16} />
              {submitting ? "Recording…" : "Record Payment"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
