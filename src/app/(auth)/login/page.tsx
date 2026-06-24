import { login } from './actions'
import { LoginForm } from './LoginForm'
import { Database, ShieldCheck } from 'lucide-react'
import { AnimatedBackground } from '@/components/shared/AnimatedBackground'

export default async function LoginPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const error = searchParams?.error as string | undefined

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-600 relative bg-transparent">

      {/* Interactive background component */}
      <AnimatedBackground />

      {/* Minimal Header */}
      <header className="flex items-center justify-between px-6 py-4 md:py-6 max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center gap-2">
          <Database className="text-indigo-600 dark:text-indigo-400 w-6 h-6 md:w-7 md:h-7" />
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">MoonVeil</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold uppercase tracking-wider border border-indigo-200 dark:border-indigo-500/30">Workspace</span>
          </div>
        </div>
        <div className="hidden md:block">
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">Version 1.0.0-Pro</span>
        </div>
      </header>

      {/* Main Content: Elevated Canvas */}
      <main className="flex-grow flex items-center justify-center px-4 py-6 z-10">
        <div className="w-full max-w-[420px] animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700 ease-out">

          {/* Login Card */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Welcome Back</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Log in to manage your professional event pipeline.</p>
            </div>

            <LoginForm loginAction={login} error={error} />

            {/* Footer of Card */}
            <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-800 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Don't have an account?{' '}
                <a className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-all" href="#">Request Access</a>
              </p>
            </div>
          </div>

          {/* Additional Context (Technical detail) */}
          <div className="mt-8 flex justify-center gap-3 animate-in fade-in duration-700 delay-300 fill-mode-both">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-transform hover:scale-105">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400 font-medium">Systems Operational</span>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-transform hover:scale-105">
              <ShieldCheck className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400 font-medium">Enterprise Encrypted</span>
            </div>
          </div>

        </div>
      </main>

      {/* Global Footer */}
      <footer className="w-full py-6 md:py-8 px-6 border-t border-gray-200/50 dark:border-gray-800/50 bg-white/30 dark:bg-gray-900/30 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <a className="text-[12px] font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#">Privacy Policy</a>
            <a className="text-[12px] font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#">Terms of Service</a>
            <a className="text-[12px] font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#">Cookie Settings</a>
          </div>
          <p className="font-mono text-[11px] md:text-[13px] text-muted-foreground">© 2026 MoonVeil Technologies Inc.</p>
        </div>
      </footer>

    </div>
  )
}
