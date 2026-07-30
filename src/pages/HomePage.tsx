import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  ShieldCheck,
  Clock,
  MapPin,
  Coffee,
  Wifi,
  Snowflake,
  Tv,
  ArrowRight,
  Star,
  Quote,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Room } from '@/types';
import RoomCard from '@/components/RoomCard';

const HERO_SLIDES = [
  'https://images.pexels.com/photos/14022458/pexels-photo-14022458.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/8082217/pexels-photo-8082217.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/2725675/pexels-photo-2725675.jpeg?auto=compress&cs=tinysrgb&w=1920',
];

const AMENITY_ICONS = [
  { icon: Wifi, label: 'High-Speed Wi-Fi' },
  { icon: Snowflake, label: 'Climate Control' },
  { icon: Tv, label: 'Smart Entertainment' },
  { icon: Coffee, label: 'In-Room Coffee' },
  { icon: ShieldCheck, label: 'In-Room Safe' },
  { icon: Clock, label: '24-Hour Reception' },
];

const TESTIMONIALS = [
  {
    name: 'Hanan Ahmed',
    role: 'Business Traveler',
    text: 'The Capital Suite was impeccable — refined, calm, and exactly what I needed after a long flight. Service was discreet and professional.',
  },
  {
    name: 'Daniel Bekele',
    role: 'Leisure Guest',
    text: 'B Capital set a new standard for me in Dire Dawa. The attention to detail, from the linens to the welcome, was genuinely luxurious.',
  },
  {
    name: 'Sara Mohammed',
    role: 'Returning Guest',
    text: 'I have stayed here three times now. Every visit feels considered and personal. The Deluxe rooms are my favorite in the city.',
  },
];

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    supabase
      .from('rooms')
      .select('*')
      .order('price', { ascending: true })
      .limit(6)
      .then(({ data }) => setRooms(data ?? []));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {HERO_SLIDES.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-all duration-[2000ms] ease-out ${i === slide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/45 to-ink-950/85" />

        <div className="container-luxe relative z-10 flex flex-col items-center text-center text-white">
          <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <span className="eyebrow text-gold-300">Premium Hospitality &middot; Dire Dawa</span>
          </div>
          <h1
            className="mt-6 max-w-4xl font-serif text-5xl font-medium leading-[1.05] text-balance animate-fade-up sm:text-6xl md:text-7xl"
            style={{ animationDelay: '350ms' }}
          >
            A sanctuary of <span className="italic text-gold-300">quiet luxury</span>
          </h1>
          <p
            className="mt-6 max-w-xl text-base leading-relaxed text-white/80 animate-fade-up md:text-lg"
            style={{ animationDelay: '500ms' }}
          >
            Thoughtfully designed rooms, refined service, and an atmosphere of calm
            sophistication in the heart of Dire Dawa, Ethiopia.
          </p>
          <div
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row animate-fade-up"
            style={{ animationDelay: '650ms' }}
          >
            <Link to="/rooms" className="btn-gold">
              Explore Rooms
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="btn-ghost-light">
              Reserve a Stay
            </Link>
          </div>

          <div
            className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/40"
            aria-hidden="true"
          >
            <span className="text-[10px] uppercase tracking-widest">Scroll</span>
            <span className="h-8 w-px animate-pulse-soft bg-white/30" />
          </div>
        </div>

        <div className="absolute bottom-8 right-8 z-10 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === slide ? 'w-8 bg-gold-300' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Intro */}
      <section className="section-pad bg-white">
        <div className="container-luxe grid items-center gap-16 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="eyebrow">Welcome to B Capital</span>
            <h2 className="mt-4 font-serif text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
              Where every detail is considered
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-600">
              <p>
                B Capital is Dire Dawa's address for considered hospitality. From the
                moment you arrive, our team is devoted to delivering a stay that feels
                effortless, personal, and refined.
              </p>
              <p>
                Each of our rooms is designed with comfort and calm at its core — premium
                linens, considered lighting, and amenities that matter. No noise, no
                distraction, simply rest.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-10">
              <Stat value="4" label="Room Categories" />
              <Stat value="12" label="Designed Rooms" />
              <Stat value="24/7" label="Reception" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '150ms' }}>
            <img
              src="https://images.pexels.com/photos/14011664/pexels-photo-14011664.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Hotel lobby"
              className="aspect-[3/4] w-full rounded-2xl object-cover"
              loading="lazy"
            />
            <img
              src="https://images.pexels.com/photos/7166637/pexels-photo-7166637.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Marble bathroom"
              className="mt-10 aspect-[3/4] w-full rounded-2xl object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Amenities strip */}
      <section className="bg-ink-950 py-16 text-white">
        <div className="container-luxe">
          <div className="text-center">
            <span className="eyebrow text-gold-300">In-Round Comforts</span>
            <h2 className="mt-3 font-serif text-3xl font-medium md:text-4xl">
              Considered amenities, as standard
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {AMENITY_ICONS.map(({ icon: Icon, label }, i) => (
              <div key={label} className="group flex flex-col items-center text-center animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-400/30 text-gold-300 transition-all duration-300 group-hover:scale-110 group-hover:border-gold-400/60 group-hover:bg-gold-400/10">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <p className="mt-4 text-sm text-ink-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured rooms */}
      <section className="section-pad bg-ink-50">
        <div className="container-luxe">
          <div className="flex flex-col items-center text-center">
            <span className="eyebrow">Our Rooms</span>
            <h2 className="mt-3 font-serif text-4xl font-medium text-ink-900 md:text-5xl">
              A room for every journey
            </h2>
            <div className="gold-divider mt-6" />
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room, i) => (
              <div key={room.id} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <RoomCard room={room} index={i} />
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/rooms" className="btn-outline">
              View All Rooms
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section-pad bg-white">
        <div className="container-luxe grid items-center gap-16 lg:grid-cols-2">
          <div className="order-2 lg:order-1 animate-fade-up">
            <span className="eyebrow">The Location</span>
            <h2 className="mt-4 font-serif text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
              Dire Dawa, Ethiopia
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink-600">
              Dire Dawa is Ethiopia's second city — a vibrant crossroads of culture and
              commerce. B Capital sits conveniently on Bole Road, moments from the city's
              commercial center and the railway heritage quarter, with easy access to
              Awash and Addis Ababa.
            </p>
            <ul className="mt-8 space-y-4">
              <LocationRow icon={MapPin} title="Bole Road, Kebele 04" sub="Dire Dawa, Ethiopia" />
              <LocationRow icon={Clock} title="24-Hour Reception" sub="Check-in 14:00 · Check-out 11:00" />
              <LocationRow icon={Crown} title="Room booking only" sub="A focused, restful experience" />
            </ul>
          </div>
          <div className="order-1 lg:order-2 animate-fade-up" style={{ animationDelay: '150ms' }}>
            <img
              src="https://images.pexels.com/photos/14036253/pexels-photo-14036253.jpeg?auto=compress&cs=tinysrgb&w=1000"
              alt="Luxurious hotel lobby"
              className="aspect-[5/4] w-full rounded-2xl object-cover shadow-xl"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-ink-950 py-20 text-white md:py-28">
        <div className="container-luxe">
          <div className="text-center">
            <span className="eyebrow text-gold-300">Guest Voices</span>
            <h2 className="mt-3 font-serif text-4xl font-medium md:text-5xl">
              Loved by our guests
            </h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 animate-fade-up"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <Quote className="h-8 w-8 text-gold-400" />
                <div className="mt-3 flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="mt-5 text-sm leading-relaxed text-ink-200">"{t.text}"</p>
                <div className="mt-6">
                  <p className="font-serif text-lg text-white">{t.name}</p>
                  <p className="text-xs uppercase tracking-widest text-gold-300">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gold-400 py-20 text-ink-950">
        <div className="container-luxe flex flex-col items-center text-center">
          <Crown className="h-10 w-10" strokeWidth={1.5} />
          <h2 className="mt-6 max-w-2xl font-serif text-4xl font-medium leading-tight md:text-5xl">
            Your stay at B Capital awaits
          </h2>
          <p className="mt-4 max-w-xl text-base text-ink-800">
            Reserve your room today and pay at the hotel. Experience considered
            hospitality in Dire Dawa.
          </p>
          <Link to="/rooms" className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink-950 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-all hover:bg-ink-900 hover:shadow-lg">
            Book Your Stay
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl font-semibold text-gold-600">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-widest text-ink-400">{label}</p>
    </div>
  );
}

function LocationRow({ icon: Icon, title, sub }: { icon: typeof MapPin; title: string; sub: string }) {
  return (
    <li className="flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-medium text-ink-900">{title}</p>
        <p className="text-sm text-ink-500">{sub}</p>
      </div>
    </li>
  );
}
