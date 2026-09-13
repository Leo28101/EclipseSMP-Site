document.body.style.overflow='hidden';
const intro=document.getElementById('intro'),site=document.getElementById('site');
window.addEventListener('load',()=>setTimeout(()=>{intro.classList.add('hide');site.classList.remove('site-hidden');site.classList.add('site-show');document.body.style.overflow='';setTimeout(()=>intro.remove(),1100)},3400));

const stars=document.getElementById('stars');
for(let i=0;i<75;i++){const s=document.createElement('span');s.className='star';s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';s.style.animationDelay=Math.random()*3+'s';s.style.animationDuration=(2+Math.random()*4)+'s';stars.appendChild(s)}

const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const menuBtn=document.getElementById('menuBtn'),navLinks=document.getElementById('navLinks');
menuBtn.onclick=()=>navLinks.classList.toggle('open');
navLinks.querySelectorAll('a').forEach(a=>a.onclick=()=>navLinks.classList.remove('open'));

document.querySelectorAll('.tab').forEach(tab=>tab.onclick=()=>{
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  tab.classList.add('active');
  const cat=tab.dataset.tab;
  document.querySelectorAll('.product').forEach(p=>p.classList.toggle('hidden',cat!=='all'&&p.dataset.cat!==cat));
});

document.getElementById('copyIp').onclick=async()=>{
  try{await navigator.clipboard.writeText('play.eclipsesmp.fr')}catch{}
  const t=document.getElementById('toast');t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1700)
};

const crates={
amethyst:{icon:'💜',tier:'CLÉ PREMIUM',title:'Clé Améthyste',desc:'Le premier niveau des équipements spéciaux EclipseSMP.',color:'#7c3aed',items:[
['⛏️','Pioche Améthyste 3x3','Mine une zone 3x3.'],
['🪓','Hache Améthyste','Coupe un arbre entier.'],
['🧹','Pelle Améthyste 3x3','Creuse une zone 3x3.'],
['🌾','Houe Améthyste 5x5','Laboure une zone 5x5.'],
['🔮','Capsule Améthyste','Permet de capturer les villageois.'],
['🛡️','Armure Améthyste','Protection IV • Solidité IV • Raccommodage • Bottes Chute amortie VI.']]},
eclipse:{icon:'🌘',tier:'CLÉ PREMIUM',title:'Clé Eclipse',desc:'Une clé supérieure avec de meilleurs outils et équipements.',color:'#a855f7',items:[
['⛏️','Pioche Eclipse 5x5','Mine une zone 5x5.'],
['🪓','Hache Eclipse','Coupe un arbre entier.'],
['🧹','Pelle Eclipse 5x5','Creuse une zone 5x5.'],
['🌾','Houe Eclipse 5x5','Laboure une zone 5x5.'],
['🔮','Capsule Eclipse','Capture les villageois.'],
['⚔️','Épée Eclipse','Arme premium Eclipse.'],
['🛡️','Armure Eclipse','Protection IV • Solidité IV • Raccommodage • Bottes Chute amortie VI.']]},
nova:{icon:'⭐',tier:'CLÉ PREMIUM',title:'Clé Nova',desc:'Le niveau premium le plus puissant de la boutique.',color:'#22d3ee',items:[
['⛏️','Pioche Nova 6x6','Mine une zone 6x6.'],
['🪓','Hache Nova','Coupe un arbre entier.'],
['🧹','Pelle Nova 6x6','Creuse une zone 6x6.'],
['🌾','Houe Nova 6x6','Laboure une zone 6x6.'],
['🔮','Capsule Nova','Capture les villageois.'],
['⚔️','Épée Nova','Arme premium Nova.'],
['🛡️','Armure Nova','Protection VI • Solidité V • Raccommodage • Bottes Chute amortie VII.']]},
rare:{icon:'🔹',tier:'CLÉ CLASSIQUE',title:'Clé Rare',desc:'Des récompenses utiles pour accélérer la progression.',color:'#2563eb',items:[
['💰','Argent','5 000$ à 15 000$.'],
['💎','Gemmes','100 à 300 gemmes.'],
['💠','Minerais','Fer, or et diamant.'],
['⬛','Obsidienne','16 à 32 blocs.'],
['⚔️','Épée diamant','Épée enchantée.'],
['⛏️','Pioche diamant','Efficacité IV • Solidité III.'],
['🍎','Pommes dorées','8 pommes dorées.'],
['🧿','Spawner basique','Poulet • Mouton • Zombie.']]},
epic:{icon:'🔥',tier:'CLÉ CLASSIQUE',title:'Clé Épique',desc:'Du loot avancé et de l’équipement Netherite.',color:'#f97316',items:[
['💰','Argent','20 000$ à 50 000$.'],
['💎','Gemmes','400 à 800 gemmes.'],
['💠','Diamants','16 à 32 diamants.'],
['🟫','Débris antiques','8 à 16.'],
['⚔️','Épée Netherite','Tranchant V.'],
['⛏️','Pioche Netherite','Efficacité V • Fortune III.'],
['🍎','Pommes dorées','16 pommes dorées.'],
['🗿','Totem','1 totem.'],
['🧿','Spawner moyen','Squelette • Araignée • Vache • Zombie Piglin.']]},
legendary:{icon:'🏆',tier:'CLÉ CLASSIQUE',title:'Clé Légendaire',desc:'Des récompenses très puissantes et rares.',color:'#eab308',items:[
['💰','Argent','75 000$ à 150 000$.'],
['💎','Gemmes','1 000 à 2 000 gemmes.'],
['💠','Diamants','32 à 64 diamants.'],
['🟫','Débris antiques','16 à 32.'],
['⚔️','Épée Netherite','Très enchantée.'],
['⛏️','Pioche Netherite','Fortune IV.'],
['🛡️','Armure Netherite','Protection IV.'],
['🗿','Totems','2 à 4 totems.'],
['🍏','Pommes enchantées','16 pommes dorées enchantées.'],
['🧿','Spawner rare','Blaze • Creeper • Golem de fer.'],
['💜','Bonus rare','Petite chance de gagner une Clé Améthyste.']]},
spawner:{icon:'🧿',tier:'CLÉ SPAWNER',title:'Clé Spawner',desc:'Chaque ouverture donne un spawner aléatoire selon les probabilités.',color:'#14b8a6',chance:true,items:[
['🐑','Mouton','18%',18],['🐔','Poulet','16%',16],['🐄','Vache','14%',14],['🧟','Zombie','12%',12],['🕷️','Araignée','10%',10],['🏹','Squelette','10%',10],['🐷','Zombie Piglin','8%',8],['🔥','Blaze','6%',6],['💥','Creeper','4%',4],['🛡️','Golem de fer','2%',2]]}
};

