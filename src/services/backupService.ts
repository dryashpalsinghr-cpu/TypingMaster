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
    // Opening a missing database without a version would create an empty v1
    // database. Abort that upgrade so backup/count never corrupts a fresh app.
    req.onupgradeneeded = () => req.transaction?.abort();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB database not found: " + name));
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
      const names = infos.map((i) => i.name).filter((n): n is string => !!n).filter((n) => KNOWN_DBS.includes(n));
      if (names.length) return names;
    }
  } catch { /* fall through to known list */ }
  return KNOWN_DBS;
}
export async function exportAll(): Promise<BackupFile> {
  const names = await listDatabaseNames();
  const databases: Record<string, DbDump> = {};
  for (const name of names) {
    let db: IDBDatabase;
    try { db = await openDb(name); } catch { continue; }
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
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith("tg-")) ls[k] = localStorage.getItem(k) ?? ""; } } catch { /* IndexedDB data remains exportable without preferences. */ }
  return { app: "TypeGuru Pro", kind: "backup", formatVersion: 1, createdAt: new Date().toISOString(), databases, localStorage: ls };
}
export async function countAll(): Promise<{ name: string; records: number }[]> {
  const names = await listDatabaseNames();
  const out: { name: string; records: number }[] = [];
  for (const name of names) {
    let db: IDBDatabase;
    try { db = await openDb(name); } catch { continue; }
    const storeNames = Array.from(db.objectStoreNames);
    let total = 0;
    if (storeNames.length) { const tx = db.transaction(storeNames, "readonly"); const counts = await Promise.all(storeNames.map((sn) => reqToPromise(tx.objectStore(sn).count()))); total = counts.reduce((a, b) => a + b, 0); }
    db.close();
    out.push({ name, records: total });
  }
  return out;
}
export function isBackupFile(x: unknown): x is BackupFile {
  const plain = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
  if (!plain(x) || x.app !== "TypeGuru Pro" || x.kind !== "backup" || x.formatVersion !== 1 || !plain(x.databases)) return false;
  if (x.localStorage !== undefined && (!plain(x.localStorage) || Object.values(x.localStorage).some((v) => typeof v !== "string"))) return false;
  return Object.entries(x.databases).every(([name, dump]) => KNOWN_DBS.includes(name) && plain(dump) &&
    Number.isInteger(dump.version) && (dump.version as number) > 0 && plain(dump.stores) &&
    Object.values(dump.stores).every((rows) => Array.isArray(rows) && rows.every(plain)));
}
export async function importAll(file: BackupFile, opts: { clear?: boolean } = {}): Promise<{ dbCount: number; recordCount: number; skipped: string[] }> {
  if (!isBackupFile(file)) throw new Error("Invalid or unsupported TypeGuru backup");
  // Initialize all supported schemas before restoring a fresh device.
  const [{ db }, { examDb }, { analyticsDb }, { gamesDb }] = await Promise.all([
    import("../db/database"), import("../db/examDb"), import("../db/analyticsDb"), import("../db/gamesDb"),
  ]);
  await Promise.all([db.open(), examDb.open(), analyticsDb.open(), gamesDb.open()]);
  const databases = new Map([db, examDb, analyticsDb, gamesDb].map((d) => [d.name, d]));
  // Preflight every database before clearing any existing user records.
  for (const [name, dump] of Object.entries(file.databases)) {
    const target = databases.get(name)!;
    if (dump.version > Math.round(target.verno * 10)) throw new Error("Backup was created by a newer app: " + name);
    const tableNames = new Set(target.tables.map((t) => t.name));
    if (Object.keys(dump.stores).some((s) => !tableNames.has(s))) throw new Error("Unsupported backup table in " + name);
  }
  const clear = opts.clear ?? true;
  let dbCount = 0; let recordCount = 0; const skipped: string[] = [];
  for (const [name, dump] of Object.entries(file.databases)) {
    let db: IDBDatabase;
    try { db = await openDb(name); } catch { skipped.push(name); continue; }
    const existing = Array.from(db.objectStoreNames);
    const targetStores = Object.keys(dump.stores).filter((s) => existing.includes(s));
    if (targetStores.length === 0) { db.close(); skipped.push(name + " (open the app once so its storage exists)"); continue; }
    const tx = db.transaction(targetStores, "readwrite");
    const done = txDone(tx);
    let imported = 0;
    try {
    for (const sn of targetStores) {
      const store = tx.objectStore(sn);
      if (clear) store.clear();
      for (const rec of dump.stores[sn]) { store.put(rec); imported++; }
    }
    await done;
    recordCount += imported;
    dbCount++;
    } catch (error) {
      try { tx.abort(); } catch { /* Already finished. */ }
      await done.catch(() => {});
      throw error;
    } finally { db.close(); }
  }
  try { if (file.localStorage) { for (const [k, v] of Object.entries(file.localStorage)) if (k.startsWith("tg-")) localStorage.setItem(k, v); } } catch { skipped.push("Device preferences (localStorage unavailable)"); }
  return { dbCount, recordCount, skipped };
}
