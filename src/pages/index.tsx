import { Button } from "@mui/material";
import Link from "next/link";

function Home() {
  return <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 bg-landing-page-bg">
    <div className="max-w-[64rem] w-full flex flex-col items-center justify-center gap-16 text-center">
      <h1 className="text-5xl font-bold">Simplify your appointment scheduling in a few clicks.</h1>
      <Link href="/signup">
        <Button size="medium" disableElevation variant="contained" className="button-primary">Create Account!</Button>
      </Link>
    </div>
    
  </div>;
}

export default Home;
