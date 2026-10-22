import React, { useState, useRef } from 'react';
import { EBook } from '../types';

interface Book3DProps {
  book: EBook;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const Book3D: React.FC<Book3DProps> = ({
  book,
  size = 'md',
  className = '',
  onClick,
  interactive = true,
}) => {
  const [rotateX, setRotateX] = useState(-5);
  const [rotateY, setRotateY] = useState(20);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Size dimensions mapping
  const sizeStyles = {
    sm: { width: 'w-36', height: 'h-52', depth: '32px' },
    md: { width: 'w-52 sm:w-60', height: 'h-72 sm:h-84', depth: '40px' },
    lg: { width: 'w-64 sm:w-72', height: 'h-92 sm:h-104', depth: '48px' },
    hero: { width: 'w-64 sm:w-80 md:w-96', height: 'h-96 sm:h-[480px] md:h-[540px]', depth: '52px' }
  }[size];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-25 to 25 deg)
    const rotY = ((x - centerX) / centerX) * 28;
    const rotX = -((y - centerY) / centerY) * 22;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Return to attractive angled 3D resting pose
    setRotateX(-6);
    setRotateY(size === 'hero' ? 18 : 15);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative perspective-1500 cursor-pointer select-none group flex items-center justify-center p-4 ${className}`}
    >
      {/* 3D Book Container */}
      <div
        className="relative preserve-3d transition-transform duration-300 ease-out will-change-transform shadow-2xl"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isHovered ? 'scale3d(1.04, 1.04, 1.04) translateZ(25px)' : 'scale3d(1, 1, 1)'}`,
        }}
      >
        {/* Book Cover (Front) */}
        <div
          className={`relative ${sizeStyles.width} ${sizeStyles.height} rounded-r-xl rounded-l-[4px] overflow-hidden bg-slate-900 border border-slate-700/50 shadow-[20px_20px_50px_rgba(0,0,0,0.8)]`}
        >
          {/* Main Book Cover Image */}
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover object-center"
            loading="lazy"
            onError={(e) => {
              // Fallback cover if image fails
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80";
            }}
          />

          {/* Dark luxury overlay for readability if title needs backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-5">
            <span className="inline-block px-2.5 py-1 bg-amber-500/90 text-slate-950 text-[10px] sm:text-xs font-bold rounded-full w-fit tracking-wider uppercase backdrop-blur-sm mb-1.5 shadow-sm">
              {book.category}
            </span>
            <h3 className="text-white font-bold text-base sm:text-lg md:text-xl line-clamp-2 leading-tight drop-shadow-md">
              {book.title}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm line-clamp-1 mt-0.5 font-medium">
              By {book.author}
            </p>

            {/* Price Tag on Front Cover */}
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/20">
              <div className="flex items-baseline gap-1.5">
                <span className="text-amber-400 font-extrabold text-lg sm:text-xl tracking-tight">
                  {book.currency}{book.price}
                </span>
                {book.originalPrice > book.price && (
                  <span className="text-slate-400 text-xs line-through">
                    {book.currency}{book.originalPrice}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                {book.discount ? `${book.discount}% OFF` : 'INSTANT PDF'}
              </span>
            </div>
          </div>

          {/* Left Book Spine Binding Crease Shadow */}
          <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 bottom-0 left-3 w-[1px] bg-white/20 pointer-events-none z-10" />

          {/* Dynamic Light Glare Reflection tracking mouse */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 320px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45), transparent 70%)`,
              opacity: isHovered ? 0.9 : 0.25,
            }}
          />

          {/* Ribbon Bookmark element hanging on top right */}
          <div className="absolute top-0 right-4 w-5 h-8 bg-gradient-to-b from-amber-600 to-amber-500 shadow-md transform -translate-y-1 z-10 clip-ribbon">
            <div className="w-full h-full border-x border-amber-300/40" />
          </div>
        </div>

        {/* 3D Spine (Left side) */}
        <div
          className="absolute top-0 left-0 h-full rounded-l-[3px] overflow-hidden flex flex-col justify-between py-4 items-center text-center shadow-inner"
          style={{
            width: size === 'hero' ? '38px' : '30px',
            transform: `rotateY(-90deg) translateZ(${size === 'hero' ? '19px' : '15px'})`,
            transformOrigin: 'left',
            background: 'linear-gradient(90deg, #090e17 0%, #1e293b 50%, #0f172a 100%)',
            borderLeft: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest rotate-90 whitespace-nowrap mt-4">
            {book.category}
          </span>
          <span className="text-[10px] text-slate-200 font-semibold rotate-90 whitespace-nowrap line-clamp-1 max-w-[120px] tracking-tight">
            {book.title}
          </span>
          <span className="text-[9px] text-slate-400 rotate-90">
            PDF
          </span>
        </div>

        {/* 3D Pages Thickness (Right edge) */}
        <div
          className="absolute top-[2px] right-0 rounded-r-sm overflow-hidden"
          style={{
            width: size === 'hero' ? '36px' : '28px',
            height: 'calc(100% - 4px)',
            transform: `rotateY(90deg) translateZ(${size === 'hero' ? '18px' : '14px'})`,
            transformOrigin: 'right',
            background: 'repeating-linear-gradient(to bottom, #f8fafc 0px, #f8fafc 1.5px, #cbd5e1 1.5px, #94a3b8 3px)',
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.5)',
          }}
        />

        {/* 3D Pages Thickness (Bottom edge) */}
        <div
          className="absolute bottom-0 left-[2px] rounded-b-sm overflow-hidden"
          style={{
            width: 'calc(100% - 4px)',
            height: size === 'hero' ? '36px' : '28px',
            transform: `rotateX(-90deg) translateZ(${size === 'hero' ? '18px' : '14px'})`,
            transformOrigin: 'bottom',
            background: 'repeating-linear-gradient(to right, #f8fafc 0px, #f8fafc 1.5px, #cbd5e1 1.5px, #94a3b8 3px)',
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.5)',
          }}
        />

        {/* 3D Ambient Floor Shadow */}
        <div
          className="absolute -bottom-8 left-4 right-4 h-8 rounded-full bg-black/60 blur-xl -z-10 transition-all duration-300"
          style={{
            transform: isHovered ? 'scale(1.15) translateY(6px)' : 'scale(1)',
            opacity: isHovered ? 0.9 : 0.6,
          }}
        />
      </div>
    </div>
  );
};
