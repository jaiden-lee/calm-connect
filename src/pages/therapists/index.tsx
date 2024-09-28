import AddTherapist from "@/components/modals/AddTherapist";
import type { GetServerSidePropsContext } from "next";

import { createClient } from "@/utils/supabase/server-props";
import { Tables } from "@/database.types";
import {
  Avatar,
  Container,
  Grid2 as Grid,
  Typography,
  Divider,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

export default function Therapists({
  therapists,
}: {
  therapists: Tables<"therapists">[];
}) {
  return (
    <Container className="max-w-screen-md">
      <Typography>Therapists Information</Typography>
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
              <Container>
                <Typography className="font-bold inline">
                  Specializations:{" "}
                </Typography>{" "}
                {therapist.specialization}
                <br />
                <Typography className="font-bold inline">
                  Age Range:{" "}
                </Typography>{" "}
                {therapist.ageRange}
                <Typography>{therapist.bio}</Typography>
              </Container>
            </div>
            <Divider aria-hidden="true" className="my-4 bg-stone-500 color-stone-500 h-.5" />
          </>
        );
      })}
      <AddTherapist />
    </Container>
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
    },
  };
}
