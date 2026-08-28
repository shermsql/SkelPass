import { DashboardProvider } from "./DashboardContext";

import Sidebar from "@/components/Sidebar/Sidebar";
import Topbar from "@/components/Topbar/Topbar";

import styles from "./Dashboard.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className={styles.app}>
        <Sidebar />
        <main className={styles.main}>
          <Topbar />
          {children}
        </main>
      </div>
    </DashboardProvider>
  );
}
