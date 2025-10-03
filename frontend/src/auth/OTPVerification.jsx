import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { Mail, Key, ArrowRight, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [email, setEmail] = useState(location.state?.email || null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = Array.from({ length: 6 }, () => useRef(null));
  const formRef = useRef(null);

  useEffect(() => {
    if (!email) {
      const stored = localStorage.getItem('registeredEmail');
      if (stored) setEmail(stored);
      else navigate('/auth/register');
    }
  }, [email, navigate]);

  // Auto-trigger verify
  useEffect(() => {
    if (otp.join('').length === 6) {
      const timer = setTimeout(handleVerify, 1000);
      return () => clearTimeout(timer);
    }
  }, [otp]);

  // Countdown for resend
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Focus first input on load
  useEffect(() => {
    if (inputRefs[0]?.current) {
      setTimeout(() => inputRefs[0].current.focus(), 300);
    }
  }, [email]);

  const handleInputChange = (i, e) => {
    const v = e.target.value;
    if (!/^\d?$/.test(v)) return;
    const arr = [...otp];
    arr[i] = v;
    setOtp(arr);
    if (v && i < 5) inputRefs[i+1].current.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && otp[i] === '' && i>0) {
      inputRefs[i-1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(text)) {
      setOtp(text.split(''));
      inputRefs[5].current.focus();
    }
  };

  async function handleVerify() {
    setError(''); setSuccess(''); setVerifying(true);
    const code = otp.join('');
    try {
      const data = await AuthService.verifyOTP(email, code);
      console.log("OTP verify response data:", data);
    
      // No exception => success
      setSuccess("Email verified! Redirecting to login…");
      localStorage.removeItem("registeredEmail");
      setTimeout(() => navigate("/auth/login"), 1500);
    } catch (err) {
      console.error("OTP error:", err);
      setError(err.message || "Verification error");
      // Shake form on error
      formRef.current.classList.add('shake');
      setTimeout(() => formRef.current.classList.remove('shake'), 500);
    } finally {
      setVerifying(false);
    }
  }

  const handleResendCode = async () => {
    try {
      // Replace with actual resend logic
      await AuthService.resendOTP(email);
      setTimeLeft(30);
      setCanResend(false);
      setSuccess("A new verification code has been sent to your email");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    }
  };

  if (!email) return null; // or loader

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center transition-all duration-300 hover:shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Key className="text-blue-600 w-8 h-8" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mb-2 text-gray-800">Verification</h2>
        <div className="flex items-center justify-center gap-2 mb-6 text-gray-600">
          <Mail className="w-4 h-4" />
          <p className="text-sm">{email}</p>
        </div>
        
        <p className="mb-8 text-gray-600 text-sm">
          Please enter the 6-digit code we've sent to your email address
        </p>
        
        <form 
          ref={formRef}
          onSubmit={e=>{e.preventDefault(); handleVerify();}} 
          onPaste={handlePaste}
          className="transition-all duration-300"
        >
          <div className="flex justify-center gap-2 mb-8">
            {otp.map((d,i)=>(
              <input
                key={i}
                ref={inputRefs[i]}
                value={d}
                onChange={e=>handleInputChange(i,e)}
                onKeyDown={e=>handleKeyDown(i,e)}
                maxLength="1"
                aria-label={`Digit ${i+1}`}
                className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
              />
            ))}
          </div>
          
          {error && (
            <div className="flex items-center justify-center gap-2 text-red-500 mb-4 p-2 bg-red-50 rounded">
              <AlertCircle className="w-4 h-4" />
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="flex items-center justify-center gap-2 text-green-600 mb-4 p-2 bg-green-50 rounded">
              <CheckCircle className="w-4 h-4" />
              <p>{success}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={verifying || otp.join('').length !== 6}
            className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
              verifying ? 'bg-gray-400' : 
              otp.join('').length !== 6 ? 'bg-blue-300' : 
              'bg-blue-600 hover:bg-blue-700 transform hover:scale-102'
            }`}
          >
            {verifying ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify Code</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          
          <div className="mt-6 text-sm text-gray-600">
            Didn't receive the code?{' '}
            {canResend ? (
              <button 
                type="button" 
                onClick={handleResendCode}
                className="text-blue-600 font-medium hover:underline focus:outline-none"
              >
                Resend code
              </button>
            ) : (
              <span>Resend in {timeLeft}s</span>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
      `}</style>
    </main>
  );
};

export default OTPVerification;