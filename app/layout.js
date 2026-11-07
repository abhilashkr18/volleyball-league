import './globals.css';
import Link from 'next/link';
import { Barlow, Barlow_Condensed } from 'next/font/google';

const body = Barlow({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-body' });
const head = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '800'], variable: '--font-head' });

export const metadata = { title: 'Ground Zero Muri', description: 'Matches, players and live auctions at Ground Zero Muri.' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${body.variable} ${head.variable}`}>
      <body>
        <header className="top">
          <div className="wrap">
            <Link href="/" className="brand"><i />Ground Zero Muri</Link>
            <nav><Link href="/players">Players</Link><Link href="/admin">Admin</Link></nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
