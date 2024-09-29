import { Button, TextField, ButtonGroup } from "@mui/material";
import { , useState } from "react";
import PatientCard from "@/components/PatientCard";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { GetServerSidePropsContext } from "next";
import { createClient } from "@/utils/supabase/server-props";
import { stringOrFirstString } from "@/utils/helper";
import { Tables } from "@/database.types";
import AddAvailabilities from "@/components/modals/AddAvailabilities";
import dayjs from "dayjs";
import AddDaysOff from "@/components/modals/AddDaysOff";

type FilterType = "All" | "Pending" | "Accepted";
type Patient = {
  id: string,
  phone_number: string,
  name: string,
  is_new: boolean,
  description: string
};
type Appointment = {
  id: string,
  created_at: Date,
  patient_id: string,
  name: string,
  description: string,
  is_new: boolean,
  is_pending: boolean,
  appointment_start_date: Date,
  appointment_length_minutes: number,
  phone_number: string
};
type PageProps = {
  id: string,
  appointments: Appointment[],
  therapist: Tables<"therapists">,
  error?: string
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);
  const id = stringOrFirstString(context.params?.id);
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !id || isNaN(Number(id))) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const user = userData.user;
  const { data: therapistData, error: therapistError } = await supabase
    .from("therapists")
    .select("*")
    .eq("id", id)
    .eq("clinic_id", user.id);
  // Redirects if try to access therapist data from wrong clinic
  if (therapistError || therapistData.length == 0) {
    return {
      redirect: {
        destination: "/therapists",
        permanent: false,
      },
    };
  }

  const { data: appointmentsData, error: appointmentsError } =
    await supabase.rpc("get_appointments", {
      therapist_id: Number(id),
    });

  if (appointmentsError) {
    return {
      props: {
        id: id,
        therapist: therapistData[0],
        appointments: [],
        error: "Error occurred"
      },
    };
  }
  return {
    props: {
      id: id,
      therapist: therapistData[0],
      appointments: appointmentsData,
      error: "No error"
    },
  };
}

const convertAvailabilitesToEvent = (
  availabilities: Tables<"therapists">["availabilities"],
) => {
  const firstWeek = availabilities.map((value: any) => {
    return {
      title: "Available",
      start: dayjs(value.startTime),
      end: dayjs(value.endTime),
      displayEventEnd: true,
    };
  });
  return firstWeek.flatMap((value) => {
    const result = [];
    for (let i = 0; i < 15; i++) {
      result.push({
        ...value,
        start: value.start.add(i * 7, "day").toDate(),
        end: value.end.add(i * 7, "day").toDate(),
      });
    }
    return result;
  });
};

const convertDaysOffToEvent = (daysOff: Tables<"therapists">["days_off"]) => {
  return daysOff.map((value: any) => {
    return {
      title: value.reason + " day out of office",
      date: value.dayOff,
      allDay: true,
    };
  });
};

