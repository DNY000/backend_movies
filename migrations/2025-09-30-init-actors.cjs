/** @param {import('mongodb').Db} db */
exports.up = async function up(db) {
  const collectionName = 'actors';
  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length === 0) {
    await db.createCollection(collectionName);
  }
  await db.collection(collectionName).createIndex({ name: 1 }, { name: 'idx_actors_name' });
};

/** @param {import('mongodb').Db} db */
exports.down = async function down(db) {
  const collectionName = 'actors';
  try { await db.collection(collectionName).dropIndex('idx_actors_name'); } catch (_) {}
};


