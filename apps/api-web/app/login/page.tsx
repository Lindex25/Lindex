"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignInSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement actual authentication logic
    setTimeout(() => {
      alert("Login Successful! Redirecting...");
      setIsLoading(false);
      router.push("/");
    }, 1500);
  };

  const handleSignUpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement actual signup logic
    setTimeout(() => {
      alert("Account Created! Please check your email.");
      setIsLoading(false);
      setIsSignUp(false);
    }, 1500);
  };

  return (
    <div className="font-sans bg-gray-100 min-h-screen flex items-center justify-center p-4">
      {/* Main Container */}
      <div className={`login-container ${isSignUp ? "right-panel-active" : ""}`}>

        {/* Sign Up Form (Create Account) */}
        <div className="form-container sign-up-container bg-white">
          <div className="flex flex-col justify-center h-full px-12 lg:px-20 py-10 overflow-y-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-500 text-sm">Join the Lindex Professional Portal</p>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-blue-600 transition-colors text-gray-600 hover:text-blue-600">
                <i className="fa-brands fa-google text-lg"></i>
              </button>
              <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-blue-600 transition-colors text-gray-600 hover:text-blue-600">
                <i className="fa-brands fa-microsoft text-lg"></i>
              </button>
              <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-blue-600 transition-colors text-gray-600 hover:text-blue-600">
                <i className="fa-brands fa-linkedin-in text-lg"></i>
              </button>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">or use your email</span>
              </div>
            </div>

            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-regular fa-user text-gray-400"></i>
                </div>
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                  placeholder="Full Name"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-regular fa-envelope text-gray-400"></i>
                </div>
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                  placeholder="Email Address"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-regular fa-building text-gray-400"></i>
                </div>
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                  placeholder="Firm Name (Optional)"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-regular fa-lock text-gray-400"></i>
                </div>
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                  placeholder="Password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-600/30 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:underline">Terms</a>
              {" "}and{" "}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>

        {/* Sign In Form (Login) */}
        <div className="form-container sign-in-container bg-white">
          <div className="flex flex-col justify-center h-full px-12 lg:px-20 py-10 overflow-y-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-600/30">
                <i className="fa-solid fa-scale-balanced text-white text-xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-blue-600 transition-colors text-gray-600 hover:text-blue-600">
                <i className="fa-brands fa-google text-lg"></i>
              </button>
              <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-blue-600 transition-colors text-gray-600 hover:text-blue-600">
                <i className="fa-brands fa-microsoft text-lg"></i>
              </button>
              <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-blue-600 transition-colors text-gray-600 hover:text-blue-600">
                <i className="fa-brands fa-linkedin-in text-lg"></i>
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">or use your email</span>
              </div>
            </div>

            <form onSubmit={handleSignInSubmit} className="space-y-5">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-regular fa-envelope text-gray-400 group-focus-within:text-blue-600 transition-colors"></i>
                </div>
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all placeholder-gray-400"
                  placeholder="Email Address"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-regular fa-lock text-gray-400 group-focus-within:text-blue-600 transition-colors"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all placeholder-gray-400"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600"
                  />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Overlay Container */}
        <div className="overlay-container">
          <div className="overlay">

            {/* Overlay Left - Welcome Back */}
            <div className="overlay-panel overlay-left">
              <div className="glass-overlay p-8 rounded-3xl w-full max-w-sm">
                <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                <p className="text-white/80 mb-8 leading-relaxed">
                  To keep connected with us please login with your personal info.
                </p>
                <div className="mb-8">
                  <div className="w-16 h-16 rounded-full border-4 border-white/20 mx-auto shadow-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <i className="fa-solid fa-user text-white text-2xl"></i>
                  </div>
                </div>
                <button
                  onClick={() => setIsSignUp(false)}
                  className="border-2 border-white text-white font-bold py-3 px-12 rounded-full hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Overlay Right - Create Account */}
            <div className="overlay-panel overlay-right">
              <div className="h-full flex flex-col justify-center max-w-md">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl mb-8 shadow-2xl border border-white/20">
                    <i className="fa-solid fa-scale-balanced text-white text-5xl"></i>
                  </div>
                  <h2 className="text-5xl font-black mb-6 tracking-tight">LINDEX</h2>
                  <p className="text-xl text-blue-100 mb-10 font-light leading-relaxed">
                    Transform your legal practice with intelligent workflows and seamless collaboration.
                  </p>
                </div>

                <div className="space-y-6 text-left mb-12 pl-4">
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                      <i className="fa-solid fa-check text-lg"></i>
                    </div>
                    <span className="font-semibold text-lg">Smart Matter Management</span>
                  </div>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                      <i className="fa-solid fa-check text-lg"></i>
                    </div>
                    <span className="font-semibold text-lg">Team Collaboration Tools</span>
                  </div>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                      <i className="fa-solid fa-check text-lg"></i>
                    </div>
                    <span className="font-semibold text-lg">Enterprise Grade Security</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setIsSignUp(true)}
                    className="bg-white text-blue-600 font-bold py-4 px-14 rounded-full hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl"
                  >
                    Create Account
                  </button>
                  <p className="mt-5 text-base text-blue-200 font-medium">
                    Get started with a 14-day free trial
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

