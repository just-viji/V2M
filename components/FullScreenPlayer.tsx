import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronDown, Shuffle, Repeat, Repeat1, Volume2, VolumeX, ListMusic, Moon } from "lucide-react";
import { Song, RepeatMode } from "../types";
import { formatTime } from "../lib/utils";
import { QueueView } from "./QueueView";
import { SleepTimerModal } from "./SleepTimerModal";

const VolumeControl = ({ volume, setVolume }: { volume: number, setVolume: (v: number) => void }) => {
    const [showSlider, setShowSlider] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSlider(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative flex flex-col items-center">
            {showSlider && (
                <div className="absolute bottom-12 w-8 h-32 glassmorphic rounded-full p-2 flex justify-center border animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        {...{ orient: "vertical" } as any}
                        className="h-full w-full accent-amber-500 cursor-pointer"
                        style={{ WebkitAppearance: 'slider-vertical' }}
                    />
                </div>
            )}
            <button onClick={() => setShowSlider(s => !s)} className="p-2 text-neutral-400 hover:text-white transition-colors">
                {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
        </div>
    )
}

interface FullScreenPlayerProps {
    song: Song;
    isPlaying: boolean;
    currentTime: number;
    volume: number;
    shuffle: boolean;
    repeatMode: RepeatMode;
    playQueue: Song[];
    onPlayPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    onSeek: (time: number) => void;
    onSeekStart: () => void;
    onSeekEnd: (time: number) => void;
    setVolume: (vol: number) => void;
    toggleShuffle: () => void;
    cycleRepeat: () => void;
    onClose: () => void;
    toggleLike: (id: string) => void;
    isLiked?: boolean;
    setPlayQueue: (queue: Song[]) => void;
    onJumpToQueueIndex: (index: number) => void;
    
    sleepTimerDuration?: number | null;
    setSleepTimer?: (minutes: number) => void;
    cancelSleepTimer?: () => void;
    isTimerActive?: boolean;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({ song, isPlaying, currentTime, volume, shuffle, repeatMode, playQueue, onPlayPause, onNext, onPrev, onSeek, onSeekStart, onSeekEnd, setVolume, toggleShuffle, cycleRepeat, onClose, toggleLike, isLiked, setPlayQueue, onJumpToQueueIndex, sleepTimerDuration, setSleepTimer, cancelSleepTimer, isTimerActive }) => {
    const progress = (currentTime / song.durationSec) * 100 || 0;
    const [showQueue, setShowQueue] = useState(false);
    const [showSleepTimer, setShowSleepTimer] = useState(false);
    const [likedState, setLikedState] = useState(isLiked);

    const handleLikeClick = () => {
        toggleLike(song.id);
        setLikedState(!likedState);
    };

    useEffect(() => {
        setLikedState(isLiked);
    }, [isLiked]);

    return (
        <div className="fixed inset-0 bg-neutral-900 z-50 flex flex-col text-white">
            {/* Background Layers */}
            <div 
                className="absolute inset-0 transition-all duration-700" 
                style={{ background: `linear-gradient(to top, rgba(18, 18, 18, 1) 0%, rgba(18, 18, 18, 0.7) 40%, transparent 100%), url(${song.coverUrl})` , backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
                <div className="absolute inset-0 bg-black/20 backdrop-blur-2xl" />
            </div>
            
            {/* Main Container */}
            <div className="relative z-10 flex flex-col h-full px-6 pt-12 pb-8">
                
                {/* Header */}
                <div className="flex justify-between items-center w-full mb-8 flex-shrink-0">
                    <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-lg group">
                        <ChevronDown size={28} className="text-neutral-200 group-hover:text-white" />
                    </button>
                    <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/50">Playing from Your Library</p>
                        <p className="text-sm font-medium text-white/80 truncate max-w-[200px]">{song.album}</p>
                    </div>
                    <button onClick={() => setShowQueue(true)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-lg group">
                        <ListMusic size={24} className="text-neutral-200 group-hover:text-white" />
                    </button>
                </div>

                {/* Album Art */}
                <div className="flex-1 flex items-center justify-center w-full min-h-0">
                    <div className="relative w-full max-w-sm aspect-square rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]">
                        <img 
                            src={song.coverUrl} 
                            className="w-full h-full object-cover rounded-2xl" 
                            alt="Album Art" 
                        />
                         <div className="absolute inset-0 rounded-2xl border border-white/10" />
                    </div>
                </div>

                {/* Info & Controls Area */}
                <div className="flex-shrink-0 w-full max-w-sm mx-auto pt-8 space-y-6">
                    
                    <div className="flex justify-between items-center">
                        <div className="text-left w-full space-y-1">
                            <h2 className="text-2xl font-bold truncate leading-tight text-white">
                                {song.title}
                            </h2>
                            <p className="text-base text-neutral-300 truncate">
                                {song.artist}
                            </p>
                        </div>
                        <button onClick={handleLikeClick} className={`p-2 ml-4 like-button ${likedState ? 'liked' : ''}`}>
                            <span className="burst"></span>
                             <Heart size={24} fill={likedState ? '#f59e0b' : 'none'} className={`heart-icon ${likedState ? 'text-amber-500' : 'text-neutral-400'}`} />
                        </button>
                    </div>
                    
                    {/* Seek Bar */}
                    <div className="w-full space-y-2 group">
                        <div className="relative h-1 w-full rounded-full bg-white/20 overflow-hidden">
                             <div className="h-full rounded-full bg-white transition-all group-hover:bg-amber-400" style={{ width: `${progress}%` }} />
                             <input 
                                type="range" 
                                min={0} 
                                max={song.durationSec || 1} 
                                value={currentTime}
                                onChange={(e) => onSeek(Number(e.target.value))} 
                                onMouseDown={onSeekStart} 
                                onMouseUp={(e) => onSeekEnd(Number((e.target as HTMLInputElement).value))}
                                className="absolute inset-y-[-6px] w-full h-4 opacity-0 cursor-pointer z-10" 
                             />
                        </div>
                        <div className="flex justify-between text-xs text-neutral-400 font-mono">
                            <span>{formatTime(currentTime)}</span>
                            <span>{song.duration}</span>
                        </div>
                    </div>

                    {/* Main Playback Buttons */}
                    <div className="flex items-center justify-between">
                        <button onClick={toggleShuffle} className={`p-2 transition-all hover:scale-110 ${shuffle ? 'text-amber-400' : 'text-neutral-400 hover:text-white'}`}>
                            <Shuffle size={20} />
                        </button>
                        
                        <div className="flex items-center gap-4">
                             <button onClick={onPrev} className="p-2 text-neutral-200 hover:text-white transition-all hover:scale-110 active:scale-95">
                                 <SkipBack size={32} fill="currentColor" />
                             </button>
                             
                             <button 
                                className="bg-white text-black rounded-full p-5 hover:scale-105 active:scale-95 transition-all shadow-lg" 
                                onClick={onPlayPause}
                             >
                                {isPlaying ? <Pause fill="currentColor" size={32} /> : <Play fill="currentColor" size={32} className="ml-1" />}
                             </button>
                             
                             <button onClick={onNext} className="p-2 text-neutral-200 hover:text-white transition-all hover:scale-110 active:scale-95">
                                 <SkipForward size={32} fill="currentColor" />
                             </button>
                        </div>

                        <button onClick={cycleRepeat} className={`p-2 transition-all hover:scale-110 ${repeatMode !== 'none' ? 'text-amber-400' : 'text-neutral-400 hover:text-white'}`}>
                            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                        </button>
                    </div>

                    {/* Bottom controls */}
                    <div className="flex items-center justify-between pt-2">
                         <button onClick={() => setShowSleepTimer(true)} className={`p-2 transition-colors hover:text-white relative ${isTimerActive ? 'text-amber-400' : 'text-neutral-400'}`}>
                            <Moon size={20} fill={isTimerActive ? 'currentColor' : 'none'} />
                            {isTimerActive && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                         </button>
                         <VolumeControl volume={volume} setVolume={setVolume} />
                         <div className="w-10"></div> 
                    </div>
                </div>
            </div>
            
            {showQueue && (
                <QueueView 
                    queue={playQueue} 
                    currentSongId={song.id}
                    onClose={() => setShowQueue(false)}
                    onReorder={setPlayQueue}
                    onPlayFromQueue={onJumpToQueueIndex}
                />
            )}

            {showSleepTimer && (
                <SleepTimerModal 
                    onClose={() => setShowSleepTimer(false)}
                    onSetTimer={setSleepTimer!}
                    onCancelTimer={cancelSleepTimer!}
                    remainingTime={sleepTimerDuration!}
                />
            )}
        </div>
    );
};