const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(window.__tt);window.__tt=setTimeout(()=>t.classList.remove("show"),2200)};
// API Render: remplace seulement cette URL plus tard par ton vrai lien Render.
const API_BASE="https://TON-API.onrender.com/api";
const TOKEN_KEY="eclipse_token";

// background
const space=$("#space"),ctx=space.getContext("2d");let stars=[];
function resizeSpace(){const d=Math.min(devicePixelRatio,2);space.width=innerWidth*d;space.height=innerHeight*d;space.style.width=innerWidth+"px";space.style.height=innerHeight+"px";ctx.setTransform(d,0,0,d,0,0);stars=Array.from({length:Math.min(450,Math.floor(innerWidth*.34))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:.25+Math.random()*1.4,a:.25+Math.random()*.65,p:Math.random()*6.28}))}resizeSpace();addEventListener("resize",resizeSpace);
function bg(t){ctx.clearRect(0,0,innerWidth,innerHeight);for(const s of stars){ctx.fillStyle=`rgba(225,230,255,${s.a*(.55+.45*Math.sin(t*.001+s.p))})`;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}requestAnimationFrame(bg)}requestAnimationFrame(bg);

// intro audio sfx
let sfxCtx;
function ac(){if(!sfxCtx)sfxCtx=new (window.AudioContext||window.webkitAudioContext)();if(sfxCtx.state==="suspended")sfxCtx.resume();return sfxCtx}
function rocketSound(){try{const c=ac(),n=c.currentTime,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type="sawtooth";o.frequency.setValueAtTime(34,n);o.frequency.exponentialRampToValueAtTime(120,n+4.2);f.type="lowpass";f.frequency.setValueAtTime(150,n);f.frequency.exponentialRampToValueAtTime(900,n+4.2);g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(.15,n+.2);g.gain.exponentialRampToValueAtTime(.025,n+4.2);o.connect(f).connect(g).connect(c.destination);o.start(n);o.stop(n+4.3)}catch(e){}}
function boomSound(){try{const c=ac(),n=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(150,n);o.frequency.exponentialRampToValueAtTime(22,n+1.15);g.gain.setValueAtTime(.38,n);g.gain.exponentialRampToValueAtTime(.0001,n+1.3);o.connect(g).connect(c.destination);o.start(n);o.stop(n+1.32);const len=Math.floor(c.sampleRate*1.4),b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.3);const src=c.createBufferSource(),ng=c.createGain(),lp=c.createBiquadFilter();src.buffer=b;lp.type="lowpass";lp.frequency.value=1000;ng.gain.value=.25;src.connect(lp).connect(ng).connect(c.destination);src.start(n)}catch(e){}}

