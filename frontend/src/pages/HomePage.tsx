import { Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const HomePage = () => {
  return (
    <Container className='mb-5'>
      <h1 className='homepage-header text-center mt-5  d-flex align-items-center justify-content-center'>
        jakeshape
      </h1>
      <p className='homepage-text text-center'>the powerlifting tools hub</p>
      <Container className='d-flex justify-content-center mb-1 mt-5'>
        <LinkContainer to='/meet-scout'>
          <Button variant='lg' className='shadow-lg white-button mb-2 mx-5'>
            Meet Scout
          </Button>
        </LinkContainer>
      </Container>
      <Container className='d-flex justify-content-center mb-1'>
        <LinkContainer to='/performance-predictor'>
          <Button variant='lg' className='shadow-lg white-button mb-2 mx-5'>
            Performance Predictor
          </Button>
        </LinkContainer>
      </Container>
      <Container className='d-flex justify-content-center mb-1'>
        <LinkContainer to='/power-percentile'>
          <Button variant='lg' className='shadow-lg white-button mb-2 mx-5'>
            Power Percentile
          </Button>
        </LinkContainer>
      </Container>
      <Container className='d-flex justify-content-center mb-1'>
        <LinkContainer to='/weight-whiz'>
          <Button variant='lg' className='shadow-lg white-button mb-2 mx-5'>
            Weight Whiz
          </Button>
        </LinkContainer>
      </Container>
    </Container>
  );
};
export default HomePage;
