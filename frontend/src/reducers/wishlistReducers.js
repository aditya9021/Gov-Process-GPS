import {
  WISHLIST_GET_REQUEST,
  WISHLIST_GET_SUCCESS,
  WISHLIST_GET_FAIL,
  WISHLIST_ADD_REQUEST,
  WISHLIST_ADD_SUCCESS,
  WISHLIST_ADD_FAIL,
  WISHLIST_REMOVE_REQUEST,
  WISHLIST_REMOVE_SUCCESS,
  WISHLIST_REMOVE_FAIL,
} from '../constants/wishlistConstants';

export const wishlistReducer = (state = { products: [] }, action) => {
  switch (action.type) {
    case WISHLIST_GET_REQUEST:
      return { loading: true, products: [] };
    case WISHLIST_GET_SUCCESS:
      return { loading: false, products: action.payload.products };
    case WISHLIST_GET_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const wishlistAddReducer = (state = {}, action) => {
  switch (action.type) {
    case WISHLIST_ADD_REQUEST:
      return { loading: true };
    case WISHLIST_ADD_SUCCESS:
      return { loading: false, success: true };
    case WISHLIST_ADD_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const wishlistRemoveReducer = (state = {}, action) => {
  switch (action.type) {
    case WISHLIST_REMOVE_REQUEST:
      return { loading: true };
    case WISHLIST_REMOVE_SUCCESS:
      return { loading: false, success: true };
    case WISHLIST_REMOVE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
}; 