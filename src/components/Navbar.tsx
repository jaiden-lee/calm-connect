import { UserContext } from "@/utils/context";
import { useContext } from "react";
import { createClient } from "@/utils/supabase/component";
import { Button } from "@mui/material";
import Link from "next/link";

function Navbar() {
    const supabase = createClient();
    const user = useContext(UserContext);

    function handleSignout() {
        supabase.auth.signOut();
    }

    return (
        <nav>
            {user ? <>
                <p>Logged in as: {user.email}</p>
                <Button onClick={handleSignout}>Sign out</Button>
                </> 
            : <>
                <Link href="/signup">Sign Up</Link>
                <Link href="/login">Log In</Link>
            </>}
        </nav>
    );
}

export default Navbar;