"use strict";(()=>{var A;{let y=function(h){return h.replace(M,e=>{var s;return(s=C[e])!=null?s:e}).normalize("NFKD").replace(/[\u0300-\u036f]/g,"")};var S=y;const C={\u00C4:"Ae",\u00D6:"Oe",\u00DC:"Ue",\u00E4:"ae",\u00F6:"oe",\u00FC:"ue",\u00DF:"ss","\u1E9E":"SS",\u00C6:"AE",\u00E6:"ae",\u0152:"OE",\u0153:"oe",\u00D8:"O",\u00F8:"o",\u00D0:"D",\u00F0:"d",\u0110:"D",\u0111:"d",\u00DE:"Th",\u00FE:"th",\u0141:"L",\u0142:"l",\u0131:"i"},M=/[\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df\u1e9e\u00c6\u00e6\u0152\u0153\u00d8\u00f8\u00d0\u00f0\u0110\u0111\u00de\u00fe\u0141\u0142\u0131]/g;class b{static generateId(){return(Math.random()+1).toString(36).slice(-6)}constructor(e){this.getAppData=e}get state(){var e,s,t;return(t=(s=(e=this.getAppData())==null?void 0:e.config)==null?void 0:s.globalProperties)==null?void 0:t.$_state}getElements(){const e=[],s=this.state.components;if(Array.isArray(s))for(const t of s)Array.isArray(t==null?void 0:t.elements)&&e.push(...t.elements);return e.push(...this.state.content,...this.state.header,...this.state.footer),e}getElementById(e){return this.getElements().find(s=>s.id===e)}getElementLabel(e){if(e)return y(e).replace(/\([^)]*\)/g,"").replace(/\[[^\]]*]/g,"").replace(/[^A-Za-z0-9 _-]/g,"").replace(/\s+/g,"-").trim().toLowerCase()}sanitizeBemInput(e){const s=this.getElementLabel(e.value);return s!==void 0&&(e.value=s),s}addClass(e,s){var a;let t=this.getElementById(s);if(!t)return;let r=(a=t==null?void 0:t.settings)==null?void 0:a._cssGlobalClasses,o=!1,n=b.generateId();if(this.state.globalClasses.forEach(i=>{i.name===e?(o=!0,n=i.id):i.id===n&&(n=b.generateId())}),!o){const i={id:n,name:e,settings:[]};this.state.globalClasses.push(i)}return r||(t.settings||(t.settings={}),t.settings._cssGlobalClasses=[],r=t.settings._cssGlobalClasses),r!=null&&r.includes(n)||r.push(n),!0}getElementTree(e){const s=this.getElementById(e);if(!s)return null;const t={id:s.id,name:s.label||s.name,bemName:this.getElementLabel(s.label||s.name),rootName:this.getElementLabel(s.label||s.name),isRoot:!0,children:[]};return s.children&&Array.isArray(s.children)&&s.children.forEach(r=>{const o=this.getElementTree(r);o&&(o.isRoot=!1,o.rootName=t.rootName,t.children.push(o))}),t}renderTree(e){const s=e.isRoot,t=e.rootName,r=s?e.bemName:`${t}__${e.bemName}`,o=e.name.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");let n=`
                <div class="bem-tree-item" data-element-id="${e.id}">
                    <span class="label-inline">
                        <span class="element-label--label">Label</span>
                        <span class="element-name">${o}</span>
                    </span>
                    <input
                        type="text"
                        class="bem-name-input"
                        value="${r}"
                       data-is-root="${s}"
                       data-root-name="${t}"
                   />
                </div>
            `;return e.children.length&&(n+='<div class="bem-tree-children">',e.children.forEach(a=>{a.rootName=t,n+=this.renderTree(a)}),n+="</div>"),n}showBemPopup(e){var f,g,l;const s=document.querySelector(".bem-popup-wrapper"),t=this.getElementTree(e);if(s&&s.remove(),!t)return;const r=document.createElement("div"),o=document.createElement("div"),n=document.createElement("div");r.className="bem-popup-wrapper",o.className="bem-popup-glow",n.className="bem-popup",n.innerHTML=`
                <div class="bem-header">
                    <span class="bem-header--svg">
                    <svg
                        id="b"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 31.82 24.84"
                    >
                    <defs>
                        <linearGradient id="e" x1="3.77" y1="7.44" x2="31.03" y2="24.04"
                            gradientTransform="translate(0 26) scale(1 -1)"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0" stop-color="#5c68f9"></stop>
                            <stop offset="1" stop-color="#8e97fe"></stop>
                        </linearGradient>
                        <linearGradient id="f" x1="8.16" y1=".31" x2="13.63" y2="17.26"
                            gradientTransform="translate(0 26) scale(1 -1)"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0" stop-color="#5c68f9" stop-opacity="0"></stop>
                            <stop offset=".08" stop-color="#5561f4" stop-opacity=".1"></stop>
                            <stop offset=".32" stop-color="#434ce6" stop-opacity=".42"></stop>
                            <stop offset=".55" stop-color="#343cdc" stop-opacity=".67"></stop>
                            <stop offset=".74" stop-color="#2930d4" stop-opacity=".85"></stop>
                            <stop offset=".9" stop-color="#2329cf" stop-opacity=".96"></stop>
                            <stop offset="1" stop-color="#2127ce"></stop>
                        </linearGradient>
                    </defs>
                    <g id="c">
                        <g id="d">
                            <rect x="18.78" y="10.68" width="13.03" height="7.07" style="fill:#a4a4a4;"></rect>
                            <path d="m12.42,0C5.56,0,0,5.56,0,12.42h0c0,6.86,5.56,12.42,12.42,12.42h6.37v-7.07h-6.37c-2.95,0-5.35-2.39-5.35-5.35h0c0-2.95,2.39-5.35,5.35-5.35h19.4V0H12.42Z" style="fill:#bcbcbc;"></path>
                            <path d="m7.07,12.42h0c0-1.23.43-2.35,1.13-3.25h-.02L.74,16.6c1.72,4.79,6.3,8.23,11.68,8.23h6.37v-7.07h-6.37c-2.95,0-5.35-2.39-5.35-5.35h0Z" style="fill:#919191;"></path>
                        </g>
                    </g>
                </svg>
                    </span>
                    <h3>BEM Class Generator</h3>
                    <button class="bem-close">\u2715</button>
                </div>
                <div class="bem-content">
                    <div class="bem-section">
                        <div class="bem-tree"></div>
                    </div>
                </div>
                <div class="bem-footer">
                    <button class="bem-button secondary bem-cancel">Cancel</button>
                    <button class="bem-button bem-apply">Apply Classes</button>
                </div>
            `,r.appendChild(o),r.appendChild(n),document.body.appendChild(r);const a=n.querySelector(".bem-header"),i=this.initDragging(a,r),c=n.querySelector(".bem-tree");c.innerHTML=this.renderTree(t),c.addEventListener("input",p=>{const u=p.target;if(u!=null&&u.classList.contains("bem-name-input")){const m=this.sanitizeBemInput(u);u.dataset.isRoot==="true"&&m&&c.querySelectorAll('.bem-name-input:not([data-is-root="true"])').forEach(L=>{const T=this.getElementLabel(L.value.split("__").pop()||"");L.value=T?`${m}__${T}`:m})}});const d=()=>{i(),r.remove()};(f=n.querySelector(".bem-close"))==null||f.addEventListener("click",d),(g=n.querySelector(".bem-cancel"))==null||g.addEventListener("click",d),(l=n.querySelector(".bem-apply"))==null||l.addEventListener("click",()=>{const p=c==null?void 0:c.querySelectorAll(".bem-tree-item");p==null||p.forEach(u=>{const m=u.dataset.elementId,v=u.querySelector(".bem-name-input"),E=v?this.sanitizeBemInput(v):void 0;m&&E&&this.addClass(E,m)}),d(),this.state.updating=Date.now()})}addBemButton(e){const s=this,t=e.querySelector(".actions"),r=e.querySelector(".title");if(!t&&!r)return;if(t){if(t.querySelector(".bem-generator"))return}else if(r!=null&&r.querySelector(".bem-generator"))return;const o=document.createElement("span");if(o.innerHTML=`
                <svg
                    id="b"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 31.82 24.84"
                >
                    <defs>
                        <linearGradient id="e-btn" x1="3.77" y1="7.44" x2="31.03" y2="24.04" gradientTransform="translate(0 26) scale(1 -1)" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stop-color="#5c68f9"></stop>
                            <stop offset="1" stop-color="#8e97fe"></stop>
                        </linearGradient>
                        <linearGradient id="f-btn" x1="8.16" y1=".31" x2="13.63" y2="17.26" gradientTransform="translate(0 26) scale(1 -1)" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stop-color="#5c68f9" stop-opacity="0"></stop>
                            <stop offset=".08" stop-color="#5561f4" stop-opacity=".1"></stop>
                            <stop offset=".32" stop-color="#434ce6" stop-opacity=".42"></stop>
                            <stop offset=".55" stop-color="#343cdc" stop-opacity=".67"></stop>
                            <stop offset=".74" stop-color="#2930d4" stop-opacity=".85"></stop>
                            <stop offset=".9" stop-color="#2329cf" stop-opacity=".96"></stop>
                            <stop offset="1" stop-color="#2127ce"></stop>
                        </linearGradient>
                    </defs>
                    <g id="c">
                        <g id="d">
                            <rect x="18.78" y="10.68" width="13.03" height="7.07" style="fill:#fa5e5e;"></rect>
                            <path d="m12.42,0C5.56,0,0,5.56,0,12.42h0c0,6.86,5.56,12.42,12.42,12.42h6.37v-7.07h-6.37c-2.95,0-5.35-2.39-5.35-5.35h0c0-2.95,2.39-5.35,5.35-5.35h19.4V0H12.42Z" style="fill:#7d87fc;"></path>
                            <path d="m7.07,12.42h0c0-1.23.43-2.35,1.13-3.25h-.02L.74,16.6c1.72,4.79,6.3,8.23,11.68,8.23h6.37v-7.07h-6.37c-2.95,0-5.35-2.39-5.35-5.35h0Z" style="fill:#424ae1;"></path>
                        </g>
                    </g>
                </svg>
            `,o.classList.add("bricks-svg-wrapper","bem-generator"),o.setAttribute("title","Add BEM Classes"),o.addEventListener("click",n=>{var i;n.preventDefault(),n.stopPropagation();const a=(i=e==null?void 0:e.closest(".bricks-draggable-item"))==null?void 0:i.getAttribute("data-id");a&&s.showBemPopup(a)}),t){const n=document.createElement("li");n.classList.add("action","bem"),n.style.width="22px",n.append(o),t.append(n)}else if(r){const n=r.querySelector(".icon");n&&n.insertAdjacentElement("afterend",o)}}applyBemButtomToPanelElements(){const e=this;document.querySelectorAll(".structure-item").forEach(this.addBemButton.bind(e));const s=new MutationObserver(r=>{r.forEach(o=>{o.addedNodes.forEach(n=>{n instanceof HTMLElement&&(n.classList.contains("structure-item")&&this.addBemButton.bind(e,n)(),n.querySelectorAll&&n.querySelectorAll(".structure-item").forEach(a=>{this.addBemButton.bind(e,a)()}))})})}),t=document.querySelector("#bricks-structure");t&&s.observe(t,{childList:!0,subtree:!0})}initDragging(e,s){let t=!1,r,o,n=0,a=0,i=0,c=0;function d(l){const p=l.target;p.classList.contains("bem-close")||p.closest("svg")||(n=l.clientX-i,a=l.clientY-c,t=!0,e.style.cursor="grabbing")}function f(l){t&&(l.preventDefault(),r=l.clientX-n,o=l.clientY-a,i=r,c=o,s.style.transform=`translate(calc(-50% + ${r}px), calc(-50% + ${o}px))`)}function g(){t=!1,e.style.cursor="move"}return e.addEventListener("mousedown",d),document.addEventListener("mousemove",f),document.addEventListener("mouseup",g),()=>{e.removeEventListener("mousedown",d),document.removeEventListener("mousemove",f),document.removeEventListener("mouseup",g)}}}if((A=window==null?void 0:window.core_framework_connector)!=null&&A.bricks_bem_generator){const h=()=>{var o;return(o=document==null?void 0:document.querySelector(".brx-body"))==null?void 0:o.__vue_app__},e=new b(h),s=30;let t=0;const r=setInterval(()=>{t++,h()?(clearInterval(r),e.applyBemButtomToPanelElements()):t>=s&&clearInterval(r)},500)}}})();
