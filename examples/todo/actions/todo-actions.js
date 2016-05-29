import actionTypes from '../constants/action-types';

const TodoActions = {
  newTodo(todo) {
    return {
      actionType: actionTypes.ADD_TODO,
      todo,
    };
  },

  deleteTodo(id) {
    return (dispatch) => {
      dispatch({
        actionType: actionTypes.DELETE_TODO,
        id,
      });
    };
  },

  editTodo(id, todo) {
    return {
      actionType: actionTypes.DELETE_TODO,
      id,
      todo,
    };
  },
};

export default TodoActions;
