const Actions = {
  persistStores() {
    return (dispatchAction) => {
      dispatchAction({
        actionType: 'FLAME_PERSIST_STORES',
      });
    };
  },
};

export default Actions;
