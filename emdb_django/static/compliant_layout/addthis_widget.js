/* (c) 2008-2014 AddThis, Inc */
var addthis_conf = { ver:300 };
if(!(window._atc||{}).ver)var _atd="www.addthis.com/",_atr=window.addthis_cdn||"//s7.addthis.com/",_euc=encodeURIComponent,_duc=decodeURIComponent,_atc={dbg:0,rrev:"9.0",dr:0,ver:250,loc:0,enote:"",cwait:500,bamp:.25,camp:1,csmp:1e-4,damp:1,famp:1,pamp:.1,abmp:.5,sfmp:-1,tamp:1,plmp:1,stmp:0,vamp:1,cscs:1,dtt:.01,ohmp:0,ltj:1,xamp:1,abf:!!window.addthis_do_ab,qs:0,cdn:0,rsrcs:{bookmark:_atr+"static/r07/bookmark046.html",atimg:_atr+"static/r07/atimg046.html",countercss:_atr+"static/r07/plugins/counter015.css",counterIE67css:_atr+"static/r07/counterIE67004.css",counter:_atr+"static/r07/plugins/counter020.js",core:_atr+"static/r07/core160.js",wombat:_atr+"static/r07/bar026.js",wombatcss:_atr+"static/r07/bar012.css",qbarcss:_atr+"bannerQuirks.css",fltcss:_atr+"static/r07/floating010.css",barcss:_atr+"static/r07/banner006.css",barjs:_atr+"static/r07/banner004.js",contentcss:_atr+"static/r07/content009.css",contentjs:_atr+"static/r07/content023.js",layersjs:_atr+"static/r07/plugins/layers082.js",layerscss:_atr+"static/r07/plugins/layers067.css",layersiecss:_atr+"static/r07/plugins/layersIE6008.css",layersdroidcss:_atr+"static/r07/plugins/layersdroid005.css",warning:_atr+"static/r07/warning000.html",ssojs:_atr+"static/r07/ssi005.js",ssocss:_atr+"static/r07/ssi004.css",peekaboocss:_atr+"static/r07/peekaboo002.css",overlayjs:_atr+"static/r07/overlay005.js",widgetWhite32CSS:_atr+"static/r07/widget/css/widget007.white.32.css",widgetIE67css:_atr+"static/r07/widgetIE67006.css",widgetpng:"//s7.addthis.com/",widgetOldCSS:_atr+"static/r07/widget/css/widget007.old.css",widgetOld16CSS:_atr+"static/r07/widget/css/widget007.old.16.css",widgetOld20CSS:_atr+"static/r07/widget/css/widget007.old.20.css",widgetOld32CSS:_atr+"static/r07/widget/css/widget007.old.32.css",widgetMobileCSS:_atr+"static/r07/widget/css/widget007.mobile.css",embed:_atr+"static/r07/embed010.js",embedcss:_atr+"static/r07/embed004.css",lightbox:_atr+"static/r07/lightbox000.js",lightboxcss:_atr+"static/r07/lightbox001.css",link:_atr+"static/r07/link005.html",pinit:_atr+"static/r07/pinit022.html",linkedin:_atr+"static/r07/linkedin025.html",fbshare:_atr+"static/r07/fbshare004.html",tweet:_atr+"static/r07/tweet029.html",menujs:_atr+"static/r07/menu167.js",sh:_atr+"static/r07/sh177.html"}};!function(){function t(t,s,e,a){return function(){this.qs||(this.qs=0),_atc.qs++,this.qs++>0&&a||_atc.qs>1e3||!window.addthis||window.addthis.plo.push({call:t,args:arguments,ns:s,ctx:e})}}function s(t){var s=this,e=this.queue=[];this.name=t,this.call=function(){e.push(arguments)},this.call.queuer=this,this.flush=function(t,a){this.flushed=1;for(var i=0;i<e.length;i++)t.apply(a||s,e[i]);return t}}function e(t){t.style.width=t.style.height="1px",t.style.position="absolute",t.style.zIndex=1e5}function a(t){t&&!(t.data||{}).addthisxf&&window.addthis&&(addthis._pmh.flushed?_ate.pmh(t):addthis._pmh.call(t))}var i,r,c,n,d=window,o="https:"==window.location.protocol,l=(navigator.userAgent||"unk").toLowerCase(),h=/firefox/.test(l),u=/msie/.test(l)&&!/opera/.test(l),g={0:_atr,1:"//ct1.addthis.com/",6:"//ct6z.addthis.com/"},_={gb:"1",nl:"1",no:"1"},m={gr:"1",it:"1",cz:"1",ie:"1",es:"1",pt:"1",ro:"1",ca:"1",pl:"1",be:"1",fr:"1",dk:"1",hr:"1",de:"1",hu:"1",fi:"1",us:"1",ua:"1",mx:"1",se:"1",at:"1"},p={nz:"1"},w=(w=document.getElementsByTagName("script"))&&w[w.length-1].parentNode;if(_atc.cdn=0,!window.addthis||window.addthis.nodeType!==i){try{if(r=window.navigator?navigator.userLanguage||navigator.language:"",c=r.split("-").pop().toLowerCase(),n=r.substring(0,2),2!=c.length&&(c="unk"),_atr.indexOf("-")>-1||(window.addthis_cdn!==i?_atc.cdn=window.addthis_cdn:p[c]?_atc.cdn=6:_[c]?_atc.cdn=h||u?0:1:m[c]&&(_atc.cdn=u?0:1)),_atc.cdn){for(var f in _atc.rsrcs)_atc.rsrcs.hasOwnProperty(f)&&(_atc.rsrcs[f]=_atc.rsrcs[f].replace(_atr,"string"==typeof window.addthis_cdn?window.addthis_cdn:g[_atc.cdn]).replace(/live\/([a-z])07/,"live/$107"));_atr=g[_atc.cdn]}}catch(v){}if(window.addthis={ost:0,cache:{},plo:[],links:[],ems:[],timer:{load:(new Date).getTime()},_Queuer:s,_queueFor:t,data:{getShareCount:t("getShareCount","data")},bar:{show:t("show","bar"),initialize:t("initialize","bar")},layers:t("layers"),login:{initialize:t("initialize","login"),connect:t("connect","login")},configure:function(t){d.addthis_config||(d.addthis_config={}),d.addthis_share||(d.addthis_share={});for(var s in t)if("share"==s&&"object"==typeof t[s])for(var e in t[s])t[s].hasOwnProperty(e)&&(addthis.ost?addthis.update("share",e,t[s][e]):d.addthis_share[e]=t[s][e]);else t.hasOwnProperty(s)&&(addthis.ost?addthis.update("config",s,t[s]):d.addthis_config[s]=t[s])},box:t("box"),button:t("button"),counter:t("counter"),count:t("count"),lightbox:t("lightbox"),toolbox:t("toolbox"),update:t("update"),init:t("init"),ad:{menu:t("menu","ad","ad"),event:t("event","ad"),getPixels:t("getPixels","ad")},util:{getServiceName:t("getServiceName")},ready:t("ready"),addEventListener:t("addEventListener","ed","ed"),removeEventListener:t("removeEventListener","ed","ed"),user:{getID:t("getID","user"),getGeolocation:t("getGeolocation","user",null,!0),getPreferredServices:t("getPreferredServices","user",null,!0),getServiceShareHistory:t("getServiceShareHistory","user",null,!0),ready:t("ready","user"),isReturning:t("isReturning","user"),isOptedOut:t("isOptedOut","user"),isUserOf:t("isUserOf","user"),hasInterest:t("hasInterest","user"),isLocatedIn:t("isLocatedIn","user"),interests:t("getInterests","user"),services:t("getServices","user"),location:t("getLocation","user")},session:{source:t("getSource","session"),isSocial:t("isSocial","session"),isSearch:t("isSearch","session")},_pmh:new s("pmh"),_pml:[],error:function(){},log:function(){}},-1==document.location.href.indexOf(_atr)){var b=document.getElementById("_atssh");if(b||(b=document.createElement("div"),b.style.visibility="hidden",b.id="_atssh",e(b),w.appendChild(b)),window.postMessage&&(window.attachEvent?window.attachEvent("onmessage",a):window.addEventListener&&window.addEventListener("message",a,!1),addthis._pml.push(a)),!b.firstChild){var y,l=navigator.userAgent.toLowerCase(),S=Math.floor(1e3*Math.random());y=document.createElement("iframe"),y.id="_atssh"+S,y.title="AddThis utility frame",b.appendChild(y),e(y),y.frameborder=y.style.border=0,y.style.top=y.style.left=0,_atc._atf=y}}var x=document.createElement("script");x.type="text/javascript",x.src=(o?"https:":"http:")+_atc.rsrcs.core,w.appendChild(x);var j=1e4;setTimeout(function(){if(!window.addthis.timer.core&&(Math.random()<_atc.ohmp&&((new Image).src="//m.addthisedge.com/live/t00/oh.gif?"+Math.floor(4294967295*Math.random()).toString(36)+"&cdn="+_atc.cdn+"&sr="+_atc.ohmp+"&rev="+_atc.rrev+"&to="+j),0!==_atc.cdn)){var t=document.createElement("script");t.type="text/javascript",t.src=(o?"https:":"http:")+_atr+"static/r07/core160.js",w.appendChild(t)}},j)}}();