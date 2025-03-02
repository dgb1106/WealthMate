import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InputField from '../shared/InputField';
import Button from '../shared/Button';
import { useAuth } from '../../hooks/useAuth';

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="First Name"
          type="text"
          name="firstName"
          placeholder="John"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        
        <InputField
          label="Last Name"
          type="text"
          name="lastName"
          placeholder="Doe"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>
      
      <InputField
        label="Email"
        type="email"
        name="email"
        placeholder="email@example.com"
        value={formData.email}
        onChange={handleChange}
        required
      />
      
      <InputField
        label="Password"
        type="password"
        name="password"
        placeholder="Create a password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      
      <InputField
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
      />
      
      <Button
        type="submit"
        fullWidth
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;