'use client'

import { useState } from 'react'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export function LoginForm({ loginAction, error }: { loginAction: (formData: FormData) => void, error?: string }) {
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // we don't prevent default, we let the action run, but we can set pending state
    // Actually, Next.js forms with actions work automatically, but since we are using onSubmit to show loading,
    // we can use standard form action
    setIsPending(true)
    // The form will still submit using the action attribute
  }

  return (
    <form className="space-y-6" action={loginAction} onSubmit={handleSubmit}>
      {/* Business Email Field */}
      <div className="space-y-2 relative group">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex justify-between items-center px-1 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400" htmlFor="email">
          Business Email
        </label>
        <div className="relative">
          <input 
            className="w-full h-12 px-4 rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/50 text-sm font-medium text-gray-900 dark:text-white transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm" 
            id="email" 
            name="email" 
            placeholder="name@company.com" 
            required 
            type="email"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors font-medium">
            @
          </span>
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2 relative group">
        <div className="flex justify-between items-center px-1">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400" htmlFor="password">Password</label>
          <a className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-all" href="#">Forgot password?</a>
        </div>
        <div className="relative">
          <input 
            className="w-full h-12 px-4 rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/50 text-sm font-medium text-gray-900 dark:text-white transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm" 
            id="password" 
            name="password" 
            placeholder="••••••••" 
            required 
            type={showPassword ? "text" : "password"}
          />
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1" 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Remember Me Toggle */}
      <div className="flex items-center gap-3 py-2 px-1">
        <input type="hidden" name="remember" value={rememberMe ? "true" : "false"} />
        <button
          type="button"
          onClick={() => setRememberMe(!rememberMe)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1 ${rememberMe ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-300 ease-in-out ${rememberMe ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 select-none cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors" onClick={() => setRememberMe(!rememberMe)}>
          Stay signed in for 30 days
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-medium text-center animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {/* Primary Action */}
      <button 
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none disabled:hover:translate-y-0 disabled:hover:shadow-none" 
        type="submit"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-bold tracking-wider uppercase">Authenticating</span>
          </>
        ) : (
          <>
            Sign In
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  )
}
