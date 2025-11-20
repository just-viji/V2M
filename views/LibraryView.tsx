
import React, { useState, useMemo } from "react";
import { Library as LibraryIcon, Heart, Plus, Music, ListPlus, ArrowLeft, Trash2, Play } from "lucide-react";
import { Song, Playlist } from "../types";
import { SongListItem } from "../components/SongListItem";
import { AddToPlaylistModal } from "../components/AddToPlaylistModal";
import { SkeletonSongListItem, SkeletonPlaylistCard } from "../components/SkeletonLoader";


interface LibraryViewProps {
    library: Song[];
    playlists: Playlist[];
    isLoading: boolean;
    onPlay: (s: Song, context: Song[]) => void;
    currentSong: Song | null;
    isPlaying: boolean;
    toggleLike: (id: string) => void;
    removeSong: (id: string) => void;
    onImport: () => void;
    isImporting: boolean;
    importStatus: string;
    importProgress: number;
    createPlaylist: (name: string) => void;
    deletePlaylist: (id: string) => void;
    addSongToPlaylist: (pid: string, sid: string) => void;
    removeSongFromPlaylist: (pid: string, sid: string) => void;
    className?: string;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ 
    library, playlists, isLoading, onPlay, currentSong, isPlaying, 
    toggleLike, removeSong, onImport, isImporting, importStatus, importProgress,
    createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist,
    className, ...props
}) => {
    const [activeTab, setActiveTab] = useState<'songs' | 'playlists'>('songs');
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [songToAdd, setSongToAdd] = useState<string | null>(null);

    const likedSongsPlaylist = useMemo(() => ({
        id: 'liked-songs',
        name: 'Liked Songs',
        songIds: library.filter(s => s.isLiked).map(s => s.id),
        createdAt: new Date().toISOString()
    } as Playlist), [library]);
    
    const selectedPlaylist = useMemo(() => {
        if (selectedPlaylistId === 'liked-songs') return likedSongsPlaylist;
        return playlists.find(p => p.id === selectedPlaylistId);
    }, [playlists, selectedPlaylistId, likedSongsPlaylist]);

    const playlistSongs = useMemo(() => {
        if (!selectedPlaylist) return [];
        return selectedPlaylist.songIds
            .map(id => library.find(s => s.id === id))
            .filter((s): s is Song => !!s);
    }, [selectedPlaylist, library]);

    const handleCreatePlaylist = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPlaylistName.trim()) {
            createPlaylist(newPlaylistName.trim());
            setNewPlaylistName("");
            setShowCreateModal(false);
        }
    };

    const handleBack = () => {
        setSelectedPlaylistId(null);
    };

    const playPlaylist = () => {
        if (playlistSongs.length > 0) onPlay(playlistSongs[0], playlistSongs);
    };

    const handlePlaylistClick = (playlist: Playlist) => {
        setSelectedPlaylistId(playlist.id);
    };

    if (selectedPlaylist) {
        const isLikedSongsPlaylist = selectedPlaylist.id === 'liked-songs';

        return (
            <div className={`${className} pb-32 min-h-full`} {...props}>
                <div className="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur-md p-4 border-b border-white/5 flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft size={24} className="text-white" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-white truncate">{selectedPlaylist.name}</h2>
                        <p className="text-sm text-neutral-400">{playlistSongs.length} songs</p>
                    </div>
                    {!isLikedSongsPlaylist && (
                        <button onClick={() => { deletePlaylist(selectedPlaylist.id); handleBack(); }} className="p-2 rounded-full hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors">
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>

                {playlistSongs.length > 0 ? (
                    <div className="p-2">
                        <button onClick={playPlaylist} className="w-full mb-4 bg-amber-500 hover:bg-amber-400 text-black p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                            <Play fill="currentColor" size={20} /> Play All
                        </button>
                        <div className="space-y-1">
                            {playlistSongs.map((song) => (
                                <SongListItem key={`${song.id}-${selectedPlaylist.id}`} song={song} context={playlistSongs} isPlaying={isPlaying} isCurrent={currentSong?.id === song.id} onPlay={onPlay}
                                    actionButton={
                                        <div className="flex items-center">
                                             <button className="p-2 text-neutral-400 hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}>
                                                <Heart size={20} fill={song.isLiked ? 'var(--accent)' : 'none'} className={song.isLiked ? 'text-amber-400' : ''} />
                                            </button>
                                            {!isLikedSongsPlaylist && (
                                                <button className="p-2 text-neutral-400 hover:text-red-400 transition-colors" onClick={(e) => { e.stopPropagation(); removeSongFromPlaylist(selectedPlaylist.id, song.id); }}>
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </div>
                                    } />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-neutral-500">
                        <Music size={48} className="mb-4 opacity-20" />
                        <p>This playlist is empty.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`${className} relative h-full pb-32`} {...props}>
            {/* Tabs */}
            <div className="flex items-center gap-2 p-4 sticky top-0 bg-neutral-900/95 backdrop-blur z-10 border-b border-white/5">
                <button onClick={() => setActiveTab('songs')} 
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'songs' ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
                    Songs
                </button>
                <button onClick={() => setActiveTab('playlists')} 
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'playlists' ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
                    Playlists
                </button>
            </div>
            
            {/* Songs View */}
            {activeTab === 'songs' && (
                isLoading ? (
                     <div className="space-y-1 p-2">
                        {Array(10).fill(0).map((_, i) => <SkeletonSongListItem key={i} />)}
                     </div>
                ) : library.length > 0 ? (
                    <div className="space-y-1 p-2">
                        {library.map((song: Song) => (
                            <SongListItem key={song.id} song={song} context={library} isPlaying={isPlaying} isCurrent={currentSong?.id === song.id} onPlay={onPlay}
                                actionButton={
                                    <div className="flex items-center">
                                        <button className="p-2 text-neutral-400 hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}>
                                            <Heart size={20} fill={song.isLiked ? 'var(--accent)' : 'none'} className={song.isLiked ? 'text-amber-400' : ''} />
                                        </button>
                                        <button className="p-2 text-neutral-400 hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); setSongToAdd(song.id); }}>
                                            <ListPlus size={20} />
                                        </button>
                                    </div>
                                } />
                        ))}
                    </div> 
                ) : (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center text-neutral-400 p-6">
                        <div className="bg-neutral-800/50 p-6 rounded-full mb-6">
                            <LibraryIcon size={48} className="text-neutral-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Your library is empty</h3>
                        <p className="max-w-xs text-sm text-neutral-500">Import your local MP3s to build your collection.</p>
                    </div>
                )
            )}

            {/* Playlists View */}
            {activeTab === 'playlists' && (
                isLoading ? (
                    <div className="p-4 grid grid-cols-2 gap-4">
                        {Array(4).fill(0).map((_, i) => <SkeletonPlaylistCard key={i} />)}
                    </div>
                ) : (
                    <div className="p-4 grid grid-cols-2 gap-4">
                        <button onClick={() => setShowCreateModal(true)} className="aspect-square rounded-2xl border-2 border-dashed border-neutral-700 hover:border-amber-500/50 hover:bg-neutral-800/50 flex flex-col items-center justify-center gap-2 group transition-all">
                            <div className="p-3 rounded-full bg-neutral-800 group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-colors">
                                <Plus size={32} className="text-neutral-400 group-hover:text-amber-400" />
                            </div>
                            <span className="font-medium text-neutral-400 group-hover:text-white">Create New</span>
                        </button>

                        <div onClick={() => setSelectedPlaylistId('liked-songs')} className="aspect-square rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer group relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                                <Heart size={64} fill="currentColor" className="text-white" />
                            </div>
                            <div className="z-10 h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center text-white mb-2">
                                <Heart size={24} fill="currentColor" />
                            </div>
                            <div className="z-10">
                                <h3 className="font-bold text-white truncate">Liked Songs</h3>
                                <p className="text-xs text-white/80">{likedSongsPlaylist.songIds.length} songs</p>
                            </div>
                        </div>

                        {playlists.map(playlist => (
                            <div key={playlist.id} onClick={() => handlePlaylistClick(playlist)} className="aspect-square rounded-2xl bg-neutral-800 p-4 flex flex-col justify-between hover:bg-neutral-700 transition-colors cursor-pointer group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Music size={64} />
                                </div>
                                <div className="z-10 h-12 w-12 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 mb-2">
                                    <Music size={24} />
                                </div>
                                <div className="z-10">
                                    <h3 className="font-bold text-white truncate">{playlist.name}</h3>
                                    <p className="text-xs text-neutral-500">{playlist.songIds.length} songs</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
            
            {activeTab === 'songs' && (
                <div className={`fixed ${currentSong ? 'bottom-48' : 'bottom-24'} right-6 flex flex-col items-end gap-3 z-30 transition-all duration-300`}>
                     {isImporting && (
                        <div className="bg-neutral-800 border border-neutral-700 p-3 rounded-xl text-xs text-neutral-300 shadow-2xl animate-in slide-in-from-right flex flex-col gap-2 w-56">
                           <div className="flex justify-between items-center text-neutral-400">
                                <span>Importing...</span>
                                <span>{importProgress}%</span>
                           </div>
                           <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-amber-500 transition-all duration-300 ease-out rounded-full" 
                                    style={{ width: `${importProgress}%` }}
                                />
                           </div>
                           <div className="truncate text-[10px] text-neutral-500">{importStatus}</div>
                        </div>
                    )}
                    <button onClick={onImport} disabled={isImporting} 
                        className="bg-amber-500 hover:bg-amber-400 text-black p-4 rounded-full shadow-lg shadow-amber-500/20 hover:scale-110 active:scale-95 transition-all ripple disabled:opacity-50 disabled:scale-100">
                        <Plus size={28} />
                    </button>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-neutral-800 p-6 rounded-2xl w-full max-w-sm border border-neutral-700 shadow-2xl scale-100">
                        <h3 className="text-xl font-bold text-white mb-4">Create Playlist</h3>
                        <form onSubmit={handleCreatePlaylist}>
                            <input autoFocus type="text" placeholder="Playlist name" className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none mb-6" value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 rounded-xl font-medium text-neutral-300 hover:bg-neutral-700 transition-colors">Cancel</button>
                                <button type="submit" disabled={!newPlaylistName.trim()} className="flex-1 py-3 rounded-xl font-bold bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {songToAdd && (
                <AddToPlaylistModal playlists={playlists} onClose={() => setSongToAdd(null)} onSelect={(pid) => { addSongToPlaylist(pid, songToAdd); setSongToAdd(null); }} onCreateNew={() => { setShowCreateModal(true); }} />
            )}
        </div>
    );
};
