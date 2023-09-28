import { Container } from 'react-bootstrap';
const NotFoundPage = () => {
  return (
    <Container>
      <h1 className='font-jockey'>Oops! 404 Error</h1>
      <p className='font-jockey'>
        The page you were looking for does not exist! Please use the sidebar to
        navigate to a new page.
      </p>
    </Container>
  );
};
export default NotFoundPage;
