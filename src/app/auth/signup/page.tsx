'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [passwordLengthError, setPasswordLengthError] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [formError, setFormError] = useState(''); // General form submission error
  const { theme, setTheme } = useTheme();

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('theme');
    setTheme('light');
  }, []);


  // Function to validate password length
  const validatePasswordLength = (pwd: string) => {
    if (pwd.length < 7) {
      setPasswordLengthError("Password should be more than 6 characters.");
      return false;
    }
    setPasswordLengthError(''); // Clear error if valid
    return true;
  };

  // Function to validate password match
  const validatePasswordMatch = (pwd1: string, pwd2: string) => {
    if (pwd1 && pwd2 && pwd1 !== pwd2) { // Only check if both are entered
      setPasswordMatchError("Passwords do not match.");
      return false;
    }
    setPasswordMatchError(''); // Clear error if valid
    return true;
  };

  // Handle change for the first password field
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePasswordLength(newPassword); // Validate length immediately
    validatePasswordMatch(newPassword, confirmPassword); // Validate match immediately
  };

  // Handle change for the confirm password field
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    validatePasswordMatch(password, newConfirmPassword); // Validate match immediately
  };


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(''); // Clear general form errors

    // Run all validations again for final check before submission
    const isPasswordLengthValid = validatePasswordLength(password);
    const isPasswordMatchValid = validatePasswordMatch(password, confirmPassword);

    // If any client-side validation fails, stop submission
    if (!isPasswordLengthValid || !isPasswordMatchValid) {
      // The individual error states (passwordLengthError, passwordMatchError) will already be set
      return;
    }

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setFormError(error.message); // Set form-level error for Supabase errors
    } else {
      const user = data.user;

      // Insert full name into 'profiles' table
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, full_name: fullName }]);

        if (profileError) {
          console.error('Error inserting into profiles:', profileError);
          setFormError('Error creating profile. Please try again.');
        }
      }

      router.push('/auth/login');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
      <form onSubmit={handleSignup} className="flex flex-col space-y-4 w-80">
        {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {/* Password field with show/hide toggle */}
        <div className="relative">
          <input
            className="border p-2 rounded pr-10 w-full"
            type={showPassword1 ? "text" : "password"}
            placeholder="Password (6+ characters)"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword1(!showPassword1)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
            aria-label={showPassword1 ? "Hide password" : "Show password"}
          >
            {showPassword1 ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {passwordLengthError && <p className="text-red-500 text-xs mt-1">{passwordLengthError}</p>}

        {/* Confirm Password field with show/hide toggle */}
        <div className="relative">
          <input
            className="border p-2 rounded pr-10 w-full"
            type={showPassword2 ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword2(!showPassword2)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
            aria-label={showPassword2 ? "Hide confirm password" : "Show confirm password"}
          >
            {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {passwordMatchError && <p className="text-red-500 text-xs mt-1">{passwordMatchError}</p>}


        <button
          className="flex-1 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          type="submit">
          Sign Up
        </button>
        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}