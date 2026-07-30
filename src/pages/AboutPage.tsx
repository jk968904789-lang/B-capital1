import { Crown, Heart, Eye, Sparkles, ShieldCheck, Clock, MapPin, Award } from 'lucide-react';
import { PageHeader } from './RoomsPage';

const VALUES = [
  { icon: Heart, title: 'Considered Service', text: 'Every interaction is thoughtful, warm, and unhurried. We anticipate needs before they are voiced.' },
  { icon: Eye, title: 'Attention to Detail', text: 'From the thread count of our linens to the lighting in each room, nothing is left to chance.' },
  { icon: ShieldCheck, title: 'Quiet Security', text: 'A safe, discreet environment with 24-hour reception and in-room safes for your peace of mind.' },
  { icon: Sparkles, title: 'Refined Comfort', text: 'Premium amenities and calm interiors designed for genuine rest and restoration.' },
];

const TIMELINE = [
  { year: '2021', title: 'A Vision', text: 'B Capital is conceived as Dire Dawa\'s address for considered, modern hospitality.' },
  { year: '2023', title: 'The Doors Open', text: 'Twelve designed rooms across four categories welcome our first guests.' },
  { year: '2024', title: 'A Trusted Name', text: 'Business and leisure travelers alike make B Capital their home in Dire Dawa.' },
  { year: '2026', title: 'Looking Ahead', text: 'We continue to refine the guest experience, one stay at a time.' },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <PageHeader
        eyebrow="About Us"
        title="The B Capital story"
        subtitle="A hotel built on the belief that hospitality should feel personal, considered, and calm."
      />

      <section className="section-pad">
        <div className="container-luxe grid items-center gap-16 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="eyebrow">Our Philosophy</span>
            <h2 className="mt-4 font-serif text-4xl font-medium leading-tight text-ink-900 md:text-5xl">
              Hospitality, considered
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-600">
              <p>
                B Capital was founded with a simple conviction: that a great stay is built
                from a hundred small considerations. The warmth of a welcome. The quiet of
                a well-insulated room. The confidence of knowing every detail has been seen to.
              </p>
              <p>
                We are a room-booking hotel — focused, purposeful, and devoted to the craft
                of hospitality. No distractions, no noise. Simply a place to rest, work, and
                feel at home in Dire Dawa.
              </p>
              <p>
                Our team brings together years of experience in service and a genuine love
                for this city. We look forward to welcoming you.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '150ms' }}>
            <img
              src="https://images.pexels.com/photos/7821349/pexels-photo-7821349.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Reception"
              className="aspect-[4/5] w-full rounded-2xl object-cover shadow-lg transition-transform duration-500 hover:scale-[1.02]"
              loading="lazy"
            />
            <img
              src="https://images.pexels.com/photos/14022458/pexels-photo-14022458.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Suite bedroom"
              className="mt-10 aspect-[4/5] w-full rounded-2xl object-cover shadow-lg transition-transform duration-500 hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="bg-ink-50 section-pad">
        <div className="container-luxe">
          <div className="text-center">
            <span className="eyebrow">What We Stand For</span>
            <h2 className="mt-3 font-serif text-4xl font-medium text-ink-900 md:text-5xl">Our values</h2>
            <div className="gold-divider mt-6" />
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }, i) => (
              <div
                key={title}
                className="card-luxe-hover p-8 text-center animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-600 transition-all duration-300 hover:scale-110 hover:bg-gold-100">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 font-serif text-xl font-semibold text-ink-900">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-luxe">
          <div className="text-center">
            <span className="eyebrow">Our Journey</span>
            <h2 className="mt-3 font-serif text-4xl font-medium text-ink-900 md:text-5xl">Milestones</h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-4">
            {TIMELINE.map((t, i) => (
              <div key={t.year} className="relative animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 text-gold-400">
                    <Award className="h-5 w-5" />
                  </span>
                  <span className="font-serif text-2xl font-semibold text-gold-600">{t.year}</span>
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-ink-900">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-950 py-20 text-white">
        <div className="container-luxe grid gap-12 md:grid-cols-3">
          <InfoTile icon={MapPin} title="Location" lines={['Bole Road, Kebele 04', 'Dire Dawa, Ethiopia']} />
          <InfoTile icon={Clock} title="Reception" lines={['Open 24 hours', 'Check-in 14:00 · Check-out 11:00']} />
          <InfoTile icon={Crown} title="Experience" lines={['Room booking only', 'A focused, restful stay']} />
        </div>
      </section>
    </div>
  );
}

function InfoTile({ icon: Icon, title, lines }: { icon: typeof MapPin; title: string; lines: string[] }) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-400/30 text-gold-300">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-300">{title}</p>
        {lines.map((l) => (
          <p key={l} className="mt-1 text-sm text-ink-200">{l}</p>
        ))}
      </div>
    </div>
  );
}
