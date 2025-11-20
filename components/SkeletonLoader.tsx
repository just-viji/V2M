
import React from 'react';

export const SkeletonSongListItem = () => (
  <div className="flex items-center gap-4 p-3">
    <div className="h-12 w-12 flex-shrink-0 rounded-md skeleton-shine"></div>
    <div className="flex-1 min-w-0 space-y-2">
      <div className="h-4 w-3/4 rounded skeleton-shine"></div>
      <div className="h-3 w-1/2 rounded skeleton-shine"></div>
    </div>
    <div className="h-4 w-10 rounded skeleton-shine mr-2"></div>
    <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full skeleton-shine"></div>
        <div className="h-8 w-8 rounded-full skeleton-shine"></div>
    </div>
  </div>
);

export const SkeletonGridItem = () => (
    <div className="flex items-center bg-neutral-800/60 rounded-md shadow-sm overflow-hidden">
        <div className="h-16 w-16 skeleton-shine"></div>
        <div className="p-4 flex-1">
            <div className="h-4 w-full rounded skeleton-shine"></div>
        </div>
    </div>
);

export const SkeletonPlaylistCard = () => (
    <div className="aspect-square rounded-2xl bg-neutral-800 p-4 flex flex-col justify-between skeleton-shine">
        <div className="h-12 w-12 rounded-lg skeleton-shine"></div>
        <div className="space-y-2">
            <div className="h-5 w-3/4 rounded skeleton-shine"></div>
            <div className="h-3 w-1/2 rounded skeleton-shine"></div>
        </div>
    </div>
);