function Dashboard(props: PageProps) {
  console.log(props.appointments);
  const [filter, setFilter] = useState<FilterType>("All");
  const [availabilitiesAsEvent, setAvailabilitiesAsEvent] = useState(
    convertAvailabilitesToEvent(props.therapist.availabilities),
  );
  const refreshAvailabilities = () => {
    setAvailabilitiesAsEvent(
      convertAvailabilitesToEvent(props.therapist.availabilities),
    );
  };

  const [daysOff, setDaysOff] = useState(
    convertDaysOffToEvent(props.therapist.days_off),
  );
  const refreshDaysOff = () => {
    setDaysOff(convertDaysOffToEvent(props.therapist.days_off));
  };

  // const [pendingEvents, setPendingEvents] = useState([
  //   {
  //     id: 1,
  //     title: "Gerald Ford",
  //     start: new Date(),
  //     end: new Date(Date.now() + 3600 * 1000),
  //     displayEventEnd: true,
  //   },
  // ]);
  const [pendingEvents, setPendingEvents] = useState(props.appointments.filter((appointment) => appointment.is_pending).map((appointment) => ({
    id: appointment.id,
    title: appointment.name,
    start: new Date(appointment.appointment_start_date),
    end: new Date(appointment.appointment_start_date)
      ?.setMinutes(new Date(appointment.appointment_start_date).getMinutes() + appointment.appointment_length_minutes)
  })));
  const [acceptedEvents, setAcceptedEvents] = useState(props.appointments.filter((appointment) => !appointment.is_pending).map((appointment) => ({
    id: appointment.id,
    title: appointment.name,
    start: new Date(appointment.appointment_start_date),
    end: new Date(appointment.appointment_start_date)
      ?.setMinutes(new Date(appointment.appointment_start_date).getMinutes() + appointment.appointment_length_minutes)
  })));
  // const [acceptedEvents, setAcceptedEvents] = useState([
  //   {
  //     title: "Gerald Ford",
  //     start: new Date(Date.now() - 24 * 3600 * 1000),
  //     end: new Date(Date.now() - 23 * 3600 * 1000),
  //     displayEventEnd: true,
  //   },
  // ]);

  const filteredAppointments = props.appointments.filter((appointment) => {
    if (filter === "Pending") {
      if (appointment.is_pending) {
        return true;
      }
    } else if (filter === "Accepted") {
      if (!appointment.is_pending) {
        return true;
      }
    } else {
      return true;
    }
    return false;
  });
  const cards = filteredAppointments.map((appointment) => {
    return (
      <PatientCard
        key={appointment.id}
        id={appointment.id}
        date={appointment.created_at}
        patientName={appointment.name}
        description={appointment.description}
        is_pending={appointment.is_pending}
        appointment_start_date={appointment.appointment_start_date}
        appointment_length_minutes={appointment.appointment_length_minutes}
        phone_number={appointment.phone_number}
        setAcceptedEvents={setAcceptedEvents}
        setPendingEvents={setPendingEvents}
      />
    );
  });

  function handleFilterChange(newFilter: FilterType) {
    return () => {
      setFilter(newFilter);
    };
  }

  return (
    <div className="w-full p-8 flex flex-col justify-center gap-8">
      <h1 className="text-3xl font-bold">Welcome, {props.therapist.name}!</h1>
      <div className="w-full flex justify-center gap-8">
        {/* Calendar */}
        <div className="w-[50%] flex flex-col gap-4">
          <FullCalendar
            nowIndicator={true}
            eventOverlap={true}
            scrollTime="current"
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "timeGridDay,timeGridWeek,dayGridMonth", // user can switch between the two
            }}
            eventSources={[
              {
                events: daysOff,
                backgroundColor: "red",
                display: "block",
                borderColor: "transparent",
              },
              {
                events: availabilitiesAsEvent,
                backgroundColor: "green",
                display: "block",
                borderColor: "transparent",
              },
              {
                events: pendingEvents,
                backgroundColor: "#C5C5C5",
                display: "block",
                borderColor: "transparent",
              },
              {
                events: acceptedEvents,
                backgroundColor: "#2196F3",
                display: "block",
                borderColor: "transparent",
              },
            ]}
          />
          <div className="flex gap-4">
            <AddAvailabilities
              triggerCalRefresh={refreshAvailabilities}
              therapistData={props.therapist}
            />
            <AddDaysOff
              triggerCalRefresh={refreshDaysOff}
              therapistData={props.therapist}
            />
          </div>
        </div>
        {/* Appointments */}
        <div className="w-[50%] flex flex-col gap-8 items-center">
          {/* Top */}
          <div className="flex w-full items-center gap-8">
            <div className="text-field-search-bar w-full max-w-96 flex">
              <TextField
                placeholder="Search"
                size="small"
                fullWidth
                sx={{ backgroundColor: "white", borderRadius: 2 }}
              />
            </div>

            <ButtonGroup
              variant="contained"
              color="info"
              disableElevation
              className="border-transparent outline-none h-8"
            >
              <Button
                value="All"
                className={
                  filter === "All"
                    ? "button-group-selected"
                    : "button-group-unselected"
                }
                onClick={handleFilterChange("All")}
              >
                All
              </Button>
              <Button
                value="Pending"
                className={
                  filter === "Pending"
                    ? "button-group-selected"
                    : "button-group-unselected"
                }
                onClick={handleFilterChange("Pending")}
              >
                Pending
              </Button>
              <Button
                value="Accepted"
                className={
                  filter === "Accepted"
                    ? "button-group-selected"
                    : "button-group-unselected"
                }
                onClick={handleFilterChange("Accepted")}
              >
                Accepted
              </Button>
            </ButtonGroup>
          </div>
          {/* Main */}
          <main className="grid items-start grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-8 w-full h-[70vh] overflow-auto no-scrollbar pb-6">
            {cards}
            {/* <PatientCard
              key={10}
              id="10"
              date={new Date()}
              patientName={"Bob"}
              description={"Lorem ipsum"}
              is_pending={true}
              appointment_start_date={new Date()}
              appointment_length_minutes={60}
              phone_number="+12018447267"
            /> */}
            
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
