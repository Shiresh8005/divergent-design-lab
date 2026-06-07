"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, shouldAutoConfirmEmail } from "@/lib/auth/config";

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}

/** Confirm user email via admin API — no manual dashboard step */
export async function autoConfirmUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!shouldAutoConfirmEmail()) {
    return { success: false, error: "Auto-confirm not configured" };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Auto-confirm failed",
    };
  }
}

/** Confirm by email — used when user tries to sign in before confirmation */
export async function autoConfirmUserByEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (!shouldAutoConfirmEmail()) {
    return { success: false, error: "Auto-confirm not configured" };
  }

  try {
    const admin = createAdminClient();
    let page = 1;

    while (page <= 10) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage: 100,
      });
      if (error) return { success: false, error: error.message };

      const user = data.users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );
      if (user) {
        return autoConfirmUser(user.id);
      }

      if (data.users.length < 100) break;
      page++;
    }

    return { success: false, error: "User not found" };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Auto-confirm failed",
    };
  }
}
