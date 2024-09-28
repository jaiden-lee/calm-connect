import { createClient } from "@/utils/supabase/component";
import { createClient as createServerClient } from "@/utils/supabase/server-props";
import { GetServerSidePropsContext } from "next";
import { ChangeEvent, FormEvent, useState } from "react";

function Signup() {
    const supabase = createClient();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });


    function signUpWithGoogle() {
        supabase.auth.signInWithOAuth({
            provider: "google"
        })
    }

    async function handleSubmit(e: FormEvent) {
        e.stopPropagation();
        const {data, error} = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password
        });
    }

    function onEmailChange(e: ChangeEvent<HTMLInputElement>) {
        setFormData((old) => {
            return {
                ...old,
                email: e.target.value
            }
        });
    }

    function onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
        setFormData((old) => {
            return {
                ...old,
                password: e.target.value
            }
        });
    }

    return (
        <div>
            <h1>Create a clinic</h1>
            {/* Sign up with google */}
            <div>
                <button onClick={signUpWithGoogle}>Sign up with google</button>
            </div>
            <form onSubmit={handleSubmit}>
                
                <div>
                    <label htmlFor="email-input"></label>
                    <input type="email" 
                        name="email" 
                        id="email-input"
                        value={formData.email}
                        onChange={onEmailChange} />
                </div>

                <div>
                    <label htmlFor="password-input"></label>
                    <input type="password" 
                        name="password" 
                        id="password-input"
                        value={formData.password}
                        onChange={onPasswordChange} />
                </div>

                <button type="submit">Sign up!</button>
            </form>
        </div>
    );
}

export default Signup;