// 用随仓 seed 重建内容库 (清空重灌, 不做增量)。
// 与「空库首次启动」走的是 lib/cms/db.ts 里的同一个 importSeed, 不会漂移。
import { DB_PATH, countDocs, getDb, importSeed, migrate } from '@/lib/cms/db';

const db = getDb();
migrate(db);
importSeed(db);

const docs = countDocs(db);
const metas = (
  db.prepare('SELECT count(*) AS n FROM navigation').get() as { n: number }
).n;
console.log(`imported ${docs} docs + ${metas} metas -> ${DB_PATH}`);
