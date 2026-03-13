import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set, push, get } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyD3nNq5YNVHvaCmk550NSfuP3LgFsq5Keg",
  authDomain: "otokawa-deploy.firebaseapp.com",
  databaseURL: "https://otokawa-deploy-default-rtdb.firebaseio.com",
  projectId: "otokawa-deploy",
  storageBucket: "otokawa-deploy.firebasestorage.app",
  messagingSenderId: "533759901695",
  appId: "1:533759901695:web:9f7984fc14adf9c665f1ca"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)

export const dbSet    = (path, val) => set(ref(db, path), val)
export const dbPush   = (path, val) => push(ref(db, path), val)
export const dbGet    = (path) => get(ref(db, path))
export const dbListen = (path, callback) => {
  const r = ref(db, path)
  const unsub = onValue(r, (snap) => { callback(snap.val()) })
  return unsub
}
export const initIfEmpty = async (path, defaultVal) => {
  const snap = await dbGet(path)
  if (!snap.exists()) { await dbSet(path, defaultVal) }
}
