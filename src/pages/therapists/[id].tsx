import { Button, TextField, ButtonGroup } from "@mui/material";
import { useState } from "react";
import PatientCard from "@/components/PatientCard";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { GetServerSidePropsContext } from "next";
import { createClient } from "@/utils/supabase/server-props";
import { stringOrFirstString } from "@/utils/helper";

type FilterType = "All" | "Pending" | "Accepted";
type Patient = {
    id: string,
    phone_number: string,
    name: string,
    is_new: boolean,
    description: string
}
type Appointment = {
    id: string,
    created_at: Date,
    patient_id: string,
    name: string,
    description: string,
    is_new: boolean,
    is_pending: boolean
}
type PageProps = {
    id: string,
    appointments: Appointment[],
    error?: string
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const supabase = createClient(context);
    const id = stringOrFirstString(context.params?.id);
    const {data: userData, error} = await supabase.auth.getUser();
    if (error || !id || isNaN(Number(id))) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }
    
    const user = userData.user;
    const {data: clinicData, error: clinicError} = await supabase.from("therapists").select("*").eq("id", id).eq("clinic_id", user.id);
    // Redirects if try to access therapist data from wrong clinic
    if (clinicError || clinicData.length == 0) {
        return {
            redirect: {
                destination: "/therapists",
                permanent: false
            }
        }
    }

    const {data: appointmentsData, error: appointmentsError} = await supabase.rpc("get_appointments", {
        therapist_id: Number(id)
    });

    if (appointmentsError) {
        return {
            props: {
                id: id,
                appointments: [],
                // error: appointmentsError?.message
            }
        }
    }
    return {
        props: {
            id: id,
            appointments: appointmentsData,
            // error: appointmentsError?.message
        }
    }
}

function Dashboard(props: PageProps) {
    const [filter, setFilter] = useState<FilterType>("All");
    const [events, setEvents] = useState(() => {
        return props.appointments.map((appointment) => {
            return {title: appointment.name, date: appointment.created_at}
        })
    });
    const cards = props.appointments.map((appointment) => {
        return <PatientCard key={appointment.id} id={appointment.id} date={appointment.created_at} patientName={appointment.name} description={appointment.description}/>
    });
    
    function handleFilterChange(newFilter: FilterType) {
        return () => {
            setFilter(newFilter);
        }
    }


    return (
        <div className="w-full p-8 flex flex-col justify-center gap-8">
            <h1 className="text-3xl font-bold">Welcome, Gary Guo!</h1>
            <div className="w-full flex justify-center gap-8">
                {/* Calendar */}
                <div className="w-[50%] flex flex-col gap-4">
                    <FullCalendar
                        plugins={[ dayGridPlugin ]}
                        initialView="dayGridWeek"
                        headerToolbar = {{
                            left: 'prev,next',
                            center: 'title',
                            right: 'dayGridWeek,dayGridMonth' // user can switch between the two
                        }}
                    />
                    <div className="flex gap-4">
                        <Button size="large" className="button-primary px-4">Add Availabilities</Button>
                        <Button size="large" className="button-primary px-4">Add Days Off</Button>
                    </div>
                </div>
                {/* Appointments */}
                <div className="w-[50%] flex flex-col gap-8 items-center">
                    {/* Top */}
                    <div className="flex w-full items-center gap-8">
                        <div className="text-field-search-bar w-full max-w-96 flex">
                            <TextField placeholder="Search" size="small" fullWidth sx={{backgroundColor: "white", borderRadius: 2}}/>
                        </div>
                        
                        <ButtonGroup
                            variant="contained"
                            color="info"
                            disableElevation
                            className="border-transparent outline-none h-8"
                        >
                            <Button value="All" className={filter === "All" ? "button-group-selected" : "button-group-unselected"} onClick={handleFilterChange("All")}>All</Button>
                            <Button value="Pending" className={filter === "Pending" ? "button-group-selected" : "button-group-unselected"} onClick={handleFilterChange("Pending")}>Pending</Button>
                            <Button value="Accepted" className={filter === "Accepted" ? "button-group-selected" : "button-group-unselected"} onClick={handleFilterChange("Accepted")}>Accepted</Button>
                        </ButtonGroup>
                    </div>
                    {/* Main */}
                    <main className="grid justify-items-center grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-8 w-full h-[70vh] overflow-auto no-scrollbar pb-6">
                        {cards}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;