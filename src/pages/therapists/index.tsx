import AddTherapist from "@/components/modals/AddTherapist";
import type { GetServerSidePropsContext } from "next";

import { createClient } from "@/utils/supabase/server-props";
import { Tables } from "@/database.types";
import { Avatar, Container, Grid2 as Grid, Typography, Divider } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

export default function Therapists({
  therapists,
}: {
  therapists: Tables<"therapists">[];
}) {
  return (
    <Container>
      <Typography>Therapists Information</Typography>
      {therapists.map((therapist: any) => {
        return (
          <div>
            <Grid container alignItems={"center"} gap={"1em"}>
              <Grid>
              <Avatar>{therapist.name[0]}</Avatar>
              </Grid>
              <Grid>
              <Typography>{therapist.name}</Typography>
              </Grid>
              <Grid container>
                {therapist.ethnicity}   
                <FontAwesomeIcon icon={faCircle} />
                {therapist.gender}
                <FontAwesomeIcon icon={faCircle} />
                {therapist.age}
              </Grid>
            </Grid>
          </div>
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
