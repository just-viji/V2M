import React, { useMemo } from "react";
import { Home, Search as SearchIcon, Library as LibraryIcon } from "lucide-react";
import { ViewState } from "../types";

interface TopAppBarProps {
  title: string;
  scrolled: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ title, scrolled }) => (
  <header className={`h-16 flex items-center px-6 shrink-0 z-20 sticky top-0 transition-all duration-300 ${scrolled ? 'glassmorphic border-b shadow-md' : 'bg-transparent'}`}>
    <div className="title-container">
      <h1 className="title-text text-2xl font-bold text-white tracking-tight">
        {title}
      </h1>
    </div>
  </header>
);

export const BottomNavBar = ({ view, setView }: { view: ViewState, setView: (v: ViewState) => void }) => {
    const items = useMemo(() => [
        { v: "home", label: "Home", icon: Home },
        { v: "search", label: "Search", icon: SearchIcon },
        { v: "library", label: "Library", icon: LibraryIcon },
    ] as const, []);

    return (
        <footer className="h-20 glassmorphic border-t flex items-center justify-around shadow-lg shrink-0 z-30 pb-2">
            {items.map(({ v, label, icon: Icon }) => (
                <div key={v} className={`relative flex flex-col items-center justify-center gap-1 p-2 w-24 h-full cursor-pointer transition-colors duration-200 group`} onClick={() => setView(v as ViewState)}>
                    <div className={`relative p-1.5 rounded-full transition-all duration-300 ${view === v ? 'text-amber-400' : 'text-neutral-400 group-hover:text-white'}`}>
                        {view === v && <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md" />}
                        <Icon size={24} strokeWidth={view === v ? 2.5 : 2} />
                    </div>
                    <span className={`text-[10px] font-medium tracking-wide ${view === v ? 'text-amber-400' : 'text-neutral-500 group-hover:text-neutral-300'}`}>{label}</span>
                </div>
            ))}
        </footer>
    );
};