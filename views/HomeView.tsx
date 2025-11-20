import React, { useMemo } from "react";
import { Song } from "../types";
import { getGreeting } from "../lib/utils";
import { SkeletonGridItem } from "../components/SkeletonLoader";
import { Library } from "lucide-react";

// FIX: Defined a props interface and used React.FC to correctly type the component,
// allowing it to accept React's special `key` prop without TypeScript errors.
interface SongCardProps {
  song: Song;
  context: Song[];
  onPlay: (s: Song, context: Song[]) => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, context, onPlay }) => (
  <div onClick={() => onPlay(song, context)} className="flex-shrink-0 w-40 space-y-3 cursor-pointer group">
    <div className="aspect-square rounded-xl shadow-lg overflow-hidden relative">
      <img src={song.coverUrl} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt={song.title} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
    <div>
      <p className="font-bold text-white truncate group-hover:text-amber-400 transition-colors">{song.title}</p>
      <p className="text-sm text-neutral-400 truncate">{song.artist}</p>
    </div>
  </div>
);

export const HomeView = ({ library, onPlay, isLoading, className, ...props }: { library: Song[], onPlay: (s: Song, context: Song[]) => void, isLoading: boolean, className?: string }) => {
  
  const likedSongs = useMemo(() => library.filter(s => s.isLiked), [library]);
  const recentlyAdded = useMemo(() => library.slice(0, 6), [library]);

  if (isLoading && library.length === 0) {
    return (
       <div className={`${className} p-6 space-y-8 pb-32`} {...props}>
         <h2 className="text-3xl font-bold mb-6 text-white">{getGreeting()}</h2>
         <section>
            <div className="h-6 w-48 mb-4 rounded-md skeleton-shine" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => <SkeletonGridItem key={i} />)}
            </div>
         </section>
          <section>
            <div className="h-6 w-64 mb-4 rounded-md skeleton-shine" />
            <div className="flex gap-6 overflow-hidden">
                {Array(4).fill(0).map((_,i) => (
                    <div key={i} className="flex-shrink-0 w-40 space-y-3">
                        <div className="aspect-square rounded-xl skeleton-shine" />
                        <div className="h-4 w-full rounded skeleton-shine" />
                        <div className="h-3 w-3/4 rounded skeleton-shine" />
                    </div>
                ))}
            </div>
          </section>
      </div>
    );
  }

  if (library.length === 0) {
    return (
      <div className={`${className} flex flex-col items-center justify-center h-full text-center text-neutral-400 p-6 pb-32`} {...props}>
          <div className="bg-neutral-800/50 p-6 rounded-full mb-6">
              <Library size={48} className="text-neutral-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Welcome to Your Music Player</h3>
          <p className="max-w-xs text-sm text-neutral-500">Import music from your library to get started.</p>
      </div>
    );
  }

  return (
    <div className={`${className} p-6 space-y-8 pb-32`} {...props}>
      <h2 className="text-3xl font-bold text-white">{getGreeting()}</h2>
      
      <section>
        <h3 className="text-xl font-bold mb-4 text-white">Recently Added</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {recentlyAdded.map(song => (
            <div key={song.id} onClick={() => onPlay(song, recentlyAdded)} className="flex items-center bg-neutral-800/60 hover:bg-neutral-700/80 backdrop-blur-sm rounded-md shadow-sm cursor-pointer transition-all hover:scale-[1.02] overflow-hidden group">
              <img src={song.coverUrl} className="h-16 w-16 object-cover group-hover:brightness-110 transition-all" alt="cover" />
              <span className="font-medium text-sm p-4 truncate text-neutral-100 group-hover:text-white">{song.title}</span>
            </div>
          ))}
        </div>
      </section>

      {likedSongs.length > 0 && (
          <section>
            <h3 className="text-xl font-bold mb-4 text-white">From Your Liked Songs</h3>
            <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6">
              {likedSongs.slice(0, 10).map(song => (
                <SongCard key={song.id} song={song} context={likedSongs} onPlay={onPlay} />
              ))}
               <div className="w-1 flex-shrink-0" />
            </div>
          </section>
      )}
    </div>
  );
};