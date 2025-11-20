
import React from "react";
import { X, Music, Plus } from "lucide-react";
import { Playlist } from "../types";

interface AddToPlaylistModalProps {
  playlists: Playlist[];
  onClose: () => void;
  onSelect: (playlistId: string) => void;
  onCreateNew: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ playlists, onClose, onSelect, onCreateNew }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-neutral-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-neutral-700 animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-neutral-700 flex justify-between items-center bg-neutral-900/50">
          <h3 className="font-bold text-lg text-white">Add to Playlist</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="max-h-[50vh] overflow-y-auto p-2">
          <button onClick={onCreateNew} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-700 transition-colors text-left group">
            <div className="h-12 w-12 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors">
              <Plus size={24} />
            </div>
            <span className="font-medium text-white">New Playlist</span>
          </button>
          
          {playlists.map(p => (
            <button key={p.id} onClick={() => onSelect(p.id)} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-700 transition-colors text-left group">
               <div className="h-12 w-12 bg-neutral-700 rounded-lg flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
                 <Music size={24} />
               </div>
               <div className="flex flex-col">
                 <span className="font-medium text-white truncate">{p.name}</span>
                 <span className="text-xs text-neutral-500">{p.songIds.length} songs</span>
               </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};