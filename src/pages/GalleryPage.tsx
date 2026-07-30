import { useEffect, useState } from 'react';
import { X, Expand, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CATEGORY_LABELS } from '@/types';
import type { RoomCategory } from '@/types';
import { PageHeader } from './RoomsPage';

interface GalleryRoom {
  id: string;
  name: string;
  category: RoomCategory;
  image_urls: string[];
}

export default function GalleryPage() {
  const [rooms, setRooms] = useState<GalleryRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number; title: string } | null>(null);

  useEffect(() => {
    supabase
      .from('rooms')
      .select('id, name, category, image_urls')
      .order('price', { ascending: true })
      .then(({ data }) => {
        setRooms((data ?? []) as GalleryRoom[]);
        setLoading(false);
      });
  }, []);

  const allImages = rooms.flatMap((r) =>
    r.image_urls.map((url) => ({ url, roomName: r.name, category: r.category }))
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox(prev => prev ? { ...prev, index: (prev.index + 1) % prev.urls.length } : prev);
      if (e.key === 'ArrowLeft') setLightbox(prev => prev ? { ...prev, index: (prev.index - 1 + prev.urls.length) % prev.urls.length } : prev);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox]);

  return (
    <div className="bg-white">
      <PageHeader
        eyebrow="Gallery"
        title="A look inside"
        subtitle="Take a visual tour of our rooms and spaces, each designed with calm, comfort, and quiet luxury in mind."
      />

      <div className="container-luxe py-20">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        ) : allImages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 py-20 text-center">
            <p className="font-serif text-xl text-ink-700">No images yet</p>
            <p className="mt-2 text-sm text-ink-400">Gallery photos will appear here once rooms are added.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allImages.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                onClick={() =>
                  setLightbox({
                    urls: rooms.find((r) => r.image_urls.includes(img.url))?.image_urls ?? [img.url],
                    index: rooms.find((r) => r.image_urls.includes(img.url))?.image_urls.indexOf(img.url) ?? 0,
                    title: img.roomName,
                  })
                }
                className="group relative aspect-[4/3] animate-fade-up overflow-hidden rounded-2xl"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <img
                  src={img.url}
                  alt={img.roomName}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-left opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="text-xs uppercase tracking-widest text-gold-300">{CATEGORY_LABELS[img.category]}</p>
                  <p className="font-serif text-lg text-white">{img.roomName}</p>
                </div>
                <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Expand className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/90 p-4 animate-fade-in backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/10 hover:text-white"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          {lightbox.urls.length > 1 && (
            <>
              <button
                className="absolute left-6 flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/10 hover:text-white"
                onClick={(e) => { e.stopPropagation(); setLightbox(prev => prev ? { ...prev, index: (prev.index - 1 + prev.urls.length) % prev.urls.length } : prev); }}
                aria-label="Previous"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                className="absolute right-6 flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/10 hover:text-white"
                onClick={(e) => { e.stopPropagation(); setLightbox(prev => prev ? { ...prev, index: (prev.index + 1) % prev.urls.length } : prev); }}
                aria-label="Next"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
          <div className="max-h-[85vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.urls[lightbox.index]}
              alt={lightbox.title}
              className="max-h-[78vh] w-full rounded-lg object-contain"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="font-serif text-lg text-white">{lightbox.title}</p>
              <div className="flex gap-2">
                {lightbox.urls.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox((prev) => (prev ? { ...prev, index: i } : prev))}
                    className={`h-1.5 rounded-full transition-all ${
                      i === lightbox.index ? 'w-6 bg-gold-300' : 'w-2 bg-white/40'
                    }`}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
