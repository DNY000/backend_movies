import 'dotenv/config'

const config = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/movies_db',
    databaseName: undefined,
    options: {}
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'migrations_changelog',
  migrationFileExtension: '.cjs',
  useFileHash: false
}

export default config


