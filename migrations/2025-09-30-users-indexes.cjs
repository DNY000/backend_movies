/** @param {import('mongodb').Db} db */
exports.up = async function up(db) {
  const col = db.collection('users');
  await col.createIndex({ email: 1 }, { unique: true, name: 'uniq_users_email' });
};

/** @param {import('mongodb').Db} db */
exports.down = async function down(db) {
  try {
    await db.collection('users').dropIndex('uniq_users_email');
  } catch (_) {}
};


