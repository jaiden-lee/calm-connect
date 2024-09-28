import { UserContext } from "@/utils/context";
import { createClient } from "@/utils/supabase/component";
import { TextField } from "@mui/material";
import { redirect } from "next/navigation";
import { type FormEvent, useContext, useState } from "react";
import { useNotifications } from '@toolpad/core/useNotifications';

function CreateClinic() {
    const supabase = createClient();
    const user = useContext(UserContext);
    const notifications = useNotifications();

    const [formData, setFormData] = useState({
        clinicName: "",
        clinicWelcomeMessage: ""
    });

    if (user == null) {
        redirect(`/`)
    }

    const createClinicInDB = async (e: FormEvent) => {
        e.stopPropagation();
        const { error } = await supabase
            .from('clinics')
            .insert({ name: formData.clinicName, welcome_message: formData.clinicWelcomeMessage, user_id: user.id })
            
        notifications.show('Error: ' + error, {
            severity: "error",
            autoHideDuration: 3000,
            });
    }

    return (
        <form onSubmit={createClinicInDB}>
            Create your Clinic
            <TextField id="clinicName" label="Clinic Name" name="clinicName" required />
            <TextField id="clinicWelcomeMessage" label="Clinic Welcome Message" name="clinicWelcomeMessage" />
        </form>
    );
}

export default CreateClinic;