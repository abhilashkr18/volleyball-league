const CSS = `
.ab{--lime:#B6F23A;--cyan:#37D6FF;--gold:#FFC84A;--org:#FF7A1A;position:relative;isolation:isolate}
.ab::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:-1;background:radial-gradient(60% 26% at 8% 0,rgba(182,242,58,.15),transparent),radial-gradient(50% 24% at 100% 18%,rgba(55,214,255,.13),transparent),radial-gradient(55% 30% at 0 58%,rgba(255,200,74,.1),transparent),radial-gradient(50% 24% at 100% 85%,rgba(255,122,26,.12),transparent)}
.ab-bar{display:flex;gap:.6rem;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:.4rem 0 1rem}
.ab-tabs{display:flex;gap:.4rem;overflow-x:auto;scrollbar-width:none;flex:1;padding:.2rem 0}
.ab-tabs::-webkit-scrollbar{display:none}
.ab-tab{white-space:nowrap;text-decoration:none;color:var(--text);font-weight:600;font-size:.88rem;padding:.5rem 1rem;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.03)}
.ab-tab.on{background:var(--or);color:#fff;border-color:transparent;box-shadow:0 0 20px rgba(255,106,0,.45)}
.ab-lang{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden;flex:none}
.ab-lang a{padding:.4rem .95rem;text-decoration:none;color:var(--muted);font-weight:700;font-size:.85rem}
.ab-lang a.on{background:#fff;color:#000}
.ab-jump{display:flex;flex-wrap:wrap;gap:.4rem;margin:0 0 .6rem}
.ab-jump a{font-size:.8rem;color:var(--muted);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:.25rem .75rem}
.ab-jump a:hover{color:#fff;border-color:#fff}
.ab-hero{position:relative;border-radius:22px;overflow:hidden;min-height:440px;display:flex;align-items:flex-end;background:#0a0f14 var(--bg) center/cover;isolation:isolate;border:1px solid var(--line)}
.ab-hero::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(5,8,12,.2),rgba(5,8,12,.94)),linear-gradient(90deg,rgba(182,242,58,.2),transparent 60%)}
.ab-hero .hin{padding:1.4rem 1.2rem 1.6rem;width:100%}
.ab-hero .eb{color:var(--lime);font-weight:800;letter-spacing:.16em;font-size:.72rem;text-transform:uppercase}
.ab-hero h1{font-size:clamp(2.7rem,12vw,5.6rem);line-height:.95;margin:.4rem 0 .5rem;background:linear-gradient(90deg,#fff 45%,var(--lime));-webkit-background-clip:text;background-clip:text;color:transparent}
.ab-hero .tg{color:var(--cyan);font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:.95rem;margin:0 0 .7rem}
.ab-hero p.lead{max-width:40rem;margin:0;color:#EAF0F8;font-size:1.05rem;line-height:1.6}
.ab-ch{margin:3rem 0;scroll-margin-top:90px}
.ab-eb{color:var(--ac);font-weight:800;letter-spacing:.14em;font-size:.72rem;text-transform:uppercase;display:flex;align-items:center;gap:.6rem}
.ab-eb::before{content:"";width:34px;height:3px;background:var(--ac);border-radius:3px;box-shadow:0 0 14px var(--ac)}
.ab-title{font-size:clamp(2rem,7vw,3.4rem);line-height:1;margin:.5rem 0 .4rem}
.ab-sub{color:var(--muted);max-width:44rem;margin:0 0 1.2rem}
.ab-hid{background:#c62828;color:#fff;border-radius:6px;font-size:.65rem;padding:.1rem .5rem;margin-left:.5rem;letter-spacing:.05em}
.ab-b{margin:1.1rem 0}
.ab-text{background:linear-gradient(160deg,rgba(255,255,255,.055),rgba(255,255,255,.015));border:1px solid var(--line);border-left:4px solid var(--ac);border-radius:16px;padding:1.1rem 1.2rem}
.ab-text h3{color:var(--ac);font-size:1.5rem;margin:0 0 .6rem}
.ab-text p{margin:.55rem 0;font-size:1.02rem;line-height:1.65;color:#E3E9F2}
.ab-split{display:grid;gap:1.1rem;align-items:center}
@media(min-width:760px){.ab-split{grid-template-columns:1fr 1fr}.ab-split.flip .ab-fig{order:2}}
.ab-fig{margin:0;position:relative}
.ab-fig img{width:100%;display:block;border-radius:16px;border:2px solid var(--ac);box-shadow:10px 10px 0 -2px rgba(255,255,255,.05),0 0 40px rgba(0,0,0,.5);aspect-ratio:4/3;object-fit:cover}
.ab-fig figcaption{position:absolute;left:10px;top:10px;background:var(--ac);color:#05080c;font-weight:800;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;padding:.2rem .6rem;border-radius:999px}
.ab-stats h3{margin:0 0 .6rem;color:var(--ac);font-size:1.3rem}
.ab-sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.7rem}
.ab-stat{border:1px solid var(--line);border-top:3px solid var(--ac);border-radius:14px;padding:.9rem;background:rgba(255,255,255,.03)}
.ab-stat b{display:block;font-family:var(--font-head),Impact,sans-serif;font-weight:400;font-size:clamp(1.7rem,6vw,2.4rem);line-height:1.05;color:var(--ac)}
.ab-stat span{color:var(--muted);font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;font-weight:600}
.ab-tlw h3,.ab-cw h3,.ab-sw h3,.ab-pw h3{color:var(--ac);font-size:1.3rem;margin:0 0 .6rem}
.ab-tl{position:relative;margin:.4rem 0;padding-left:1.6rem}
.ab-tl::before{content:"";position:absolute;left:7px;top:6px;bottom:6px;width:3px;border-radius:3px;background:linear-gradient(var(--ac),rgba(255,255,255,.08));box-shadow:0 0 14px var(--ac)}
.ab-ti{position:relative;margin:0 0 1.1rem;background:rgba(255,255,255,.035);border:1px solid var(--line);border-radius:14px;padding:.8rem .95rem}
.ab-ti::before{content:"";position:absolute;left:-1.48rem;top:1rem;width:13px;height:13px;border-radius:50%;background:var(--ac);box-shadow:0 0 0 4px rgba(255,255,255,.07),0 0 16px var(--ac)}
.ab-ti .w{display:inline-block;background:var(--ac);color:#05080c;font-weight:800;font-size:.72rem;letter-spacing:.05em;border-radius:999px;padding:.12rem .65rem;text-transform:uppercase}
.ab-ti h4{margin:.4rem 0 .15rem;font-family:var(--font-head),Impact,sans-serif;font-weight:400;font-size:1.25rem;text-transform:uppercase;letter-spacing:.02em}
.ab-ti p{margin:0;color:#C9D3E2}
.ab-cg{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.7rem}
.ab-card{background:rgba(255,255,255,.035);border:1px solid var(--line);border-radius:14px;padding:.9rem}
.ab-card h4{margin:0 0 .45rem;color:var(--ac);font-family:var(--font-head),Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:1.05rem;letter-spacing:.03em}
.ab-card p{margin:0;color:#D5DDE9}
.ab-chips{display:flex;flex-wrap:wrap;gap:.4rem;margin:.55rem 0}
.ab-chip{border:1px solid var(--ac);color:#fff;background:rgba(255,255,255,.04);border-radius:999px;padding:.22rem .7rem;font-size:.88rem}
.ab-pg{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.8rem}
.ab-pc{background:rgba(255,255,255,.035);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.ab-pc .im{position:relative;aspect-ratio:4/5;background:#0c1118}
.ab-pc .im img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.ab-pc .im::after{content:"";position:absolute;inset:auto 0 0 0;height:55%;background:linear-gradient(transparent,rgba(5,8,12,.96))}
.ab-pc .im h4{position:absolute;left:.8rem;bottom:.6rem;margin:0;z-index:1;font-family:var(--font-head),Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:1.35rem;line-height:1}
.ab-pc .bd{padding:.7rem .85rem .9rem}
.ab-pc .bd h4{margin:0 0 .2rem;font-family:var(--font-head),Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:1.3rem}
.ab-pc .rl{color:var(--ac);font-weight:800;font-size:.76rem;letter-spacing:.05em;text-transform:uppercase}
.ab-pc p{margin:.4rem 0 0;color:#CFD8E6;font-size:.93rem;line-height:1.5}
.ab-sl{display:grid;gap:.7rem}
.ab-st{display:flex;gap:.85rem;background:rgba(255,255,255,.035);border:1px solid var(--line);border-radius:14px;padding:.85rem}
.ab-st .n{flex:none;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:var(--ac);color:#05080c;font-family:var(--font-head),Impact,sans-serif;font-size:1.2rem}
.ab-st h4{margin:0 0 .2rem;font-family:var(--font-head),Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:1.15rem}
.ab-st p{margin:0;color:#CFD8E6}
.ab-quote{margin:1.4rem 0;padding:1.3rem 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.ab-quote span{display:block;font-family:var(--font-head),Impact,sans-serif;text-transform:uppercase;font-size:clamp(1.9rem,8.5vw,3.6rem);line-height:1.04}
.ab-quote .q0{color:var(--lime)}.ab-quote .q1{color:#fff}.ab-quote .q2{color:var(--cyan)}
.ab-gal{display:grid;gap:.5rem}
.ab-gal.g1{grid-template-columns:1fr}
.ab-gal.g2,.ab-gal.g3,.ab-gal.g4{grid-template-columns:1fr 1fr}
.ab-gal.g3 .ab-ph:first-child,.ab-gal.g4 .ab-ph:first-child,.ab-gal.g4 .ab-ph:nth-child(4){grid-column:1/-1}
@media(min-width:760px){
.ab-gal.g3{grid-template-columns:2fr 1fr;grid-template-rows:1fr 1fr}.ab-gal.g3 .ab-ph:first-child{grid-column:1;grid-row:1/3}
.ab-gal.g4{grid-template-columns:2fr 1fr 1fr;grid-template-rows:1fr 1fr}.ab-gal.g4 .ab-ph:first-child{grid-column:1;grid-row:1/3}.ab-gal.g4 .ab-ph:nth-child(4){grid-column:2/4}
.ab-gal.g3 .ab-ph,.ab-gal.g4 .ab-ph{aspect-ratio:auto;min-height:170px}}
.ab-ph{position:relative;padding:0;border:0;background:#0c1118;border-radius:14px;overflow:hidden;cursor:zoom-in;box-shadow:none;aspect-ratio:16/10;display:block}
.ab-ph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s}
.ab-ph:hover img{transform:scale(1.05)}
.ab-ph span{position:absolute;left:8px;bottom:8px;background:rgba(5,8,12,.8);color:#fff;font-size:.7rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:.18rem .6rem;border-radius:999px}
.ab-lb{position:fixed;inset:0;z-index:95;background:rgba(0,0,0,.93);display:grid;place-items:center;padding:1rem;align-content:center}
.ab-lb img{max-width:100%;max-height:78vh;object-fit:contain;border-radius:10px}
.ab-lb p{color:#fff;margin:.6rem 0 0;text-align:center}
.ab-lb button{position:absolute;box-shadow:none;background:rgba(255,255,255,.16);color:#fff;border-radius:50%;width:44px;height:44px;padding:0;font-size:1.4rem;display:grid;place-items:center}
.ab-lb .x{top:12px;right:12px}.ab-lb .pv{left:10px;top:50%}.ab-lb .nx{right:10px;top:50%}
.ab-note{border:1px dashed rgba(255,255,255,.22);border-radius:14px;padding:.8rem 1rem;color:var(--muted);font-size:.92rem}
.ab-note b{color:var(--ac);display:block;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:.2rem}
.ab-empty{text-align:center;color:var(--muted);padding:3rem 0}
.ab-rv.pre{opacity:0;transform:translateY(26px)}
.ab-rv.pre.in{opacity:1;transform:none;transition:opacity .7s ease,transform .7s ease}
@media(prefers-reduced-motion:reduce){.ab-rv.pre{opacity:1;transform:none}}
.ab-hi,.ab-hi h1,.ab-hi h2,.ab-hi h3,.ab-hi h4,.ab-hi .ab-stat b,.ab-hi .ab-quote span,.ab-hi .ab-st .n{font-family:var(--font-deva),var(--font-body),system-ui,sans-serif;text-transform:none;letter-spacing:0}
.ab-hi h1,.ab-hi .ab-title{font-weight:800;line-height:1.2}
.ab-hi h3,.ab-hi h4,.ab-hi .ab-stat b,.ab-hi .ab-quote span{font-weight:800}
.ab-hi .ab-eb,.ab-hi .ab-stat span,.ab-hi .ab-ti .w,.ab-hi .ab-pc .rl,.ab-hi .ab-fig figcaption,.ab-hi .ab-ph span{letter-spacing:0;text-transform:none}
`;

export default function AboutStyles() {
  return <style>{CSS}</style>;
}
