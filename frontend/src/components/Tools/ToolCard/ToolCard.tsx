import { Container, Card } from 'react-bootstrap';
import { ToolCardProps } from '../../../types/toolPageProps';
import { useState } from 'react';
import { UnitContext } from '../../../hooks/context';

const ToolCard = ({ children }: ToolCardProps) => {
  const [isLBS, setIsLBS] = useState<boolean>(false);

  const switchUnits = () => {
    setIsLBS(!isLBS);
  };

  return (
    <UnitContext.Provider value={{ isLBS, switchUnits }}>
      <Container className='d-flex justify-content-center'>
        <Card className='mx-2 my-3 tool-card shadow'>{children}</Card>
      </Container>
    </UnitContext.Provider>
  );
};

export default ToolCard;
