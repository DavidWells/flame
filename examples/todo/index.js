import Log from 'loglevel';
import React from 'react';
import ReactDOM from 'react-dom';

import {App, Provider} from 'flame';

import log from './middleware/log';
import Home from './components/pages/home.jsx';
import TodoStore from './stores/todo-store';

Log.setLevel(Log.levels.TRACE);

const app = new App({
  id: 'app',
  middleware: [log],
  stores: [
    [TodoStore, {persist: true}],
  ],
  storage: window.localStorage,
});

app.loadState().then(() => {
  ReactDOM.render(
    <Provider app={app}>
      <Home />
    </Provider>,
    document.getElementById('root')
  );
});
