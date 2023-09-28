import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { WeightWhizCountdownTimerProps } from '../../../types/weightWhizTypes';

const WeightWhizCountdownTimer = ({
  gameState,
  endGame,
}: WeightWhizCountdownTimerProps) => {
  const [countdownTime, setCountdownTime] = useState<number>(60);

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        if (countdownTime > 0) {
          setCountdownTime(countdownTime - 1);
        } else {
          clearInterval(timer);
          endGame();
        }
      }, 1000);
      return () => {
        clearInterval(timer);
      };
    } else if (countdownTime !== 60 && gameState === 'startMenu') {
      setCountdownTime(60);
    }
  }, [gameState, countdownTime, endGame]);

  return (
    <Container className='d-flex justify-content-end'>
      <h1
        className={`font-jockey text-end me-2 ${
          countdownTime <= 10 && 'text-danger'
        }`}
      >
        Time: {countdownTime}
      </h1>
    </Container>
  );
};

export default WeightWhizCountdownTimer;
