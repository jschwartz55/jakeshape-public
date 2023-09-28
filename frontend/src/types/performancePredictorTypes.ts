import { PerformancePredictorFormInitialValues } from '../forms/PerformancePredictorForm/PerformancePredictorForm';

export type PerformancePrediction = {
  squat: number;
  bench: number;
  deadlift: number;
};

export type PerformancePredictorFormValues = {
  name: string;
  meetDate: string;
  equipment: string;
  weightClass: string;
};

export type PerformancePredictorFormProps = {
  handleFormSubmit: (data: PerformancePredictorFormValues) => void;
  loadingPerformancePrediction: boolean;
};

export type PerformancePredictorResultsProps = {
  performancePrediction: PerformancePrediction;
};
