import { UserContext } from "@/utils/context";
import { useContext } from "react";
import { createClient } from "@/utils/supabase/component";

function Navbar() {
    const supabase = createClient();
    const user = useContext(UserContext);

    function handleSignout() {
        supabase.auth.signOut();
    }

    return (
        <nav>
            <p>Logged in as: {user?.email}</p>
            
            <button onClick={handleSignout}>Sign out</button>
        </nav>
    );
}

export default Navbar;