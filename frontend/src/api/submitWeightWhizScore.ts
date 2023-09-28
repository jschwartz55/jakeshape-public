import { API } from 'aws-amplify';
import { GameMode } from '../types/weightWhizTypes';

export const submitWeightWhizScore = async (
  score: number,
  gameMode: GameMode
): Promise<boolean> => {
  const response = await API.get(
    'jakeshapeAPI',
    '/api/submit-weight-whiz-score',
    {
      headers: {
        'x-api-key': process.env.REACT_APP_API_KEY,
      },
      queryStringParameters: {
        score: score,
        gameMode: gameMode,
      },
    }
  );

  return response;
};
