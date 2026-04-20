import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('--- ATTEMPTING MONGODB CONNECTION ---');
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'Present' : 'MISSING');

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ MongoDB Connected Successfully');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Port: ${conn.connection.port}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection FAILED');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    process.exit(1);
  }
};

export default connectDB;
