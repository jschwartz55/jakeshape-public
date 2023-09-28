import {
  Button,
  Container,
  Form,
  FormControl,
  FormGroup,
  FormLabel,
} from 'react-bootstrap';
import { Formik } from 'formik';
import {
  PowerPercentileFormProps,
  PowerPercentileFormValues,
} from '../../types/powerPercentile';
import { PowerPercentileFormValidation } from './PowerPercentileFormValidation';
import {
  equipmentOptions,
  federationOptions,
  sexOptions,
} from './powerPercentileFilters';

import Select from 'react-select';
import { convertFormInputToKG } from '../../convertToUnits';
import { useUnitContext } from '../../hooks/context';

const powerPercentileFormFields = {
  sexInclude: {
    name: 'Sex',
    controlId: 'powerPercentileSex',
    label: 'Sex',
  },
  equipmentInclude: {
    name: 'Equipment',
    controlId: 'powerPercentileEquipment',
    label: 'Equipment',
  },
  federationInclude: {
    name: 'Federation',
    controlId: 'powerPercentileFederation',
    label: 'Federation',
  },
  ageRange: {
    name: 'Age',
    lowerName: 'AgeLower',
    upperName: 'AgeUpper',
    controlId: 'powerPercentileAgeRange',
    label: 'Age Range',
    type: 'number',
  },
  bodyweightRange: {
    name: 'Bodyweight',
    controlId: 'powerPercentileBodyweightRange',
    label: 'Bodyweight Range',
    type: 'number',
  },
  dateRange: {
    name: 'Date',
    controlId: 'powerPercentileDateRange',
    label: 'Date Range (MM-DD-YYYY)',
    type: 'date',
  },
  squat: {
    name: 'Squat',
    controlId: 'powerPercentileSquat',
    label: 'Your Best Squat',
    type: 'number',
  },
  bench: {
    name: 'Bench',
    controlId: 'powerPercentileBench',
    label: 'Your Best Bench',
    type: 'number',
  },
  deadlift: {
    name: 'Deadlift',
    controlId: 'powerPercentileDeadlift',
    label: 'Your Best Deadlift',
    type: 'number',
  },
  total: {
    name: 'Total',
    controlId: 'powerPercentileTotal',
    label: 'Your Best Total',
    type: 'number',
  },
};

const getSelectOption = (option: string) => {
  return {
    value: option,
    label: option,
  };
};

const PowerPercentileFormInitialValues: PowerPercentileFormValues = {
  sexInclude: [],
  equipmentInclude: [],
  ageRange: ['0', '999'],
  bodyweightRange: ['0', '999'],
  federationInclude: [],
  dateRange: ['1950-01-01', new Date().toISOString().slice(0, 10)],
  squat: '',
  bench: '',
  deadlift: '',
  total: '',
};

