import { Container, Button } from 'react-bootstrap';
import { WeightWhizEndGameMenuProps } from '../../../types/weightWhizTypes';
import { ShareButton } from '../../ShareButton';

const WeightWhizEndGameMenu = ({
  score,
  goToMainMenu,
  gameMode,
  isLeaderboardScore,
}: WeightWhizEndGameMenuProps) => {
  const shareMessage =
    'Check out my score on https://jakeshape.com/weight-whiz!\n\n' +
    'Score: ' +
    score +
    '\n' +
    'Game Mode: ' +
    gameMode;

  return (
    <Container className='pe-3 ps-0'>
      <h1 className='font-jockey d-flex justify-content-center mt-3'>
        GAME OVER
      </h1>
      <h3 className='font-jockey d-flex justify-content-center'>
        Score: {score}
      </h3>
      <Container className='text-center'>
        <ShareButton shareMessage={shareMessage} />
      </Container>
      {isLeaderboardScore && (
        <p className='font-jockey d-flex justify-content-center'>
          You made the leaderboards!
        </p>
      )}
      <Container className='d-flex justify-content-center'>
        <Button
          className='my-3 green-button shadow'
          onClick={goToMainMenu}
          aria-label='return to main menu'
        >
          Return to Menu
        </Button>
      </Container>
    </Container>
  );
};

export default WeightWhizEndGameMenu;
