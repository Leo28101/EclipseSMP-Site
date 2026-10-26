const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(window.__tt);window.__tt=setTimeout(()=>t.classList.remove("show"),2200)};
// API Render: remplace seulement cette URL plus tard par ton vrai lien Render.
const API_BASE="https://eclipsesmp-site.onrender.com/api"; // À remplacer par une URL de backend réelle. Aucun compte ni paiement actif sans backend.
const TOKEN_KEY="eclipse_token";
// La simple présence d'un jeton local n'autorise jamais un achat.
let shopIdentity=null;
function askShopLogin(){
  toast(currentLang==="en"?"Log in with your verified Minecraft account first.":"Connecte-toi à ton compte Minecraft vérifié pour accéder à la boutique.");
  toggleCart(false);
  document.querySelector('[data-auth="login"]')?.click();
  document.querySelector('#accountModal')?.classList.add('open');
  refreshAccount();
}
function canShop(){if(shopIdentity?.linked)return true;askShopLogin();return false;}


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
 const stage=$("#introStage");if(stage&&state==="run"){
   const secs=(now-startTime)/1000;
   stage.textContent=secs<2.4?"01 / ALLUMAGE":secs<4.7?"02 / TRAVERSÉE":secs<7.7?"03 / ÉCLIPSE":"04 / BIENVENUE";
 }
 ix.clearRect(0,0,innerWidth,innerHeight);let t=state==="run"?(now-startTime)/1000:-1,followShift=0;const baseGy=innerHeight*.95;let p=0,rocketWorldX=innerWidth/2,rocketWorldY=baseGy-38,rot=0;
 if(state==="run"){p=clamp((t-.25)/4.45,0,1);const maxAmp=Math.min(innerWidth*.36,470),env=Math.sin(Math.PI*p);rocketWorldX=innerWidth/2+Math.sin(p*Math.PI*5.8)*maxAmp*env+Math.sin(p*Math.PI*12.1)*Math.min(94,innerWidth*.085)*p+Math.sin(p*Math.PI*2.6+.4)*Math.min(34,innerWidth*.04)*p;rocketWorldY=baseGy-38-ease(p)*(innerHeight*.80);if(p>.08)followShift=Math.max(0,innerHeight*.58-rocketWorldY);rot=clamp(Math.cos(p*Math.PI*5.8)*.65,-.72,.72)}
 const sky=ix.createLinearGradient(0,0,0,innerHeight);sky.addColorStop(0,"#02030a");sky.addColorStop(.5,"#09051a");sky.addColorStop(1,"#130419");ix.fillStyle=sky;ix.fillRect(0,0,innerWidth,innerHeight);
 for(let i=0;i<230;i++){const sx=(i*97.31)%innerWidth,sy=((i*53.17)%Math.max(1,innerHeight*1.5))-followShift*.14;if(sy<-4||sy>innerHeight+4)continue;ix.fillStyle=`rgba(225,230,255,${.2+.6*Math.abs(Math.sin(now*.001+i))})`;ix.fillRect(sx,sy,i%9===0?1.6:.8,i%9===0?1.6:.8)}
 // Portail monumental, anneaux lumineux et météores cinématiques.
 const cx=innerWidth/2, cy=innerHeight*.47;
 const reveal=state==="idle"?.42:clamp((t-4.45)/1.7,0,1);
 if(reveal>0){
   ix.save();ix.globalAlpha=reveal;
   const R=Math.min(innerWidth,innerHeight)*.19;
   const outer=ix.createRadialGradient(cx,cy,R*.67,cx,cy,R*2.45);
   outer.addColorStop(0,"rgba(100,55,255,.28)");outer.addColorStop(.5,"rgba(69,27,164,.19)");outer.addColorStop(1,"rgba(0,0,0,0)");
   ix.fillStyle=outer;ix.beginPath();ix.arc(cx,cy,R*2.45,0,Math.PI*2);ix.fill();
   for(let j=0;j<3;j++){
     ix.save();ix.translate(cx,cy);ix.rotate(now*.00009*(j%2?1:-1)+j*1.1);ix.scale(1,.78+j*.06);
     ix.strokeStyle=["rgba(123,80,255,.63)","rgba(74,219,255,.48)","rgba(211,147,255,.4)"][j];
     ix.lineWidth=j===0?3:1.3;ix.setLineDash(j===2?[7,16]:[]);
     ix.shadowBlur=22;ix.shadowColor=j===1?"#67dfff":"#995aff";
     ix.beginPath();ix.ellipse(0,0,R*(1.14+j*.22),R*(1.14+j*.22),0,0,Math.PI*2);ix.stroke();ix.restore();
   }
   for(let j=0;j<58;j++){
     const a=j*2.3999+now*.00015,rad=R*(1.4+(j%9)*.14);
     ix.fillStyle=j%3===0?"rgba(100,235,255,.7)":"rgba(195,132,255,.65)";
     ix.beginPath();ix.arc(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad*.79,1+(j%4)*.45,0,Math.PI*2);ix.fill();
   }
   ix.restore();
 }
 if(state==="run"&&t>1.4&&t<5.3){ix.save();ix.globalAlpha=.20;
   for(let j=0;j<38;j++){const x=(j*173.31+now*.11*(1+j%4))%innerWidth,y=(j*79.7+now*.31*(1+j%5))%innerHeight;
     ix.strokeStyle=j%2?"#b88bff":"#75e7ff";ix.lineWidth=1+(j%3);ix.beginPath();ix.moveTo(x,y);ix.lineTo(x-35-j%22,y+74+j%40);ix.stroke()}
   ix.restore()}
 const gy=baseGy+followShift;ix.fillStyle="#030306";ix.fillRect(0,gy,innerWidth,innerHeight-gy+120);ix.fillStyle="#11101a";ix.fillRect(innerWidth/2-86,gy-10,172,10);ix.fillRect(innerWidth/2-18,gy-118,36,108);
 if(state==="idle")rocket(innerWidth/2,baseGy-38,0,.46,.10);
 else if(state==="run"){const x=rocketWorldX,y=rocketWorldY+followShift;if(t<4.76)rocket(x,y,rot,.92,.82+.22*p);const ex=x,ey=y-118;if(t>=4.76){if(!exploded){exploded=true;spawnExplosion(ex,ey);boomSound();intro.classList.add("shock");setTimeout(()=>intro.classList.remove("shock"),650)}const bp=clamp((t-4.76)/1.45,0,1);const g=ix.createRadialGradient(ex,ey,0,ex,ey,230+bp*410);g.addColorStop(0,`rgba(255,255,255,${1-bp*.8})`);g.addColorStop(.34,`rgba(156,78,255,${.78-bp*.58})`);g.addColorStop(1,"rgba(0,0,0,0)");ix.fillStyle=g;ix.beginPath();ix.arc(ex,ey,250+bp*430,0,Math.PI*2);ix.fill()}
 const ep=clamp((t-5.65)/3,0,1);if(ep>0){const cx=innerWidth/2,cy=innerHeight/2-20,R=95;ix.save();ix.globalAlpha=ep;const halo=ix.createRadialGradient(cx,cy,0,cx,cy,320);halo.addColorStop(0,"rgba(255,255,255,.98)");halo.addColorStop(.18,"rgba(157,79,255,.86)");halo.addColorStop(1,"rgba(0,0,0,0)");ix.fillStyle=halo;ix.beginPath();ix.arc(cx,cy,320,0,Math.PI*2);ix.fill();ix.fillStyle="#f5ffff";ix.beginPath();ix.arc(cx,cy,R,0,Math.PI*2);ix.fill();const sweep=clamp((ep-.05)/.75,0,1),mx=cx-210+smooth(sweep)*225;ix.fillStyle="#000";ix.beginPath();ix.arc(mx,cy,R*.97,0,Math.PI*2);ix.fill();ix.restore()}
 const tp=clamp((t-7.7)/1.4,0,1);if(tp>0){ix.save();ix.globalAlpha=tp;ix.textAlign="center";ix.fillStyle="rgba(205,190,255,.9)";ix.font="800 13px Segoe UI";ix.fillText("BIENVENUE DANS L’ÉCLIPSE",innerWidth/2,innerHeight*.66);const gr=ix.createLinearGradient(innerWidth/2-230,0,innerWidth/2+230,0);gr.addColorStop(0,"#fff");gr.addColorStop(.55,"#bd83ff");gr.addColorStop(1,"#5de8ff");ix.fillStyle=gr;ix.font=`900 ${Math.min(108,innerWidth*.095)}px Segoe UI`;ix.fillText("ECLIPSESMP",innerWidth/2,innerHeight*.76);ix.fillStyle="#fff";ix.font="800 25px Segoe UI";ix.fillText("V2",innerWidth/2,innerHeight*.82);ix.restore()}if(t>10.7)endIntro()}
 requestAnimationFrame(drawIntro)
}requestAnimationFrame(drawIntro);
function endIntro(){state="done";intro.classList.add("done");document.body.classList.add("site-awake")}
startBtn.onclick=async()=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||localStorage.getItem("eclipse_reduced_motion")==="1"){endIntro();return;}try{await $("#ambient").play()}catch(e){}updateSoundUI();$("#introCopy").style.pointerEvents="none";intro.classList.add("running");state="run";exploded=false;particles=[];startTime=performance.now();rocketSound()};skip.onclick=endIntro;

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
  $$(`[data-shop-${lang}]`).forEach(el=>el.textContent=el.getAttribute(`data-shop-${lang}`));
  if(window.eclipseCartReady) { renderCrates();refreshCart(); }
  $$("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(translations[lang][k])el.textContent=translations[lang][k]});
  $$("[data-i18n-html]").forEach(el=>{const k=el.dataset.i18nHtml;if(translations[lang][k])el.innerHTML=translations[lang][k]});
}
$("#langBtn").onclick=()=>applyLanguage(currentLang==="fr"?"en":"fr");
applyLanguage(currentLang);

