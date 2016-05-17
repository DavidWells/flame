import 'babel-register';

import Immutable from 'immutable';

import test from 'ava';
import sinon from 'sinon';

import App from '../src/app';
import TestStore from './helpers/test-store';
import TestTwoStore from './helpers/test-two-store';


test('app instantiates with default state', t => {
  const app = new App('test', [
    TestStore,
    TestTwoStore,
  ]);

  const appState = app.getState();
  t.ok(Immutable.is(appState, Immutable.fromJS({
    'testState': [],
    'testTwoState': [],
  })));
});

test('getStateFromStores returns only requested state', t => {
  const app = new App('test', [
    TestStore,
    TestTwoStore,
  ]);

  const state = app.getStateFromStores(['test']);

  t.ok(Immutable.is(state, Immutable.fromJS({
    'testState': [],
  })));
});

test('getStateFromStores errors on unknown store', t => {
  const app = new App('test', [
    TestStore,
  ]);

  t.throws(() => {
    app.getStateFromStores(['non-existent']);
  }, `Unknown store with id 'non-existent'`);
});

test('_setStoreState sets state', t => {
  const app = new App('test', [
    TestStore,
  ]);

  app._setStoreState('test', Immutable.fromJS(['new-item']));
  const storeState = app._getStoreState('test');
  t.ok(Immutable.is(storeState, Immutable.fromJS(['new-item'])));
});

test('_setStoreState throws error when it lacks a store', t => {
  const app = new App('test', [TestStore]);

  t.plan(1);

  app._setStoreState('test', Immutable.fromJS(['new-item']));
  t.throws(() => app._getStoreState('not-in-there'));
});

test('app handles subscription and unsubscription EventEmitter lifecycle cleanly', t => {
  const app = new App('test', [TestStore]);

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

test('fireActionCreator calls actionCreator with expected inputs', t => {
  const app = new App('test', [
    TestStore,
  ]);

  t.plan(2);

  app.fireActionCreator((dispatchAction, fireActionCreator) => {
    t.ok(typeof dispatchAction === 'function');
    t.ok(typeof fireActionCreator === 'function');
  });
});

test('fireActionCreator provides actionCreator with specified store state', t => {
  const app = new App('test', [
    TestStore,
  ]);

  t.plan(3);

  app.fireActionCreator({
    storeIds: ['test'],
    actionCreator: (dispatchAction, state, fireActionCreator) => {
      t.ok(typeof dispatchAction === 'function');
      t.ok(typeof fireActionCreator === 'function');
      t.ok(Immutable.is(state, Immutable.fromJS({
        testState: [],
      })));
    },
  });
});

test('_setStoreState calls subscribed callbacks', t => {
  const app = new App('test', [
    TestStore,
  ]);

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

  const app = new App('test', [
    [TestStore, {persist: true}],
  ], storage);

  app.persistState();
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

  t.plan(2);

  const app = new App('test', [
    [TestStore, {persist: true}],
  ], storage);

  return app.loadState().then(() => {
    const appState = app.getState();
    t.ok(Immutable.is(appState, Immutable.fromJS({
      'testState': [{a: 1, b: 2}],
    })));
  });
});
