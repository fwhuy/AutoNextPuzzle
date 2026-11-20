const usesPromiseApi = typeof browser !== 'undefined';
const extensionApi = usesPromiseApi ? browser : chrome;
const storageArea = usesPromiseApi ? extensionApi.storage.local : extensionApi.storage.sync;

const extensionStorage = {
  get(keys, callback) {
    if (usesPromiseApi) {
      const result = storageArea.get(keys);
      if (callback) result.then(callback).catch(error => console.error('Auto-Next storage read failed:', error));
      return result;
    }

    return storageArea.get(keys, callback);
  },

  set(values, callback) {
    if (usesPromiseApi) {
      const result = storageArea.set(values);
      if (callback) result.then(() => callback()).catch(error => console.error('Auto-Next storage write failed:', error));
      else result.catch(error => console.error('Auto-Next storage write failed:', error));
      return result;
    }

    return storageArea.set(values, callback);
  },

  onChanged: extensionApi.storage.onChanged
};
