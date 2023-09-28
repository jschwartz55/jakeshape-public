import { Container } from 'react-bootstrap';
import { ContactForm } from '../forms';
import { useEffect, useState } from 'react';
import { sendContactMeMessage } from '../api/sendContactMeMessage';
import { displayErrorMessage } from '../api/displayErrorMessage';
import { Contact } from '../types/contactTypes';

export const ContactPage = () => {
  const [loadingMessageSend, setLoadingMessageSend] = useState<boolean>(false);
  const [errorMessageSend, setErrorMessageSend] = useState<string | null>(null);
  const [messageResultSuccess, setMessageResultSuccess] =
    useState<boolean>(false);
  const handleSendMessage = async (
    data: Contact,
    resetForm: () => void
  ): Promise<void> => {
    setLoadingMessageSend(true);
    try {
      await sendContactMeMessage(data);
      resetForm();
      setMessageResultSuccess(true);
    } catch (error) {
      displayErrorMessage(error, setErrorMessageSend);
    }
    setLoadingMessageSend(false);
  };

  useEffect(() => {
    if (errorMessageSend) {
      const timerId = setTimeout(() => {
        setErrorMessageSend(null);
      }, 3000);

      return () => clearTimeout(timerId);
    }
  }, [errorMessageSend]);

  useEffect(() => {
    if (messageResultSuccess) {
      const timerId = setTimeout(() => {
        setMessageResultSuccess(false);
      }, 3000);

      return () => clearTimeout(timerId);
    }
  }, [messageResultSuccess]);

  return (
    <Container>
      <h1 className='font-jockey ms-3'>Contact Me</h1>
      <ContactForm
        handleSendMessage={handleSendMessage}
        loadingMessageSend={loadingMessageSend}
      />
      {errorMessageSend && (
        <p className='mt-0 ms-3 font-jockey text-danger'>{errorMessageSend}</p>
      )}
      {messageResultSuccess && (
        <p className='mt-0 ms-3 font-jockey'>Success!</p>
      )}
    </Container>
  );
};

export default ContactPage;
