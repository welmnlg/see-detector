(()=>{"use strict";var e={},t={};function n(r){var o=t[r];if(void 0!==o)return o.exports;var i=t[r]={exports:{}};return e[r](i,i.exports,n),i.exports}n.rv=()=>"1.7.1",n.ruid="bundler=rspack@1.7.1";let r="tubedice-custom-btn",o="tubedice-custom-style";function i(){!function(){if(document.getElementById(o))return;let e=document.createElement("style");e.id=o,e.textContent=`
        #${r} {
            background-color: #f2f2f2 !important;
            color: #0f0f0f !important;
        }

        html[dark] #${r}, 
        html[theme="dark"] #${r},
        body[dark] #${r} {
            background-color: #272727 !important;
            color: #ffffff !important;
        }
    `,document.head.appendChild(e)}();let e=new URLSearchParams(window.location.search).get("list"),t=document.getElementById(r);if(!e){t&&t.remove();return}if(t)return;let n=document.querySelector("ytd-watch-metadata #top-level-buttons-computed");if(!n)return;let i=document.createElement("button");i.id=r,i.innerHTML='\uD83C\uDFB2 <span style="margin-left: 6px;">Tubedice</span>',Object.assign(i.style,{marginRight:"8px",padding:"0 16px",height:"36px",borderRadius:"18px",border:"none",outline:"none",cursor:"pointer",fontSize:"14px",fontWeight:"500",display:"inline-flex",alignItems:"center",justifyContent:"center",whiteSpace:"nowrap",flexShrink:"0"}),i.onclick=t=>{t.preventDefault(),window.open(`https://playlistshuffle.net/?ids=${e}`,"_blank")},n.prepend(i)}new MutationObserver(i).observe(document.body,{childList:!0,subtree:!0}),i()})();
//# sourceMappingURL=content-0.js.map