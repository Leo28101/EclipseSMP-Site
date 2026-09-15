const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(window.__tt);window.__tt=setTimeout(()=>t.classList.remove("show"),2200)};

// background
const space=$("#space"),ctx=space.getContext("2d");let stars=[];
function resizeSpace(){const d=Math.min(devicePixelRatio,2);space.width=innerWidth*d;space.height=innerHeight*d;space.style.width=innerWidth+"px";space.style.height=innerHeight+"px";ctx.setTransform(d,0,0,d,0,0);stars=Array.from({length:Math.min(450,Math.floor(innerWidth*.34))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:.25+Math.random()*1.4,a:.25+Math.random()*.65,p:Math.random()*6.28}))}resizeSpace();addEventListener("resize",resizeSpace);
function bg(t){ctx.clearRect(0,0,innerWidth,innerHeight);for(const s of stars){ctx.fillStyle=`rgba(225,230,255,${s.a*(.55+.45*Math.sin(t*.001+s.p))})`;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}requestAnimationFrame(bg)}requestAnimationFrame(bg);

// intro audio sfx
let sfxCtx;
function ac(){if(!sfxCtx)sfxCtx=new (window.AudioContext||window.webkitAudioContext)();if(sfxCtx.state==="suspended")sfxCtx.resume();return sfxCtx}
function rocketSound(){try{const c=ac(),n=c.currentTime,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type="sawtooth";o.frequency.setValueAtTime(34,n);o.frequency.exponentialRampToValueAtTime(120,n+4.2);f.type="lowpass";f.frequency.setValueAtTime(150,n);f.frequency.exponentialRampToValueAtTime(900,n+4.2);g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(.15,n+.2);g.gain.exponentialRampToValueAtTime(.025,n+4.2);o.connect(f).connect(g).connect(c.destination);o.start(n);o.stop(n+4.3)}catch(e){}}
function boomSound(){try{const c=ac(),n=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(150,n);o.frequency.exponentialRampToValueAtTime(22,n+1.15);g.gain.setValueAtTime(.38,n);g.gain.exponentialRampToValueAtTime(.0001,n+1.3);o.connect(g).connect(c.destination);o.start(n);o.stop(n+1.32);const len=Math.floor(c.sampleRate*1.4),b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.3);const src=c.createBufferSource(),ng=c.createGain(),lp=c.createBiquadFilter();src.buffer=b;lp.type="lowpass";lp.frequency.value=1000;ng.gain.value=.25;src.connect(lp).connect(ng).connect(c.destination);src.start(n)}catch(e){}}

