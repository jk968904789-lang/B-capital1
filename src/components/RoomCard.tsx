import { Link } from 'react-router-dom';
import { Users, Maximize, ArrowRight } from 'lucide-react';
import type { Room } from '../types';
import { CATEGORY_LABELS } from '../types';
import { formatEtb } from '../lib/format';

interface RoomCardProps {
  room: Room;
  index?: number;
}

export default function RoomCard({ room }: RoomCardProps) {
  const cover = room.image_urls[0] ?? 'https://images.pexels.com/photos/6434592/pexels-photo-6434592.jpeg?auto=compress&cs=tinysrgb&w=800';
  return (
    <Link
      to={`/rooms/${room.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-ink-900/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={cover}
          alt={room.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute left-4 top-4 rounded-full bg-ink-950/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gold-300 backdrop-blur-sm">
          {CATEGORY_LABELS[room.category]}
        </div>
        {!room.is_available && (
          <div className="absolute right-4 top-4 rounded-full bg-red-600/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
            Unavailable
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-xl font-semibold text-ink-900 transition-colors group-hover:text-gold-700">{room.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">
          {room.description}
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gold-500" />
            {room.capacity} guests
          </span>
          {room.size_sqm && (
            <span className="inline-flex items-center gap-1.5">
              <Maximize className="h-4 w-4 text-gold-500" />
              {room.size_sqm} m²
            </span>
          )}
        </div>
        <div className="mt-5 flex items-end justify-between border-t border-ink-100 pt-4">
          <div>
            <span className="font-serif text-2xl font-semibold text-ink-900">{formatEtb(room.price)}</span>
            <span className="block text-[11px] uppercase tracking-widest text-ink-400">per night</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold-600 transition-all duration-300 group-hover:gap-3 group-hover:text-gold-700">
            View <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
