const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { User, Role, Permission } = require('../models');

const checkData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('✅ Connected to MongoDB');
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);

        // Count documents in each collection
        const userCount = await User.countDocuments();
        const roleCount = await Role.countDocuments();
        const permissionCount = await Permission.countDocuments();

        console.log('\n📋 Collection Counts:');
        console.log(`- Users: ${userCount}`);
        console.log(`- Roles: ${roleCount}`);
        console.log(`- Permissions: ${permissionCount}`);

        // Show all users
        console.log('\n👥 All Users:');
        const users = await User.find().populate('role', 'name displayName');
        users.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - Role: ${user.role?.displayName || 'No Role'}`);
        });

        // Show all roles
        console.log('\n🎭 All Roles:');
        const roles = await Role.find();
        roles.forEach(role => {
            console.log(`- ${role.displayName} (${role.name}) - Level: ${role.level}`);
        });

        // Show all permissions
        console.log('\n🔐 All Permissions:');
        const permissions = await Permission.find();
        permissions.forEach(permission => {
            console.log(`- ${permission.displayName} (${permission.name})`);
        });

    } catch (error) {
        console.error('❌ Error checking data:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    }
};

// Run the check
checkData();

