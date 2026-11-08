"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUpDown,
  Check,
  CircleAlert,
  Clock3,
  Dumbbell,
  Search,
  Wrench,
} from "lucide-react";

type EquipmentStatus = "Working" | "Needs maintenance";
type EquipmentItem = {
  id: number;
  name: string;
  category: string;
  location: string;
  status: EquipmentStatus;
  lastServiced: string;
};

const initialEquipment: EquipmentItem[] = [
  { id: 1, name: "Treadmill Pro X9", category: "Cardio", location: "Cardio floor · A1", status: "Working", lastServiced: "Oct 08, 2026" },
  { id: 2, name: "Commercial Rowing Machine", category: "Cardio", location: "Cardio floor · A4", status: "Needs maintenance", lastServiced: "Sep 21, 2026" },
  { id: 3, name: "Cable Crossover Station", category: "Strength", location: "Strength zone · B2", status: "Working", lastServiced: "Oct 02, 2026" },
  { id: 4, name: "Leg Press Machine", category: "Strength", location: "Strength zone · B5", status: "Needs maintenance", lastServiced: "Sep 18, 2026" },
  { id: 5, name: "Spin Bike S-300", category: "Cycling", location: "Studio 1 · C3", status: "Working", lastServiced: "Oct 10, 2026" },
  { id: 6, name: "Smith Machine", category: "Strength", location: "Free weights · D1", status: "Working", lastServiced: "Oct 04, 2026" },
  { id: 7, name: "Elliptical Trainer E5", category: "Cardio", location: "Cardio floor · A7", status: "Needs maintenance", lastServiced: "Sep 25, 2026" },
  { id: 8, name: "Adjustable Cable Pulley", category: "Strength", location: "Strength zone · B3", status: "Working", lastServiced: "Oct 06, 2026" },
];

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState(initialEquipment);
  const [filter, setFilter] = useState<"All equipment" | EquipmentStatus>(
    "All equipment",
  );
  const [search, setSearch] = useState("");

  const visibleEquipment = useMemo(() => {
    const query = search.trim().toLowerCase();
    return equipment.filter((item) => {
      const matchesFilter = filter === "All equipment" || item.status === filter;
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [equipment, filter, search]);

  const needsMaintenance = equipment.filter(
    (item) => item.status === "Needs maintenance",
  ).length;

  function toggleStatus(id: number) {
    setEquipment((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "Working" ? "Needs maintenance" : "Working",
              lastServiced:
                item.status === "Needs maintenance" ? "Just now" : item.lastServiced,
            }
          : item,
      ),
    );
  }

  return (
    <main>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">
            Operations / Equipment
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Equipment
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Keep your gym floor running smoothly.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3.5 py-2.5">
          <CircleAlert size={16} className="text-amber-300" />
          <span className="text-xs font-medium text-amber-200">
            {needsMaintenance} items need attention
          </span>
        </div>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-3" aria-label="Equipment summary">
        <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <Dumbbell size={19} />
            </span>
            <div>
              <p className="text-xs text-slate-500">Total equipment</p>
              <p className="mt-1 text-xl font-bold text-white">{equipment.length}</p>
            </div>
          </div>
        </article>
        <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <Check size={19} />
            </span>
            <div>
              <p className="text-xs text-slate-500">Working well</p>
              <p className="mt-1 text-xl font-bold text-white">
                {equipment.length - needsMaintenance}
              </p>
            </div>
          </div>
        </article>
        <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
              <Wrench size={19} />
            </span>
            <div>
              <p className="text-xs text-slate-500">Needs maintenance</p>
              <p className="mt-1 text-xl font-bold text-white">
                {needsMaintenance}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0f172a]">
        <div className="flex flex-col gap-4 border-b border-slate-800/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Equipment inventory</h2>
            <p className="mt-1 text-xs text-slate-500">
              Track condition and update service status.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search equipment..."
                className="h-10 w-full rounded-xl border border-slate-800 bg-slate-950/50 pl-9 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/50 sm:w-56"
              />
            </label>
            <label className="relative">
              <span className="sr-only">Filter by status</span>
              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as "All equipment" | EquipmentStatus)
                }
                className="h-10 w-full appearance-none rounded-xl border border-slate-800 bg-slate-950/50 pl-3 pr-9 text-xs text-slate-300 outline-none focus:border-cyan-400/50 sm:w-44"
              >
                <option>All equipment</option>
                <option>Working</option>
                <option>Needs maintenance</option>
              </select>
              <ArrowDown
                size={13}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </label>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-950/30">
              <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <th className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1">
                    Equipment <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Last serviced</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {visibleEquipment.map((item) => {
                const working = item.status === "Working";
                return (
                  <tr key={item.id} className="transition hover:bg-slate-800/20">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-slate-800/80 text-slate-400">
                          <Dumbbell size={16} />
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            {item.name}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-500">
                            {item.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {item.location}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock3 size={13} className="text-slate-600" />
                        {item.lastServiced}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                          working
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-amber-400/10 text-amber-300"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            working ? "bg-emerald-400" : "bg-amber-400"
                          }`}
                        />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleStatus(item.id)}
                        aria-label={`Mark ${item.name} as ${
                          working ? "needing maintenance" : "working"
                        }`}
                        className={`rounded-lg border px-3 py-2 text-[10px] font-medium transition ${
                          working
                            ? "border-slate-700 text-slate-300 hover:border-amber-400/40 hover:bg-amber-400/5 hover:text-amber-200"
                            : "border-emerald-400/20 bg-emerald-400/5 text-emerald-300 hover:bg-emerald-400/10"
                        }`}
                      >
                        {working ? "Flag for service" : "Mark as working"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {visibleEquipment.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No equipment matches your search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-800/80 px-5 py-3.5 text-[10px] text-slate-500">
          <span>
            Showing <span className="font-medium text-slate-300">{visibleEquipment.length}</span> of{" "}
            <span className="font-medium text-slate-300">{equipment.length}</span> items
          </span>
          <span>Last updated just now</span>
        </div>
      </section>
    </main>
  );
}
