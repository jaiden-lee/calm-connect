import os
from supabase import create_client, Client
from dotenv import load_dotenv
import logging
from datetime import datetime


load_dotenv()



def init_supabase() -> Client:

    url = "https://nrmubhxzpelhrvlryrgs.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybXViaHh6cGVsaHJ2bHJ5cmdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzQ4NzA4NSwiZXhwIjoyMDQzMDYzMDg1fQ.aSfMh1QnwZPULJFt8NYAXfwp9UvUU72iSiwD2SkvQmc"
    # url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    # key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if not url or not key:
        raise ValueError("Supabase URL and API Key must be set in the environment variables.")
    return create_client(url, key)

def get_appointments(client: Client, user_id: int):
    response = client.table("appointments").select("*").eq("user_id", user_id).execute()
    return response.data

def get_all_patients(client: Client):
    try:
        response = client.table('patient').select('*').execute()
        return response.data
    except Exception as e:
        print(f"Error fetching patients: {str(e)}")
        return []

def make_appointment(client:Client,therapist_id: int = None, patient_id:int = None, start_time:str=None, duration:str=None):
    try:
        existing_appointment = client.table('appointments').select('*').eq("patient", patient_id).eq("therapist", therapist_id).eq('appointment_start_time',start_time).execute()
        print(f"\n\ntrying to create an appt")
        data = {
            'created_at': f'{datetime.now()}',
            'patient': int(patient_id),
            'therapist': int(therapist_id),
            'appointment_start_time': start_time,
            'appointment_length_minutes': duration
        }
        response = client.table('appointments').insert(data).execute()
        print(f"Created new appointment: {response.data}")
        return response.data[0] if response.data else None
    except Exception as e:
        logging.error(f"Error creating patient: {str(e)}")
        return None
def get_all_therapists(client: Client):
    response = client.table('therapists').select('*').execute()
    return response.data

def get_therapist_by_id(client: Client, id: int):
    response = client.table('therapists').select('*').eq("id", id).execute()
    return response.data[0] if response.data else None

def get_patient_by_phone(client: Client, phone_number: str):
    response = client.table("patient").select("*").eq("phone_number", phone_number).execute()
    return True if response.data else False

def create_patient(client: Client, phone_number: str, name: str = None, description: str = None, therapist_id: int = None):
    try:
        existing_patient = client.table('patient').select('*').eq('phone_number', phone_number).execute()
        if existing_patient.data:
            logging.info(f"Patient with phone number {phone_number} already exists")
            return existing_patient.data[0]

        print(f"\n\n\ntrying to create a new patient")
        data = {
            'phone_number': phone_number,
            'name': name,
            'began_session': False,
            'description': description,
            'is_new': True,
            'therapist_id': int(therapist_id),
        }
        response = client.table('patient').insert(data).execute()
        logging.info(f"Created new patient: {response.data}")
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error creating patient: {str(e)}")
        return None


if __name__ == "__main__":
    supabase = init_supabase()

