import { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { WeightWhizGuessInputProps } from '../../../types/weightWhizTypes';

const WeightWhizGuessInput = ({
  totalLowerLBS,
  totalUpperLBS,
  handleCorrectGuess,
}: WeightWhizGuessInputProps) => {
  const [guessWeight, setGuessWeight] = useState<string>('');

  useEffect(() => {
    if (
      parseInt(guessWeight) === totalLowerLBS ||
      parseInt(guessWeight) === totalUpperLBS
    ) {
      setGuessWeight('');
      handleCorrectGuess();
    }
  }, [guessWeight, handleCorrectGuess, totalLowerLBS, totalUpperLBS]);

  return (
    <Form.Control
      aria-label='Weight Guess'
      className=' mt-2 font-jockey x-small-input large-input-text'
      value={guessWeight}
      onChange={(e) => setGuessWeight(e.target.value)}
      autoFocus
      id='weightGuessInput'
    />
  );
};

export default WeightWhizGuessInput;
