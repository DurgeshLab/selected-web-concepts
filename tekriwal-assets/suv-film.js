(()=>{'use strict';
const root=document.querySelector('.suv-film'),stage=root.querySelector('.suv-film-stage'),v=document.querySelector('#suv-film-video'),play=document.querySelector('#suv-play'),fit=document.querySelector('#suv-fit'),full=document.querySelector('#suv-full'),reduce=matchMedia('(prefers-reduced-motion: reduce)'),buttons=[...root.querySelectorAll('[data-film-chapter]')],times=[0,7,15],copy=[['01 / THE DEPARTURE','There’s more<br>out there.','The road ahead starts with a little curiosity.'],['02 / THE JOURNEY','Take the<br>long way.','From a familiar road to a new perspective.'],['03 / YOUR NEXT CHAPTER','Find your<br>starting point.','Explore the real range. Ask about your exact variant.']];
let paused=reduce.matches,consent=false,visible=true,last=-1,scrollInput=false,frame=0,lastProgress=-1;
const mute=document.querySelector('#suv-mute');
v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.autoplay=!reduce.matches;
function sync(){const t=v.currentTime,k=t>=times[2]?2:t>=times[1]?1:0;if(k!==last){last=k;document.querySelector('#suv-chapter-label').textContent=copy[k][0];document.querySelector('#suv-film-heading').innerHTML=copy[k][1];document.querySelector('#suv-film-description').textContent=copy[k][2];buttons.forEach((b,i)=>b.setAttribute('aria-current',String(i===k)));}play.textContent=v.ended?'Replay ↻':paused?'Play story ▷':'Pause story Ⅱ';play.setAttribute('aria-pressed',String(paused));if(mute){mute.textContent=v.muted?'Unmute':'Mute';mute.setAttribute('aria-pressed',String(!v.muted));mute.setAttribute('aria-label',v.muted?'Unmute story audio':'Mute story audio');}root.querySelector('.suv-film-progress span').style.transform=`scaleX(${v.duration?t/v.duration:0})`;}
function run(){if(!paused&&(!reduce.matches||consent)&&visible){v.play().catch(e=>{if(e.name!=='AbortError'){paused=true;sync()}});}else v.pause();}
function seek(t){if(v.readyState>=1)v.currentTime=Math.min(t,v.duration-.05);sync();}
play.onclick=()=>{consent=true;if(v.ended)seek(0);paused=!paused;run();sync()};buttons.forEach((b,i)=>b.onclick=()=>{seek(times[i]+.03);run()});fit.onclick=()=>{const on=stage.classList.toggle('fit-frame');fit.textContent=on?'Fill screen':'Fit full frame';fit.setAttribute('aria-pressed',String(on));};addEventListener('keydown',e=>{if(e.key==='Escape'&&stage.classList.contains('cinema-full'))full.click()});
v.addEventListener('loadeddata',()=>{run();sync()});v.addEventListener('timeupdate',sync);v.addEventListener('ended',()=>{if(!v.loop){paused=true;sync()}});v.addEventListener('error',()=>{play.textContent='Film unavailable';play.disabled=true;});new IntersectionObserver(e=>{visible=e[0].isIntersecting;run()},{threshold:.05}).observe(root);addEventListener('visibilitychange',()=>{if(document.hidden)v.pause();else run()});reduce.addEventListener('change',()=>{paused=reduce.matches;run();sync()});addEventListener('wheel',()=>scrollInput=true,{passive:true});addEventListener('touchmove',()=>scrollInput=true,{passive:true});addEventListener('scroll',()=>{if(!scrollInput||reduce.matches||stage.classList.contains('cinema-full')||frame)return;frame=requestAnimationFrame(()=>{frame=0;const p=Math.max(0,Math.min(1,-root.getBoundingClientRect().top/Math.max(1,root.offsetHeight-innerHeight)));if(v.duration&&Math.abs(p-lastProgress)>.012){lastProgress=p;seek(p*(v.duration-.1));run();}})},{passive:true});sync();

// Audio is enabled only by the visitor's explicit click, keeping muted autoplay eligible.
if(mute)mute.onclick=()=>{v.muted=!v.muted;if(!paused)run();sync()};
v.addEventListener('volumechange',sync);
function theater(on){stage.classList.toggle('cinema-full',on);document.body.classList.toggle('suv-cinema-open',on);full.textContent=on?'Exit full screen ×':'Full screen ⛶';}
full.onclick=async()=>{
 if(document.fullscreenElement===stage){await document.exitFullscreen();return;}
 if(stage.classList.contains('cinema-full')){theater(false);return;}
 theater(true);
 if(stage.requestFullscreen){try{await stage.requestFullscreen()}catch{/* In-page full-viewport fallback remains available. */}}
};
document.addEventListener('fullscreenchange',()=>theater(document.fullscreenElement===stage));
// A deferred script may arrive after the media event, so initialise already-loaded video too.
if(v.readyState>=2){run();sync()}
})();
