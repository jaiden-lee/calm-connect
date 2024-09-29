import os
import openai
from dotenv import load_dotenv
from openai import OpenAI
import logging
from flask import session
from app.services.supabase_service import get_all_therapists, get_therapist_by_id
from app.services.twilio_service import send_sms
from flask import session
import json
load_dotenv()

import os
from anthropic import Anthropic, HUMAN_PROMPT, AI_PROMPT


def get_therapist_match(from_number,supabase_client, user_message,conversation_state):

    """
    For a new patient, engages in a conversation with llm to gather information and then at end, matches with therapist
    """
    client = OpenAI(
        api_key=os.getenv('OPENAI_API_KEY'),
        )
    if conversation_state['current_step'] == 'start':
        print(f"----\n\n STARTING CONVO\n\n----")
        intro_message = "Welcome to CalmConnect! We're here to help you find the right therapist that best fits your needs."
        # """ - Last Name
        # - Gender
        # - Date of Birth
        # - Desired gender of their therapist
        # - Desired ethnicity of their therapist
        # """

        initial_prompt = f"""
        Imagine you are working as an AI-based therapist matching service. You are beginning a text conversation with a patient seeking mental health support with a therapist at this clinic. 
        Your task:
        1. Start a text conversation with the patient.
        2. Gather the following patient demographics:
        - First Name
        - Type of therapy services they are looking for
        - What days of the week they are available for a consultation
        - What time of the day they are available for a consultation (Morning (8am-12pm), Afternoon (12-4pm), Evening (4-8pm))
        
        Here are the instructions you must strictly follow for all future messages:
        - Be sure to start EXACTLY with the welcome message "{intro_message}"
        - And then in the next sentence for their first name.
        - Ask questions one by one, and then wait for the patient's response.
        - If the patient does not provide an answer to any of these questions, kindly ask them to answer to the best of their ability.
        - Maintain a professional and empathetic tone throughout the conversation.
        - Say "We" instead of "I" when referring to the therapist matching service.
        - DON'T say "Thank you" when they respond, or say "Sounds good" or anything like that, just go immediately into the next question!!
        - Your responses should concise and to the point and professional.
        - Following this, once you have all the message, return it in a JSON format and say "JSON" at the beginning of the message so the frontend of the application can parse it.
       
        Follow ALL of these instructions and have a conversation with the patient.
        """
        #  - Ask them for their date or birth, don't specify it must be in  MM/DD/YYYY format, but in the final JSON, convert it to that format.
        

        

        response = client.chat.completions.create(
        messages=[
            {
            "role": "system",
            "content": f"{initial_prompt}"
        }
        ],
        model="gpt-3.5-turbo",
        )
        response = response.choices[0].message.content.strip()

        

        # need to retrieve response from patient # need to prob define another endpoint and route for this and then receive the response here
        conversation_state['history'].append({
            "role": "system",
            "content": f"{initial_prompt}"
        })
        conversation_state['history'].append({"role": "assistant", "content": f"{response}"})
        logging.info(f"\n\nconversation history after initial prompt: {conversation_state['history']}")
        sent_intro_message = send_sms(from_number, response)
        conversation_state['current_step'] = 'gathering_info'
        session[from_number] = conversation_state
        session.modified = True
        logging.info(f"----------\n\n conversation state with number: {conversation_state}\n\n and session {session}\n\n----------")

    elif conversation_state['current_step'] == 'gathering_info':
        print(f"----\n\n GATHERING INFO\n\n----")
        logging.info(f"----------\n\n new message is {user_message}\n\n-------")
        conversation_state['history'].append({
            "role": "user",
            "content": f"{user_message}"
        })

        logging.info(f"----------\n\n new modified conversation history with number: {conversation_state['history']}\n\n----------")
        assistant_response = client.chat.completions.create(
            messages=conversation_state['history'],
        model="gpt-3.5-turbo",
        )

        assistant_response = assistant_response.choices[0].message.content.strip()
        print(f"----------\n\n assistant response is {assistant_response}\n\n----------")
        if "JSON" in assistant_response:
            conversation_state['current_step'] = 'complete'
            final_message = assistant_response.split("JSON")[0]
            send_message = send_sms(from_number,final_message)
            json_response = assistant_response.split("JSON")[1]
            logging.info(f"----------\n\n json response is {json_response}\n\n----------")
            conversation_state, therapist_id = find_therapist_match(from_number,supabase_client, client, conversation_state)
            if therapist_id != "NO_THERAPIST":
                therapist_id = int(therapist_id)
                create = find_appointment_time(from_number, supabase_client, client, conversation_state, therapist_id)
        else:
            send_message = send_sms(from_number,assistant_response)
        conversation_state['history'].append({
            "role": "assistant",
            "content": f"{assistant_response }"
        })
        session[from_number] = conversation_state
        session.modified = True

    return


