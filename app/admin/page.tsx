"use client";

import dynamic from "next/dynamic";

const AdminPage = dynamic(() => import("@/component/admin"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>
});

export default function Admin() {
  return <AdminPage />;
}
