const DBname = "recentlyPlayedMusic";
const storeName = "songs";

function openDB() {
    return new Promise((resolve, reject) => {
        let req = indexedDB.open(DBname, 1);
        req.onupgradeneeded = function (params) {
            let db = params.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                let store = db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
                store.createIndex("playedAt", "playedAt", { unique: false });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

const saveInIDB = async (song) => {
    const db = await openDB();
    let transaction = db.transaction(storeName, "readwrite"); 
    let store = transaction.objectStore(storeName);

    let recentSongs = await getRecentSongs();
    let existingSong = recentSongs.find(s => s.name === song);

    return new Promise((resolve, reject) => {
        if (existingSong) {
            existingSong.playedAt = Date.now();
            let updateReq = store.put(existingSong);
            updateReq.onsuccess = () => resolve();
            updateReq.onerror = () => reject(updateReq.error);
        } else {
            let newSong = { name: song, playedAt: Date.now() };
            let addReq = store.add(newSong);
            addReq.onsuccess = async () => {
                if (recentSongs.length >= 30) {
                    let oldestSong = recentSongs[recentSongs.length - 1];
                    if (oldestSong?.id) {
                        store.delete(oldestSong.id);
                    }
                }
                resolve();
            };
            addReq.onerror = () => reject(addReq.error);
        }
    });
};

const getRecentSongs = async () => {
    let db = await openDB();
    let transaction = db.transaction(storeName, "readonly"); 
    let store = transaction.objectStore(storeName);
    let index = store.index("playedAt");

    return new Promise((resolve, reject) => {
        let req = index.openCursor(null, "prev"); 
        let songs = [];
        req.onsuccess = (e) => {
            let cursor = e.target.result;
            if (cursor && songs.length < 10) {
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
        let db = await openDB();
        let tx = db.transaction(storeName, "readonly");
        let store = tx.objectStore(storeName);

        let results = [];
        let request = store.openCursor();

        request.onsuccess = function (event) {
            let cursor = event.target.result;
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
    getRecentSongs,
    searchWithDebounce
}
