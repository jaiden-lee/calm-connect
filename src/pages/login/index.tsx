import { useRouter } from "next/router";
import { useState } from "react";

import { createClient } from "@/utils/supabase/component";
import { Button, Container, Divider, Grid2 as Grid, Paper, TextField } from "@mui/material";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function logIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error(error);
    }
    router.push("/");
  }
  function signInWithGoogle() {
    supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }
  return (
    <Container
      className="mt-32 flex flex-col justify-center items-center"
    >
      <Paper className="p-16" elevation={2}>
        <TextField
          className="block"
          margin="normal"
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          className="block"
          margin="normal"
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="button" onClick={logIn} className="button-primary">
          Log in
        </Button>
        <Divider className="my-4" />
        <div>
          <Button onClick={signInWithGoogle} className="button-secondary">Log in with google</Button>
        </div>
      </Paper>
    </Container>
  );
}
