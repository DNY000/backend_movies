/** @param {import('mongodb').Db} db */
exports.up = async function up(db) {
  const col = db.collection('notifications');
  await col.createIndex({ userId: 1 }, { name: 'idx_notifications_userId' });
  await col.createIndex({ isRead: 1 }, { name: 'idx_notifications_isRead' });
};

/** @param {import('mongodb').Db} db */
exports.down = async function down(db) {
  const col = db.collection('notifications');
  try { await col.dropIndex('idx_notifications_userId'); } catch (_) {}
  try { await col.dropIndex('idx_notifications_isRead'); } catch (_) {}
};


