/** @param {import('mongodb').Db} db */
exports.up = async function up(db) {
  const col = db.collection('tickets');
  await col.createIndex({ bookingId: 1 }, { name: 'idx_tickets_bookingId' });
  await col.createIndex({ showtimeId: 1, seatId: 1 }, { unique: true, name: 'uniq_tickets_showtime_seat' });
};

/** @param {import('mongodb').Db} db */
exports.down = async function down(db) {
  const col = db.collection('tickets');
  try { await col.dropIndex('idx_tickets_bookingId'); } catch (_) {}
  try { await col.dropIndex('uniq_tickets_showtime_seat'); } catch (_) {}
};


