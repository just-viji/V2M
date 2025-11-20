
import { useState, useEffect, useRef, useCallback } from "react";
import { Song, RepeatMode } from "../types";
import { shuffleArray } from "../lib/utils";

export const useAudioPlayer = (updateDuration?: (id: string, dur: number) => void) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current) audioRef.current = new Audio();

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  
  const [playQueue, setPlayQueue] = useState<Song[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Song[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);

  // Sleep Timer State
  const [sleepTimerDuration, setSleepTimerDuration] = useState<number | null>(null);

  useEffect(() => { 
    if(audioRef.current) audioRef.current.volume = volume; 
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playAudio = async () => {
      try {
        if (currentSong) {
          if (audio.src !== currentSong.url) {
            audio.src = currentSong.url;
            audio.load();
          }
          if (isPlaying) {
             await audio.play();
          } else {
             audio.pause();
          }
        } else {
          audio.pause();
          audio.src = "";
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Playback failed:", error);
        }
      }
    };

    playAudio();
  }, [currentSong, isPlaying]);

  // Sleep Timer Logic
  useEffect(() => {
    if (sleepTimerDuration === null) return;

    if (sleepTimerDuration <= 0) {
        setIsPlaying(false);
        setSleepTimerDuration(null);
        return;
    }

    const interval = setInterval(() => {
        setSleepTimerDuration(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerDuration]);

  const setSleepTimer = useCallback((minutes: number) => {
      setSleepTimerDuration(minutes * 60);
  }, []);

  const cancelSleepTimer = useCallback(() => {
      setSleepTimerDuration(null);
  }, []);

  const playNext = useCallback(() => {
    if (playQueue.length === 0) return;

    let nextIndex = currentQueueIndex + 1;

    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    if (nextIndex >= playQueue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setCurrentQueueIndex(nextIndex);
    setCurrentSong(playQueue[nextIndex]);
    setIsPlaying(true);

  }, [currentQueueIndex, playQueue, repeatMode]);

  const playPrev = useCallback(() => {
    if (!currentSong || !audioRef.current) return;
    if (audioRef.current.currentTime > 3) {
        audioRef.current.currentTime = 0;
    } else {
        const prevIndex = (currentQueueIndex - 1 + playQueue.length) % playQueue.length;
        setCurrentQueueIndex(prevIndex);
        setCurrentSong(playQueue[prevIndex]);
        setIsPlaying(true);
    }
  }, [currentSong, currentQueueIndex, playQueue]);

  const playSongFromContext = useCallback((song: Song, context: Song[]) => {
    if (currentSong?.id === song.id) {
        setIsPlaying(p => !p);
        return;
    }

    const startIndex = context.findIndex(s => s.id === song.id);
    if (startIndex === -1) return;

    setOriginalQueue(context);

    if (shuffle) {
      const firstSong = context[startIndex];
      const restOfSongs = context.filter((_, i) => i !== startIndex);
      const shuffledRest = shuffleArray(restOfSongs);
      const newQueue = [firstSong, ...shuffledRest];
      setPlayQueue(newQueue);
      setCurrentQueueIndex(0);
      setCurrentSong(newQueue[0]);
    } else {
      setPlayQueue(context);
      setCurrentQueueIndex(startIndex);
      setCurrentSong(context[startIndex]);
    }
    
    setIsPlaying(true);
  }, [currentSong, shuffle]);

  const toggleShuffle = useCallback(() => {
    const newShuffleState = !shuffle;
    setShuffle(newShuffleState);
    
    if (newShuffleState) {
        if (playQueue.length > 0 && currentQueueIndex !== -1) {
            const current = playQueue[currentQueueIndex];
            const upcoming = playQueue.slice(currentQueueIndex + 1);
            const pastAndCurrent = playQueue.slice(0, currentQueueIndex + 1);
            if(upcoming.length > 1) {
                const shuffledUpcoming = shuffleArray(upcoming);
                setPlayQueue([...pastAndCurrent, ...shuffledUpcoming]);
            }
        }
    } else {
       // Revert to original order
       const currentOriginalIndex = originalQueue.findIndex(s => s.id === currentSong?.id);
       if (currentOriginalIndex !== -1) {
           setPlayQueue(originalQueue);
           setCurrentQueueIndex(currentOriginalIndex);
       }
    }
  }, [shuffle, playQueue, currentQueueIndex, currentSong, originalQueue]);

  useEffect(() => {
    const audio = audioRef.current;
    if(!audio) return;
    
    const updateTime = () => { 
        if (!isSeeking) setCurrentTime(audio.currentTime); 
    };
    
    const onEnd = () => {
        playNext();
    };

    const onDurationChange = () => {
        if (audio.duration && currentSong && updateDuration) {
             if (currentSong.durationSec === 0 || Math.abs(currentSong.durationSec - audio.duration) > 1) {
                 updateDuration(currentSong.id, audio.duration);
             }
        }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('durationchange', onDurationChange);
    
    return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('ended', onEnd);
        audio.removeEventListener('durationchange', onDurationChange);
    };
  }, [isSeeking, playNext, currentSong, updateDuration]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const cycleRepeatMode = useCallback(() => {
      setRepeatMode(prev => prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none');
  }, []);
  
  const jumpToQueueIndex = useCallback((index: number) => {
      if(index >= 0 && index < playQueue.length) {
          setCurrentQueueIndex(index);
          setCurrentSong(playQueue[index]);
          setIsPlaying(true);
      }
  }, [playQueue]);

  return {
    currentSong, isPlaying, volume, currentTime, shuffle, repeatMode, isSeeking, playQueue,
    playSongFromContext, togglePlay: () => setIsPlaying(p => !p), nextSong: playNext, prevSong: playPrev,
    setVolume, setShuffle: toggleShuffle, setRepeatMode: cycleRepeatMode, seek, setIsSeeking, setPlayQueue,
    jumpToQueueIndex,
    // Sleep Timer Exports
    sleepTimerDuration, setSleepTimer, cancelSleepTimer, isTimerActive: sleepTimerDuration !== null
  };
};
