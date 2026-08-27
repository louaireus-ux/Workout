import fs from 'fs';
const src = fs.readFileSync(new URL('engine.js', import.meta.url),'utf8');
const ctx = {};
const run = new Function(src + `
  return {computeHeat,heatColor,buildBriefing,stats,emptyS,DEFAULT_PLAN,DEFAULT_EQUIP,DEFAULT_GOAL,MUSCLES,
    set:(p,s,c,e,g)=>{plan=p;sessions=s;cardio=c;equip=e;goalText=g;}};
`);
const M = run();
const dayOffset = n => { const d=new Date(); d.setDate(d.getDate()-n);
  const p=x=>String(x).padStart(2,'0'); return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); };
const plan = JSON.parse(JSON.stringify(M.DEFAULT_PLAN));
const reset = (s,c) => M.set(plan, s, c, M.DEFAULT_EQUIP.slice(), M.DEFAULT_GOAL);

let pass=0, fail=0;
const t=(name,cond,extra)=>{ if(cond){pass++;console.log('  ok   '+name);} else {fail++;console.log('  FAIL '+name+(extra?'  → '+extra:''));} };

// squat session: 4 worked sets, quads weight 1
const squatSession = (daysBack) => ([{date:dayOffset(daysBack),dayId:'A',warmup:true,entries:{
  a1:{name:'Back squat',m:{quads:1,glutes:.6,lowerback:.4,hamstrings:.3,core:.3},
      sets:[{w:'80',r:'8'},{w:'80',r:'8'},{w:'85',r:'6'},{w:'85',r:'6'}]}}}]);

console.log('\n1. Fresh log (squat today)');
reset(squatSession(0), []);
let r = M.computeHeat();
// quads = 1 * 0.11 * 4 sets * recency 1.0 = 0.44
t('quads heat = 0.44', Math.abs(r.h.quads-0.44)<1e-9, r.h.quads);
t('glutes heat = 0.264', Math.abs(r.h.glutes-0.264)<1e-9, r.h.glutes);
t('quads lastDay = 0 (weight>=0.6)', r.lastDay.quads===0, r.lastDay.quads);
t('hamstrings absent from lastDay (weight 0.3 < 0.6)', r.lastDay.hamstrings===undefined);
t('untouched chest = 0', r.h.chest===0);
t('engine still 0 with no cardio', r.engine===0);

console.log('\n2. Recency decay across the 8-day window');
reset(squatSession(4), []);
r = M.computeHeat();
t('4 days ago halves it → 0.22', Math.abs(r.h.quads-0.22)<1e-9, r.h.quads);

console.log('\n3. Stale log past DECAY_STR');
reset(squatSession(8), []);
r = M.computeHeat();
t('exactly 8 days ago → fully cold', r.h.quads===0, r.h.quads);
reset(squatSession(12), []);
r = M.computeHeat();
t('12 days ago → still 0, never negative', r.h.quads===0, r.h.quads);
t('stale session leaves lastDay empty', r.lastDay.quads===undefined);

console.log('\n4. Cardio only');
reset([], [{id:'c1',date:dayOffset(0),type:'run',intensity:'Easy',min:40,km:'8'}]);
r = M.computeHeat();
// engine = 0.5 * (40/40) * 1 * 1 = 0.5
t('engine = 0.50 for a 40min easy run today', Math.abs(r.engine-0.5)<1e-9, r.engine);
// calves = 0.5 * 1 * 1 * 0.18 * 1 = 0.09
t('calves bleed = 0.09', Math.abs(r.h.calves-0.09)<1e-9, r.h.calves);
t('chest untouched by cardio', r.h.chest===0);
t('cardio never writes lastDay', Object.keys(r.lastDay).length===0);

reset([], [{id:'c1',date:dayOffset(0),type:'run',intensity:'Hard',min:40,km:'8'}]);
t('Hard multiplier 1.4 → engine 0.70', Math.abs(M.computeHeat().engine-0.7)<1e-9, M.computeHeat().engine);
reset([], [{id:'c1',date:dayOffset(12),type:'run',intensity:'Easy',min:40}]);
t('cardio 12 days ago → engine 0', M.computeHeat().engine===0);

console.log('\n5. Caps');
reset([], Array.from({length:8},(_,i)=>({id:'c'+i,date:dayOffset(0),type:'bike',intensity:'Hard',min:90})));
r = M.computeHeat();
t('engine caps at 1', r.engine===1, r.engine);
t('muscle heat caps at 1', r.h.quads<=1, r.h.quads);

console.log('\n6. heatColor stops');
t('0 → cold grey', M.heatColor(0)==='rgb(44,53,47)', M.heatColor(0));
t('0.45 → green', M.heatColor(0.45)==='rgb(79,158,54)', M.heatColor(0.45));
t('1 → hot red', M.heatColor(1)==='rgb(214,90,58)', M.heatColor(1));
t('clamps above 1', M.heatColor(5)==='rgb(214,90,58)');

console.log('\n7. Operator status');
reset(squatSession(0), [{id:'c1',date:dayOffset(0),type:'run',intensity:'Easy',min:40}]);
let st = M.stats();
t('total counts strength + cardio', st.total===2, st.total);
t('rank Recruit under 10', st.rank==='Recruit', st.rank);
t('level = floor(total/5)+1', st.level===1, st.level);

console.log('\n8. Briefing reads the board');
reset([], []);
let b = M.buildBriefing();
t('blank board briefing mentions blank', /board is blank/i.test(b), b.slice(0,60));
reset(squatSession(0), []);
b = M.buildBriefing();
t('logged briefing names a plan day', /Full Body [ABC]/.test(b), b);
t('briefing has no markdown/bullets', !/[*#\-]{2}|^\s*[-*]/m.test(b));
t('briefing mentions the mission', /Mission still reads/.test(b));
console.log('\n  sample → '+b+'\n');

console.log((fail? 'FAILED ':'ALL PASS ')+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
