const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Role', 
        required: true 
    },
    isActive: { type: Boolean, default: true },
    profile: {
        avatar: { type: String },
        bio: { type: String },
        phone: { type: String },
        dateOfBirth: { type: Date },
        preferences: {
            language: { type: String, default: 'en' },
            notifications: { type: Boolean, default: true },
            theme: { type: String, default: 'light' }
        }
    },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },
    memberJoinedDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    
    // Relationships to practice and activity collections
    fillerWordsPractices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FillerWordsPractice' }],
    paceManagementPractices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PaceManagementPractice' }],
    loudnessPractices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LoudnessPractice' }],
    emotionAnalysisPractices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EmotionAnalysisPractice' }],
    
    fillerWordsActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FillerWordsActivity' }],
    paceManagementActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PaceManagementActivity' }],
    loudnessActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LoudnessActivity' }],
    emotionAnalysisActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EmotionAnalysisActivity' }]
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Method to check if user has specific permission
userSchema.methods.hasPermission = async function(permissionName) {
    await this.populate('role');
    if (!this.role) return false;
    
    await this.role.populate('permissions');
    return this.role.permissions.some(permission => permission.name === permissionName);
};

// Method to check if user has role
userSchema.methods.hasRole = async function(roleName) {
    await this.populate('role');
    return this.role && this.role.name === roleName;
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    this.loginCount += 1;
    return this.save();
};

// Static method to find users by role
userSchema.statics.findByRole = function(roleName) {
    return this.find().populate({
        path: 'role',
        match: { name: roleName }
    });
};

// Virtual for role name
userSchema.virtual('roleName').get(function() {
    return this.role ? this.role.name : null;
});

module.exports = mongoose.model("User", userSchema);
