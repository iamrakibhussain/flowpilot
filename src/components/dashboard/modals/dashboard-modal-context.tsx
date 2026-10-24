"use client";

import * as React from "react";
import { InvoiceBuilderModal } from "../invoices/invoice-builder-modal";
import { NewAppointmentModal } from "./new-appointment-modal";
import { NewCustomerModal } from "./new-customer-modal";

export type DashboardModalType = "invoice" | "appointment" | "customer" | null;

interface DashboardModalContextType {
  activeModal: DashboardModalType;
  openModal: (type: "invoice" | "appointment" | "customer") => void;
  closeModal: () => void;
  exportCsv: (customRows?: Array<string[]>, filename?: string) => void;
}

const DashboardModalContext = React.createContext<DashboardModalContextType | undefined>(undefined);

export function DashboardModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = React.useState<DashboardModalType>(null);

  const openModal = React.useCallback((type: "invoice" | "appointment" | "customer") => {
    setActiveModal(type);
  }, []);

  const closeModal = React.useCallback(() => {
    setActiveModal(null);
  }, []);

  const exportCsv = React.useCallback(
    (customRows?: Array<string[]>, filename = "FlowPilot_Operations_Telemetry.csv") => {
      // Generate real CSV rows for multi-tenant telemetry from real database records
      const headers = [
        "Record ID",
        "Client Name",
        "Service / Engagement",
        "Type",
        "Status",
        "Value",
        "Date",
      ];
      const rows = customRows && customRows.length > 0 ? customRows : [];

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join(
          "\n"
        );

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    []
  );

  return (
    <DashboardModalContext.Provider value={{ activeModal, openModal, closeModal, exportCsv }}>
      {children}

      {/* Real Interactive Modals */}
      <InvoiceBuilderModal isOpen={activeModal === "invoice"} onClose={closeModal} />
      <NewAppointmentModal isOpen={activeModal === "appointment"} onClose={closeModal} />
      <NewCustomerModal isOpen={activeModal === "customer"} onClose={closeModal} />
    </DashboardModalContext.Provider>
  );
}

export function useDashboardModals() {
  const context = React.useContext(DashboardModalContext);
  if (!context) {
    throw new Error("useDashboardModals must be used within a DashboardModalProvider");
  }
  return context;
}
