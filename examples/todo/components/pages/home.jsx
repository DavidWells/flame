import ImmutableProptypes from 'react-immutable-proptypes';
import React from 'react';
import TodoActions from '../../actions/todo-actions';
import {appProviderMixin} from 'flame';

import TodoItem from '../partials/todo-item.jsx';


const Home = React.createClass({
  mixins: [
    appProviderMixin,
  ],

  propTypes: {
    appState: ImmutableProptypes.map,
  },

  getInitialState() {
    return {
      todoInput: '',
    };
  },

  _handleOnChange(event) {
    this.setState({
      todoInput: event.target.value,
    });
  },

  _handleOnClick() {
    const {todoInput} = this.state;

    this.context.app.fireActionCreator(
      TodoActions.newTodo(todoInput)
    );
  },

  _persist() {
    this.context.app.persistState();
  },

  render() {
    const {appState} = this.props;
    const todoState = appState.get('todoState');

    const {todoInput} = this.state;

    return (
      <div>
        <button onClick={this._persist}>Persist</button>
        <h1>Todos</h1>
        <div>
          <input
            onChange={this._handleOnChange}
            placeholder="What needs to be done?"
            value={todoInput}
          />
          <button onClick={this._handleOnClick}>add todo</button>
          <ul>
            {todoState.map((todoItemState, index) => {
              return (
                <TodoItem key={index} todoItemState={todoItemState} />
              );
            })}
          </ul>
        </div>
      </div>
    );
  },
});

export default Home;
