import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { FaHeart } from 'react-icons/fa';

const Product = ({ product }) => {
  return (
    <Card className='my-3 p-3 rounded'>
      <Link to={`/product/${product._id}`}>
        <Card.Img src={product.images[0]} variant='top' />
      </Link>

      <Card.Body>
        <Link to={`/product/${product._id}`}>
          <Card.Title as='div'>
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as='div'>
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
        </Card.Text>

        <Card.Text as='h3' className='mt-2'>
          ${product.price}
          {product.discount > 0 && (
            <span className='text-danger ms-2'>
              -{product.discount}% off
            </span>
          )}
        </Card.Text>

        <div className='d-flex justify-content-between align-items-center mt-3'>
          <Link
            to={`/product/${product._id}`}
            className='btn btn-primary btn-sm'
          >
            View Details
          </Link>
          <button
            className='btn btn-outline-danger btn-sm'
            onClick={() => {
              // Add to wishlist functionality
            }}
          >
            <FaHeart />
          </button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Product; 