// reveals
const obs=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add("visible")),{threshold:.12});$$(".reveal").forEach(e=>obs.observe(e));
// copy ip
$("#copyIp").onclick=async()=>{try{await navigator.clipboard.writeText("eclipsesmp.eu")}catch(e){}toast("IP copiée : eclipsesmp.eu")};

// Boutique: les anciens types de clés ont été volontairement retirés.
const products = {
 vip:{name:"VIP · 30 jours",price:3.99,icon:"✦"},
 eclipse:{name:"Eclipse · 30 jours",price:7.99,icon:"◐"},
 nova:{name:"Nova · 30 jours",price:11.99,icon:"✧"},
 spawner:{name:"Clé Spawner",price:1.99,icon:"🧬",desc:"Spawners et récompenses de farm."},
 keyEclipse:{name:"Clé Eclipse",price:2.25,icon:"🌑",desc:"Récompenses Eclipse."},
 keyNova:{name:"Clé Nova",price:2.99,icon:"💠",desc:"Récompenses Nova."},
 premium:{name:"Battle Pass Premium",price:null,icon:"⚔",desc:"Accès Premium pour la saison en cours. Tarif en euros à confirmer."},
 unban:{name:"Unban",price:7.00,icon:"🔓",desc:"Demande de débanissement — soumise à validation du staff."},
 unmute:{name:"Unmute",price:2.00,icon:"🔊",desc:"Demande de retrait de mute — soumise à validation du staff."}
};
const money = n => n.toLocaleString(currentLang==="en"?"en-IE":"fr-FR",{style:"currency",currency:"EUR"});
const cartKey="eclipse_shop_cart_v1";
const singleGrades=["vip","eclipse","nova"];
const singlePurchase=[...singleGrades,"premium"];
let basket={};try{let stored=JSON.parse(localStorage.getItem(cartKey)||"{}");if(stored && typeof stored==="object")for(const [id,quantity] of Object.entries(stored)){if(products[id]&&Number.isInteger(quantity)&&quantity>0)basket[id]=singlePurchase.includes(id)?1:Math.min(quantity,99)}}catch{}
// Conserver uniquement un grade, meme si un ancien panier avait plusieurs grades.
let chosenGrade=singleGrades.find(id=>basket[id]);if(chosenGrade)for(const id of singleGrades)if(id!==chosenGrade)delete basket[id];
function persistCart(){try{localStorage.setItem(cartKey,JSON.stringify(basket))}catch{}}
function addCart(id){
 if(!products[id])return;
 if(!canShop())return;
 if(products[id].price===null){toast("Prix à confirmer : cet article n’est pas encore disponible.");return;}
 if(singleGrades.includes(id)){
  for(const grade of singleGrades)delete basket[grade];
  basket[id]=1;
 }else if(id==="premium"){
  if(basket.premium){toast(currentLang==="en"?"Premium already in cart":"Premium déjà dans le panier");return}
  basket.premium=1;
 }else basket[id]=Math.min(99,(basket[id]||0)+1);
 persistCart();refreshCart();toast(currentLang==="en"?"Added to cart":"Ajouté au panier");
}
// Le choix achat/cadeau reste local tant que le backend /link n'est pas connecté.
let orderPurpose="self";
let giftRecipient="";
function refreshPurpose(){
 const gift=orderPurpose==="gift";
 $("#cartBuySelf").classList.toggle("active",!gift);
 $("#cartGift").classList.toggle("active",gift);
 $("#cartBuySelf").setAttribute("aria-pressed",String(!gift));
 $("#cartGift").setAttribute("aria-pressed",String(gift));
 $("#cartGiftFields").hidden=!gift;
 $("#cartPurposeLabel").textContent=currentLang==="en"?"Who is this order for?":"À qui est destiné le panier ?";
 $("#cartBuySelf").textContent=currentLang==="en"?"🛍 Buy for myself":"🛍 Acheter pour moi";
 $("#cartGift").textContent=currentLang==="en"?"🎁 Send as gift":"🎁 Offrir";
 $("#cartGiftFields").querySelector("label").textContent=currentLang==="en"?"Recipient Minecraft username":"Pseudo Minecraft du destinataire";
 $("#cartGiftHelp").textContent=currentLang==="en"?"The recipient must be verified on the server before payment.":"Le compte du destinataire devra être vérifié sur le serveur avant tout paiement.";
 $("#cartPurposeNotice").textContent=gift?(currentLang==="en"?"Gift recipient is not verified yet — payment disabled.":"Destinataire non vérifié — paiement désactivé."):(currentLang==="en"?"Purchases will go to your verified Minecraft account after linking.":"Tes achats seront associés à ton compte Minecraft vérifié après connexion.");
}
$("#cartBuySelf").addEventListener("click",()=>{orderPurpose="self";refreshPurpose()});
$("#cartGift").addEventListener("click",()=>{orderPurpose="gift";refreshPurpose()});
$("#cartRecipient").addEventListener("input",e=>{giftRecipient=e.target.value.trim()});
const grid=$("#crateGrid"),modal=$("#crateModal"),cartModal=$("#cartModal");
function renderCrates(){grid.innerHTML=["spawner","keyEclipse","keyNova"].map(id=>{const p=products[id];return `<article class="crate-card"><div class="ci">${p.icon}</div><h4>${p.name}</h4><div class="price">${p.price===null?(currentLang==="en"?"Price TBD":"Prix à confirmer"):money(p.price)}</div><p>${p.desc}</p><button type="button" data-product="${id}" ${p.price===null?'disabled title="Prix en attente de validation"':""}>${p.price===null?(currentLang==="en"?"Coming soon":"À confirmer"):(currentLang==="en"?"Add to cart":"Ajouter au panier")}</button></article>`}).join("");grid.querySelectorAll("button[data-product]").forEach(b=>b.addEventListener("click",()=>addCart(b.dataset.product)))}
function refreshCart(){
 const entries=Object.entries(basket).filter(([id,q])=>products[id]&&q>0);
 const count=entries.reduce((n,[,q])=>n+q,0);const badge=$("#cartBadge");badge.textContent=count;badge.hidden=count===0;
 $("#cartLines").innerHTML=entries.length?entries.map(([id,q])=>{const p=products[id];return `<div class="cart-line"><div class="cart-line-icon">${p.icon}</div><div class="cart-line-main"><strong>${p.name}</strong><small>${p.price===null?"Prix à confirmer":money(p.price)+" / unité"}</small><div class="cart-quantity"><button type="button" data-cart-action="minus" data-id="${id}" aria-label="Retirer une unité">−</button><span>${q}</span>${singlePurchase.includes(id)?"":`<button type="button" data-cart-action="plus" data-id="${id}" aria-label="Ajouter une unité">+</button>`}</div></div><div class="cart-line-right"><strong>${p.price===null?"—":money(p.price*q)}</strong><button type="button" class="cart-delete" data-cart-action="delete" data-id="${id}" aria-label="Supprimer cet article">×</button></div></div>`}).join(""):`<div class="cart-empty"><span>✧</span><strong>${currentLang==="en"?"Your cart is empty":"Ton panier est vide"}</strong><p>${currentLang==="en"?"Add products from the shop":"Ajoute des produits depuis la boutique"}</p></div>`;
 $("#cartTotal").textContent=money(entries.reduce((t,[id,q])=>t+(products[id].price||0)*q,0));
 $("#cartCheckout").disabled=entries.length===0 || !shopIdentity?.linked;
 $("#cartCheckout").textContent=shopIdentity?.linked?"VÉRIFIER MA COMMANDE":"CONNEXION REQUISE";
 $("#cartUnpriced").textContent=entries.some(([id])=>products[id].price===null)?(currentLang==="en"?"Some prices need confirmation.":"Certains prix restent à confirmer."):"";
 $("#cartLines").querySelectorAll("[data-cart-action]").forEach(el=>el.addEventListener("click",()=>{const {id,cartAction}=el.dataset;if(!canShop())return;if(cartAction==="plus")basket[id]=singlePurchase.includes(id)?1:Math.min(99,(basket[id]||0)+1);if(cartAction==="minus")basket[id]=(basket[id]||0)-1;if(cartAction==="delete"||basket[id]<=0)delete basket[id];persistCart();refreshCart()}));
}
function toggleCart(force){if(force!==false && !shopIdentity?.linked){askShopLogin();return;}const next=typeof force==="boolean"?force:!cartModal.classList.contains("open");cartModal.classList.toggle("open",next);cartModal.setAttribute("aria-hidden",String(!next));$("#openCart").setAttribute("aria-expanded",String(next));if(next){refreshCart();refreshPurpose()}}
$("#openCart").onclick=()=>toggleCart();$("#closeCart").onclick=()=>toggleCart(false);
document.addEventListener("pointerdown",e=>{if(cartModal.classList.contains("open")&&!cartModal.contains(e.target)&&!$("#openCart").contains(e.target))toggleCart(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape")toggleCart(false)});
$$(".rank .add-cart").forEach(b=>b.onclick=()=>addCart(b.dataset.product));
$("#cartCheckout").onclick=()=>{
 if(!canShop())return;
 const entries=Object.entries(basket).filter(([id,q])=>q>0&&products[id]);
 if(!entries.length)return toast("Ton panier est vide.");
 if(entries.some(([id])=>products[id].price===null))return toast("Un prix doit être confirmé.");
 if(orderPurpose==="gift"&&!/^[.a-zA-Z0-9_ -]{3,32}$/.test(giftRecipient))return toast("Entre un pseudo Minecraft valide pour le cadeau.");
 const summary=entries.map(([id,n])=>`${products[id].name} × ${n}`).join(" · ");
 $("#orderReviewItems").textContent=summary;
 $("#orderReviewRecipient").textContent=orderPurpose==="gift"?`Cadeau pour ${giftRecipient}`:`Pour mon compte ${shopIdentity.minecraft_username}`;
 $("#orderReviewTotal").textContent=money(entries.reduce((t,[id,n])=>t+products[id].price*n,0));
 $("#orderReviewAccept").checked=false;
 $("#orderReviewContinue").disabled=true;
 $("#orderReviewModal").classList.add("open");
};
$("#orderReviewBack").onclick=()=>$("#orderReviewModal").classList.remove("open");
$("#orderReviewClose").onclick=()=>$("#orderReviewModal").classList.remove("open");
$("#orderReviewAccept").onchange=e=>{$("#orderReviewContinue").disabled=!e.target.checked};
$("#orderReviewContinue").onclick=()=>toast("Paiements non activés : aucune commande n’a été passée.");
$("#passInfo").onclick=()=>addCart("premium");
$$ ("[data-extra-product]").forEach(b=>b.onclick=()=>addCart(b.dataset.extraProduct));
window.eclipseCartReady=true;renderCrates();refreshCart();

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

// Inscription vérifiée d'abord en jeu. Aucun e-mail ou mot de passe n'est demandé avant /link.
let signupTicket=null;
let registrationPoller=null;
let pendingConfirmationEmail="";
function stopRegistrationPoll(){if(registrationPoller){clearInterval(registrationPoller);registrationPoller=null}}
function setRegistrationStep(n){
 ["registrationStart","registrationVerify","registrationFinish"].forEach((id,i)=>$("#"+id).classList.toggle("hidden",i!==n));
 ["regStepOne","regStepTwo","regStepThree"].forEach((id,i)=>$("#"+id).classList.toggle("step-current",i===n));
}
async function signupApi(path,body){
 const r=await fetch(`${API_BASE}${path}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 const d=await r.json();if(!r.ok)throw Error(d.error||"Service indisponible");return d;
}
$("#registrationGenerate").onclick=async()=>{
 const status=$("#registerStatus");status.textContent="";
 const name=$("#registerMinecraft").value.trim();
 if(!/^[.a-zA-Z0-9_ -]{3,32}$/.test(name)){status.textContent="Pseudo invalide : utilise ton pseudo exact en jeu.";return}
 try{
  const d=await signupApi('/signup/start',{minecraftUsername:name});signupTicket=d.ticket;
  $("#registrationCommand").textContent=d.command;setRegistrationStep(1);
  stopRegistrationPoll();registrationPoller=setInterval(()=>{if(signupTicket&&!document.getElementById("registrationVerify").classList.contains("hidden"))checkMinecraftVerified(true)},3000);
  status.textContent="Code généré. Exécute la commande depuis ton compte Minecraft.";
 }catch(e){status.textContent=e.message}
};
$("#registrationCopy").onclick=()=>{navigator.clipboard?.writeText($("#registrationCommand").textContent).then(()=>{$("#registerStatus").textContent="Commande copiée !"}).catch(()=>{$("#registerStatus").textContent="Sélectionne la commande pour la copier."})};
$("#registrationRestart").onclick=()=>{stopRegistrationPoll();signupTicket=null;setRegistrationStep(0);$("#registerStatus").textContent=""};
let checkingMinecraft=false;
async function checkMinecraftVerified(quiet=false){
 if(!signupTicket||checkingMinecraft)return;
 checkingMinecraft=true;const status=$("#registerStatus");
 try{
  const d=await signupApi('/signup/status',{ticket:signupTicket});
  if(!d.verified){if(!quiet)status.textContent="En attente de /link…";return}
  stopRegistrationPoll();
  $("#registrationVerifiedName").textContent=`✓ Minecraft vérifié : ${d.minecraftUsername}`;
  setRegistrationStep(2);status.textContent="Minecraft confirmé ! Termine la création de ton compte.";
 }catch(e){if(!quiet)status.textContent=e.message}
 finally{checkingMinecraft=false}
}
$("#registrationCheck").onclick=()=>checkMinecraftVerified(false);
addEventListener('focus',()=>{if(signupTicket&&!$("#registrationVerify").classList.contains('hidden'))checkMinecraftVerified(true)});
$("#registrationFinish").onsubmit=async e=>{
 e.preventDefault();const status=$("#registerStatus"),p=$("#registerPassword").value;
 if(p!==$("#registerPassword2").value){status.textContent="Les mots de passe ne correspondent pas.";return}
 try{
  const email=$("#registerEmail").value.trim();
  await signupApi('/auth/register',{ticket:signupTicket,email,password:p});
  stopRegistrationPoll();signupTicket=null;pendingConfirmationEmail=email;
  $("#registrationFinish").classList.add('hidden');
  $("#registrationEmailNotice").classList.remove('hidden');
  status.textContent="Inscription enregistrée. Consulte ton e-mail pour confirmer ton compte.";
  $("#registrationFinish").querySelectorAll('input').forEach(i=>i.value='');
 }catch(err){status.textContent=err.message}
};

$("#loginForm").onsubmit=async e=>{
 e.preventDefault();const s=$("#loginStatus");
 try{
  const r=await fetch(`${API_BASE}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:$("#loginEmail").value.trim(),password:$("#loginPassword").value})});
  const d=await r.json();if(!r.ok)throw new Error(d.error||"Erreur");
  localStorage.setItem(TOKEN_KEY,d.token);if(d.refresh_token)localStorage.setItem("eclipse_refresh_token",d.refresh_token);s.textContent="Connexion réussie.";await refreshAccount();
 }catch(err){s.textContent=err.message==="Failed to fetch"?"Le backend Render n'est pas encore connecté.":err.message}
};

