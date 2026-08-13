(function(){"use strict";const m={URL_SUGGESTION:"url-suggestion",SEARCH_QUERY:"search-query",AUTOCOMPLETE_SUGGESTION:"autocomplete-suggestion",OPEN_TAB:"open-tab",PINNED_TAB:"pinned-tab",BOOKMARK:"bookmark",HISTORY:"history",TOP_SITE:"top-site"},f={CURRENT_TAB:"current-tab",NEW_TAB:"new-tab"},H={"google.com":"Google","bing.com":"Bing","duckduckgo.com":"DuckDuckGo","yahoo.com":"Yahoo","chatgpt.com":"ChatGPT","openai.com":"OpenAI","anthropic.com":"Anthropic","claude.ai":"Claude","copilot.microsoft.com":"Copilot","bard.google.com":"Bard","perplexity.ai":"Perplexity","facebook.com":"Facebook","meta.com":"Meta","twitter.com":"Twitter","x.com":"X","linkedin.com":"LinkedIn","instagram.com":"Instagram","tiktok.com":"TikTok","snapchat.com":"Snapchat","pinterest.com":"Pinterest","tumblr.com":"Tumblr","reddit.com":"Reddit","discord.com":"Discord","telegram.org":"Telegram","whatsapp.com":"WhatsApp","signal.org":"Signal","github.com":"GitHub","gitlab.com":"GitLab","bitbucket.org":"Bitbucket","stackoverflow.com":"Stack Overflow","stackexchange.com":"Stack Exchange","codepen.io":"CodePen","jsfiddle.net":"JSFiddle","codesandbox.io":"CodeSandbox","replit.com":"Replit","vercel.com":"Vercel","netlify.com":"Netlify","heroku.com":"Heroku","aws.amazon.com":"AWS","cloud.google.com":"Google Cloud","azure.microsoft.com":"Azure","digitalocean.com":"DigitalOcean","youtube.com":"YouTube","netflix.com":"Netflix","hulu.com":"Hulu","disneyplus.com":"Disney+","primevideo.com":"Prime Video","hbomax.com":"HBO Max","twitch.tv":"Twitch","vimeo.com":"Vimeo","dailymotion.com":"Dailymotion","tiktok.com":"TikTok","spotify.com":"Spotify","apple.com/music":"Apple Music","music.youtube.com":"YouTube Music","soundcloud.com":"SoundCloud","pandora.com":"Pandora","amazon.com":"Amazon","ebay.com":"eBay","etsy.com":"Etsy","walmart.com":"Walmart","target.com":"Target","bestbuy.com":"Best Buy","costco.com":"Costco","alibaba.com":"Alibaba","aliexpress.com":"AliExpress","shopify.com":"Shopify","squarespace.com":"Squarespace","wix.com":"Wix","wordpress.com":"WordPress","cnn.com":"CNN","bbc.com":"BBC","nytimes.com":"New York Times","washingtonpost.com":"Washington Post","theguardian.com":"The Guardian","reuters.com":"Reuters","ap.org":"Associated Press","npr.org":"NPR","foxnews.com":"Fox News","msnbc.com":"MSNBC","bloomberg.com":"Bloomberg","wsj.com":"Wall Street Journal","economist.com":"The Economist","techcrunch.com":"TechCrunch","theverge.com":"The Verge","ars-technica.com":"Ars Technica","microsoft.com":"Microsoft","apple.com":"Apple","adobe.com":"Adobe","salesforce.com":"Salesforce","atlassian.com":"Atlassian","slack.com":"Slack","zoom.us":"Zoom","teams.microsoft.com":"Microsoft Teams","meet.google.com":"Google Meet","notion.so":"Notion","airtable.com":"Airtable","trello.com":"Trello","asana.com":"Asana","monday.com":"Monday.com","dropbox.com":"Dropbox","box.com":"Box","onedrive.live.com":"OneDrive","drive.google.com":"Google Drive","figma.com":"Figma","sketch.com":"Sketch","canva.com":"Canva","behance.net":"Behance","dribbble.com":"Dribbble","unsplash.com":"Unsplash","pexels.com":"Pexels","shutterstock.com":"Shutterstock","gettyimages.com":"Getty Images","paypal.com":"PayPal","venmo.com":"Venmo","stripe.com":"Stripe","square.com":"Square","coinbase.com":"Coinbase","binance.com":"Binance","robinhood.com":"Robinhood","etrade.com":"E*TRADE","fidelity.com":"Fidelity","schwab.com":"Charles Schwab","expedia.com":"Expedia","booking.com":"Booking.com","airbnb.com":"Airbnb","uber.com":"Uber","lyft.com":"Lyft","maps.google.com":"Google Maps","waze.com":"Waze","tripadvisor.com":"TripAdvisor","kayak.com":"Kayak","priceline.com":"Priceline","coursera.org":"Coursera","udemy.com":"Udemy","edx.org":"edX","khanacademy.org":"Khan Academy","duolingo.com":"Duolingo","skillshare.com":"Skillshare","masterclass.com":"MasterClass","pluralsight.com":"Pluralsight","linkedin.com/learning":"LinkedIn Learning","gmail.com":"Gmail","outlook.com":"Outlook","mail.yahoo.com":"Yahoo Mail","protonmail.com":"ProtonMail","tutanota.com":"Tutanota","wikipedia.org":"Wikipedia","wikimedia.org":"Wikimedia","archive.org":"Internet Archive","dictionary.com":"Dictionary.com","merriam-webster.com":"Merriam-Webster","translate.google.com":"Google Translate","deepl.com":"DeepL","steam.com":"Steam","epicgames.com":"Epic Games","battle.net":"Battle.net","xbox.com":"Xbox","playstation.com":"PlayStation","nintendo.com":"Nintendo","roblox.com":"Roblox","minecraft.net":"Minecraft","webmd.com":"WebMD","mayoclinic.org":"Mayo Clinic","healthline.com":"Healthline","fitbit.com":"Fitbit","myfitnesspal.com":"MyFitnessPal","strava.com":"Strava"};Object.entries(H).map(([a,e])=>({domain:a,displayName:e,domainShort:a.split(".")[0]}));let A=!1,N=!1,C=null;async function M(){if(!N)return C||(C=(async()=>{try{A=(await chrome.storage.sync.get({debugLoggingEnabled:!1})).debugLoggingEnabled||!1,chrome.storage.onChanged.addListener((e,t)=>{t==="sync"&&e.debugLoggingEnabled&&(A=e.debugLoggingEnabled.newValue||!1)}),N=!0}catch(a){console.error("[Logger] Failed to initialize:",a),A=!1,N=!0}})(),C)}function T(){return N?A:(typeof chrome<"u"&&chrome.storage&&!C&&M(),!1)}const s={log:function(...a){T()&&console.log(...a)},error:function(...a){T()&&console.error(...a)},warn:function(...a){T()&&console.warn(...a)},info:function(...a){T()&&console.info(...a)},debug:function(...a){T()&&console.debug(...a)},initialize:M};typeof chrome<"u"&&chrome.storage&&M();class q{constructor(){}extractWebsiteName(e){try{const t=this.normalizeHostname(e);if(!t)return e;const o=this.getCuratedName(t);return o||this.parseHostnameToName(t)}catch(t){return s.error("[WebsiteNameExtractor] Error extracting name:",t),this.parseHostnameToName(this.normalizeHostname(e))||e}}normalizeHostname(e){try{const t=/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(e)?e:`https://${e}`;let r=new URL(t).hostname.toLowerCase();return r.startsWith("www.")&&(r=r.substring(4)),r}catch{const t=e.match(/(?:https?:\/\/)?(?:www\.)?([^\/\?#]+)/);return t?t[1].toLowerCase():e}}getCuratedName(e){return H[e]||null}parseHostnameToName(e){if(!e)return null;try{let t=e.replace(/^(www|m|mobile|app|api|cdn|static)\./,"");if(t=t.replace(/\.(com|org|net|edu|gov|mil|int|co|io|ly|me|tv|app|dev|ai)$/,""),t.includes(".")){const o=t.split(".");t=o[o.length-1]}return t.charAt(0).toUpperCase()+t.slice(1)}catch{return e}}}const V=new q,P={INSTANT_SEARCH_QUERY:1e3,INSTANT_URL_SUGGESTION:1e3};function j(a,e="16"){const t=new URL(chrome.runtime.getURL("/_favicon/"));return t.searchParams.set("pageUrl",a),t.searchParams.set("size",e),t.toString()}async function Y(){const a={enableSpotlight:!0,colorOverrides:null,debugLoggingEnabled:!1};return await chrome.storage.sync.get(a)}const z={getFaviconUrl:j,getSettings:Y};class l{static normalizeURL(e){return/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(e)?e:`https://${e}`}static isURL(e){try{return new URL(e),!0}catch{}return/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/.test(e)||e==="localhost"||e.startsWith("localhost:")?!0:/^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(e)?e.split(":")[0].split(".").every(r=>{const n=parseInt(r,10);return n>=0&&n<=255}):!!/^[a-zA-Z0-9-]+\.(com|org|net|edu|gov|mil|int|co|io|ly|me|tv|app|dev|ai)([/\?#].*)?$/.test(e)}static generateInstantSuggestion(e){const t=e.trim();if(!t)return null;if(l.isURL(t)){const o=l.normalizeURL(t),r=l.extractWebsiteName(o);return{type:m.URL_SUGGESTION,title:r,url:o,score:P.INSTANT_URL_SUGGESTION,metadata:{originalInput:t},domain:"",favicon:null}}else return{type:m.SEARCH_QUERY,title:`Search for "${t}"`,url:"",score:P.INSTANT_SEARCH_QUERY,metadata:{query:t},domain:"",favicon:null}}static escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}static extractWebsiteName(e){try{return V.extractWebsiteName(e)}catch(t){s.error("[SpotlightUtils] Error extracting website name:",t);try{const o=l.normalizeURL(e);let n=new URL(o).hostname;return n.startsWith("www.")&&(n=n.substring(4)),n.charAt(0).toUpperCase()+n.slice(1)}catch{return e}}}static getFaviconUrl(e){if(e.favicon&&e.favicon.startsWith("http"))return e.favicon;if(e.type===m.AUTOCOMPLETE_SUGGESTION){if(e.metadata?.isUrl&&e.url)try{return z.getFaviconUrl(e.url,"64")}catch{}return`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>')}`}if(e.url)try{return z.getFaviconUrl(e.url,"64")}catch{}return`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>')}`}static formatResult(e,t,o=null){const r={[m.URL_SUGGESTION]:{title:e.title,subtitle:e.url,action:"↵"},[m.SEARCH_QUERY]:{title:e.title,subtitle:"",action:"↵"},[m.AUTOCOMPLETE_SUGGESTION]:{title:e.title,subtitle:e.metadata?.isUrl?e.url:"",action:"↵"},[m.OPEN_TAB]:{title:e.title,subtitle:e.domain,action:e.metadata?.groupName?e.metadata?.isArcify&&e.metadata?.spaceName===e.metadata?.groupName?"Open Pinned Tab":"Open Tab":t===f.NEW_TAB?"Switch to Tab":"↵"},[m.PINNED_TAB]:{title:e.title,subtitle:e.domain,action:"Open Favorite Tab"},[m.BOOKMARK]:{title:e.title,subtitle:e.domain,action:e.metadata?.isArcify&&e.metadata?.spaceName===o?"Open Pinned Tab":"↵"},[m.HISTORY]:{title:e.title,subtitle:e.domain,action:"↵"},[m.TOP_SITE]:{title:e.title,subtitle:e.domain,action:"↵"}};return s.log("---- Formatting result type",e.type),r[e.type]||{title:e.title,subtitle:e.url,action:"↵"}}static hexToRgb(e){const t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?`${parseInt(t[1],16)}, ${parseInt(t[2],16)}, ${parseInt(t[3],16)}`:null}static async getAccentColorCSS(e){const t={grey:"204, 204, 204",blue:"139, 179, 243",red:"255, 158, 151",yellow:"255, 226, 159",green:"139, 218, 153",pink:"251, 170, 215",purple:"214, 166, 255",cyan:"165, 226, 234",orange:"255, 176, 103"};let o=t[e]||t.purple;try{const r=await chrome.storage.sync.get(["colorOverrides"]);if(r.colorOverrides&&r.colorOverrides[e]){const n=r.colorOverrides[e],c=this.hexToRgb(n);c&&(o=c)}}catch(r){s.error("Error getting color overrides:",r)}return`
            :root {
                --spotlight-accent-color: rgb(${o});
                --spotlight-accent-color-15: rgba(${o}, 0.15);
                --spotlight-accent-color-20: rgba(${o}, 0.2);
                --spotlight-accent-color-80: rgba(${o}, 0.8);
            }
        `}static areResultsDuplicate(e,t){if(!e||!t)return!1;if(e.url&&t.url){const o=e.url.toLowerCase().replace(/\/+$/,""),r=t.url.toLowerCase().replace(/\/+$/,"");return o===r}return e.type==="search-query"&&t.type==="search-query"?e.title===t.title:!1}static setupFaviconErrorHandling(e){e.querySelectorAll('.arcify-spotlight-result-favicon[data-fallback-icon="true"]').forEach(o=>{o.addEventListener("error",function(){this.src=l.getFaviconUrl({url:null,favicon:null})})})}static formatDebugInfo(e){return""}static getChipColors(e){const t={grey:{bg:"rgba(204, 204, 204, 0.15)",text:"rgb(204, 204, 204)"},blue:{bg:"rgba(139, 179, 243, 0.15)",text:"rgb(139, 179, 243)"},red:{bg:"rgba(255, 158, 151, 0.15)",text:"rgb(255, 158, 151)"},yellow:{bg:"rgba(255, 226, 159, 0.15)",text:"rgb(255, 226, 159)"},green:{bg:"rgba(139, 218, 153, 0.15)",text:"rgb(139, 218, 153)"},pink:{bg:"rgba(251, 170, 215, 0.15)",text:"rgb(251, 170, 215)"},purple:{bg:"rgba(214, 166, 255, 0.15)",text:"rgb(214, 166, 255)"},cyan:{bg:"rgba(165, 226, 234, 0.15)",text:"rgb(165, 226, 234)"},orange:{bg:"rgba(255, 176, 103, 0.15)",text:"rgb(255, 176, 103)"}};return t[e]||t.grey}static generateSpaceChipHTML(e){const t=e.metadata?.groupName,o=e.metadata?.spaceName;if(!t)return"";const r=o&&o===t?o:t,n=e.metadata?.groupColor||"grey",c=l.getChipColors(n),p=r.length>18?r.substring(0,18)+"…":r;return`<span class="arcify-space-chip" style="background:${c.bg};color:${c.text}" title="${l.escapeHtml(r)}">${l.escapeHtml(p)}</span>`}}class K{constructor(e,t=null){this.container=e,this.selectedIndex=0,this.results=[],this.onSelectionChange=t}updateResults(e){this.results=e,this.selectedIndex=0,this.updateVisualSelection()}moveSelection(e){const t=this.selectedIndex,o=this.results.length-1;e==="down"?this.selectedIndex=Math.min(this.selectedIndex+1,o):e==="up"&&(this.selectedIndex=Math.max(this.selectedIndex-1,0)),this.updateVisualSelection(),this.onSelectionChange&&t!==this.selectedIndex&&this.onSelectionChange(this.getSelectedResult(),this.selectedIndex)}moveToFirst(){const e=this.selectedIndex;this.selectedIndex=0,this.updateVisualSelection(),this.onSelectionChange&&e!==this.selectedIndex&&this.onSelectionChange(this.getSelectedResult(),this.selectedIndex)}moveToLast(){const e=this.selectedIndex;this.selectedIndex=Math.max(0,this.results.length-1),this.updateVisualSelection(),this.onSelectionChange&&e!==this.selectedIndex&&this.onSelectionChange(this.getSelectedResult(),this.selectedIndex)}getSelectedResult(){return this.results[this.selectedIndex]||null}updateVisualSelection(){const e=this.container.querySelectorAll(".arcify-spotlight-result-item");e.forEach((t,o)=>{t.classList.toggle("selected",o===this.selectedIndex)}),e[this.selectedIndex]&&e[this.selectedIndex].scrollIntoView({behavior:"smooth",block:"nearest"})}handleKeyDown(e,t=!1){if(!t&&!this.container.contains(document.activeElement))return!1;switch(e.key){case"ArrowDown":return e.preventDefault(),e.stopPropagation(),this.moveSelection("down"),!0;case"ArrowUp":return e.preventDefault(),e.stopPropagation(),this.moveSelection("up"),!0;case"Home":return e.preventDefault(),e.stopPropagation(),this.moveToFirst(),!0;case"End":return e.preventDefault(),e.stopPropagation(),this.moveToLast(),!0;default:return!1}}}class d{static async getSuggestions(e,t){try{const o={action:"getSpotlightSuggestions",query:e.trim(),mode:t},r=await chrome.runtime.sendMessage(o);return r&&r.success?r.results:(s.error("[SpotlightMessageClient] Get suggestions failed:",r?.error),[])}catch(o){return s.error("[SpotlightMessageClient] Get suggestions error:",o),[]}}static async getLocalSuggestions(e,t){try{const o=await chrome.runtime.sendMessage({action:"getLocalSuggestions",query:e.trim(),mode:t});return o&&o.success?o.results:(s.error("[SpotlightMessageClient] Get local suggestions failed:",o?.error),[])}catch(o){return s.error("[SpotlightMessageClient] Get local suggestions error:",o),[]}}static async getAutocompleteSuggestions(e){try{const t=await chrome.runtime.sendMessage({action:"getAutocompleteSuggestions",query:e.trim()});return t&&t.success?t.results:(s.error("[SpotlightMessageClient] Get autocomplete suggestions failed:",t?.error),[])}catch(t){return s.error("[SpotlightMessageClient] Get autocomplete suggestions error:",t),[]}}static async handleResult(e,t){try{const o={action:"spotlightHandleResult",result:e,mode:t,tabId:window.arcifyCurrentTabId||null},r=await chrome.runtime.sendMessage(o);return!r||r.success===!1?(s.error("[SpotlightMessageClient] Result action failed:",r?.error||"No response"),!1):!0}catch(o){return s.error("[SpotlightMessageClient] Error handling result action:",o),!1}}static async getActiveSpaceColor(){try{const e=await chrome.runtime.sendMessage({action:"getActiveSpaceColor"});return e&&e.success&&e.color?{color:e.color,groupName:e.groupName||null}:(s.error("[SpotlightMessageClient] Failed to get active space color:",e?.error),{color:"purple",groupName:null})}catch(e){return s.error("[SpotlightMessageClient] Error getting active space color:",e),{color:"purple",groupName:null}}}static notifyOpened(){try{chrome.runtime.sendMessage({action:"spotlightOpened"})}catch(e){s.error("[SpotlightMessageClient] Error notifying spotlight opened:",e)}}static notifyClosed(){try{chrome.runtime.sendMessage({action:"spotlightClosed"})}catch(e){s.error("[SpotlightMessageClient] Error notifying spotlight closed:",e)}}static async switchToTab(e,t){try{return(await chrome.runtime.sendMessage({action:"switchToTab",tabId:e,windowId:t}))?.success===!0}catch(o){return s.error("[SpotlightMessageClient] Error switching to tab:",o),!1}}static async navigateCurrentTab(e){try{return(await chrome.runtime.sendMessage({action:"navigateCurrentTab",url:e}))?.success===!0}catch(t){return s.error("[SpotlightMessageClient] Error navigating current tab:",t),!1}}static async openNewTab(e){try{return(await chrome.runtime.sendMessage({action:"openNewTab",url:e}))?.success===!0}catch(t){return s.error("[SpotlightMessageClient] Error opening new tab:",t),!1}}static async performSearch(e,t){try{return(await chrome.runtime.sendMessage({action:"performSearch",query:e,mode:t}))?.success===!0}catch(o){return s.error("[SpotlightMessageClient] Error performing search:",o),!1}}static setupGlobalCloseListener(e){const t=o=>{o.action==="closeSpotlight"&&e()};return chrome.runtime.onMessage.addListener(t),()=>{chrome.runtime.onMessage.removeListener(t)}}}class y{static combineResults(e,t){const o=[];e&&o.push(e);for(const r of t)e&&l.areResultsDuplicate(e,r)||o.push(r);return o}static generateResultsHTML(e,t,o=null){return!e||e.length===0?'<div class="arcify-spotlight-empty">Start typing to search tabs, bookmarks, and history</div>':e.map((r,n)=>{const c=l.formatResult(r,t,o),p=n===0,u=l.generateSpaceChipHTML(r),b=c.subtitle?u?`<span class="arcify-spotlight-result-url-text">${l.escapeHtml(c.subtitle)}</span>${l.formatDebugInfo(r)}${u}`:`${l.escapeHtml(c.subtitle)}${l.formatDebugInfo(r)}`:"";return`
                <button class="arcify-spotlight-result-item ${p?"selected":""}"
                        data-index="${n}"
                        data-testid="spotlight-result">
                    <img class="arcify-spotlight-result-favicon"
                         src="${l.getFaviconUrl(r)}"
                         alt="favicon"
                         data-fallback-icon="true">
                    <div class="arcify-spotlight-result-content">
                        <div class="arcify-spotlight-result-title">${l.escapeHtml(c.title)}</div>
                        <div class="arcify-spotlight-result-url">${b}</div>
                    </div>
                    <div class="arcify-spotlight-result-action">${l.escapeHtml(c.action)}</div>
                </button>
            `}).join("")}static updateResultsDisplay(e,t,o,r,n=null){const c=y.generateResultsHTML(o,r,n);e.innerHTML=c,l.setupFaviconErrorHandling(e)}static createKeyDownHandler(e,t,o,r=!0){return n=>{if(!e.handleKeyDown(n,r))switch(n.key){case"Enter":if(t){n.preventDefault(),n.stopPropagation();const c=e.getSelectedResult();c&&t(c,n)}break;case"Escape":o&&(n.preventDefault(),n.stopPropagation(),o(n));break}}}static setupResultClickHandling(e,t,o){e.addEventListener("click",r=>{const n=r.target.closest(".arcify-spotlight-result-item");if(n){const c=o();if(c){const p=parseInt(n.dataset.index),u=c[p];u&&t&&t(u,p)}}})}static createInputHandler(e,t,o=150){let r=null;return n=>{r&&clearTimeout(r),e&&e(n),t&&(r=setTimeout(()=>{t(n)},o))}}}window.arcifySpotlightTabMode||chrome.runtime.onMessage.addListener((a,e,t)=>{a.action==="activateSpotlight"&&(window.arcifySpotlightTabMode=a.mode,window.arcifyCurrentTabUrl=a.tabUrl,window.arcifyCurrentTabId=a.tabId,G(a.mode),t({success:!0}))});async function G(a="current-tab"){const e=document.getElementById("arcify-spotlight-dialog");if(e){if(e.open)e.close();else{e.showModal(),d.notifyOpened();const i=e.querySelector(".arcify-spotlight-input");i&&(i.focus(),i.select(),i.scrollLeft=0)}return}window.arcifySpotlightInjected=!0;let t="purple",o=null;const n=`
        ${await l.getAccentColorCSS(t)}
        
        /* Smooth transitions for color changes */
        :root {
            transition: --spotlight-accent-color 0.3s ease,
                       --spotlight-accent-color-15 0.3s ease,
                       --spotlight-accent-color-20 0.3s ease,
                       --spotlight-accent-color-80 0.3s ease;
        }
        
        #arcify-spotlight-dialog {
            margin: 0;
            position: fixed;
            /* Not fully centered but this looks better than 50vh */
            top: calc(35vh);
            left: 50%;
            transform: translateX(-50%);
            border: none;
            padding: 0;
            background: transparent;
            border-radius: 12px;
            width: 650px;
            max-width: 90vw;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        #arcify-spotlight-dialog::backdrop {
            background: transparent;
        }

        .arcify-spotlight-container {
            background: #2D2D2D;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #ffffff;
            position: relative;
            overflow: hidden;
        }

        #arcify-spotlight-dialog .arcify-spotlight-input-wrapper {
            display: flex;
            align-items: center;
            padding: 12px 24px 12px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        #arcify-spotlight-dialog .arcify-spotlight-search-icon {
            width: 20px;
            height: 20px;
            margin-right: 12px;
            opacity: 0.6;
            flex-shrink: 0;
        }

        /* 
            Specific CSS directives to override styling on specific pages (stackoverflow, chrome docs).
            Otherwise the spotlight bar has a white background and some other weird UI.
        */
        #arcify-spotlight-dialog .arcify-spotlight-input {
            flex: 1 !important;
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
            border: none !important;
            border-style: none !important;
            border-width: 0 !important;
            border-color: transparent !important;
            color: #ffffff !important;
            font-size: 18px !important;
            line-height: 24px !important;
            padding: 8px 0 !important;
            margin: 0 !important;
            outline: none !important;
            outline-style: none !important;
            outline-width: 0 !important;
            font-weight: 400 !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            text-indent: 0 !important;
            text-shadow: none !important;
            vertical-align: baseline !important;
            text-decoration: none !important;
            box-sizing: border-box !important;
        }

        #arcify-spotlight-dialog .arcify-spotlight-input::placeholder {
            color: rgba(255, 255, 255, 0.5) !important;
            opacity: 1 !important;
        }

        #arcify-spotlight-dialog .arcify-spotlight-input:focus {
            outline: none !important;
            outline-style: none !important;
            outline-width: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            background-color: transparent !important;
        }

        .arcify-spotlight-results {
            max-height: 270px;
            overflow-y: auto;
            padding: 8px 0;
            scroll-behavior: smooth;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
        }

        .arcify-spotlight-results::-webkit-scrollbar {
            display: none; /* Chrome, Safari and Opera */
        }

        .arcify-spotlight-result-item {
            display: flex;
            align-items: center;
            padding: 12px 24px 12px 20px;
            min-height: 44px;
            cursor: pointer;
            transition: background-color 0.15s ease;
            border: none;
            background: none;
            width: 100%;
            text-align: left;
            color: inherit;
            font-family: inherit;
        }

        .arcify-spotlight-result-item:hover,
        .arcify-spotlight-result-item:focus {
            background: var(--spotlight-accent-color-15);
            outline: none;
        }

        .arcify-spotlight-result-item.selected {
            background: var(--spotlight-accent-color-20);
        }

        .arcify-spotlight-result-favicon {
            width: 20px;
            height: 20px;
            margin-right: 12px;
            border-radius: 4px;
            flex-shrink: 0;
        }

        .arcify-spotlight-result-content {
            flex: 1;
            min-width: 0;
            min-height: 32px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .arcify-spotlight-result-title {
            font-size: 14px;
            font-weight: 500;
            color: #ffffff;
            margin: 0 0 2px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .arcify-spotlight-result-url {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            margin: 0;
            display: flex;
            align-items: center;
            gap: 6px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .arcify-spotlight-result-url:empty {
            display: none;
        }

        /* Space chip - inline with URL */
        .arcify-spotlight-result-url-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 0;
        }

        .arcify-space-chip {
            display: inline-flex;
            align-items: center;
            padding: 1px 8px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 500;
            line-height: 16px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 140px;
            flex-shrink: 0;
        }

        .arcify-spotlight-result-action {
            font-size: 12px;
            color: var(--spotlight-accent-color-80);
            margin-left: 12px;
            flex-shrink: 0;
        }

        .arcify-spotlight-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            color: rgba(255, 255, 255, 0.6);
        }

        .arcify-spotlight-empty {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
        }

        #arcify-spotlight-dialog {
            animation: arcify-spotlight-show 0.2s ease-out;
        }

        @keyframes arcify-spotlight-show {
            from {
                opacity: 0;
                transform: translateX(-50%) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) scale(1);
            }
        }

        @media (max-width: 640px) {
            #arcify-spotlight-dialog {
                width: 95vw;
                margin: 20px auto;
            }
            
            #arcify-spotlight-dialog .arcify-spotlight-input {
                font-size: 16px !important;
            }
        }
    `,c=document.createElement("style");c.id="arcify-spotlight-styles",c.textContent=n,document.head.appendChild(c);const p=document.createElement("dialog");p.id="arcify-spotlight-dialog",p.setAttribute("data-testid","spotlight-overlay"),p.innerHTML=`
        <div class="arcify-spotlight-container">
            <div class="arcify-spotlight-input-wrapper">
                <svg class="arcify-spotlight-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                    type="text"
                    class="arcify-spotlight-input"
                    data-testid="spotlight-input"
                    placeholder="${a===f.NEW_TAB?"Search or enter URL (opens in new tab)...":"Search or enter URL..."}"
                    spellcheck="false"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                >
            </div>
            <div class="arcify-spotlight-results" data-testid="spotlight-results">
                <div class="arcify-spotlight-loading" data-testid="spotlight-loading">Loading...</div>
            </div>
        </div>
    `,document.body.appendChild(p);const u=p.querySelector(".arcify-spotlight-input"),b=p.querySelector(".arcify-spotlight-results");let w=[],x=null,h=[],k=0;async function Z(i,g){return await d.getSuggestions(i,g)}async function Q(i,g){return await d.handleResult(i,g)}let L=!1;const X=(i,g)=>{L=!0,i&&i.metadata&&i.metadata.query?u.value=i.metadata.query:i&&i.url?u.value=i.url:i&&i.title?u.value=i.title:u.value=""},U=new K(b,X);async function B(){try{x=null;const i=a===f.NEW_TAB?"new-tab":"current-tab";h=await Z("",i)||[],S()}catch(i){s.error("[Spotlight] Error loading initial results:",i),x=null,h=[],O()}}a===f.CURRENT_TAB&&window.arcifyCurrentTabUrl?(u.value=window.arcifyCurrentTabUrl,setTimeout(()=>{$(),W()},10)):O();function $(){const i=u.value.trim();if(!i){x=null,B();return}x=l.generateInstantSuggestion(i),S()}async function W(){const i=u.value.trim(),g=++k;if(!i){h=[],S();return}try{const v=a===f.NEW_TAB?"new-tab":"current-tab",I=await d.getLocalSuggestions(i,v);if(g!==k)return;h=I||[],S();const R=await d.getAutocompleteSuggestions(i);if(g!==k)return;if(R&&R.length>0){const D=await d.getSuggestions(i,v);if(g!==k)return;h=D||[],S()}}catch(v){s.error("[Spotlight] Search error:",v),g===k&&(h=[],S())}}function J(){return y.combineResults(x,h)}function S(){if(w=J(),U.updateResults(w),w.length===0){O();return}const i=a===f.NEW_TAB?"new-tab":"current-tab";y.updateResultsDisplay(b,[],w,i,o)}function O(){b.innerHTML='<div class="arcify-spotlight-empty">Start typing to search tabs, bookmarks, and history</div>',w=[],x=null,h=[],U.updateResults([])}const ee=y.createInputHandler($,W,150);u.addEventListener("input",i=>{if(L){L=!1;return}ee(i)});async function _(i){if(!i){s.error("[Spotlight] No result provided");return}try{const g=a===f.NEW_TAB?"new-tab":"current-tab";E(),await Q(i,g)}catch(g){s.error("[Spotlight] Error in result action:",g)}}u.addEventListener("keydown",y.createKeyDownHandler(U,i=>_(i),()=>E())),y.setupResultClickHandling(b,(i,g)=>_(i),()=>w);function E(){p.close(),d.notifyClosed(),setTimeout(()=>{p.parentNode&&(p.parentNode.removeChild(p),c.parentNode.removeChild(c),window.arcifySpotlightInjected=!1)},200)}p.addEventListener("click",i=>{i.target===p&&E()}),p.addEventListener("close",E),d.setupGlobalCloseListener(()=>{const i=document.getElementById("arcify-spotlight-dialog");i&&i.open&&E()}),p.showModal(),d.notifyOpened(),u.focus(),u.select(),u.scrollLeft=0,(async()=>{try{const{color:i,groupName:g}=await d.getActiveSpaceColor();if(o=g,i!==t){const v=await l.getAccentColorCSS(i),I=document.querySelector("#arcify-spotlight-styles");if(I){const R=/:root\s*{([^}]*)}/,D=I.textContent,F=v.match(R);if(F){const te=D.replace(R,F[0]);I.textContent=te}}}}catch(i){s.error("[Spotlight] Error updating active space color:",i)}u.value.trim()||B()})()}window.arcifySpotlightTabMode&&G(window.arcifySpotlightTabMode)})();
