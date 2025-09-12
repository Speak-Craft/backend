const { User, Role, Permission } = require('../models');

// Middleware to check if user has specific role
const requireRole = (roleName) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id).populate('role');
            
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (!user.role || user.role.name !== roleName) {
                return res.status(403).json({ 
                    message: `Access denied. Required role: ${roleName}` 
                });
            }

            req.userRole = user.role;
            next();
        } catch (error) {
            console.error('Role middleware error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    };
};

// Middleware to check if user has specific permission
const requirePermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id)
                .populate({
                    path: 'role',
                    populate: {
                        path: 'permissions'
                    }
                });
            
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (!user.role) {
                return res.status(403).json({ message: 'No role assigned' });
            }

            const hasPermission = user.role.permissions.some(
                permission => permission.name === permissionName
            );

            if (!hasPermission) {
                return res.status(403).json({ 
                    message: `Access denied. Required permission: ${permissionName}` 
                });
            }

            req.userRole = user.role;
            next();
        } catch (error) {
            console.error('Permission middleware error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    };
};

// Middleware to check if user has any of the specified roles
const requireAnyRole = (roleNames) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id).populate('role');
            
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (!user.role || !roleNames.includes(user.role.name)) {
                return res.status(403).json({ 
                    message: `Access denied. Required one of: ${roleNames.join(', ')}` 
                });
            }

            req.userRole = user.role;
            next();
        } catch (error) {
            console.error('Role middleware error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    };
};

// Middleware to check if user has minimum role level
const requireMinLevel = (minLevel) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id).populate('role');
            
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (!user.role || user.role.level < minLevel) {
                return res.status(403).json({ 
                    message: `Access denied. Required minimum level: ${minLevel}` 
                });
            }

            req.userRole = user.role;
            next();
        } catch (error) {
            console.error('Level middleware error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    };
};

module.exports = {
    requireRole,
    requirePermission,
    requireAnyRole,
    requireMinLevel
};

