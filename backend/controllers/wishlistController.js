import asyncHandler from 'express-async-handler';
import Wishlist from '../models/wishlistModel.js';
import Product from '../models/productModel.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    'products.product',
    'name image price'
  );

  if (wishlist) {
    res.json(wishlist.products);
  } else {
    res.json([]);
  }
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = new Wishlist({
      user: req.user._id,
      products: [],
    });
  }

  const productExists = wishlist.products.find(
    (p) => p.product.toString() === productId
  );

  if (productExists) {
    res.status(400);
    throw new Error('Product already in wishlist');
  }

  wishlist.products.push({ product: productId });
  await wishlist.save();

  res.status(201).json({ message: 'Product added to wishlist' });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (wishlist) {
    const productIndex = wishlist.products.findIndex(
      (p) => p.product.toString() === req.params.id
    );

    if (productIndex !== -1) {
      wishlist.products.splice(productIndex, 1);
      await wishlist.save();
      res.json({ message: 'Product removed from wishlist' });
    } else {
      res.status(404);
      throw new Error('Product not found in wishlist');
    }
  } else {
    res.status(404);
    throw new Error('Wishlist not found');
  }
});

export { getWishlist, addToWishlist, removeFromWishlist }; 