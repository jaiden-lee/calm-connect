import os
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

load_dotenv()



def init_supabase() -> Client:

    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if not url or not key:
        raise ValueError("Supabase URL and API Key must be set in the environment variables.")
    return create_client(url, key)

def get_appointments(client: Client, user_id: int):
    response = client.table("appointments").select("*").eq("user_id", user_id).execute()
    return response.data

def create_appointment(client: Client, appointment_data: dict):
    response = client.table("appointments").insert(appointment_data).execute()
    return response.data

def get_all_patients(client: Client):
    try:
        response = client.table('patient').select('*').execute()
        return response.data
    except Exception as e:
        print(f"Error fetching patients: {str(e)}")
        return []

def get_all_therapists(client: Client):
    response = client.table('therapists').select('*').execute()
    return response.data

def get_patient_by_phone(client: Client, phone_number: str):
    response = client.table("patient").select("*").eq("phone_number", phone_number).execute()
    return True if response.data else False

def create_patient(client: Client, phone_number: str, name: str = None, description: str = None, details: str = None, therapist_id: int = None):
    try:
        data = {
            'phone_number': phone_number,
            'name': name,
            'began_session': False,
            'description': description,
            'details': details,
            'is_new': True,
            'therapist_id': therapist_id,
        }
        response = client.table('patient').insert(data).execute()
        logging.info(f"Created new patient: {response.data}")
        return response.data[0] if response.data else None
    except Exception as e:
        logging.error(f"Error creating patient: {str(e)}")
        return None


if __name__ == "__main__":
    supabase = init_supabase()

