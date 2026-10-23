(()=>{'use strict';const root=document.querySelector('.film-story'),stage=root.querySelector('.story-stage'),video=document.querySelector('#assembly-video'),back=document.querySelector('#story-backdrop'),play=document.querySelector('#story-play'),fit=document.querySelector('#story-fit'),full=document.querySelector('#hero-fullscreen'),reduce=matchMedia('(prefers-reduced-motion: reduce)'),chapters=[...root.querySelectorAll('.story-chapter')],buttons=[...root.querySelectorAll('[data-chapter]')];let motionConsent=false,paused=reduce.matches,visible=true,scrollInput=false,lastP=0,frame=0;const times=[0,6.57,8.97,12.17];
const mute=document.querySelector('#story-mute');
video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.autoplay=!reduce.matches;
function sync(){const t=video.currentTime,k=t>=times[3]?3:t>=times[2]?2:t>=times[1]?1:0;root.dataset.chapter=k;root.dataset.time=t.toFixed(2);chapters.forEach((c,i)=>{c.classList.toggle('is-active',i===k);c.setAttribute('aria-hidden',String(i!==k));c.inert=i!==k;});buttons.forEach((b,i)=>b.setAttribute('aria-current',String(i===k)));root.querySelector('.narrative-progress span').style.transform=`scaleX(${video.duration?t/video.duration:0})`;play.textContent=video.ended?'Replay ↻':paused?'Play story ▷':'Pause story Ⅱ';play.setAttribute('aria-pressed',String(paused));if(mute){mute.textContent=video.muted?'Unmute':'Mute';mute.setAttribute('aria-pressed',String(!video.muted));mute.setAttribute('aria-label',video.muted?'Unmute story audio':'Mute story audio');}}
function run(){if(!paused&&(!reduce.matches||motionConsent)&&visible){video.play().catch(e=>{if(e.name!=='AbortError'){paused=true;sync()}});back.play().catch(()=>{});}else{video.pause();back.pause();}}
function seek(t){if(video.readyState>=1){video.currentTime=Math.min(t,video.duration-.05);back.currentTime=Math.min(t,back.duration||t);}sync();}
video.addEventListener('loadeddata',()=>{root.classList.add('film-ready');run();sync()});video.addEventListener('timeupdate',()=>{if(Math.abs(back.currentTime-video.currentTime)>.2&&back.readyState>=1)back.currentTime=video.currentTime;sync()});video.addEventListener('ended',()=>{if(!video.loop){paused=true;back.pause();sync()}});video.addEventListener('error',()=>{root.dataset.mediaError='true';play.textContent='Film unavailable';play.disabled=true;});
play.onclick=()=>{motionConsent=true;if(video.ended)seek(0);paused=!paused;run();sync()};buttons.forEach((b,i)=>b.onclick=()=>{seek(times[i]+.03);run()});fit.onclick=()=>{const on=stage.classList.toggle('fit-frame');fit.setAttribute('aria-pressed',String(on));fit.textContent=on?'Fill screen':'Fit full frame'};addEventListener('keydown',e=>{if(e.key==='Escape'&&stage.classList.contains('cinema-full'))full.click()});
new IntersectionObserver(e=>{visible=e[0].isIntersecting;run()},{threshold:.05}).observe(root);addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();back.pause()}else run()});reduce.addEventListener('change',()=>{paused=reduce.matches;run();sync()});
addEventListener('wheel',()=>scrollInput=true,{passive:true});addEventListener('touchmove',()=>scrollInput=true,{passive:true});addEventListener('scroll',()=>{if(!scrollInput||stage.classList.contains('cinema-full')||reduce.matches)return;if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const p=Math.max(0,Math.min(1,-root.getBoundingClientRect().top/Math.max(1,root.offsetHeight-innerHeight)));if(Math.abs(lastP-p)>.012&&video.duration){lastP=p;seek(p*(video.duration-.1));run();}})},{passive:true});sync();

// Audio is enabled only by the visitor's explicit click, keeping muted autoplay eligible.
if(mute)mute.onclick=()=>{video.muted=!video.muted;if(!paused)run();sync()};
video.addEventListener('volumechange',sync);
function theater(on){stage.classList.toggle('cinema-full',on);document.body.classList.toggle('cinema-open',on);full.textContent=on?'Exit full screen ×':'Full screen ⛶';}
full.onclick=async()=>{
 if(document.fullscreenElement===stage){await document.exitFullscreen();return;}
 if(stage.classList.contains('cinema-full')){theater(false);return;}
 theater(true);
 if(stage.requestFullscreen){try{await stage.requestFullscreen()}catch{/* In-page full-viewport fallback remains available. */}}
};
document.addEventListener('fullscreenchange',()=>theater(document.fullscreenElement===stage));
// A deferred script may arrive after the media event, so initialise already-loaded video too.
if(video.readyState>=2){run();sync()}
})();
