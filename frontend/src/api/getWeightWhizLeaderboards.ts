import { API } from 'aws-amplify';

import { LeaderboardsData } from '../types/weightWhizTypes';

export const getWeightWhizLeaderboards =
  async (): Promise<LeaderboardsData> => {
    const response = await API.get(
      'jakeshapeAPI',
      '/api/get-weight-whiz-leaderboards',
      {
        headers: {
          'x-api-key': process.env.REACT_APP_API_KEY,
        },
      }
    );

    return response;
  };
