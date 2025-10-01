import mongoose from 'mongoose';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      const mongoUri = "mongodb+srv://duynv5548:Duy000.dl@duy.q3nbviw.mongodb.net/movies_db?retryWrites=true&w=majority&appName=movies_db"
      // process.env.MONGODB_URI || 'mongodb://localhost:27017/movies_db';
      // const mogoUrl = "mongodb+srv://duynv5548:Duy000.dl@duy.q3nbviw.mongodb.net/movies_db?retryWrites=true&w=majority&appName=movies_db"
      await mongoose.connect(mongoUri, {
        // Remove deprecated options for newer versions
      });

      this.isConnected = true;
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('Database disconnected');
    } catch (error) {
      console.error('Database disconnection failed:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
