"use client";

import { useState } from "react";
import { Camera, CheckCircle2, QrCode, X } from "lucide-react";

export type MembershipStatus = "Active" | "Expired";

export type ScannedMember = {
  id: string;
  name: string;
  photo: string;
  status: MembershipStatus;
  memberId: string;
  plan: string;
};

const memberProfiles: ScannedMember[] = [
  {
    id: "5f4d3f6d-4c9d-4f2a-b3dc-8f8a382d7d76",
    name: "Alicia Gomez",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    status: "Active",
    memberId: "5f4d3f6d-4c9d-4f2a-b3dc-8f8a382d7d76",
    plan: "Black Card",
  },
  {
    id: "8a2e68da-9cd6-431d-a7bf-2e0d8c5c90c6",
    name: "Marcus Hill",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    status: "Expired",
    memberId: "8a2e68da-9cd6-431d-a7bf-2e0d8c5c90c6",
    plan: "Standard",
  },
  {
    id: "2d5fa8c6-0a1f-4d4d-9b98-0fb33704f62d",
    name: "Priya Shah",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    status: "Active",
    memberId: "2d5fa8c6-0a1f-4d4d-9b98-0fb33704f62d",
    plan: "Premium",
  },
];

export function QRScannerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedMember, setScannedMember] = useState<ScannedMember | null>(null);

  function handleScan() {
    setIsScanning(true);
    setScannedMember(null);

    const nextMember =
      memberProfiles[Math.floor(Math.random() * memberProfiles.length)];

    window.setTimeout(() => {
      setScannedMember(nextMember);
      setIsScanning(false);
    }, 1200);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-slate-700 bg-[#0f172a] p-5 shadow-2xl shadow-slate-950/50">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
              Member check-in
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">QR scanner</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close QR scanner"
            className="flex size-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Camera size={16} className="text-cyan-300" />
              Live scanner
            </div>
            <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-[10px] font-medium text-cyan-300">
              Ready
            </span>
          </div>

          <div className="relative mx-auto flex h-56 max-w-sm items-center justify-center overflow-hidden rounded-2xl border border-dashed border-cyan-400/40 bg-slate-900/80">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.16),_transparent_65%)]" />
            <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-cyan-400/80 p-3 shadow-[0_0_0_6px_rgba(34,211,238,0.06)]">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-950/80 text-cyan-300">
                <QrCode size={44} />
              </div>
            </div>
            <div className={`absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,1)] transition-all duration-700 ${isScanning ? "top-[30%]" : "top-[51%]"}`} />
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleScan}
              disabled={isScanning}
              className="flex-1 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isScanning ? "Scanning..." : "Scan QR"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>

        {scannedMember ? (
          <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={scannedMember.photo}
                  alt={scannedMember.name}
                  className="size-14 rounded-full object-cover ring-2 ring-cyan-400/40"
                />
                <div>
                  <p className="text-lg font-semibold text-white">{scannedMember.name}</p>
                  <p className="text-xs text-slate-400">#{scannedMember.memberId}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  scannedMember.status === "Active"
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-rose-400/10 text-rose-300"
                }`}
              >
                <CheckCircle2 size={10} />
                {scannedMember.status}
              </span>
            </div>
            <div className="mt-4 grid gap-2 rounded-xl border border-slate-800 bg-[#111827] p-3 text-sm text-slate-300 sm:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                  Membership
                </p>
                <p className="mt-1 font-medium text-slate-200">{scannedMember.plan}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                  Status
                </p>
                <p className="mt-1 font-medium text-slate-200">{scannedMember.status}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
