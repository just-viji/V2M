
import { useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { mapDbToSong, blobToBase64, formatTime } from "../lib/utils";
import { Song } from "../types";

declare const jsmediatags: any;

export const useLibrary = () => {
  const [library, setLibrary] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState("");
  const [importProgress, setImportProgress] = useState(0);

  const fetchLibrary = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('songs').select('*').order('added_at', { ascending: false });
    if (error) {
      console.error('Error fetching library:', error);
    } else if (data) {
      setLibrary(data.map(mapDbToSong));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const toggleLike = useCallback(async (songId: string) => {
    const songToUpdate = library.find(s => s.id === songId);
    if (!songToUpdate) return;

    const originalIsLiked = songToUpdate.isLiked;
    const newIsLiked = !originalIsLiked;

    // Optimistic UI Update
    setLibrary(prev => prev.map(s => s.id === songId ? { ...s, isLiked: newIsLiked } : s));

    // Async DB operation
    const { error } = await supabase
      .from('songs')
      .update({ is_liked: newIsLiked })
      .eq('id', songId);

    // Revert on error
    if (error) {
      console.error("Error updating like status:", error);
      setLibrary(prev => prev.map(s => s.id === songId ? { ...s, isLiked: originalIsLiked } : s));
    }
  }, [library]);

  const removeSong = useCallback(async (songId: string) => {
    const songToRemove = library.find(s => s.id === songId);
    if (!songToRemove) return;

    const originalLibrary = [...library];
    
    // Optimistic UI Update
    setLibrary(prev => prev.filter(s => s.id !== songId));

    // Async DB operation
    const { error } = await supabase.from('songs').delete().eq('id', songId);

    // Revert on error
    if (error) {
      console.error("Error removing song:", error);
      setLibrary(originalLibrary);
    }
  }, [library]);

  const addToLibrary = useCallback(async (song: Song) => {
    const newSongDb = {
      id: song.id.startsWith('search-') ? crypto.randomUUID() : song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      cover_url: song.coverUrl,
      duration: song.duration,
      duration_sec: song.durationSec,
      url: song.url,
      is_liked: false,
      added_at: new Date().toISOString()
    };

    setLibrary(prev => [mapDbToSong(newSongDb), ...prev]);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const { error } = await supabase.from('songs').insert([newSongDb]);
    if (error) console.error("DB Insert failed:", error);
  }, []);

  const updateSongDuration = useCallback(async (id: string, durationSec: number) => {
      const duration = formatTime(durationSec);
      setLibrary(prev => prev.map(s => s.id === id ? { ...s, duration, durationSec } : s));
      await supabase.from('songs').update({ duration, duration_sec: durationSec }).eq('id', id);
  }, []);

  const uploadFiles = useCallback(async (files: FileList) => {
    setIsImporting(true);
    setImportProgress(0);
    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;
    let processedCount = 0;
    
    for (const file of fileArray) {
      setImportStatus(`Processing ${file.name}...`);
      
      // Calculate duration from audio file
      let durationSec = 0;
      try {
          durationSec = await new Promise((resolve) => {
              const audio = new Audio(URL.createObjectURL(file));
              audio.preload = "metadata";
              audio.onloadedmetadata = () => resolve(audio.duration);
              audio.onerror = () => resolve(0);
          });
      } catch(e) { console.warn("Duration check failed", e); }
      const durationStr = formatTime(durationSec);

      try {
        await new Promise<void>((resolve) => {
          jsmediatags.read(file, {
            onSuccess: async (tag: any) => {
              const tags = tag.tags;
              let coverUrl = `https://placehold.co/300/181818/f59e0b?text=${encodeURIComponent((tags.artist || tags.title || '??').substring(0,2))}`;
              
              if (tags.picture) {
                const blob = new Blob([new Uint8Array(tags.picture.data)], { type: tags.picture.format });
                coverUrl = await blobToBase64(blob);
              }
  
              const title = tags.title || file.name.replace(/\.[^/.]+$/, "");
              const artist = tags.artist || "Unknown Artist";
              const album = tags.album || "Local Upload";
  
              const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
              const { error: uploadError } = await supabase.storage.from('music').upload(`public/${fileName}`, file);
              
              let remoteUrl = "";
              if (uploadError) {
                  console.warn("Upload failed, using local blob", uploadError);
                  remoteUrl = URL.createObjectURL(file); 
              } else {
                  const { data } = supabase.storage.from('music').getPublicUrl(`public/${fileName}`);
                  remoteUrl = data.publicUrl;
              }
  
              const newSong = {
                  id: crypto.randomUUID(),
                  title, artist, album,
                  cover_url: coverUrl,
                  duration: durationStr, duration_sec: durationSec,
                  url: remoteUrl, is_liked: false,
                  added_at: new Date().toISOString()
              };
              
              const { error: dbError } = await supabase.from('songs').insert([newSong]);
              if (!dbError) setLibrary(prev => [mapDbToSong(newSong), ...prev]);
              resolve();
            },
            onError: async () => {
              const title = file.name.replace(/\.[^/.]+$/, "");
              const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
              const { error } = await supabase.storage.from('music').upload(`public/${fileName}`, file);
              const remoteUrl = error ? URL.createObjectURL(file) : supabase.storage.from('music').getPublicUrl(`public/${fileName}`).data.publicUrl;
              
              const newSong = {
                  id: crypto.randomUUID(),
                  title, artist: "Unknown", album: "Upload",
                  cover_url: `https://placehold.co/300/181818/f59e0b?text=${title.substring(0,2)}`,
                  duration: durationStr, duration_sec: durationSec,
                  url: remoteUrl, is_liked: false,
                  added_at: new Date().toISOString()
              };
              await supabase.from('songs').insert([newSong]);
              setLibrary(prev => [mapDbToSong(newSong), ...prev]);
              resolve();
            }
          });
        });
      } catch (e) {
        console.error("Error uploading file", e);
      }
      
      processedCount++;
      setImportProgress(Math.round((processedCount / totalFiles) * 100));
    }
    setIsImporting(false);
    setImportStatus("");
    setImportProgress(0);
  }, []);

  return { library, isLoading, isImporting, importStatus, importProgress, toggleLike, removeSong, addToLibrary, uploadFiles, updateSongDuration };
};
