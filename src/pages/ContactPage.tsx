import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { PageHeader } from './RoomsPage';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => setStatus('success'), 1200);
  };

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="bg-white">
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        subtitle="We're here to help with reservations, questions, or special requests. Our reception is open around the clock."
      />

      <div className="container-luxe py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          {/* Info */}
          <div className="animate-fade-up">
            <h2 className="font-serif text-3xl font-medium text-ink-900">Reach us directly</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-600">
              Whether you're planning a stay, have a question about a booking, or want to
              arrange a special arrival, our team is ready to assist.
            </p>

            <div className="mt-8 space-y-6">
              <ContactRow icon={MapPin} title="Address">
                Bole Road, Kebele 04<br />Dire Dawa, Ethiopia
              </ContactRow>
              <ContactRow icon={Phone} title="Phone">
                <a href="tel:+251251112222" className="hover:text-gold-600">+251 25 111 2222</a>
              </ContactRow>
              <ContactRow icon={Mail} title="Email">
                <a href="mailto:reservations@bcapital.com" className="hover:text-gold-600">reservations@bcapital.com</a>
              </ContactRow>
              <ContactRow icon={Clock} title="Reception">
                Open 24 hours, every day<br />Check-in 14:00 · Check-out 11:00
              </ContactRow>
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-ink-100">
              <iframe
                title="B Capital location map"
                src="https://www.google.com/maps?q=Dire+Dawa+Ethiopia&output=embed"
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Form */}
          <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="card-luxe p-8">
              {status === 'success' ? (
                <div className="flex flex-col items-center py-12 text-center animate-scale-in">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </span>
                  <h3 className="mt-5 font-serif text-2xl font-semibold text-ink-900">Message sent</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
                    Thank you for reaching out. Our team will respond to you shortly at the
                    email you provided.
                  </p>
                  <button
                    onClick={() => { setForm({ name: '', email: '', phone: '', subject: '', message: '' }); setStatus('idle'); }}
                    className="btn-outline mt-6"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="font-serif text-2xl font-semibold text-ink-900">Send us a message</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="label-luxe" htmlFor="name">Full name</label>
                      <input id="name" required value={form.name} onChange={update('name')} className="input-luxe" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="label-luxe" htmlFor="email">Email</label>
                      <input id="email" type="email" required value={form.email} onChange={update('email')} className="input-luxe" placeholder="you@email.com" />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="label-luxe" htmlFor="phone">Phone (optional)</label>
                      <input id="phone" value={form.phone} onChange={update('phone')} className="input-luxe" placeholder="+251 ..." />
                    </div>
                    <div>
                      <label className="label-luxe" htmlFor="subject">Subject</label>
                      <input id="subject" required value={form.subject} onChange={update('subject')} className="input-luxe" placeholder="Reservation enquiry" />
                    </div>
                  </div>
                  <div>
                    <label className="label-luxe" htmlFor="message">Message</label>
                    <textarea id="message" required rows={5} value={form.message} onChange={update('message')} className="input-luxe resize-none" placeholder="How can we help?" />
                  </div>
                  <button type="submit" disabled={status === 'submitting'} className="btn-gold w-full sm:w-auto">
                    {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, title, children }: { icon: typeof MapPin; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">{title}</p>
        <div className="mt-1 text-sm leading-relaxed text-ink-700">{children}</div>
      </div>
    </div>
  );
}
