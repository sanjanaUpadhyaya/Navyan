import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../utils/authUtils";

const SignUpForm = ({ onSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [role, setRole] = useState("learner");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await registerUser({ email, password, role });
      if (result.success) {
        setSuccess("Account created successfully! Redirecting to dashboard...");
        setTimeout(() => {
          if (result.user.role === 'instructor') {
            navigate("/instructor-dashboard");
          } else {
            navigate("/dashboard");
          }
          if (onSuccess) onSuccess();
        }, 1000);
      } else {
        setError(result.error || 'Sign up failed. Please try again.');
      }
    } catch (err) {
      setError('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-2">Sign Up</h2>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Enter your email"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Enter your password"
        />
      </div>
      
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          <option value="learner">Learner</option>
          <option value="instructor">Instructor</option>
        </select>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating Account..." : "Sign Up"}
      </button>
      
      {error && <div className="rounded bg-red-50 p-2 text-red-700 text-center">{error}</div>}
      {success && <div className="rounded bg-green-50 p-2 text-green-700 text-center">{success}</div>}
      
      <div className="mt-4 text-center">
        <span className="text-gray-600">Already have an account? </span>
        <button type="button" className="text-primary-600 hover:underline font-medium" onClick={onSwitchToLogin}>Sign in</button>
      </div>
    </form>
  );
};

export default SignUpForm;