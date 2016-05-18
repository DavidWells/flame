import { EventEmitter } from 'events';
import Immutable from 'immutable';
import debounce from 'lodash.debounce';

import Dispatcher from './dispatcher';

class App extends EventEmitter {
  constructor(id, stores, storage) {
    super(id, stores);
    this.persistState = debounce(this.persistState, 200, {
      'leading': true,
      'trailing': false,
    });

    this._id = id;
    this._storage = storage;
    this._dispatcher = new Dispatcher();
    this._state = Immutable.Map();

    this._stores = Immutable.Map(stores.map(storeData => {
      let config = {};
      let Store = storeData;

      if (Array.isArray(storeData)) {
        [Store, config] = storeData;
      }

      const store = new Store(
        this._dispatcher,
        this._getStoreState.bind(this),
        this._setStoreState.bind(this),
        config
      );
      return [store.getStoreId(), store];
    }));
  }

  /**
   * Returns a cursor into the app's state
   *
   * @returns {Immutable Cursor}.
   */
  getState() {
    return Immutable.Map(this._stores.keySeq().map(storeId => {
      return [`${storeId}State`, this._getStoreState(storeId)];
    }));
  }

  /**
   * Subscribes a function to any change in app state
   *
   * @params {function} the callback.
   */
  subscribe(callback) {
    this.on('CHANGE', callback);
  }

  /**
   * Unsubscribes a function to any change in app state
   *
   * @params {function} the callback.
   */
  unsubscribe(callback) {
    this.removeListener('CHANGE', callback);
  }

  /**
   * Returns an Immutable Map of a given set of store's state keyed by the store's ID
   *
   * @params {array} an array of store ids.
   *
   * @returns {Immutable.Map} a map of the store's state.
   */
  getStateFromStores(ids) {
    ids.forEach(id => {
      if (!this._stores.has(id)) {
        throw new Error(`Unknown store with id '${id}'`);
      }
    });

    return Immutable.Map(ids.map(storeId => {
      return [`${storeId}State`, this._getStoreState(storeId)];
    }));
  }

  /**
   * Fire's a given action creator, providing that action creator
   * with a a function to actually dispatch the action, the current state of the app,
   * and a reference to this function to call additional action creators.
   *
   * @params {actionCreator} the action creator to call.
   */
  fireActionCreator(actionCreator) {
    const dispatchAction = this._dispatcher.handleAction.bind(this._dispatcher);
    const boundFireActionCreator = this.fireActionCreator.bind(this);

    let ret;
    if (typeof actionCreator === 'function') {
      ret = actionCreator(dispatchAction, boundFireActionCreator);
    } else {
      const storeIds = actionCreator.storeIds;
      const state = this.getStateFromStores(storeIds);
      const func = actionCreator.actionCreator;
      ret = func(dispatchAction, state, boundFireActionCreator);
    }

    return ret;
  }

  resetState(storeIds) {
    storeIds.forEach(storeId => {
      const store = this._stores.get(storeId);
      this._state = this._state.set(storeId, store.getInitialState());
    });

    this.emit('CHANGE');
  }

  persistState() {
    if (!this._storage) {
      throw new Error('No storage provided. App should be provided with a storage object');
    }

    const idsToPersist = this._stores.filter(
      store => {
        return store.config.persist;
      }
    ).keySeq();

    if (!idsToPersist.size) {
      return;
    }

    const data = this._state.filter(
      (store, storeId) => idsToPersist.includes(storeId)
    );

    this._storage.setItem('flame.stores', JSON.stringify(data.toJS()));
  }

  loadState() {
    let getItem = this._storage.getItem;

    if (!getItem.then) {
      getItem = (key) => new Promise(resolve => {
        resolve(this._storage.getItem(key));
      });
    }

    return new Promise(resolve => {
      getItem('flame.stores').then(data => {
        if (data) {
          const immutableData = Immutable.fromJS(JSON.parse(data));
          immutableData.map((storeData, storeId) => {
            this._state = this._state.set(storeId, storeData);
          });
        }

        resolve();
      });
    });
  }

  _getStoreState(id, raw = false) {
    if (!this._stores.has(id)) {
      throw new Error(`Unknown store with id '${id}'`);
    }

    const store = this._stores.get(id);
    let state = this._state.get(id);
    if (store.getState && !raw) {
      state = store.getState(state);
    }
    return state;
  }

  _setStoreState(id, state) {
    this._state = this._state.set(id, state);
    this.emit('CHANGE');

    if (this._stores) {
      const store = this._stores.get(id);
      const persistStore = store.config.persist;
      const autoPersist = (store.config.autoPersist || store.config.autoPersist === undefined);
      if (persistStore && autoPersist) {
        this.persistState();
      }
    }
  }
}

export default App;
