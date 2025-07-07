import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import { courseService } from '../../utils/courseService';
import { getUserRole, hasRole } from '../../utils/authUtils';

const InstructorMyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is an instructor
  useEffect(() => {
    if (!hasRole('instructor')) {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  // Fetch instructor's courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const fetchedCourses = await courseService.getInstructorCourses();
        setCourses(fetchedCourses);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (hasRole('instructor')) {
      fetchCourses();
    }
  }, []);

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await courseService.deleteCourse(courseId);
        setCourses(courses.filter(c => c._id !== courseId));
      } catch (err) {
        console.error('Error deleting course:', err);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  const handlePublishToggle = async (courseId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
      await courseService.updateCourse(courseId, { status: newStatus });
      setCourses(courses.map(c => 
        c._id === courseId ? { ...c, status: newStatus } : c
      ));
    } catch (err) {
      console.error('Error updating course status:', err);
      alert('Failed to update course status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Sidebar />
        <div className="ml-64 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 pt-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <h1 className="text-3xl font-bold">My Courses</h1>
            <Link 
              to="/instructor/course-builder" 
              className="px-4 py-2 bg-primary-600 text-white rounded font-semibold shadow hover:bg-primary-700 transition-colors"
            >
              Create Course
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {courses.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <div className="text-lg mb-2">No courses yet.</div>
              <Link 
                to="/instructor/course-builder" 
                className="text-primary-600 hover:underline font-semibold"
              >
                Create your first course
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow p-6">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-sm">
                    <th className="py-2 px-4">Thumbnail</th>
                    <th className="py-2 px-4">Title</th>
                    <th className="py-2 px-4">Category</th>
                    <th className="py-2 px-4">Level</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Students</th>
                    <th className="py-2 px-4">Rating</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course._id} className="border-t">
                      <td className="py-2 px-4">
                        <img 
                          src={course.thumbnail || 'https://via.placeholder.com/60x40?text=Course'} 
                          alt="thumb" 
                          className="h-10 w-16 object-cover rounded" 
                        />
                      </td>
                      <td className="py-2 px-4 font-medium">{course.title}</td>
                      <td className="py-2 px-4">{course.category}</td>
                      <td className="py-2 px-4">{course.level}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          course.status === 'Published' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        {course.enrolledStudents ? course.enrolledStudents.length : 0}
                      </td>
                      <td className="py-2 px-4">
                        {course.rating > 0 ? course.rating.toFixed(1) : '-'}
                      </td>
                      <td className="py-2 px-4 space-x-2">
                        <Link 
                          to={`/course/${course._id}`} 
                          className="text-primary-600 hover:underline"
                        >
                          View
                        </Link>
                        <Link 
                          to={`/instructor/course-builder/edit/${course._id}`} 
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(course._id)} 
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                        <button 
                          onClick={() => handlePublishToggle(course._id, course.status)}
                          className="text-yellow-600 hover:underline"
                        >
                          {course.status === 'Published' ? 'Unpublish' : 'Publish'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InstructorMyCourses; 