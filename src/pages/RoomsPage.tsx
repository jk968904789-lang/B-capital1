import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Room, RoomCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/types';
import RoomCard from '@/components/RoomCard';

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'capacity_desc', label: 'Capacity: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
] as const;

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<RoomCategory | 'all'>('all');
  const [maxGuests, setMaxGuests] = useState<number>(0);
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]['value']>('price_asc');

  useEffect(() => {
    supabase
      .from('rooms')
      .select('*')
      .order('price', { ascending: true })
      .then(({ data, error }) => {
        if (!error) setRooms(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let list = rooms;
    if (category !== 'all') list = list.filter((r) => r.category === category);
    if (maxGuests > 0) list = list.filter((r) => r.capacity >= maxGuests);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.amenities.some((a) => a.toLowerCase().includes(q))
      );
    }
    const sorted = [...list];
    switch (sort) {
      case 'price_desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'capacity_desc':
        sorted.sort((a, b) => b.capacity - a.capacity);
        break;
      case 'name_asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        sorted.sort((a, b) => a.price - b.price);
    }
    return sorted;
  }, [rooms, category, maxGuests, query, sort]);

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setMaxGuests(0);
    setSort('price_asc');
  };

  const hasFilters = query || category !== 'all' || maxGuests > 0;

  return (
    <div className="bg-ink-50">
      <PageHeader
        eyebrow="Our Rooms"
        title="Find your perfect room"
        subtitle="Browse our four categories of thoughtfully designed rooms, each with premium amenities and refined comfort."
      />

      <div className="container-luxe -mt-12 pb-24 relative z-10">
        <div className="card-luxe p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
            <div>
              <label className="label-luxe" htmlFor="search">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  id="search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Room name, amenity..."
                  className="input-luxe pl-10"
                />
              </div>
            </div>
            <div>
              <label className="label-luxe" htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as RoomCategory | 'all')}
                className="input-luxe min-w-[160px]"
              >
                <option value="all">All Categories</option>
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-luxe" htmlFor="guests">Guests</label>
              <select
                id="guests"
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                className="input-luxe min-w-[140px]"
              >
                <option value={0}>Any</option>
                <option value={1}>1+ guests</option>
                <option value={2}>2+ guests</option>
                <option value={3}>3+ guests</option>
                <option value={4}>4+ guests</option>
              </select>
            </div>
            <div>
              <label className="label-luxe" htmlFor="sort">Sort</label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="input-luxe min-w-[180px]"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-ink-500 hover:text-gold-600"
            >
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-ink-500">
            {loading ? 'Loading rooms…' : `${filtered.length} room${filtered.length === 1 ? '' : 's'} available`}
          </p>
          <span className="hidden items-center gap-2 text-xs uppercase tracking-widest text-ink-400 sm:inline-flex">
            <SlidersHorizontal className="h-4 w-4" /> Filtered results
          </span>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="skeleton aspect-[4/3] rounded-2xl" />
                <div className="skeleton mt-4 h-6 w-3/4 rounded" />
                <div className="skeleton mt-3 h-4 w-full rounded" />
                <div className="skeleton mt-2 h-4 w-2/3 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center">
            <p className="font-serif text-2xl text-ink-700">No rooms match your search</p>
            <p className="mt-2 text-sm text-ink-500">Try adjusting your filters.</p>
            <button onClick={clearFilters} className="btn-outline mt-6">Clear filters</button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((room, i) => (
              <div key={room.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <RoomCard room={room} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="relative overflow-hidden bg-ink-950 pt-40 pb-32 text-center text-white">
      <div className="absolute inset-0 opacity-25">
        <img
          src="https://images.pexels.com/photos/14036253/pexels-photo-14036253.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/85 via-ink-950/70 to-ink-950" />
      <div className="container-luxe relative z-10">
        <span className="eyebrow !text-gold-300 animate-fade-in">{eyebrow}</span>
        <h1 className="mt-4 font-serif text-5xl font-medium text-balance animate-fade-up md:text-6xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-200 animate-fade-up" style={{ animationDelay: '120ms' }}>{subtitle}</p>}
        <div className="gold-divider mt-8 animate-scale-in" />
      </div>
    </div>
  );
}
