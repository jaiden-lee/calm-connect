import os
from twilio.rest import Client
from twilio.base.exceptions import TwilioException
import logging
from dotenv import load_dotenv

def get_twilio_client():
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    if not account_sid or not auth_token:
        raise ValueError("Twilio credentials (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN) are missing in the environment variables")
    return Client(account_sid, auth_token)

def send_sms(to_number, message):
    load_dotenv()
    from_number = os.getenv('TWILIO_PHONE_NUMBER')
    logging.info(f"from number is {from_number}")    
    if not from_number:
        raise ValueError("TWILIO_PHONE_NUMBER is missing in the environment variables")
    
    try:
        client = get_twilio_client()
        message = client.messages.create(
            body=message,
            from_=from_number,
            to=to_number
        )
        logging.info(f"message sid is {message.sid}")    
        return message.sid
    except TwilioException as e:
        logging.info(f"Twilio error: {str(e)}")
        raise