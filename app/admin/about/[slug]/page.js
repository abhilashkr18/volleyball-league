import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import AboutImageUpload from '@/components/AboutImageUpload';
import { updateAboutPage, saveAboutBlock, addAboutBlock, deleteAboutBlock, moveAboutBlock } from '../../actions';

export const dynamic = 'force-dynamic';

const KIND = {
  text: ['Text', 'Write paragraphs. Leave a blank line between paragraphs. A line like "Aman • Binod • Master" turns into name chips. Add a photo below to show it beside the text.'],
  stats: ['Number tiles', 'One tile per line: VALUE | LABEL    (example: 2005-06 | Cricket roots)'],
  timeline: ['Timeline', 'One entry per line: WHEN | TITLE | TEXT    (example: 2018 | Casual football | Football is played informally.)'],
  cards: ['Info cards', 'One card per line: TITLE | TEXT. For a list of names use: TITLE | Name1 • Name2 • Name3'],
  people: ['People cards', 'One person per line: PHOTO ADDRESS | NAME | ROLE | TEXT    (example: /about/p03_i01.jpg | Naveen | Opener | Short text). Role and text can be empty.'],
  steps: ['Numbered steps', 'One step per line: TITLE | TEXT'],
  quote: ['Big quote', 'One line per row. Each line is shown very large.'],
  gallery: ['Photo gallery', 'Photos only. Use the photo list below.'],
  note: ['Small note', 'A small boxed note under a section.'],
};
const TA = { width: '100%', font: 'inherit', padding: '.6rem', borderRadius: 8, border: '1px solid #3A3A40', background: '#0A0A0B', color: 'inherit' };

