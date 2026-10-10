import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import {
  Bus,
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  KeyRound
} from 'lucide-react';

export const Login = () => {
  const { login, allUsers } = useAuth();

  const [email, setEmail] = useState('admin@oakridgeschool.edu');
  const [password, setPassword] = useState('TransitPass2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password Modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = login(email, password);
      setIsSubmitting(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid credentials.');
      }
    }, 400);
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('TransitPass2026!');
    login(roleEmail, 'TransitPass2026!');
  };

  const handleSendResetLink = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background aesthetic shapes */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#17365D]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] rounded-full bg-[#FFC928]/10 blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#17365D] text-[#FFC928] shadow-lg mb-2">
            <Bus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#17365D] tracking-tight">
            Transit<span className="text-bus-500">IQ</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Oakridge International Academy • Transport Portal
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl rounded-3xl border border-slate-200/80 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-navy-900">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Access the centralized transportation management suite
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institutional Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@oakridgeschool.edu"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => { setIsForgotModalOpen(true); setResetSent(false); }}
                  className="text-[11px] font-semibold text-navy-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#17365D] hover:bg-navy-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-[#FFC928]" />
            </button>
          </form>

          {/* Quick Demo Role Presets (Reviewer Convenience!) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Quick One-Click Demo Logins
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@oakridgeschool.edu')}
                className="w-full p-2.5 rounded-xl border border-navy-200 bg-navy-50/60 hover:bg-navy-100/80 text-left transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-navy-900">Dr. Arthur Vance</p>
                  <p className="text-[11px] text-slate-500">Administrator • Full Access</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-navy-800 text-white">
                  Demo Admin →
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('transport@oakridgeschool.edu')}
                className="w-full p-2.5 rounded-xl border border-bus-200 bg-bus-50/70 hover:bg-bus-100 text-left transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-navy-900">Marcus Bell</p>
                  <p className="text-[11px] text-slate-500">Transport Manager • Fleet & Routes</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFC928] text-navy-950">
                  Demo Manager →
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('viewer@oakridgeschool.edu')}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-navy-900">Sarah Jenkins</p>
                  <p className="text-[11px] text-slate-500">Staff Viewer • Read-Only Security</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  Demo Viewer →
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          TransitIQ v2.4 Enterprise Fleet Management • Secured with 256-Bit SSL
        </p>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Password Recovery"
        subtitle="Reset link will be dispatched to your verified institutional inbox"
        maxWidth="max-w-md"
      >
        {resetSent ? (
          <div className="p-4 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-navy-900 text-sm">Reset Instructions Dispatched</h4>
            <p className="text-xs text-slate-500">
              We've dispatched password reset credentials to <strong>{forgotEmail || email}</strong>. Check your inbox and spam folder.
            </p>
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="mt-2 px-5 py-2 bg-[#17365D] text-white rounded-xl text-xs font-bold hover:bg-navy-800"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendResetLink} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Enter your registered email</label>
              <input
                type="email"
                placeholder="e.g. yourname@oakridgeschool.edu"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#17365D] hover:bg-navy-800 rounded-xl shadow-sm"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
