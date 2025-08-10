const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://swanand:swanand@cluster0.f4ofc.mongodb.net/test';

// User Schema - explicitly specify 'hello' collection
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide a username"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
    diagnosis: [{
        name: {
            type: String,
            required: true
        },
        file: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    collection: 'hello'
});

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
mongoose.connect(MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// POST - Login user with username and password
app.post('/hello/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                error: "Username and password are required" 
            });
        }

        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ 
                error: "Invalid username or password" 
            });
        }

        // Compare password (assuming passwords are hashed)
        let isPasswordValid = false;
        try {
            isPasswordValid = await bcrypt.compare(password, user.password);
        } catch (bcryptError) {
            // If bcrypt fails, try direct comparison (for non-hashed passwords)
            isPasswordValid = user.password === password;
        }
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: "Invalid username or password" 
            });
        }

        console.log(`User ${username} authenticated successfully`);

        res.json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
                isAdmin: user.isAdmin,
                diagnosisCount: user.diagnosis.length
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: "Login failed" });
    }
});

// GET - Get user's diagnosis list (requires username/password in query or body)
app.post('/hello/user-diagnoses', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                error: "Username and password are required" 
            });
        }

        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Verify password
        let isPasswordValid = false;
        try {
            isPasswordValid = await bcrypt.compare(password, user.password);
        } catch {
            isPasswordValid = user.password === password;
        }
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        res.json({
            success: true,
            username: user.username,
            diagnoses: user.diagnosis.map(d => ({
                name: d.name,
                createdAt: d.createdAt,
                hasFile: !!d.file
            }))
        });

    } catch (error) {
        console.error('Error fetching user diagnoses:', error);
        res.status(500).json({ error: "Failed to fetch diagnoses" });
    }
});

// POST - Get specific diagnosis file content (requires authentication)
app.post('/hello/diagnosis-content', async (req, res) => {
    try {
        const { username, password, diagnosisName } = req.body;
        
        if (!username || !password || !diagnosisName) {
            return res.status(400).json({ 
                error: "Username, password, and diagnosisName are required" 
            });
        }

        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Verify password
        let isPasswordValid = false;
        try {
            isPasswordValid = await bcrypt.compare(password, user.password);
        } catch {
            isPasswordValid = user.password === password;
        }
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Find the diagnosis
        const diagnosis = user.diagnosis.find(d => d.name === diagnosisName);
        
        if (!diagnosis) {
            return res.status(404).json({ 
                error: `Diagnosis '${diagnosisName}' not found for user '${username}'` 
            });
        }

        // Parse file content if it's JSON
        let fileContent = diagnosis.file;
        let isJSON = false;
        
        try {
            if (typeof fileContent === 'string') {
                fileContent = JSON.parse(fileContent);
                isJSON = true;
            } else if (typeof fileContent === 'object') {
                isJSON = true;
            }
        } catch (parseError) {
            // File is not JSON, keep as string
            isJSON = false;
        }

        console.log(`Retrieved diagnosis '${diagnosisName}' for user '${username}'`);

        res.json({
            success: true,
            user: username,
            diagnosis: {
                name: diagnosis.name,
                createdAt: diagnosis.createdAt,
                isJSON: isJSON,
                fileContent: fileContent
            }
        });

    } catch (error) {
        console.error('Error retrieving diagnosis content:', error);
        res.status(500).json({ error: "Failed to retrieve diagnosis content" });
    }
});

// ============================================================================
// ORIGINAL ROUTES (Updated with optional password hashing)
// ============================================================================

// POST endpoint - Create new user in 'hello' collection
app.post('/hello', async (req, res) => {
    try {
        console.log('POST /hello - Creating user in hello collection');
        
        // Check for existing user
        const existingUser = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.email }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                error: "User already exists",
                conflicts: {
                    username: existingUser.username === req.body.username,
                    email: existingUser.email === req.body.email
                }
            });
        }

        // Hash password if it's not already hashed
        let hashedPassword = req.body.password;
        if (req.body.password && !req.body.password.startsWith('$2a$')) {
            const saltRounds = 10;
            hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        }

        // Create new user with optional diagnosis data
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            isVerified: req.body.isVerified || false,
            isAdmin: req.body.isAdmin || false,
            forgotPasswordToken: req.body.forgotPasswordToken,
            forgotPasswordTokenExpiry: req.body.forgotPasswordTokenExpiry,
            verifyToken: req.body.verifyToken,
            verifyTokenExpiry: req.body.verifyTokenExpiry,
            diagnosis: req.body.diagnosis || []
        });

        const savedUser = await newUser.save();
        
        console.log(`User saved to collection: ${savedUser.constructor.collection.name}`);
        
        res.status(201).json({
            message: "User created successfully in hello collection",
            collection: savedUser.constructor.collection.name,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                isVerified: savedUser.isVerified,
                isAdmin: savedUser.isAdmin,
                diagnosisCount: savedUser.diagnosis.length,
                createdAt: savedUser.createdAt || new Date()
            }
        });

    } catch (error) {
        console.error('Error creating user:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                error: "Validation failed",
                details: errors 
            });
        }
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({ 
                error: `${field} already exists` 
            });
        }
        
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET endpoint - Get all users from 'hello' collection
app.get('/hello', async (req, res) => {
    try {
        console.log('GET /hello - Fetching users from hello collection');
        
        const { username, includeDiagnosis, limit, page } = req.query;

        const query = {};
        if (username) query.username = username;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const projection = '-password -forgotPasswordToken -verifyToken';
        
        let users = await User.find(query, projection)
            .limit(limitNum)
            .skip(skip)
            .sort({ createdAt: -1 });

        const totalUsers = await User.countDocuments(query);

        if (!includeDiagnosis || includeDiagnosis === 'false') {
            users = users.map(user => {
                const userObj = user.toObject();
                if (userObj.diagnosis) {
                    userObj.diagnosisCount = userObj.diagnosis.length;
                    delete userObj.diagnosis;
                }
                return userObj;
            });
        }

        console.log(`Found ${users.length} users in hello collection`);

        res.json({
            collection: 'hello',
            totalUsers,
            currentPage: pageNum,
            totalPages: Math.ceil(totalUsers / limitNum),
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: "Error fetching users" });
    }
});

