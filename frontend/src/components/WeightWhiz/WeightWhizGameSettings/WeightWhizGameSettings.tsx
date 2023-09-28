import { Container, Form } from 'react-bootstrap';
import {
  FormCheckOption,
  WeightWhizGameSettingsProps,
} from '../../../types/weightWhizTypes';

const getFormCheckOption = (
  id: string,
  label: string,
  name: string,
  value: number | string,
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  isChecked: boolean
): FormCheckOption => {
  return {
    id: id,
    label: label,
    name: name,
    value: value,
    handleChange: handleChange,
    isChecked: isChecked,
  };
};

const WeightWhizGameSettings = ({
  barbellWeightKg,
  gameMode,
  includeClip,
  handleBarbellWeightChange,
  handleGameModeChange,
  handleIncludeClipChange,
}: WeightWhizGameSettingsProps) => {
  const barbellWeightOptions = [
    getFormCheckOption(
      '20',
      '45 LB Bar',
      'barWeight',
      20,
      handleBarbellWeightChange,
      barbellWeightKg === 20
    ),
    getFormCheckOption(
      '25',
      '55 LB Bar',
      'barWeight',
      25,
      handleBarbellWeightChange,
      barbellWeightKg === 25
    ),
  ];

  const gameModeOptions = [
    getFormCheckOption(
      'easy',
      'Easy',
      'gameMode',
      'easy',
      handleGameModeChange,
      gameMode === 'easy'
    ),
    getFormCheckOption(
      'normal',
      'Normal',
      'gameMode',
      'normal',
      handleGameModeChange,
      gameMode === 'normal'
    ),
    getFormCheckOption(
      'hard',
      'Hard',
      'gameMode',
      'hard',
      handleGameModeChange,
      gameMode === 'hard'
    ),
    getFormCheckOption(
      'expert',
      'Expert',
      'gameMode',
      'expert',
      handleGameModeChange,
      gameMode === 'expert'
    ),
  ];

  return (
    <>
      <Form>
        <Container className='d-flex justify-content-center'>
          {barbellWeightOptions.map((barbellWeightOption) => (
            <Form.Check
              type='radio'
              key={barbellWeightOption.id}
              id={barbellWeightOption.id}
              name={barbellWeightOption.name}
              label={barbellWeightOption.label}
              inline
              checked={barbellWeightOption.isChecked}
              value={barbellWeightOption.value}
              className='font-jockey game-settings-radio'
              onChange={(e) => barbellWeightOption.handleChange(e)}
            />
          ))}
        </Container>
        <Container className='d-flex justify-content-center'>
          <Form.Check
            id={'includeClip'}
            name={'includeClip'}
            label={'Include 2.5kg Collar'}
            inline
            checked={includeClip}
            className='font-jockey game-settings-radio'
            onChange={handleIncludeClipChange}
          />
        </Container>
        <Container className='d-flex justify-content-center'>
          {gameModeOptions.map((gameModeOption) => (
            <Form.Check
              type='radio'
              key={gameModeOption.id}
              id={gameModeOption.id}
              name={gameModeOption.name}
              label={gameModeOption.label}
              inline
              checked={gameModeOption.isChecked}
              value={gameModeOption.value}
              className='font-jockey game-settings-radio'
              onChange={(e) => gameModeOption.handleChange(e)}
            />
          ))}
        </Container>
      </Form>
    </>
  );
};

export default WeightWhizGameSettings;
