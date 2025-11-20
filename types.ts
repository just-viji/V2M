
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: string;
  durationSec: number;
  url: string;
  isDownloaded: boolean;
  isDownloading?: boolean;
  addedAt?: string;
  isLiked?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
}

export type ViewState = "home" | "search" | "library";
export type RepeatMode = 'none' | 'one' | 'all';
