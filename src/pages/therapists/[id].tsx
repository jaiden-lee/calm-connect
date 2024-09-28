import { Button, TextField, Box, ToggleButton, ToggleButtonGroup, ButtonGroup } from "@mui/material";
import { useState } from "react";
import PatientCard from "@/components/PatientCard";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { GetServerSidePropsContext } from "next";
import { createClient } from "@/utils/supabase/server-props";

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
    appointments: Appointment[]
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const supabase = createClient(context);
    const {data, error} = await supabase.auth.getUser();
    if (error) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }

}

function Dashboard() {
    const [filter, setFilter] = useState<FilterType>("All");

    
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
                <div className="w-[50%] flex flex-col gap-8 justify-center items-center">
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
                    <main className="grid justify-items-center grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-8 w-full max-h-[70vh] overflow-auto no-scrollbar pb-6">
                        <PatientCard id={"10"} date={new Date()} patientName="George Burdell" description={"George is a 21 year old male looking for a therapist for general anxiety management."} />
                        <PatientCard id={"10"} date={new Date()} patientName="George Burdell" description={"George is a 21 year old male looking for a therapist for general anxiety management."} />
                        <PatientCard id={"10"} date={new Date()} patientName="George Burdell" description={"George is a 21 year old male looking for a therapist for general anxiety management."} />
                        <PatientCard id={"10"} date={new Date()} patientName="George Burdell" description={"George is a 21 year old male looking for a therapist for general anxiety management."} />
                        <PatientCard id={"10"} date={new Date()} patientName="George Burdell" description={"George is a 21 year old male looking for a therapist for general anxiety management."} />
                        <PatientCard id={"10"} date={new Date()} patientName="George Burdell" description={"George is a 21 year old male looking for a therapist for general anxiety management."} />
                    </main>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;