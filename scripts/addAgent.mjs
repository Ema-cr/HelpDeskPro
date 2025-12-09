// Script to add a new agent user
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

async function addAgent() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get agent details from command line arguments
    const name = process.argv[2];
    const email = process.argv[3];
    const password = process.argv[4] || 'agent123';

    if (!name || !email) {
      console.error('❌ Usage: node scripts/addAgent.mjs <name> <email> [password]');
      console.error('   Example: node scripts/addAgent.mjs "John Doe" "john@example.com" "mypassword"');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`ℹ️  User with email ${email} already exists`);
      console.log(`   Role: ${existingUser.role}`);
      
      if (existingUser.role !== 'agent') {
        console.log('   Updating role to agent...');
        existingUser.role = 'agent';
        await existingUser.save();
        console.log('✅ Role updated to agent');
      }
      
      await mongoose.connection.close();
      return;
    }

    // Create new agent
    const hashedPassword = await hashPassword(password);
    const newAgent = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'agent',
    });

    console.log('✅ Agent created successfully:');
    console.log(`   Name: ${newAgent.name}`);
    console.log(`   Email: ${newAgent.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${newAgent.role}`);

  } catch (error) {
    console.error('❌ Error creating agent:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

addAgent();
