import Link from "next/link";
import { Button } from "@mui/material";
import { createClient } from "@/utils/supabase/component";
import { useNotifications } from "@toolpad/core";
import { useState } from "react";
import AppointmentDetails from "./modals/AppointmentDetails";
import dayjs, { Dayjs } from "dayjs";

type PatientCardProps = {
    id: string,
    date: Date,
    patientName: string,
    description: string,
    is_pending: boolean,
    appointment_start_date: Date,
    appointment_length_minutes: number,
    phone_number: string,
    setAcceptedEvents: any,
    setPendingEvents: any
}

function getEventLink(title: string, start: Dayjs, length: number ) {
    let formatedStart = start.toISOString().replace(/-|:|\.\d\d\d/g,"");
    let formatedEnd = start.add(length, "minutes").toISOString().replace(/-|:|\.\d\d\d/g,"");
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatedStart}/${formatedEnd}&sf=true&output=xml`
}

function formatDate(date: Date): string {
    const date1 = new Date(date);
    const day = date1.getDate().toString().padStart(2, '0');
    const month = date1.toLocaleString('default', { month: 'short' });
    const year = date1.getFullYear();
    const hours = date1.getHours().toString().padStart(2, '0');
    const minutes = date1.getMinutes().toString().padStart(2, '0');
    const ampm = date1.getHours() < 12 ? 'AM' : 'PM';
  
    return `${day} ${month} ${year} • ${hours}:${minutes} ${ampm}`;
  }


function PatientCard(props: PatientCardProps) {
    const currentDate = formatDate(props.appointment_start_date);
    const notifications = useNotifications();
    const supabase = createClient();
    const [isPending, setIsPending] = useState(props.is_pending);
    const [isDeleted, setIsDeleted] = useState(false);

    async function acceptAppointment() {
        const {data, error} = await supabase.from("appointments").update({
            is_pending: false
        }).eq("id", props.id).select();
        if (error) {
            notifications.show("Error: " + error.message, {
                severity: "error",
                autoHideDuration: 3000,
              });
            return;
        }
        notifications.show("Success!", {
            autoHideDuration: 3000,
        });
        setIsPending(false);
        props.setAcceptedEvents((old: {id: number, title: string, start: Date, end: Date}[]) => {
            return [
                ...old,
                {
                    id: props.id,
                    title: props.patientName,
                    start: props.appointment_start_date,
                    end: new Date(props.appointment_start_date).setMinutes(new Date(props.appointment_start_date).getMinutes() + props.appointment_length_minutes)
                }
            ]
        });
        props.setPendingEvents((old: {id: number, title: string, start: Date, end: Date}[]) => {
            return old.filter((apt) => {
                console.log(apt.id.toString());
                console.log(props.id);
                return apt.id.toString() != props.id

            })
        });
        console.log("sending message")
        const {data: userData, error: userError} = await supabase.from("patient").select().eq("id", data[0]?.patient??2);
        let eventLink = getEventLink("Therapy appointment", dayjs(data[0].appointment_start_time), data[0].appointment_length_minutes??60)
        if (userError) {
            notifications.show("Error: " + userError.message, {
                severity: "error",
                autoHideDuration: 3000,
              });
            return;
        }
        fetch(`/api/hello?phone_number=${userData[0].phone_number}&message=${encodeURI('you\'re therapy appointment has been approved, add it to your calendar: '+eventLink)}`).then(x => x.json()).then(x => console.log(x));
    }

    async function denyAppointment() {
        const {error} = await supabase.from("appointments").delete().eq("id", props.id);
        if (error) {
            notifications.show("Error: " + error.message, {
                severity: "error",
                autoHideDuration: 3000,
              });
            return;
        }
        notifications.show("Success!", {
            autoHideDuration: 3000,
        });
        props.setPendingEvents((old: {id: number, title: string, start: Date, end: Date}[]) => {
            return old.filter((apt) => {
                console.log(apt.id.toString());
                console.log(props.id);
                return apt.id.toString() != props.id
            })
        });
        setIsDeleted(true);
    }
    
    return (
        <>
        {
            !isDeleted &&
            <div className="bg-white rounded-md shadow-sm p-4 flex flex-col gap-4">
                <p className="text-text-light-gray text-sm">{currentDate}</p>
                <h3 className="font-medium">{props.patientName}</h3>
                <p className="text-sm text-text-gray">{props.description}</p>
                
                <AppointmentDetails name={props.patientName} description={props.description} appointment_start_date={currentDate} appointment_length_minutes={props.appointment_length_minutes} phone_number={props.phone_number} acceptAppointment={acceptAppointment} denyAppointment={denyAppointment} is_pending={isPending} />
                {
                    isPending ? 
                    <div className="flex gap-4">
                        <Button className="button-primary rounded-md" onClick={acceptAppointment}>ACCEPT</Button>
                        <Button className="button-primary bg-text-gray rounded-md" onClick={denyAppointment}>DENY</Button>
                    </div> :
                    <p>Booked!</p>
                }
            </div>
        }
        </>
        
    );
}

export default PatientCard;