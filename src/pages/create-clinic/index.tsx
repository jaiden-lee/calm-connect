import { UserContext } from "@/utils/context";
import { createClient } from "@/utils/supabase/component";
import { Button, TextField, Typography } from "@mui/material";
import { type FormEvent, useContext, useState } from "react";
import { useNotifications } from "@toolpad/core/useNotifications";
import Image from "next/image";
import { useRouter } from "next/router";

function CreateClinic() {
  const supabase = createClient();
  const user = useContext(UserContext);
  const notifications = useNotifications();
  const router = useRouter();

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
          <form className="w-full max-w-96 flex flex-col justify-center gap-4" onSubmit={createClinicInDB}>
            <h1 className="text-lg font-medium">Add your Clinic Details</h1>
            <TextField 
              value={formData.clinicName}
              onChange={(e) =>
                      setFormData((prev) => {
                        return { ...prev, clinicName: e.target.value };
                      })
                    }
              type="text"
              label="Clinic Name"
              size="medium"
              required
              />
            <TextField 
              value={formData.clinicWelcomeMessage}
              onChange={(e) =>
                      setFormData((prev) => {
                        return { ...prev, clinicWelcomeMessage: e.target.value };
                      })
                    }
              type="text"
              label="Clinic Welcome Message"
              size="medium"
              required
              />
              <Typography className="">People who want to book with your clinic will first text your routing code to our master line</Typography>
                 <Typography className="italic text-sm text-text-gray">Bring your own phone number coming soon</Typography>
              <TextField 
              value={formData.clinicRoutingCode}
              onChange={(e) =>
                      setFormData((prev) => {
                        return { ...prev, clinicRoutingCode: e.target.value };
                      })
                    }
              type="text"
              label="Clinic Routing Code"
              size="medium"
              required
              />
              <Button variant="contained" className="bg-primary-blue" disableElevation type="submit">Finish</Button>
          </form>
        </div>
      </div>
    </div>
    // <form onSubmit={createClinicInDB}>
    //   Create your Clinic <br />
    //   <TextField
    //     onChange={(e) =>
    //       setFormData((prev) => {
    //         return { ...prev, clinicName: e.target.value };
    //       })
    //     }
    //     value={formData.clinicName}
    //     id="clinicName"
    //     label="Clinic Name"
    //     name="clinicName"
    //     margin="normal"
    //     required
    //   />{" "}
    //   <br />
    //   <TextField
    //     onChange={(e) =>
    //       setFormData((prev) => {
    //         return { ...prev, clinicWelcomeMessage: e.target.value };
    //       })
    //     }
    //     value={formData.clinicWelcomeMessage}
    //     id="clinicWelcomeMessage"
    //     label="Clinic Welcome Message"
    //     name="clinicWelcomeMessage"
    //     multiline
    //     margin="normal"
    //     minRows={2}
    //   />{" "}
    //   <br />
    //   <Typography className="my-2">People who want to book with your clinic will first text your routing code to our master line</Typography>
    //   <Typography className="my-2 italic">Bring your own phone number coming soon</Typography>
    //   <TextField
    //     onChange={(e) =>
    //       setFormData((prev) => {
    //         return { ...prev, clinicRoutingCode: e.target.value };
    //       })
    //     }
    //     value={formData.clinicRoutingCode}
    //     id="clinicRoutingCode"
    //     label="Clinic Routing Code"
    //     name="clinicRoutingCode"
    //     margin="normal"
    //     required
    //   />{" "}
    //   <br />
    //   <Button type="submit">Submit</Button>
    // </form>
  );
}

export default CreateClinic;
