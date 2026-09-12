import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Phone, ArrowRight, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Password strength rules
const passwordRules = [
  { id: 'length',  label: 'At least 8 characters',              test: (p) => p.length >= 8 },
  { id: 'letter',  label: 'Contains a letter (a-z or A-Z)',      test: (p) => /[a-zA-Z]/.test(p) },
  { id: 'number',  label: 'Contains a number (0-9)',             test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'Contains a special character (!@#…)', test: (p) => /[^a-zA-Z0-9]/.test(p) },
];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passedRules = passwordRules.filter(r => r.test(formData.password));
  const allRulesPassed = passedRules.length === passwordRules.length;
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!allRulesPassed) {
      toast.error('Password does not meet the requirements');
      return;
    }
    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Don't send confirmPassword to the backend
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      toast.success('Registration successful! Please check your email for OTP verification.');
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/auth-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 60,
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Glass card — scrollable on small screens */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl p-8 shadow-2xl overflow-y-auto"
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          maxHeight: '95vh',
        }}
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/30">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-white/70">Join Alpha PC Shop today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="text"
                name="name"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/15 border border-white/25 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/15 border border-white/25 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="tel"
                name="phone"
                placeholder="+251 911 123 456"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/15 border border-white/25 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setPasswordTouched(true)}
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/15 border border-white/25 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password strength checklist */}
            {passwordTouched && (
              <ul className="mt-2 space-y-1">
                {passwordRules.map(rule => {
                  const passed = rule.test(formData.password);
                  return (
                    <li key={rule.id} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-green-400' : 'text-white/50'}`}>
                      {passed
                        ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        : <XCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-11 py-3 rounded-xl bg-white/15 border text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:bg-white/20 transition ${
                  formData.confirmPassword
                    ? passwordsMatch
                      ? 'border-green-400/60 focus:ring-green-400/40'
                      : 'border-red-400/60 focus:ring-red-400/40'
                    : 'border-white/25 focus:ring-white/40'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.confirmPassword && (
              <p className={`text-xs mt-1 ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !allRulesPassed || !passwordsMatch}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-white/70 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
