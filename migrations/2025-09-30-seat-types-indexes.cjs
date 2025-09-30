/** @param {import('mongodb').Db} db */
exports.up = async function up(db) {
  const col = db.collection('seat_types');
  await col.createIndex({ code: 1 }, { unique: true, name: 'uniq_seat_types_code' });
};

/** @param {import('mongodb').Db} db */
exports.down = async function down(db) {
  try { await db.collection('seat_types').dropIndex('uniq_seat_types_code'); } catch (_) {}
};