// cinematic intro
const intro=$("#intro"),can=$("#introCanvas"),ix=can.getContext("2d"),startBtn=$("#startIntro"),skip=$("#skipIntro");
let state="idle",startTime=0,exploded=false,particles=[];
function resizeIntro(){const d=Math.min(devicePixelRatio,2);can.width=innerWidth*d;can.height=innerHeight*d;can.style.width=innerWidth+"px";can.style.height=innerHeight+"px";ix.setTransform(d,0,0,d,0,0)}resizeIntro();addEventListener("resize",resizeIntro);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=t=>1-Math.pow(1-t,3),smooth=t=>t*t*(3-2*t);
function rocket(x,y,rot,scale,thrust){
  ix.save();
  ix.translate(x,y);
  ix.rotate(rot);
  ix.scale(scale,scale);

  // engine flame only (no rear line/trail)
  if(thrust){
    const flame=ix.createLinearGradient(0,30,0,185);
    flame.addColorStop(0,"rgba(255,255,255,.98)");
    flame.addColorStop(.10,"rgba(120,242,255,.98)");
    flame.addColorStop(.34,"rgba(156,92,255,.92)");
    flame.addColorStop(.66,"rgba(255,129,54,.86)");
    flame.addColorStop(1,"rgba(255,90,20,0)");
    ix.fillStyle=flame;
    ix.beginPath();
    ix.moveTo(-15,28);
    ix.bezierCurveTo(-38,70,-28,130,0,185);
    ix.bezierCurveTo(28,130,38,70,15,28);
    ix.closePath();
    ix.fill();

    ix.fillStyle="rgba(255,255,255,.28)";
    ix.beginPath();
    ix.moveTo(-8,32);
    ix.bezierCurveTo(-18,72,-12,112,0,145);
    ix.bezierCurveTo(12,112,18,72,8,32);
    ix.closePath();
    ix.fill();
  }

  // side fins
  const finGrad=ix.createLinearGradient(-52,0,52,0);
  finGrad.addColorStop(0,"#4721b6");
  finGrad.addColorStop(.5,"#865bff");
  finGrad.addColorStop(1,"#4b2ac1");
  ix.fillStyle=finGrad;
  ix.beginPath();
  ix.moveTo(-18,8); ix.lineTo(-54,42); ix.lineTo(-22,-40); ix.closePath(); ix.fill();
  ix.beginPath();
  ix.moveTo(18,8); ix.lineTo(54,42); ix.lineTo(22,-40); ix.closePath(); ix.fill();

  // lower stabilizers
  ix.fillStyle="#2f1a7d";
  ix.beginPath();
  ix.moveTo(-15,20); ix.lineTo(-34,56); ix.lineTo(-8,34); ix.closePath(); ix.fill();
  ix.beginPath();
  ix.moveTo(15,20); ix.lineTo(34,56); ix.lineTo(8,34); ix.closePath(); ix.fill();

  // fuselage
  const body=ix.createLinearGradient(-24,0,24,0);
  body.addColorStop(0,"#737d98");
  body.addColorStop(.18,"#eef2ff");
  body.addColorStop(.48,"#ffffff");
  body.addColorStop(.78,"#c7d0e3");
  body.addColorStop(1,"#5d6883");
  ix.fillStyle=body;
  ix.beginPath();
  ix.moveTo(-22,26);
  ix.lineTo(-22,-76);
  ix.quadraticCurveTo(-20,-98,0,-132);
  ix.quadraticCurveTo(20,-98,22,-76);
  ix.lineTo(22,26);
  ix.quadraticCurveTo(18,35,0,38);
  ix.quadraticCurveTo(-18,35,-22,26);
  ix.closePath();
  ix.fill();

  // nose shine
  const nose=ix.createLinearGradient(-18,-138,18,-78);
  nose.addColorStop(0,"#8a95b2");
  nose.addColorStop(.38,"#ffffff");
  nose.addColorStop(1,"#7b86a2");
  ix.fillStyle=nose;
  ix.beginPath();
  ix.moveTo(0,-146);
  ix.bezierCurveTo(12,-126,20,-102,20,-82);
  ix.lineTo(-20,-82);
  ix.bezierCurveTo(-20,-102,-12,-126,0,-146);
  ix.closePath();
  ix.fill();

  // body details
  ix.fillStyle="#171b28";
  ix.fillRect(-22,-8,44,16);
  ix.fillStyle="#8d5cff";
  ix.fillRect(-22,-38,44,11);
  ix.fillStyle="#0e1119";
  ix.fillRect(-4,-8,8,16);

  // side panel lines
  ix.strokeStyle="rgba(94,107,138,.65)";
  ix.lineWidth=1.2;
  ix.beginPath();
  ix.moveTo(-11,-68); ix.lineTo(-11,22);
  ix.moveTo(11,-68); ix.lineTo(11,22);
  ix.stroke();

  // cockpit
  ix.fillStyle="#111724";
  ix.beginPath(); ix.arc(0,-56,15,0,Math.PI*2); ix.fill();
  ix.strokeStyle="#8e9abc"; ix.lineWidth=3; ix.stroke();
  const glass=ix.createRadialGradient(-4,-60,1,-2,-58,13);
  glass.addColorStop(0,"rgba(255,255,255,.95)");
  glass.addColorStop(.32,"rgba(119,238,255,.96)");
  glass.addColorStop(1,"rgba(24,80,126,.95)");
  ix.fillStyle=glass;
  ix.beginPath(); ix.arc(-1,-58,10.5,0,Math.PI*2); ix.fill();
  ix.fillStyle="rgba(255,255,255,.78)";
  ix.beginPath(); ix.arc(-5,-63,3,0,Math.PI*2); ix.fill();

  // logo on body
  ix.strokeStyle="#c08bff";
  ix.lineWidth=2;
  ix.beginPath(); ix.arc(0,-1,7,0,Math.PI*2); ix.stroke();
  ix.fillStyle="#0b0812";
  ix.beginPath(); ix.arc(2,-1,5.2,0,Math.PI*2); ix.fill();

  // engine bell
  const eng=ix.createLinearGradient(-16,0,16,0);
  eng.addColorStop(0,"#515a71"); eng.addColorStop(.5,"#8d97af"); eng.addColorStop(1,"#444c62");
  ix.fillStyle=eng;
  ix.beginPath();
  ix.moveTo(-12,22); ix.lineTo(-18,46); ix.quadraticCurveTo(0,58,18,46); ix.lineTo(12,22); ix.closePath();
  ix.fill();
  ix.fillStyle="#242938";
  ix.beginPath(); ix.moveTo(-8,22); ix.lineTo(-12,38); ix.quadraticCurveTo(0,46,12,38); ix.lineTo(8,22); ix.closePath(); ix.fill();

  ix.restore();
}
function spawnExplosion(x,y){particles=Array.from({length:240},()=>{const a=Math.random()*Math.PI*2,s=2+Math.random()*9;return{x,y,a,s,r:1+Math.random()*4,c:Math.random()>.55?"#65e8ff":Math.random()>.35?"#9c62ff":"#fff"}})}
function drawIntro(now){
  ix.clearRect(0,0,innerWidth,innerHeight);
  let t=state==="run"?(now-startTime)/1000:-1;
  let followShift=0;
  const baseGy=innerHeight*.86;

  // calculate rocket world position first so the camera can follow it
  let p=0, rocketWorldX=innerWidth/2, rocketWorldY=baseGy-38, rot=0;
  if(state==="run"){
    p=clamp((t-.25)/4.45,0,1);
    const maxAmp=Math.min(innerWidth*.36,470);
    const env=Math.sin(Math.PI*p);
    rocketWorldX=innerWidth/2
      + Math.sin(p*Math.PI*5.8)*maxAmp*env
      + Math.sin(p*Math.PI*12.1)*Math.min(94,innerWidth*.085)*p
      + Math.sin(p*Math.PI*2.6+.4)*Math.min(34,innerWidth*.04)*p;
    rocketWorldY=baseGy-38-ease(p)*(innerHeight*.80);
    if(p>.08) followShift=Math.max(0, innerHeight*.58 - rocketWorldY);
    const dx=(Math.cos(p*Math.PI*5.8)*Math.PI*5.8*maxAmp*env + Math.sin(p*Math.PI*5.8)*maxAmp*Math.PI*Math.cos(Math.PI*p))*0.00075;
    rot=clamp(dx,-.72,.72);
  }

  // sky
  const sky=ix.createLinearGradient(0,0,0,innerHeight);
  sky.addColorStop(0,"#02030a"); sky.addColorStop(.5,"#09051a"); sky.addColorStop(1,"#130419");
  ix.fillStyle=sky; ix.fillRect(0,0,innerWidth,innerHeight);

  // stars with slight camera parallax
  for(let i=0;i<230;i++){
    const sx=(i*97.31)%innerWidth;
    const sy=((i*53.17)%Math.max(1,innerHeight*1.5)) - followShift*.14;
    if(sy<-4 || sy>innerHeight+4) continue;
    const a=.2+.6*Math.abs(Math.sin(now*.001+i));
    ix.fillStyle=`rgba(225,230,255,${a})`;
    const r=(i%9===0?1.6:.8);
    ix.fillRect(sx,sy,r,r);
  }

  const gy=baseGy + followShift;
  // glow clouds / atmosphere
  const haze=ix.createLinearGradient(0,gy-210,0,gy+10);
  haze.addColorStop(0,"rgba(0,0,0,0)");
  haze.addColorStop(.45,"rgba(84,37,129,.06)");
  haze.addColorStop(1,"rgba(121,58,200,.24)");
  ix.fillStyle=haze; ix.fillRect(0,gy-220,innerWidth,240);

  // launch smoke layers
  if((state==="run" && p<.34) || state==="idle"){
    ix.fillStyle="rgba(205,220,255,.05)";
    for(let i=0;i<6;i++){
      const cx=innerWidth/2 + Math.sin(now*.0016+i)*80;
      const cy=gy-8 + i*6;
      ix.beginPath();
      ix.ellipse(cx-90+i*10,cy,80,26,0,0,Math.PI*2);
      ix.ellipse(cx+30-i*4,cy+8,92,28,0,0,Math.PI*2);
      ix.fill();
    }
  }

  ix.fillStyle="#030306";
  ix.fillRect(0,gy,innerWidth,innerHeight-gy+120);
  // launch platform and tower
  ix.fillStyle="#11101a"; ix.fillRect(innerWidth/2-86,gy-10,172,10);
  ix.fillRect(innerWidth/2-18,gy-118,36,108);
  ix.fillStyle="#1c1826"; ix.fillRect(innerWidth/2-30,gy-132,60,14);
  ix.fillStyle="#2b233b";
  for(let i=0;i<5;i++) ix.fillRect(innerWidth/2-14,gy-108+i*22,28,3);

  if(state==="idle"){
    rocket(innerWidth/2,gy-38,0,.92,.16);
  }else if(state==="run"){
    const x=rocketWorldX, y=rocketWorldY + followShift;
    if(t<4.76) rocket(x,y,rot,.92,.82+.22*p);

    const ex=x, ey=y-118;
    if(t>=4.76){
      if(!exploded){
        exploded=true;
        spawnExplosion(ex,ey);
        boomSound();
        intro.classList.add("shock");
        setTimeout(()=>intro.classList.remove("shock"),650);
      }
      const bp=clamp((t-4.76)/1.45,0,1);
      const g=ix.createRadialGradient(ex,ey,0,ex,ey,230+bp*410);
      g.addColorStop(0,`rgba(255,255,255,${1-bp*.8})`);
      g.addColorStop(.12,`rgba(93,235,255,${.94-bp*.7})`);
      g.addColorStop(.34,`rgba(156,78,255,${.78-bp*.58})`);
      g.addColorStop(.68,`rgba(255,134,55,${.24-bp*.18})`);
      g.addColorStop(1,"rgba(0,0,0,0)");
      ix.fillStyle=g; ix.beginPath(); ix.arc(ex,ey,250+bp*430,0,Math.PI*2); ix.fill();
      ix.strokeStyle=`rgba(210,240,255,${.82*(1-bp)})`; ix.lineWidth=4;
      ix.beginPath(); ix.arc(ex,ey,32+bp*510,0,Math.PI*2); ix.stroke();
      for(const q of particles){
        const r=(45+bp*320)*q.s*.16;
        ix.globalAlpha=Math.max(0,1-bp);
        ix.fillStyle=q.c;
        ix.beginPath();
        ix.arc(q.x+Math.cos(q.a)*r,q.y+Math.sin(q.a)*r,Math.max(.6,q.r*(1-bp*.75)),0,Math.PI*2);
        ix.fill();
      }
      ix.globalAlpha=1;
    }

    const ep=clamp((t-5.65)/3.0,0,1);
    if(ep>0){
      const cx=innerWidth/2, cy=innerHeight/2-20, R=95;
      ix.save(); ix.globalAlpha=ep;
      const halo=ix.createRadialGradient(cx,cy,0,cx,cy,320);
      halo.addColorStop(0,"rgba(255,255,255,.98)");
      halo.addColorStop(.06,"rgba(103,235,255,.95)");
      halo.addColorStop(.18,"rgba(157,79,255,.86)");
      halo.addColorStop(.48,"rgba(84,25,190,.25)");
      halo.addColorStop(1,"rgba(0,0,0,0)");
      ix.fillStyle=halo; ix.beginPath(); ix.arc(cx,cy,320,0,Math.PI*2); ix.fill();
      ix.fillStyle="#f5ffff"; ix.beginPath(); ix.arc(cx,cy,R,0,Math.PI*2); ix.fill();
      const sweep=clamp((ep-.05)/.75,0,1), mx=cx-210+smooth(sweep)*225;
      ix.fillStyle="#000"; ix.shadowColor="#000"; ix.shadowBlur=30;
      ix.beginPath(); ix.arc(mx,cy,R*.97,0,Math.PI*2); ix.fill(); ix.shadowBlur=0;
      for(let i=0;i<4;i++){
        ix.strokeStyle=`rgba(173,130,255,${.17+i*.04})`; ix.lineWidth=1.2;
        ix.beginPath(); ix.ellipse(cx,cy,150+i*30,52+i*17,t*.35+i*.65,0,Math.PI*2); ix.stroke();
      }
      if(sweep>.7){
        const fx=cx+R*.76, fy=cy-R*.63, fl=ix.createRadialGradient(fx,fy,0,fx,fy,95);
        fl.addColorStop(0,"rgba(255,255,255,.95)"); fl.addColorStop(.16,"rgba(101,239,255,.8)"); fl.addColorStop(.5,"rgba(159,85,255,.26)"); fl.addColorStop(1,"rgba(0,0,0,0)");
        ix.fillStyle=fl; ix.beginPath(); ix.arc(fx,fy,95,0,Math.PI*2); ix.fill();
      }
      ix.restore();
    }

    const tp=clamp((t-7.7)/1.4,0,1);
    if(tp>0){
      ix.save(); ix.globalAlpha=tp; ix.textAlign="center";
      ix.fillStyle="rgba(205,190,255,.9)"; ix.font="800 13px Segoe UI"; ix.fillText("BIENVENUE DANS L’ÉCLIPSE",innerWidth/2,innerHeight*.66);
      const gr=ix.createLinearGradient(innerWidth/2-230,0,innerWidth/2+230,0);
      gr.addColorStop(0,"#fff"); gr.addColorStop(.55,"#bd83ff"); gr.addColorStop(1,"#5de8ff");
      ix.fillStyle=gr; ix.font=`900 ${Math.min(108,innerWidth*.095)}px Segoe UI`; ix.fillText("ECLIPSESMP",innerWidth/2,innerHeight*.76);
      ix.fillStyle="#fff"; ix.font="800 25px Segoe UI"; ix.fillText("V2",innerWidth/2,innerHeight*.82);
      ix.restore();
    }
    if(t>10.7) endIntro();
  }
  requestAnimationFrame(drawIntro)
}requestAnimationFrame(drawIntro);
function endIntro(){state="done";intro.classList.add("done")}
startBtn.onclick=async()=>{try{await $("#ambient").play()}catch(e){}$("#musicToggle").checked=!$("#ambient").paused;$("#introCopy").style.pointerEvents="none";intro.classList.add("running");state="run";exploded=false;particles=[];startTime=performance.now();rocketSound()};
skip.onclick=endIntro;

