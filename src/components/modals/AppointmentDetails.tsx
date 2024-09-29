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


const AppointmentDetails = (props: {name: string, description: string, appointment_start_date: string, appointment_length_minutes: number, phone_number: string, acceptAppointment: any, denyAppointment: any, is_pending: boolean}) => {
  const supabase = createClient();
  const user = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <button className="text-primary-blue text-sm hover:underline text-left"onClick={() => setOpen(true)}>
        View Details
    </button>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
      >
        <div className="p-4">
            <div className="flex items-center">
                <Button onClick={handleClose}>EXIT</Button>
            </div>
            <DialogContent>
                <h3 className="text-xl font-semibold">{props.name}</h3>
                <p className="text-sm mt-2"><span className="font-semibold text-sm mt-2">Phone Number:</span> {props.phone_number}</p>
                <p className="text-sm mt-2"><span className="font-semibold text-sm mt-2">Appointment Date:</span> {props.appointment_start_date}</p>
                <p className="text-sm mt-2"><span className="font-semibold text-sm mt-2">Appointment Length:</span> {props.appointment_length_minutes}</p>
                <div className="mt-4">
                    <h3 className="font-semibold text-sm">Description</h3>
                    <p className="text-sm text-text-gray">{props.description}</p>
                </div>
            </DialogContent>
            {
                props.is_pending &&
                <div className="flex justify-center items-center gap-3">
                    <Button className="button-primary rounded-md" onClick={() => {handleClose(); props.acceptAppointment()}}>ACCEPT</Button>
                    <Button className="button-primary bg-text-gray rounded-md" onClick={() => {handleClose(); props.denyAppointment()}}>DENY</Button>
                </div>
            }
            
        </div>
        
      </Dialog>
    </>
  );
};

export default AppointmentDetails;
