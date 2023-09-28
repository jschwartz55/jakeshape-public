import * as Yup from 'yup';
import { requiredFieldMessage } from '../requiredFieldMessage';
import {
  sexOptions,
  equipmentOptions,
  federationOptions,
} from './powerPercentileFilters';

export const PowerPercentileFormValidation = Yup.object().shape({
  sexInclude: Yup.array()
    .of(Yup.string().oneOf(sexOptions, 'Invalid sex option'))
    .required(requiredFieldMessage)
    .test('is-not-empty', ' Please select at least one sex', (value) => {
      return Array.isArray(value) && value.length > 0;
    }),
  equipmentInclude: Yup.array()
    .of(Yup.string().oneOf(equipmentOptions, 'Invalid equipment option'))
    .required(requiredFieldMessage)
    .test(
      'is-not-empty',
      ' Please select at least one equipment type',
      (value) => {
        return Array.isArray(value) && value.length > 0;
      }
    ),
  ageRange: Yup.array()
    .of(
      Yup.number()
        .min(0, 'Age must be positive')
        .max(1000, 'Age must be less than 1000')
    )
    .min(2, 'Age range must have two values')
    .required(requiredFieldMessage)
    .test(
      'is-ascending',
      'Age range must be in ascending order',
      (values) =>
        !!(
          values &&
          typeof values[0] != 'undefined' &&
          typeof values[1] != 'undefined' &&
          values[0] <= values[1]
        )
    ),
  federationInclude: Yup.array()
    .of(Yup.string().oneOf(federationOptions, 'Invalid federation option'))
    .required(requiredFieldMessage)
    .test('is-not-empty', ' Please select at least one federation', (value) => {
      return Array.isArray(value) && value.length > 0;
    }),
  bodyweightRange: Yup.array()
    .of(
      Yup.number()
        .min(0, 'Bodyweight must be positive')
        .max(1000, 'Bodyweight must be less than 1000')
    )
    .min(2, 'Bodyweight range must have two values')
    .required(requiredFieldMessage)
    .test(
      'is-ascending',
      'Bodyweight range must be in ascending order',
      (values) =>
        !!(
          values &&
          typeof values[0] != 'undefined' &&
          typeof values[1] != 'undefined' &&
          values[0] <= values[1]
        )
    ),
  dateRange: Yup.array()
    .of(Yup.string())
    .min(2, 'Date range must have two values')
    .required(requiredFieldMessage)
    .test('is-ascending', 'Date range must be in ascending order', (values) => {
      if (
        values &&
        typeof values[0] !== 'undefined' &&
        typeof values[1] !== 'undefined' &&
        values[0] <= values[1]
      ) {
        const startDate = new Date(values[0]);
        const endDate = new Date(values[1]);
        const minDate = new Date('1950-01-01');
        const maxDate = new Date();
        return startDate >= minDate && endDate <= maxDate;
      }
      return false;
    }),
  squat: Yup.number()
    .min(0, 'Squat must be a positive number')
    .max(10000, 'Squat must be less than 10000')
    .required(requiredFieldMessage),
  bench: Yup.number()
    .min(0, 'Bench must be a positive number')
    .max(10000, 'Bench must be less than 10000')
    .required(requiredFieldMessage),
  deadlift: Yup.number()
    .min(0, 'Deadlift must be a positive number')
    .max(10000, 'Deadlift must be less than 10000')
    .required(requiredFieldMessage),
  total: Yup.number()
    .min(0, 'Total must be a positive number')
    .max(10000, 'Total must be less than 10000')
    .required(requiredFieldMessage),
});
