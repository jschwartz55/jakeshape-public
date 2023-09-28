import * as Yup from 'yup';
import { requiredFieldMessage } from '../requiredFieldMessage';
export const ContactFormValidation = Yup.object().shape({
  name: Yup.string().required(requiredFieldMessage),
  email: Yup.string().email('Invalid email').required(requiredFieldMessage),
  message: Yup.string().required(requiredFieldMessage),
});
