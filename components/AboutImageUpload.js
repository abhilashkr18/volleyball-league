'use client';
import { addBlockImage } from '@/app/admin/actions';
import { shrinkPhotoInput } from '@/lib/shrinkPhoto';

// Adds one photo to a block: upload from the phone, or type the address of a photo already on the site.
export default function AboutImageUpload({ id, slug }) {
  return (
    <details style={{ marginTop: '.6rem' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Add a photo</summary>
      <form action={addBlockImage} style={{ marginTop: '.5rem' }}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="slug" value={slug} />
        <label htmlFor={`ph-${id}`}>Photo from your phone</label>
        <input id={`ph-${id}`} name="photo" type="file" accept="image/*" onChange={(e) => shrinkPhotoInput(e.target.form)} />
        <label htmlFor={`pa-${id}`}>Or a photo that is already on the site</label>
        <input id={`pa-${id}`} name="path" placeholder="/about/p03_i01.jpg" />
        <div className="row">
          <div><label htmlFor={`ce-${id}`}>Caption (English)</label><input id={`ce-${id}`} name="cap_en" /></div>
          <div><label htmlFor={`ch-${id}`}>Caption (Hindi)</label><input id={`ch-${id}`} name="cap_hi" /></div>
        </div>
        <p><button type="submit">Add photo</button></p>
      </form>
    </details>
  );
  }