def find_therapist_match(from_number,supabase_client, client, conversation_state):
    """
    returns either id of therapists or a message to the patient stating that there are no therapists available at the moment that match their ideal type or availabiliy
    """
    all_therapists = get_all_therapists(supabase_client)
    
    therapist_info = "\n".join([f"Therapist name: {t['name']}, ID: {t['id']},  Age: {t['age']}, Ethnicity: {t['ethnicity']}, gender: {t['gender']}, specialization: {t['specialization']}, ageRange: {t['ageRange']}, Bio: {t['bio']}, Availability: {t['availabilities']}, days_off: {t['days_off']}" for t in all_therapists])
    
    get_therapist_prompt = f"""
    Using past conversation history of the patient, you are continuing your role as an AI-based therapist matching service, now considering the therapists in our database.
    You must now find the best therapist for the patient based on their demographics and preferred therapist qualifications and their availability and the availability of their therapist.
    You must return the name of the therapist that best fits the patient's needs. If there is no therapist in the system that works well with the patient, state that
    "Unfortunately, we couldn't find a therapist that works well with your needs and availability. Please try again later."
    
    Please follow this additional instruction as well:
    -  Please return the response in the following JSON format: {{
    "therapist_id": "4",
    "message": "We have found a therapist that fits your criteria. The therapist's name is Maya Jackson."
    }}
    
    - if you are able to find a therapist, return the ID of the therapist in therapist_id and the message will be to the patient that they found a suitable therapist and their name.
    - if you are not able to find a therapist, return "NO_THERAPIST" in the therapist_id key, and the message to the patient will be that unfortunately no therapist is able to be found with desired criteria
    This is the therapist info: {therapist_info}
    """

    conversation_state['history'].append({
            "role": "system",
            "content": f"{get_therapist_prompt}"
        })

    #logging.info(f"----------\n\n found therapist with : {conversation_state['history']}\n\n----------")
    assistant_response = client.chat.completions.create(
    messages=conversation_state['history'],
    model="gpt-3.5-turbo",
    )

    assistant_response = assistant_response.choices[0].message.content.strip()
    assistant_response = json.loads(assistant_response)
    logging.info(f"----------\n\n chatgpt response: {assistant_response}\n\n----------")
    therapy_id = assistant_response["therapist_id"].strip()

    response = assistant_response["message"].strip()

    conversation_state['history'].append({
            "role": "assistant",
            "content": f"{response}"
        })
    if response:
        sent_message = send_sms(from_number, response) 
    conversation_state["therapist_id"] = therapy_id
    session[from_number] = conversation_state
    session.modified = True
    logging.info(f"----------\n\n therapy id is {therapy_id} and response is {response}\n\n----------")
    return conversation_state,therapy_id 


def find_appointment_time(from_number, supabase_client, client, conversation_state,therapist_id, user_response = None):
    """
    returns either id of therapists or a message to the patient stating that there are no therapists available at the moment that match their ideal type or availabiliy
    """
    oneTherapistInfo = get_therapist_by_id(int(therapist_id))
    logging.info(f'oneTherapistInfo {oneTherapistInfo}')
    
    if conversation_state['current_step'] != 'finding_timeslot':
        get_therapist_prompt = f"""
            Using past conversation history of the patient, you are continuing your role as an AI-based therapist matching service, now trying to find an appointment time for the patient given their therapist.
            In the conversation it is important to consider both the availability of the user AND the availability of the therapist.
            Begin by stating that we will now find a consultation time that works best.
            Ask the patient a series of questions to find a 30 min appointment time slot given both their availability and the therapist's availability.
            This can be like "Will a 30 minute consult on September 30th at 10am work?"
            When they agree to a time, you must send a message to the patient confirming the appointment time and the therapist's name.

            When they finally confirm part, return a JSON in the following format of this example with the words JSON right before for easier parsing: {{
                "patient_message": A string description of the appointment time and the therapist's name that will be confirmation message sent to the patient,
                "appointment_start_time": "2024-09-30T04:00:00.000Z"
            }}
        """

        conversation_state['history'].append({
                "role": "system",
                "content": f"{get_therapist_prompt}"
            })
    else:
        get_therapist_prompt = f"""
            rely on past responses and process the patient's last response on whether the previous appointment time worked with them. If they are not fine with that time or respond 'No', ask for another time slot in the patient and therapist's available slots.

            If they are fine with that time e.g. the user responds 'Yes', return a message to the patient confirming the appointment time and the therapist's name.
            If they confirm, return in JSON format similar to this example {{
                "patient_message": A description of the appointment time and the therapist's name that will be confirmation message sent to the patient,
                "appointment_start_time": "2024-09-30T04:00:00.000Z"
            }}
            Write JSON at the end for easier parsing.
        """

        conversation_state['history'].append({
                "role": "system",
                "content": f"{get_therapist_prompt}"
            })
        conversation_state['history'].append({
                "role": "user",
                "content": f"{user_response}"
            })

 
    assistant_response = client.chat.completions.create(
        messages=conversation_state['history'],
    model="gpt-3.5-turbo",
    )

    assistant_response = assistant_response.choices[0].message.content.strip()
    try:
        if "JSON" in assistant_response:
            json_str = assistant_response.split("JSON", 1)[0].strip()
            logging.warning("json_str")
            json_response = json.loads(json_str)

            assistant_response = json_response.get("patient_message", json_response)
            appointment_start_time = json_response.get("appointment_start_time")
            logging.info("JSON keyword found in assistant response")
            response = create_patient(client=supabase_client, phone_number = from_number, therapist_id = therapist_id)
            logging.info(response)
        else:
            logging.warning(f"{json_response}")
    except json.JSONDecodeError as e:
        logging.error(f"Error parsing JSON: {e}")
    except IndexError as e:
        logging.error(f"Error splitting response: {e}")
    except Exception as e:
        logging.error(f"Unexpected error processing assistant response: {e}")

    if assistant_response:
        sent_message = send_sms(from_number, assistant_response) 
    logging.info(f"----------\n\n response is {assistant_response}\n\n----------")

    conversation_state['history'].append({
            "role": "assistant",
            "content": f"{assistant_response }"
        })
    conversation_state['current_step'] = 'finding_timeslot'
    session[from_number] = conversation_state
    session.modified = True
    return conversation_state

