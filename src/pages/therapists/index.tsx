import AddTherapist from "@/components/modals/AddTherapist";
import type { GetServerSidePropsContext } from "next";

import { createClient } from "@/utils/supabase/server-props";
import { createClient as createClientFrontend } from "@/utils/supabase/component";
import TherapistProfile from "@/components/modals/TherapistProfile";

import { Tables } from "@/database.types";
import {
  Avatar,
  Container,
  Grid2 as Grid,
  Typography,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Link as MUILink,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { useNotifications } from "@toolpad/core";
import Link from "next/link";

export default function Therapists({
  therapists,
  clinic,
  backendUser,
}: {
  therapists: Tables<"therapists">[];
  clinic: Tables<"clinics">;
  backendUser: User;
}) {
  const [editClinicFormData, setEditClinicFormData] = useState({
    name: clinic.name,
    greeting: clinic.welcome_message,
    routing_code: clinic.routing_code,
    isEditing: false,
  });
  const supabase = createClientFrontend();
  const notifications = useNotifications();

  const editClinicInDB = async () => {
    const { data, error } = await supabase
      .from("clinics")
      .update({
        name: editClinicFormData.name,
        welcome_message: editClinicFormData.greeting,
        routing_code: editClinicFormData.routing_code,
      })
      .eq("id", backendUser.id)
      .select();
    if (error != null) {
      notifications.show("Error: " + error.message, {
        severity: "error",
        autoHideDuration: 3000,
      });
    } else {
      console.log(data);
      notifications.show("Successfully updated " + data[0].name, {
        autoHideDuration: 3000,
      });
    }
  };
  return (
    <div className="p-8">
      <Container className="max-w-screen-md">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Container className="p-2">
          <Grid container gap={"1em"}>
            <Grid size="grow">
              <TextField
                onChange={(e) =>
                  setEditClinicFormData((prev) => {
                    return { ...prev, name: e.target.value };
                  })
                }
                margin="dense"
                id="clinicName"
                name="clinicName"
                label="Clinic Name"
                type="text"
                fullWidth
                disabled={!editClinicFormData.isEditing}
                value={editClinicFormData.name}
              />
            </Grid>
            <Grid size="grow">
              <TextField
                margin="dense"
                label="Email address"
                type="text"
                fullWidth
                disabled
                value={backendUser.email}
              />
            </Grid>
          </Grid>
          <Grid container gap={"1em"}>
            <Grid size="grow">
              <TextField
                onChange={(e) =>
                  setEditClinicFormData((prev) => {
                    return { ...prev, greeting: e.target.value };
                  })
                }
                margin="dense"
                id="greeting"
                name="greeting"
                label="Clinic Greeting"
                type="text"
                fullWidth
                disabled={!editClinicFormData.isEditing}
                value={editClinicFormData.greeting}
                multiline
                minRows={2}
              />
            </Grid>
            <Grid>
              <TextField
                onChange={(e) =>
                  setEditClinicFormData((prev) => {
                    return { ...prev, routing_code: e.target.value };
                  })
                }
                margin="dense"
                label="Routing code"
                type="text"
                fullWidth
                disabled={!editClinicFormData.isEditing}
                value={editClinicFormData.routing_code}
              />
            </Grid>
          </Grid>
        </Container>
        <Container className="text-right">
          {editClinicFormData.isEditing ? (
            <Button onClick={editClinicInDB}>Save</Button>
          ) : null}
          <FormControlLabel
            className=""
            control={
              <Switch
                onChange={(e) =>
                  setEditClinicFormData((prev) => {
                    return { ...prev, isEditing: e.target.checked };
                  })
                }
                checked={editClinicFormData.isEditing}
              />
            }
            label="Edit"
          />
        </Container>
        <h2 className="text-xl font-medium">Therapists</h2>
        <Container className="p-2 px-6 bg-white rounded-md mt-4 shadow-sm">
          {therapists.map((therapist: any) => {
            return (
              <>
                <div key={therapist.id}>
                  <Grid
                    container
                    alignItems={"center"}
                    gap={"1em"}
                    className="my-4"
                  >
                    <Grid>
                      <Avatar className="w-8 h-8">{therapist.name[0]}</Avatar>
                    </Grid>
                    <Grid>
                      <Typography>{therapist.name}</Typography>
                    </Grid>
                    <Grid
                      className="ml-auto"
                      container
                      alignItems={"center"}
                      gap={".5em"}
                    >
                      {therapist.ethnicity}
                      <FontAwesomeIcon size="2xs" icon={faCircle} />
                      {therapist.gender}
                      <FontAwesomeIcon size="2xs" icon={faCircle} />
                      {therapist.age}
                    </Grid>
                  </Grid>
                  <Container className="flex gap-4">
                    <Link
                      href={"/therapist/" + therapist.id}
                      className="mt-2 text-primary-blue  hover:underline"
                    >
                      View Bookings
                    </Link>
                    <TherapistProfile
                      name={therapist.name}
                      bio={therapist.bio}
                      ethnicity={therapist.ethnicity}
                      gender={therapist.gender}
                      specialization={therapist.specialization}
                      ageRange={therapist.ageRange}
                      age={therapist.age}
                    />
                  </Container>
                </div>
                <Divider
                  key={therapist.id + "d"}
                  aria-hidden="true"
                  className="my-4 h-0"
                />
              </>
            );
          })}
          <AddTherapist />
        </Container>
      </Container>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);

  const userRes = await supabase.auth.getUser();

  if (userRes.error || !userRes.data) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const clinicRes = await supabase
    .from("clinics")
    .select()
    .eq("id", userRes.data.user.id);
  if (clinicRes.error || !clinicRes.data || clinicRes.data.length == 0) {
    return {
      redirect: {
        destination: "/create-clinic",
        permanent: false,
      },
    };
  }

  const therapistRes = await supabase
    .from("therapists")
    .select()
    .eq("clinic_id", userRes.data.user.id);
  if (therapistRes.error || !therapistRes.data) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      therapists: therapistRes.data,
      clinic: clinicRes.data[0],
      backendUser: userRes.data.user,
    },
  };
}
