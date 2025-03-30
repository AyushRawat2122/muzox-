const DBname = "recentlyPlayedMusic";
const storeName = "songs";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DBname, 1);
    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
        store.createIndex("playedAt", "playedAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const saveInIDB = async (songObj) => {
  const db = await openDB();

  await new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const getAllReq = store.getAll();
    getAllReq.onsuccess = () => {
      const songs = getAllReq.result;
      console.log(songs," hshhhshhshhs")
      const existingSong = songs.find(s => s.title === songObj.title);
      
      if (existingSong) {
        existingSong.playedAt = Date.now();
        const updateReq = store.put(existingSong);
        updateReq.onsuccess = () => resolve();
        updateReq.onerror = () => reject(updateReq.error);
      } else {
        const newSong = { ...songObj, playedAt: Date.now() };
        const addReq = store.add(newSong);
        addReq.onsuccess = () => resolve();
        addReq.onerror = () => reject(addReq.error);
      }
    };
    getAllReq.onerror = () => reject(getAllReq.error);
  });

  await new Promise(async (resolve, reject) => {
    try {
      const db2 = await openDB();
      const tx = db2.transaction(storeName, "readwrite");
      const store2 = tx.objectStore(storeName);
      const getAllReq2 = store2.getAll();
      getAllReq2.onsuccess = () => {
        const allSongs = getAllReq2.result;
        if (allSongs.length > 30) {
          allSongs.sort((a, b) => a.playedAt - b.playedAt);
          const oldestSong = allSongs[0];
          const deleteReq = store2.delete(oldestSong.id);
          deleteReq.onsuccess = () => resolve();
          deleteReq.onerror = () => reject(deleteReq.error);
        } else {
          resolve();
        }
      };
      getAllReq2.onerror = () => reject(getAllReq2.error);
    } catch (error) {
      reject(error);
    }
  });
};

const getRecentSongs = async () => {
  const db = await openDB();
  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  const index = store.index("playedAt");

  return new Promise((resolve, reject) => {
    const req = index.openCursor(null, "prev");
    const songs = [];
    req.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor && songs.length < 20) {
        songs.push(cursor.value);
        cursor.continue();
      } else {
        resolve(songs);
      }
    };
    req.onerror = () => reject(req.error);
  });
};

let debounceTimer;

const searchWithDebounce = (query, callback) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const db = await openDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const results = [];
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.name.toLowerCase().includes(query.toLowerCase())) {
          results.push(cursor.value);
        }
        cursor.continue();
      } else {
        callback(results);
      }
    };

    request.onerror = () => callback([]);
  }, 600);
};

export {
  saveInIDB,
  getRecentSongs,
  searchWithDebounce
};
