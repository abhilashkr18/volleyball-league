const CSS = `
.hm{--lime:#B6F23A;--mint:#6EF0B2;--cyan:#37D6FF;--gold:#FFC84A;--org:#FF7A1A;--pink:#FF5C8A;overflow-x:clip}
.hm-live{display:flex;gap:.7rem;align-items:center;justify-content:center;flex-wrap:wrap;background:linear-gradient(90deg,#c62828,#ff5c3a);color:#fff;font-weight:800;padding:.55rem 1rem;text-decoration:none;text-align:center}
.hm-live i{width:.6rem;height:.6rem;border-radius:50%;background:#fff;animation:hmp 1.1s infinite}
@keyframes hmp{50%{opacity:.2}}
.hm-hero{position:relative;min-height:620px;display:flex;align-items:flex-end;overflow:hidden;background:#071015 url(/about/p01_i02.jpg) center/cover;isolation:isolate}
.hm-hero::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(5,10,14,.2) 0%,rgba(5,10,14,.55) 55%,#070707 100%),linear-gradient(100deg,rgba(182,242,58,.26),rgba(55,214,255,.12) 55%,transparent)}
.hm-aur{position:absolute;inset:-20%;z-index:-1;background:radial-gradient(40% 30% at 20% 30%,rgba(182,242,58,.35),transparent 70%),radial-gradient(35% 28% at 80% 20%,rgba(55,214,255,.3),transparent 70%),radial-gradient(40% 30% at 70% 85%,rgba(255,122,26,.28),transparent 70%);animation:hmaur 14s ease-in-out infinite alternate;mix-blend-mode:screen}
@keyframes hmaur{to{transform:translate3d(4%,-3%,0) scale(1.1)}}
.hm-hero .in{width:100%;max-width:1080px;margin:0 auto;padding:6rem 1rem 3.2rem}
.hm-kick{display:inline-flex;gap:.5rem;align-items:center;border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:.25rem .85rem;font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--lime);background:rgba(0,0,0,.35)}
.hm-hero h1{font-size:clamp(3rem,15vw,8rem);line-height:.9;margin:.8rem 0 .6rem;font-style:italic;color:#fff;text-shadow:0 6px 40px rgba(0,0,0,.6)}
.hm-hero h1 span{display:block;background:linear-gradient(90deg,#B6F23A,#37D6FF 45%,#FFC84A 75%,#B6F23A);-webkit-background-clip:text;background-clip:text;color:transparent;background-size:200% 100%;animation:hmshift 8s linear infinite;text-shadow:none}
@keyframes hmshift{to{background-position:200% 0}}
.hm-hero p.tg{max-width:34rem;font-size:1.12rem;color:#EAF2FA;margin:.2rem 0 1.4rem}
.hm-cta{display:flex;gap:.7rem;flex-wrap:wrap}
.hm-btn{border-radius:999px;padding:.8rem 1.5rem;font-weight:800;text-decoration:none;display:inline-block}
.hm-btn.p{background:linear-gradient(90deg,#B6F23A,#6EF0B2);color:#04110a;box-shadow:0 0 30px rgba(182,242,58,.45)}
.hm-btn.g{border:1px solid rgba(255,255,255,.4);color:#fff;background:rgba(255,255,255,.07)}
.hm-mq{overflow:hidden;white-space:nowrap;background:linear-gradient(90deg,#B6F23A,#37D6FF,#FFC84A,#FF7A1A);color:#06100a;font-family:var(--font-head),Impact,sans-serif;text-transform:uppercase;font-size:1.3rem;padding:.4rem 0;transform:skewY(-1.2deg);margin:1.6rem -2% 2rem}
.hm-mq div{display:inline-block;animation:hmq 30s linear infinite}
.hm-mq span{margin:0 1.2rem}
@keyframes hmq{to{transform:translateX(-50%)}}
.hm-wrap{max-width:1080px;margin:0 auto;padding:0 1rem}
.hm-st{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.7rem}
.hm-stat{border:1px solid var(--line);border-top:4px solid var(--c);border-radius:16px;padding:1rem;background:rgba(255,255,255,.035)}
.hm-stat b{display:block;font-family:var(--font-head),Impact,sans-serif;font-weight:400;font-size:clamp(1.9rem,7vw,2.8rem);line-height:1;color:var(--c)}
.hm-stat span{color:var(--muted);font-size:.74rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700}
.hm-evbar{display:grid;grid-template-columns:auto 1fr auto auto;gap:1rem;align-items:center;background:rgba(15,15,17,.9);border:1px solid rgba(255,200,74,.45);border-radius:16px;padding:.9rem 1.1rem;margin-top:1rem;box-shadow:0 0 30px rgba(255,200,74,.12)}
.hm-evbar .lab{font-family:var(--font-head),Impact,sans-serif;font-size:1.3rem;line-height:1;text-transform:uppercase}.hm-evbar .lab b{display:block;color:var(--gold);font-weight:400}
.hm-evbar .nm{border-left:1px solid var(--line);padding-left:1rem}.hm-evbar .nm b{display:block}
@media(max-width:800px){.hm-evbar{grid-template-columns:1fr;text-align:center}.hm-evbar .nm{border:0;padding:0}.hm-evbar .cd{justify-content:center}}
.hm-h{text-align:center;margin:3.4rem 0 1.2rem}
.hm-h h2{font-size:clamp(2rem,8vw,3.4rem);font-style:italic;margin:0}
.hm-h h2 em{font-style:italic;background:linear-gradient(90deg,var(--lime),var(--cyan));-webkit-background-clip:text;background-clip:text;color:transparent}
.hm-h p{color:var(--muted);margin:.3rem 0 0}
.hm-sp{display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:.8rem}
.hm-sc{position:relative;aspect-ratio:3/4;border-radius:20px;overflow:hidden;text-decoration:none;color:#fff;background:#0c1118 var(--img) center/cover;border:1px solid var(--line);display:flex;align-items:flex-end;transition:transform .3s}
.hm-sc:hover{transform:translateY(-6px) rotate(-.6deg)}
.hm-sc::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 20%,rgba(5,8,12,.94)),linear-gradient(160deg,var(--c),transparent 65%);opacity:.92}
.hm-sc .tx{position:relative;padding:.9rem;width:100%}
.hm-sc .ic{font-size:2.3rem;line-height:1}
.hm-sc b{display:block;font-family:var(--font-head),Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:1.6rem;line-height:1.05}
.hm-sc small{display:block;color:#E6EEF6}
.hm-sc .go{color:var(--c);font-weight:800;font-size:.8rem;margin-top:.2rem;display:block;filter:brightness(1.4)}
.hm-split{display:grid;gap:1.4rem;align-items:center}
@media(min-width:800px){.hm-split{grid-template-columns:1fr 1fr}}
.hm-fig img{width:100%;display:block;border-radius:20px;border:2px solid var(--lime);box-shadow:12px 12px 0 -2px rgba(55,214,255,.25);aspect-ratio:4/3;object-fit:cover}
.hm-tx h2{font-size:clamp(1.9rem,7vw,3rem);font-style:italic;margin:.2rem 0 .6rem}
.hm-tx h2 em{font-style:italic;color:var(--lime)}
.hm-tx p{color:#DDE5EF;line-height:1.7;font-size:1.04rem}
.hm-years{display:flex;flex-wrap:wrap;gap:.45rem;margin:1rem 0}
.hm-years span{border:1px solid var(--c);border-radius:999px;padding:.25rem .8rem;font-size:.84rem;font-weight:700;color:#fff;background:rgba(255,255,255,.04)}
.hm-kpl{border-radius:24px;overflow:hidden;border:1px solid rgba(255,200,74,.5);background:linear-gradient(135deg,rgba(255,200,74,.18),rgba(255,122,26,.1));box-shadow:0 0 50px rgba(255,200,74,.1)}
.hm-kpl .hm-split{gap:0}
.hm-kpl .hm-fig img{border:0;box-shadow:none;border-radius:0;aspect-ratio:16/11;height:100%}
.hm-kpl .hm-tx{padding:1.3rem}
.hm-kpl .eb{color:var(--gold);font-weight:800;letter-spacing:.14em;font-size:.72rem;text-transform:uppercase}
.hm-pl{display:flex;gap:.7rem;overflow-x:auto;scroll-snap-type:x mandatory;padding:.2rem 0 .7rem;scrollbar-width:thin}
.hm-pc{flex:none;width:148px;scroll-snap-align:start;text-decoration:none;color:#fff;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.hm-pc .im{aspect-ratio:1;background:#0c1118;display:grid;place-items:center;font-size:2.4rem;font-weight:800}
.hm-pc .im img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.hm-pc .bd{padding:.5rem .6rem .7rem}
.hm-pc b{display:block;font-size:.95rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hm-pc span{color:var(--lime);font-family:var(--font-head),Impact,sans-serif;font-size:.95rem}
.hm-gl{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.5rem}
.hm-gl a{display:block;border-radius:14px;overflow:hidden;aspect-ratio:4/3}
.hm-gl img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s}
.hm-gl a:hover img{transform:scale(1.07)}
.hm-join{margin:3.5rem 0 1rem;border-radius:24px;padding:2rem 1.2rem;text-align:center;background:linear-gradient(120deg,rgba(182,242,58,.2),rgba(55,214,255,.16),rgba(255,122,26,.2));border:1px solid rgba(255,255,255,.2)}
.hm-join h2{font-size:clamp(1.9rem,7vw,3rem);font-style:italic;margin:0 0 .4rem}
.hm-join p{color:#DDE5EF;margin:0 0 1.1rem}
@media(prefers-reduced-motion:reduce){.hm-aur,.hm-mq div,.hm-hero h1 span,.hm-live i{animation:none}}
`;

export default function HomeStyles() {
  return <style>{CSS}</style>;
}
