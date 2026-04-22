import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../../assets/disaster-relief-bg.png";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "citizen",
    // agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      console.log(response.data);

      setLoading(false);
      navigate("/login");

    } catch (error) {
      setLoading(false);
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      <div className="fixed inset-0 z-0 ">
        <img
          src={backgroundImage}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Outer wrapper - transparent with slight glass effect */}
      <div className="w-full max-w-6xl flex rounded-2xl overflow-hidden backdrop-blur-xsm bg-white/10 border border-white/20 shadow-sm ">

        {/* Left Section - Minimal Content */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          {/* Blue Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300/40 to-blue-100/30"></div>

          {/* Content - Vertically Centered */}
          <div className="relative z-10 flex flex-col justify-center p-12 text-white w-full">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h1 className="text-3xl font-bold">ReliefConnect</h1>
              </div>

              <h2 className="text-4xl font-bold mb-3 leading-tight">
                Welcome to<br />ReliefConnect
              </h2>

              <div className="w-16 h-1 bg-sky-400/80 mb-4"></div>

              <p className="text-lg text-white/90">
                Join us to aid in disaster relief efforts
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Form with Glassmorphism */}
        <div className="w-full lg:w-1/2">
          <div className="h-full backdrop-blur-md bg-white/90 border-l border-white/30">
            <div className="p-8 lg:p-10 h-full flex items-center justify-center">

              <div className="w-full max-w-sm">
                <div className="mb-6 text-center lg:text-left">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Create Account
                  </h2>

                  <p className="text-gray-900 text-sm mt-1">
                    Join ReliefConnect to help and respond during emergencies
                  </p>
                </div>
                {/* Mobile Header */}
                <div className="lg:hidden mb-8 text-center">
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">🛡️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">ReliefConnect</h1>
                  </div>
                </div>

                {/* Form Container */}
                <div className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all bg-white/80 text-gray-800 placeholder-gray-500`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 -mt-1">{errors.name}</p>
                    )}

                    {/* Email Address */}
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      className={`w-full px-4 py-2.5 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all bg-white/80 text-gray-800 placeholder-gray-500`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 -mt-1">{errors.email}</p>
                    )}

                    {/* Password */}
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className={`w-full px-4 py-2.5 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all bg-white/80 text-gray-800 placeholder-gray-500`}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-600 -mt-1">{errors.password}</p>
                    )}

                    {/* Confirm Password */}
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                      className={`w-full px-4 py-2.5 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all bg-white/80 text-gray-800 placeholder-gray-500`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 -mt-1">{errors.confirmPassword}</p>
                    )}

                    {/* Role Dropdown */}
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all bg-white/10 text-gray-800 appearance-none cursor-pointer"
                    >
                      <option value="citizen">Citizen</option>
                      <option value="ngo">NGO</option>
                    </select>

                    {/* Terms & Conditions */}
                    {/* <div className="pt-1">
                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="mt-0.5 w-4 h-4 text-sky-600 rounded focus:ring-sky-500 border-gray-300"
                    />
                    <div>
                      <span className="text-gray-700 text-xs">
                        I agree to the{" "}
                        <Link to="/terms" className="text-sky-600 hover:text-sky-800 font-medium">
                          Terms & Conditions
                        </Link>
                      </span>
                      {errors.agreeTerms && (
                        <p className="mt-0.5 text-xs text-red-600">{errors.agreeTerms}</p>
                      )}
                    </div>
                  </label>
                </div> */}

                    {/* Sign Up Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-2.5 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow mt-2"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Signing Up...
                        </div>
                      ) : (
                        "Sign Up"
                      )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-transparent text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-center space-x-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50/80 transition-colors bg-white"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-gray-800 font-medium text-sm">Google</span>
                      </button>
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-[#1877F2] text-white rounded-lg hover:bg-[#166fe5] transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span className="font-medium text-sm">Facebook</span>
                      </button>
                    </div>

                    {/* Login Link */}
                    <div className="text-center pt-2">
                      <span className="text-gray-600 text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="text-sky-600 hover:text-sky-800 font-semibold">
                          Log In
                        </Link>
                      </span>
                    </div>
                  </form>
                </div>

                {/* Footer Note */}
                <p className="text-center text-xs text-gray-500 mt-6">
                  By signing up, you agree to our{" "}
                  <Link to="/privacy" className="text-sky-600 hover:underline">Privacy Policy</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}