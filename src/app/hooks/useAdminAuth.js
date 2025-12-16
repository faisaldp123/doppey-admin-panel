"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAdminAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || token !== "admin-secret-token") {
      router.push("/admin-login");
    }
  }, []);
}
