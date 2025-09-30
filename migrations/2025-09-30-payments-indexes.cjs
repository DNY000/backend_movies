/** @param {import('mongodb').Db} db */
exports.up = async function up(db) {
  const col = db.collection('payments');
  await col.createIndex({ bookingId: 1 }, { name: 'idx_payments_bookingId' });
};

/** @param {import('mongodb').Db} db */
exports.down = async function down(db) {
  try { await db.collection('payments').dropIndex('idx_payments_bookingId'); } catch (_) {}
};


