(function(){"use strict";if(document.getElementById("__nc_host__"))return;const l=new Map;let v=[],b=null,k="",f=!1,x="request";const h=document.createElement("div");h.id="__nc_host__",h.style.cssText='all:initial;position:fixed;z-index:2147483647;bottom:20px;right:20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,Roboto,"Helvetica Neue",Arial,sans-serif;font-size:13px;line-height:1.5;-webkit-font-smoothing:antialiased;',document.documentElement.appendChild(h);const m=h.attachShadow({mode:"open"});chrome.storage.local.get({netreplay_enabled:!0},({netreplay_enabled:e})=>{h.style.display=e?"":"none"}),chrome.storage.onChanged.addListener(e=>{if("netreplay_enabled"in e){const o=e.netreplay_enabled.newValue;if(h.style.display=o?"":"none",!o&&f){f=!1;const t=m.querySelector("#panel");t&&t.classList.remove("open")}}});const w=document.createElement("style");w.textContent=`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :host {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 13px; line-height: 1.5; color: #e2e8f0;
      -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
    }

    #btn {
      width: 48px; height: 48px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none; cursor: pointer; display: flex; align-items: center;
      justify-content: center; box-shadow: 0 4px 15px rgba(99,102,241,.5);
      transition: transform .15s, box-shadow .15s; position: relative;
    }
    #btn:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(99,102,241,.7); }
    #btn svg { width: 22px; height: 22px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    #badge {
      position: absolute; top: -4px; right: -4px;
      background: #ef4444; color: #fff; font-size: 10px; font-weight: 700;
      min-width: 18px; height: 18px; border-radius: 9px; padding: 0 4px;
      display: none; align-items: center; justify-content: center;
    }
    #badge.show { display: flex; }

    #panel {
      position: fixed; right: 20px; bottom: 80px;
      width: 720px; height: 600px; max-height: calc(100vh - 100px);
      background: #0f172a; border: 1px solid #334155;
      border-radius: 12px; display: none; flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,.6); overflow: hidden;
    }
    #panel.open { display: flex; }

    /* Header */
    #header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; background: #1e293b; border-bottom: 1px solid #334155;
      flex-shrink: 0;
    }
    #header h1 { font-size: 14px; font-weight: 700; color: #a78bfa; flex: 1; letter-spacing: .3px; display: flex; align-items: center; gap: 7px; }
    #header h1 svg { width: 18px; height: 18px; flex-shrink: 0; fill: none; stroke: #a78bfa; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    #count { font-size: 12px; color: #64748b; }
    #btn-clear, #btn-close {
      background: none; border: none; cursor: pointer; color: #64748b;
      padding: 3px 8px; border-radius: 4px; font-size: 12px; font-family: inherit;
      transition: color .1s, background .1s;
    }
    #btn-clear:hover { color: #fbbf24; background: #1e293b; }
    #btn-close:hover { color: #ef4444; background: #1e293b; }

    /* Filter */
    #filter-row { padding: 8px 10px; border-bottom: 1px solid #1e293b; flex-shrink: 0; }
    #filter-input {
      width: 100%; padding: 6px 10px; background: #1e293b; border: 1px solid #334155;
      border-radius: 6px; color: #e2e8f0; font-family: inherit; font-size: 13px; outline: none;
    }
    #filter-input::placeholder { color: #475569; }
    #filter-input:focus { border-color: #6366f1; }

    /* Body split */
    #body { display: flex; flex: 1; overflow: hidden; }

    /* Request list */
    #list {
      width: 280px; flex-shrink: 0; overflow-y: auto; border-right: 1px solid #1e293b;
      background: #0f172a;
    }
    #list::-webkit-scrollbar { width: 4px; }
    #list::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

    .req-item {
      display: flex; align-items: center; gap: 7px; padding: 7px 10px;
      cursor: pointer; border-bottom: 1px solid #1a2540; transition: background .1s;
      min-width: 0;
    }
    .req-item:hover { background: #1e293b; }
    .req-item.selected { background: #1e3a5f; }

    .method {
      font-size: 9px; font-weight: 800; padding: 2px 5px; border-radius: 3px;
      flex-shrink: 0; letter-spacing: .5px; text-transform: uppercase;
    }
    .method.GET    { background: #166534; color: #86efac; }
    .method.POST   { background: #1e3a8a; color: #93c5fd; }
    .method.PUT    { background: #92400e; color: #fde68a; }
    .method.PATCH  { background: #3b0764; color: #e9d5ff; }
    .method.DELETE { background: #7f1d1d; color: #fca5a5; }
    .method.OTHER  { background: #374151; color: #9ca3af; }

    .req-url {
      flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      color: #94a3b8; font-size: 12px; font-family: ui-monospace, 'Cascadia Code', 'Cascadia Mono', 'Consolas', 'Menlo', 'Monaco', 'Lucida Console', monospace;
    }
    .req-status {
      font-size: 11px; font-weight: 700; flex-shrink: 0; width: 34px; text-align: right;
    }
    .status-ok  { color: #4ade80; }
    .status-3xx { color: #fbbf24; }
    .status-4xx { color: #f87171; }
    .status-5xx { color: #f87171; }
    .status-err { color: #94a3b8; }
    .pending-dot { width: 7px; height: 7px; border-radius: 50%; background: #6366f1;
                   animation: pulse 1s infinite; flex-shrink: 0; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

    /* Detail pane */
    #detail { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #0d1b2e; }
    #detail-empty {
      flex: 1; display: flex; align-items: center; justify-content: center;
      color: #334155; font-size: 13px;
    }

    #detail-content { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }

    #detail-url {
      padding: 10px 14px 8px; border-bottom: 1px solid #1e293b;
      color: #cbd5e1; font-size: 12.5px; line-height: 1.6;
      font-family: ui-monospace, 'Cascadia Code', 'Cascadia Mono', 'Consolas', 'Menlo', 'Monaco', 'Lucida Console', monospace;
      word-break: break-all; flex-shrink: 0; max-height: 100px; overflow-y: auto;
    }
    #detail-url::-webkit-scrollbar { width: 4px; }
    #detail-url::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
    #detail-url .method-big {
      display: inline-block; margin-bottom: 4px; font-size: 11px; font-weight: 800;
      padding: 2px 8px; border-radius: 4px;
    }

    #tabs { display: flex; border-bottom: 1px solid #1e293b; flex-shrink: 0; }
    .tab {
      padding: 8px 16px; cursor: pointer; font-size: 12px; font-weight: 600;
      color: #64748b; border-bottom: 2px solid transparent; transition: color .1s;
    }
    .tab.active { color: #a78bfa; border-bottom-color: #a78bfa; }
    .tab:hover:not(.active) { color: #94a3b8; }

    #replay-bar {
      padding: 8px 14px; border-bottom: 1px solid #1e293b; flex-shrink: 0;
    }
    #btn-replay {
      padding: 5px 16px; background: #6366f1; border: none; border-radius: 6px;
      color: #fff; font-size: 12px; font-weight: 600; cursor: pointer;
      transition: background .15s; font-family: inherit;
    }
    #btn-replay:hover { background: #4f46e5; }
    #btn-replay:disabled { background: #334155; color: #64748b; cursor: not-allowed; }
    #replay-status { display: inline-block; margin-left: 10px; font-size: 12px; color: #94a3b8; }
    #btn-download {
      padding: 5px 16px; background: #0f4c2a; border: 1px solid #166534; border-radius: 6px;
      color: #4ade80; font-size: 12px; font-weight: 600; cursor: pointer;
      transition: background .15s; font-family: inherit; margin-left: 8px;
    }
    #btn-download:hover { background: #166534; }

    #curl-bar {
      padding: 6px 14px 8px; border-bottom: 1px solid #1e293b; flex-shrink: 0;
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    }
    .btn-curl {
      padding: 4px 12px; background: #1a2540; border: 1px solid #334155; border-radius: 6px;
      color: #94a3b8; font-size: 11px; font-weight: 600; cursor: pointer;
      transition: background .15s, color .15s, border-color .15s; font-family: inherit;
      display: inline-flex; align-items: center; gap: 5px;
    }
    .btn-curl:hover { background: #1e3a5f; border-color: #6366f1; color: #c4b5fd; }
    .btn-curl.copied { background: #1a3a2a; border-color: #166534; color: #4ade80; }
    #curl-status { font-size: 11px; color: #64748b; margin-left: 2px; }

    #tab-content { flex: 1; min-height: 0; overflow-y: auto; padding: 10px 14px; }
    #tab-content::-webkit-scrollbar { width: 4px; }
    #tab-content::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

    .section-title {
      font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase;
      letter-spacing: 1px; margin: 12px 0 5px;
    }
    .section-title:first-child { margin-top: 0; }

    .kv-table { width: 100%; border-collapse: collapse; }
    .kv-table td { padding: 4px 8px; vertical-align: top; font-size: 12px; line-height: 1.6; font-family: ui-monospace, 'Cascadia Code', 'Cascadia Mono', 'Consolas', 'Menlo', 'Monaco', 'Lucida Console', monospace; }
    .kv-table td:first-child { color: #64748b; width: 40%; word-break: break-all; }
    .kv-table td:last-child  { color: #cbd5e1; word-break: break-all; }
    .kv-table tr:hover td { background: #1e293b; }

    .body-block {
      background: #1e293b; border: 1px solid #334155; border-radius: 6px;
      padding: 12px 14px; color: #a5f3fc; font-size: 12.5px; line-height: 1.65;
      font-family: ui-monospace, 'Cascadia Code', 'Cascadia Mono', 'Consolas', 'Menlo', 'Monaco', 'Lucida Console', monospace;
      white-space: pre-wrap; word-break: break-all; max-height: 220px; overflow-y: auto;
    }
    .body-block.error { color: #fca5a5; }
    .body-block.json  { color: #86efac; }

    .no-data { color: #475569; font-style: italic; font-size: 12px; padding: 4px 0; }
    .duration { color: #64748b; font-size: 11px; margin-left: 8px; }

    /* Footer */
    #footer {
      padding: 8px 14px; border-top: 1px solid #1e293b; background: #0a1120;
      flex-shrink: 0; text-align: center;
    }
    #footer p { font-size: 11px; color: #475569; line-height: 1.5; }
    #footer a { color: #6366f1; text-decoration: none; margin: 0 3px; }
    #footer a:hover { color: #a78bfa; text-decoration: underline; }
  `,m.appendChild(w),m.innerHTML+=`
    <div id="panel" role="dialog" aria-label="NetReplay">
      <div id="header">
        <h1>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M2 12h3M19 12h3M12 2v3M12 19v3"/><path d="M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1"/></svg>
          NetReplay
        </h1>
        <span id="count">0 requests</span>
        <button id="btn-clear" title="Clear all">Clear</button>
        <button id="btn-close" title="Close">\u2715</button>
      </div>
      <div id="filter-row">
        <input id="filter-input" placeholder="Filter by URL or method\u2026" spellcheck="false" />
      </div>
      <div id="body">
        <div id="list"></div>
        <div id="detail">
          <div id="detail-empty">Select a request to inspect</div>
        </div>
      </div>
      <footer id="footer">
        <p>
          Developed by Russel Sese &nbsp;\xB7&nbsp;
          <a href="https://www.linkedin.com/in/russelsese/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          &nbsp;\xB7&nbsp;
          <a href="mailto:russel.sese@batchee.com">russel.sese@batchee.com</a>
        </p>
      </footer>
    </div>
    <button id="btn" title="NetReplay">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M2 12h3M19 12h3M12 2v3M12 19v3"/><path d="M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1"/></svg>
      <span id="badge">0</span>
    </button>
  `;const p=e=>m.querySelector(e),R=p("#btn"),C=p("#badge"),q=p("#panel"),L=p("#list"),c=p("#detail"),H=p("#count"),$=p("#filter-input"),D=p("#btn-clear"),j=p("#btn-close");function M(e){return["GET","POST","PUT","PATCH","DELETE"].includes(e)?e:"OTHER"}function T(e){return e?e<300?"status-ok":e<400?"status-3xx":e<500?"status-4xx":"status-5xx":"status-err"}function _(e){if(!e)return null;try{return{text:JSON.stringify(JSON.parse(e),null,2),cls:"json"}}catch{return{text:e,cls:""}}}function E(e){const o=Object.entries(e||{});return o.length?`<table class="kv-table">${o.map(([t,n])=>`<tr><td>${u(t)}</td><td>${u(n)}</td></tr>`).join("")}</table>`:'<span class="no-data">none</span>'}function u(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function O(e){try{const o=new URL(e);return o.pathname+(o.search.length>30?o.search.slice(0,30)+"\u2026":o.search)}catch{return e.slice(0,60)}}function g(){const e=k.toLowerCase(),o=v.filter(t=>{const n=l.get(t);return!e||n.url.toLowerCase().includes(e)||n.method.toLowerCase().includes(e)});H.textContent=`${l.size} request${l.size!==1?"s":""}`,C.textContent=l.size,C.classList.toggle("show",l.size>0),L.innerHTML=o.length===0?'<div style="padding:16px;color:#334155;font-size:11px;">No requests yet</div>':o.map(t=>{const n=l.get(t),a=t===b?" selected":"",r=n.pending?'<span class="pending-dot"></span>':`<span class="req-status ${T(n.status)}">${n.status||"\u2014"}</span>`;return`<div class="req-item${a}" data-id="${t}">
            <span class="method ${M(n.method)}">${n.method}</span>
            <span class="req-url" title="${u(n.url)}">${u(O(n.url))}</span>
            ${r}
          </div>`}).join(""),L.querySelectorAll(".req-item").forEach(t=>{t.addEventListener("click",()=>F(t.dataset.id))})}function y(){if(!b||!l.has(b)){c.innerHTML='<div id="detail-empty">Select a request to inspect</div>';return}const e=l.get(b),o=e.duration!=null?`<span class="duration">${e.duration}ms</span>`:"";c.innerHTML=`
      <div id="detail-content">
        <div id="detail-url">
          <span class="method-big method ${M(e.method)}">${e.method}</span>${o}<br>
          ${u(e.url)}
        </div>
        <div id="tabs">
          <div class="tab ${x==="request"?"active":""}" data-tab="request">Request</div>
          <div class="tab ${x==="response"?"active":""}" data-tab="response">Response</div>
        </div>
        <div id="replay-bar">
          <button id="btn-replay">\u25B6 Replay</button>
          <button id="btn-download">\u2193 Download</button>
          <span id="replay-status"></span>
        </div>
        <div id="curl-bar">
          <button class="btn-curl" id="btn-curl-bash"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>Copy as cURL (bash)</button>
          <button class="btn-curl" id="btn-curl-cmd"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>Copy as cURL (cmd)</button>
          <span id="curl-status"></span>
        </div>
        <div id="tab-content"></div>
      </div>`,c.querySelectorAll(".tab").forEach(d=>{d.addEventListener("click",()=>{x=d.dataset.tab,y()})});const t=c.querySelector("#btn-replay"),n=c.querySelector("#replay-status"),a=c.querySelector("#btn-download"),r=c.querySelector("#btn-curl-bash"),s=c.querySelector("#btn-curl-cmd"),i=c.querySelector("#curl-status");t.addEventListener("click",()=>I(e,t,n)),a.addEventListener("click",()=>A(e)),r.addEventListener("click",()=>z(e,"bash",r,i)),s.addEventListener("click",()=>z(e,"cmd",s,i)),U(e)}function U(e){const o=c.querySelector("#tab-content");if(o)if(x==="request"){const t=_(e.requestBody);o.innerHTML=`
        <div class="section-title">Request Headers</div>
        ${E(e.requestHeaders)}
        <div class="section-title">Body</div>
        ${t?`<div class="body-block ${t.cls}">${u(t.text)}</div>`:'<span class="no-data">none</span>'}
      `}else{if(!e._replayData&&!e.status){o.innerHTML='<span class="no-data">Request is still pending\u2026</span>';return}const t=e._replayData,n=t?t.status:e.status,a=t?t.statusText:e.statusText,r=t?t.headers:e.responseHeaders,s=t?t.body:e.responseBody,i=t?t.error:null,d=_(s),B=!t&&s===null?'<span class="no-data">Binary or oversized \u2014 hit Replay to fetch manually.</span>':null;o.innerHTML=`
        <div class="section-title">Status</div>
        <span class="req-status ${T(n)}" style="font-size:13px">${n} ${u(a||"")}</span>
        <div class="section-title">Response Headers</div>
        ${E(r)}
        <div class="section-title">Body${t?"":' <span style="color:#475569;font-weight:400">(intercepted)</span>'}</div>
        ${i?`<div class="body-block error">${u(i)}</div>`:B||(d?`<div class="body-block ${d.cls}">${u(d.text)}</div>`:'<span class="no-data">empty</span>')}
      `}}function N(e,o){const t=o==="bash",n=t?` \\
`:` ^
`,a="  ";function r(i){const d=String(i);return t?"'"+d.replace(/'/g,"'\\''")+"'":'"'+d.replace(/\\/g,"\\\\").replace(/"/g,'\\"')+'"'}const s=[`curl ${r(e.url)}`];e.method&&e.method!=="GET"&&e.method!=="HEAD"&&s.push(`${a}-X ${e.method}`);for(const[i,d]of Object.entries(e.requestHeaders||{}))s.push(`${a}-H ${r(i+": "+d)}`);return e.requestBody&&!["GET","HEAD"].includes(e.method)&&s.push(`${a}--data-raw ${r(e.requestBody)}`),s.join(n)}async function z(e,o,t,n){const a=N(e,o);await navigator.clipboard.writeText(a),t.classList.add("copied"),n.textContent="Copied!",setTimeout(()=>{t.classList.remove("copied"),n.textContent=""},2e3)}function A(e){let o="unknown";try{o=new URL(e.url).hostname.replace(/[^a-z0-9.-]/gi,"_")}catch{}const t=new Date().toISOString().replace(/[:.]/g,"-").replace("T","_").slice(0,19),n=`network-capture-${o}-${t}.json`,a={captured_at:new Date().toISOString(),request:{method:e.method,url:e.url,headers:e.requestHeaders,body:e.requestBody},response:e._replayData?{source:"replay",status:e._replayData.status,statusText:e._replayData.statusText,headers:e._replayData.headers,body:S(e._replayData.body)}:e.status?{source:"intercepted",status:e.status,statusText:e.statusText,headers:e.responseHeaders,body:S(e.responseBody)}:null,meta:{type:e.type,duration:e.duration,timestamp:e.timestamp,error:e.error}},r=new Blob([JSON.stringify(a,null,2)],{type:"application/json"}),s=URL.createObjectURL(r),i=document.createElement("a");i.href=s,i.download=n,i.click(),URL.revokeObjectURL(s)}function S(e){if(!e)return e;try{return JSON.parse(e)}catch{return e}}async function I(e,o,t){o.disabled=!0,t.textContent="Sending\u2026",x="response";try{const n=await fetch(e.url,{method:e.method,headers:e.requestHeaders,body:["GET","HEAD"].includes(e.method)?void 0:e.requestBody||void 0,credentials:"include"}),a={};n.headers.forEach((s,i)=>{a[i]=s});let r="";try{r=await n.text()}catch{}l.get(e.id)._replayData={status:n.status,statusText:n.statusText,headers:a,body:r,error:null},t.textContent=`\u2713 ${n.status}`}catch(n){l.get(e.id)._replayData={status:null,statusText:null,headers:{},body:null,error:n.message},t.textContent="\u2717 Error"}finally{o.disabled=!1,y()}}function F(e){b=e,x="request",g(),y()}window.addEventListener("__net_capture__",e=>{const o=e.detail;if(o.type==="fetch_body"){const n=l.get(o.id);n&&(n.responseBody=o.responseBody,o.id===b&&y());return}const t=l.get(o.id);t?Object.assign(t,o):(l.set(o.id,{...o,_replayData:null,responseBody:o.responseBody??null}),v.push(o.id)),g(),o.id===b&&y()}),R.addEventListener("click",()=>{f=!f,q.classList.toggle("open",f),f&&g()}),j.addEventListener("click",()=>{f=!1,q.classList.remove("open")}),D.addEventListener("click",()=>{l.clear(),v=[],b=null,g(),y()}),$.addEventListener("input",()=>{k=$.value,g()}),g()})();
