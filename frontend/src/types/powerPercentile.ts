export type PowerPercentile = {
  squat: number;
  bench: number;
  deadlift: number;
  total: number;
};

export type PowerPercentileFormValues = {
  sexInclude: string[];
  equipmentInclude: string[];
  ageRange: [string, string];
  bodyweightRange: [string, string];
  federationInclude: string[];
  dateRange: [string, string];
  squat: string;
  bench: string;
  deadlift: string;
  total: string;
};

export type PowerPercentileFormProps = {
  handleFormSubmit: (data: PowerPercentileFormValues) => void;
  loadingPowerPercentile: boolean;
};

export type PowerPercentileResultsProps = {
  powerPercentile: PowerPercentile;
};
