export const databaseConfig = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/movies_db',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  }
};