export default async function EditAbout({ params, searchParams }) {
  const sb = supabaseServer();
  const { data: page } = await sb.from('about_pages').select('*').eq('slug', params.slug).maybeSingle();
  if (!page) notFound();
  const { data: blocks } = await sb.from('about_blocks').select('*').eq('page_id', page.id).order('sort_order');
  const list = blocks || [];
  return (
    <main className="wrap" style={{ maxWidth: 760 }}>
      <p><Link href="/admin/about">← About section</Link> · <Link href={`/about?tab=${page.tab}&lang=en#${page.slug}`}>View on the site</Link></p>
      <h1>Edit page</h1>
      {searchParams.err && <div className="err">{searchParams.err}</div>}
      {searchParams.saved && <div className="warn">Saved.</div>}

      <form action={updateAboutPage} className="panel">
        <h3>Page details</h3>
        <input type="hidden" name="id" value={page.id} />
        <input type="hidden" name="slug" value={page.slug} />
        <label htmlFor="title_en">Title (English)</label><input id="title_en" name="title_en" defaultValue={page.title_en} required />
        <label htmlFor="title_hi">Title (Hindi)</label><input id="title_hi" name="title_hi" defaultValue={page.title_hi} />
        <label htmlFor="subtitle_en">Subtitle (English)</label><input id="subtitle_en" name="subtitle_en" defaultValue={page.subtitle_en} />
        <label htmlFor="subtitle_hi">Subtitle (Hindi)</label><input id="subtitle_hi" name="subtitle_hi" defaultValue={page.subtitle_hi} />
        <div className="row">
          <div><label htmlFor="accent">Colour</label>
            <select id="accent" name="accent" defaultValue={page.accent}>
              <option value="lime">Lime green</option><option value="cyan">Cyan blue</option><option value="gold">Gold</option><option value="orange">Orange</option>
            </select></div>
          <div><label htmlFor="sort_order">Order number (smaller shows first)</label><input id="sort_order" name="sort_order" type="number" defaultValue={page.sort_order} /></div>
        </div>
        <p><button type="submit">Save page details</button></p>
      </form>

      {list.map((b, i) => {
        const imgs = b.images || [];
        const editable = b.kind === 'gallery' || b.kind === 'text';
        return (
          <section key={b.id} id={`b-${b.id}`} className="panel">
            <form action={saveAboutBlock}>
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="slug" value={page.slug} />
              <h3>{KIND[b.kind][0]} <span className="muted">· part {i + 1}</span></h3>
              <p className="muted">{KIND[b.kind][1]}</p>
              {b.kind !== 'gallery' && b.kind !== 'quote' && (
                <div className="row">
                  <div><label htmlFor={`he-${b.id}`}>Heading (English)</label><input id={`he-${b.id}`} name="heading_en" defaultValue={b.heading_en} /></div>
                  <div><label htmlFor={`hh-${b.id}`}>Heading (Hindi)</label><input id={`hh-${b.id}`} name="heading_hi" defaultValue={b.heading_hi} /></div>
                </div>
              )}
              {b.kind !== 'gallery' && (
                <>
                  <label htmlFor={`be-${b.id}`}>Text (English)</label>
                  <textarea id={`be-${b.id}`} name="body_en" rows={8} defaultValue={b.body_en} style={TA} />
                  <label htmlFor={`bh-${b.id}`}>Text (Hindi)</label>
                  <textarea id={`bh-${b.id}`} name="body_hi" rows={8} defaultValue={b.body_hi} style={TA} />
                </>
              )}
              <input type="hidden" name="img_n" value={imgs.length} />
              {imgs.map((im, k) => (
                editable ? (
                  <div key={k} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', borderTop: '1px solid var(--line)', marginTop: '.6rem', paddingTop: '.6rem' }}>
                    <img src={im.src} alt="" style={{ width: 84, height: 64, objectFit: 'cover', borderRadius: 8, flex: 'none' }} />
                    <div style={{ flex: 1 }}>
                      <input name={`src_${k}`} defaultValue={im.src} aria-label="Photo address" />
                      <div className="row">
                        <input name={`cap_en_${k}`} defaultValue={im.cap_en} placeholder="Caption (English)" aria-label="Caption English" />
                        <input name={`cap_hi_${k}`} defaultValue={im.cap_hi} placeholder="Caption (Hindi)" aria-label="Caption Hindi" />
                      </div>
                      <label style={{ fontWeight: 400 }}><input type="checkbox" name={`del_${k}`} style={{ width: 'auto' }} /> Remove this photo</label>
                    </div>
                  </div>
                ) : (
                  <span key={k}>
                    <input type="hidden" name={`src_${k}`} value={im.src} /><input type="hidden" name={`cap_en_${k}`} value={im.cap_en || ''} /><input type="hidden" name={`cap_hi_${k}`} value={im.cap_hi || ''} />
                  </span>
                )
              ))}
              <p><button type="submit">Save this part</button></p>
            </form>
            {editable && <AboutImageUpload id={b.id} slug={page.slug} />}
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '.8rem', borderTop: '1px solid var(--line)', paddingTop: '.8rem' }}>
              <form action={moveAboutBlock}><input type="hidden" name="id" value={b.id} /><input type="hidden" name="slug" value={page.slug} /><input type="hidden" name="dir" value="up" /><button className="btn-line" style={{ padding: '.35rem .9rem' }}>Move up</button></form>
              <form action={moveAboutBlock}><input type="hidden" name="id" value={b.id} /><input type="hidden" name="slug" value={page.slug} /><input type="hidden" name="dir" value="down" /><button className="btn-line" style={{ padding: '.35rem .9rem' }}>Move down</button></form>
              <form action={deleteAboutBlock} style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginLeft: 'auto' }}>
                <input type="hidden" name="id" value={b.id} /><input type="hidden" name="slug" value={page.slug} />
                <label style={{ margin: 0, fontWeight: 400 }}><input type="checkbox" required style={{ width: 'auto' }} /> Yes, delete this part</label>
                <button className="btn-line" style={{ padding: '.35rem .9rem' }}>Delete</button>
              </form>
            </div>
          </section>
        );
      })}

      <form action={addAboutBlock} className="panel">
        <h3>Add a new part</h3>
        <input type="hidden" name="page_id" value={page.id} />
        <input type="hidden" name="slug" value={page.slug} />
        <label htmlFor="newkind">What do you want to add?</label>
        <select id="newkind" name="kind" defaultValue="text">
          {Object.entries(KIND).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}
        </select>
        <p><button type="submit">Add</button></p>
      </form>
    </main>
  );
  }
