document.body.style.overflow='hidden';
const intro=document.getElementById('intro');
const site=document.getElementById('site');
window.addEventListener('load',()=>{setTimeout(()=>{intro.classList.add('hide');site.classList.remove('site-hidden');site.classList.add('site-show');document.body.style.overflow='';setTimeout(()=>intro.remove(),1100)},3600)});

const stars=document.getElementById('stars');
for(let i=0;i<70;i++){
  const s=document.createElement('span');
  s.className='star';
  s.style.left=Math.random()*100+'%';
  s.style.top=Math.random()*100+'%';
  s.style.animationDelay=Math.random()*3+'s';
  s.style.animationDuration=(2+Math.random()*4)+'s';
  stars.appendChild(s);
}

const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}})},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const tabs=document.querySelectorAll('.tab');
const products=document.querySelectorAll('.product-card');
tabs.forEach(tab=>tab.addEventListener('click',()=>{tabs.forEach(t=>t.classList.remove('active'));tab.classList.add('active');const cat=tab.dataset.tab;products.forEach(p=>p.classList.toggle('hidden',cat!=='all'&&p.dataset.cat!==cat))}));

const menuBtn=document.getElementById('menuBtn');
const navLinks=document.getElementById('navLinks');
menuBtn.addEventListener('click',()=>navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>navLinks.classList.remove('open')));

const copyIp=document.getElementById('copyIp');
const toast=document.getElementById('toast');
copyIp.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('play.eclipsesmp.fr');toast.textContent='IP copiée : play.eclipsesmp.fr'}catch{toast.textContent='IP : play.eclipsesmp.fr'}toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800)});
