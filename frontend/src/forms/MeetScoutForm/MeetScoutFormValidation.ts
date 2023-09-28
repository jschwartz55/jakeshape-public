import * as Yup from 'yup';
import { requiredFieldMessage } from '../requiredFieldMessage';
export const MeetScoutFormValidation = Yup.object().shape({
  meetID: Yup.string().required(requiredFieldMessage),
});
