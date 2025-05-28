import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ImportContacts } from "@/features/import/components/ImportContacts";

export default function ImportPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-800">
          <ImportContacts />
        </main>
      </div>
    </div>
  );
}
