import { UserContext } from "@/utils/context";
import { useContext } from "react";
import { createClient } from "@/utils/supabase/component";
import { Button } from "@mui/material";
import Link from "next/link";
import Image from "next/image";

function Navbar() {
  const supabase = createClient();
  const user = useContext(UserContext);

  function handleSignout() {
    supabase.auth.signOut();
  }

  return (
    <nav className="h-16 w-full px-8 flex justify-center items-center border-b-[1px]">
      <div className="w-full max-w-[72rem] flex items-center">
        <Link href={user ? "/therapists" : "/"} className="text-base font-semibold flex items-center">
        <Image src="/logo.svg" alt="Logo" width={45} height={45} className="w-10"/> Calm Connect</Link>

        <div className="flex items-center ml-auto gap-8">
          {
            !user ?
            <>
              <Link href="">About</Link>
              <Link href="">Contact</Link>
              <Link href="/signup">
                <Button size="medium" variant="contained" disableElevation className="button-primary">Sign Up</Button>
              </Link>
              <Link href="/login">
                <Button size="medium" disableElevation className="">Log In</Button>
              </Link>
            </>
            :
            <>
              <Link href="/therapists">Home</Link>
              <Link href="">Settings</Link>
              <Button size="medium" variant="contained" disableElevation className="button-primary" onClick={handleSignout}>Sign Out</Button>
            </>
          }
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
