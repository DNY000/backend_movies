/** @param {import('mongodb').Db} db */
exports.up = async function up(db) {
  const col = db.collection('bookings');
  const existing = await col.indexes();
  const hasUserIdIndex = existing.some(ix => JSON.stringify(ix.key) === JSON.stringify({ userId: 1 }));
  if (!hasUserIdIndex) {
    await col.createIndex({ userId: 1 }, { name: 'idx_bookings_userId' });
  }
};

/** @param {import('mongodb').Db} db */
exports.down = async function down(db) {
  try { await db.collection('bookings').dropIndex('idx_bookings_userId'); } catch (_) {}
};


