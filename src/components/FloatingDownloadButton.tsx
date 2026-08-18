

export default function FloatingDownloadButton() {

  return (
    <a
      href="https://play.google.com/store/apps/details?id=com.injection"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-950/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-xl shadow-black/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-slate-800 hover:border-teal-500/50 group"
      aria-label="Download PRLT Healthcare App"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 466 511.98" className="h-6 w-auto">
        <g fillRule="nonzero">
          <path fill="#EA4335" d="M199.9 237.8 1.4 470.17c7.22 24.57 30.16 41.81 55.8 41.81 11.16 0 20.93-2.79 29.3-8.37l244.16-139.46L199.9 237.8z"/>
          <path fill="#FBBC04" d="m433.91 205.1-104.65-60-111.61 110.22 113.01 108.83 104.64-58.6c18.14-9.77 30.7-29.3 30.7-50.23-1.4-20.93-13.95-40.46-32.09-50.22z"/>
          <path fill="#34A853" d="M199.42 273.45 329.27 145.1 87.9 8.37C79.53 2.79 68.36 0 57.2 0 30.7 0 6.98 18.14 1.4 41.86l198.02 231.59z"/>
          <path fill="#4285F4" d="M1.39 41.86C0 46.04 0 51.63 0 57.2v397.64c0 5.57 0 9.76 1.4 15.34l216.27-214.86L1.39 41.86z"/>
        </g>
      </svg>
      <div className="text-left leading-none">
        <span className="block text-[9px] text-slate-400 font-medium uppercase tracking-wider">Download App</span>
        <span className="block text-xs font-bold text-white mt-0.5 group-hover:text-teal-400 transition-colors">Google Play</span>
      </div>
      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400"></span>
      </span>
    </a>
  );
}
