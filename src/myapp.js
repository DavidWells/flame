import Immutable from 'immutable';
import ImmutableHistory from './immutable-history';

import Dispatcher from './dispatcher';

class App {
  constructor(...stores) {
    this._dispatcher = new Dispatcher();
    this._history = new ImmutableHistory(Immutable.Map(), this._stateHasChanged);

    this._stores = Immutable.Map(stores.map(Store => {
      const store = new Store(
        this._dispatcher,
        this.getStoreState.bind(this),
        this.setStoreState.bind(this)
      );
      return [store.getStoreId(), store];
    }));

    this._history.freeze();
  }

  _stateHasChanged() {
    if (this._stores) {
      this._stores.get('todo').emit('CHANGE');
    }
  }

  fireAction(actionCreator) {
    actionCreator(this._dispatcher);
  }

  addChangeListeners(listener, storeIds) {
    storeIds.forEach(storeId => {
      const store = this._stores.get(storeId);
      store.addChangeListener(listener);
    });
  }

  removeChangeListeners(listener, storeIds) {
    storeIds.forEach(storeId => {
      const store = this._stores.get(storeId);
      store.removeChangeListener(listener);
    });
  }

  getAppState() {
    return this._history.cursor;
  }

  getStoreState(id) {
    return this._history.cursor.get(id);
  }

  setStoreState(id, state) {
    this._history.cursor.set(id, state);
  }

  redo() {
    this._history.redo();
    this._stores.get('todo').emit('CHANGE');
  }

  undo() {
    this._history.undo();
    this._stores.get('todo').emit('CHANGE');
  }

  canRedo() {
    return this._history.canRedo();
  }

  canUndo() {
    return this._history.canUndo();
  }
}

export default App;
