(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[88,191],{6088:(e,t,i)=>{"use strict";i.r(t),i.d(t,{default:()=>c});var a=i(5155),n=i(2115),l=i(1191),r=i.n(l);let c=e=>{let{facingMode:t}=e,l=(0,n.useRef)(null),c=(0,n.useRef)(null);return(0,n.useEffect)(()=>{(async()=>{let e=l.current,a=c.current;if(!e||!a)return;let n=a.getContext("2d",{alpha:!1,desynchronized:!0}),[{Camera:r,onFrame:d,resize2cover:h}]=await Promise.all([i.e(165).then(i.bind(i,8165))]),s=(await r.Initialize({video:{facingMode:t,aspectRatio:16/9,width:{ideal:1280}},audio:!1})).el;a.width=e.clientWidth,a.height=e.clientHeight,e.appendChild(a);let o=h(s.videoWidth,s.videoHeight,e.clientWidth,e.clientHeight);s.style.width="".concat(o.width,"px"),s.style.height="".concat(o.height,"px"),s.setAttribute("autoplay",!0),s.setAttribute("playsinline",!0),s.setAttribute("webkit-playsinline",!0),d(()=>(document.hidden||n.drawImage(s,0,0,s.videoWidth,s.videoHeight,o.x,o.y,o.width,o.height),!0),30)})().catch(e=>{console.error("Error initializing SLAM:",e)})},[t]),(0,a.jsx)("div",{className:"".concat(r().container),ref:l,children:(0,a.jsx)("canvas",{id:"device-camera-view",ref:c})})}},1191:e=>{e.exports={container:"DeviceCamera_container__wCIag",fadeIn:"DeviceCamera_fadeIn__uFpHV",splash:"DeviceCamera_splash__zdYnk",overlay:"DeviceCamera_overlay__n6D9R"}}}]);