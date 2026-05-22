"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();

  useEffect(() => {

    router.push("/dashboard");

  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Loading...
    </div>
  );
}
