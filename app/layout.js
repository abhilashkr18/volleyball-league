import './globals.css';
import Link from 'next/link';
import { Barlow, Anton, Kaushan_Script } from 'next/font/google';

const body = Barlow({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-body' });
const head = Anton({ subsets: ['latin'], weight: '400', variable: '--font-head' });
const script = Kaushan_Script({ subsets: ['latin'], weight: '400', variable: '--font-script' });

export const metadata = { title: 'Ground Zero Muri', description: 'Where sports bring us together. Matches, players and live auctions at Ground Zero Muri.' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${body.variable} ${head.variable} ${script.variable}`}>
      <body>
        <header className="top">
          <div className="wrap">
            <Link href="/" aria-label="Ground Zero Muri home"><img className="logo-img" src="/logo.jpg" alt="Ground Zero Muri" /></Link>
            <nav className="menu" aria-label="Main">
                           <Link href="/">Home</Link>
              <Link href="/#about">About</Link>
              <Link href="/#sports">Sports</Link>
              <Link href="/gallery">Gallery</Link>
              <Link href="/videos">Videos</Link>
              <Link href="/events">Events</Link>
              <Link href="/players">Players</Link> 
            </nav>
            <Link className="btn join" href="/players">Join Us</Link>
          </div>
        </header>
        {children}
        <footer className="foot">
          <div className="wrap">
            <div className="cols">
              <div>
                <img className="logo-img" style={{ height: 70 }} src="/logo.jpg" alt="Ground Zero Muri" />
                <p><span className="script">Play Hard. Dream Big.</span></p>
              </div>
              <div>
                <h4>Quick Links</h4>
                <Link href="/">Home</Link><Link href="/#about">About</Link><Link href="/#sports">Sports</Link><Link href="/#gallery">Gallery</Link>
              </div>
              <div>
                <h4>More Links</h4>
                <Link href="/#videos">Videos</Link><Link href="/#events">Events</Link><Link href="/players">Players</Link><Link href="/admin">Admin</Link>
              </div>
              <div>
                <h4>Follow Us</h4>
                <a href="#">YouTube</a><a href="#">Instagram</a><a href="#">X</a>
              </div>
            </div>
            <p className="copy muted">© 2026 Ground Zero Muri. All rights reserved. Muri, Jharkhand.</p>
          </div>
        </footer>
      </body>
    </html>
  );
          }
