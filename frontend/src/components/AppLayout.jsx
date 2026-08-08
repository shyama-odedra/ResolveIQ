import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import AuroraBackground from "./AuroraBackground";

export default function AppLayout() {
  const [search, setSearch] = useState("");

  return (
    <div className="relative min-h-screen flex">
      <AuroraBackground />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Navbar onSearch={setSearch} />
        <main className="flex-1 p-4 md:p-8">
          <Outlet context={{ search }} />
        </main>
      </div>
    </div>
  );
}
