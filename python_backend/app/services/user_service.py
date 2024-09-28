from app.services.supabase_service import supabase

def get_patient_by_number(phone_number: str):
    try:
        result = supabase.table("patients").select("*").eq("phone_number", phone_number).execute()
        if result.data:
            return result.data[0] 
        return None
    except Exception as e:
        raise Exception(f"Failed to retrieve patient: {str(e)}")

def create_patient(phone_number: str, name: str = None):
    try:
        result = supabase.table("patients").insert({
            "phone_number": phone_number,
            "name": name
        }).execute()
        return result.data[0]
    except Exception as e:
        raise Exception(f"Failed to create patient: {str(e)}")

