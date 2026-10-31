"use client";

import { useState } from "react";
import { DownloadIcon, PrinterIcon } from "@/components/icons";
import { downloadDayMovementsPdf, type DayMovementsReportData } from "@/lib/saleReceiptPdf";

export default function DayMovementsActions({ report }: { report: DayMovementsReportData }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePdf() {
    setBusy(true);
    setError(null);
    try {
      await downloadDayMovementsPdf(report);
    } catch {
      setError("Impossible de générer le PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
      <button type="button" onClick={handlePdf} disabled={busy} className="btn-primary">
        <DownloadIcon />
        {busy ? "Génération…" : "PDF"}
      </button>
      <button type="button" onClick={() => window.print()} className="btn-ghost">
        <PrinterIcon />
        Imprimer
      </button>
      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
