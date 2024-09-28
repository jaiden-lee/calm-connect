from flask import Blueprint, request, jsonify

bp = Blueprint('appointment', __name__)

@bp.route('/appointments', methods=['GET'])
def get_appointments():
    # Your appointment handling logic here
    return jsonify({"message": "Appointments retrieved"}), 200



# def schedule_appointment():
#     data = request.get_json()
#     patient_id = data['patient_id']
#     appointment_time = data['appointment_time']
#     save_appointment(patient_id, appointment_time)
#     return {"status": "Appointment Scheduled"}