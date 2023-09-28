import { API } from 'aws-amplify';
import {
  PerformancePrediction,
  PerformancePredictorFormValues,
} from '../types/performancePredictorTypes';

export const getPerformancePrediction = async (
  data: PerformancePredictorFormValues
): Promise<PerformancePrediction> => {
  const response = await API.get(
    'jakeshapeAPI',
    '/api/get-performance-prediction',
    {
      headers: {
        'x-api-key': process.env.REACT_APP_API_KEY,
      },
      queryStringParameters: {
        OpenPowerliftingId: data.name,
        Date: data.meetDate,
        Equipment: data.equipment,
        WeightClassKg: data.weightClass,
      },
    }
  );

  return {
    squat: response.predictions.squat,
    bench: response.predictions.bench,
    deadlift: response.predictions.deadlift,
  };
};
