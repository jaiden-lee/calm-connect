import { UserContext } from "@/utils/context";
import { createClient } from "@/utils/supabase/component";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  TextField,
} from "@mui/material";
import { useNotifications } from "@toolpad/core";
import { useContext, useState } from "react";

const AddTherapist = () => {
  const supabase = createClient();
  const user = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const notifications = useNotifications();
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Add Therapist to Clinic
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!user) {
              notifications.show("Not Logged In with a Clinic", {
                severity: "warning",
              });
              handleClose();
              return;
            }
            const formData = new FormData(event.currentTarget);
            const { data, error } = await supabase
              .from("therapists")
              .insert({
                clinic_id: user.id,
                name: formData.get("name"),
                ethnicity: formData.get("ethnicity"),
                gender: formData.get("gender"),
                specialization: formData.get("specialization"),
                ageRange: formData.get("ageRange"),
                bio: formData.get("bio"),
              } as any)
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
              handleClose();
            }
          },
        }}
      >
        <DialogTitle>Add a therapist to clinic</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label="Name"
            type="text"
            fullWidth
          />
          <p className="italic">
            Inputs with Autocomplete can be set to custom values
          </p>
          <Grid container spacing={2}>
            <Grid size="grow">
              <Autocomplete
                disablePortal
                freeSolo
                options={[
                  "Indigenous American",
                  "White",
                  "Middle Eastern",
                  "African American",
                  "Native Hawai'ian or Pacific Islander",
                  "Asian",
                ]}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    margin="dense"
                    id="ethnicity"
                    name="ethnicity"
                    label="Ethnicity"
                    type="text"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size="grow">
              <Autocomplete
                disablePortal
                freeSolo
                options={["Man", "Woman", "Non-Binary"]}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    margin="dense"
                    id="gender"
                    name="gender"
                    label="Gender"
                    type="text"
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>
          <TextField
            required
            margin="dense"
            id="age"
            name="age"
            label="Age"
            type="number"
            fullWidth
          />
          <TextField
            required
            margin="dense"
            id="specialization"
            name="specialization"
            label="Specialization"
            type="text"
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            margin="dense"
            id="ageRange"
            name="ageRange"
            label="Preferred Age Range"
            type="text"
            fullWidth
          />
          <TextField
            margin="dense"
            id="bio"
            name="bio"
            label="Bio"
            type="text"
            fullWidth
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Create</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTherapist;
