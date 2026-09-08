/* B08 access to transcript controls near the floating pill. */
(function(){
 function reveal(e){
  const b=e.target.closest?.('.transcript button,.transcript a,.transcript summary');
  if(!b||b.closest('.working-card'))return;
  const tr=b.closest('.transcript'),bar=document.querySelector('.chat-float .activity-bar');if(!tr||!bar)return;
  const r=b.getBoundingClientRect(),f=bar.getBoundingClientRect();
  if(r.bottom>f.top-10&&r.top<f.bottom+10&&r.right>f.left&&r.left<f.right)
    tr.scrollTop+=r.bottom-f.top+14;
 }
 document.addEventListener('focusin',reveal);
 // Keyboard focus and product-navigation scrolls use the same clearance.
})();
