import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';

interface LogoProps {
  variant?: 'dark' | 'light';
  className?: string;
}

export default function Logo({ variant = 'dark', className = '' }: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-ink-900';
  const subColor = variant === 'light' ? 'text-gold-300' : 'text-gold-600';
  const ringColor = variant === 'light' ? 'border-gold-400/50' : 'border-gold-400/60';
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`} aria-label="B Capital home">
      <span className={`flex h-10 w-10 items-center justify-center rounded-full border ${ringColor} bg-ink-950 text-gold-400 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-gold-500/20`}>
        <Crown className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-serif text-xl font-semibold tracking-wide ${textColor} transition-colors`}>
          B Capital
        </span>
        <span className={`text-[10px] font-semibold uppercase tracking-widest ${subColor} transition-colors`}>
          Dire Dawa
        </span>
      </span>
    </Link>
  );
}
