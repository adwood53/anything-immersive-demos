"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[225],{4225:(e,t,d)=>{d.r(t),d.d(t,{default:()=>r});var a=d(5155),n=d(2115);let r=e=>{let{videoSrc:t,loop:d=!0}=e,r=(0,n.useRef)(null),i=(0,n.useRef)(null);return(0,n.useEffect)(()=>{let e=r.current,t=i.current,d=()=>{e.width=t.videoWidth,e.height=t.videoHeight};t.addEventListener("loadedmetadata",d);let a=()=>{t.paused||t.ended||(e.getContext("2d").drawImage(t,0,0,t.videoWidth,t.videoHeight),requestAnimationFrame(a))},n=()=>{a()};return t.addEventListener("play",n),()=>{t.removeEventListener("loadedmetadata",d),t.removeEventListener("play",n)}},[t]),(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("video",{ref:i,src:t,loop:d,autoPlay:!0,muted:!0,playsInline:!0,style:{width:"0",height:"0"}}),(0,a.jsx)("canvas",{ref:r,style:{background:"red",objectFit:"fill",position:"absolute"}})]})}}}]);