(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[601],{2531:()=>{AFRAME.components["quaternion-rotation"]||AFRAME.registerComponent("quaternion-rotation",{schema:{type:"vec4"},init:function(){this.object3D=this.el.object3D,this.object3D.rotation.reorder("YXZ")},update:function(){let e=this.data;this.object3D.quaternion.set(e.x,e.y,e.z,e.w)}})},1601:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>a});var o=r(5155),n=r(2115);r(2531);let a=function(e){let{config:t={}}=e,{position:r="0 0 0",rotation:a="0 0 0",enableWASD:c=!1,enableLook:i=!0,raycaster:s={}}=t,l=(0,n.useRef)(null),u=(0,n.useRef)(!1);return(0,n.useEffect)(()=>{let e=l.current;if(u&&e.setAttribute("position","0 0 0"),s.enabled){let t=s.objects||".interactable",r=s.far||100,o=e.querySelector("[raycaster]");o&&o.parentNode.removeChild(o);let n=document.createElement("a-entity");n.setAttribute("raycaster","objects: ".concat(t,"; far: ").concat(r)),n.setAttribute("cursor","rayOrigin: mouse"),e.appendChild(n)}return()=>{if(e){let t=e.querySelector("[raycaster]");t&&t.parentNode.removeChild(t)}}},[t,s.enabled,s.far,s.objects]),(0,o.jsx)("a-entity",{id:"camera-controls",position:r,"wasd-controls":"enabled: ".concat(c),"look-controls":"enabled: ".concat(i),children:(0,o.jsx)("a-camera",{camera:"active: true; fov: 75; near: 0.01; far: 1000;",ref:l,position:"0 0 0",rotation:"0 0 0","quaternion-rotation":!0})})}}}]);