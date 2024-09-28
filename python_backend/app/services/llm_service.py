import os
import openai
from dotenv import load_dotenv
from openai import OpenAI
import logging
from flask import session
from app.services.supabase_service import get_all_therapists
from app.services.twilio_service import send_sms
from flask import session
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


        initial_prompt = f"""
        Imagine you are working as an AI-based therapist matching service. You are beginning a text conversation with a patient seeking mental health support with a therapist at this clinic. 
        Your task:
        1. Start a text conversation with the patient.
        2. Gather the following patient demographics:
        - First Name
        - Last Name
        - Gender
        - Date of Birth
        - Desired gender of their therapist
        - Desired ethnicity of their therapist
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
        - After gathering all the information, summarize the patient's information and state that we will try to find the best therapist for them.
        - Following this, once you have all the message, return it in a JSON format and say "JSON" at the beginning of the message so the frontend of the application can parse it.
        - Ask them for their date or birth, don't specify it must be in  MM/DD/YYYY format, but in the final JSON, convert it to that format.
        
        Follow ALL of these instructions and have a conversation with the patient.
        """

        

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
            therapist_id = find_therapist_matches(from_number,supabase_client, client, conversation_state)
        else:
            send_message = send_sms(from_number,assistant_response)
        conversation_state['history'].append({
            "role": "assistant",
            "content": f"{assistant_response }"
        })
        session[from_number] = conversation_state
        session.modified = True

    return


def find_therapist_matches(from_number,supabase_client, client, conversation_state):
    """
    returns either id of therapists or a message to the patient stating that there are no therapists available at the moment that match their ideal type or availabiliy
    """
    all_therapists = get_all_therapists(supabase_client)
    
    therapist_info = "\n".join([f"Therapist name: {t['name']}, ID: {t['id']},  Age: {t['age']}, Ethnicity: {t['ethnicity']}, gender: {t['gender']}, specialization: {t['specialization']}, ageRange: {t['ageRange']}, Bio: {t['bio']}, Availability: {t['availabilities']}, days_off: {t['days_off']}" for t in all_therapists])
    
    get_therapist_prompt = f"""
    Using past conversation history of the patient,you are continuing your role as an AI-based therapist matching service, now considering the therapists in our database.
    You must now find the best therapist for the patient based on their demographics and preferred therapist qualifications and their availability and the availability of their therapist.
    You must return the name of the therapist that best fits the patient's needs. If there is no therapist in the system that works well with the patient, state that
    "Unfortunately, we couldn't find a therapist that works well with your needs and availability. Please try again later."
    
    Please follow this additional instruction as well:
    - if you are able to find a therapist, return the ID of the therapist followed by "ID" afterwards for easier parsing followed immediately by the message to the patient stating that they found a therapist and their name
    - if you are not able to find a therapist, return "NO_THERAPIST" followed by "ID" for easier parsing and then afterwards, return the message to the patient stating that unfortunately no therapist is able to be found with desired criteria
    This is the therapist info: {therapist_info}
    """

    conversation_state['history'].append({
            "role": "system",
            "content": f"{get_therapist_prompt}"
        })

    logging.info(f"----------\n\n new modified conversation history with number: {conversation_state['history']}\n\n----------")
    assistant_response = client.chat.completions.create(
        messages=conversation_state['history'],
    model="gpt-3.5-turbo",
    )

    assistant_response = assistant_response.choices[0].message.content.strip()
    therapy_id = assistant_response.split("ID")[0].strip()

    response =assistant_response.split("ID")[1].strip()

    sent_message = send_sms(from_number, response) 
    logging.info(f"----------\n\n therapy id is {therapy_id} and response is {response}\n\n----------")
    return therapist_id

