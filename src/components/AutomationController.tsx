import React, { useState } from 'react';

interface AutomationControllerProps {
  isRunning: boolean;
  currentStepIndex: number;
  totalSteps: number;
  stepTitle: string;
  stepDescription: string;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  onStop: () => void;
  virtualCursorPosition: { x: number; y: number; clicking: boolean; visible: boolean };
}

export const AutomationController: React.FC<AutomationControllerProps> = ({
  isRunning,
  currentStepIndex,
  totalSteps,
  stepTitle,
  stepDescription,
  playbackSpeed,
  onSpeedChange,
  onStop,
  virtualCursorPosition,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isRunning) return null;

  const progressPercent = Math.min(100, Math.round(((currentStepIndex + 1) / totalSteps) * 100));

  return (
    <>
      {/* VIRTUAL ROBOT CURSOR (Playwright-style on-screen pointer) */}
      {virtualCursorPosition.visible && (
        <div
          id="virtual-robot-pointer"
          className="fixed pointer-events-none z-[9999] transition-all duration-500 ease-out"
          style={{
            left: `${virtualCursorPosition.x}px`,
            top: `${virtualCursorPosition.y}px`,
            transform: 'translate(-6px, -6px)',
          }}
        >
          <div className="relative">
            {/* Pointer SVG */}
            <svg
              className="w-7 h-7 text-sky-500 drop-shadow-lg"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="#ffffff"
              strokeWidth="1.5"
            >
              <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L5.85 2.86a.5.5 0 0 0-.35.35Z" />
            </svg>

            {/* Click Ripple Effect */}
            {virtualCursorPosition.clicking && (
              <span className="absolute -top-3 -left-3 w-12 h-12 rounded-full border-2 border-sky-400 bg-sky-400/40 animate-ping pointer-events-none"></span>
            )}

            {/* Robot Badge */}
            <span className="absolute left-6 -top-1 px-2 py-0.5 rounded-md bg-slate-900 text-sky-300 text-[10px] font-bold whitespace-nowrap shadow-md flex items-center space-x-1 border border-sky-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Autonomous Pilot</span>
            </span>
          </div>
        </div>
      )}

      {/* FLOATING TRANSPARENT AUTOMATION HUD CONTROLLER */}
      <div className="fixed bottom-5 right-5 z-[9990] max-w-sm sm:max-w-md w-full px-3">
        <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-sky-500/30 shadow-sky-950/40 transition-all">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/80">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
                <i className="bi bi-robot text-sm animate-pulse"></i>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-white tracking-wide">Live Autonomous Demo</h4>
                  <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[9px] font-extrabold uppercase tracking-wider border border-sky-400/30">
                    Step {currentStepIndex + 1}/{totalSteps}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {/* Speed Toggle */}
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[10px] font-bold">
                {[1, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => onSpeedChange(spd)}
                    className={`px-1.5 py-0.5 rounded ${
                      playbackSpeed === spd
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Minimize / Expand Button for Mobile */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center transition-all"
                title={isMinimized ? "Expand HUD" : "Minimize HUD"}
              >
                <i className={`bi ${isMinimized ? 'bi-chevron-up' : 'bi-chevron-down'} text-xs`}></i>
              </button>

              {/* Stop Demo Button */}
              <button
                onClick={onStop}
                className="w-7 h-7 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/30 flex items-center justify-center transition-all"
                title="Stop Automation"
              >
                <i className="bi bi-stop-fill text-base"></i>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="mt-3 space-y-2.5">
              {/* Current Action Display */}
              <div>
                <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                  <span>Active Operation:</span>
                </p>
                <p className="text-xs font-bold text-white mt-0.5 line-clamp-1">{stepTitle}</p>
                <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                  {stepDescription}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Progress</span>
                  <span className="text-sky-300 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700/80">
                  <div
                    className="bg-gradient-to-r from-sky-400 to-indigo-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Footer Tip */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center space-x-1 text-emerald-400">
                  <i className="bi bi-volume-up-fill"></i>
                  <span>Audio & Auto-Scroll Active</span>
                </span>
                <span className="text-slate-500 font-mono">Hands-Free Automation</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