// GET endpoint - Get specific user by username from 'hello' collection
app.get('/hello/user/:username', async (req, res) => {
    try {
        console.log(`GET /hello/user/${req.params.username} - Fetching specific user`);
        
        const user = await User.findOne(
            { username: req.params.username },
            '-password -forgotPasswordToken -verifyToken'
        );

        if (!user) {
            return res.status(404).json({ 
                error: "User not found",
                username: req.params.username 
            });
        }

        console.log(`User found in hello collection: ${user.username}`);

        res.json({
            collection: 'hello',
            user: user.toObject()
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: "Error fetching user" });
    }
});

// PUT endpoint - Update user by username in 'hello' collection
app.put('/hello/:username', async (req, res) => {
    try {
        console.log(`PUT /hello/${req.params.username} - Updating user`);
        
        const updateData = { ...req.body };
        delete updateData._id;
        
        // Hash password if being updated
        if (updateData.password && !updateData.password.startsWith('$2a$')) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(updateData.password, saltRounds);
        }
        
        const updatedUser = await User.findOneAndUpdate(
            { username: req.params.username },
            updateData,
            { 
                new: true, 
                runValidators: true,
                projection: '-password -forgotPasswordToken -verifyToken'
            }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        console.log(`User updated in hello collection: ${updatedUser.username}`);

        res.json({
            message: "User updated successfully",
            collection: 'hello',
            user: updatedUser.toObject()
        });
    } catch (error) {
        console.error('Error updating user:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                error: "Validation failed",
                details: errors 
            });
        }
        
        res.status(500).json({ error: "Error updating user" });
    }
});

// DELETE endpoint - Delete user by username from 'hello' collection
app.delete('/hello/:username', async (req, res) => {
    try {
        console.log(`DELETE /hello/${req.params.username} - Deleting user`);
        
        const deletedUser = await User.findOneAndDelete({ 
            username: req.params.username 
        });

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        console.log(`User deleted from hello collection: ${deletedUser.username}`);

        res.json({ 
            message: "User deleted successfully from hello collection",
            collection: 'hello',
            user: {
                username: deletedUser.username,
                email: deletedUser.email
            }
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: "Error deleting user" });
    }
});

// POST endpoint - Add diagnosis to existing user
app.post('/hello/:username/diagnosis', async (req, res) => {
    try {
        console.log(`POST /hello/${req.params.username}/diagnosis - Adding diagnosis`);
        
        const { name, file } = req.body;
        
        if (!name || !file) {
            return res.status(400).json({
                error: "Both 'name' and 'file' are required for diagnosis"
            });
        }

        const updatedUser = await User.findOneAndUpdate(
            { username: req.params.username },
            { 
                $push: { 
                    diagnosis: { 
                        name, 
                        file,
                        createdAt: new Date()
                    } 
                } 
            },
            { 
                new: true,
                projection: '-password -forgotPasswordToken -verifyToken'
            }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        console.log(`Diagnosis added to user in hello collection: ${updatedUser.username}`);

        res.json({
            message: "Diagnosis added successfully",
            collection: 'hello',
            user: {
                username: updatedUser.username,
                diagnosisCount: updatedUser.diagnosis.length,
                latestDiagnosis: updatedUser.diagnosis[updatedUser.diagnosis.length - 1]
            }
        });
    } catch (error) {
        console.error('Error adding diagnosis:', error);
        res.status(500).json({ error: "Error adding diagnosis" });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        collection: 'hello',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  POST   /hello/login                     - Login with username/password');
    console.log('  POST   /hello/user-diagnoses            - Get user diagnoses (auth required)');
    console.log('  POST   /hello/diagnosis-content         - Get diagnosis file content (auth required)');
    console.log('  POST   /hello                           - Create new user');
    console.log('  GET    /hello                           - Get all users');
    console.log('  GET    /hello/user/:username            - Get specific user');
    console.log('  PUT    /hello/:username                 - Update user');
    console.log('  DELETE /hello/:username                 - Delete user');
    console.log('  POST   /hello/:username/diagnosis       - Add diagnosis to user');
    console.log('  GET    /health                          - Health check');
    console.log('');
    console.log('New authenticated endpoints available!');
    console.log('All operations target the "hello" collection in MongoDB');
});