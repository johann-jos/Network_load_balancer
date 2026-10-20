'use client';

import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Play, SkipForward, XCircle, Sparkles, CheckCircle } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { demoState, nextDemoStep, stopDemoMode } = useSimulation();

  if (!demoState.active) return null;

  const progressPercent = Math.round((demoState.currentStep / demoState.totalSteps) * 100);

  return (
    <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-2 border-purple-500/80 rounded-xl p-4 shadow-2xl shadow-purple-950/60 mb-6 relative overflow-hidden animate-glow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/40 shrink-0">
            <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-purple-500 text-white">
                STEP {demoState.currentStep} OF {demoState.totalSteps}
              </span>
              <h3 className="text-sm font-bold text-white font-mono">{demoState.stepTitle}</h3>
            </div>
            <p className="text-xs text-purple-200 mt-1 leading-relaxed max-w-3xl">
              {demoState.description}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          {demoState.currentStep < demoState.totalSteps ? (
            <button
              onClick={nextDemoStep}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition-all shadow-lg shadow-purple-900/40 font-mono"
            >
              <span>NEXT STEP ({demoState.currentStep + 1}/{demoState.totalSteps})</span>
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <div className="flex items-center space-x-1 text-emerald-400 font-mono text-xs font-bold px-3 py-2 bg-emerald-950/80 border border-emerald-700/60 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span>DEMO COMPLETE!</span>
            </div>
          )}

          <button
            onClick={stopDemoMode}
            className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>EXIT DEMO</span>
          </button>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
