import AppHeader from "@/components/app/header";
import { AppSidebar } from "@/components/app/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getUser } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/auth/login");
  }
  return (
    <div>
      <SidebarProvider>
        <AppSidebar user={{ ...user }} />
        <SidebarInset>
          <AppHeader />
          <main>{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
