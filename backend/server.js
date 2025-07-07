import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: ["https://online-learning-front.vercel.app", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-learning-platform')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// MongoDB Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['learner', 'instructor'], default: 'learner' },
  name: String,
  bio: String,
  avatar: String,
  createdAt: { type: Date, default: Date.now }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  price: { type: Number, default: 0 },
  discountPrice: { type: Number, default: 0 },
  thumbnail: String,
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learningOutcomes: [String],
  requirements: [String],
  targetAudience: [String],
  modules: [{
    title: String,
    lessons: [{
      title: String,
      type: { type: String, enum: ['video', 'text', 'quiz'], default: 'video' },
      duration: String,
      content: String,
      videoUrl: String,
      quiz: {
        questions: [{
          question: String,
          options: [String],
          correctAnswer: Number
        }]
      }
    }]
  }],
  status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0 },
  completedLessons: [String],
  enrolledAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  // Allow dummy token for dev
  if (token === 'dummy-token-for-dev') {
    req.user = { _id: '000000000000000000000001', role: 'instructor', name: 'Dev User', email: 'dev@user.com' };
    return next();
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Routes

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { email, password, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      passwordHash,
      role: role || 'learner',
      name: email.split('@')[0] // Use email prefix as name
    });

    await user.save();
    console.log('User registered successfully:', user);
    
    // Bypass JWT for now
    const token = 'dummy-token-for-dev';

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Bypass JWT for now
    const token = 'dummy-token-for-dev';

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Course Management Routes

// Create course
app.post('/api/courses', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can create courses' });
    }

    const courseData = {
      ...req.body,
      instructor: req.user._id
    };

    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Course creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get instructor's courses
app.get('/api/instructor/courses', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const courses = await Course.find({ instructor: req.user._id })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all published courses (for learners)
app.get('/api/courses', async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let query = { status: 'Published' };

    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single course
app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email bio avatar');
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update course
app.put('/api/courses/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete course
app.delete('/api/courses/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Course.findByIdAndDelete(req.params.id);
    await Enrollment.deleteMany({ courseId: req.params.id });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Enrollment routes
app.post('/api/enroll/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.status !== 'Published') {
      return res.status(400).json({ error: 'Course is not published' });
    }

    const existingEnrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = new Enrollment({
      userId: req.user._id,
      courseId: courseId
    });

    await enrollment.save();

    // Add user to course's enrolled students
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: req.user._id }
    });

    res.json({
      message: 'Enrolled successfully',
      enrollment
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's enrolled courses
app.get('/api/enrolled-courses', authenticateToken, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id })
      .populate({
        path: 'courseId',
        populate: { path: 'instructor', select: 'name email' }
      });

    const courses = enrollments.map(enrollment => ({
      ...enrollment.courseId.toObject(),
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons
    }));

    res.json(courses);
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update course progress
app.put('/api/courses/:courseId/progress', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress, completedLessons } = req.body;

    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: req.user._id, courseId: courseId },
      { progress, completedLessons },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json({
      message: 'Progress updated successfully',
      enrollment
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));