// audio/settings
const audio=$("#ambient"),sound=$("#soundBtn"),toggle=$("#musicToggle"),vol=$("#volume"),vlabel=$("#volumeLabel");audio.volume=.35;
async function setMusic(on){if(on){try{await audio.play()}catch(e){toast("Clique encore une fois pour autoriser le son")}}else audio.pause();toggle.checked=!audio.paused;sound.textContent=audio.paused?"♪":"♫"}
sound.onclick=()=>setMusic(audio.paused);toggle.onchange=e=>setMusic(e.target.checked);vol.oninput=e=>{audio.volume=e.target.value/100;vlabel.textContent=e.target.value+"%";localStorage.setItem("eclipseVol",e.target.value)};const sv=localStorage.getItem("eclipseVol");if(sv){vol.value=sv;audio.volume=sv/100;vlabel.textContent=sv+"%"}

// reveals
const obs=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add("visible")),{threshold:.12});$$(".reveal").forEach(e=>obs.observe(e));

// copy ip
$("#copyIp").onclick=async()=>{try{await navigator.clipboard.writeText("play.eclipsesmp.fr")}catch(e){}toast("IP copiée : play.eclipsesmp.fr")};

// crates
const data={
 classic:[
 {i:"🔹",n:"Clé Rare",p:"0,76 €",d:"Argent, gemmes, minerais, équipement et spawner basique.",r:["5 000–15 000 $","100–300 Gemmes","Fer / Or / Diamant","16–32 Obsidienne","Épée diamant enchantée","Pioche diamant Efficacité IV / Solidité III","8 Pommes dorées","Spawner Poulet / Mouton / Zombie"]},
 {i:"🟣",n:"Clé Épique",p:"1,10 €",d:"Récompenses améliorées, Netherite et spawners moyens.",r:["20 000–50 000 $","400–800 Gemmes","16–32 Diamants","8–16 Débris antiques","Épée Netherite Tranchant V","Pioche Netherite Efficacité V / Fortune III","16 Pommes dorées","1 Totem","Spawner Squelette / Araignée / Vache / Zombie Piglin"]},
 {i:"🟡",n:"Clé Légendaire",p:"1,56 €",d:"Très gros lots et spawners rares.",r:["75 000–150 000 $","1 000–2 000 Gemmes","32–64 Diamants","16–32 Débris antiques","Épée Netherite très enchantée","Pioche Netherite Fortune IV","Armure Netherite Protection IV","2–4 Totems","16 Pommes dorées enchantées","Spawner Blaze / Creeper / Golem de fer","Petite chance : Clé Améthyste"]}
 ],
 premium:[
 {i:"💜",n:"Clé Améthyste",p:"1,99 €",d:"Outils custom Améthyste.",r:["Pioche 3×3","Pelle 3×3","Hache TreeCapitator","Houe 5×5","Capture Ball","Bonus argent / gemmes"]},
 {i:"🌑",n:"Clé Eclipse",p:"2,25 €",d:"Stuff et outils Eclipse.",r:["Armure Eclipse","Pioche 5×5","Pelle 5×5","Hache 50 blocs","Houe 5×5","Capture Ball","Épée Eclipse"]},
 {i:"💠",n:"Clé Nova",p:"2,99 €",d:"Le meilleur contenu premium.",r:["Armure Nova Protection VI","Bottes Chute amortie VII","Pioche 6×6","Pelle 6×6","Hache Nova","Houe 6×6","Capture Ball","Épée Nova"]}
 ],
 spawn:{i:"🏛️",n:"Clé de Spawn",p:"1,99 €",d:"Une clé spéciale disponible depuis le spawn.",r:["Récompenses exclusives du spawn","Argent et gemmes","Objets rares","Équipement enchanté","Chance de gagner une autre clé"]},
 spawner:{i:"🧬",n:"Clé Spawner",p:"Spawner",d:"Spawners avec probabilités visibles.",c:[["Mouton",18],["Poulet",16],["Vache",14],["Zombie",12],["Araignée",10],["Squelette",10],["Zombie Piglin",8],["Blaze",6],["Creeper",4],["Golem de fer",2]]}
};
const grid=$("#crateGrid"),modal=$("#crateModal");function card(c,k){return `<article class="crate-card"><div class="ci">${c.i}</div><h4>${c.n}</h4><div class="price">${c.p}</div><p>${c.d}</p><button data-key="${k}">🔎 Voir le contenu</button></article>`}
function render(t){grid.innerHTML=t==="spawn"?card(data.spawn,"spawn"):t==="spawner"?card(data.spawner,"spawner"):data[t].map((c,i)=>card(c,`${t}:${i}`)).join("");grid.querySelectorAll("button").forEach(b=>b.onclick=()=>openCrate(b.dataset.key))}
function openCrate(k){let c;if(k.includes(":")){const[a,b]=k.split(":");c=data[a][+b]}else c=data[k];$("#crateIcon").textContent=c.i;$("#crateTitle").textContent=c.n;$("#cratePrice").textContent=c.p;$("#crateBody").innerHTML=c.c?c.c.map(([n,p])=>`<div class="chance"><span>${n}</span><div class="bar"><i style="width:${p/18*100}%"></i></div><b>${p}%</b></div>`).join(""):c.r.map(x=>`<div class="reward">✦ ${x}</div>`).join("");modal.classList.add("open")}
render("classic");$$(".tab").forEach(b=>b.onclick=()=>{$$(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.tab)});$$('[data-close="crate"]').forEach(b=>b.onclick=()=>modal.classList.remove("open"));

// account/settings
const acc=$("#accountModal"),settings=$("#settings"),shade=$("#settingsShade");$("#accountBtn").onclick=()=>acc.classList.add("open");$$('[data-close="account"]').forEach(b=>b.onclick=()=>acc.classList.remove("open"));
$("#settingsBtn").onclick=()=>{settings.classList.add("open");shade.classList.add("open");$("#clientId").value=localStorage.getItem("eclipseMsClientId")||""};function closeSet(){settings.classList.remove("open");shade.classList.remove("open")}$("#closeSettings").onclick=closeSet;shade.onclick=closeSet;
$("#saveClient").onclick=()=>{const v=$("#clientId").value.trim();if(!v){toast("Entre ton Client ID Microsoft");return}localStorage.setItem("eclipseMsClientId",v);toast("Client ID enregistré")};
$("#msLogin").onclick=()=>{$("#msStatus").textContent="La connexion réelle sera active dès que ton Client ID Microsoft sera configuré dans ⚙ Paramètres."};
$("#replay").onclick=()=>{closeSet();intro.classList.remove("done");intro.classList.remove("running");state="idle";exploded=false;$("#introCopy").style.pointerEvents="";};
