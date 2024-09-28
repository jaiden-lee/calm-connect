import { createClient } from "@/utils/supabase/component";
import { useNotifications } from "@toolpad/core";
import { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";
import { TextField, Button } from "@mui/material";
import Link from "next/link";

function Signup() {
  const supabase = createClient();
  const notifications = useNotifications();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [validData, setValidData] = useState({
    email: true,
    password: true
  })

  function signUpWithGoogle() {
    supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (validData.email && validData.password) {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (error != null) {
        notifications.show("Error: " + error.message, {
          severity: "error",
          autoHideDuration: 3000,
        });
      } else {
        notifications.show("Success! An email has been sent to " + data.user?.email, {
          autoHideDuration: 3000,
        });
      }
    }
  }

  function onEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setFormData((old) => {
      return {
        ...old,
        email: e.target.value,
      };
    });
    setValidData((old) => {
      return {
        ...old,
        email: e.target.validity.valid
      }
    })
  }

  function onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setFormData((old) => {
      return {
        ...old,
        password: e.target.value,
      };
    });
    setValidData((old) => {
      return {
        ...old,
        password: e.target.value.length > 6 ? true : false
      }
    })
  }

  return (
    <div className="flex flex-row gap-8 p-8 min-h-[calc(100vh-6rem)] items-stretch">
      <div className="w-[50%] flex flex-col justify-center items-center"> 
        <h1 className="text-2xl font-bold flex items-center"><Image src="/logo.svg" alt="Logo" width={45} height={45} className="w-16"/> Calm Connect</h1>
        <div className="w-full max-w-[32rem] text-text-dark-gray">
            <h2 className="text-2xl font-semibold mt-12">We reduce lost business so you can save more lives.</h2>
            <div className="flex flex-col gap-6 mt-6 font-medium">
              <div className="flex items-center gap-3"><Image src="/checkmark.svg" alt="bullet point" width={23} height={24} className="w-4" /> Never miss a patient call again with our automated AI-receptionist</div>
              <div className="flex items-center gap-3"><Image src="/checkmark.svg" alt="bullet point" width={23} height={24} className="w-4" /> View a summary of the patient conversation</div>
              <div className="flex items-center gap-3"><Image src="/checkmark.svg" alt="bullet point" width={23} height={24} className="w-4" /> One clinic account for all your therapists</div>
            </div>
        </div>
        
      </div>
      <div className="w-[50%] flex justify-center items-center">
        <div className="bg-white rounded-md w-full max-w-[32rem] min-h-[32rem] flex flex-col items-center justify-center gap-4 p-8">
          <form className="w-full max-w-96 flex flex-col justify-center gap-4" onSubmit={handleSubmit}>
            <h1 className="text-lg font-medium">Create an Account</h1>
            <Button variant="outlined" className="w-full" onClick={signUpWithGoogle}>Sign up with Google</Button>
            <hr />
            <TextField 
              value={formData.email}
              onChange={onEmailChange}
              type="email"
              label="Email"
              size="medium"
              error={!validData.email}
              helperText="Enter a valid email address"
              required
              />
            <TextField 
              value={formData.password}
              onChange={onPasswordChange}
              type="password"
              label="Password"
              size="medium"
              error={!validData.password}
              helperText="Password must be at least 6 characters long"
              required
              />
              <Button variant="contained" className="bg-primary-blue" disableElevation type="submit">SIGN UP</Button>
              <div>
                <Link href="/login" className="text-primary-blue text-sm underline">Log In</Link>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
