import { Col, Container, Row } from 'react-bootstrap';

const AboutPage = () => {
  return (
    <Container>
      <Row className='mx-1 mb-3'>
        <Col md={6}>
          <h1 className='font-jockey '>About</h1>
          <p className='font-jockey'>
            Hello! My name is Jacob Schwartz, and I am the creator of
            jakeshape.com. After graduating from the University of Notre Dame in
            May 2023 with a degree in computer science, I received news that the
            start date for my job would be delayed by 6 months. With some
            newfound free time, I took the opportunity to combine my passions
            for powerlifting and software development to create the site. The
            inspiration for the site came after I signed up for a meet on
            LiftingCast and wanted a glimpse into my competition without having
            to scour OpenPowerlifting. As a result, I began development on the
            Meet Scout tool. This site would not be possible without
            https://www.openpowerlifting.org/, so big thanks to the people who
            put that site together!
          </p>
        </Col>
        <Col className='d-flex justify-content-center align-items-center text-center'>
          <img
            src='aboutPage.jpg'
            className='img-fluid rounded-circle about-image'
            aria-label='image of site creator'
          />
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage;
