import { formatPrice } from "@/lib/utils";

export type SaleReceiptData = {
  number: number;
  dateLabel: string;
  originLabel: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  items: { title: string; unitPrice: number; quantity: number }[];
  total: number;
};

/** Les polices PDF standard ne gèrent pas l'espace fine insécable de Intl (fr-FR) : on la remplace par une espace normale. */
const money = (value: number) => formatPrice(value).replace(/[\u202F\u00A0]/g, " ");

/** Génère et télécharge le PDF d'une vente. jsPDF est chargé à la demande (uniquement au clic). */
export async function downloadSalePdf(sale: SaleReceiptData) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Atelier Nord", margin, 20);
  doc.setFontSize(14);
  doc.text(`Vente n°${sale.number}`, pageWidth - margin, 20, { align: "right" });

  doc.setDrawColor(200);
  doc.line(margin, 25, pageWidth - margin, 25);

  const info: [string, string][] = [
    ["Date", sale.dateLabel],
    ["Origine", sale.originLabel],
    ["Client", sale.customerName],
    ["Email", sale.customerEmail ?? "—"],
    ["Téléphone", sale.customerPhone ?? "—"],
  ];
  doc.setFontSize(10);
  let y = 34;
  for (const [label, value] of info) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20);
    doc.text(value, margin + 30, y);
    y += 6.5;
  }

  autoTable(doc, {
    startY: y + 4,
    margin: { left: margin, right: margin },
    head: [["Article", "Prix unitaire", "Quantité", "Sous-total"]],
    body: sale.items.map((i) => [i.title, money(i.unitPrice), String(i.quantity), money(i.unitPrice * i.quantity)]),
    foot: [[{ content: "Total", colSpan: 3, styles: { halign: "right" } }, money(sale.total)]],
    headStyles: { fillColor: [240, 240, 240], textColor: 60, fontStyle: "bold" },
    footStyles: { fillColor: [255, 255, 255], textColor: 20, fontStyle: "bold", fontSize: 11 },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
    didParseCell: (data) => {
      if (data.section === "head" && data.column.index > 0) data.cell.styles.halign = "right";
    },
  });

  doc.save(`vente-${sale.number}.pdf`);
}

export type DaySalesReportData = {
  dateLabel: string;
  dayKey: string;
  orderCount: number;
  totalQty: number;
  totalAmount: number;
  items: {
    time: string;
    orderNumber: number;
    customerName: string;
    title: string;
    quantity: number;
    subtotal: number;
  }[];
};

/** Génère et télécharge le PDF du rapport de sorties d'une journée. */
export async function downloadDaySalesPdf(report: DaySalesReportData) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Atelier Nord", margin, 20);
  doc.setFontSize(12);
  doc.text("Sorties du jour", pageWidth - margin, 20, { align: "right" });

  doc.setDrawColor(200);
  doc.line(margin, 25, pageWidth - margin, 25);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20);
  doc.text(report.dateLabel, margin, 34);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110);
  const summary = [
    `Ventes : ${report.orderCount}`,
    `Articles sortis : ${report.totalQty}`,
    `Montant : ${money(report.totalAmount)}`,
  ].join("   ·   ");
  doc.text(summary, margin, 42);

  autoTable(doc, {
    startY: 48,
    margin: { left: margin, right: margin },
    head: [["Heure", "Vente", "Client", "Article", "Qté", "Sous-total"]],
    body: report.items.map((i) => [
      i.time,
      `n°${i.orderNumber}`,
      i.customerName,
      i.title,
      `-${i.quantity}`,
      money(i.subtotal),
    ]),
    foot: [
      [
        { content: "Total", colSpan: 5, styles: { halign: "right" } },
        money(report.totalAmount),
      ],
    ],
    headStyles: { fillColor: [240, 240, 240], textColor: 60, fontStyle: "bold" },
    footStyles: { fillColor: [255, 255, 255], textColor: 20, fontStyle: "bold", fontSize: 11 },
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 18 },
      4: { halign: "right", cellWidth: 14 },
      5: { halign: "right", cellWidth: 28 },
    },
    didParseCell: (data) => {
      if (data.section === "head" && (data.column.index === 4 || data.column.index === 5)) {
        data.cell.styles.halign = "right";
      }
    },
  });

  doc.save(`sorties-${report.dayKey}.pdf`);
}

export type DayMovementsReportData = {
  dateLabel: string;
  dayKey: string;
  movementCount: number;
  inQty: number;
  outQty: number;
  adjustQty: number;
  items: {
    time: string;
    productTitle: string;
    typeLabel: string;
    quantity: number;
    stockAfter: number;
    note: string | null;
    by: string;
  }[];
};

/** Génère et télécharge le PDF des mouvements de stock d'une journée. */
export async function downloadDayMovementsPdf(report: DayMovementsReportData) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Atelier Nord", margin, 20);
  doc.setFontSize(12);
  doc.text("Mouvements de stock", pageWidth - margin, 20, { align: "right" });

  doc.setDrawColor(200);
  doc.line(margin, 25, pageWidth - margin, 25);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20);
  doc.text(report.dateLabel, margin, 34);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110);
  const adj =
    report.adjustQty === 0 ? "0" : report.adjustQty > 0 ? `+${report.adjustQty}` : String(report.adjustQty);
  const summary = [
    `Mouvements : ${report.movementCount}`,
    `Entrées : +${report.inQty}`,
    `Sorties : -${report.outQty}`,
    `Ajustements : ${adj}`,
  ].join("   ·   ");
  doc.text(summary, margin, 42);

  autoTable(doc, {
    startY: 48,
    margin: { left: margin, right: margin },
    head: [["Heure", "Produit", "Type", "Qté", "Stock après", "Note", "Par"]],
    body: report.items.map((i) => [
      i.time,
      i.productTitle,
      i.typeLabel,
      i.quantity > 0 ? `+${i.quantity}` : String(i.quantity),
      String(i.stockAfter),
      i.note ?? "—",
      i.by,
    ]),
    headStyles: { fillColor: [240, 240, 240], textColor: 60, fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 2.2 },
    columnStyles: {
      0: { cellWidth: 16 },
      3: { halign: "right", cellWidth: 14 },
      4: { halign: "right", cellWidth: 20 },
    },
    didParseCell: (data) => {
      if (data.section === "head" && (data.column.index === 3 || data.column.index === 4)) {
        data.cell.styles.halign = "right";
      }
    },
  });

  doc.save(`mouvements-${report.dayKey}.pdf`);
}