const drawer=document.getElementById('drawer'),grid=document.getElementById('lootGrid'),glow=document.getElementById('crateGlow');
function openCrate(key){
 const c=crates[key]; if(!c)return;
 document.getElementById('crateIcon').textContent=c.icon;
 document.getElementById('crateTier').textContent=c.tier;
 document.getElementById('crateTitle').textContent=c.title;
 document.getElementById('crateDesc').textContent=c.desc;
 document.getElementById('lootCount').textContent=c.items.length+' récompenses';
 glow.style.background=c.color;
 grid.innerHTML='';
 c.items.forEach((it,i)=>{
  const d=document.createElement('article');d.className='loot-card';d.style.animationDelay=(i*45)+'ms';
  const chance=c.chance?`<span class="chance">${it[2]}</span><div class="chance-bar"><i style="width:${Math.max(it[3]*4,8)}%"></i></div>`:'';
  d.innerHTML=`<div class="loot-card-top"><div class="loot-emoji">${it[0]}</div><div><h4>${it[1]}</h4></div></div><p>${c.chance?'Chance de l’obtenir à l’ouverture.':it[2]}</p>${chance}`;
  grid.appendChild(d);
 });
 drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
}
function closeDrawer(){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.style.overflow=''}
document.querySelectorAll('.view').forEach(b=>b.onclick=()=>openCrate(b.dataset.key));
document.getElementById('drawerClose').onclick=closeDrawer;
document.getElementById('drawerX').onclick=closeDrawer;
document.querySelector('.drawer-bg').onclick=closeDrawer;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
