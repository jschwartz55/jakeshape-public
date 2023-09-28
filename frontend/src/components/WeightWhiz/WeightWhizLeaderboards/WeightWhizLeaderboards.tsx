import { Container, Form } from 'react-bootstrap';
import { GameMode } from '../../../types/weightWhizTypes';
import { useState, useCallback } from 'react';
import { WeightWhizLeaderboardTable } from '..';

export const getGameModeCheckOption = (
  id: string,
  label: string,
  name: string,
  value: string,
  isChecked: boolean
) => {
  return {
    id: id,
    label: label,
    name: name,
    value: value,
    isChecked: isChecked,
  };
};
const WeightWhizLeaderboards = () => {
  const [gameMode, setGameMode] = useState<GameMode>('normal');

  const handleGameModeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedValue = e.target.value;
      setGameMode(selectedValue as GameMode);
    },
    []
  );

  const gameModeOptions = [
    getGameModeCheckOption(
      'easy',
      'Easy',
      'gameMode',
      'easy',
      gameMode === 'easy'
    ),
    getGameModeCheckOption(
      'normal',
      'Normal',
      'gameMode',
      'normal',
      gameMode === 'normal'
    ),
    getGameModeCheckOption(
      'hard',
      'Hard',
      'gameMode',
      'hard',
      gameMode === 'hard'
    ),
    getGameModeCheckOption(
      'expert',
      'Expert',
      'gameMode',
      'expert',
      gameMode === 'expert'
    ),
  ];

  return (
    <>
      <Container className='d-flex justify-content-center'>
        <h1 className='font-jockey'>Leaderboards</h1>
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
            onChange={(e) => handleGameModeChange(e)}
          />
        ))}
      </Container>
      <Container className='d-flex justify-content-center'>
        <WeightWhizLeaderboardTable gameMode={gameMode} />
      </Container>
    </>
  );
};

export default WeightWhizLeaderboards;
