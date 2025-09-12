const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        lowercase: true
    },
    displayName: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }],
    isActive: { 
        type: Boolean, 
        default: true 
    },
    isSystemRole: { 
        type: Boolean, 
        default: false 
    }, // System roles cannot be deleted
    level: { 
        type: Number, 
        default: 1 
    }, // Higher level = more permissions
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Update the updatedAt field before saving
roleSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for better performance
roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ level: -1 });

// Virtual for user count
roleSchema.virtual('userCount', {
    ref: 'User',
    localField: '_id',
    foreignField: 'role',
    count: true
});

// Method to check if role has specific permission
roleSchema.methods.hasPermission = function(permissionName) {
    return this.permissions.some(permission => permission.name === permissionName);
};

// Method to add permission
roleSchema.methods.addPermission = function(permissionId) {
    if (!this.permissions.includes(permissionId)) {
        this.permissions.push(permissionId);
    }
    return this.save();
};

// Method to remove permission
roleSchema.methods.removePermission = function(permissionId) {
    this.permissions = this.permissions.filter(perm => !perm.equals(permissionId));
    return this.save();
};

module.exports = mongoose.model("Role", roleSchema);
