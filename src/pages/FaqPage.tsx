import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from './RoomsPage';

const FAQS = [
  {
    q: 'How do I book a room?',
    a: 'Browse our Rooms page, select a room, choose your check-in and check-out dates, and click "Check Availability". Once confirmed available, sign in or create an account and tap "Reserve Now". Your booking will appear in your account under My Bookings.',
  },
  {
    q: 'Do I need to pay online?',
    a: 'No. B Capital operates on a pay-at-hotel basis only. No online payment is required at the time of booking. You settle your bill at the hotel during your stay.',
  },
  {
    q: 'What payment methods are accepted at the hotel?',
    a: 'We accept cash (Ethiopian Birr) and major cards at the hotel reception. Payment is collected upon check-in or check-out, as arranged with our front desk.',
  },
  {
    q: 'Can I cancel my booking?',
    a: 'Yes. You can cancel any pending or confirmed booking from your account under My Bookings. Cancellations are free of charge. We kindly ask that you cancel in advance if your plans change.',
  },
  {
    q: 'What are the check-in and check-out times?',
    a: 'Check-in is from 14:00 and check-out is by 11:00. If you need an early check-in or late check-out, please note it in the special requests field when booking or contact our reception.',
  },
  {
    q: 'Is the reception open 24 hours?',
    a: 'Yes. Our reception is open 24 hours a day, seven days a week. Late check-ins are warmly accommodated.',
  },
  {
    q: 'What is included in the room rate?',
    a: 'Your room rate includes your accommodation, daily housekeeping, high-speed Wi-Fi, and all listed in-room amenities. Prices are quoted in Ethiopian Birr (ETB) per night.',
  },
  {
    q: 'How many guests can stay in a room?',
    a: 'Each room lists its maximum capacity. Standard rooms accommodate up to 2 guests, Deluxe and Executive up to 3, and our Suites up to 4. You will select the number of guests when booking.',
  },
  {
    q: 'Does B Capital have a gym, pool, or spa?',
    a: 'B Capital is a focused room-booking hotel. We do not operate a gym, swimming pool, spa, club, or bar. Our emphasis is on a calm, restful, and comfortable stay.',
  },
  {
    q: 'Where is B Capital located?',
    a: 'We are located on Bole Road, Kebele 04, in Dire Dawa, Ethiopia — conveniently close to the commercial center and railway heritage quarter.',
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="bg-white">
      <PageHeader
        eyebrow="FAQ"
        title="Frequently asked questions"
        subtitle="Everything you need to know about staying at B Capital. Can't find your answer? Contact us directly."
      />

      <div className="container-luxe py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 flex items-center gap-3 text-ink-500">
            <HelpCircle className="h-5 w-5 text-gold-500" />
            <span className="text-sm">{FAQS.length} questions</span>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-xl border transition-all duration-300 ${
                  open === i ? 'border-gold-300 bg-gold-50/40 shadow-sm' : 'border-ink-100 bg-white hover:border-ink-200'
                }`}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-serif text-lg font-medium text-ink-900">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gold-600 transition-transform duration-300 ${
                      open === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: open === i ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-ink-600">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl bg-ink-950 p-10 text-center text-white">
            <div className="gold-divider mb-6" />
            <h3 className="font-serif text-2xl font-medium">Still have questions?</h3>
            <p className="mt-2 text-sm text-ink-300">Our reception team is here to help, 24 hours a day.</p>
            <Link to="/contact" className="btn-gold mt-6">Contact us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