// cinematic intro (same site intro)
const intro=$("#intro"),can=$("#introCanvas"),ix=can.getContext("2d"),startBtn=$("#startIntro"),skip=$("#skipIntro");
let state="idle",startTime=0,exploded=false,particles=[];
function resizeIntro(){const d=Math.min(devicePixelRatio,2);can.width=innerWidth*d;can.height=innerHeight*d;can.style.width=innerWidth+"px";can.style.height=innerHeight+"px";ix.setTransform(d,0,0,d,0,0)}resizeIntro();addEventListener("resize",resizeIntro);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=t=>1-Math.pow(1-t,3),smooth=t=>t*t*(3-2*t);
function rocket(x,y,rot,scale,thrust){
  ix.save();ix.translate(x,y);ix.rotate(rot);ix.scale(scale,scale);
  if(thrust){const flame=ix.createLinearGradient(0,30,0,185);flame.addColorStop(0,"rgba(255,255,255,.98)");flame.addColorStop(.10,"rgba(120,242,255,.98)");flame.addColorStop(.34,"rgba(156,92,255,.92)");flame.addColorStop(.66,"rgba(255,129,54,.86)");flame.addColorStop(1,"rgba(255,90,20,0)");ix.fillStyle=flame;ix.beginPath();ix.moveTo(-15,28);ix.bezierCurveTo(-38,70,-28,130,0,185);ix.bezierCurveTo(28,130,38,70,15,28);ix.closePath();ix.fill()}
  const finGrad=ix.createLinearGradient(-52,0,52,0);finGrad.addColorStop(0,"#4721b6");finGrad.addColorStop(.5,"#865bff");finGrad.addColorStop(1,"#4b2ac1");ix.fillStyle=finGrad;
  ix.beginPath();ix.moveTo(-18,8);ix.lineTo(-54,42);ix.lineTo(-22,-40);ix.closePath();ix.fill();ix.beginPath();ix.moveTo(18,8);ix.lineTo(54,42);ix.lineTo(22,-40);ix.closePath();ix.fill();
  ix.fillStyle="#2f1a7d";ix.beginPath();ix.moveTo(-15,20);ix.lineTo(-34,56);ix.lineTo(-8,34);ix.closePath();ix.fill();ix.beginPath();ix.moveTo(15,20);ix.lineTo(34,56);ix.lineTo(8,34);ix.closePath();ix.fill();
  const body=ix.createLinearGradient(-24,0,24,0);body.addColorStop(0,"#737d98");body.addColorStop(.18,"#eef2ff");body.addColorStop(.48,"#ffffff");body.addColorStop(.78,"#c7d0e3");body.addColorStop(1,"#5d6883");ix.fillStyle=body;ix.beginPath();ix.moveTo(-22,26);ix.lineTo(-22,-76);ix.quadraticCurveTo(-20,-98,0,-132);ix.quadraticCurveTo(20,-98,22,-76);ix.lineTo(22,26);ix.quadraticCurveTo(18,35,0,38);ix.quadraticCurveTo(-18,35,-22,26);ix.closePath();ix.fill();
  const nose=ix.createLinearGradient(-18,-138,18,-78);nose.addColorStop(0,"#8a95b2");nose.addColorStop(.38,"#ffffff");nose.addColorStop(1,"#7b86a2");ix.fillStyle=nose;ix.beginPath();ix.moveTo(0,-146);ix.bezierCurveTo(12,-126,20,-102,20,-82);ix.lineTo(-20,-82);ix.bezierCurveTo(-20,-102,-12,-126,0,-146);ix.closePath();ix.fill();
  ix.fillStyle="#171b28";ix.fillRect(-22,-8,44,16);ix.fillStyle="#8d5cff";ix.fillRect(-22,-38,44,11);ix.fillStyle="#0e1119";ix.fillRect(-4,-8,8,16);
  ix.fillStyle="#111724";ix.beginPath();ix.arc(0,-56,15,0,Math.PI*2);ix.fill();ix.strokeStyle="#8e9abc";ix.lineWidth=3;ix.stroke();
  const glass=ix.createRadialGradient(-4,-60,1,-2,-58,13);glass.addColorStop(0,"rgba(255,255,255,.95)");glass.addColorStop(.32,"rgba(119,238,255,.96)");glass.addColorStop(1,"rgba(24,80,126,.95)");ix.fillStyle=glass;ix.beginPath();ix.arc(-1,-58,10.5,0,Math.PI*2);ix.fill();
  ix.strokeStyle="#c08bff";ix.lineWidth=2;ix.beginPath();ix.arc(0,-1,7,0,Math.PI*2);ix.stroke();ix.fillStyle="#0b0812";ix.beginPath();ix.arc(2,-1,5.2,0,Math.PI*2);ix.fill();
  const eng=ix.createLinearGradient(-16,0,16,0);eng.addColorStop(0,"#515a71");eng.addColorStop(.5,"#8d97af");eng.addColorStop(1,"#444c62");ix.fillStyle=eng;ix.beginPath();ix.moveTo(-12,22);ix.lineTo(-18,46);ix.quadraticCurveTo(0,58,18,46);ix.lineTo(12,22);ix.closePath();ix.fill();ix.restore();
}
function spawnExplosion(x,y){particles=Array.from({length:240},()=>{const a=Math.random()*Math.PI*2,s=2+Math.random()*9;return{x,y,a,s,r:1+Math.random()*4,c:Math.random()>.55?"#65e8ff":Math.random()>.35?"#9c62ff":"#fff"}})}
function drawIntro(now){
 ix.clearRect(0,0,innerWidth,innerHeight);let t=state==="run"?(now-startTime)/1000:-1,followShift=0;const baseGy=innerHeight*.86;let p=0,rocketWorldX=innerWidth/2,rocketWorldY=baseGy-38,rot=0;
 if(state==="run"){p=clamp((t-.25)/4.45,0,1);const maxAmp=Math.min(innerWidth*.36,470),env=Math.sin(Math.PI*p);rocketWorldX=innerWidth/2+Math.sin(p*Math.PI*5.8)*maxAmp*env+Math.sin(p*Math.PI*12.1)*Math.min(94,innerWidth*.085)*p+Math.sin(p*Math.PI*2.6+.4)*Math.min(34,innerWidth*.04)*p;rocketWorldY=baseGy-38-ease(p)*(innerHeight*.80);if(p>.08)followShift=Math.max(0,innerHeight*.58-rocketWorldY);rot=clamp(Math.cos(p*Math.PI*5.8)*.65,-.72,.72)}
 const sky=ix.createLinearGradient(0,0,0,innerHeight);sky.addColorStop(0,"#02030a");sky.addColorStop(.5,"#09051a");sky.addColorStop(1,"#130419");ix.fillStyle=sky;ix.fillRect(0,0,innerWidth,innerHeight);
 for(let i=0;i<230;i++){const sx=(i*97.31)%innerWidth,sy=((i*53.17)%Math.max(1,innerHeight*1.5))-followShift*.14;if(sy<-4||sy>innerHeight+4)continue;ix.fillStyle=`rgba(225,230,255,${.2+.6*Math.abs(Math.sin(now*.001+i))})`;ix.fillRect(sx,sy,i%9===0?1.6:.8,i%9===0?1.6:.8)}
 const gy=baseGy+followShift;ix.fillStyle="#030306";ix.fillRect(0,gy,innerWidth,innerHeight-gy+120);ix.fillStyle="#11101a";ix.fillRect(innerWidth/2-86,gy-10,172,10);ix.fillRect(innerWidth/2-18,gy-118,36,108);
 if(state==="idle")rocket(innerWidth/2,gy-38,0,.92,.16);
 else if(state==="run"){const x=rocketWorldX,y=rocketWorldY+followShift;if(t<4.76)rocket(x,y,rot,.92,.82+.22*p);const ex=x,ey=y-118;if(t>=4.76){if(!exploded){exploded=true;spawnExplosion(ex,ey);boomSound();intro.classList.add("shock");setTimeout(()=>intro.classList.remove("shock"),650)}const bp=clamp((t-4.76)/1.45,0,1);const g=ix.createRadialGradient(ex,ey,0,ex,ey,230+bp*410);g.addColorStop(0,`rgba(255,255,255,${1-bp*.8})`);g.addColorStop(.34,`rgba(156,78,255,${.78-bp*.58})`);g.addColorStop(1,"rgba(0,0,0,0)");ix.fillStyle=g;ix.beginPath();ix.arc(ex,ey,250+bp*430,0,Math.PI*2);ix.fill()}
 const ep=clamp((t-5.65)/3,0,1);if(ep>0){const cx=innerWidth/2,cy=innerHeight/2-20,R=95;ix.save();ix.globalAlpha=ep;const halo=ix.createRadialGradient(cx,cy,0,cx,cy,320);halo.addColorStop(0,"rgba(255,255,255,.98)");halo.addColorStop(.18,"rgba(157,79,255,.86)");halo.addColorStop(1,"rgba(0,0,0,0)");ix.fillStyle=halo;ix.beginPath();ix.arc(cx,cy,320,0,Math.PI*2);ix.fill();ix.fillStyle="#f5ffff";ix.beginPath();ix.arc(cx,cy,R,0,Math.PI*2);ix.fill();const sweep=clamp((ep-.05)/.75,0,1),mx=cx-210+smooth(sweep)*225;ix.fillStyle="#000";ix.beginPath();ix.arc(mx,cy,R*.97,0,Math.PI*2);ix.fill();ix.restore()}
 const tp=clamp((t-7.7)/1.4,0,1);if(tp>0){ix.save();ix.globalAlpha=tp;ix.textAlign="center";ix.fillStyle="rgba(205,190,255,.9)";ix.font="800 13px Segoe UI";ix.fillText("BIENVENUE DANS L’ÉCLIPSE",innerWidth/2,innerHeight*.66);const gr=ix.createLinearGradient(innerWidth/2-230,0,innerWidth/2+230,0);gr.addColorStop(0,"#fff");gr.addColorStop(.55,"#bd83ff");gr.addColorStop(1,"#5de8ff");ix.fillStyle=gr;ix.font=`900 ${Math.min(108,innerWidth*.095)}px Segoe UI`;ix.fillText("ECLIPSESMP",innerWidth/2,innerHeight*.76);ix.fillStyle="#fff";ix.font="800 25px Segoe UI";ix.fillText("V2",innerWidth/2,innerHeight*.82);ix.restore()}if(t>10.7)endIntro()}
 requestAnimationFrame(drawIntro)
}requestAnimationFrame(drawIntro);
function endIntro(){state="done";intro.classList.add("done")}
startBtn.onclick=async()=>{try{await $("#ambient").play()}catch(e){}updateSoundUI();$("#introCopy").style.pointerEvents="none";intro.classList.add("running");state="run";exploded=false;particles=[];startTime=performance.now();rocketSound()};skip.onclick=endIntro;

