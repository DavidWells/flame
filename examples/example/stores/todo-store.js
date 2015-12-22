import Immutable from 'immutable';

import actionTypes from '../constants/action-types';
import Flame from 'flame';

class TodoStore extends Flame.BaseStore {
  constructor(...args) {
    super(...args);

    this._bindActionHandlers();
  }

  getStoreId() {
    return 'todo';
  }

  getInitialState() {
    return Immutable.List([]);
  }

  _getActionHandlers() {
    const actionHandlers = super._getActionHandlers();

    return Object.assign(actionHandlers, {
      [actionTypes.ADD_TODO]: this._handleAddTodo,
    });
  }

  _handleAddTodo(action, state) {
    return state.push(action.todo);
  }
}

export default TodoStore;
