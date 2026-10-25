/* Review only. No external analytics, answers or result identifiers transmitted. */
window.REVIEW_EVENTS=[];
window.trackReview=function(name){const allowed=['page_view','test_start','test_complete','test_exit','telegram_click','offer_click'];if(!allowed.includes(name))return;window.REVIEW_EVENTS.push({event:name,page:location.pathname});};
document.addEventListener('DOMContentLoaded',()=>{
 trackReview('page_view');
 const keys=['utm_source','utm_medium','utm_campaign','utm_content'];const p=new URLSearchParams(location.search);const tags={};
 keys.forEach(k=>{const v=p.get(k);if(v&&/^[a-zA-Z0-9_.~-]{1,80}$/.test(v))tags[k]=v;});
 document.querySelectorAll('a[href]').forEach(a=>{const u=new URL(a.getAttribute('href'),location.href);if(u.origin===location.origin){Object.entries(tags).forEach(([k,v])=>u.searchParams.set(k,v));a.href=u.pathname+u.search+u.hash;}});
 document.addEventListener('click',e=>{const a=e.target.closest('a[data-event]');if(a)trackReview(a.dataset.event);});
});
