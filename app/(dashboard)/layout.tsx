"use client";
import axios from "axios";
import { DashboardSidebar } from "@/components/commons/navigations/dashboard/sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const validateSession = async () => {
      try {
        const session = await axios.get("/api/session");

        if (
          session.data.data.role !== "MODERATOR" &&
          session.data.data.role !== "SUPERUSER"
        ) {
          setVerified(false);
          router.push("/home");
        }
        setVerified(true);
      } catch (error) {
        setVerified(false);
        router.push("/home");
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (verified) {
    return (
      <DashboardSidebar>
        <div className="flex flex-1">
          <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl p-2 md:p-10">
            {children}
          </div>
        </div>
      </DashboardSidebar>
    );
  }
}
