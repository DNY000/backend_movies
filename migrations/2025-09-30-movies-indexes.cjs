/** @param {import('mongodb').Db} db */
exports.up = async function up(db) {
  const col = db.collection('movies');
  await col.createIndex({ genres: 1 }, { name: 'idx_movies_genres' });
};

/** @param {import('mongodb').Db} db */
exports.down = async function down(db) {
  try { await db.collection('movies').dropIndex('idx_movies_genres'); } catch (_) {}
};


