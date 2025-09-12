const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const { User, Role } = require('../models');

const createUser = async (userData) => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('✅ Connected to MongoDB');

        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            console.log('❌ User with this email already exists');
            return;
        }

        // Find role by name
        const role = await Role.findOne({ name: userData.role });
        if (!role) {
            console.log(`❌ Role '${userData.role}' not found. Available roles: admin, instructor, student`);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user
        const user = new User({
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: role._id
        });

        await user.save();
        console.log('✅ User created successfully!');
        console.log(`📋 User Details:`);
        console.log(`- Name: ${user.name}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Role: ${role.displayName} (${role.name})`);
        console.log(`- ID: ${user._id}`);

    } catch (error) {
        console.error('❌ Error creating user:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    }
};

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
    console.log('❌ Usage: node createUser.js <name> <email> <password> [role]');
    console.log('📝 Example: node createUser.js "John Doe" "john@example.com" "password123" "student"');
    process.exit(1);
}

const userData = {
    name: args[0],
    email: args[1],
    password: args[2],
    role: args[3] || 'student'
};

// Validate role
if (userData.role && !['admin', 'instructor', 'student'].includes(userData.role)) {
    console.log('❌ Invalid role. Must be: admin, instructor, or student');
    process.exit(1);
}

createUser(userData);