// audio/settings — fixed
const audio=$("#ambient"),sound=$("#soundBtn"),toggle=$("#musicToggle"),vol=$("#volume"),vlabel=$("#volumeLabel");
audio.volume=.35;
audio.preload="auto";

function updateSoundUI(){
  const playing=!audio.paused && !audio.muted && audio.volume>0;
  sound.textContent=playing?"🔊":"🔇";
  sound.classList.toggle("sound-on",playing);
  toggle.checked=playing;
}
async function setMusic(on){
  try{
    if(on){
      audio.muted=false;
      await audio.play();
    }else{
      audio.pause();
    }
  }catch(e){
    toast("Le navigateur bloque le son : clique à nouveau sur 🔊");
  }
  updateSoundUI();
}
sound.onclick=()=>setMusic(audio.paused || audio.muted);
toggle.onchange=e=>setMusic(e.target.checked);
vol.oninput=e=>{
  audio.volume=e.target.value/100;
  vlabel.textContent=e.target.value+"%";
  localStorage.setItem("eclipseVol",e.target.value);
  if(audio.volume===0){audio.pause()}
  updateSoundUI();
};
audio.addEventListener("play",updateSoundUI);
audio.addEventListener("pause",updateSoundUI);
audio.addEventListener("volumechange",updateSoundUI);
const sv=localStorage.getItem("eclipseVol");
if(sv){vol.value=sv;audio.volume=sv/100;vlabel.textContent=sv+"%"}
updateSoundUI();

