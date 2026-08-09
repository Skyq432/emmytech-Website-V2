"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { registerVisitor, trackWebsiteEvent } from "@/lib/tracking";

const SESSION_VISIT_KEY = "emmy_site_visit_started";

async function waitForSmsHandoffToFinish() {
  if (typeof window === "undefined") return;

  const hasHandoff = () =>
    new URLSearchParams(window.location.search).has("sms_handoff");

  if (!hasHandoff()) return;

  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise<void>((resolve) =>
      window.setTimeout(resolve, 100),
    );

    if (!hasHandoff()) return;
  }
}

export default function SiteTracker() {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const prepareTracking = async () => {
      const params = new URLSearchParams(window.location.search);

      const referralCode =
        params.get("ref") ||
        params.get("code") ||
        params.get("ambassador") ||
        window.localStorage.getItem("emmy_referral_code");

      if (referralCode) {
        window.localStorage.setItem(
          "emmy_referral_code",
          referralCode,
        );
      }

      const visitorId = await registerVisitor(referralCode);

      if (!visitorId || cancelled) return;

      await waitForSmsHandoffToFinish();

      if (cancelled) return;

      const visitStarted =
        window.sessionStorage.getItem(SESSION_VISIT_KEY);

      if (!visitStarted) {
        window.sessionStorage.setItem(
          SESSION_VISIT_KEY,
          "1",
        );

        void trackWebsiteEvent("website_visited", {
          metadata: {
            landing_page: pathname,
            referral_code_present: Boolean(referralCode),
          },
        });
      }

      const previousPage = previousPathRef.current;

      void trackWebsiteEvent("page_viewed", {
        metadata: {
          page: pathname,
          previous_page: previousPage,
          navigation_type: previousPage ? "internal" : "landing",
        },
      });

      previousPathRef.current = pathname;
    };

    void prepareTracking();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
