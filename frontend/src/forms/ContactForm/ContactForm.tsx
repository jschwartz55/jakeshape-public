import { Formik } from 'formik';
import { Contact, ContactFormProps } from '../../types/contactTypes';
import { ContactFormValidation } from './ContactFormValidation';
import {
  Form,
  FormGroup,
  FormLabel,
  FormControl,
  Button,
} from 'react-bootstrap';

export const contactFormFields = {
  name: {
    placeholder: 'ex: Jacob',
    type: 'text',
    name: 'name',
    controlId: 'contactName',
    label: 'Name',
  },
  email: {
    placeholder: 'ex: jakeshape1@gmail.com',
    type: 'text',
    name: 'email',
    controlId: 'contactEmail',
    label: 'Your Email',
  },
  message: {
    placeholder: 'Enter message here...',
    type: 'text',
    name: 'message',
    controlId: 'contactMessage',
    label: 'Message',
  },
};
export const ContactFormInitialValues: Contact = {
  name: '',
  email: '',
  message: '',
};

const ContactForm = ({
  handleSendMessage,
  loadingMessageSend,
}: ContactFormProps) => {
  return (
    <Formik
      validationSchema={ContactFormValidation}
      onSubmit={(data: Contact, { resetForm }) =>
        handleSendMessage(data, resetForm)
      }
      initialValues={ContactFormInitialValues}
    >
      {({ handleSubmit, handleChange, values, touched, errors }) => (
        <Form noValidate onSubmit={handleSubmit} className='mx-3'>
          <FormGroup
            className='mb-3 contact-input'
            controlId={contactFormFields.name.controlId}
          >
            <FormLabel className='tool-field-name'>
              {contactFormFields.name.label}
            </FormLabel>
            <FormControl
              className='font-jockey'
              type={contactFormFields.name.type}
              name={contactFormFields.name.name}
              value={values.name}
              onChange={handleChange}
              isValid={touched.name && !errors.name}
              isInvalid={touched.name && !!errors.name}
              placeholder={contactFormFields.name.placeholder}
              aria-label={contactFormFields.name.label}
            />
            <FormControl.Feedback type='invalid' className='font-jockey'>
              {errors.name}
            </FormControl.Feedback>
          </FormGroup>
          <FormGroup
            className='mb-3 contact-input'
            controlId={contactFormFields.email.controlId}
          >
            <FormLabel className='tool-field-name'>
              {contactFormFields.email.label}
            </FormLabel>
            <FormControl
              className='font-jockey'
              type={contactFormFields.email.type}
              name={contactFormFields.email.name}
              value={values.email}
              onChange={handleChange}
              isValid={touched.email && !errors.email}
              isInvalid={touched.email && !!errors.email}
              placeholder={contactFormFields.email.placeholder}
              aria-label={contactFormFields.email.label}
            />
            <FormControl.Feedback type='invalid' className='font-jockey'>
              {errors.email}
            </FormControl.Feedback>
          </FormGroup>
          <FormGroup
            className='mb-3 contact-input'
            controlId={contactFormFields.message.controlId}
          >
            <FormLabel className='tool-field-name'>
              {contactFormFields.message.label}
            </FormLabel>
            <FormControl
              className='font-jockey'
              type={contactFormFields.message.type}
              name={contactFormFields.message.name}
              value={values.message}
              onChange={handleChange}
              isValid={touched.message && !errors.message}
              isInvalid={touched.message && !!errors.message}
              placeholder={contactFormFields.message.placeholder}
              aria-label={contactFormFields.message.label}
              as='textarea'
              rows={4}
            />
            <FormControl.Feedback type='invalid' className='font-jockey'>
              {errors.message}
            </FormControl.Feedback>
          </FormGroup>
          <Button
            className='mb-3 green-button shadow'
            type='submit'
            disabled={loadingMessageSend}
            aria-label='Submit Form'
          >
            SEND
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default ContactForm;
