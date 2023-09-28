import { Col, Row, Container, Button } from 'react-bootstrap';
import {
  Plates,
  GameMode,
  GameState,
  BarbellWeightKg,
} from '../../../types/weightWhizTypes';
import { useState } from 'react';
import { getNewPlates } from './getNewPlates';
import WeightWhizGraphic from '../WeightWhizGraphic/WeightWhizGraphic';
import {
  WeightWhizCountdownTimer,
  WeightWhizEndGameMenu,
  WeightWhizGameSettings,
  WeightWhizGuessInput,
} from '..';
import { submitWeightWhizScore } from '../../../api/submitWeightWhizScore';

const startingGameMode: GameMode = 'normal';
const startingPlates: Plates = {
  totalLowerLBS: 49,
  plates: [],
};

const WeightWhizGameScreen = () => {
  const [gameState, setGameState] = useState<GameState>('startMenu');
  const [score, setScore] = useState<number>(0);
  const [barbellWeightKg, setBarbellWeightKg] = useState<BarbellWeightKg>(20);
  const [gameMode, setGameMode] = useState<GameMode>(startingGameMode);
  const [includeClip, setIncludeClip] = useState<boolean>(false);
  const [plates, setPlates] = useState<Plates>(startingPlates);
  const [isLeaderboardScore, setIsLeaderboardScore] = useState<boolean>(false);

  const updateBarbell = () => {
    setPlates(getNewPlates(gameMode, barbellWeightKg, includeClip));
  };

  const startGame = () => {
    updateBarbell();
    setIsLeaderboardScore(false);
    setGameState('playing');
  };

  const endGame = () => {
    submitScore();
    setGameState('endMenu');
  };

  const goToMainMenu = () => {
    setScore(0);
    setGameState('startMenu');
    setPlates(startingPlates);
  };

  const submitScore = async () => {
    try {
      const response = await submitWeightWhizScore(score, gameMode);
      setIsLeaderboardScore(response);
    } catch {}
  };

  const handleBarbellWeightChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedValue = parseInt(e.target.value);
    setBarbellWeightKg(selectedValue as BarbellWeightKg);
  };

  const handleGameModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = e.target.value;
    setGameMode(selectedValue as GameMode);
  };

  const handleIncludeClipChange = () => {
    setIncludeClip(!includeClip);
  };

  const handleCorrectGuess = () => {
    setScore(score + 1);
    updateBarbell();
  };

  return (
    <>
      {gameState === 'endMenu' ? (
        <WeightWhizEndGameMenu
          score={score}
          goToMainMenu={goToMainMenu}
          gameMode={gameMode}
          isLeaderboardScore={isLeaderboardScore}
        />
      ) : (
        <>
          <Container className='pe-3 ps-0 d-flex justify-content-center'>
            <Col>
              <h1 className='font-jockey'>Score: {score}</h1>
            </Col>
            <Col>
              <Row>
                <WeightWhizCountdownTimer
                  gameState={gameState}
                  endGame={endGame}
                />
              </Row>
            </Col>
          </Container>
          <WeightWhizGraphic plates={plates.plates} includeClip={includeClip} />
          <>
            {gameState === 'startMenu' ? (
              <>
                <WeightWhizGameSettings
                  barbellWeightKg={barbellWeightKg}
                  gameMode={gameMode}
                  includeClip={includeClip}
                  handleBarbellWeightChange={handleBarbellWeightChange}
                  handleGameModeChange={handleGameModeChange}
                  handleIncludeClipChange={handleIncludeClipChange}
                />
                <Container className='d-flex justify-content-center'>
                  <Button
                    className='my-3 green-button shadow'
                    onClick={startGame}
                    aria-label='Start Game'
                  >
                    START
                  </Button>
                </Container>
              </>
            ) : (
              <>
                <Container className='d-flex justify-content-center'>
                  <WeightWhizGuessInput
                    totalLowerLBS={plates.totalLowerLBS}
                    totalUpperLBS={plates.totalLowerLBS + 1}
                    handleCorrectGuess={handleCorrectGuess}
                  />
                </Container>
                <Container className='d-flex justify-content-center '>
                  <Button
                    variant='link'
                    onClick={goToMainMenu}
                    aria-label='return to main menu'
                    className='font-jockey button-link'
                  >
                    Return to Menu
                  </Button>
                </Container>
              </>
            )}
          </>
        </>
      )}
    </>
  );
};

export default WeightWhizGameScreen;
