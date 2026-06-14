import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Product from '../components/Product';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listProducts } from '../actions/productActions';
import { Helmet } from 'react-helmet-async';

const HomeScreen = () => {
  const dispatch = useDispatch();

  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  useEffect(() => {
    dispatch(listProducts());
  }, [dispatch]);

  const featuredProducts = products.filter((product) => product.isFeatured);

  return (
    <>
      <Helmet>
        <title>Girls Fashion - Home</title>
        <meta
          name='description'
          content='Shop the latest trends in girls fashion'
        />
      </Helmet>

      <Carousel className='mb-4'>
        <Carousel.Item>
          <img
            className='d-block w-100'
            src='/images/banner1.jpg'
            alt='First slide'
          />
          <Carousel.Caption>
            <h3>New Collection</h3>
            <p>Discover our latest arrivals</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className='d-block w-100'
            src='/images/banner2.jpg'
            alt='Second slide'
          />
          <Carousel.Caption>
            <h3>Summer Sale</h3>
            <p>Up to 50% off on selected items</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      <h2 className='mb-4'>Featured Products</h2>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <Row>
          {featuredProducts.map((product) => (
            <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
              <Product product={product} />
            </Col>
          ))}
        </Row>
      )}

      <div className='categories mt-5'>
        <h2 className='mb-4'>Shop by Category</h2>
        <Row>
          <Col md={4} className='mb-4'>
            <Link to='/category/dresses' className='category-card'>
              <img src='/images/dresses.jpg' alt='Dresses' />
              <h3>Dresses</h3>
            </Link>
          </Col>
          <Col md={4} className='mb-4'>
            <Link to='/category/tops' className='category-card'>
              <img src='/images/tops.jpg' alt='Tops' />
              <h3>Tops</h3>
            </Link>
          </Col>
          <Col md={4} className='mb-4'>
            <Link to='/category/bottoms' className='category-card'>
              <img src='/images/bottoms.jpg' alt='Bottoms' />
              <h3>Bottoms</h3>
            </Link>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default HomeScreen; 