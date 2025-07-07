# Online Learning Platform - Complete Setup Guide

## Overview
This is a complete online learning platform with MongoDB backend and React frontend. The system includes:
- User authentication (instructors and learners)
- Course creation and management
- Video upload and storage
- Course enrollment and progress tracking
- Real-time course visibility

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/online-learning-platform

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# CORS Configuration
FRONTEND_URL=https://online-learning-front.vercel.app
```

### 3. MongoDB Setup
- Install MongoDB locally or use MongoDB Atlas
- Create a database named `online-learning-platform`
- The collections will be created automatically when you first use the application

### 4. Cloudinary Setup (for video uploads)
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Add them to your `.env` file

### 5. Start Backend Server
```bash
cd backend
npm run dev
```

The server will run on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Frontend Development Server
```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

## Features Implemented

### For Instructors:
1. **Course Creation**: Create courses with modules and lessons
2. **Video Upload**: Upload video content for lessons
3. **Course Management**: View, edit, publish/unpublish courses
4. **Real-time Updates**: Courses appear immediately after creation

### For Learners:
1. **Course Discovery**: Browse all published courses
2. **Course Enrollment**: Enroll in courses with one click
3. **Progress Tracking**: Track learning progress
4. **My Courses**: View enrolled courses with progress

### Database Collections:
- **users**: User accounts (instructors and learners)
- **courses**: Course data with modules and lessons
- **enrollments**: Student enrollments and progress

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile

### Course Management
- `POST /api/courses` - Create course (instructors only)
- `GET /api/instructor/courses` - Get instructor's courses
- `GET /api/courses` - Get all published courses
- `GET /api/courses/:id` - Get specific course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Enrollment
- `POST /api/enroll/:courseId` - Enroll in course
- `GET /api/enrolled-courses` - Get user's enrolled courses
- `PUT /api/courses/:courseId/progress` - Update course progress

### File Upload
- `POST /api/upload` - Upload files (videos, images)

## Usage Flow

### Instructor Workflow:
1. Register as an instructor
2. Login to instructor dashboard
3. Create a new course using Course Builder
4. Add modules and lessons with video content
5. Publish the course
6. Course becomes visible to learners immediately

### Learner Workflow:
1. Register as a learner
2. Browse course catalog
3. Enroll in desired courses
4. Access courses from "My Courses" section
5. Track progress as you complete lessons

## Key Features

### Real-time Course Visibility
- Courses created by instructors appear immediately in the course catalog
- Published courses are visible to all learners
- Draft courses are only visible to the instructor

### Video Storage
- Videos are uploaded to Cloudinary
- Secure video URLs are stored in the database
- Videos are accessible only to enrolled students

### Progress Tracking
- Automatic progress calculation based on completed lessons
- Visual progress indicators
- Course completion status

### Responsive Design
- Mobile-friendly interface
- Modern UI with Tailwind CSS
- Smooth animations and transitions

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your MONGODB_URI in .env file

2. **File Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits

3. **CORS Errors**
   - Update FRONTEND_URL in .env
   - Ensure frontend URL matches your setup

4. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT_SECRET in .env

## Production Deployment

### Backend (Vercel/Heroku):
1. Set environment variables in your hosting platform
2. Deploy the backend directory
3. Update frontend API_BASE_URL to point to your deployed backend

### Frontend (Vercel):
1. Deploy the frontend directory
2. Update CORS settings in backend to allow your frontend domain

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Secure file uploads
- Input validation and sanitization

## Performance Optimizations

- MongoDB indexing for faster queries
- Cloudinary CDN for video delivery
- Lazy loading for course images
- Efficient database queries with population

This setup provides a complete, production-ready online learning platform with all the features you requested! 