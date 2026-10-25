import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import {randomInt,randomBytes,createHash,timingSafeEqual} from 'node:crypto';
const app=express();app.disable('x-powered-by');app.use(express.json({limit:'200kb'}));
const origins=(process.env.FRONTEND_URL||'').split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors({origin:(origin,cb)=>cb(null,!origin||origins.includes(origin))}));
const db=new pg.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},max:5,connectionTimeoutMillis:7000});
const project=process.env.SUPABASE_URL?.replace(/\/$/,'');
const key=process.env.SUPABASE_ANON_KEY;
const authReady=()=>!!(project&&key);
const sha=s=>createHash('sha256').update(s).digest('hex');
function fail(res,e,status=500){console.error(e?.message||e);res.status(status).json({error:status===503?'Base de données indisponible':'Une erreur est survenue'});}
async function authRequest(path,options={}){
 if(!authReady())throw Error('Supabase Auth non configuré');
 const r=await fetch(`${project}/auth/v1/${path}`,{...options,headers:{apikey:key,'Content-Type':'application/json',...(options.headers||{})}});
 let d;try{d=await r.json()}catch{d={}};return {ok:r.ok,status:r.status,data:d};
}
async function userAuth(req,res,next){
 const raw=(req.headers.authorization||'').replace(/^Bearer /,'');
 if(!raw)return res.status(401).json({error:'Connexion requise'});
 try{const r=await authRequest('user',{headers:{Authorization:`Bearer ${raw}`}});if(!r.ok||!r.data.id)return res.status(401).json({error:'Session invalide'});req.user=r.data;next()}catch(e){console.error(e.message);res.status(503).json({error:'Authentification momentanément indisponible'})}
}
const pluginSecret=process.env.MINECRAFT_SYNC_SECRET;
function pluginAuth(req,res,next){const incoming=req.get('x-eclipse-secret')||'';if(!pluginSecret||!incoming)return res.sendStatus(403);const a=Buffer.from(pluginSecret),b=Buffer.from(incoming);if(a.length!==b.length||!timingSafeEqual(a,b))return res.sendStatus(403);next()}
const uuidRe=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const nameRe=/^[.a-zA-Z0-9_ -]{3,32}$/;
const tokenRe=/^\d{6}$/;
app.get('/',(_,res)=>res.type('text').send('EclipseSMP API online'));
app.get('/api/health',async(req,res)=>{try{await db.query('SELECT 1');res.json({ok:true,database:true,authConfigured:authReady()})}catch(e){console.error('Health database:',e.message);res.status(503).json({ok:false,database:false,authConfigured:authReady()})}});
// Supabase Auth handles email confirmation, password hashes, sessions, and recovery tokens.
// Registration is only allowed after Minecraft has verified the player's UUID.
app.post('/api/signup/start',async(req,res)=>{
 const username=req.body?.minecraftUsername;
 if(typeof username!=='string'||!nameRe.test(username))return res.status(400).json({error:'Pseudo Minecraft invalide'});
 try{
  const ticket=randomBytes(32).toString('base64url'),code=String(randomInt(100000,1000000));
  const already=await db.query('SELECT 1 FROM public.minecraft_links WHERE lower(minecraft_username)=lower($1) LIMIT 1',[username]);
  if(already.rowCount)return res.status(409).json({error:'Ce compte Minecraft est déjà lié'});
  await db.query(`INSERT INTO public.minecraft_signup_challenges(ticket_hash,code_hash,minecraft_username,expires_at) VALUES($1,$2,$3,now()+interval '10 minutes')`,[sha(ticket),sha(code),username]);
  res.json({ticket,command:'/link '+code,expires_in:600});
 }catch(e){fail(res,e,503)}
});
app.post('/api/signup/status',async(req,res)=>{
 const ticket=req.body?.ticket;
 if(typeof ticket!=='string'||ticket.length>100)return res.status(400).json({error:'Code de vérification invalide'});
 try{const q=await db.query(`SELECT minecraft_username,verified_uuid,used_at FROM public.minecraft_signup_challenges WHERE ticket_hash=$1 AND expires_at>now()`,[sha(ticket)]);
 if(!q.rowCount||q.rows[0].used_at)return res.status(410).json({error:'Code expiré : recommence la vérification'});
 res.json({verified:!!q.rows[0].verified_uuid,minecraftUsername:q.rows[0].minecraft_username});
 }catch(e){fail(res,e,503)}
});
app.post('/api/auth/register',async(req,res)=>{
 const {email,password,ticket}=req.body||{};
 if(typeof email!=='string'||email.length>254||!email.includes('@')||typeof password!=='string'||password.length<8||password.length>128||typeof ticket!=='string')return res.status(400).json({error:'Formulaire invalide'});
 if(!authReady())return res.status(503).json({error:'Supabase Auth non configuré sur Render'});
 const c=await db.connect();
 try{
  await c.query('BEGIN');
  const q=await c.query(`SELECT minecraft_username,verified_uuid FROM public.minecraft_signup_challenges WHERE ticket_hash=$1 AND verified_uuid IS NOT NULL AND used_at IS NULL AND expires_at>now() FOR UPDATE`,[sha(ticket)]);
  if(!q.rowCount){await c.query('ROLLBACK');return res.status(403).json({error:'Vérifie d’abord ton compte Minecraft avec /link'})}
  const r=await authRequest('signup',{method:'POST',body:JSON.stringify({email,password})});
  if(!r.ok||!r.data.user?.id){await c.query('ROLLBACK');return res.status(400).json({error:r.data.msg||r.data.message||'Inscription impossible, vérifie cet e-mail'})}
  const ch=q.rows[0];
  await c.query(`INSERT INTO public.minecraft_links(user_id,minecraft_uuid,minecraft_username) VALUES($1,$2,$3)`,[r.data.user.id,ch.verified_uuid,ch.minecraft_username]);
  await c.query(`UPDATE public.minecraft_signup_challenges SET used_at=now() WHERE ticket_hash=$1`,[sha(ticket)]);
  await c.query('COMMIT');res.json({ok:true,message:'Vérifie ton e-mail pour activer ton compte.'});
 }catch(e){await c.query('ROLLBACK');fail(res,e,e.code==='23505'?409:503)}finally{c.release()}
});
app.post('/api/auth/login',async(req,res)=>{
 const {email,password}=req.body||{};if(typeof email!=='string'||typeof password!=='string')return res.status(400).json({error:'Champs invalides'});
 try{const r=await authRequest('token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});res.status(r.ok?200:401).json(r.ok?{token:r.data.access_token,refresh_token:r.data.refresh_token,expires_in:r.data.expires_in}:{error:'Connexion impossible : vérifie tes identifiants et ton e-mail'})}catch(e){fail(res,e,503)}
});
app.post('/api/auth/refresh',async(req,res)=>{try{const r=await authRequest('token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:req.body?.refresh_token})});res.status(r.ok?200:401).json(r.ok?{token:r.data.access_token,refresh_token:r.data.refresh_token}:{error:'Session expirée'})}catch(e){fail(res,e,503)}});
app.post('/api/auth/forgot',async(req,res)=>{
 const email=req.body?.email;if(typeof email!=='string'||email.length>254)return res.status(400).json({error:'Email invalide'});
 try{await authRequest(`recover?redirect_to=${encodeURIComponent((origins[0]||'')+'?reset=1')}`,{method:'POST',body:JSON.stringify({email})});res.json({ok:true,message:'Si ce compte existe, un e-mail de récupération a été demandé.'})}catch(e){fail(res,e,503)}
});
app.post('/api/auth/update-password',userAuth,async(req,res)=>{const password=req.body?.password;if(typeof password!=='string'||password.length<8)return res.status(400).json({error:'Mot de passe trop court'});try{const r=await authRequest('user',{method:'PUT',headers:{Authorization:req.headers.authorization},body:JSON.stringify({password})});res.status(r.ok?200:400).json(r.ok?{ok:true}:{error:'Réinitialisation impossible'})}catch(e){fail(res,e,503)}});
app.get('/api/me',userAuth,async(req,res)=>{try{const {rows}=await db.query(`SELECT l.minecraft_uuid,l.minecraft_username,s.rank_name,s.money,s.shards,s.kills,s.deaths,s.playtime_seconds FROM public.minecraft_links l LEFT JOIN public.minecraft_stats s USING(minecraft_uuid) WHERE l.user_id=$1`,[req.user.id]);res.json({email:req.user.email,linked:!!rows.length,minecraft_username:rows[0]?.minecraft_username||null,rank_name:rows[0]?.rank_name||'default',money:rows[0]?.money??0,shards:rows[0]?.shards??0,kills:rows[0]?.kills??0,deaths:rows[0]?.deaths??0,playtime:Math.floor(Number(rows[0]?.playtime_seconds||0)/3600)+'h'})}catch(e){fail(res,e,503)}});
const scoreColumns={money:'money',shards:'shards',kills:'kills',playtime:'playtime_seconds'};
app.get('/api/leaderboard',async(req,res)=>{const col=scoreColumns[req.query.type]||'money';try{const {rows}=await db.query(`SELECT minecraft_username,rank_name,${col} AS value,updated_at FROM public.minecraft_stats WHERE lower(minecraft_username) NOT IN ('rip282528','david7277219') ORDER BY ${col} DESC NULLS LAST,minecraft_username LIMIT 10`);res.json(rows)}catch(e){fail(res,e,503)}});
// Website generates a single-use code; only the server plugin can redeem it.
app.post('/api/link/request',userAuth,async(req,res)=>{try{const linked=await db.query('SELECT 1 FROM public.minecraft_links WHERE user_id=$1',[req.user.id]);if(linked.rowCount)return res.status(409).json({error:'Compte Minecraft déjà lié'});
 const last=await db.query(`SELECT 1 FROM public.minecraft_link_codes WHERE user_id=$1 AND created_at>now()-interval '45 seconds'`,[req.user.id]);if(last.rowCount)return res.status(429).json({error:'Réessaie dans quelques secondes'});
 await db.query('DELETE FROM public.minecraft_link_codes WHERE user_id=$1',[req.user.id]);let code;for(let i=0;i<5;i++){code=String(randomInt(100000,1000000));try{await db.query(`INSERT INTO public.minecraft_link_codes(user_id,code_hash,expires_at) VALUES($1,$2,now()+interval '10 minutes')`,[req.user.id,sha(code)]);break}catch(e){if(i===4)throw e}}res.json({code,expires_in:600,command:'/link '+code})}catch(e){fail(res,e,503)}});
app.post('/api/minecraft/link/claim',pluginAuth,async(req,res)=>{
 const {code,uuid,username}=req.body||{};if(!tokenRe.test(code||'')||!uuidRe.test(uuid||'')||!nameRe.test(username||''))return res.status(400).json({error:'Code ou joueur invalide'});
 const c=await db.connect();try{await c.query('BEGIN');
 // Before account creation, a code can verify the game's identity for signup.
 const pending=await c.query(`SELECT ticket_hash,minecraft_username FROM public.minecraft_signup_challenges WHERE code_hash=$1 AND verified_uuid IS NULL AND used_at IS NULL AND expires_at>now() FOR UPDATE`,[sha(code)]);
 if(pending.rowCount){
  if(pending.rows[0].minecraft_username.toLowerCase()!==username.toLowerCase()){
   await c.query('ROLLBACK');return res.status(403).json({error:'Ce code appartient à un autre pseudo'});
  }
  const linked=await c.query('SELECT 1 FROM public.minecraft_links WHERE minecraft_uuid=$1',[uuid]);
  if(linked.rowCount){await c.query('ROLLBACK');return res.status(409).json({error:'Ce compte Minecraft est déjà lié'})}
  await c.query('UPDATE public.minecraft_signup_challenges SET verified_uuid=$1,minecraft_username=$2,code_hash=NULL WHERE ticket_hash=$3',[uuid,username,pending.rows[0].ticket_hash]);
  await c.query('COMMIT');return res.json({ok:true,registration:true});
 }
 const q=await c.query(`SELECT user_id FROM public.minecraft_link_codes WHERE code_hash=$1 AND expires_at>now() FOR UPDATE`,[sha(code)]);if(!q.rowCount){await c.query('ROLLBACK');return res.status(404).json({error:'Code incorrect ou expiré'})}
 const u=q.rows[0].user_id;await c.query(`INSERT INTO public.minecraft_links(user_id,minecraft_uuid,minecraft_username) VALUES($1,$2,$3)`,[u,uuid,username]);await c.query('DELETE FROM public.minecraft_link_codes WHERE user_id=$1',[u]);await c.query('COMMIT');res.json({ok:true})}catch(e){await c.query('ROLLBACK');res.status(e.code==='23505'?409:503).json({error:e.code==='23505'?'Compte déjà associé':'Liaison impossible'});console.error('Claim',e.message)}finally{c.release()}
});
app.post('/api/minecraft/stats',pluginAuth,async(req,res)=>{
 const players=req.body?.players;if(!Array.isArray(players)||players.length>100)return res.status(400).json({error:'Lot invalide'});
 for(const p of players){if(!uuidRe.test(p?.uuid||'')||!nameRe.test(p?.username||'')||![p.money,p.shards,p.kills,p.playtime_seconds].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=1e15))return res.status(400).json({error:'Statistiques invalides'})}
 const c=await db.connect();try{await c.query('BEGIN');for(const p of players)await c.query(`INSERT INTO public.minecraft_stats(minecraft_uuid,minecraft_username,rank_name,money,shards,kills,deaths,playtime_seconds,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,now()) ON CONFLICT(minecraft_uuid) DO UPDATE SET minecraft_username=EXCLUDED.minecraft_username,rank_name=EXCLUDED.rank_name,money=EXCLUDED.money,shards=EXCLUDED.shards,kills=EXCLUDED.kills,deaths=EXCLUDED.deaths,playtime_seconds=EXCLUDED.playtime_seconds,updated_at=now()`,[p.uuid,p.username,String(p.rank_name||'default'),p.money,p.shards,p.kills,Math.max(0,Number(p.deaths||0)),p.playtime_seconds]);await c.query('COMMIT');res.json({ok:true,count:players.length})}catch(e){await c.query('ROLLBACK');fail(res,e,503)}finally{c.release()}
});
// Nothing is payable without a verified payment processor and a delivery worker.
app.post('/api/checkout',userAuth,(_,res)=>res.status(501).json({error:'Paiement non activé : aucune somme ne sera prélevée.'}));
app.listen(process.env.PORT||3000,()=>console.log('EclipseSMP API online'));
