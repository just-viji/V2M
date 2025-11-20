import React from "react";
import { Song } from "../types";

const SoundWaveIcon = () => (
  <div className="sound-wave-icon"><span></span><span></span><span></span></div>
);

interface SongListItemProps {
    song: Song;
    context: Song[]; // The list this song belongs to
    isPlaying: boolean;
    isCurrent: boolean;
    onPlay: (s: Song, context: Song[]) => void;
    actionButton: React.ReactNode;
}

export const SongListItem: React.FC<SongListItemProps> = React.memo(({ song, context, isPlaying, isCurrent, onPlay, actionButton }) => (
  <div className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg cursor-pointer ripple group transition-all duration-200 hover:-translate-y-0.5" onClick={() => onPlay(song, context)}>
    <div className="relative h-12 w-12 flex-shrink-0">
        <img src={song.coverUrl} className="h-full w-full rounded-md shadow bg-neutral-800 object-cover" alt="cover" />
        {isCurrent && isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md backdrop-blur-[1px]">
                <SoundWaveIcon />
            </div>
        )}
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className={`truncate font-medium text-base ${isCurrent ? 'text-amber-400' : 'text-white'}`}>{song.title}</div>
        <div className="truncate text-sm text-neutral-400">{song.artist}</div>
    </div>
    <div className="text-sm text-neutral-500 font-mono mr-2">{song.duration}</div>
    <div className="flex items-center z-10" onClick={(e) => e.stopPropagation()}>{actionButton}</div>
  </div>
));