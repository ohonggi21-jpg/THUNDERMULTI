(function(){
'use strict';
const $=id=>document.getElementById(id), R=Math.random, pick=a=>a[Math.floor(R()*a.length)], clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const SURFACES={hard:{name:'하드 코트',color:'#2479b8',bonus:'빠른 공·균일한 바운드'},clay:{name:'클레이 코트',color:'#bd6548',bonus:'높은 바운드·긴 랠리'},grass:{name:'잔디 코트',color:'#287746',bonus:'낮은 바운드·서브 우세'}};
const STYLES=['공격형 베이스라이너','수비형 베이스라이너','서브 앤 발리','올라운더','강력한 서브 중심','랠리 특화형','카운터펀처'];
const MEN=[['카이 모리','🇯🇵','일본'],['루카 모레티','🇮🇹','이탈리아'],['마테오 로시','🇮🇹','이탈리아'],['에단 브룩스','🇺🇸','미국'],['노아 윌리엄스','🇬🇧','영국'],['펠릭스 뒤랑','🇫🇷','프랑스'],['알렉산더 볼코프','🇷🇺','러시아'],['다니엘 코스타','🇪🇸','스페인'],['이반 페트로비치','🇷🇸','세르비아'],['준 리','🇰🇷','대한민국'],['라파엘 산토스','🇧🇷','브라질'],['올리버 슈미트','🇩🇪','독일'],['티아고 실바','🇵🇹','포르투갈'],['카를로스 베가','🇲🇽','멕시코'],['아담 노박','🇨🇿','체코'],['마르코 바실리','🇭🇷','크로아티아']];
const WOMEN=[['미나 한','🇰🇷','대한민국'],['소피아 마르티네스','🇪🇸','스페인'],['에밀리 카터','🇺🇸','미국'],['아나 페트로바','🇧🇬','불가리아'],['클라라 뒤부아','🇫🇷','프랑스'],['유나 사토','🇯🇵','일본'],['올리비아 리드','🇬🇧','영국'],['마리아 로시','🇮🇹','이탈리아'],['엘레나 코바치','🇭🇺','헝가리'],['이사벨라 코스타','🇧🇷','브라질'],['나디아 이바노바','🇷🇺','러시아'],['레아 슈미트','🇩🇪','독일'],['카밀라 베가','🇦🇷','아르헨티나'],['조이 첸','🇨🇳','중국'],['마야 노박','🇨🇿','체코'],['아멜리아 브라운','🇦🇺','호주']];
const EVENT=[
 {n:'최상의 컨디션',d:'몸이 가벼워졌다! 전체 경기력이 일시적으로 상승한다.',w:5,c:s=>true,e:(s,k)=>mod(s,k,'all',11,4)},
 {n:'최악의 컨디션',d:'움직임과 샷 정확도가 흔들린다.',w:4,c:s=>true,e:(s,k)=>mod(s,k,'all',-10,4)},
 {n:'뜨거운 손',d:'연속 득점의 흐름을 탔다. 다음 샷 성공률이 높아진다.',w:4,c:s=>s.streak.some(v=>v>=2),e:s=>mod(s,s.streak[0]>=s.streak[1]?0:1,'attack',15,4)},
 {n:'멘탈 붕괴',d:'중요한 포인트에서 실수 가능성이 커진다.',w:4,c:s=>true,e:(s,k)=>mod(s,k,'error',18,4)},
 {n:'집중력 폭발',d:'브레이크 포인트에서 집중력이 상승한다.',w:3,c:s=>true,e:(s,k)=>mod(s,k,'clutch',15,3)},
 {n:'체력 고갈',d:'급격한 피로로 스피드와 회복력이 떨어진다.',w:4,c:s=>true,e:(s,k)=>{s.stamina[k]=Math.max(8,s.stamina[k]-18);mod(s,k,'speed',-12,5)}},
 {n:'완벽한 리듬',d:'랠리 감각이 살아났다. 공격과 수비가 함께 상승한다.',w:4,c:s=>true,e:(s,k)=>mod(s,k,'rally',13,4)},
 {n:'부상 위험',d:'움직임이 제한된다. 당분간 경기력이 감소한다.',w:2,c:s=>true,e:(s,k)=>{s.stamina[k]=Math.max(5,s.stamina[k]-8);mod(s,k,'speed',-18,5);mod(s,k,'all',-5,5)}},
 {n:'네트 터치',d:'공이 네트에 맞고 불규칙하게 떨어진다.',w:3,c:s=>true,e:(s,k)=>mod(s,k,'netLuck',14,1)},
 {n:'라인 판정 논란',d:'챌린지 판정으로 집중력이 흔들린다.',w:2,c:s=>true,e:(s,k)=>mod(s,k,'accuracy',10,2)},
 {n:'강력한 바람',d:'공의 궤적이 흔들려 양쪽의 정확도가 감소한다.',w:3,c:s=>true,e:s=>{mod(s,0,'accuracy',-10,3);mod(s,1,'accuracy',-10,3)}},
 {n:'갑작스러운 햇빛',d:'리턴하는 선수의 시야가 잠시 방해받는다.',w:2,c:s=>true,e:s=>mod(s,1-s.server,'return',-15,2)},
 {n:'공 교체',d:'새 공의 탄력이 살아났다. 서브가 강해진다.',w:3,c:s=>true,e:s=>mod(s,s.server,'serve',10,4)},
 {n:'미끄러운 코트',d:'발이 미끄러져 움직임이 둔해진다.',w:3,c:s=>s.court!=='clay',e:(s,k)=>mod(s,k,'speed',-14,3)},
 {n:'관중의 함성',d:'응원을 받은 선수의 집중력이 상승한다.',w:4,c:s=>true,e:(s,k)=>mod(s,k,'focus',13,4)},
 {n:'관중의 방해',d:'심판이 경기를 잠시 중단한다. 흐름이 끊긴다.',w:2,c:s=>true,e:(s,k)=>{mod(s,k,'focus',-7,2);s.pauseExtra+=1.4}},
 {n:'에이스 연속 작렬',d:'강력한 서브가 상대 코트를 흔든다.',w:3,c:s=>true,e:s=>mod(s,s.server,'serve',20,4)},
 {n:'초강력 포핸드',d:'포핸드 공격력이 크게 상승한다.',w:4,c:s=>true,e:(s,k)=>mod(s,k,'fh',18,3)},
 {n:'백핸드 크로스 대각선',d:'빈 공간을 노리는 백핸드가 날카로워진다.',w:4,c:s=>true,e:(s,k)=>mod(s,k,'bh',18,3)},
 {n:'완벽한 드롭샷',d:'네트 앞 공략이 살아난다.',w:3,c:s=>true,e:(s,k)=>mod(s,k,'volley',17,3)},
 {n:'슈퍼 로브',d:'상대의 위치를 흔들어 다음 랠리 우위를 얻는다.',w:3,c:s=>true,e:(s,k)=>{mod(s,k,'speed',9,3);mod(s,k,'accuracy',9,2)}},
 {n:'환상적인 발리',d:'네트 플레이가 강력해진다.',w:3,c:s=>true,e:(s,k)=>mod(s,k,'volley',20,3)},
 {n:'다운더라인 위너',d:'코트 끝을 찌르는 공격의 정확도가 상승한다.',w:3,c:s=>true,e:(s,k)=>mod(s,k,'accuracy',18,2)},
 {n:'슈퍼 리턴',d:'리턴 능력이 폭발적으로 상승한다.',w:3,c:s=>true,e:s=>mod(s,1-s.server,'return',20,3)},
 {n:'상대의 도발',d:'도발에 흔들린 선수의 멘탈이 감소한다.',w:2,c:s=>true,e:(s,k)=>mod(s,1-k,'mental',-14,3)},
 {n:'침착한 대응',d:'흔들리지 않는 침착함으로 멘탈을 회복한다.',w:3,c:s=>true,e:(s,k)=>mod(s,k,'mental',14,3)},
 {n:'심판과의 언쟁',d:'잠시 항의가 이어진다. 집중력이 떨어진다.',w:2,c:s=>true,e:(s,k)=>{mod(s,k,'focus',-12,2);s.pauseExtra+=1.2}},
 {n:'관중의 야유',d:'야유를 받은 선수의 집중력이 감소한다.',w:2,c:s=>true,e:(s,k)=>mod(s,k,'focus',-14,3)},
 {n:'역전의 의지',d:'뒤지고 있는 선수의 경기력이 상승한다.',w:3,c:s=>s.games[0]!==s.games[1]||s.sets[0]!==s.sets[1],e:s=>mod(s,trailing(s),'all',14,5)},
 {n:'승리 직전의 긴장',d:'매치 포인트에 선두 선수가 압박을 느낀다.',w:2,c:s=>matchPoint(s)>=0,e:s=>mod(s,matchPoint(s),'error',15,2)},
 {n:'챔피언의 침착함',d:'중요한 순간에 멘탈 보너스를 얻는다.',w:2,c:s=>matchPoint(s)>=0,e:s=>mod(s,matchPoint(s),'mental',16,3)},
 {n:'상대의 자신감 붕괴',d:'연속 실점한 선수의 경기력이 감소한다.',w:2,c:s=>Math.abs(s.streak[0]-s.streak[1])>=2,e:s=>{const k=s.streak[0]>s.streak[1]?1:0;mod(s,k,'all',-14,3)}},
 {n:'비가 내리기 시작한다',d:'짧은 경기 중단! 재개 후 양쪽 체력이 조금 회복된다.',w:1,c:s=>true,e:s=>{s.stamina[0]=Math.min(100,s.stamina[0]+7);s.stamina[1]=Math.min(100,s.stamina[1]+7);s.pauseExtra+=2}},
 {n:'폭염 경보',d:'체력 소모가 증가한다.',w:2,c:s=>true,e:s=>{mod(s,0,'fatigue',7,5);mod(s,1,'fatigue',7,5)}},
 {n:'의료 타임아웃',d:'선수가 치료를 받고 체력을 회복한다.',w:2,c:s=>true,e:(s,k)=>{s.stamina[k]=Math.min(100,s.stamina[k]+22);mod(s,k,'all',-3,2)}},
 {n:'기적의 랠리',d:'엄청나게 긴 랠리! 양쪽 체력이 크게 소모된다.',w:2,c:s=>true,e:(s,k)=>{s.stamina[0]=Math.max(5,s.stamina[0]-12);s.stamina[1]=Math.max(5,s.stamina[1]-12);mod(s,k,'rally',20,2);s.forceLongRally=1}},
 {n:'챔피언 포인트',d:'경기를 결정할 수 있는 순간! 중요한 포인트의 집중력이 상승한다.',w:2,c:s=>true,e:(s,k)=>mod(s,matchPoint(s)>=0?matchPoint(s):trailing(s),'clutch',19,2)},
 {n:'슈퍼 타이브레이크',d:'세트가 팽팽하다! 7점 선취 타이브레이크가 시작된다.',w:1,c:s=>s.gamesToWin>1&&s.games[0]===s.games[1]&&s.games[0]>=s.gamesToWin-1,e:s=>{s.forceTB=true}},
 {n:'관중석의 스타 등장',d:'스타의 등장으로 경기장 분위기가 달아오른다.',w:1,c:s=>true,e:(s,k)=>mod(s,k,'focus',12,3)},
 {n:'역대급 대역전',d:'열세에 놓인 선수가 기적의 기회를 얻는다.',w:1,c:s=>true,e:s=>{const k=trailing(s);mod(s,k,'all',22,5);mod(s,k,'clutch',12,3)}}
];
let state=null,tournament=null,active=false,preparedSides=[],preparedSettings=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function setting(){return{format:$('tnFormat').value,sets:+$('tnSets').value,games:+$('tnGames').value,court:$('tnCourtType').value,noAd:$('tnRule').value==='noad',draw:+$('tnDrawSize').value||0}}
function randomPerson(gender){
 const src=gender==='f'?WOMEN:MEN,base=pick(src),age=19+Math.floor(R()*17),rank=1+Math.floor(Math.pow(R(),1.45)*180);
 const stats={serve:randStat(),fh:randStat(),bh:randStat(),volley:randStat(),speed:randStat(),stamina:randStat(),focus:randStat(),mental:randStat(),experience:clamp(100-rank*.35+Math.floor(R()*18),40,99)};
 const bestCourt=pick(['hard','clay','grass']),style=pick(STYLES);
 const styleBonus=style==='강력한 서브 중심'?{serve:8}:style==='공격형 베이스라이너'?{fh:7,bh:4}:style==='수비형 베이스라이너'?{speed:7,stamina:5}:style==='서브 앤 발리'?{serve:5,volley:8}:style==='랠리 특화형'?{fh:4,bh:7,stamina:4}:style==='카운터펀처'?{speed:5,focus:5}:{fh:3,bh:3,volley:3};
 return{name:base[0],flag:base[1],nation:base[2],age:age,rank:rank,stats:stats,bestCourt:bestCourt,style:style,bonus:styleBonus};
}
function randStat(){return 58+Math.floor(Math.pow(R(),.65)*39)}
function teamFor(format,idx){
 const female=format==='ws'||format==='wd',mixed=format==='xd',doubles=format==='md'||format==='wd'||mixed;
 const members=doubles?(mixed?[randomPerson('m'),randomPerson('f')]:[randomPerson(female?'f':'m'),randomPerson(female?'f':'m')]):[randomPerson(female?'f':'m')];
 const c=['#55b7ff','#ff6d8f','#9cff8f','#ffc85c','#c29cff','#4ce0d0'][idx%6],title=members.map(p=>p.name).join(' / ');
 const avg=k=>members.reduce((a,p)=>a+p.stats[k]+(p.bonus[k]||0),0)/members.length;
 const rating=Math.round(['serve','fh','bh','volley','speed','stamina','focus','mental','experience'].reduce((a,k)=>a+avg(k),0)/9);
 return{label:title,color:c,members:members,rating:rating,stats:Object.fromEntries(['serve','fh','bh','volley','speed','stamina','focus','mental','experience'].map(k=>[k,avg(k)])),bestCourt:members.map(p=>p.bestCourt).join(' / '),styles:members.map(p=>p.style).join(' · ')};
}
function makeTeams(cfg){
 const count=cfg.draw||2,sides=[];tournament=null;
 for(let i=0;i<count;i++)sides.push(teamFor(cfg.format,i));
 if(count===2)return sides;
 const pairs=[];for(let i=0;i<sides.length;i+=2)pairs.push([sides[i],sides[i+1]]);
 tournament={size:count,roundSize:count,roundLabel:roundName(count),pairs:pairs,index:0,winners:[],results:[],champion:null};
 return sides;
}
function roundName(n){return n===2?'결승':n===4?'4강':n+'강'}
function showEl(el){el.hidden=false}function hideEl(el){el.hidden=true}
function sideCard(x){
 const top=x.members.map(p=>p.flag+' '+p.name).join(' / '),details=x.members.map(p=>p.nation+' · '+p.age+'세 · 세계 '+p.rank+'위').join('<br>');
 return '<div class="tnPlayerCard" style="--team:'+x.color+'"><div class="tnPcTop"><span>'+top+'</span><b>OVR '+x.rating+'</b></div><div class="tnPcMeta">'+details+'</div><div class="tnPcStyle">'+esc(x.styles)+' · 주력 '+esc(x.bestCourt)+'</div><div class="tnPcStats">'+['serve','fh','bh','volley','speed','stamina','focus','mental','experience'].map((k,i)=>'<span>'+['서브','포핸드','백핸드','발리','스피드','체력','집중','멘탈','경험'][i]+' '+Math.round(x.stats[k])+'</span>').join('')+'</div></div>';
}
function prepare(){
 active=false;MODE='tennis';S='TENNIS_PREP';document.body.className='TENNIS_PREP';$('oT').style.display='none';$('tennisApp').style.display='block';showEl($('tnPrep'));hideEl($('tnMatch'));hideEl($('tnResult'));preparedSettings=setting();preparedSides=makeTeams(preparedSettings);state={sides:preparedSettings.draw?[tournament.pairs[0][0],tournament.pairs[0][1]]:preparedSides,settings:preparedSettings};renderPreview();$('tnRoundLabel').textContent=tournament?tournament.roundLabel+' 토너먼트':'친선 경기';
}
function renderPreview(){
 const sides=state.sides||preparedSides;
 $('tnPreview').innerHTML=sides.slice(0,2).map(x=>sideCard(x)).join('<div class="tnVs">VS</div>');
 if(tournament){$('tnBracketInfo').textContent=tournament.size+'팀 대진표 생성 완료 · '+tournament.roundLabel+' 첫 경기부터 진행';$('tnBracketInfo').style.display='block'}else{$('tnBracketInfo').style.display='none'}
}
function buildState(sides,cfg){
 return{sides:sides,settings:cfg,court:cfg.court,setsNeeded:cfg.sets===1?1:2,gamesToWin:cfg.games,sets:[0,0],games:[0,0],points:[0,0],tbPoints:[0,0],tiebreak:false,forceTB:false,server:Math.floor(R()*2),stamina:[100,100],streak:[0,0],aces:[0,0],mods:[[],[]],pointNo:0,lastEvents:{},eventLog:[],history:[],pauseExtra:0,phase:'countdown',count:3,nextIn:0,rally:null,elapsed:0,won:null,winner:null,winnerIndex:-1,setScore:'0-0',score:'0-0',longestRally:0,swapped:false,finished:false,speed:1,eventsUsed:0,forceLongRally:0};
}
function start(){
 if(!preparedSettings||!state||!state.sides){prepare()}
 const cfg=setting();
 if(cfg.draw!==preparedSettings.draw||cfg.format!==preparedSettings.format){preparedSettings=cfg;preparedSides=makeTeams(cfg);if(tournament)state={sides:[tournament.pairs[0][0],tournament.pairs[0][1]],settings:cfg};else state={sides:preparedSides.slice(0,2),settings:cfg}}
 else preparedSettings=cfg;
 const sides=tournament?tournament.pairs[tournament.index]:preparedSides.slice(0,2);
 state=buildState(sides,cfg);active=true;MODE='tennis';S='TENNIS_MATCH';document.body.className='TENNIS_MATCH';
 $('tennisApp').style.display='block';hideEl($('tnPrep'));showEl($('tnMatch'));hideEl($('tnResult'));
 $('tnRoundLabel').textContent=tournament?tournament.roundLabel+' · '+(tournament.index+1)+'/'+tournament.pairs.length:'프로 매치';
 $('tnCourtLabel').textContent=SURFACES[cfg.court].name.toUpperCase();$('tnSpeed').value='1';updateUI();log('선수 입장! '+sides[0].label+' vs '+sides[1].label);
 try{aud();sfx('big')}catch(e){}
}
function mod(s,k,field,val,duration){(k===-1?[0,1]:[k]).forEach(i=>s.mods[i].push({f:field,v:val,until:s.pointNo+(duration||2)}))}
function getMod(s,k,field){return s.mods[k].filter(m=>m.until>=s.pointNo&&(m.f===field||m.f==='all')).reduce((a,m)=>a+m.v,0)}
function trailing(s){const a=s.sets[0]*20+s.games[0]*3+s.points[0],b=s.sets[1]*20+s.games[1]*3+s.points[1];return a<=b?0:1}
function matchPoint(s){for(let k=0;k<2;k++)if(s.sets[k]===s.setsNeeded-1&&s.sets[1-k]<s.setsNeeded-1&&s.games[k]>=s.gamesToWin-1&&s.games[k]>=s.games[1-k]&&s.points[k]>=3)return k;return -1}
function pickEvent(s){
 if(R()>.19)return null;const valid=EVENT.filter(e=>(!s.lastEvents[e.n]||s.pointNo-s.lastEvents[e.n]>=5)&&e.c(s));if(!valid.length)return null;
 let w=valid.reduce((a,e)=>a+e.w,0),v=R()*w;
 for(const e of valid){v-=e.w;if(v<=0){const k=Math.floor(R()*2);e.e(s,k);s.lastEvents[e.n]=s.pointNo;s.eventsUsed++;return e}}
 return null;
}
function effective(s,k,attr){return s.sides[k].stats[attr]+(s.sides[k].bestCourt.indexOf(s.court)>=0?4:0)+getMod(s,k,attr)+getMod(s,k,'all')}
function pointWinner(s){
 const server=s.server,receiver=1-server,serve=effective(s,server,'serve'),ret=effective(s,receiver,'focus')+getMod(s,receiver,'return');
 const attack0=(effective(s,0,'fh')+effective(s,0,'bh')+effective(s,0,'volley'))/3,attack1=(effective(s,1,'fh')+effective(s,1,'bh')+effective(s,1,'volley'))/3;
 const power0=(s.sides[0].rating*.35+attack0*.25+effective(s,0,'speed')*.1+effective(s,0,'mental')*.15+effective(s,0,'focus')*.15)+getMod(s,0,'accuracy')+getMod(s,0,'rally')+getMod(s,0,'clutch')-getMod(s,0,'error');
 const power1=(s.sides[1].rating*.35+attack1*.25+effective(s,1,'speed')*.1+effective(s,1,'mental')*.15+effective(s,1,'focus')*.15)+getMod(s,1,'accuracy')+getMod(s,1,'rally')+getMod(s,1,'clutch')-getMod(s,1,'error');
 let p=clamp(.5+(power0-power1)/190+(server===0?(serve-ret)/260:-(serve-ret)/260)+(s.stamina[0]-s.stamina[1])/850,.22,.78);
 const aceChance=clamp(.025+(serve-70)*.003+getMod(s,server,'serve')*.002,.01,.28);
 if(R()<aceChance)return{side:server,ace:true};return{side:R()<p?0:1,ace:false};
}
function pointRest(s){if(s.gamesToWin===1)return s.settings.sets===1?7:8.6;return s.settings.sets===1?1.25:2.05}
function beginPoint(){
 const s=state;if(!s||s.finished)return;s.pointNo++;
 const ev=pickEvent(s);if(ev)showEvent(ev.n,ev.d);
 const outcome=pointWinner(s),server=s.server,rallyCount=s.forceLongRally?24+Math.floor(R()*12):3+Math.floor(R()*17);
 s.forceLongRally=0;s.longestRally=Math.max(s.longestRally,rallyCount);s.rally={elapsed:0,duration:.78+R()*.55,winner:outcome.side,server:server,ace:outcome.ace,rallies:rallyCount};s.phase='rally';
}
function finishPoint(){
 const s=state;if(!s||!s.rally)return;const r=s.rally,k=r.winner,o=1-k;s.rally=null;
 s.stamina[0]=Math.max(5,s.stamina[0]-(.35+getMod(s,0,'fatigue')*.04+(100-s.stamina[0])*.008));s.stamina[1]=Math.max(5,s.stamina[1]-(.35+getMod(s,1,'fatigue')*.04+(100-s.stamina[1])*.008));
 s.streak[k]++;s.streak[o]=0;if(r.ace){s.aces[k]++;log('ACE! '+s.sides[k].label+'의 강력한 서브!');try{sfx('up')}catch(e){}}else log(s.sides[k].label+' 득점 · '+r.rallies+'구 랠리');
 awardPoint(s,k);if(!s.finished){s.phase='idle';s.nextIn=pointRest(s)+s.pauseExtra;s.pauseExtra=0}updateUI();
}
function awardPoint(s,k){
 const o=1-k;if(s.tiebreak){s.tbPoints[k]++;const total=s.tbPoints[0]+s.tbPoints[1];if(s.tbPoints[k]>=7&&s.tbPoints[k]-s.tbPoints[o]>=2){closeSet(s,k,true);return}if(total===1||(total>1&&(total-1)%2===0))s.server=1-s.server;return}
 s.points[k]++;if(s.settings.noAd&&s.points[0]>=3&&s.points[1]>=3){winGame(s,k);return}if(s.points[k]>=4&&s.points[k]-s.points[o]>=2){winGame(s,k);return}
}
function winGame(s,k){
 s.games[k]++;s.points=[0,0];s.server=1-s.server;
 if((s.games[0]+s.games[1])%2===0){s.swapped=!s.swapped;log('코트 체인지!')}
 const o=1-k;if(s.games[k]>=s.gamesToWin&&s.games[k]>s.games[o]){closeSet(s,k,false);return}
 if(s.gamesToWin>1&&s.games[0]===s.gamesToWin-1&&s.games[1]===s.gamesToWin-1){s.tiebreak=true;s.tbPoints=[0,0];log('타이브레이크 시작! 7점 선취, 2점 차 승리')}
 if(s.forceTB){s.forceTB=false;s.tiebreak=true;s.tbPoints=[0,0];log('슈퍼 타이브레이크 돌입!')}updateUI();
}
function closeSet(s,k,tb){
 const record={a:s.games[0],b:s.games[1],tb:tb?(s.tbPoints[0]+'-'+s.tbPoints[1]):''};s.history.push(record);s.sets[k]++;s.games=[0,0];s.points=[0,0];s.tbPoints=[0,0];s.tiebreak=false;s.server=1-k;s.swapped=!s.swapped;log((s.history.length)+'세트 종료! '+s.sides[k].label+' 승리');
 if(s.sets[k]>=s.setsNeeded){completeMatch(s,k);return}s.phase='idle';s.nextIn=pointRest(s)+.5;
}
function log(msg){if(!state)return;state.eventLog.unshift(msg);state.eventLog=state.eventLog.slice(0,5);const el=$('tnLog');if(el)el.innerHTML=state.eventLog.map(x=>'<div>• '+esc(x)+'</div>').join('')}
function showEvent(name,desc){const el=$('tnEventToast');if(!el)return;el.innerHTML='<b>⚡ '+esc(name)+'</b><small>'+esc(desc)+'</small>';el.classList.remove('on');void el.offsetWidth;el.classList.add('on')}
function scorePoint(s){
 if(s.tiebreak)return s.tbPoints[0]+' - '+s.tbPoints[1]+' <small>TB</small>';const fmt=n=>n===0?'0':n===1?'15':n===2?'30':n===3?'40':n;
 if(s.points[0]>=3&&s.points[1]>=3){if(s.points[0]===s.points[1])return'듀스';return s.points[0]>s.points[1]?'AD - 40':'40 - AD'}return fmt(s.points[0])+' - '+fmt(s.points[1]);
}
function updateUI(){
 if(!state)return;const s=state;
 $('tnLeftName').textContent=s.sides[0].members.map(p=>p.flag+' '+p.name).join(' / ');$('tnRightName').textContent=s.sides[1].members.map(p=>p.flag+' '+p.name).join(' / ');
 $('tnLeftRank').textContent='OVR '+s.sides[0].rating+' · '+s.sides[0].styles;$('tnRightRank').textContent='OVR '+s.sides[1].rating+' · '+s.sides[1].styles;
 $('tnSetScore').textContent=s.sets[0]+' : '+s.sets[1];$('tnGameScore').textContent=s.games[0]+' : '+s.games[1]+(s.tiebreak?' · 타이브레이크':'');$('tnPointScore').innerHTML=scorePoint(s);
 $('tnServer').textContent=s.server===0?'●':'';$('tnServer2').textContent=s.server===1?'●';$('tnStaminaA').style.width=s.stamina[0]+'%';$('tnStaminaB').style.width=s.stamina[1]+'%';
 $('tnAceA').textContent='ACE '+s.aces[0];$('tnAceB').textContent='ACE '+s.aces[1];$('tnSetHistory').textContent=s.history.map((h,i)=>(i+1)+'세트 '+h.a+':'+h.b+(h.tb?' (TB '+h.tb+')':'')).join('   ')||'첫 세트';
 $('tnRoundLabel').textContent=tournament?tournament.roundLabel+' · '+(tournament.index+1)+'/'+tournament.pairs.length:'프로 매치';
}
function completeMatch(s,k){
 s.finished=true;s.winnerIndex=k;s.winner=s.sides[k].label;s.setScore=s.sets[0]+'-'+s.sets[1];s.score=s.setScore;s.phase='finished';active=false;MODE='tennis';S='TENNIS_RESULT';document.body.className='TENNIS_RESULT';
 $('tnWinner').textContent=s.sides[k].label;$('tnWinnerMeta').textContent=s.sides[k].members.map(p=>p.flag+' '+p.nation+' · 세계 '+p.rank+'위').join('  /  ');$('tnFinalScore').textContent=s.sets[0]+' : '+s.sets[1];
 $('tnResultTitle').textContent=tournament?'🏆 '+tournament.roundLabel+' 경기 우승!':'🏆 MATCH WINNER';$('tnResultDesc').textContent=s.sides[k].label+' 승리 · 에이스 '+s.aces[k]+'개 · 최장 랠리 '+s.longestRally+'구';
 $('tnNextMatch').style.display=tournament?'inline-flex':'none';$('tnAgain').textContent=tournament?'새 대회 만들기':'다시 경기하기';showEl($('tnResult'));try{sfx('fin');setTimeout(()=>sfx('fan'),450)}catch(e){}render();updateUI();
}
function nextMatch(){
 if(!tournament)return;tournament.winners.push(state.sides[state.winnerIndex]);tournament.results.push({winner:state.winner,score:state.setScore});
 if(tournament.index+1<tournament.pairs.length){tournament.index++;startTournamentMatch();return}
 if(tournament.roundSize===2){tournament.champion=tournament.winners[0];$('tnResultTitle').textContent='👑 TOURNAMENT CHAMPION';$('tnWinner').textContent=tournament.champion.label;$('tnWinnerMeta').textContent=tournament.champion.members.map(p=>p.flag+' '+p.nation).join(' / ');$('tnResultDesc').textContent=tournament.size+'팀 대회 우승! 총 '+tournament.results.length+'경기를 통과했다!';$('tnNextMatch').style.display='none';return}
 const winners=tournament.winners.slice();tournament.roundSize=winners.length;tournament.roundLabel=roundName(winners.length);tournament.pairs=[];for(let i=0;i<winners.length;i+=2)tournament.pairs.push([winners[i],winners[i+1]]);
 tournament.winners=[];tournament.index=0;tournament.results=[];startTournamentMatch();
}
function startTournamentMatch(){const sides=tournament.pairs[tournament.index],cfg=setting();state=buildState(sides,cfg);active=true;MODE='tennis';S='TENNIS_MATCH';document.body.className='TENNIS_MATCH';hideEl($('tnResult'));showEl($('tnMatch'));updateUI();log(tournament.roundLabel+' '+(tournament.index+1)+'번째 경기 · '+sides[0].label+' vs '+sides[1].label);try{sfx('big')}catch(e){}}
function update(dt){
 if(!active||!state||paused)return;const s=state;dt*=s.speed||1;
 if(s.phase==='countdown'){s.count-=dt;if(s.count<=0){s.phase='idle';s.nextIn=.65;log('경기 시작!')}return}
 if(s.rally){s.rally.elapsed+=dt;if(s.rally.elapsed>=s.rally.duration)finishPoint();return}
 if(s.phase==='idle'){s.nextIn-=dt;if(s.nextIn<=0)beginPoint()}
}
function drawAthlete(ctx,x,y,color,side,w){
 const scale=Math.max(.7,Math.min(1.45,w/1100)),t=performance.now()/260+(side?2:0);y+=Math.sin(t)*2*scale;ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 ctx.strokeStyle=color;ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(0,26);ctx.moveTo(0,0);ctx.lineTo(side?-23:23,13+Math.sin(t)*3);ctx.moveTo(0,0);ctx.lineTo(side?23:-23,-7);ctx.moveTo(0,26);ctx.lineTo(-13,49);ctx.moveTo(0,26);ctx.lineTo(14,48);ctx.stroke();
 ctx.fillStyle='#f4f7fb';ctx.beginPath();ctx.arc(0,-28,11,0,Math.PI*2);ctx.fill();ctx.fillStyle=color;ctx.fillRect(-9,-15,18,29);
 ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(side?23:-23,-7);ctx.lineTo(side?40:-40,-27);ctx.stroke();ctx.strokeStyle='#eaff62';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(side?42:-42,-31,8,13,Math.PI/5,0,Math.PI*2);ctx.stroke();ctx.restore();
}
function drawCourt(){
 const c=$('tnCourt');if(!c||!active&&S!=='TENNIS_RESULT')return;const rect=c.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2),w=Math.max(1,rect.width),h=Math.max(1,rect.height);
 if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)}
 const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);const pad=Math.min(w*.08,65),top=h*.11,bottom=h*.88,l=pad,r=w-pad,mid=(l+r)/2,baseW=r-l,s=state;
 x.fillStyle='#0a1725';x.fillRect(0,0,w,h);x.fillStyle=SURFACES[s?s.court:'hard'].color;x.shadowColor='#0009';x.shadowBlur=24;x.fillRect(l,top,baseW,bottom-top);x.shadowBlur=0;
 x.strokeStyle='rgba(255,255,255,.94)';x.lineWidth=Math.max(2,w*.002);x.strokeRect(l,top,baseW,bottom-top);x.beginPath();x.moveTo(mid,top);x.lineTo(mid,bottom);x.moveTo(l,top+(bottom-top)*.25);x.lineTo(r,top+(bottom-top)*.25);x.moveTo(l,bottom-(bottom-top)*.25);x.lineTo(r,bottom-(bottom-top)*.25);x.moveTo(l+(r-l)*.23,top);x.lineTo(l+(r-l)*.23,bottom);x.moveTo(r-(r-l)*.23,top);x.lineTo(r-(r-l)*.23,bottom);x.moveTo(mid,top+(bottom-top)*.25);x.lineTo(mid,bottom-(bottom-top)*.25);x.stroke();
 x.strokeStyle='#fff';x.lineWidth=4;x.beginPath();x.moveTo(mid,top-4);x.lineTo(mid,bottom+4);x.stroke();for(let yy=top;yy<bottom;yy+=9){x.strokeStyle='rgba(255,255,255,.45)';x.lineWidth=1;x.beginPath();x.moveTo(mid-3,yy);x.lineTo(mid+3,yy);x.stroke()}
 if(!s)return;const phase=s.rally?clamp(s.rally.elapsed/s.rally.duration,0,1):0,yA=top+(bottom-top)*.67,yB=top+(bottom-top)*.33,leftSide=s.swapped?1:0,rightSide=s.swapped?0:1;
 drawAthlete(x,l+(r-l)*.20,yA,s.sides[leftSide].color,0,w);drawAthlete(x,r-(r-l)*.20,yB,s.sides[rightSide].color,1,w);
 let bx=mid,by=(top+bottom)/2;
 if(s.rally){const from=s.rally.server===0?l+(r-l)*.20:r-(r-l)*.20,to=s.rally.server===0?r-(r-l)*.20:l+(r-l)*.20,e=phase*phase*(3-2*phase);bx=from+(to-from)*e;by=(top+bottom)/2-Math.sin(phase*Math.PI)*Math.min(95,h*.22);if(s.court==='grass')by+=Math.sin(phase*Math.PI)*12}
 else{bx=s.server===0?l+(r-l)*.20:r-(r-l)*.20;by=s.server===0?yA-25:yB+25}
 x.fillStyle='#eaff62';x.shadowColor='#eaff62';x.shadowBlur=18;x.beginPath();x.arc(bx,by,Math.max(5,w*.006),0,Math.PI*2);x.fill();x.shadowBlur=0;
 if(s.phase==='countdown'){x.fillStyle='#fff';x.font='900 '+Math.max(45,Math.min(100,w*.09))+'px Impact';x.textAlign='center';x.shadowColor='#000';x.shadowBlur=15;x.fillText(Math.max(1,Math.ceil(s.count)),mid,h*.53);x.shadowBlur=0}
}
function render(){if(!state)return;drawCourt()}
function speed(v){if(state)state.speed=+v||1}
function nextPoint(){if(!active||!state)return;if(state.rally)state.rally.elapsed=state.rally.duration;else state.nextIn=0}
function again(){tournament=null;preparedSettings=setting();preparedSides=makeTeams(preparedSettings);state={sides:preparedSides.slice(0,2),settings:preparedSettings};prepare()}
function back(){active=false;hide();go('TITLE')}
function hide(){active=false;const a=$('tennisApp');if(a)a.style.display='none'}
function open(){prepare()}
function generate(){preparedSettings=setting();preparedSides=makeTeams(preparedSettings);state={sides:preparedSettings.draw?[tournament.pairs[0][0],tournament.pairs[0][1]]:preparedSides.slice(0,2),settings:preparedSettings};renderPreview();$('tnRoundLabel').textContent=tournament?tournament.roundLabel+' 토너먼트':'친선 경기'}
function init(){
 $('bTennis').addEventListener('click',()=>{if(S!=='TITLE')return;aud();sfx('click');open()});
 $('tnDraw').addEventListener('click',()=>{aud();sfx('lock');generate()});$('tnStart').addEventListener('click',()=>{aud();sfx('click');if(!state||!state.sides)generate();start()});
 $('tnQr').addEventListener('click',()=>{if(typeof window.TM_openHost==='function')window.TM_openHost('single');else alert('예측 시스템을 준비하는 중이에요. 잠시 후 다시 눌러 주세요.')});
 $('tnBack').addEventListener('click',back);$('tnHome').addEventListener('click',back);$('tnExit').addEventListener('click',back);$('tnAgain').addEventListener('click',again);$('tnNextMatch').addEventListener('click',nextMatch);
 $('tnSpeed').addEventListener('change',e=>speed(e.target.value));$('tnNextPoint').addEventListener('click',nextPoint);$('tnPause').addEventListener('click',()=>$('pz').click());
 $('tnFormat').addEventListener('change',generate);$('tnDrawSize').addEventListener('change',generate);window.addEventListener('resize',render);
}
window.TennisGame={open:open,hide:hide,back:back,start:start,restart:()=>{if(active){const sides=state.sides,cfg=state.settings;state=buildState(sides,cfg);active=true;MODE='tennis';S='TENNIS_MATCH';document.body.className='TENNIS_MATCH';showEl($('tnMatch'));hideEl($('tnResult'));updateUI()}else start()},advance:nextMatch,update:update,render:render,score:()=>state?state.score:'',get settings(){return state&&state.settings},get tournament(){return tournament},get state(){return state}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();