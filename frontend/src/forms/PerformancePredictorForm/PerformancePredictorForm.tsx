import { Formik } from 'formik';
import {
  Button,
  Container,
  Form,
  FormControl,
  FormGroup,
  FormLabel,
  FormSelect,
} from 'react-bootstrap';
import { PerformancePredictorFormValidation } from './PerformancePredictorFormValidation';
import { equipmentTypes } from './equipmentTypes';
import {
  PerformancePredictorFormProps,
  PerformancePredictorFormValues,
} from '../../types/performancePredictorTypes';
import { convertFormInputToKG } from '../../convertToUnits';
import { useUnitContext } from '../../hooks/context';

export const performancePredictorFormFields = {
  name: {
    placeholder: 'ex: jacobschwartz1',
    type: 'text',
    name: 'name',
    controlId: 'performancePredictorID',
    label: 'OpenPowerlifting ID',
  },
  meetDate: {
    placeholder: '1/1/2000',
    type: 'date',
    name: 'meetDate',
    controlId: 'performancePredictorMeetDate',
    label: 'Meet Date',
  },
  equipment: {
    placeholder: 'Choose an equipment type...',
    name: 'equipment',
    controlId: 'performancePredictorEquipment',
    label: 'Equipment',
  },
  weightClass: {
    placeholder: 'ex: 140+',
    type: 'text',
    name: 'weightClass',
    controlId: 'performancePredictorWeightClass',
    label: 'Weight Class',
  },
};
export const PerformancePredictorFormInitialValues: PerformancePredictorFormValues =
  {
    name: '',
    meetDate: new Date().toISOString().slice(0, 10),
    equipment: equipmentTypes[0],
    weightClass: '',
  };

const PerformancePredictorForm = ({
  handleFormSubmit,
  loadingPerformancePrediction,
}: PerformancePredictorFormProps) => {
  const units = useUnitContext();
  return (
    <Formik
      validationSchema={PerformancePredictorFormValidation}
      onSubmit={(data) =>
        handleFormSubmit(
          units.isLBS
            ? { ...data, weightClass: convertFormInputToKG(data.weightClass) }
            : data
        )
      }
      initialValues={PerformancePredictorFormInitialValues}
    >
      {({ handleSubmit, handleChange, values, touched, errors }) => (
        <Form noValidate onSubmit={handleSubmit} className='mx-3'>
          <FormGroup
            className='mb-3'
            controlId={performancePredictorFormFields.name.controlId}
          >
            <FormLabel className='tool-field-name'>
              {performancePredictorFormFields.name.label}
            </FormLabel>
            <FormControl
              className='font-jockey'
              type={performancePredictorFormFields.name.type}
              name={performancePredictorFormFields.name.name}
              value={values.name.toLowerCase()}
              onChange={handleChange}
              isValid={touched.name && !errors.name}
              isInvalid={touched.name && !!errors.name}
              placeholder={performancePredictorFormFields.name.placeholder}
              aria-label={performancePredictorFormFields.name.label}
            />
            <FormControl.Feedback type='invalid' className='font-jockey'>
              {errors.name}
            </FormControl.Feedback>
          </FormGroup>
          <FormGroup
            className='mb-3'
            controlId={performancePredictorFormFields.meetDate.controlId}
          >
            <FormLabel className=' mt-0 tool-field-name'>
              {performancePredictorFormFields.meetDate.label}
            </FormLabel>
            <FormControl
              className='font-jockey'
              type={performancePredictorFormFields.meetDate.type}
              name={performancePredictorFormFields.meetDate.name}
              value={values.meetDate}
              onChange={handleChange}
              isValid={touched.meetDate && !errors.meetDate}
              isInvalid={touched.meetDate && !!errors.meetDate}
              placeholder={performancePredictorFormFields.meetDate.placeholder}
              aria-label={performancePredictorFormFields.meetDate.label}
            />
            <FormControl.Feedback type='invalid' className='font-jockey'>
              {errors.meetDate}
            </FormControl.Feedback>
          </FormGroup>
          <FormGroup
            className='mb-3'
            controlId={performancePredictorFormFields.weightClass.controlId}
          >
            <FormLabel className=' mt-0 tool-field-name'>
              {performancePredictorFormFields.weightClass.label +
                (units.isLBS ? ' (LBS)' : ' (KG)')}
            </FormLabel>
            <FormControl
              className='font-jockey'
              type={performancePredictorFormFields.weightClass.type}
              name={performancePredictorFormFields.weightClass.name}
              value={values.weightClass}
              onChange={handleChange}
              isValid={touched.weightClass && !errors.weightClass}
              isInvalid={touched.weightClass && !!errors.weightClass}
              placeholder={
                performancePredictorFormFields.weightClass.placeholder
              }
              aria-label={performancePredictorFormFields.weightClass.label}
            />
            <FormControl.Feedback type='invalid' className='font-jockey'>
              {errors.weightClass}
            </FormControl.Feedback>
          </FormGroup>
          <FormGroup
            className='mb-3'
            controlId={performancePredictorFormFields.equipment.controlId}
          >
            <FormLabel className=' mt-0 tool-field-name'>
              {performancePredictorFormFields.equipment.label}
            </FormLabel>
            <FormSelect
              className='font-jockey'
              name={performancePredictorFormFields.equipment.name}
              value={values.equipment}
              onChange={handleChange}
              isValid={touched.equipment && !errors.equipment}
              isInvalid={touched.equipment && !!errors.equipment}
              placeholder={performancePredictorFormFields.equipment.placeholder}
              aria-label={performancePredictorFormFields.equipment.label}
            >
              {equipmentTypes.map((type) => (
                <option key={'equipmentType' + type}>{type}</option>
              ))}
            </FormSelect>
            <FormControl.Feedback type='invalid' className='font-jockey'>
              {errors.equipment}
            </FormControl.Feedback>
          </FormGroup>
          <Container className='d-flex justify-content-center'>
            <Button
              className='mb-3 green-button shadow'
              type='submit'
              disabled={loadingPerformancePrediction}
              aria-label='Submit Form'
            >
              SEE PREDICTION
            </Button>
          </Container>
        </Form>
      )}
    </Formik>
  );
};

export default PerformancePredictorForm;
