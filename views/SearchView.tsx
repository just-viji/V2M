import React from "react";
import { Search as SearchIcon, Heart } from "lucide-react";
import { Song } from "../types";
import { useSearch } from "../hooks/useSearch";
import { SongListItem } from "../components/SongListItem";

interface SearchViewProps {
    onPlay: (s: Song, context: Song[]) => void;
    currentSong: Song | null;
    isPlaying: boolean;
    toggleLike: (id: string) => void;
    library: Song[];
    className?: string;
}

export const SearchView: React.FC<SearchViewProps> = ({ onPlay, currentSong, isPlaying, toggleLike, library, className, ...props }) => {
    const { query, setQuery, results, performSearch } = useSearch(library);

    return (
        <div className={`${className} p-6 pb-32 min-h-full`} {...props}>
            <form onSubmit={(e) => { e.preventDefault(); performSearch(query); }} className="sticky top-0 z-10 pt-2 pb-4 bg-neutral-900">
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-3.5 text-neutral-400" size={20} />
                    <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your library..."
                        className="w-full bg-neutral-800/90 backdrop-blur rounded-full pl-12 pr-5 py-3 text-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow shadow-lg" />
                </div>
            </form>

            <div className="mt-4">
                {results.length > 0 ? (
                    <div className="space-y-1">
                        {results.map(song => (
                            <SongListItem key={song.id} song={song} context={results} isPlaying={isPlaying} isCurrent={currentSong?.id === song.id} onPlay={onPlay}
                                actionButton={
                                    <button className="p-2 text-neutral-400 hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}>
                                        <Heart size={20} fill={song.isLiked ? 'var(--accent)' : 'none'} className={song.isLiked ? 'text-amber-400' : ''} />
                                    </button>
                                } />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-neutral-500 mt-20">
                        <SearchIcon size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{query ? "No songs found in your library." : "Search for artists, songs, or albums in your collection."}</p>
                    </div>
                )}
            </div>
        </div>
    );
};