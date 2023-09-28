import * as Yup from 'yup';
import { requiredFieldMessage } from '../requiredFieldMessage';
import { equipmentTypes } from './equipmentTypes';

export const PerformancePredictorFormValidation = Yup.object().shape({
  name: Yup.string()
    .required(requiredFieldMessage)
    .matches(/^\S*$/, 'Spaces are not allowed'),
  meetDate: Yup.date().required(requiredFieldMessage),
  equipment: Yup.string().oneOf(equipmentTypes).required(requiredFieldMessage),
  weightClass: Yup.string()
    .required(requiredFieldMessage)
    .matches(
      /^(?:\d+(?:\.\d+)?|\d+(?:\.\d+)?\+)$/,
      'Invalid format. Should be a number or a number with a + sign.'
    ),
});
