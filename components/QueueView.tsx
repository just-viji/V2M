import React, { useState, useRef } from 'react';
import { Song } from '../types';
import { X, GripVertical } from 'lucide-react';

const SoundWaveIcon = () => (
  <div className="sound-wave-icon"><span></span><span></span><span></span></div>
);

interface QueueViewProps {
  queue: Song[];
  currentSongId: string;
  onClose: () => void;
  onReorder: (newQueue: Song[]) => void;
  onPlayFromQueue: (index: number) => void;
}

export const QueueView: React.FC<QueueViewProps> = ({ queue, currentSongId, onClose, onReorder, onPlayFromQueue }) => {
  const [draggedItem, setDraggedItem] = useState<Song | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: Song) => {
    setDraggedItem(item);
    dragNode.current = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    // The timeout is a trick to allow the drag image to be created before we style the node
    setTimeout(() => {
        if(dragNode.current) dragNode.current.classList.add('opacity-50', 'scale-95');
    }, 0);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, targetItem: Song) => {
    if (!draggedItem || draggedItem.id === targetItem.id) return;
    
    const newQueue = [...queue];
    const draggedIndex = newQueue.findIndex(s => s.id === draggedItem.id);
    const targetIndex = newQueue.findIndex(s => s.id === targetItem.id);
    
    // Remove the dragged item and insert it at the target's position
    newQueue.splice(draggedIndex, 1);
    newQueue.splice(targetIndex, 0, draggedItem);
    
    onReorder(newQueue);
  };
  
  const handleDragEnd = () => {
    if(dragNode.current) {
        dragNode.current.classList.remove('opacity-50', 'scale-95');
        dragNode.current = null;
    }
    setDraggedItem(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-neutral-800/90 backdrop-blur-xl rounded-t-2xl h-[70%] flex flex-col border-t border-white/10 animate-in slide-in-from-bottom duration-300">
        <header className="flex-shrink-0 p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Up Next</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-2">
            {queue.map((song, index) => {
                const isCurrent = song.id === currentSongId;
                return (
                    <div
                        key={song.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, song)}
                        onDragEnter={(e) => handleDragEnter(e, song)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => onPlayFromQueue(index)}
                        className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-150 ${isCurrent ? 'bg-amber-500/20' : 'hover:bg-white/5'}`}
                    >
                        <div className="text-neutral-500 cursor-grab active:cursor-grabbing touch-none">
                            <GripVertical size={20} />
                        </div>
                        <div className="relative h-12 w-12 flex-shrink-0">
                            <img src={song.coverUrl} className="h-full w-full rounded-md object-cover" alt="cover" />
                             {isCurrent && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md">
                                    <SoundWaveIcon />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={`truncate font-medium ${isCurrent ? 'text-amber-400' : 'text-white'}`}>{song.title}</div>
                            <div className="truncate text-sm text-neutral-400">{song.artist}</div>
                        </div>
                        <span className="text-sm text-neutral-500 font-mono">{song.duration}</span>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};