/* ===========================================================================
   Big Picture Bio — Journal article exhibits
   Biology palette shared with assets/site.js. Four exhibits:
   unlock bars · combination-share gauge · interactive Muller · interactive Pareto
   =========================================================================== */
(function(){
  "use strict";
  var PAL=['#F6C982','#F19A6C','#EC7EA6','#CE6BA0','#96509A','#52223F'];
  var ACCENT='#F08AB8', BLUE='#83B9FF';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function onView(el,cb,th){
    if(reduce || !('IntersectionObserver' in window)){ cb(); return; }
    var io=new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){ cb(); io.disconnect(); }});},{threshold:th||0.35});
    io.observe(el);
  }

  /* ---------------- 1. Unlock bars ---------------- */
  function unlockBars(host){
    var H=290;
    var cols=[
      {x:'A alone', note:'sensitiser', segs:[{h:0.06,c:PAL[4]}], cap:'–'},
      {x:'B alone', note:'active agent', segs:[{h:0.30,c:PAL[3]}], cap:'+'},
      {x:'A + B', note:'synergy', segs:[{h:0.60,c:PAL[1]},{h:0.30,c:PAL[2]}], cap:'××'}
    ];
    host.innerHTML=cols.map(function(col){
      var stack=col.segs.map(function(s,si){
        var top=(si===col.segs.length-1);
        var cap=top?'<span class="cap">'+col.cap+'</span>':'';
        return '<div class="bar seg" data-h="'+s.h+'" style="background:'+s.c+';border-radius:'+(top?'4px 4px 0 0':'0')+'">'+cap+'</div>';
      }).join('');
      return '<div class="bar-col"><div class="bar-stack">'+stack+'</div>'+
             '<div class="bar-x">'+col.x+'</div><div class="bar-note">'+col.note+'</div></div>';
    }).join('');
    onView(host,function(){
      setTimeout(function(){
        host.querySelectorAll('.bar.seg').forEach(function(b){
          b.style.height=(parseFloat(b.getAttribute('data-h'))*H)+'px';
          var c=b.querySelector('.cap'); if(c) c.style.opacity='1';
        });
      }, reduce?0:120);
    });
  }

  /* ---------------- 2. Combination-share gauge ---------------- */
  function shareGauge(host){
    var size=224, sw=17, r=(size-sw)/2, cx=size/2, cy=size/2, C=2*Math.PI*r, pct=0.339;
    host.innerHTML=
      '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" style="max-width:224px;height:auto" role="img" aria-label="About 34 percent of FDA solid-tumour approvals from 2011 to 2023 were combination regimens">'+
      '<defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1">'+
      '<stop offset="0" stop-color="#F6C982"/><stop offset="0.5" stop-color="#EC7EA6"/><stop offset="1" stop-color="#96509A"/></linearGradient></defs>'+
      '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#2A2A30" stroke-width="'+sw+'"/>'+
      '<circle class="gauge-arc" cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="url(#gg)" stroke-width="'+sw+'" stroke-linecap="round" transform="rotate(-90 '+cx+' '+cy+')" stroke-dasharray="'+C+'" stroke-dashoffset="'+C+'"/>'+
      '<text x="'+cx+'" y="'+(cy-1)+'" text-anchor="middle" font-family="Source Serif 4,serif" font-weight="300" font-size="52" letter-spacing="-2" fill="#F2EFEA">34%</text>'+
      '<text x="'+cx+'" y="'+(cy+26)+'" text-anchor="middle" font-family="Geist Mono,monospace" font-size="11.5" letter-spacing="3" fill="#B0ACA4">1 IN 3</text>'+
      '</svg>';
    var arc=host.querySelector('.gauge-arc'), target=C*(1-pct);
    if(reduce){ arc.style.strokeDashoffset=target; return; }
    onView(host,function(){ arc.style.transition='stroke-dashoffset 1.5s cubic-bezier(.2,.7,.2,1)'; arc.style.strokeDashoffset=target; },0.4);
  }

  /* ---------------- 3. Interactive Muller ---------------- */
  function muller(fig){
    var host=fig.querySelector('.muller-chart'); if(!host) return;
    var W=1000,H=520;
    var COMBO=[
      [0.00,[0.00,0.00,0.02,0.12,0.06,0.80]],[0.12,[0.02,0.01,0.06,0.13,0.05,0.73]],
      [0.28,[0.08,0.05,0.12,0.14,0.03,0.58]],[0.48,[0.18,0.12,0.20,0.14,0.01,0.35]],
      [0.68,[0.14,0.09,0.34,0.12,0.00,0.31]],[0.84,[0.11,0.07,0.46,0.10,0.00,0.26]],
      [1.00,[0.10,0.06,0.55,0.08,0.00,0.21]]
    ];
    var MONO=[
      [0.00,[0.00,0.00,0.02,0.10,0.08,0.80]],[0.12,[0.03,0.02,0.03,0.10,0.12,0.70]],
      [0.28,[0.09,0.05,0.04,0.09,0.24,0.49]],[0.48,[0.06,0.04,0.04,0.08,0.41,0.37]],
      [0.68,[0.04,0.02,0.03,0.07,0.55,0.29]],[0.84,[0.02,0.01,0.02,0.06,0.66,0.23]],
      [1.00,[0.01,0.01,0.02,0.05,0.74,0.17]]
    ];
    var LABELS=[
      {n:'CD8⁺ cytotoxic T',g:'Immune effectors'},{n:'CD4⁺ helper / NK',g:'Immune support'},
      {n:'Normalised stroma',g:'Healthy tissue'},{n:'Reactive CAF',g:'Fibrotic stroma'},
      {n:'Resistant subclone',g:'Escape population'},{n:'Bulk tumour',g:'Sensitive cancer'}
    ];
    function lerp(a,b,m){ return a+(b-a)*m; }
    function anchorsAt(m){ return COMBO.map(function(ca,i){ return [ca[0], ca[1].map(function(v,j){ return lerp(MONO[i][1][j],v,m); })]; }); }
    function layerPath(tops,bots){
      var d='M'+tops[0][0]+','+tops[0][1]+' ',i,p0,p1,dx;
      for(i=1;i<tops.length;i++){ p0=tops[i-1];p1=tops[i];dx=p1[0]-p0[0];
        d+='C'+(p0[0]+dx*0.5)+','+p0[1]+' '+(p1[0]-dx*0.5)+','+p1[1]+' '+p1[0]+','+p1[1]+' '; }
      d+='L'+bots[bots.length-1][0]+','+bots[bots.length-1][1]+' ';
      for(i=bots.length-2;i>=0;i--){ p0=bots[i+1];p1=bots[i];dx=p1[0]-p0[0];
        d+='C'+(p0[0]+dx*0.5)+','+p0[1]+' '+(p1[0]-dx*0.5)+','+p1[1]+' '+p1[0]+','+p1[1]+' '; }
      return d+'Z';
    }
    function paths(m){
      var A=anchorsAt(m),N=6,tops=[],bots=[],i;
      for(i=0;i<N;i++){ tops.push([]); bots.push([]); }
      A.forEach(function(a){ var t=a[0],f=a[1],cum=0; for(i=0;i<N;i++){ tops[i].push([t*W,cum*H]); bots[i].push([t*W,(cum+f[i])*H]); cum+=f[i]; } });
      return tops.map(function(_,i){ return layerPath(tops[i],bots[i]); });
    }
    var marks='';
    [0,12,24,36].forEach(function(mo,i){ var x=i/3*W;
      marks+='<line x1="'+x+'" y1="0" x2="'+x+'" y2="'+H+'" stroke="#F2EFEA" stroke-opacity="0.12"/>'+
             '<text x="'+(i===3?x-8:x+8)+'" y="'+(H-8)+'" text-anchor="'+(i===3?'end':'start')+'" font-family="Geist Mono,monospace" font-size="12" fill="#F2EFEA" fill-opacity="0.5" letter-spacing="1">'+mo+' mo</text>';
    });
    var init=paths(1), ps='';
    init.forEach(function(d,i){ ps+='<path class="mband" data-i="'+i+'" d="'+d+'" fill="'+PAL[i]+'"/>'; });
    host.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" style="width:100%;height:clamp(280px,42vw,460px);display:block" role="img" aria-label="Interactive Muller plot of tumour evolution over 36 months">'+ps+marks+'</svg>';

    var leg=fig.querySelector('.muller-legend');
    if(leg) leg.innerHTML=LABELS.map(function(l,i){ return '<span style="color:'+PAL[i]+'"><i class="dot"></i><span style="color:var(--muted)">'+l.n+'</span></span>'; }).join('');

    var tt=fig.querySelector('.tt'), bands=host.querySelectorAll('.mband');
    bands.forEach(function(p){
      var i=+p.getAttribute('data-i'); p.style.cursor='crosshair';
      p.addEventListener('mousemove',function(ev){ var r=fig.getBoundingClientRect();
        tt.innerHTML='<div class="tt-h">'+LABELS[i].n+'</div><div class="tt-d">'+LABELS[i].g+'</div>';
        tt.style.left=(ev.clientX-r.left)+'px'; tt.style.top=(ev.clientY-r.top)+'px'; tt.style.opacity='1'; });
      p.addEventListener('mouseleave',function(){ tt.style.opacity='0'; });
    });

    var state=1, raf=null;
    var bMono=fig.querySelector('[data-mode="mono"]'), bCombo=fig.querySelector('[data-mode="combo"]');
    var intro=fig.querySelector('.muller-intro');
    var COPY={
      1:'A rationally combined regimen: the resistant subclone (violet) never gets its opening, the bulk tumour falls to a small residual, and normalised stroma and immune effectors take over. Durable control at 36 months.',
      0:'A single active agent: sensitive tumour shrinks early, but the resistant subclone (violet) expands into the cleared space and drives relapse well before 36 months.'
    };
    function render(m){ var ds=paths(m); bands.forEach(function(b,i){ b.setAttribute('d',ds[i]); }); }
    function animateTo(t){
      if(reduce || document.hidden){ state=t; render(t); return; }
      var start=state,t0=null,dur=760; if(raf) cancelAnimationFrame(raf);
      function step(ts){ if(!t0)t0=ts; var k=Math.min(1,(ts-t0)/dur); var e=k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
        render(start+(t-start)*e); if(k<1){ raf=requestAnimationFrame(step); } else { state=t; } }
      raf=requestAnimationFrame(step);
    }
    function set(t){ if(bCombo) bCombo.setAttribute('aria-pressed',t===1?'true':'false'); if(bMono) bMono.setAttribute('aria-pressed',t===0?'true':'false'); if(intro) intro.textContent=COPY[t]; animateTo(t); }
    if(bMono) bMono.addEventListener('click',function(){ set(0); });
    if(bCombo) bCombo.addEventListener('click',function(){ set(1); });
    if(intro) intro.textContent=COPY[1];
    render(1);
    if(!reduce){
      var seen=false;
      var mo=new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting && !seen){ seen=true; state=0; render(0); setTimeout(function(){ animateTo(1); },450); mo.disconnect(); }});},{threshold:0.4});
      mo.observe(host);
    }
  }

  /* ---------------- 4. Interactive Pareto ---------------- */
  function pareto(fig){
    var host=fig.querySelector('.pareto-chart'); if(!host) return;
    var W=760,H=470,pad={l:56,r:26,t:28,b:58}, iw=W-pad.l-pad.r, ih=H-pad.t-pad.b;
    var P=[
      {x:1.3,y:2.1,label:'Single targeted agent',drugs:'solo kinase inhibitor',note:'Low toxicity, limited durability once resistance emerges.',front:false},
      {x:2.2,y:3.6,label:'Checkpoint monotherapy',drugs:'anti-PD-1 · pembrolizumab / nivolumab',note:'Transformative in a minority; most tumours do not respond alone.',front:true},
      {x:3.1,y:3.0,label:'Chemotherapy doublet',drugs:'platinum backbone',note:'Broad activity, real toxicity, short-lived benefit.',front:false},
      {x:4.3,y:5.5,label:'Checkpoint + chemotherapy',drugs:'anti-PD-1 + platinum · KEYNOTE-189/407',note:'First-line standard across several solid tumours.',front:true},
      {x:3.6,y:4.5,label:'TROP2 ADC',drugs:'datopotamab deruxtecan · TOPO-1 payload',note:'ADC backbone, now paired with checkpoint blockade.',front:false},
      {x:6.5,y:6.9,label:'Dual checkpoint',drugs:'nivolumab + ipilimumab · PD-1 + CTLA-4',note:'Durable in melanoma; substantial immune toxicity.',front:true},
      {x:5.0,y:6.2,label:'ADC + checkpoint',drugs:'sacituzumab govitecan + pembrolizumab',note:'Leading current combination hypothesis (ASCENT-04).',front:true},
      {x:4.4,y:5.0,label:'KRAS G12C + EGFR',drugs:'sotorasib + panitumumab · CodeBreaK 300',note:'Feedback EGFR reactivation makes the partner essential.',front:false},
      {x:8.3,y:7.0,label:'Empirical triplet',drugs:'three-agent, maximum tolerated',note:'More is not free: toxicity and dropout climb fast.',front:false},
      {x:4.6,y:8.5,label:'Designed combination',drugs:'Big Picture Bio · model-selected',note:'Chosen to sit above the frontier: maximum benefit for its complexity.',front:true,star:true}
    ];
    function X(v){ return pad.l+v/10*iw; }
    function Y(v){ return pad.t+(1-v/10)*ih; }
    var fr=P.filter(function(p){return p.front;}).slice().sort(function(a,b){return a.x-b.x;});
    var frLine=fr.map(function(p,i){ return (i?'L':'M')+X(p.x)+','+Y(p.y); }).join(' ');
    var grid='';
    for(var g=0;g<=10;g+=2){
      grid+='<line x1="'+X(g)+'" y1="'+pad.t+'" x2="'+X(g)+'" y2="'+(H-pad.b)+'" stroke="#2A2A30"/>';
      grid+='<line x1="'+pad.l+'" y1="'+Y(g)+'" x2="'+(W-pad.r)+'" y2="'+Y(g)+'" stroke="#2A2A30"/>';
    }
    function star(cx,cy,r){ var pts=[]; for(var i=0;i<10;i++){ var a=Math.PI/5*i-Math.PI/2, rr=i%2?r*0.44:r; pts.push((cx+rr*Math.cos(a)).toFixed(1)+','+(cy+rr*Math.sin(a)).toFixed(1)); } return '<polygon points="'+pts.join(' ')+'" fill="'+ACCENT+'"/>'; }
    var dots='';
    P.forEach(function(p,i){ var cx=X(p.x),cy=Y(p.y);
      if(p.star){
        dots+='<g class="pt" data-i="'+i+'" style="cursor:pointer">'+
          '<circle cx="'+cx+'" cy="'+cy+'" r="17" fill="'+ACCENT+'" fill-opacity="0.12"/>'+
          '<circle cx="'+cx+'" cy="'+cy+'" r="11" fill="none" stroke="'+BLUE+'" stroke-width="1.4" stroke-opacity="0.7"/>'+
          star(cx,cy,9)+
          '<text x="'+(cx+17)+'" y="'+(cy+4)+'" font-family="Geist,sans-serif" font-weight="600" font-size="13" fill="#fff">Designed combination</text></g>';
      } else {
        var col=p.front?'#F19A6C':'#96509A';
        dots+='<g class="pt" data-i="'+i+'" style="cursor:pointer"><circle cx="'+cx+'" cy="'+cy+'" r="6.5" fill="'+col+'" stroke="#08090c" stroke-width="1.5"/></g>';
      }
    });
    var axis=
      '<text x="'+pad.l+'" y="'+(H-16)+'" font-family="Geist Mono,monospace" font-size="11" fill="#B0ACA4" letter-spacing="1.5">REGIMEN COMPLEXITY · TOXICITY →</text>'+
      '<text transform="translate(16 '+(pad.t+ih)+') rotate(-90)" font-family="Geist Mono,monospace" font-size="11" fill="#B0ACA4" letter-spacing="1.5">CLINICAL BENEFIT →</text>'+
      '<text x="'+(W-pad.r)+'" y="'+(pad.t+4)+'" text-anchor="end" font-family="Geist,sans-serif" font-size="12" fill="#8A857E">better ↖ design target</text>';
    host.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block;overflow:visible" role="img" aria-label="Pareto trade-off of clinical benefit against regimen complexity, with a model-designed combination above the efficient frontier">'+
      grid+'<path d="'+frLine+'" fill="none" stroke="'+ACCENT+'" stroke-width="1.6" stroke-dasharray="5 5" stroke-opacity="0.7"/>'+dots+axis+'</svg>';

    var tt=fig.querySelector('.tt');
    function show(i,cx,cy){ var p=P[i],r=fig.getBoundingClientRect();
      tt.innerHTML='<div class="tt-h">'+p.label+'</div><div class="tt-d">'+p.drugs+'</div><div class="tt-b">'+p.note+'</div>';
      tt.style.left=(cx-r.left)+'px'; tt.style.top=(cy-r.top)+'px'; tt.style.opacity='1'; }
    host.querySelectorAll('.pt').forEach(function(g){ var i=+g.getAttribute('data-i');
      g.addEventListener('mousemove',function(ev){ show(i,ev.clientX,ev.clientY); });
      g.addEventListener('mouseenter',function(ev){ show(i,ev.clientX,ev.clientY); });
      g.addEventListener('click',function(ev){ show(i,ev.clientX,ev.clientY); });
      g.addEventListener('mouseleave',function(){ tt.style.opacity='0'; });
    });
    host.addEventListener('mouseleave',function(){ tt.style.opacity='0'; });
  }

  /* ---------------- boot ---------------- */
  function boot(){
    var b=document.getElementById('unlockBars'); if(b) unlockBars(b);
    var g=document.getElementById('shareGauge'); if(g) shareGauge(g);
    var m=document.getElementById('mullerFig'); if(m) muller(m);
    var p=document.getElementById('paretoFig'); if(p) pareto(p);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
