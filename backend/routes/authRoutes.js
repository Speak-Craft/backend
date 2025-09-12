const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");

const router = express.Router();

// GET AVAILABLE ROLES FOR REGISTRATION
router.get("/roles", async (req, res) => {
    try {
        // Get all active roles that can be selected during registration
        // Exclude admin role for security reasons
        const roles = await Role.find({ 
            isActive: true, 
            name: { $ne: 'admin' } // Exclude admin role from public registration
        }).select('name displayName description level').sort({ level: 1 });

        res.json({ 
            message: "Available roles fetched successfully",
            roles 
        });
    } catch (err) {
        console.error("Get roles error:", err);
        res.status(500).json({ message: err.message || "Failed to fetch roles" });
    }
});

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Find the selected role or default to student
        let selectedRole;
        if (role) {
            selectedRole = await Role.findOne({ name: role, isActive: true });
            if (!selectedRole) {
                return res.status(400).json({ message: "Invalid role selected" });
            }
            // Prevent admin role registration through public endpoint
            if (selectedRole.name === 'admin') {
                return res.status(403).json({ message: "Admin role cannot be assigned through registration" });
            }
        } else {
            // Default to student role if no role specified
            selectedRole = await Role.findOne({ name: "student" });
            if (!selectedRole) {
                return res.status(500).json({ message: "Default student role not found. Please contact administrator." });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with selected role and automatic member joined date
        const user = new User({ 
            name, 
            email, 
            password: hashedPassword,
            role: selectedRole._id,
            memberJoinedDate: new Date() // Automatically set to current date
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // Populate user data for response
        await user.populate('role');

        res.status(201).json({ 
            message: "User registered successfully",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                memberJoinedDate: user.memberJoinedDate
            }
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: err.message || "Registration failed" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('role');
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Update last login
        user.updateLastLogin();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ 
            message: "Login successful",
            token, 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin,
                loginCount: user.loginCount
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: err.message || "Login failed" });
    }
});

module.exports = router;
