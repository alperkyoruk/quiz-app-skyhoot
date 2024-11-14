'use client'

import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setToken } from './services/auth';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/generateToken', data);
      setToken(response.data.data);
      router.push('/homepage');
    } catch (error) {
      console.error('Login error', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-purple-600 to-indigo-900">
      <div className="bg-white bg-opacity-10 p-8 rounded-lg shadow-lg w-96 backdrop-blur-sm">
        <h2 className="text-2xl font-semibold text-center mb-6 text-white">Login to Skyhoot</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register('username', { required: true })}
              placeholder="Username"
              className="w-full p-3 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-indigo-100 bg-opacity-20 text-white placeholder-indigo-200"
            />
            {errors.username && <span className="text-yellow-400 text-sm">Username is required</span>}
          </div>

          <div>
            <input
              {...register('password', { required: true })}
              type="password"
              placeholder="Password"
              className="w-full p-3 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-indigo-100 bg-opacity-20 text-white placeholder-indigo-200"
            />
            {errors.password && <span className="text-yellow-400 text-sm">Password is required</span>}
          </div>

          <div className="flex justify-center">
            <button type="submit" className="w-full bg-yellow-400 text-indigo-900 py-3 rounded-md hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-semibold transition duration-300">
              Login
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link href="/register" className="text-yellow-400 hover:text-yellow-300 transition duration-300">
            Not registered? Register now
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-indigo-300 hover:text-indigo-200 transition duration-300">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}