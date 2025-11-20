
import { useState, useMemo } from "react";
import { Song } from "../types";

export const useSearch = (library: Song[]) => {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return library.filter(song =>
      song.title.toLowerCase().includes(lowerQuery) ||
      song.artist.toLowerCase().includes(lowerQuery) ||
      song.album.toLowerCase().includes(lowerQuery)
    );
  }, [query, library]);

  const performSearch = (q: string) => {
    setQuery(q);
  };

  return { query, setQuery, results, isSearching: false, performSearch, setResults: () => {} };
};