// Les skins sont purement visuels ; seule la réponse authentifiée de /api/me
// décide du compte lié et de l'accès à la boutique.
function setAccountSkin(data){
 const navImg=document.getElementById('accountBtnSkin');
 const navFallback=document.getElementById('accountBtnFallback');
 const profileImg=document.getElementById('profileSkin');
 const profileFallback=document.getElementById('profileSkinFallback');
 const uuid=(data?.minecraft_uuid||'').replace(/-/g,'');
 const username=String(data?.minecraft_username||'');
 const identifier=/^[0-9a-f]{32}$/i.test(uuid)?uuid:(/^[.a-zA-Z0-9_]{3,32}$/.test(username)?username:null);
 if(!identifier){
  navImg.classList.add('hidden');navImg.removeAttribute('src');navFallback.classList.remove('hidden');
  profileImg.classList.add('hidden');profileImg.removeAttribute('src');profileFallback.classList.remove('hidden');
  return;
 }
 const url='https://mc-heads.net/avatar/'+encodeURIComponent(identifier)+'/128';
 navImg.onerror=()=>{navImg.classList.add('hidden');navFallback.classList.remove('hidden')};
 profileImg.onerror=()=>{profileImg.classList.add('hidden');profileFallback.classList.remove('hidden')};
 navImg.src=url;profileImg.src=url;
 navImg.classList.remove('hidden');profileImg.classList.remove('hidden');
 navFallback.classList.add('hidden');profileFallback.classList.add('hidden');
}
async function refreshAccount(){
 shopIdentity=null;
 const token=localStorage.getItem(TOKEN_KEY),auth=$("#authArea"),profile=$("#profileArea");
 auth.classList.toggle("hidden",!!token);profile.classList.toggle("hidden",!token);
 if(!token){setAccountSkin(null);refreshCart();return;}
 try{
  const r=await fetch(`${API_BASE}/me`,{headers:{Authorization:`Bearer ${token}`}});
  const d=await r.json();if(!r.ok)throw new Error();
  shopIdentity=d.linked?d:null;refreshCart();
  setAccountSkin(d.linked?d:null);
  $("#profileEmail").textContent=d.email||"—";
  $("#profileMinecraft").textContent=d.minecraft_username||"Non lié";
  $("#profileLinkedStatus").textContent=d.linked?"✓ Minecraft lié":"⚠ Compte Minecraft non lié";
  $("#profileName").textContent=d.minecraft_username||d.email;
  const adminBtn=document.getElementById('profileAdminBtn');
  if(adminBtn)adminBtn.classList.toggle('hidden',!d.isAdmin);
 }catch{shopIdentity=null;setAccountSkin(null);refreshCart();localStorage.removeItem(TOKEN_KEY);auth.classList.remove("hidden");profile.classList.add("hidden")}
}
$("#profileRefresh").onclick=()=>refreshAccount();
$("#logoutBtn").onclick=()=>{shopIdentity=null;basket={};persistCart();refreshCart();localStorage.removeItem(TOKEN_KEY);localStorage.removeItem("eclipse_refresh_token");refreshAccount()};

