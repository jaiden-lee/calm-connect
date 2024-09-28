import { UserContext } from "@/utils/context";
import { createClient } from "@/utils/supabase/component";
import { Button, TextField } from "@mui/material";
import { redirect } from "next/navigation";
import { type FormEvent, useContext, useState } from "react";
import { useNotifications } from "@toolpad/core/useNotifications";
import router from "next/router";

function CreateClinic() {
  const supabase = createClient();
  const user = useContext(UserContext);
  const notifications = useNotifications();

  const [formData, setFormData] = useState({
    clinicName: "",
    clinicWelcomeMessage: "",
  });

  if (user == null) {
    return "need to figure out how to redirect";
  }

  const createClinicInDB = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { data, error } = await supabase
      .from("clinics")
      .insert({
        name: formData.clinicName,
        welcome_message: formData.clinicWelcomeMessage,
        id: user.id,
      })
      .select();
    if (error != null) {
      notifications.show("Error: " + error.message, {
        severity: "error",
        autoHideDuration: 3000,
      });
    } else {
      notifications.show("Successfully created" + data[0].name, {
        autoHideDuration: 3000,
      });
      router.push("/therapists");
    }
  };

  return (
    <form onSubmit={createClinicInDB}>
      Create your Clinic <br />
      <TextField
        onChange={(e) =>
          setFormData((prev) => {
            return { ...prev, clinicName: e.target.value };
          })
        }
        value={formData.clinicName}
        id="clinicName"
        label="Clinic Name"
        name="clinicName"
        margin="normal"
        required
      />{" "}
      <br />
      <TextField
        onChange={(e) =>
          setFormData((prev) => {
            return { ...prev, clinicWelcomeMessage: e.target.value };
          })
        }
        value={formData.clinicWelcomeMessage}
        id="clinicWelcomeMessage"
        label="Clinic Welcome Message"
        name="clinicWelcomeMessage"
        multiline
        margin="normal"
        minRows={2}
      />{" "}
      <br />
      <Button type="submit">Submit</Button>
    </form>
  );
}

export default CreateClinic;
