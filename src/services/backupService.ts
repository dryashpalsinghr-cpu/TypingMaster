// Whole-app backup / restore using the raw IndexedDB API so no existing module
// needs to be imported or overwritten. Works across ALL TypeGuru databases.
const KNOWN_DBS = ["typeguru-pro-db", "typeguru-exam-db", "typeguru-analytics-db", "typeguru-games-db"];
export interface DbDump { version: number; stores: Record<string, unknown[]>; }
export interface BackupFile {
  app: "TypeGuru Pro";
  kind: "backup";
  formatVersion: number;
  createdAt: string;
  databases: Record<string, DbDump>;
  localStorage: Record<string, string>;
}
function openDb(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("IndexedDB open blocked for " + name));
  });
}
function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
}
function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); });
}
export async function listDatabaseNames(): Promise<string[]> {
  try {
    if (typeof indexedDB.databases === "function") {
      const infos = await indexedDB.databases();
      const names = infos.map((i) => i.name).filter((n): n is string => !!n).filter((n) => n.startsWith("typeguru-"));
      if (names.length) return names;
    }
  } catch { /* fall through to known list */ }
  return KNOWN_DBS;
}
export async function exportAll(): Promise<BackupFile> {
  const names = await listDatabaseNames();
  const databases: Record<string, DbDump> = {};
  for (const name of names) {
    const db = await openDb(name);
    const storeNames = Array.from(db.objectStoreNames);
    const dump: DbDump = { version: db.version, stores: {} };
    if (storeNames.length) {
      const tx = db.transaction(storeNames, "readonly");
      const arrays = await Promise.all(storeNames.map((sn) => reqToPromise(tx.objectStore(sn).getAll())));
      storeNames.forEach((sn, i) => { dump.stores[sn] = arrays[i]; });
    }
    db.close();
    databases[name] = dump;
  }
  const ls: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k) ls[k] = localStorage.getItem(k) ?? ""; }
  return { app: "TypeGuru Pro", kind: "backup", formatVersion: 1, createdAt: new Date().toISOString(), databases, localStorage: ls };
}
export async function countAll(): Promise<{ name: string; records: number }[]> {
  const names = await listDatabaseNames();
  const out: { name: string; records: number }[] = [];
  for (const name of names) {
    const db = await openDb(name);
    const storeNames = Array.from(db.objectStoreNames);
    let total = 0;
    if (storeNames.length) { const tx = db.transaction(storeNames, "readonly"); const counts = await Promise.all(storeNames.map((sn) => reqToPromise(tx.objectStore(sn).count()))); total = counts.reduce((a, b) => a + b, 0); }
    db.close();
    out.push({ name, records: total });
  }
  return out;
}
export function isBackupFile(x: unknown): x is BackupFile {
  const f = x as Partial<BackupFile> | null;
  return !!f && f.app === "TypeGuru Pro" && f.kind === "backup" && typeof f.databases === "object";
}
export async function importAll(file: BackupFile, opts: { clear?: boolean } = {}): Promise<{ dbCount: number; recordCount: number; skipped: string[] }> {
  const clear = opts.clear ?? true;
  let dbCount = 0; let recordCount = 0; const skipped: string[] = [];
  for (const [name, dump] of Object.entries(file.databases)) {
    let db: IDBDatabase;
    try { db = await openDb(name); } catch { skipped.push(name); continue; }
    const existing = Array.from(db.objectStoreNames);
    const targetStores = Object.keys(dump.stores).filter((s) => existing.includes(s));
    if (targetStores.length === 0) { db.close(); skipped.push(name + " (open the app once so its storage exists)"); continue; }
    const tx = db.transaction(targetStores, "readwrite");
    for (const sn of targetStores) {
      const store = tx.objectStore(sn);
      if (clear) store.clear();
      for (const rec of dump.stores[sn]) { store.put(rec); recordCount++; }
    }
    await txDone(tx);
    db.close();
    dbCount++;
  }
  if (file.localStorage) { for (const [k, v] of Object.entries(file.localStorage)) localStorage.setItem(k, v); }
  return { dbCount, recordCount, skipped };
}
