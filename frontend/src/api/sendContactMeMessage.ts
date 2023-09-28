import { Contact } from '../types/contactTypes';
import { API } from 'aws-amplify';

export const sendContactMeMessage = async (data: Contact): Promise<void> => {
  await API.get('jakeshapeAPI', '/api/send-contact-me-message', {
    headers: {
      'x-api-key': process.env.REACT_APP_API_KEY,
    },
    queryStringParameters: {
      name: data.name,
      email: data.email,
      message: data.message,
    },
  });
};
