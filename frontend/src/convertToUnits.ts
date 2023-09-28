const multiplier = 2.20462;

export const convertToLBS = (value: string | number): string => {
  if (typeof value == 'string' && value.endsWith('+')) {
    return (parseFloat(value.slice(0, -1)) * multiplier).toFixed(1) + '+';
  }
  return (
    (typeof value == 'string' ? parseFloat(value) : value) * multiplier
  ).toFixed(1);
};

export const convertFormInputToKG = (value: string | number): string => {
  if (typeof value == 'number') {
    return (value / multiplier).toString();
  } else {
    if (value.endsWith('+')) {
      return (parseFloat(value) / multiplier).toFixed(0) + '+';
    }
    return (parseFloat(value) / multiplier).toFixed(0);
  }
};
