from flask import Blueprint, request, jsonify
from app.services.twilio_service import send_sms, get_twilio_client
from app.services.llm_service import get_therapist_match
from app.services.supabase_service import get_all_patients, init_supabase,create_patient,get_patient_by_phone
from flask_wtf.csrf import CSRFProtect
import logging
from flask import session

def create_blueprint(csrf):
    bp = Blueprint('sms', __name__)
    @bp.route('/sms/receive', methods=['POST'])
    @csrf.exempt
    def receive_sms():
        
        logging.info("Received SMS request")    
        user_message = request.form.get('Body', '')
        from_number = request.form.get('From', '')
        logging.info(f"Received messageeeee: {user_message} from {from_number} type: {type(from_number)}")
        supabase_client = init_supabase()
        found_patient = get_patient_by_phone(supabase_client, from_number)
        conversation_state = session.get(from_number, {
            'history': [],
            'current_step': 'start'
        })

        logging.info(f"----------\n\n conversation state with this number: {conversation_state}\n\n and session {session}\n\n----------")
        if conversation_state['current_step'] == 'start': 
            if found_patient:
                pass
                # TODO prob not needed: remind them of appointment coming up, its own function
            else: # new patient
                claude_response = get_therapist_match(from_number,supabase_client, user_message=None,conversation_state=conversation_state)
                logging.info(f"claude initialization response: {claude_response}")
     
        elif conversation_state['current_step'] == 'gathering_info':
            claude_response = get_therapist_match(from_number,supabase_client, user_message=user_message,conversation_state=conversation_state)
            logging.info(f"claude gathering info response: {claude_response}")
        
        elif conversation_state['current_step'] == 'complete':
            print(f"----\n\n END OF CONVO\n\n----")
            

        
        return jsonify({"message": "SMS processed"}), 200

    return bp

#     