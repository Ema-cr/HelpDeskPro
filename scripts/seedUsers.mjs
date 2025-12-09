// Script to seed initial users for testing
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdeskpro';

console.log('🔗 Connecting to MongoDB...');
console.log('URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

// Define User Schema inline
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['client', 'agent'], default: 'client', required: true }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function seedUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});

    // Check if users already exist
    const existingAgents = await User.find({ role: 'agent' });
    const existingClients = await User.find({ role: 'client' });

    if (existingAgents.length > 0) {
      console.log('ℹ️  Agents already exist, skipping agent creation');
    } else {
      // Create agents
      const agentPassword = await hashPassword('agent123');
      await User.create({
        name: 'John Agent',
        email: 'agent@helpdeskpro.com',
        password: agentPassword,
        role: 'agent',
      });

      await User.create({
        name: 'Jane Support',
        email: 'support@helpdeskpro.com',
        password: agentPassword,
        role: 'agent',
      });
      console.log('✅ Agents created');
    }

    if (existingClients.length > 0) {
      console.log('ℹ️  Clients already exist, skipping client creation');
    } else {
      // Create clients
      const clientPassword = await hashPassword('client123');
      await User.create({
        name: 'Alice Client',
        email: 'alice@example.com',
        password: clientPassword,
        role: 'client',
      });

      await User.create({
        name: 'Bob Customer',
        email: 'bob@example.com',
        password: clientPassword,
        role: 'client',
      });
      console.log('✅ Clients created');
    }

    console.log('\n✅ Users created successfully:');
    console.log('Agents:');
    console.log('  - agent@helpdeskpro.com / agent123');
    console.log('  - support@helpdeskpro.com / agent123');
    console.log('Clients:');
    console.log('  - alice@example.com / client123');
    console.log('  - bob@example.com / client123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedUsers();
