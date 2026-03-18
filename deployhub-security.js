// DeployHub Security Protection v1.0
(function(){
"use strict";
document.addEventListener("contextmenu",function(e){e.preventDefault();return false},true);
document.addEventListener("copy",function(e){e.preventDefault()},true);
document.addEventListener("cut",function(e){e.preventDefault()},true);
document.addEventListener("selectstart",function(e){e.preventDefault()},true);
var s=document.createElement("style");s.textContent="*{-webkit-user-select:none!important;user-select:none!important}";document.head.appendChild(s);
document.addEventListener("keydown",function(e){
if(e.keyCode===123)e.preventDefault();
if(e.ctrlKey&&e.shiftKey&&(e.keyCode===73||e.keyCode===74||e.keyCode===67))e.preventDefault();
if(e.ctrlKey&&e.keyCode===85)e.preventDefault();
if(e.metaKey&&e.altKey&&(e.keyCode===73||e.keyCode===74))e.preventDefault();
},true);
var n=function(){};
["log","debug","info","warn","error","trace","dir","table","clear"].forEach(function(m){try{Object.defineProperty(console,m,{value:n,writable:false})}catch(e){console[m]=n}});
setInterval(function(){var a=performance.now();debugger;if(performance.now()-a>100)window.location.reload()},5000);
if(window.self!==window.top)window.top.location=window.self.location;
var p=window.location.pathname.toLowerCase();var b=[".env",".git",".htaccess","wp-config","config.php"];
if(b.some(function(f){return p.includes(f)}))document.body.innerHTML="<h1 style=\"text-align:center;margin-top:40vh;color:red\">403 Forbidden</h1>";
})();
