import { Tables } from "@/database.types";
import { UserContext } from "@/utils/context";
import { createClient } from "@/utils/supabase/component";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { useNotifications } from "@toolpad/core";
import dayjs, { Dayjs } from "dayjs";
import { useContext, useState } from "react";

type props = {
  therapistData: Tables<"therapists">;
  triggerCalRefresh: () => void;
};
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const AddAvailabilities = ({ triggerCalRefresh, therapistData }: props) => {
  const supabase = createClient();
  const user = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const notifications = useNotifications();
  const handleClose = () => {
    setOpen(false);
  };
  const [dayOfWeekInput, setDayOfWeekInput] = useState(1);
  const handleDayOfWeekInput = (_: any, newDOWI: number) => {
    if (newDOWI !== null) {
      setDayOfWeekInput(newDOWI);
    }
  };
  const [times, setTimes] = useState<{
    startTime: Dayjs | null;
    endTime: Dayjs | null;
  }>({
    startTime: dayjs().hour(9).minute(0),
    endTime: dayjs().hour(18).minute(0),
  });

  return (
    <>
      <Button
        size="large"
        className="button-primary px-4"
        variant="outlined"
        onClick={() => setOpen(true)}
      >
        Add Recurring Availabilities
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
            if (!(times.startTime && times.endTime)) {
              notifications.show("Set Both Times", {
                severity: "warning",
              });
              return;
            }
            therapistData.availabilities.push({
              startTime: times.startTime.day(dayOfWeekInput),
              endTime: times.endTime.day(dayOfWeekInput),
              dayOfTheWeek: daysOfWeek[dayOfWeekInput],
            } as any);
            const { data, error } = await supabase
              .from("therapists")
              .update({
                availabilities: therapistData.availabilities,
              })
              .eq("id", therapistData.id)
              .select("availabilities");

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
        <DialogTitle>Add a therapist to clinic</DialogTitle>
        <DialogContent>
          <TimePicker value={times.startTime} onChange={(newValue) => setTimes((prev) => {return {...prev, startTime:newValue}})} name="startTime" className="block my-2" label="Start Time" />
          <TimePicker value={times.endTime} onChange={(newValue) => setTimes((prev) => {return {...prev, endTime:newValue}})} name="endTime" className="block my-2" label="End Time" />
          <ToggleButtonGroup
            color="primary"
            exclusive
            aria-label="Platform"
            value={dayOfWeekInput}
            onChange={handleDayOfWeekInput}
          >
            {daysOfWeek.map((value, i) => {
              return (
                <ToggleButton key={i} value={i}>
                  {value.substring(0, 3)}
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Create</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddAvailabilities;
