"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * The old address: sign-in lives at /signin now. Redirected in the browser
 * so the query (an invite link's ?invite=…) comes along; the site is
 * static, so the server can't read it.
 */
export default function AuthPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/signin${window.location.search}`);
  }, [router]);
  return null;
}
