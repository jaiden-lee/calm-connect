import { Tables } from "@/database.types";
import { UserContext } from "@/utils/context";
import { createClient } from "@/utils/supabase/component";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useNotifications } from "@toolpad/core";
import { Dayjs } from "dayjs";
import { useContext, useState } from "react";

type props = {
  therapistData: Tables<"therapists">;
  triggerCalRefresh: () => void;
};

const AddDaysOff = ({ triggerCalRefresh, therapistData }: props) => {
  const supabase = createClient();
  const user = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const notifications = useNotifications();
  const handleClose = () => {
    setOpen(false);
  };
  const [dateInput, setDateInput] = useState<Dayjs | null>(null);
  const [reason, setReason] = useState("");

  return (
    <>
      <Button
        size="large"
        className="button-primary px-4"
        variant="outlined"
        onClick={() => setOpen(true)}
      >
        Add Days Off
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
            if (!dateInput) {
              notifications.show("Set The Date", {
                severity: "warning",
              });
              return;
            }
            therapistData.days_off.push({
              dayOff: dateInput.toISOString(),
              reason: reason,
            } as any);
            const { data, error } = await supabase
              .from("therapists")
              .update({
                days_off: therapistData.days_off,
              })
              .eq("id", therapistData.id)
              .select("days_off");

            if (error != null) {
              notifications.show("Error: " + error.message, {
                severity: "error",
                autoHideDuration: 3000,
              });
            } else {
              notifications.show("Successfully created " + JSON.stringify(data[0]), {
                autoHideDuration: 3000,
              });
              triggerCalRefresh();
              handleClose();
            }
          },
        }}
      >
        <DialogTitle>Add a day off to override your availabilities on a specific day</DialogTitle>
        <DialogContent>
          <DatePicker className="my-2" value={dateInput} onChange={(newValue) => setDateInput(newValue)} label="Basic date picker" />
          <TextField
            required
            margin="normal"
            id="reason"
            name="reason"
            label="Reason"
            type="text"
            fullWidth
            value={reason} onChange={(e) => setReason(e.target.value)}
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

export default AddDaysOff;
