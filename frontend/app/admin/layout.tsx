import AdminSidebar from "@/components/layout/AdminSidebar";
import AuthGuard from "@/components/auth/AuthGuard";
import UserProfileMenu from "@/components/auth/UserProfileMenu";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard roles={["ADMIN"]}>
      <div className="min-h-screen bg-[#0b1120] text-slate-200 lg:flex">
        <AdminSidebar />
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0b1120]/95 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-end px-4 sm:px-6 lg:px-10">
              <UserProfileMenu />
            </div>
          </header>
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
            {children}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
