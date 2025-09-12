const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
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
    resource: { 
        type: String, 
        required: true 
    }, // e.g., 'users', 'activities', 'practices'
    action: { 
        type: String, 
        required: true 
    }, // e.g., 'create', 'read', 'update', 'delete'
    isActive: { 
        type: Boolean, 
        default: true 
    },
    isSystemPermission: { 
        type: Boolean, 
        default: false 
    }, // System permissions cannot be deleted
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
permissionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for better performance
permissionSchema.index({ name: 1 }, { unique: true });
permissionSchema.index({ resource: 1, action: 1 });

// Virtual for full permission string
permissionSchema.virtual('fullPermission').get(function() {
    return `${this.resource}:${this.action}`;
});

// Static method to create permission
permissionSchema.statics.createPermission = function(resource, action, displayName, description) {
    const name = `${resource}_${action}`;
    return this.create({
        name,
        displayName,
        description,
        resource,
        action
    });
};

module.exports = mongoose.model("Permission", permissionSchema);
