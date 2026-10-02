import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getWholesaleSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    "wholesale_session"
  )?.value;

  if (!token) {
    return null;
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc(
    "get_wholesale_session",
    {
      p_token_hash: tokenHash,
    }
  );

  if (error || !data?.[0]) {
    return null;
  }

  return data[0];
}