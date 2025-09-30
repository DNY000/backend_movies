/** @param {import('mongodb').Db} db */
exports.up = async function up(db) {
  const col = db.collection('showtimes');
  await col.createIndex({ movieId: 1, startTime: 1 }, { name: 'idx_showtimes_movie_start' });
};

/** @param {import('mongodb').Db} db */
exports.down = async function down(db) {
  try { await db.collection('showtimes').dropIndex('idx_showtimes_movie_start'); } catch (_) {}
};


