import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const allowedOperations = {
  bootstrap: "bootstrap_canonical_wheel_visitor",
  state: "get_canonical_wheel_state",
  spin: "complete_canonical_wheel_spin",
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const operation = body?.operation as keyof typeof allowedOperations;
    const rpcName = allowedOperations[operation];

    if (!rpcName || !body?.params || typeof body.params !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid wheel request." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ ok: false, error: "Wheel service is not configured." }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.rpc(rpcName, body.params);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: false, error: "The wheel service could not be reached." }, { status: 500 });
  }
}
