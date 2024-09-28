import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/component";
import type { User } from "@supabase/supabase-js";
import { UserContext } from "@/utils/context";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import { AppProvider, NotificationsProvider } from "@toolpad/core";
import { inter } from "@/utils/fonts";
import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    info: {
      main: "#D5D5D5"
    }
  },
  colorSchemes: {
    dark: false
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {

        }
      }
    }
  }
});


export default function App({ Component, pageProps }: AppProps) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null | undefined>(null);
  const router = useRouter();
  const [isNewClinic, setIsNewClinic] = useState(false);

  // Solves a bug where because user is always null on first render it would always redirect you
  // (because useEffect always ran on first render)
  const setUserAndCheckForRedirect = (newUserData: User | null | undefined) => {
    setUser(newUserData);
    async function redirectToCreation() {
      if (!newUserData) return
      const { data, error } = await supabase
        .from("clinics")
        .select("id")
        .eq("id", newUserData.id);
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

    if (
      newUserData &&
      (router.pathname === "/signup" || router.pathname === "/login")
    ) {
      router.push("/dashboard");
    }
    // if (
    //   !newUserData &&
    //   (router.pathname === "/dashboard" ||
    //     router.pathname.startsWith("/therapists") ||
    //     router.pathname === "/edit-clinic" ||
    //     router.pathname === "/create-clinic")
    // ) {
    //   router.push("/");
    // }
    if (newUserData && !isNewClinic && router.pathname !== "/create-clinic") {
      // if logged in, but account not set up, so clinic name not assigned yet
      redirectToCreation();
    }
  };

  useEffect(() => {
    async function initialSignin() {
      const { data, error } = await supabase.auth.getSession();
      if (error != null || data.session == null) {
        setUserAndCheckForRedirect(null);
      } else {
        setUserAndCheckForRedirect(data.session.user);
      }
    }

    const authChangeSubscription = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          if (session != null) {
            setUserAndCheckForRedirect(session.user);
          }
        } else if (event === "SIGNED_OUT") {
          setUserAndCheckForRedirect(null);
        } else if (event === "INITIAL_SESSION") {
          initialSignin();
        }
      },
    );
    return () => authChangeSubscription.data.subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <AppProvider theme={lightTheme}>
      <NotificationsProvider>
          <UserContext.Provider value={user}>
            <div className={`${inter.className} min-h-full`}>
              <Navbar />
              <Component {...pageProps} />
            </div>
          </UserContext.Provider>
      </NotificationsProvider>
    </AppProvider>
  );
}
