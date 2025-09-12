# SpeakCraft Database Schema

## Overview
This document describes the complete database architecture for the SpeakCraft application, including all models, relationships, and data structures.

## Database Models

### 1. User Model
**Collection**: `users`

**Fields**:
- `name` (String, required): User's full name
- `email` (String, required, unique): User's email address
- `password` (String, required): Hashed password
- `role` (ObjectId, ref: 'Role', required): Reference to user's role
- `isActive` (Boolean, default: true): Account status
- `profile` (Object): User profile information
  - `avatar` (String): Profile picture URL
  - `bio` (String): User biography
  - `phone` (String): Phone number
  - `dateOfBirth` (Date): Date of birth
  - `preferences` (Object): User preferences
    - `language` (String, default: 'en'): Preferred language
    - `notifications` (Boolean, default: true): Notification settings
    - `theme` (String, default: 'light'): UI theme preference
- `lastLogin` (Date): Last login timestamp
- `loginCount` (Number, default: 0): Total login count
- `createdAt` (Date, default: Date.now): Account creation date
- `updatedAt` (Date, default: Date.now): Last update date

**Relationships**:
- References to Role collection
- References to practice collections (fillerWordsPractices, paceManagementPractices, etc.)
- References to activity collections (fillerWordsActivities, paceManagementActivities, etc.)

**Methods**:
- `hasPermission(permissionName)`: Check if user has specific permission
- `hasRole(roleName)`: Check if user has specific role
- `updateLastLogin()`: Update login tracking

### 2. Role Model
**Collection**: `roles`

**Fields**:
- `name` (String, required, unique): Role identifier (e.g., 'admin', 'instructor', 'student')
- `displayName` (String, required): Human-readable role name
- `description` (String): Role description
- `permissions` (Array of ObjectIds, ref: 'Permission'): List of permissions
- `isActive` (Boolean, default: true): Role status
- `isSystemRole` (Boolean, default: false): Whether role is system-defined
- `level` (Number, default: 1): Role hierarchy level (higher = more permissions)
- `createdAt` (Date, default: Date.now): Creation date
- `updatedAt` (Date, default: Date.now): Last update date

**Methods**:
- `hasPermission(permissionName)`: Check if role has specific permission
- `addPermission(permissionId)`: Add permission to role
- `removePermission(permissionId)`: Remove permission from role

### 3. Permission Model
**Collection**: `permissions`

**Fields**:
- `name` (String, required, unique): Permission identifier (e.g., 'users_create')
- `displayName` (String, required): Human-readable permission name
- `description` (String): Permission description
- `resource` (String, required): Resource type (e.g., 'users', 'activities')
- `action` (String, required): Action type (e.g., 'create', 'read', 'update', 'delete')
- `isActive` (Boolean, default: true): Permission status
- `isSystemPermission` (Boolean, default: false): Whether permission is system-defined
- `createdAt` (Date, default: Date.now): Creation date
- `updatedAt` (Date, default: Date.now): Last update date

**Virtuals**:
- `fullPermission`: Returns formatted permission string (resource:action)

### 4. Practice Models

#### FillerWordsPractice
**Collection**: `fillerwordspractices`

**Key Fields**:
- `userId` (ObjectId, ref: 'User'): Reference to user
- `sessionId` (String): Unique session identifier
- `audioFile` (String): Path to audio file
- `transcript` (String): Speech transcript
- `totalWords` (Number): Total words spoken
- `fillerWords` (Array): Detected filler words with counts and timestamps
- `fillerWordsCount` (Number): Total filler words count
- `fillerWordsPercentage` (Number): Percentage of filler words
- `score` (Number, 0-100): Practice score
- `difficulty` (String, enum: ['beginner', 'intermediate', 'advanced'])

#### PaceManagementPractice
**Collection**: `pacemanagementpractices`

**Key Fields**:
- `userId` (ObjectId, ref: 'User'): Reference to user
- `sessionId` (String): Unique session identifier
- `wordsPerMinute` (Number): Speaking pace
- `averagePace` (Number): Average pace throughout session
- `paceSegments` (Array): Pace analysis by time segments
- `pauses` (Array): Detected pauses with duration
- `optimalPaceMin/Max` (Number): Optimal pace range
- `score` (Number, 0-100): Practice score

#### LoudnessPractice
**Collection**: `loudnesspractices`

**Key Fields**:
- `userId` (ObjectId, ref: 'User'): Reference to user
- `sessionId` (String): Unique session identifier
- `averageVolume` (Number): Average volume in decibels
- `minVolume/maxVolume` (Number): Volume range
- `volumeSegments` (Array): Volume analysis by time segments
- `volumeIssues` (Array): Detected volume problems
- `optimalVolumeMin/Max` (Number): Optimal volume range
- `score` (Number, 0-100): Practice score

#### EmotionAnalysisPractice
**Collection**: `emotionanalysispractices`

