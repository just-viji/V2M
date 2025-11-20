
import { useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Playlist } from "../types";

export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlaylists = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('playlists').select('*').order('created_at', { ascending: false });
    if (data) {
      setPlaylists(data.map(p => ({
        id: p.id,
        name: p.name,
        songIds: p.song_ids || [],
        createdAt: p.created_at
      })));
    }
    if (error) console.error("Error fetching playlists:", error);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const createPlaylist = useCallback(async (name: string) => {
    const newPlaylist = { name, song_ids: [] };
    const { data, error } = await supabase.from('playlists').insert([newPlaylist]).select().single();
    
    if (data) {
      setPlaylists(prev => [{
        id: data.id,
        name: data.name,
        songIds: [],
        createdAt: data.created_at
      }, ...prev]);
      return true;
    }
    if (error) console.error("Error creating playlist:", error);
    return false;
  }, []);

  const deletePlaylist = useCallback(async (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    await supabase.from('playlists').delete().eq('id', id);
  }, []);

  const addSongToPlaylist = useCallback(async (playlistId: string, songId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    
    if (playlist.songIds.includes(songId)) return; // Already exists

    const newSongIds = [...playlist.songIds, songId];
    
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, songIds: newSongIds } : p));
    await supabase.from('playlists').update({ song_ids: newSongIds }).eq('id', playlistId);
  }, [playlists]);

  const removeSongFromPlaylist = useCallback(async (playlistId: string, songId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const newSongIds = playlist.songIds.filter(id => id !== songId);

    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, songIds: newSongIds } : p));
    await supabase.from('playlists').update({ song_ids: newSongIds }).eq('id', playlistId);
  }, [playlists]);

  return { playlists, isLoading, createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist };
};
