import Immutable from 'immutable';

import actionTypes from '../constants/action-types';
import {BaseStore} from 'flame';

class TodoStore extends BaseStore {
  getStoreId() {
    return 'movie';
  }

  getInitialState() {
    return Immutable.fromJS({
      movies: {},
      status: 'unloaded',
    });
  }

  getHandlers() {
    return {
      [actionTypes.FETCH_MOVIE_PENDING]: this._handleFetchMoviePending,
      [actionTypes.FETCH_MOVIE_SUCCESS]: this._handleFetchMovieSuccess,
      [actionTypes.FETCH_MOVIE_ERROR]: this._handleFetchMovieError,
      [actionTypes.FETCH_MOVIES_PENDING]: this._handleFetchMoviesPending,
      [actionTypes.FETCH_MOVIES_SUCCESS]: this._handleFetchMoviesSuccess,
      [actionTypes.FETCH_MOVIES_ERROR]: this._handleFetchMoviesError,
    };
  }

  _handleFetchMoviePending(action, state) {
    const {id} = action;

    return state.setIn(['movies', id], Immutable.fromJS({
      id,
      movie: null,
      status: 'pending',
    }));
  }

  _handleFetchMovieSuccess(action, state) {
    const {id, movie} = action;

    return state.setIn(['movies', id], Immutable.fromJS({
      id,
      movie,
      status: 'success',
    }));
  }

  _handleFetchMovieError(action, state) {
    const {id, error} = action;

    return state.setIn(['movies', id], Immutable.fromJS({
      id,
      error,
      status: 'error',
    }));
  }

  _handleFetchMoviesPending(action, state) {
    return state.set('status', 'pending');
  }

  _handleFetchMoviesSuccess(action, state) {
    return state.set('status', 'success');
  }

  _handleFetchMoviesError(action, state) {
    return state.merge({
      status: 'pending',
      error: action.error,
    });
  }

}

export default TodoStore;
