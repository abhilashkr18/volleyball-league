import AboutGallery from './AboutGallery';
import Reveal from './Reveal';
import { rows, paragraphs, chips } from '@/lib/aboutParse';

export const ACCENT = { lime: '#B6F23A', cyan: '#37D6FF', gold: '#FFC84A', orange: '#FF7A1A' };
const pick = (lang, en, hi) => (lang === 'hi' && hi && String(hi).trim() ? hi : en);

function Paras({ text }) {
  return paragraphs(text).map((p, i) => {
    const c = chips(p);
    return c ? <div className="ab-chips" key={i}>{c.map((x) => <span className="ab-chip" key={x}>{x}</span>)}</div> : <p key={i}>{p}</p>;
  });
}

function Block({ b, lang, i }) {
  const heading = pick(lang, b.heading_en, b.heading_hi);
  const body = pick(lang, b.body_en, b.body_hi);
  const imgs = (b.images || []).map((im) => ({ src: im.src, cap: pick(lang, im.cap_en, im.cap_hi) }));

  if (b.kind === 'gallery') return <AboutGallery images={imgs} />;

  if (b.kind === 'text') {
    const card = (<div className="ab-text">{heading && <h3>{heading}</h3>}<Paras text={body} /></div>);
    if (imgs[0]) {
      return (
        <div className={`ab-split${i % 2 ? ' flip' : ''}`}>
          <figure className="ab-fig"><img src={imgs[0].src} alt={imgs[0].cap || heading} loading="lazy" />{imgs[0].cap && <figcaption>{imgs[0].cap}</figcaption>}</figure>
          {card}
        </div>
      );
    }
    return card;
  }

  if (b.kind === 'stats') {
    return (
      <div className="ab-stats">
        {heading && <h3>{heading}</h3>}
        <div className="ab-sg">{rows(body, 2).map(([v, l], k) => (<div className="ab-stat" key={k}><b>{v}</b><span>{l}</span></div>))}</div>
      </div>
    );
  }

  if (b.kind === 'timeline') {
    return (
      <div className="ab-tlw">
        {heading && <h3>{heading}</h3>}
        <div className="ab-tl">{rows(body, 3).map(([w, t, d], k) => (<div className="ab-ti" key={k}><span className="w">{w}</span><h4>{t}</h4><p>{d}</p></div>))}</div>
      </div>
    );
  }

  if (b.kind === 'cards') {
    return (
      <div className="ab-cw">
        {heading && <h3>{heading}</h3>}
        <div className="ab-cg">{rows(body, 2).map(([t, d], k) => {
          const c = chips(d);
          return (<div className="ab-card" key={k}><h4>{t}</h4>{c ? <div className="ab-chips" style={{ margin: 0 }}>{c.map((x) => <span className="ab-chip" key={x}>{x}</span>)}</div> : <p>{d}</p>}</div>);
        })}</div>
      </div>
    );
  }

  if (b.kind === 'people') {
    return (
      <div className="ab-pw">
        {heading && <h3>{heading}</h3>}
        <div className="ab-pg">{rows(body, 4).map(([src, name, role, text], k) => (
          <article className="ab-pc" key={k}>
            {src ? (<div className="im"><img src={src} alt={name} loading="lazy" /><h4>{name}</h4></div>) : null}
            <div className="bd">{!src && <h4>{name}</h4>}{role && <div className="rl">{role}</div>}{text && <p>{text}</p>}</div>
          </article>
        ))}</div>
      </div>
    );
  }

  if (b.kind === 'steps') {
    return (
      <div className="ab-sw">
        {heading && <h3>{heading}</h3>}
        <div className="ab-sl">{rows(body, 2).map(([t, d], k) => (<div className="ab-st" key={k}><span className="n">{k + 1}</span><div><h4>{t}</h4><p>{d}</p></div></div>))}</div>
      </div>
    );
  }

  if (b.kind === 'quote') {
    return <div className="ab-quote">{String(body).split('\n').filter(Boolean).map((l, k) => <span className={`q${k % 3}`} key={k}>{l}</span>)}</div>;
  }

  return (<div className="ab-note">{heading && <b>{heading}</b>}{paragraphs(body).map((p, k) => <div key={k}>{p}</div>)}</div>);
}

export default function Chapter({ page, blocks, lang, num, tabLabel }) {
  const ac = ACCENT[page.accent] || ACCENT.lime;
  const title = pick(lang, page.title_en, page.title_hi);
  const sub = pick(lang, page.subtitle_en, page.subtitle_hi);
  const hidden = !page.published;
  const isHero = page.slug === 'overview';
  const first = blocks[0];
  const bg = isHero && first && first.images && first.images[0] ? first.images[0].src : null;
  const rest = isHero && first ? blocks.slice(1) : blocks;

  return (
    <section className="ab-ch" id={page.slug} style={{ '--ac': ac }}>
      {isHero ? (
        <div className="ab-hero" style={bg ? { '--bg': `url(${bg})` } : undefined}>
          <div className="hin">
            <div className="eb">{pick(lang, first.heading_en, first.heading_hi)}</div>
            <h1>{title}</h1>
            <p className="tg">{sub}</p>
            <p className="lead">{pick(lang, first.body_en, first.body_hi)}</p>
          </div>
        </div>
      ) : (
        <Reveal>
          <div className="ab-eb">{tabLabel} · {String(num).padStart(2, '0')}{hidden && <span className="ab-hid">HIDDEN</span>}</div>
          <h2 className="ab-title">{title}</h2>
          {sub && <p className="ab-sub">{sub}</p>}
        </Reveal>
      )}
      {rest.map((b, i) => (<Reveal className="ab-b" key={b.id || i}><Block b={b} lang={lang} i={i} /></Reveal>))}
    </section>
  );
                       }
