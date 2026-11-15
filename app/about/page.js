import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import AboutStyles from '@/components/AboutStyles';
import Chapter from '@/components/AboutBlocks';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'About | Ground Zero Muri' };

const TABS = [
  ['story', 'Story', 'कहानी'],
  ['people', 'People', 'लोग'],
  ['cricket', 'Cricket', 'क्रिकेट'],
  ['kpl', 'KPL', 'केपीएल'],
  ['football', 'Football', 'फुटबॉल'],
  ['volleyball', 'Volleyball + Badminton', 'वॉलीबॉल + बैडमिंटन'],
  ['community', 'Community', 'समुदाय'],
];

export default async function About({ searchParams }) {
  const lang = searchParams.lang === 'hi' ? 'hi' : 'en';
  const cur = TABS.find(([k]) => k === searchParams.tab) || TABS[0];
  const sb = supabaseServer();
  const { data: pages } = await sb.from('about_pages')
    .select('id,slug,sort_order,accent,published,title_en,title_hi,subtitle_en,subtitle_hi')
    .eq('tab', cur[0]).order('sort_order');
  const list = pages || [];
  const ids = list.map((p) => p.id);
  const { data: blocks } = ids.length ? await sb.from('about_blocks').select('*').in('page_id', ids).order('sort_order') : { data: [] };
  const href = (tab, l) => `/about?tab=${tab}&lang=${l}`;
  const label = lang === 'hi' ? cur[2] : cur[1];
  const chapters = list.filter((p) => p.slug !== 'overview');

  return (
    <main className={`wrap ab${lang === 'hi' ? ' ab-hi' : ''}`}>
      <AboutStyles />
      <div className="ab-bar">
        <nav className="ab-tabs" aria-label="About sections">
          {TABS.map(([key, en, hi]) => (
            <Link key={key} className={`ab-tab${key === cur[0] ? ' on' : ''}`} href={href(key, lang)}>{lang === 'hi' ? hi : en}</Link>
          ))}
        </nav>
        <div className="ab-lang" role="group" aria-label="Language">
          <Link className={lang === 'en' ? 'on' : ''} href={href(cur[0], 'en')}>English</Link>
          <Link className={lang === 'hi' ? 'on' : ''} href={href(cur[0], 'hi')}>हिंदी</Link>
        </div>
      </div>

      {list.length === 0 && (
        <p className="ab-empty">{lang === 'hi' ? 'इस हिस्से की सामग्री जल्द आ रही है।' : 'Content for this section is coming soon.'}</p>
      )}

      {chapters.length > 1 && (
        <div className="ab-jump">
          {chapters.map((p) => (<a key={p.id} href={`#${p.slug}`}>{lang === 'hi' && p.title_hi ? p.title_hi : p.title_en}</a>))}
        </div>
      )}

      {list.map((p, i) => (
        <Chapter
          key={p.id}
          page={p}
          blocks={(blocks || []).filter((b) => b.page_id === p.id)}
          lang={lang}
          num={chapters.findIndex((c) => c.id === p.id) + 1}
          tabLabel={label}
        />
      ))}
    </main>
  );
  }
