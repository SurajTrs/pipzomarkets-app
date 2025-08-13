
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
// Import images (replace with actual image paths if different)
import AwardMobile from '../assets/images/award-mobile.png';
import AwardBroker from '../assets/images/award-trusted.png';
import AwardTrusted from '../assets/images/award-broker.png';

const Awards: React.FC = () => {
  const awards = [
    {
      title: 'Best Mobile Trading Platform 2025',
      image: AwardMobile,
    },
    {
      title: 'Top Broker of the Year',
      image: AwardBroker,
    },
    {
      title: 'Most Trusted Platform',
      image: AwardTrusted,
    },
  ];

  return (
    <section className="awards-section py-5 text-light">
      <Container>
        <h2 className="text-center fw-bold mb-5">Our Achievements</h2>
        <Row className="g-4 justify-content-center">
          {awards.map((award, index) => (
            <Col md={4} sm={6} key={index}>
              <Card className="award-card bg-black text-center h-100 border-0 shadow-sm">
                <Card.Img
                  variant="top"
                  src={award.image}
                  alt={award.title}
                  className="p-4"
                  style={{ height: '180px', objectFit: 'contain' }}
                />
                <Card.Body>
                  <Card.Title className="fw-semibold text-light fs-5">{award.title}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Awards;