// FR / EN
const translations={
  fr:{
    nav_home:"Accueil",nav_server:"Serveur",nav_leaderboard:"Classement",nav_shop:"Boutique",nav_keys:"Clés",nav_rules:"Règles",
    hero_eyebrow:"🌑 JAVA + BEDROCK • SMP FR/EN",
    hero_title:'LE SMP QUI ENTRE<br><span>DANS UNE NOUVELLE DIMENSION.</span>',
    hero_desc:"Économie, PvP, bases, marché, clés, progression, événements et contenu custom dans une identité galactique entièrement repensée.",
    copy_ip:"COPIER L’IP",section_server:"LE SERVEUR",
    server_title:'Construit pour être <span>plus grand.</span>',
    section_live:"CLASSEMENT LIVE",leader_title:'Les meilleurs <span>joueurs.</span>',
    section_shop:"BOUTIQUE",shop_title:'Choisis ton <span>rang.</span>',
    section_keys:"CLÉS",keys_title:'Découvre ce qu’il y a <span>à l’intérieur.</span>',
    section_rules:"RÈGLES / RULES",rules_title:'Simple, clair, <span>équitable.</span>',
    money:"Argent",gems:"Gemmes",deaths:"Morts",time:"Temps",player:"Joueur",rank:"Grade",value:"Valeur",
    backend_wait:"En attente du backend Render.",login:"Connexion",register:"Créer un compte",login_btn:"SE CONNECTER",register_btn:"CRÉER MON COMPTE",logout:"SE DÉCONNECTER"
  },
  en:{
    nav_home:"Home",nav_server:"Server",nav_leaderboard:"Leaderboard",nav_shop:"Store",nav_keys:"Keys",nav_rules:"Rules",
    hero_eyebrow:"🌑 JAVA + BEDROCK • FR/EN SMP",
    hero_title:'THE SMP ENTERS<br><span>A NEW DIMENSION.</span>',
    hero_desc:"Economy, PvP, bases, market, keys, progression, events and custom content in a completely redesigned galactic identity.",
    copy_ip:"COPY IP",section_server:"THE SERVER",
    server_title:'Built to become <span>bigger.</span>',
    section_live:"LIVE LEADERBOARD",leader_title:'The best <span>players.</span>',
    section_shop:"STORE",shop_title:'Choose your <span>rank.</span>',
    section_keys:"KEYS",keys_title:'Discover what is <span>inside.</span>',
    section_rules:"RULES",rules_title:'Simple, clear, <span>fair.</span>',
    money:"Money",gems:"Gems",deaths:"Deaths",time:"Playtime",player:"Player",rank:"Rank",value:"Value",
    backend_wait:"Waiting for the Render backend.",login:"Login",register:"Create account",login_btn:"LOG IN",register_btn:"CREATE MY ACCOUNT",logout:"LOG OUT"
  }
};
let currentLang=localStorage.getItem("eclipseLang")||"fr";
function applyLanguage(lang){
  currentLang=lang;localStorage.setItem("eclipseLang",lang);
  $("#langBtn").textContent=lang.toUpperCase();
  document.documentElement.lang=lang;
  $$("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(translations[lang][k])el.textContent=translations[lang][k]});
  $$("[data-i18n-html]").forEach(el=>{const k=el.dataset.i18nHtml;if(translations[lang][k])el.innerHTML=translations[lang][k]});
}
$("#langBtn").onclick=()=>applyLanguage(currentLang==="fr"?"en":"fr");
applyLanguage(currentLang);

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
const grid=$("#crateGrid"),modal=$("#crateModal");
function card(c,k){return `<article class="crate-card"><div class="ci">${c.i}</div><h4>${c.n}</h4><div class="price">${c.p}</div><p>${c.d}</p><button data-key="${k}">🔎 Voir le contenu</button></article>`}
function render(t){grid.innerHTML=t==="spawn"?card(data.spawn,"spawn"):t==="spawner"?card(data.spawner,"spawner"):data[t].map((c,i)=>card(c,`${t}:${i}`)).join("");grid.querySelectorAll("button").forEach(b=>b.onclick=()=>openCrate(b.dataset.key))}
function openCrate(k){let c;if(k.includes(":")){const[a,b]=k.split(":");c=data[a][+b]}else c=data[k];$("#crateIcon").textContent=c.i;$("#crateTitle").textContent=c.n;$("#cratePrice").textContent=c.p;$("#crateBody").innerHTML=c.c?c.c.map(([n,p])=>`<div class="chance"><span>${n}</span><div class="bar"><i style="width:${p/18*100}%"></i></div><b>${p}%</b></div>`).join(""):c.r.map(x=>`<div class="reward">✦ ${x}</div>`).join("");modal.classList.add("open")}
render("classic");$$(".tab").forEach(b=>b.onclick=()=>{$$(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.tab)});$$('[data-close="crate"]').forEach(b=>b.onclick=()=>modal.classList.remove("open"));

// settings conserved
const settings=$("#settings"),shade=$("#settingsShade");
$("#settingsBtn").onclick=()=>{settings.classList.add("open");shade.classList.add("open")};
function closeSet(){settings.classList.remove("open");shade.classList.remove("open")}
$("#closeSettings").onclick=closeSet;shade.onclick=closeSet;
$("#replay").onclick=()=>{closeSet();intro.classList.remove("done");intro.classList.remove("running");state="idle";exploded=false;$("#introCopy").style.pointerEvents=""};

// ACCOUNT BACKEND
const acc=$("#accountModal");
$("#accountBtn").onclick=()=>{acc.classList.add("open");refreshAccount()};
$$('[data-close="account"]').forEach(b=>b.onclick=()=>acc.classList.remove("open"));
$$(".auth-tab").forEach(b=>b.onclick=()=>{$$(".auth-tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#loginForm").classList.toggle("hidden",b.dataset.auth!=="login");$("#registerForm").classList.toggle("hidden",b.dataset.auth!=="register")});

$("#registerForm").onsubmit=async e=>{
 e.preventDefault();const s=$("#registerStatus"),p=$("#registerPassword").value,p2=$("#registerPassword2").value;
 if(p!==p2){s.textContent="Les mots de passe ne correspondent pas.";return}
 try{
  const r=await fetch(`${API_BASE}/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:$("#registerEmail").value.trim(),minecraftUsername:$("#registerMinecraft").value.trim(),password:p})});
  const d=await r.json();if(!r.ok)throw new Error(d.error||"Erreur");
  s.textContent="Compte créé. Tu peux te connecter.";
 }catch(err){s.textContent=err.message==="Failed to fetch"?"Le backend Render n'est pas encore connecté.":err.message}
};

$("#loginForm").onsubmit=async e=>{
 e.preventDefault();const s=$("#loginStatus");
 try{
  const r=await fetch(`${API_BASE}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:$("#loginEmail").value.trim(),password:$("#loginPassword").value})});
  const d=await r.json();if(!r.ok)throw new Error(d.error||"Erreur");
  localStorage.setItem(TOKEN_KEY,d.token);s.textContent="Connexion réussie.";await refreshAccount();
 }catch(err){s.textContent=err.message==="Failed to fetch"?"Le backend Render n'est pas encore connecté.":err.message}
};

