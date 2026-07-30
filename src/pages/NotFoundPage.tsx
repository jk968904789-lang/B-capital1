import { Link } from 'react-router-dom';
import { Home, Crown } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-6 text-center text-white">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <img
          src="https://images.pexels.com/photos/14036253/pexels-photo-14036253.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-950/95 to-ink-950" />

      <div className="relative z-10 animate-fade-up">
        <div className="flex items-center justify-center gap-3">
          <Crown className="h-10 w-10 text-gold-400" strokeWidth={1.5} />
        </div>
        <p className="mt-8 font-serif text-8xl font-semibold text-gold-400 sm:text-9xl">404</p>
        <div className="gold-divider my-6" />
        <h1 className="font-serif text-3xl font-medium sm:text-4xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-300">
          The page you're looking for doesn't exist or may have moved. Let us guide
          you back home.
        </p>
        <Link to="/" className="btn-gold mt-8">
          <Home className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
