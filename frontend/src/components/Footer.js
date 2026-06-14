import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className='bg-dark text-light py-4 mt-5'>
      <Container>
        <Row>
          <Col md={4} className='mb-3'>
            <h5>About Us</h5>
            <p>
              Girls Fashion is your one-stop destination for trendy and stylish
              clothing for girls. We offer a wide range of fashionable items at
              affordable prices.
            </p>
          </Col>
          <Col md={4} className='mb-3'>
            <h5>Quick Links</h5>
            <ul className='list-unstyled'>
              <li>
                <a href='/' className='text-light'>
                  Home
                </a>
              </li>
              <li>
                <a href='/products' className='text-light'>
                  Products
                </a>
              </li>
              <li>
                <a href='/about' className='text-light'>
                  About
                </a>
              </li>
              <li>
                <a href='/contact' className='text-light'>
                  Contact
                </a>
              </li>
            </ul>
          </Col>
          <Col md={4} className='mb-3'>
            <h5>Follow Us</h5>
            <div className='social-links'>
              <a href='#' className='text-light me-3'>
                <FaFacebook size={24} />
              </a>
              <a href='#' className='text-light me-3'>
                <FaInstagram size={24} />
              </a>
              <a href='#' className='text-light me-3'>
                <FaTwitter size={24} />
              </a>
              <a href='#' className='text-light'>
                <FaYoutube size={24} />
              </a>
            </div>
          </Col>
        </Row>
        <Row className='mt-3'>
          <Col className='text-center'>
            <p className='mb-0'>
              &copy; {new Date().getFullYear()} Girls Fashion. All rights
              reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 