**Key Fields**:
- `userId` (ObjectId, ref: 'User'): Reference to user
- `sessionId` (String): Unique session identifier
- `dominantEmotion` (String): Primary detected emotion
- `emotionConfidence` (Number): AI confidence score
- `emotionSegments` (Array): Emotion analysis by time segments
- `emotionDistribution` (Array): Percentage of each emotion
- `emotionalStability` (Number): Stability score
- `score` (Number, 0-100): Practice score

### 5. Activity Models

#### FillerWordsActivity
**Collection**: `fillerwordsactivities`

**Key Fields**:
- `userId` (ObjectId, ref: 'User'): Reference to user
- `activityType` (String, enum: ['exercise', 'quiz', 'simulation', 'real_practice'])
- `title` (String): Activity title
- `content` (Object): Activity content including text, audio, instructions
- `settings` (Object): Activity configuration (difficulty, timeLimit, etc.)
- `attempts` (Array): User's attempts with results
- `bestScore` (Number): Best score achieved
- `averageScore` (Number): Average score across attempts
- `isCompleted` (Boolean): Completion status

#### PaceManagementActivity
**Collection**: `pacemanagementactivities`

**Key Fields**:
- Similar structure to FillerWordsActivity
- `bestPace` (Number): Best pace achieved
- `averagePace` (Number): Average pace across attempts
- Pace-specific settings and results

#### LoudnessActivity
**Collection**: `loudnessactivities`

**Key Fields**:
- Similar structure to FillerWordsActivity
- `bestVolume` (Number): Best volume achieved
- `averageVolume` (Number): Average volume across attempts
- Volume-specific settings and results

#### EmotionAnalysisActivity
**Collection**: `emotionanalysisactivities`

**Key Fields**:
- Similar structure to FillerWordsActivity
- `bestEmotionMatch` (Number): Best emotion match score
- `averageEmotionMatch` (Number): Average emotion match score
- Emotion-specific settings and results

## Role-Based Access Control (RBAC)

### Role Hierarchy
1. **Admin** (Level 100): Full system access
2. **Instructor** (Level 50): Can create activities and view student progress
3. **Student** (Level 10): Can practice and complete activities

### Permission System
- **Granular Permissions**: Each permission is defined by resource and action
- **Resource Types**: users, activities, practices, roles, analytics, system
- **Actions**: create, read, update, delete, manage
- **Examples**: 
  - `users_create`: Create new users
  - `activities_read`: View activities
  - `practices_create`: Start practice sessions

### Middleware Functions
- `requireRole(roleName)`: Check for specific role
- `requirePermission(permissionName)`: Check for specific permission
- `requireAnyRole(roleNames)`: Check for any of multiple roles
- `requireMinLevel(minLevel)`: Check for minimum role level

## Database Relationships

### User Relationships
- **Many-to-One**: User → Role
- **One-to-Many**: User → Practice Sessions (all types)
- **One-to-Many**: User → Activities (all types)

### Role Relationships
- **Many-to-Many**: Role → Permission

### Practice vs Activity
- **Practice**: Real-time analysis of user's speech
- **Activity**: Structured exercises with multiple attempts and scoring

## Indexes

### User Collection
- `email` (unique)
- `role`
- `createdAt`

### Role Collection
- `name` (unique)
- `level`

### Permission Collection
- `name` (unique)
- `resource` + `action`

### Practice Collections
- `userId`
- `sessionId`
- `createdAt`

### Activity Collections
- `userId`
- `activityType`
- `createdAt`
- `isCompleted`

## Environment Variables

Create a `.env` file with:
```env
MONGO_URI=mongodb://localhost:27017/speakcraft
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=development
```

## Usage Examples

### Creating a User
```javascript
const user = new User({
    name: "John Doe",
    email: "john@example.com",
    password: "hashedPassword",
    role: "student"
});
```

### Creating a Practice Session
```javascript
const practice = new FillerWordsPractice({
    userId: user._id,
    sessionId: "session_123",
    audioFile: "/uploads/audio.wav",
    transcript: "Hello world...",
    totalWords: 100,
    fillerWordsCount: 5
});
```

### Creating an Activity
```javascript
const activity = new FillerWordsActivity({
    userId: user._id,
    activityType: "exercise",
    title: "Filler Words Exercise 1",
    content: {
        text: "Practice text here...",
        instructions: "Speak clearly and avoid filler words"
    },
    settings: {
        difficulty: "beginner",
        timeLimit: 300,
        maxAttempts: 3
    }
});
```

## Best Practices

1. **Data Validation**: All models include required field validation
2. **Timestamps**: Automatic createdAt/updatedAt tracking
3. **Indexes**: Optimized for common query patterns
4. **Relationships**: Proper ObjectId references with population support
5. **Methods**: Built-in calculation methods for scores and metrics
6. **Pre-save Hooks**: Automatic field updates and calculations
