// Script to seed initial users for testing
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import { hashPassword } from '../src/lib/auth.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdeskpro';

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});

    // Create agents
    const agentPassword = await hashPassword('agent123');
    const agent1 = await User.create({
      name: 'John Agent',
      email: 'agent@helpdeskpro.com',
      password: agentPassword,
      role: 'agent',
    });

    const agent2 = await User.create({
      name: 'Jane Support',
      email: 'support@helpdeskpro.com',
      password: agentPassword,
      role: 'agent',
    });

    // Create clients
    const clientPassword = await hashPassword('client123');
    const client1 = await User.create({
      name: 'Alice Client',
      email: 'alice@example.com',
      password: clientPassword,
      role: 'client',
    });

    const client2 = await User.create({
      name: 'Bob Customer',
      email: 'bob@example.com',
      password: clientPassword,
      role: 'client',
    });

    console.log('✅ Users created successfully:');
    console.log('Agents:');
    console.log('  - agent@helpdeskpro.com / agent123');
    console.log('  - support@helpdeskpro.com / agent123');
    console.log('Clients:');
    console.log('  - alice@example.com / client123');
    console.log('  - bob@example.com / client123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedUsers();
