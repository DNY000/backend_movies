// migrate-mongo configuration for this project
// Uses env var MONGODB_URI or defaults to local 'movies' database
require('dotenv').config();

/** @type {import('migrate-mongo').MigrateMongoConfig} */
const config = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/movies',
    databaseName: undefined, // use db from URL
    options: {}
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'migrations_changelog',
  migrationFileExtension: '.js',
  useFileHash: false
};

module.exports = config;


