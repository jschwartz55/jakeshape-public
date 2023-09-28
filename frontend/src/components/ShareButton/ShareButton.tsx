import { Container, IconButton, Tooltip } from '@mui/material';
import IosShareIcon from '@mui/icons-material/IosShare';
import { useState } from 'react';

const ShareButton = ({ shareMessage }: { shareMessage: string }) => {
  const [tooltipText, setTooltipText] = useState('Copy results to Clipboard');

  const handleButtonClick = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setTooltipText('Copied!');
      setTimeout(() => {
        setTooltipText('Copy results to clipboard');
      }, 1500);
    } catch {
      setTooltipText('Failed to copy');
    }
  };

  return (
    <Container>
      <Tooltip title={tooltipText} placement='top'>
        <IconButton onClick={handleButtonClick}>
          <IosShareIcon className='font-jockey' />
        </IconButton>
      </Tooltip>
    </Container>
  );
};

export default ShareButton;
