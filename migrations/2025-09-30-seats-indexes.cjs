/** @param {import('mongodb').Db} db */
exports.up = async function up(db) {
  const col = db.collection('seats');
  await col.createIndex({ roomId: 1 }, { name: 'idx_seats_roomId' });
  await col.createIndex({ roomId: 1, seatRow: 1, seatNumber: 1 }, { unique: true, name: 'uniq_seats_room_row_number' });
};

/** @param {import('mongodb').Db} db */
exports.down = async function down(db) {
  const col = db.collection('seats');
  try { await col.dropIndex('idx_seats_roomId'); } catch (_) {}
  try { await col.dropIndex('uniq_seats_room_row_number'); } catch (_) {}
};


