// Course service for managing courses
const API_BASE_URL = 'http://localhost:5000/api';

class CourseService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  // Course Management
  async createCourse(courseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create course');
      }

      return await response.json();
    } catch (error) {
      console.error('Create course error:', error);
      throw error;
    }
  }

  async getInstructorCourses() {
    try {
      const response = await fetch(`${API_BASE_URL}/instructor/courses`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch courses');
      }

      return await response.json();
    } catch (error) {
      console.error('Get instructor courses error:', error);
      throw error;
    }
  }

  async getAllCourses(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.level) queryParams.append('level', filters.level);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`${API_BASE_URL}/courses?${queryParams}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch courses');
      }

      return await response.json();
    } catch (error) {
      console.error('Get all courses error:', error);
      throw error;
    }
  }

  async getCourseById(courseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch course');
      }

      return await response.json();
    } catch (error) {
      console.error('Get course error:', error);
      throw error;
    }
  }

  async updateCourse(courseId, courseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update course');
      }

      return await response.json();
    } catch (error) {
      console.error('Update course error:', error);
      throw error;
    }
  }

  async deleteCourse(courseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete course');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete course error:', error);
      throw error;
    }
  }

  // Enrollment Management
  async enrollInCourse(courseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/enroll/${courseId}`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to enroll in course');
      }

      return await response.json();
    } catch (error) {
      console.error('Enroll in course error:', error);
      throw error;
    }
  }

  async getEnrolledCourses() {
    try {
      const response = await fetch(`${API_BASE_URL}/enrolled-courses`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch enrolled courses');
      }

      return await response.json();
    } catch (error) {
      console.error('Get enrolled courses error:', error);
      throw error;
    }
  }

  async updateCourseProgress(courseId, progress, completedLessons) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/progress`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ progress, completedLessons })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Update progress error:', error);
      throw error;
    }
  }

  // File Upload
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload file');
      }

      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  // Authentication (for MongoDB backend)
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      this.setToken(data.token);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      this.setToken(data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  isAuthenticated() {
    return !!this.token;
  }

  async getCoursesByInstructor() {
    try {
      const response = await fetch(`${API_BASE_URL}/instructor/courses`, {
        headers: this.getHeaders()
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch instructor courses');
      }
      return await response.json();
    } catch (error) {
      console.error('Get instructor courses error:', error);
      throw error;
    }
  }
}

export const courseService = new CourseService(); 