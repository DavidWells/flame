import { EventEmitter } from 'events';
import Log from 'loglevel';


class BaseStore extends EventEmitter {
  constructor(dispatcher, getStoreState, setStoreState, ...args) {
    super(...args);

    this._dispatcher = dispatcher;
    this._getStoreState = getStoreState;
    this._setStoreState = setStoreState;
    this._args = args;

    this._setInitialState();
  }

  emitChange() {
    this.emit('CHANGE');
  }

  addChangeListener(callback) {
    this.on('CHANGE', callback);
  }

  removeChangeListener(callback) {
    this.removeListener('CHANGE', callback);
  }

  getState(state) {
    return state;
  }

  resetState() {
    this._setInitialState();
  }

  _setInitialState() {
    this._setStoreState(this.getStoreId(), this.getInitialState(...this._args));
  }

  _getActionHandlers() {
    return {};
  }

  _bindActionHandlers() {
    const actionHandlers = this._getActionHandlers();
    const that = this;

    function handleAction(action) {
      let handled = false;

      if (action.actionType in actionHandlers) {
        const storeId = that.getStoreId();
        Log.debug(`${storeId} is handling ${action.actionType}`);

        const existingState = that._getStoreState(storeId);
        const updatedState = actionHandlers[action.actionType].call(that, action, existingState);
        that._setStoreState(storeId, updatedState);

        handled = true;
      }

      return handled;
    }

    this.dispatchToken = this._dispatcher.register((payload) => {
      const handled = handleAction(payload.action);
      if (handled) {
        this.emitChange();
      }
    });
  }
}

export default BaseStore;