export const PowerPercentileForm = ({
  handleFormSubmit,
  loadingPowerPercentile,
}: PowerPercentileFormProps) => {
  const units = useUnitContext();
  return (
    <Formik
      onSubmit={(data) => {
        handleFormSubmit(
          units.isLBS
            ? {
                ...data,
                bodyweightRange: [
                  convertFormInputToKG(data.bodyweightRange[0]),
                  convertFormInputToKG(data.bodyweightRange[1]),
                ],
                squat: convertFormInputToKG(data.squat),
                bench: convertFormInputToKG(data.bench),
                deadlift: convertFormInputToKG(data.deadlift),
                total: convertFormInputToKG(data.total),
              }
            : data
        );
      }}
      initialValues={PowerPercentileFormInitialValues}
      validationSchema={PowerPercentileFormValidation}
    >
      {({
        handleSubmit,
        values,
        touched,
        errors,
        setFieldValue,
        setFieldTouched,
      }) => (
        <Form noValidate onSubmit={handleSubmit} className='mx-3'>
          <FormGroup
            className='mb-3'
            controlId={powerPercentileFormFields.sexInclude.controlId}
          >
            <FormLabel className='tool-field-name'>
              {powerPercentileFormFields.sexInclude.label}
            </FormLabel>

            <Select
              isMulti
              name={powerPercentileFormFields.sexInclude.name}
              className='font-jockey dark-text'
              options={
                values.sexInclude.length === sexOptions.length
                  ? sexOptions.map((option) => getSelectOption(option))
                  : [
                      { value: 'selectAll', label: 'Select All' },
                      ...sexOptions.map((option) => getSelectOption(option)),
                    ]
              }
              value={values.sexInclude.map((option) => getSelectOption(option))}
              onChange={(selectedOptions) => {
                if (
                  selectedOptions.some((option) => option.value === 'selectAll')
                ) {
                  setFieldValue('sexInclude', sexOptions);
                } else {
                  const selectedValues = selectedOptions.map(
                    (option) => option.value
                  );
                  setFieldValue('sexInclude', selectedValues);
                }
              }}
              onBlur={() => setFieldTouched('sexInclude', true)}
            />
            {touched.sexInclude && errors.sexInclude && (
              <div className='text-danger font-jockey'>{errors.sexInclude}</div>
            )}
          </FormGroup>
          <FormGroup
            className='mb-3'
            controlId={powerPercentileFormFields.equipmentInclude.controlId}
          >
            <FormLabel className='tool-field-name'>
              {powerPercentileFormFields.equipmentInclude.label}
            </FormLabel>
            <Select
              isMulti
              name={powerPercentileFormFields.equipmentInclude.name}
              className='font-jockey dark-text'
              options={
                values.equipmentInclude.length === equipmentOptions.length
                  ? equipmentOptions.map((option) => getSelectOption(option))
                  : [
                      { value: 'selectAll', label: 'Select All' },
                      ...equipmentOptions.map((option) =>
                        getSelectOption(option)
                      ),
                    ]
              }
              value={values.equipmentInclude.map((option) =>
                getSelectOption(option)
              )}
              onChange={(selectedOptions) => {
                if (
                  selectedOptions.some((option) => option.value === 'selectAll')
                ) {
                  setFieldValue('equipmentInclude', equipmentOptions);
                } else {
                  const selectedValues = selectedOptions.map(
                    (option) => option.value
                  );
                  setFieldValue('equipmentInclude', selectedValues);
                }
              }}
              onBlur={() => setFieldTouched('equipmentInclude', true)}
            />
            {touched.equipmentInclude && errors.equipmentInclude && (
              <div className='text-danger font-jockey'>
                {errors.equipmentInclude}
              </div>
            )}
          </FormGroup>
          <FormGroup
            className='mb-3'
            controlId={powerPercentileFormFields.federationInclude.controlId}
          >
            <FormLabel className='tool-field-name'>
              {powerPercentileFormFields.federationInclude.label}
            </FormLabel>
            <Select
              isMulti
              name={powerPercentileFormFields.federationInclude.name}
              className='font-jockey dark-text'
              options={
                values.federationInclude.length === federationOptions.length
                  ? federationOptions.map((option) => getSelectOption(option))
                  : [
                      { value: 'selectAll', label: 'Select All' },
                      ...federationOptions.map((option) =>
                        getSelectOption(option)
                      ),
                    ]
              }
              value={values.federationInclude.map((option) =>
                getSelectOption(option)
              )}
              onChange={(selectedOptions) => {
                if (
                  selectedOptions.some((option) => option.value === 'selectAll')
                ) {
                  setFieldValue('federationInclude', federationOptions);
                } else {
                  const selectedValues = selectedOptions.map(
                    (option) => option.value
                  );
                  setFieldValue('federationInclude', selectedValues);
                }
              }}
              onBlur={() => setFieldTouched('federationInclude', true)}
            />
            {touched.federationInclude && errors.federationInclude && (
              <div className='text-danger font-jockey'>
                {errors.federationInclude}
              </div>
            )}
          </FormGroup>
          <FormGroup
            className='mb-3'
            controlId={powerPercentileFormFields.ageRange.controlId}
          >
            <FormLabel className='tool-field-name'>
              {powerPercentileFormFields.ageRange.label}
            </FormLabel>
            <Container className='d-flex px-0'>
              <FormControl
                className='font-jockey'
                type={powerPercentileFormFields.ageRange.type}
                name={powerPercentileFormFields.ageRange.lowerName}
                value={values.ageRange[0]}
                onChange={(e) => {
                  const newAgeLower = e.target.value;
                  setFieldValue('ageRange', [newAgeLower, values.ageRange[1]]);
                }}
                onBlur={() => setFieldTouched('ageRange', true)}
              />
              <span className='mx-2 font-jockey mt-1'>to</span>
              <FormControl
                className='font-jockey'
                type={powerPercentileFormFields.ageRange.type}
                name={powerPercentileFormFields.ageRange.upperName}
                value={values.ageRange[1]}
                onChange={(e) => {
                  const newAgeUpper = e.target.value;
                  setFieldValue('ageRange', [values.ageRange[0], newAgeUpper]);
                }}
                onBlur={() => setFieldTouched('ageRange', true)}
              />
            </Container>
            {touched.ageRange && errors.ageRange && (
              <div className='text-danger font-jockey'>{errors.ageRange}</div>
            )}
          </FormGroup>
          <FormGroup
            className='mb-3'
            controlId={powerPercentileFormFields.bodyweightRange.controlId}
          >
            <FormLabel className='tool-field-name'>
              {powerPercentileFormFields.bodyweightRange.label +
                (units.isLBS ? ' (LBS)' : ' (KG)')}
            </FormLabel>
            <Container className='d-flex px-0'>
              <FormControl
                className='font-jockey'
                type={powerPercentileFormFields.bodyweightRange.type}
                value={values.bodyweightRange[0]}
                onChange={(e) => {
                  const newAgeLower = e.target.value;
                  setFieldValue('bodyweightRange', [
                    newAgeLower,
                    values.bodyweightRange[1],
                  ]);
                }}
                onBlur={() => setFieldTouched('bodyweightRange', true)}
              />
              <span className='mx-2 font-jockey mt-1'>to</span>
              <FormControl
                className='font-jockey'
                type={powerPercentileFormFields.bodyweightRange.type}
                value={values.bodyweightRange[1]}
                onChange={(e) => {
                  const newAgeUpper = e.target.value;
                  setFieldValue('bodyweightRange', [
                    values.bodyweightRange[0],
                    newAgeUpper,
                  ]);
                }}
                onBlur={() => setFieldTouched('bodyweightRange', true)}
              />
            </Container>
            {touched.bodyweightRange && errors.bodyweightRange && (
              <div className='text-danger font-jockey'>
                {errors.bodyweightRange}
              </div>
            )}
          </FormGroup>
          <FormGroup
            className='mb-3'
            controlId={powerPercentileFormFields.dateRange.controlId}
          >
            <FormLabel className='tool-field-name'>
              {powerPercentileFormFields.dateRange.label}
            </FormLabel>
            <Container className='d-flex px-0'>
              <FormControl
                className='font-jockey'
                type={powerPercentileFormFields.dateRange.type}
                value={values.dateRange[0]}
                onChange={(e) => {
                  const newAgeLower = e.target.value;
                  setFieldValue('dateRange', [
                    newAgeLower,
                    values.dateRange[1],
                  ]);
                }}
                onBlur={() => setFieldTouched('dateRange', true)}
              />
              <span className='mx-2 font-jockey mt-1'>to</span>
              <FormControl
                className='font-jockey'
                type={powerPercentileFormFields.dateRange.type}
                value={values.dateRange[1]}
                onChange={(e) => {
                  const newAgeUpper = e.target.value;
                  setFieldValue('dateRange', [
                    values.dateRange[0],
                    newAgeUpper,
                  ]);
                }}
                onBlur={() => setFieldTouched('dateRange', true)}
              />
            </Container>
            {touched.dateRange && errors.dateRange && (
              <div className='text-danger font-jockey'>{errors.dateRange}</div>
            )}
          </FormGroup>
          <FormGroup
            className='mb-3'
            controlId={powerPercentileFormFields.squat.controlId}
          >
            <FormLabel className='tool-field-name'>
              {powerPercentileFormFields.squat.label +
                (units.isLBS ? ' (LBS)' : ' (KG)')}
            </FormLabel>
            <FormControl
              className='font-jockey'
              type={powerPercentileFormFields.squat.type}
              value={values.squat}
              onChange={(e) => {
                setFieldValue('squat', e.target.value);
              }}
              onBlur={() => setFieldTouched('squat', true)}
            />
            {touched.squat && errors.squat && (
              <div className='text-danger font-jockey'>{errors.squat}</div>
            )}
          </FormGroup>
          <FormGroup
            className='mb-3'
            controlId={powerPercentileFormFields.bench.controlId}
          >
            <FormLabel className='tool-field-name'>
              {powerPercentileFormFields.bench.label +
                (units.isLBS ? ' (LBS)' : ' (KG)')}
            </FormLabel>
            <FormControl
              className='font-jockey'
              type={powerPercentileFormFields.bench.type}
              value={values.bench}
              onChange={(e) => {
                setFieldValue('bench', e.target.value);
              }}
              onBlur={() => setFieldTouched('bench', true)}
            />
            {touched.bench && errors.bench && (
              <div className='text-danger font-jockey'>{errors.bench}</div>
            )}
          </FormGroup>
          <FormGroup
            className='mb-3'
            controlId={powerPercentileFormFields.deadlift.controlId}
          >
            <FormLabel className='tool-field-name'>
              {powerPercentileFormFields.deadlift.label +
                (units.isLBS ? ' (LBS)' : ' (KG)')}
            </FormLabel>
            <FormControl
              className='font-jockey'
              type={powerPercentileFormFields.deadlift.type}
              value={values.deadlift}
              onChange={(e) => {
                setFieldValue('deadlift', e.target.value);
              }}
              onBlur={() => setFieldTouched('deadlift', true)}
            />
            {touched.deadlift && errors.deadlift && (
              <div className='text-danger font-jockey'>{errors.deadlift}</div>
            )}
          </FormGroup>
          <FormGroup
            className='mb-3'
            controlId={powerPercentileFormFields.total.controlId}
          >
            <FormLabel className='tool-field-name'>
              {powerPercentileFormFields.total.label +
                (units.isLBS ? ' (LBS)' : ' (KG)')}
            </FormLabel>
            <FormControl
              className='font-jockey'
              type={powerPercentileFormFields.total.type}
              value={values.total}
              onChange={(e) => {
                setFieldValue('total', e.target.value);
              }}
              onBlur={() => setFieldTouched('total', true)}
            />
            {touched.total && errors.total && (
              <div className='text-danger font-jockey'>{errors.total}</div>
            )}
          </FormGroup>
          <Container className='d-flex justify-content-center'>
            <Button
              className='mb-3 green-button shadow'
              type='submit'
              disabled={loadingPowerPercentile}
              aria-label='Get Results'
            >
              GET RESULTS
            </Button>
          </Container>
        </Form>
      )}
    </Formik>
  );
};

export default PowerPercentileForm;
