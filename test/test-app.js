import 'babel-register';

import Immutable from 'immutable';

import test from 'ava';
import sinon from 'sinon';

import App from '../src/app';
import TestStore from './helpers/test-store';
import TestTwoStore from './helpers/test-two-store';


test('app instantiates with default state', t => {
  const app = new App({
    id: 'test',
    stores: [
      TestStore,
      TestTwoStore,
    ],
  });

  const appState = app.getState();
  t.ok(Immutable.is(appState, Immutable.fromJS({
    'testState': [],
    'testTwoState': [],
  })));
});

test('getStateFromStores returns only requested state', t => {
  const app = new App({
    id: 'test',
    stores: [
      TestStore,
      TestTwoStore,
    ],
  });

  const state = app.getStateFromStores(['test']);

  t.ok(Immutable.is(state, Immutable.fromJS({
    'testState': [],
  })));
});

test('getStateFromStores errors on unknown store', t => {
  const app = new App({
    id: 'test',
    stores: [TestStore],
  });

  t.throws(() => {
    app.getStateFromStores(['non-existent']);
  }, `Unknown store with id 'non-existent'`);
});

test('_setStoreState sets state', t => {
  const app = new App({
    id: 'test',
    stores: [TestStore],
  });

  app._setStoreState('test', Immutable.fromJS(['new-item']));
  const storeState = app._getStoreState('test');
  t.ok(Immutable.is(storeState, Immutable.fromJS(['new-item'])));
});

test('_setStoreState throws error when it lacks a store', t => {
  const app = new App({
    id: 'test',
    stores: [TestStore],
  });

  t.plan(1);

  app._setStoreState('test', Immutable.fromJS(['new-item']));
  t.throws(() => app._getStoreState('not-in-there'));
});

test('app handles subscription and unsubscription EventEmitter lifecycle cleanly', t => {
  const app = new App({
    id: 'test',
    stores: [TestStore],
  });

  sinon.spy(app, 'removeListener');
  sinon.spy(app, 'on');
  const cb = () => null;
  t.plan(8);

  app.subscribe(cb);

  t.true(app.on.calledOnce);
  t.is(app.on.getCall(0).args[0], 'CHANGE');
  t.is(app.on.getCall(0).args[1], cb);
  t.is(app.listenerCount('CHANGE'), 1);

  app.unsubscribe(cb);

  t.true(app.removeListener.calledOnce);
  t.is(app.removeListener.getCall(0).args[0], 'CHANGE');
  t.is(app.removeListener.getCall(0).args[1], cb);
  t.is(app.listenerCount('CHANGE'), 0);
});

test('dispatch dispatches object', t => {
  const app = new App({
    id: 'test',
    stores: [TestStore],
  });

  app._dispatcher.handleAction = action => {
    t.ok(action.actionType === 'test');
    t.ok(action.data === 'someData');
  };

  t.plan(2);

  app.dispatch({
    actionType: 'test',
    data: 'someData',
  });
});

test('dispatch calls actionCreator with expected inputs', t => {
  const app = new App({
    id: 'test',
    stores: [TestStore],
  });

  t.plan(2);

  app.dispatch((dispatch, state) => {
    t.ok(typeof dispatch === 'function');
    t.ok(Immutable.is(state, Immutable.fromJS({
      testState: [],
    })));
  });
});

test('middleware called during dispatch', t => {
  t.plan(3);

  const testMiddleware = (action, state) => {
    t.ok(action.actionType === 'test');
    t.ok(action.data === 'someData');
    t.ok(Immutable.is(state, Immutable.fromJS({
      testState: [],
    })));
  };

  const app = new App({
    id: 'test',
    stores: [TestStore],
    middleware: [testMiddleware],
  });

  app.dispatch({
    actionType: 'test',
    data: 'someData',
  });
});


test('_setStoreState calls subscribed callbacks', t => {
  const app = new App({
    id: 'test',
    stores: [TestStore],
  });

  t.plan(1);

  app.subscribe(() => {
    t.pass();
  });

  app._setStoreState('test', Immutable.fromJS(['new-item']));
});


test('test persistState saves persisted stores', t => {
  const storage = {
    setItem(key, data) {
      t.is(key, 'flame.stores');
      t.is(data, JSON.stringify({
        test: [],
      }));
    },
  };

  t.plan(2);

  const app = new App({
    id: 'test',
    stores: [
      [TestStore, {persist: true}],
    ],
    storage,
  });

  app.persistState();
});

test('_setStoreState auto persists stores', t => {
  const storage = {
    setItem(key, data) {
      t.is(key, 'flame.stores');
      t.is(data, JSON.stringify({
        test: ['new-item'],
      }));
    },
  };

  const app = new App({
    id: 'test',
    stores: [
      [TestStore, {persist: true}],
    ],
    storage,
  });

  t.plan(2);

  app._setStoreState('test', Immutable.fromJS(['new-item']));
});


test('loadState', t => {
  const storage = {
    getItem(key) {
      t.is(key, 'flame.stores');
      return JSON.stringify({
        test: [{a: 1, b: 2}],
      });
    },
  };

  t.plan(3);

  const app = new App({
    id: 'test',
    stores: [
      [TestStore, {persist: true}],
    ],
    storage,
  });

  app.subscribe(() => {
    t.pass();
  });

  return app.loadState().then(() => {
    const appState = app.getState();
    t.ok(Immutable.is(appState, Immutable.fromJS({
      'testState': [{a: 1, b: 2}],
    })));
  });
});


test('resetState', t => {
  t.plan(2);

  const app = new App({
    id: 'test',
    stores: [TestStore],
  });
  app._setStoreState('test', Immutable.fromJS(['new-item']));

  app.subscribe(() => {
    t.pass();
  });
  app.resetState(['test']);
  const appState = app.getState();
  t.ok(Immutable.is(appState, Immutable.fromJS({
    'testState': [],
  })));
});
