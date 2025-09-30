/** @param {import('mongodb').Db} db */
exports.up = async function up(db) {
  const col = db.collection('cinemas');
  await col.createIndex({ name: 1 }, { name: 'idx_cinemas_name' });
};

/** @param {import('mongodb').Db} db */
exports.down = async function down(db) {
  try { await db.collection('cinemas').dropIndex('idx_cinemas_name'); } catch (_) {}
};


