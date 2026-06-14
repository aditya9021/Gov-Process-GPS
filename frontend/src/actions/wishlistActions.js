import axios from 'axios';
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

export const getWishlist = () => async (dispatch, getState) => {
  try {
    dispatch({ type: WISHLIST_GET_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get('/api/wishlist', config);

    dispatch({
      type: WISHLIST_GET_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: WISHLIST_GET_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const addToWishlist = (productId) => async (dispatch, getState) => {
  try {
    dispatch({ type: WISHLIST_ADD_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(`/api/wishlist/${productId}`, {}, config);

    dispatch({
      type: WISHLIST_ADD_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: WISHLIST_ADD_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const removeFromWishlist = (productId) => async (dispatch, getState) => {
  try {
    dispatch({ type: WISHLIST_REMOVE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.delete(`/api/wishlist/${productId}`, config);

    dispatch({
      type: WISHLIST_REMOVE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: WISHLIST_REMOVE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
}; 