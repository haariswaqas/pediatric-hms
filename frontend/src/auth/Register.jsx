import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../store/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  CheckCircle, 
  FileText, 
  AlertCircle,
  ArrowRight,
  Loader
} from 'lucide-react';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: '',
    license_document: null,
  });
  const [error, setError] = useState(null);
  const [fileLabel, setFileLabel] = useState('Choose a file');

  // Redux state
  const { loading } = useSelector((state) => state.auth);
  
  const roles = [
    { value: 'parent', label: 'Parent' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'lab_tech', label: 'Lab Technician' }
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'license_document') {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
      setFileLabel(file ? file.name : 'Choose a file');
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
  
    console.log('Form data before validation:', formData);
  
    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      console.log('Error: Passwords do not match');
      return;
    }
  
    const payload = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val) {
        payload.append(key, val);
        console.log(`Appending to FormData -> ${key}:`, val);
      }
    });
  
    try {
      const result = await dispatch(registerUser(payload));
      console.log('Dispatch result:', result);
  
      if (registerUser.fulfilled.match(result)) {
        console.log('Registration successful!');
        navigate('/auth/verify-otp', { state: { email: formData.email } });
      } else {
        console.log('Registration failed:', result.payload);
        setError(result.payload || 'Registration failed');
      }
    } catch (err) {
      console.log('Caught error during registration:', err);
      setError('Something went wrong');
    }
  };
  
  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return { width: '0%', color: 'bg-gray-200' };
    
    if (password.length < 6) return { width: '25%', color: 'bg-red-500' };
    if (password.length < 8) return { width: '50%', color: 'bg-orange-500' };
    if (password.length < 10) return { width: '75%', color: 'bg-yellow-500' };
    return { width: '100%', color: 'bg-green-500' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          alt="Healthcare background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/50 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 bg-white/95 p-8 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-lg border border-white/20">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/206/206853.png" 
              className="w-12 h-12"
              alt="Child care"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 font-[Poppins]">Welcome to HMS Platform</h2>
          <p className="text-center text-gray-600 mt-1">Pediatric Healthcare Portal</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg mb-6 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className="pl-10 w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="pl-10 w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-blue-500" />
              </div>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="pl-10 w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200"
              />
            </div>
            {formData.password && (
              <div className="space-y-1 mt-2">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${strength.color} transition-all duration-300`} 
                    style={{ width: strength.width }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs px-1">
                  <span className={strength.width >= '25%' ? 'text-blue-600' : 'text-gray-400'}>Weak</span>
                  <span className={strength.width >= '50%' ? 'text-blue-600' : 'text-gray-400'}>Medium</span>
                  <span className={strength.width === '100%' ? 'text-blue-600' : 'text-gray-400'}>Strong</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </div>
              <input
                type="password"
                name="password2"
                required
                value={formData.password2}
                onChange={handleChange}
                placeholder="••••••••"
                className={`pl-10 w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-1 transition-all duration-200 ${
                  formData.password && formData.password2 && formData.password !== formData.password2 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                }`}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Role</label>
            <div className="relative">
              <select
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200"
              >
                <option value="">Select your role</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Licence Document */}
          {formData.role && formData.role !== 'parent' && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">Licence Document</label>
              <div className="flex items-center">
                <label className="flex-1 flex items-center px-4 py-3 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-500 truncate">{fileLabel}</span>
                  <input
                    type="file"
                    name="license_document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">PDF, JPG, JPEG, or PNG (Max 5MB)</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl text-white font-medium mt-6 flex items-center justify-center gap-2 
              transition-transform duration-200 hover:scale-[1.02] ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-gray-600 text-sm">
          Already have an account?{' '}
          <Link 
            to="/auth/login" 
            className="text-blue-600 hover:text-blue-700 font-semibold underline-offset-2 hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;