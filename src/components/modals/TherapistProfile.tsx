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

const TherapistProfile = (props: {name: string, bio: string, specialization: string, ethnicity: string, gender: string, age:string, ageRange: string}) => {
  const supabase = createClient();
  const user = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <button className="mt-2 text-primary-blue hover:underline" onClick={() => setOpen(true)}>View Profile</button>
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>Therapist Information</DialogTitle>
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
            disabled
            value={props.name}
          />
          <Grid container spacing={2}>
            <Grid size="grow">
              <Autocomplete
                value={props.ethnicity}
                disablePortal
                freeSolo
                disabled
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
                    disabled
                    value={props.ethnicity}
                  />
                )}
              />
            </Grid>
            <Grid size="grow">
              <Autocomplete
                disablePortal
                freeSolo
                options={["Man", "Woman", "Non-Binary"]}
                value={props.gender}
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
                    disabled
                    value={props.gender}
                  />
                )}
              />
            </Grid>
          </Grid>
          <TextField
            required
            disabled
            margin="dense"
            id="age"
            name="age"
            label="Age"
            type="number"
            fullWidth
            value={props.age}
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
            disabled
            minRows={2}
            value={props.specialization}
          />
          <TextField
            margin="dense"
            id="ageRange"
            disabled
            name="ageRange"
            label="Preferred Age Range"
            type="text"
            fullWidth
            value={props.ageRange}
          />
          <TextField
            margin="dense"
            id="bio"
            disabled
            name="bio"
            label="Bio"
            type="text"
            fullWidth
            multiline
            value={props.bio}
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>EXIT</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TherapistProfile;
