const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const { User, Role, Permission } = require('../models');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional - remove if you want to keep existing data)
        await User.deleteMany({});
        await Role.deleteMany({});
        await Permission.deleteMany({});
        console.log('🗑️ Cleared existing data');

        // Create permissions
        const permissions = [
            // User management permissions
            { name: 'users_create', displayName: 'Create Users', description: 'Create new users', resource: 'users', action: 'create' },
            { name: 'users_read', displayName: 'Read Users', description: 'View user information', resource: 'users', action: 'read' },
            { name: 'users_update', displayName: 'Update Users', description: 'Modify user information', resource: 'users', action: 'update' },
            { name: 'users_delete', displayName: 'Delete Users', description: 'Delete users', resource: 'users', action: 'delete' },
            
            // Activity management permissions
            { name: 'activities_create', displayName: 'Create Activities', description: 'Create new activities', resource: 'activities', action: 'create' },
            { name: 'activities_read', displayName: 'Read Activities', description: 'View activities', resource: 'activities', action: 'read' },
            { name: 'activities_update', displayName: 'Update Activities', description: 'Modify activities', resource: 'activities', action: 'update' },
            { name: 'activities_delete', displayName: 'Delete Activities', description: 'Delete activities', resource: 'activities', action: 'delete' },
            
            // Practice permissions
            { name: 'practices_create', displayName: 'Create Practices', description: 'Start new practice sessions', resource: 'practices', action: 'create' },
            { name: 'practices_read', displayName: 'Read Practices', description: 'View practice sessions', resource: 'practices', action: 'read' },
            { name: 'practices_update', displayName: 'Update Practices', description: 'Modify practice sessions', resource: 'practices', action: 'update' },
            
            // Role management permissions
            { name: 'roles_create', displayName: 'Create Roles', description: 'Create new roles', resource: 'roles', action: 'create' },
            { name: 'roles_read', displayName: 'Read Roles', description: 'View roles', resource: 'roles', action: 'read' },
            { name: 'roles_update', displayName: 'Update Roles', description: 'Modify roles', resource: 'roles', action: 'update' },
            { name: 'roles_delete', displayName: 'Delete Roles', description: 'Delete roles', resource: 'roles', action: 'delete' },
            
            // Analytics permissions
            { name: 'analytics_read', displayName: 'View Analytics', description: 'Access analytics and reports', resource: 'analytics', action: 'read' },
            
            // System permissions
            { name: 'system_manage', displayName: 'System Management', description: 'Manage system settings', resource: 'system', action: 'manage' }
        ];

        const createdPermissions = await Permission.insertMany(permissions);
        console.log(`✅ Created ${createdPermissions.length} permissions`);

        // Create roles with permissions
        const roles = [
            {
                name: 'admin',
                displayName: 'Administrator',
                description: 'Full system access',
                level: 100,
                isSystemRole: true,
                permissions: createdPermissions.map(p => p._id) // All permissions
            },
            {
                name: 'instructor',
                displayName: 'Instructor',
                description: 'Can create activities and view student progress',
                level: 50,
                isSystemRole: true,
                permissions: [
                    createdPermissions.find(p => p.name === 'users_read')._id,
                    createdPermissions.find(p => p.name === 'activities_create')._id,
                    createdPermissions.find(p => p.name === 'activities_read')._id,
                    createdPermissions.find(p => p.name === 'activities_update')._id,
                    createdPermissions.find(p => p.name === 'practices_read')._id,
                    createdPermissions.find(p => p.name === 'analytics_read')._id
                ]
            },
            {
                name: 'student',
                displayName: 'Student',
                description: 'Can practice and complete activities',
                level: 10,
                isSystemRole: true,
                permissions: [
                    createdPermissions.find(p => p.name === 'activities_read')._id,
                    createdPermissions.find(p => p.name === 'practices_create')._id,
                    createdPermissions.find(p => p.name === 'practices_read')._id,
                    createdPermissions.find(p => p.name === 'practices_update')._id
                ]
            }
        ];

        const createdRoles = await Role.insertMany(roles);
        console.log(`✅ Created ${createdRoles.length} roles`);

        // Create initial users
        const users = [
            {
                name: 'Admin User',
                email: 'admin@speakcraft.com',
                password: await bcrypt.hash('admin123', 10),
                role: createdRoles.find(r => r.name === 'admin')._id
            },
            {
                name: 'Instructor User',
                email: 'instructor@speakcraft.com',
                password: await bcrypt.hash('instructor123', 10),
                role: createdRoles.find(r => r.name === 'instructor')._id
            },
            {
                name: 'John Student',
                email: 'student@speakcraft.com',
                password: await bcrypt.hash('student123', 10),
                role: createdRoles.find(r => r.name === 'student')._id
            },
            {
                name: 'Jane Doe',
                email: 'jane@speakcraft.com',
                password: await bcrypt.hash('jane123', 10),
                role: createdRoles.find(r => r.name === 'student')._id
            }
        ];

        // Insert users
        const createdUsers = await User.insertMany(users);
        console.log(`✅ Created ${createdUsers.length} users`);

        // Display created data
        console.log('\n📋 Created Roles:');
        createdRoles.forEach(role => {
            console.log(`- ${role.displayName} (${role.name}) - Level: ${role.level}`);
        });

        console.log('\n📋 Created Users:');
        for (const user of createdUsers) {
            const role = createdRoles.find(r => r._id.equals(user.role));
            console.log(`- ${user.name} (${user.email}) - Role: ${role.displayName}`);
        }

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n🔑 Login Credentials:');
        console.log('Admin: admin@speakcraft.com / admin123');
        console.log('Instructor: instructor@speakcraft.com / instructor123');
        console.log('Student: student@speakcraft.com / student123');
        console.log('Student: jane@speakcraft.com / jane123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    }
};

// Run the seeder
seedDatabase();