async function refreshAccount(){
 const token=localStorage.getItem(TOKEN_KEY),auth=$("#authArea"),profile=$("#profileArea");
 auth.classList.toggle("hidden",!!token);profile.classList.toggle("hidden",!token);
 if(!token)return;
 try{
  const r=await fetch(`${API_BASE}/me`,{headers:{Authorization:`Bearer ${token}`}});
  const d=await r.json();if(!r.ok)throw new Error();
  $("#profileName").textContent=d.minecraft_username||d.email;
  $("#profileRank").textContent=d.rank_name||"default";
  $("#profileMoney").textContent=d.money??0;$("#profileShards").textContent=d.shards??0;
  $("#profileKills").textContent=d.kills??0;$("#profileDeaths").textContent=d.deaths??0;
  $("#profilePlaytime").textContent=d.playtime||"0h";
 }catch{localStorage.removeItem(TOKEN_KEY);auth.classList.remove("hidden");profile.classList.add("hidden")}
}
$("#logoutBtn").onclick=()=>{localStorage.removeItem(TOKEN_KEY);refreshAccount()};

// SCORE TABLE
let currentScore="money";
const scoreDemo={
 money:[["ShadowEclipse","Nova","824.3M $"],["Solaris","Eclipse","391.8M $"],["VoidKing","VIP","202.4M $"]],
 shards:[["Solaris","Eclipse","18 420"],["ShadowEclipse","Nova","12 604"],["Nyx","default","8 210"]],
 kills:[["VoidKing","VIP","1 482"],["ShadowEclipse","Nova","1 116"],["Solaris","Eclipse","987"]],
 deaths:[["Astra","default","188"],["Nyx","default","161"],["VoidKing","VIP","143"]],
 playtime:[["ShadowEclipse","Nova","242h"],["Solaris","Eclipse","198h"],["VoidKing","VIP","176h"]]
};
function renderScore(rows,demo=false){
 $("#scoreRows").innerHTML=rows.map((x,i)=>`<div class="score-row"><span>${i+1}</span><span class="score-player">${x.minecraft_username||x[0]}</span><span><b class="score-grade">${x.rank_name||x[1]||"default"}</b></span><span class="score-value">${x.value??x[2]}</span></div>`).join("");
 $("#scoreStatus").textContent=demo?"Mode aperçu — branche Render pour afficher les vraies stats Minecraft.":"Données live EclipseSMP.";
}
async function loadScore(){
 try{
  const r=await fetch(`${API_BASE}/leaderboard?type=${currentScore}`,{signal:AbortSignal.timeout(2500)});
  if(!r.ok)throw new Error();const d=await r.json();if(!Array.isArray(d)||!d.length)throw new Error();renderScore(d,false);
 }catch{renderScore(scoreDemo[currentScore],true)}
}
$$(".score-tab").forEach(b=>b.onclick=()=>{$$(".score-tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentScore=b.dataset.score;loadScore()});
loadScore();
