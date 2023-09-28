import { Formik } from 'formik';
import {
  Button,
  Container,
  Form,
  FormControl,
  FormGroup,
  FormLabel,
} from 'react-bootstrap';
import { MeetScoutFormValidation } from './MeetScoutFormValidation';
import {
  MeetScoutFormProps,
  MeetScoutFormValues,
} from '../../types/meetScoutTypes';

export const meetScoutFormFields = {
  meetID: {
    placeholder: 'ex: mh7e9tmpxq0n',
    type: 'text',
    name: 'meetID',
    controlId: 'meetScoutMeetID',
    label: 'Meet ID',
  },
};
export const MeetScoutFormInitialValues: MeetScoutFormValues = {
  meetID: '',
};

const MeetScoutForm = ({
  handleSetMeetScoutData,
  loadingMeetScoutData,
}: MeetScoutFormProps) => {
  return (
    <Formik
      validationSchema={MeetScoutFormValidation}
      onSubmit={(data) => handleSetMeetScoutData(data)}
      initialValues={MeetScoutFormInitialValues}
    >
      {({ handleSubmit, handleChange, values, touched, errors }) => (
        <Form noValidate onSubmit={handleSubmit} className='mx-3'>
          <FormGroup
            className='mb-3'
            controlId={meetScoutFormFields.meetID.controlId}
          >
            <FormLabel className='tool-field-name'>
              {meetScoutFormFields.meetID.label}
            </FormLabel>
            <FormControl
              className='font-jockey'
              type={meetScoutFormFields.meetID.type}
              name={meetScoutFormFields.meetID.name}
              value={values.meetID}
              onChange={handleChange}
              isValid={touched.meetID && !errors.meetID}
              isInvalid={touched.meetID && !!errors.meetID}
              placeholder={meetScoutFormFields.meetID.placeholder}
              aria-label={meetScoutFormFields.meetID.label}
            />
            <FormControl.Feedback type='invalid' className='font-jockey'>
              {errors.meetID}
            </FormControl.Feedback>
          </FormGroup>

          <Container className='d-flex justify-content-center'>
            <Button
              className='mb-3 green-button shadow'
              type='submit'
              disabled={loadingMeetScoutData}
              aria-label='Submit Form'
            >
              SEE REPORT
            </Button>
          </Container>
        </Form>
      )}
    </Formik>
  );
};

export default MeetScoutForm;
