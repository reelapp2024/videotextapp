import React from 'react';
import { Video, Lock, Mail, ChevronRight, Loader2, AlertCircle, Zap, Mic, Sparkles } from 'lucide-react';

export default function LoginScreen({
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  handleLogin,
  loginError,
  loginLoading,
}) {
  return (
    <div className="min-h-screen bg-[#06080f] text-white flex flex-col font-sans antialiased overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-[10%] w-[600px] h-[600px] bg-indigo-600/[0.06] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-violet-600/[0.05] rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjAuNSIgZmlsbD0icmdiYSg5OSwxMDIsMjQxLDAuMDMpIi8+PC9zdmc+')] opacity-50"></div>
      </div>

      {/* Top nav */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-indigo-500/[0.06]">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-1 ring-white/10">
            <Video className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent">VideoText Pro</span>
            <p className="text-[8px] text-indigo-400/30 tracking-widest uppercase hidden sm:block">Enterprise Suite</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[10px] text-indigo-300/30 tracking-wider uppercase">AI Powered</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50"></div>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-[420px]">
          {/* Hero text */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">Automate</span>
              <span className="text-white"> Your</span>
              <br className="sm:hidden" />
              <span className="text-white"> Video Creation</span>
            </h1>
            <p className="text-indigo-200/30 text-xs sm:text-sm mt-2 sm:mt-3 max-w-xs mx-auto leading-relaxed">
              Bulk video generation with text overlays, TTS, effects, and more — all in one platform.
            </p>
          </div>

          {/* Login card */}
          <div className="bg-gradient-to-b from-[#111730]/90 to-[#0c1022]/90 backdrop-blur-2xl rounded-2xl border border-indigo-500/[0.1] shadow-2xl shadow-indigo-950/50 overflow-hidden ring-1 ring-white/[0.03]">
            <div className="p-5 sm:p-7">
              <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600/20 to-violet-600/20 flex items-center justify-center border border-indigo-500/15">
                  <Lock className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-white">Welcome back</h2>
                  <p className="text-[10px] sm:text-xs text-indigo-300/30">Sign in to your account</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-[10px] sm:text-xs font-medium text-indigo-200/40 block mb-1.5 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/30" />
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm text-gray-200 placeholder-indigo-300/15 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs font-medium text-indigo-200/40 block mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/30" />
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                      className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm text-gray-200 placeholder-indigo-300/15 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 outline-none transition"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/15 rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-300">{loginError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 disabled:from-gray-800 disabled:to-gray-800 text-white py-2.5 sm:py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/35 flex items-center justify-center gap-2 group ring-1 ring-white/10 disabled:ring-0"
                >
                  {loginLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                  ) : (
                    <>Sign In <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                  )}
                </button>
              </form>
            </div>

            <div className="px-5 sm:px-7 py-3 sm:py-4 bg-indigo-500/[0.02] border-t border-indigo-500/[0.06]">
              <p className="text-[10px] sm:text-xs text-indigo-300/25 text-center">
                Need an account? Contact your administrator.
              </p>
            </div>
          </div>

          {/* Bottom features */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5 sm:mt-6">
            {[
              { icon: <Zap className="w-3.5 h-3.5" />, text: 'Bulk Videos', color: 'text-indigo-400' },
              { icon: <Mic className="w-3.5 h-3.5" />, text: 'AI Voices', color: 'text-violet-400' },
              { icon: <Sparkles className="w-3.5 h-3.5" />, text: 'Smart Effects', color: 'text-purple-400' },
            ].map((f, i) => (
              <div key={i} className="bg-indigo-500/[0.03] border border-indigo-500/[0.06] rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-center hover:border-indigo-500/[0.12] transition-colors">
                <div className={`${f.color} flex justify-center mb-1`}>{f.icon}</div>
                <p className="text-[9px] sm:text-[10px] text-indigo-200/30 font-medium">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-4 sm:pb-6">
        <p className="text-[9px] sm:text-[10px] text-indigo-300/15">VideoText Pro v2.0 — Enterprise Video Automation</p>
      </div>
    </div>
  );
}