// SCORE TABLE
let currentScore="money";
const safeText=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
function renderScore(rows){
 const filtered=rows.filter(x=>!['rip282528','david7277219'].includes(String(x.minecraft_username||x.username||'').toLowerCase())).slice(0,10);
 $("#scoreRows").innerHTML=filtered.length?filtered.map((x,i)=>`<div class="score-row"><span class="place">${String(i+1).padStart(2,'0')}</span><span class="score-player">${safeText(x.minecraft_username||x.username||'Joueur')}</span><span><b class="score-grade">${safeText(x.rank_name||'—')}</b></span><span class="score-value">${safeText(x.value??'—')}</span></div>`).join(''):'<div class="score-unavailable">Aucun classement disponible pour le moment.</div>';
 $("#scoreStatus").textContent=filtered.length?"Classement synchronisé avec le serveur.":"Aucune statistique synchronisée pour le moment.";
}
async function loadScore(){
 $("#scoreRows").innerHTML='<div class="score-unavailable">Chargement des statistiques…</div>';
 if(API_BASE.includes('TON-API')){$("#scoreRows").innerHTML='<div class="score-unavailable">🌌 Connexion au serveur indisponible</div>';$("#scoreStatus").textContent='L’API de statistiques doit encore être connectée.';return}
 try{const r=await fetch(`${API_BASE}/leaderboard?type=${encodeURIComponent(currentScore)}`,{signal:AbortSignal.timeout(4500)});if(!r.ok)throw new Error();const data=await r.json();if(!Array.isArray(data))throw new Error();renderScore(data)}catch{$("#scoreRows").innerHTML='<div class="score-unavailable">🌌 Connexion au serveur indisponible</div>';$("#scoreStatus").textContent='Impossible de récupérer des données réelles.'}
}
$$(".score-tab").forEach(b=>b.onclick=()=>{$$(".score-tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentScore=b.dataset.score;loadScore()});
loadScore();
const reduced=$("#reduceMotion");
reduced.checked=localStorage.getItem('eclipse_reduced_motion')==='1';
function setReducedMotion(on){document.documentElement.classList.toggle('reduced-motion',on);localStorage.setItem('eclipse_reduced_motion',on?'1':'0')}
setReducedMotion(reduced.checked);reduced.addEventListener('change',()=>setReducedMotion(reduced.checked));
$("#forgotPassword").onclick=()=>{$("#loginForm").classList.add('hidden');$("#registerForm").classList.add('hidden');$("#resetHelp").classList.remove('hidden');};
$("#resetBack").onclick=()=>{$("#resetHelp").classList.add('hidden');$("#loginForm").classList.remove('hidden')};

// Après confirmation e-mail, Supabase redirige vers la page publique.
// La confirmation se fait côté Supabase, puis le joueur se connecte normalement.
const confirmParams=new URLSearchParams(location.hash.replace(/^#/,''));
const confirmQuery=new URLSearchParams(location.search);
if((confirmParams.get('type')==='signup'||confirmQuery.get('confirmed')==='1')&&!confirmParams.get('error')){
 document.querySelector('#accountModal')?.classList.add('open');
 document.querySelector('[data-auth="login"]')?.click();
 document.getElementById('loginStatus').textContent='E-mail confirmé. Connecte-toi avec ton adresse et ton mot de passe.';
 history.replaceState({},'',location.pathname);
}
if(confirmParams.get('error')||confirmQuery.get('error')){
 document.querySelector('#accountModal')?.classList.add('open');
 document.getElementById('loginStatus').textContent='Lien expiré ou invalide. Tu peux demander un nouvel e-mail de confirmation.';
}
const resendBtn=document.getElementById('resendSignupEmail');
if(resendBtn)resendBtn.onclick=async()=>{
 const msg=document.getElementById('resendSignupStatus');
 try{const d=await eclipseRequest('/auth/resend-confirmation',null,{email:pendingConfirmationEmail});msg.textContent=d.message}
 catch(e){msg.textContent=e.message}
};
// New account linking and recovery UI. Supabase confirmation links use the configured Site URL.
async function eclipseRequest(path,token,body){const r=await fetch(`${API_BASE}${path}`,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body||{})});const d=await r.json();if(!r.ok)throw Error(d.error||'Requête impossible');return d}
const requestCode=document.getElementById('requestLinkCode');
if(requestCode)requestCode.onclick=async()=>{const status=document.getElementById('linkStatus');try{const d=await eclipseRequest('/link/request',localStorage.getItem(TOKEN_KEY));status.textContent=`Dans Minecraft, tape : ${d.command} (valable 10 minutes)`}catch(e){status.textContent=e.message}};
const forgotSend=document.getElementById('sendRecovery');
if(forgotSend)forgotSend.onclick=async()=>{const status=document.getElementById('resetStatus');try{const d=await eclipseRequest('/auth/forgot',null,{email:document.getElementById('recoveryEmail').value.trim()});status.textContent=d.message}catch(e){status.textContent=e.message}};
const hashParams=new URLSearchParams(location.hash.replace(/^#/,''));
if(hashParams.get('access_token')&&hashParams.get('type')==='recovery'){
 localStorage.setItem(TOKEN_KEY,hashParams.get('access_token'));history.replaceState({},'',location.pathname+location.search);document.getElementById('accountModal')?.classList.add('open');document.getElementById('resetHelp')?.classList.remove('hidden');document.getElementById('authArea')?.classList.remove('hidden');document.getElementById('profileArea')?.classList.add('hidden');document.getElementById('loginForm')?.classList.add('hidden');document.getElementById('registerForm')?.classList.add('hidden');document.getElementById('newPasswordBox')?.classList.remove('hidden');
}
const resetSubmit=document.getElementById('changeRecoveredPassword');if(resetSubmit)resetSubmit.onclick=async()=>{const status=document.getElementById('resetStatus');try{await eclipseRequest('/auth/update-password',localStorage.getItem(TOKEN_KEY),{password:document.getElementById('recoveredPassword').value});status.textContent='Mot de passe modifié.'}catch(e){status.textContent=e.message}};

// Le backend /api/checkout vérifie lui aussi la session et n’accepte aucun paiement sans prestataire configuré.
addEventListener("focus",()=>{if(localStorage.getItem(TOKEN_KEY))refreshAccount()});

// Restore a verified account after a page refresh.
if(localStorage.getItem(TOKEN_KEY))refreshAccount();

// Console d'administration : toutes les données sont protégées par l'API côté serveur.
let adminMode='accounts';
async function adminRequest(path,options={}){
 const r=await fetch(API_BASE+'/admin/'+path,{...options,headers:{Authorization:'Bearer '+localStorage.getItem(TOKEN_KEY),'Content-Type':'application/json',...(options.headers||{})}});
 const d=await r.json();if(!r.ok)throw Error(d.error||'Accès refusé');return d;
}
async function loadAdmin(){
 const box=document.getElementById('adminRows'),status=document.getElementById('adminStatus');
 box.replaceChildren();status.textContent='Chargement…';
 try{
  const d=await adminRequest(adminMode==='accounts'?'accounts':'orders');status.textContent='';
  if(!d.items.length){box.textContent='Aucune donnée pour le moment.';return}
  for(const item of d.items){
   const row=document.createElement('div');row.className='admin-row';
   const info=document.createElement('div');
   const name=document.createElement('strong');name.textContent=adminMode==='accounts'?(item.minecraft_username||'Compte sans pseudo'):(item.id.slice(0,8)+' — '+(item.status||''));
   const sub=document.createElement('small');sub.textContent=adminMode==='accounts'?((item.email||'E-mail non disponible')+' · '+(item.suspended?'Compte suspendu':'Compte actif')):((item.buyer_email||'E-mail inconnu')+' · '+item.total_eur+' € · '+new Date(item.created_at).toLocaleDateString('fr-FR'));
   info.append(name,sub);row.append(info);
   if(adminMode==='accounts'){
    const btn=document.createElement('button');btn.type='button';btn.className='btn ghost';btn.textContent=item.suspended?'Réactiver':'Suspendre';
    btn.onclick=async()=>{if(!confirm((item.suspended?'Réactiver':'Suspendre')+' ce compte ?'))return;try{await adminRequest('accounts/'+encodeURIComponent(item.user_id)+'/suspension',{method:'POST',body:JSON.stringify({suspended:!item.suspended})});loadAdmin()}catch(e){status.textContent=e.message}};
    row.append(btn);
   }
   box.append(row);
  }
 }catch(e){status.textContent=e.message}
}
const adminButton=document.getElementById('profileAdminBtn');
if(adminButton)adminButton.onclick=()=>{document.getElementById('adminModal').classList.add('open');loadAdmin()};
for(const [id,mode] of [['adminTabAccounts','accounts'],['adminTabOrders','orders']]){
 const btn=document.getElementById(id);
 if(btn)btn.onclick=()=>{adminMode=mode;document.getElementById('adminTabAccounts').classList.toggle('active',mode==='accounts');document.getElementById('adminTabOrders').classList.toggle('active',mode==='orders');loadAdmin()};
}
document.getElementById('adminRefresh')?.addEventListener('click',loadAdmin);
document.querySelectorAll('[data-close="admin"]').forEach(el=>el.addEventListener('click',()=>document.getElementById('adminModal').classList.remove('open')));
