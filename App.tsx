import React, { useState, useRef, useEffect } from "react";
import { ViewState } from "./types";
import { useLibrary } from "./hooks/useLibrary";
import { usePlaylists } from "./hooks/usePlaylists";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { FullScreenPlayer } from "./components/FullScreenPlayer";
import { TopAppBar, BottomNavBar } from "./components/Navigation";
import { MiniPlayerBar } from "./components/MiniPlayerBar";
import { HomeView } from "./views/HomeView";
import { SearchView } from "./views/SearchView";
import { LibraryView } from "./views/LibraryView";

const App = () => {
  const [view, setView] = useState<ViewState>("home");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [scrollPositions, setScrollPositions] = useState<Record<ViewState, number>>({ home: 0, search: 0, library: 0 });
  const viewRefs = {
    home: useRef<HTMLDivElement>(null),
    search: useRef<HTMLDivElement>(null),
    library: useRef<HTMLDivElement>(null),
  };
  const currentViewRef = viewRefs[view];
  
  const fileRef = useRef<HTMLInputElement>(null);

  const { library, isLoading, isImporting, importStatus, importProgress, toggleLike, removeSong, uploadFiles, updateSongDuration } = useLibrary();
  const { playlists, createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist } = usePlaylists();
  const player = useAudioPlayer(updateSongDuration);
  
  useEffect(() => {
    const el = currentViewRef.current;
    if (!el) return;
    const onScroll = () => setIsScrolled(el.scrollTop > 10);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [view, currentViewRef]);

  useEffect(() => {
    if (currentViewRef.current) {
        currentViewRef.current.scrollTop = scrollPositions[view];
    }
  }, [view, currentViewRef, scrollPositions]);

  const viewTitles: Record<ViewState, string> = { home: "Home", search: "Search", library: "Your Library" };

  const handleSetView = (newView: ViewState) => {
    if (newView === view) return;
    if (currentViewRef.current) {
        setScrollPositions(prev => ({ ...prev, [view]: currentViewRef.current!.scrollTop }));
    }
    setView(newView);
  };
  
  const handleOpenFullPlayer = () => {
    setIsFullScreen(true);
  };

  const handleCloseFullPlayer = () => {
      setIsFullScreen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) uploadFiles(e.target.files);
      if (fileRef.current) fileRef.current.value = "";
  };
  
  const renderView = (v: ViewState) => {
    const isVisible = v === view;
    if (!isVisible) return null;
    const paddingBottomClass = 'pb-4';
    const props = { className: `view overflow-y-auto scroll-smooth h-full ${paddingBottomClass}`, ref: viewRefs[v] };
    
    switch (v) {
      case 'home': return <HomeView {...props} library={library} onPlay={player.playSongFromContext} isLoading={isLoading} />;
      case 'search': return <SearchView {...props} onPlay={player.playSongFromContext} currentSong={player.currentSong} isPlaying={player.isPlaying} toggleLike={toggleLike} library={library} />;
      case 'library': return <LibraryView {...props} library={library} playlists={playlists} isLoading={isLoading} onPlay={player.playSongFromContext} currentSong={player.currentSong} isPlaying={player.isPlaying} toggleLike={toggleLike} removeSong={removeSong} onImport={() => fileRef.current?.click()} isImporting={isImporting} importStatus={importStatus} importProgress={importProgress} createPlaylist={createPlaylist} deletePlaylist={deletePlaylist} addSongToPlaylist={addSongToPlaylist} removeSongFromPlaylist={removeSongFromPlaylist} />;
      default: return null;
    }
  };

  return (
    <div className="h-screen w-screen bg-neutral-900 text-white flex flex-col antialiased overflow-hidden selection:bg-amber-500/30">
      <div className={`relative flex-1 flex flex-col min-h-0 transition-opacity duration-300`}>
        <TopAppBar title={viewTitles[view]} scrolled={isScrolled} />
        
        {/* Main content and player container */}
        <div className="flex-1 flex flex-col min-h-0">
          <main className="relative flex-1 min-h-0">
            {renderView('home')}
            {renderView('search')}
            {renderView('library')}
          </main>
          
          {/* MiniPlayerBar container */}
          <div className={`shrink-0 z-20 transition-all duration-300 ease-in-out ${!player.currentSong ? 'h-0 opacity-0 pointer-events-none' : 'h-20 px-4 opacity-100'}`}>
            {player.currentSong && (
                <MiniPlayerBar 
                  currentSong={player.currentSong}
                  isPlaying={player.isPlaying}
                  currentTime={player.currentTime}
                  onPlayPause={player.togglePlay}
                  onOpenFull={handleOpenFullPlayer}
                  toggleLike={toggleLike}
                  isLiked={library.find(s => s.id === player.currentSong?.id)?.isLiked}
                />
            )}
          </div>
        </div>

        <BottomNavBar view={view} setView={handleSetView} />
      </div>

      {isFullScreen && player.currentSong && (
        <FullScreenPlayer 
            song={player.currentSong} 
            onClose={handleCloseFullPlayer} 
            isPlaying={player.isPlaying}
            currentTime={player.currentTime}
            volume={player.volume}
            shuffle={player.shuffle}
            repeatMode={player.repeatMode}
            playQueue={player.playQueue}
            onPlayPause={player.togglePlay}
            onNext={player.nextSong}
            onPrev={player.prevSong}
            onSeek={player.seek}
            onSeekStart={() => player.setIsSeeking(true)}
            onSeekEnd={player.seek}
            setVolume={player.setVolume}
            toggleShuffle={player.setShuffle}
            cycleRepeat={player.setRepeatMode}
            toggleLike={toggleLike}
            isLiked={library.find(s => s.id === player.currentSong?.id)?.isLiked}
            setPlayQueue={player.setPlayQueue}
            onJumpToQueueIndex={player.jumpToQueueIndex}
        />
      )}
      <input type="file" ref={fileRef} onChange={handleFileChange} multiple accept=".mp3" className="hidden" />
    </div>
  );
};

export default App;