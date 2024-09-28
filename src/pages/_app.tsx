import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/component";
import type { User } from "@supabase/supabase-js";
import { UserContext } from "@/utils/context";
import { useContext } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import { AppProvider } from "@toolpad/core";

export default function App({ Component, pageProps }: AppProps) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null | undefined>(null);
  const router = useRouter();
  const [isNewClinic, setIsNewClinic] = useState(false);
  
  useEffect(() => {
    async function initialSignin() {
      const {data, error} = await supabase.auth.getSession();
      if (error != null || data.session == null) {
        setUser(null);
      } else {
        setUser(data.session.user);
      }
    }

    const authChangeSubscription = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        if (session!=null) {
          setUser(session.user);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "INITIAL_SESSION") {
        initialSignin();
      }
    }); 
    return () => authChangeSubscription.data.subscription.unsubscribe();
  }, [supabase.auth]);
  
  useEffect(() => {
    async function redirectToCreation() {
      const {data, error} = await supabase.from("clinics").select("id").eq("id", user?.id);
      // console.log(error);
      if (!error) {
        console.log(data.length);
        if (data.length == 0) {
          // Account details not created yet
          router.push("/create-clinic");
        } else {
          setIsNewClinic(true);
        }
      }
    }

    if (user && (router.pathname === "/signup" || router.pathname === "/login")) {
      router.push("/dashboard");
    }
    if (!user && (router.pathname === "/dashboard" || router.pathname.startsWith("/therapists") || router.pathname === "/edit-clinic" || router.pathname === "/create-clinic")) {
      router.push("/");
    }


    if (user && !isNewClinic && router.pathname !== "/create-clinic") {
      // if logged in, but account not set up, so clinic name not assigned yet
      redirectToCreation();
    }
  }, [user, router, isNewClinic]); // redirects

  return (
    <AppProvider>
      <UserContext.Provider value={user}>
        <Navbar />
        {/* Navbar probably goes here or something */}
      
        <Component {...pageProps} />
      </UserContext.Provider>
    </AppProvider>
  );
}
