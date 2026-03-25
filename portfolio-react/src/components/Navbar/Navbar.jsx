import React from 'react';

export default function Navbar() {
  return (
    <nav className="absolute top-0 w-full z-50 px-6 py-4 flex items-center justify-between bg-[#090a0f]/80 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex-1">
        <span className="text-lg md:text-xl font-semibold tracking-widest italic text-gray-200">
          Cinematic Buddy
        </span>
      </div>

      {/* Center Links */}
      <div className="hidden md:flex flex-1 justify-center space-x-8">
        <a href="#films" className="text-xs font-medium tracking-widest text-[#ffd84d]">
          FILMS
        </a>
        <a href="#stills" className="text-xs font-medium tracking-widest text-gray-400 hover:text-gray-200 transition-colors">
          STILLS
        </a>
        <a href="#journal" className="text-xs font-medium tracking-widest text-gray-400 hover:text-gray-200 transition-colors">
          JOURNAL
        </a>
        <a href="#about" className="text-xs font-medium tracking-widest text-gray-400 hover:text-gray-200 transition-colors">
          ABOUT
        </a>
      </div>


    </nav>
  );
}
