/** @param {import('mongodb').Db} db */
exports.up = async function up(db) {
  const col = db.collection('genres');
  await col.createIndex({ name: 1 }, { unique: true, name: 'uniq_genres_name' });
};

/** @param {import('mongodb').Db} db */
exports.down = async function down(db) {
  try {
    await db.collection('genres').dropIndex('uniq_genres_name');
  } catch (_) {}
};


