import { UserContext } from "@/utils/context";
import { createClient } from "@/utils/supabase/component";
import { Button, TextField, Typography } from "@mui/material";
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
    clinicRoutingCode: "",
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
        routing_code: formData.clinicRoutingCode,
        id: user.id,
      })
      .select();
    if (error != null) {
      notifications.show("Error: " + error.message, {
        severity: "error",
        autoHideDuration: 3000,
      });
    } else {
      notifications.show("Successfully created " + data[0].name, {
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
      <Typography className="my-2">People who want to book with your clinic will first text your routing code to our master line</Typography>
      <Typography className="my-2 italic">Bring your own phone number coming soon</Typography>
      <TextField
        onChange={(e) =>
          setFormData((prev) => {
            return { ...prev, clinicRoutingCode: e.target.value };
          })
        }
        value={formData.clinicRoutingCode}
        id="clinicRoutingCode"
        label="Clinic Routing Code"
        name="clinicRoutingCode"
        margin="normal"
        required
      />{" "}
      <br />
      <Button type="submit">Submit</Button>
    </form>
  );
}

export default CreateClinic;
