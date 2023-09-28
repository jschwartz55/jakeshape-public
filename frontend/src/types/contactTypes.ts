import { ContactFormInitialValues } from '../forms/ContactForm/ContactForm';

export type Contact = {
  name: string;
  email: string;
  message: string;
};
export type ContactFormProps = {
  handleSendMessage: (data: Contact, resetForm: () => void) => void;
  loadingMessageSend: boolean;
};
