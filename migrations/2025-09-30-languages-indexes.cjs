/** @param {import('mongodb').Db} db */
exports.up = async function up(db) {
  const col = db.collection('languages');
  await col.createIndex({ name: 1 }, { unique: true, name: 'uniq_languages_name' });
};

/** @param {import('mongodb').Db} db */
exports.down = async function down(db) {
  try { await db.collection('languages').dropIndex('uniq_languages_name'); } catch (_) {}
};


