import Link from "next/link";
import { Button } from "@mui/material";

type PatientCardProps = {
    id: string,
    date: Date,
    patientName: string,
    description: string
}

function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() < 12 ? 'AM' : 'PM';
  
    return `${day} ${month} ${year} • ${hours}:${minutes} ${ampm}`;
  }

function PatientCard(props: PatientCardProps) {
    const currentDate = formatDate(props.date);
    return (
        <div className="bg-white rounded-md shadow-sm p-4 flex flex-col gap-4">
            <p className="text-text-light-gray text-sm">{currentDate}</p>
            <h3 className="font-medium">{props.patientName}</h3>
            <p className="text-sm text-text-gray">{props.description}</p>
            <Link href={`/patient/${props.id}`} className="text-primary-blue text-sm hover:underline">
                View Details
            </Link>

            <div className="flex gap-4">
                <Button className="button-primary rounded-md">ACCEPT</Button>
                <Button className="button-primary bg-text-gray rounded-md">DENY</Button>
            </div>
        </div>
    );
}

export default PatientCard;