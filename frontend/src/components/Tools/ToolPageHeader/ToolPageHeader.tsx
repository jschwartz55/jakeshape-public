import { Typography, Switch, Stack } from '@mui/material';
import { Row, Col } from 'react-bootstrap';
import { ToolPageHeaderProps } from '../../../types/toolPageProps';
import { useUnitContext } from '../../../hooks/context';

const ToolPageHeader = ({
  title,
  showUnitToggle = true,
}: ToolPageHeaderProps) => {
  const units = useUnitContext();
  return (
    <Row className='justify-content-between'>
      <Col>
        <h1 className='mx-3 mt-3 font-jockey'>{title}</h1>
      </Col>
      <Col className='d-flex justify-content-end'>
        {showUnitToggle && (
          <Stack
            className='justify-content-center mt-3 me-4'
            direction='row'
            spacing={0}
            alignItems='center'
          >
            <Typography variant='h6' className='font-jockey'>
              LBS
            </Typography>
            <Switch
              className='unit-switch'
              checked={!units.isLBS}
              disableRipple
              disableFocusRipple
              onChange={units.switchUnits}
              aria-label='switch between lbs and kg'
            />
            <Typography variant='h6' className='font-jockey'>
              KG
            </Typography>
          </Stack>
        )}
      </Col>
    </Row>
  );
};

export default ToolPageHeader;
