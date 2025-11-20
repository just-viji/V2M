import React from "react";
import { X, Moon, Timer } from "lucide-react";

interface SleepTimerModalProps {
    onClose: () => void;
    onSetTimer: (minutes: number) => void;
    onCancelTimer: () => void;
    remainingTime: number | null;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ onClose, onSetTimer, onCancelTimer, remainingTime }) => {
    const presets = [15, 30, 45, 60];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-neutral-800 rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl border border-neutral-700 animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-neutral-700 flex justify-between items-center bg-neutral-900/50">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <Moon size={20} className="text-amber-400" />
                        Sleep Timer
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {remainingTime !== null ? (
                        <div className="text-center space-y-4 py-4">
                            <div className="text-4xl font-mono font-bold text-amber-400 tabular-nums">
                                {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
                            </div>
                            <p className="text-sm text-neutral-400">Music will stop when the timer ends.</p>
                            <button 
                                onClick={() => { onCancelTimer(); onClose(); }}
                                className="w-full py-3 rounded-xl font-bold bg-neutral-700 text-white hover:bg-neutral-600 transition-colors"
                            >
                                Turn Off Timer
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {presets.map(min => (
                                <button 
                                    key={min} 
                                    onClick={() => { onSetTimer(min); onClose(); }}
                                    className="py-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white font-medium transition-colors flex flex-col items-center gap-1"
                                >
                                    <span className="text-lg font-bold">{min}</span>
                                    <span className="text-xs text-neutral-400">min</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};