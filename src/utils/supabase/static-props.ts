import { createClient as createClientPrimitive } from "@supabase/supabase-js";
import { Database } from '../../database.types'

export function createClient<Database>() {
  const supabase = createClientPrimitive(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return supabase;
}
