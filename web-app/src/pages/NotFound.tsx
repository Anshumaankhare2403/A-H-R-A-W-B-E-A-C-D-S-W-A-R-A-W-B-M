import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 rounded-full bg-cyan-500/10 text-cyan-500 mb-4 border border-cyan-500/20">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
        404 - Endpoint Not Found
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
        The requested monitoring view does not exist or has been relocated within the telemetry dashboard.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Security Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;

