export const displayErrorMessage = (
  error: any,
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>
) => {
  try {
    if ('response' in error && 'data' in error.response) {
      if (typeof error.response.data === 'string') {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage('Error: Please try again');
      }
    } else {
      setErrorMessage(error.message);
    }
  } catch {
    setErrorMessage('Error: Please try again');
  }
};
