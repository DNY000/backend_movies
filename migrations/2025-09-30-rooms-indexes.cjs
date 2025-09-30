/** @param {import('mongodb').Db} db */
exports.up = async function up(db) {
  const col = db.collection('rooms');
  await col.createIndex({ cinemaId: 1 }, { name: 'idx_rooms_cinemaId' });
};

/** @param {import('mongodb').Db} db */
exports.down = async function down(db) {
  try { await db.collection('rooms').dropIndex('idx_rooms_cinemaId'); } catch (_) {}
};


