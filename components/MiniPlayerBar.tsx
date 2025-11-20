import React from "react";
import { Play, Pause, Heart } from "lucide-react";
import { Song } from "../types";

interface MiniPlayerBarProps {
    currentSong: Song | null;
    isPlaying: boolean;
    currentTime: number;
    onPlayPause: () => void;
    onOpenFull: () => void;
    toggleLike: (id: string) => void;
    isLiked?: boolean;
}

export const MiniPlayerBar: React.FC<MiniPlayerBarProps> = ({ currentSong, isPlaying, currentTime, onPlayPause, onOpenFull, toggleLike, isLiked }) => {
    if (!currentSong) return null;
    const progress = (currentTime / currentSong.durationSec) * 100 || 0;
    
    return (
        <div 
            className="glassmorphic border rounded-2xl h-full flex items-center p-3 gap-4 shadow-2xl shadow-black/30 overflow-hidden pointer-events-auto cursor-pointer group"
            onClick={onOpenFull}
        >
            <div className="player-art-bg" style={{ backgroundImage: `url(${currentSong.coverUrl})`, filter: 'blur(10px) brightness(0.6)' }} />
            
            {/* Progress Bar (Top) */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
                <div className="h-full bg-amber-500 transition-all duration-150" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="flex items-center gap-4 flex-1 min-w-0 z-10">
                <img src={currentSong.coverUrl} className="h-14 w-14 rounded-lg shadow-md object-cover" alt="cover" />
                <div className="flex flex-col justify-center overflow-hidden">
                    <div className="font-bold text-base text-white truncate">{currentSong.title}</div>
                    <div className="text-sm text-neutral-400 truncate">{currentSong.artist}</div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 z-10">
                <button onClick={(e) => { e.stopPropagation(); toggleLike(currentSong.id); }} className="p-2 text-neutral-400 hover:text-white transition-colors hover:scale-110 active:scale-95">
                    <Heart size={24} fill={isLiked ? '#f59e0b' : 'none'} className={isLiked ? 'text-amber-500' : ''} />
                </button>
                
                <button className="bg-white text-black rounded-full h-12 w-12 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg" onClick={(e) => { e.stopPropagation(); onPlayPause(); }}>
                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>
            </div>
        </div>
    );
};