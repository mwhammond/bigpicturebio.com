/* ===========================================================================
   Big Picture Bio — shared site behaviour
   Nav/footer injection · Muller streamgraph · charts · scroll journey ·
   reveal-on-scroll · dropdown · page-fade transitions · lead-magnet.
   =========================================================================== */
(function(){
  "use strict";

  /* ---------------- Site config (single source of truth) ---------------- */
  var SOLUTIONS = [
    ["/solutions/clinical-development.html",       "Clinical Development",        "Design the trial that reads out"],
    ["/solutions/competitive-intelligence.html",   "Competitive Intelligence",    "Read the field by its mechanism"],
    ["/solutions/investment-partnering-dd.html",   "Investment &amp; partnering DD","A verdict, not a guess"],
    ["/solutions/lifecycle-franchise-strategy.html","Lifecycle &amp; Franchise Strategy","Keep your asset the standard"],
    ["/solutions/platform-payload-strategy.html",  "Platform &amp; Payload Strategy","Point your platform at the target"]
  ];
  var LATEST = [
    // {tag, date, text, href} — newest first; wire real items here as they land.
    {tag:"Publication", date:"2026", text:"Cell paper on the reasoning world model — in press", href:"/company.html"},
    {tag:"Result",      date:"2026", text:"87% prospective validation across novel ASCO combinations", href:"/solutions/clinical-development.html"},
    {tag:"Partnership", date:"2026", text:"First pilot partnership signed with a biotech", href:"/pipeline.html"},
    {tag:"Pipeline",    date:"2026", text:"Top-10 pharma in early discussion", href:"/pipeline.html"}
  ];

  var path = location.pathname.replace(/index\.html$/,"").replace(/\/$/,"") || "/";
  function isCurrent(href){ var h=href.replace(/\/$/,"")||"/"; return h===path; }

  /* ---------------- NAV ---------------- */
  function buildNav(){
    var host = document.getElementById("site-nav"); if(!host) return;
    var solItems = SOLUTIONS.map(function(s){
      return '<a href="'+s[0]+'">'+s[1]+'<small>'+s[2]+'</small></a>';
    }).join("");
    var onSolutions = path.indexOf("/solutions/")===0;
    host.innerHTML =
      '<nav class="nav" id="nav">'+
        '<a class="wordmark" href="/" aria-label="Big Picture Bio home"><img src="/assets/brand/logos/logo-ivory.svg" alt="Big Picture Bio" width="230" height="36"></a>'+
        '<button class="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></button>'+
        '<div class="nav-links">'+
          '<div class="nav-item'+(onSolutions?" current":"")+'" id="solItem">'+
            '<button aria-haspopup="true">Solutions <span class="chev"></span></button>'+
            '<div class="nav-menu">'+solItems+'</div>'+
          '</div>'+
          '<a href="/pipeline.html"'+(isCurrent("/pipeline.html")?' class="current"':'')+'>Pipeline</a>'+
          '<a href="/company.html"'+(isCurrent("/company.html")?' class="current"':'')+'>Company</a>'+
          '<a href="/#contact">Contact</a>'+
        '</div>'+
      '</nav>';

    var nav = document.getElementById("nav");
    var toggle = nav.querySelector(".nav-toggle");
    toggle.addEventListener("click", function(){ nav.classList.toggle("menu-open"); });

    // dropdown (click on desktop, tap on mobile)
    var solItem = document.getElementById("solItem");
    var solBtn = solItem.querySelector("button");
    solBtn.addEventListener("click", function(e){ e.stopPropagation(); solItem.classList.toggle("open"); });
    document.addEventListener("click", function(e){
      if(!solItem.contains(e.target) && window.innerWidth>860) solItem.classList.remove("open");
    });

    // solid background after scroll
    function onScroll(){ nav.classList.toggle("solid", window.scrollY>40); }
    window.addEventListener("scroll", onScroll, {passive:true}); onScroll();
  }

  /* ---------------- CONTACT + FOOTER ---------------- */
  function buildContact(){
    var host = document.getElementById("site-contact"); if(!host) return;
    host.innerHTML =
      '<section class="contact" id="contact">'+
        '<div class="contact-inner">'+
          '<div class="eyebrow"><span class="bar"></span>Get in touch</div>'+
          '<h2>Let’s turn months into <span class="accent">decades</span>.</h2>'+
          '<div class="contact-emails">'+
            '<a href="mailto:partnerships@bigpicturebio.com">partnerships@bigpicturebio.com</a>'+
          '</div>'+
        '</div>'+
      '</section>';
  }

  function buildFooter(){
    var host = document.getElementById("site-footer"); if(!host) return;
    var solLinks = SOLUTIONS.map(function(s){ return '<a href="'+s[0]+'">'+s[1]+'</a>'; }).join("");
    var latest = LATEST.map(function(l){
      return '<a href="'+l.href+'"><span class="tag">'+l.tag+'</span><span class="date">'+l.date+'</span><span class="t">'+l.text+'</span></a>';
    }).join("");
    var year = new Date().getFullYear();
    host.innerHTML =
      '<footer class="footer">'+
        '<div class="footer-inner">'+
          '<div>'+
            '<div class="fm"><img src="/assets/brand/logos/logo-ivory.svg" alt="Big Picture Bio" width="230" height="36"></div>'+
            '<p class="ftag">Mechanistic prediction for novel synergistic combinations beyond the reach of conventional machine learning.</p>'+
          '</div>'+
          '<div class="fcol"><h4>Solutions</h4>'+solLinks+'</div>'+
          '<div class="fcol">'+
            '<h4>Company</h4>'+
            '<a href="/pipeline.html">Pipeline</a>'+
            '<a href="/company.html">Company</a>'+
            '<a href="/#contact">Contact</a>'+
          '</div>'+
          '<div class="fcol flatest"><h4>Latest</h4>'+latest+'</div>'+
        '</div>'+
        '<div class="footer-base">'+
          '<span>&copy; '+year+' Big Picture Bio</span>'+
          '<span>partnerships@bigpicturebio.com</span>'+
        '</div>'+
      '</footer>';
  }

  /* ---------------- Muller streamgraph ---------------- */
  var PALETTE = ['#F6C982','#F19A6C','#EC7EA6','#CE6BA0','#96509A','#52223F'];
  var ANCHORS = [
    [0.00,[0.00,0.00,0.02,0.12,0.06,0.80]],
    [0.12,[0.02,0.01,0.06,0.13,0.05,0.73]],
    [0.28,[0.08,0.05,0.12,0.14,0.03,0.58]],
    [0.48,[0.18,0.12,0.20,0.14,0.01,0.35]],
    [0.68,[0.14,0.09,0.34,0.12,0.00,0.31]],
    [0.84,[0.11,0.07,0.46,0.10,0.00,0.26]],
    [1.00,[0.10,0.06,0.55,0.08,0.00,0.21]]
  ];
  function buildLayerPath(tops,bots){
    var d="M"+tops[0][0]+","+tops[0][1]+" ",i,p0,p1,dx;
    for(i=1;i<tops.length;i++){ p0=tops[i-1];p1=tops[i];dx=p1[0]-p0[0];
      d+="C"+(p0[0]+dx*0.5)+","+p0[1]+" "+(p1[0]-dx*0.5)+","+p1[1]+" "+p1[0]+","+p1[1]+" "; }
    d+="L"+bots[bots.length-1][0]+","+bots[bots.length-1][1]+" ";
    for(i=bots.length-2;i>=0;i--){ p0=bots[i+1];p1=bots[i];dx=p1[0]-p0[0];
      d+="C"+(p0[0]+dx*0.5)+","+p0[1]+" "+(p1[0]-dx*0.5)+","+p1[1]+" "+p1[0]+","+p1[1]+" "; }
    return d+"Z";
  }
  function mullerPaths(w,h){
    var N=PALETTE.length, tops=[], bots=[], i;
    for(i=0;i<N;i++){ tops.push([]); bots.push([]); }
    ANCHORS.forEach(function(a){ var t=a[0],frac=a[1],cum=0,top,bot;
      for(i=0;i<N;i++){ top=cum; bot=cum+frac[i]; tops[i].push([t*w,top*h]); bots[i].push([t*w,bot*h]); cum=bot; } });
    var p="";
    for(i=0;i<N;i++) p+='<path d="'+buildLayerPath(tops[i],bots[i])+'" fill="'+PALETTE[i]+'"/>';
    return p;
  }
  function mullerSVG(){
    return '<svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;display:block">'+mullerPaths(1000,1000)+'</svg>';
  }

  /* ---------------- Charts ---------------- */
  function svgEl(w,h){ return '<svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="xMidYMid meet" role="img">'; }
  function chartSurvival(host){
    var W=460,H=300,m={l:40,r:14,t:14,b:34};
    var X=function(t){return m.l+(t/60)*(W-m.l-m.r);}, Y=function(v){return m.t+(1-v/100)*(H-m.t-m.b);};
    var combo=[[0,100],[6,99],[12,96],[18,92],[24,86],[30,80],[36,73],[42,66],[48,60],[54,55],[60,51]];
    var control=[[0,100],[6,90],[12,78],[18,64],[24,51],[30,40],[36,31],[42,24],[48,19],[54,15],[60,12]];
    var actual=[[12,95],[24,84],[36,64],[48,58],[60,49]];
    var step=function(pts){ var d="M"+X(pts[0][0])+","+Y(pts[0][1]),i; for(i=1;i<pts.length;i++){ d+=" L"+X(pts[i][0])+","+Y(pts[i-1][1])+" L"+X(pts[i][0])+","+Y(pts[i][1]); } return d; };
    var s=svgEl(W,H),g,t;
    for(g=0;g<=100;g+=25){ var y=Y(g); s+='<line x1="'+m.l+'" y1="'+y+'" x2="'+(W-m.r)+'" y2="'+y+'" stroke="#fff" stroke-opacity="0.07"/>';
      s+='<text x="'+(m.l-6)+'" y="'+(y+3)+'" text-anchor="end" font-family="ui-monospace,monospace" font-size="9" fill="#B0ACA4">'+g+'</text>'; }
    for(t=0;t<=60;t+=12){ s+='<text x="'+X(t)+'" y="'+(H-12)+'" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="#B0ACA4">'+t+'</text>'; }
    s+='<text x="'+X(30)+'" y="'+(H-1)+'" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="#8A857E">Months</text>';
    s+='<path d="'+step(control)+'" fill="none" stroke="#8A7FA8" stroke-width="2"/>';
    s+='<path d="'+step(combo)+'" fill="none" stroke="#F08AB8" stroke-width="2.4"/>';
    actual.forEach(function(p){ s+='<circle cx="'+X(p[0])+'" cy="'+Y(p[1])+'" r="3.4" fill="#0A0A0A" stroke="#F08AB8" stroke-width="1.8"/>'; });
    host.innerHTML=s+"</svg>";
  }
  function chartPareto(host){
    var W=460,H=300,m={l:38,r:14,t:14,b:38};
    var X=function(c){return m.l+((c-1)/6)*(W-m.l-m.r);}, Y=function(v){return m.t+(1-v/100)*(H-m.t-m.b);};
    var pts=[[1,26,0],[2,33,0],[1,20,0],[3,30,0],[2,25,0],[4,28,0],[2,50,1],[3,57,1],[4,54,1],[1,39,1],[3,47,1],[5,52,1],[3,72,2],[4,81,2],[5,79,2],[2,64,2],[4,75,2],[5,87,2],[6,85,2]];
    var cyc=['#6B6570','#9E6FA6','#C474B8'];
    var fr=[[1,39],[2,64],[3,72],[4,81],[5,87],[6,85]];
    var s=svgEl(W,H),g,c;
    for(g=0;g<=100;g+=25){ var y=Y(g); s+='<line x1="'+m.l+'" y1="'+y+'" x2="'+(W-m.r)+'" y2="'+y+'" stroke="#fff" stroke-opacity="0.07"/>';
      s+='<text x="'+(m.l-6)+'" y="'+(y+3)+'" text-anchor="end" font-family="ui-monospace,monospace" font-size="9" fill="#B0ACA4">'+g+'</text>'; }
    for(c=1;c<=7;c++){ s+='<text x="'+X(c)+'" y="'+(H-14)+'" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="#B0ACA4">'+c+'</text>'; }
    s+='<text x="'+X(4)+'" y="'+(H-2)+'" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="#8A857E">Agents / MoA in combination</text>';
    s+='<text transform="translate(11 '+((m.t+H-m.b)/2)+') rotate(-90)" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="#8A857E">Predicted efficacy</text>';
    var fp="M"+X(fr[0][0])+","+Y(fr[0][1]),i; for(i=1;i<fr.length;i++) fp+=" L"+X(fr[i][0])+","+Y(fr[i][1]);
    s+='<path d="'+fp+'" fill="none" stroke="#F08AB8" stroke-width="1.6" stroke-dasharray="4 4" stroke-opacity="0.85"/>';
    pts.forEach(function(p){ s+='<circle cx="'+X(p[0])+'" cy="'+Y(p[1])+'" r="4" fill="'+cyc[p[2]]+'" fill-opacity="0.9"/>'; });
    fr.forEach(function(p){ s+='<circle cx="'+X(p[0])+'" cy="'+Y(p[1])+'" r="5.4" fill="none" stroke="#F08AB8" stroke-width="1.6"/>'; });
    host.innerHTML=s+"</svg>";
  }
  function chartLandscape(host){
    // simple SoC-trajectory: three regimens rising/falling share of standard of care over time
    var W=460,H=300,m={l:40,r:16,t:16,b:34};
    var X=function(t){return m.l+(t/100)*(W-m.l-m.r);}, Y=function(v){return m.t+(1-v/100)*(H-m.t-m.b);};
    var cur=[[0,72],[25,66],[50,54],[75,40],[100,28]];
    var rival=[[0,10],[25,18],[50,30],[75,44],[100,52]];
    var ours=[[0,4],[25,9],[50,16],[75,24],[100,34]];
    var line=function(pts){ var d="M"+X(pts[0][0])+","+Y(pts[0][1]),i; for(i=1;i<pts.length;i++){ var p0=pts[i-1],p1=pts[i],dx=X(p1[0])-X(p0[0]); d+=" C"+(X(p0[0])+dx*0.5)+","+Y(p0[1])+" "+(X(p1[0])-dx*0.5)+","+Y(p1[1])+" "+X(p1[0])+","+Y(p1[1]); } return d; };
    var s=svgEl(W,H),g;
    for(g=0;g<=100;g+=25){ var y=Y(g); s+='<line x1="'+m.l+'" y1="'+y+'" x2="'+(W-m.r)+'" y2="'+y+'" stroke="#fff" stroke-opacity="0.07"/>'; }
    s+='<text x="'+X(50)+'" y="'+(H-2)+'" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="#8A857E">Time →</text>';
    s+='<path d="'+line(cur)+'" fill="none" stroke="#8A7FA8" stroke-width="2.2"/>';
    s+='<path d="'+line(rival)+'" fill="none" stroke="#F19A6C" stroke-width="2.2"/>';
    s+='<path d="'+line(ours)+'" fill="none" stroke="#F08AB8" stroke-width="2.4" stroke-dasharray="5 4"/>';
    host.innerHTML=s+"</svg>";
  }
  function chartVerdict(host){
    // asset-verdict scorecard: horizontal bars for a few dimensions
    var rows=[["Mechanism supports thesis",82],["Wins in target population",64],["Needs combination partner",38],["Beats SoC at launch",57]];
    var W=460,H=250,pad=16,rowH=48,barX=0,barW=W;
    var s=svgEl(W,H);
    rows.forEach(function(r,i){ var y=pad+i*rowH;
      s+='<text x="0" y="'+(y+12)+'" font-family="Geist,sans-serif" font-size="12.5" fill="#E0DCD2">'+r[0]+'</text>';
      s+='<rect x="0" y="'+(y+20)+'" width="'+barW+'" height="8" rx="4" fill="#ffffff" fill-opacity="0.07"/>';
      var c=r[1]>=60?'#F08AB8':(r[1]>=45?'#F19A6C':'#8A7FA8');
      s+='<rect x="0" y="'+(y+20)+'" width="'+(barW*r[1]/100)+'" height="8" rx="4" fill="'+c+'"/>';
      s+='<text x="'+W+'" y="'+(y+12)+'" text-anchor="end" font-family="ui-monospace,monospace" font-size="11" fill="#B0ACA4">'+r[1]+'</text>';
    });
    host.innerHTML=s+"</svg>";
  }
  var CHARTS = {survival:chartSurvival, pareto:chartPareto, landscape:chartLandscape, verdict:chartVerdict};

  /* ---------------- Scroll journey (home) ---------------- */
  function initJourney(){
    var journey=document.getElementById("journey"); if(!journey) return;
    var scenes=[].slice.call(journey.querySelectorAll(".scene"));
    var layers=[].slice.call(journey.querySelectorAll(".layer"));
    var dots=[].slice.call(journey.querySelectorAll(".journey-dots .d"));
    var N=scenes.length, reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches, active=-1;
    function render(){
      var rect=journey.getBoundingClientRect();
      var total=journey.offsetHeight-window.innerHeight;
      var p=total>0?Math.min(Math.max(-rect.top/total,0),1):0;
      var s=p*(N-1),i;
      for(i=0;i<N;i++){ var op=Math.max(0,1-Math.abs(s-i)); scenes[i].style.opacity=op.toFixed(3);
        if(!reduce && !scenes[i].classList.contains("scene--muller")) scenes[i].style.transform="scale("+(1.02+0.06*(1-op)).toFixed(4)+")"; }
      var idx=Math.max(0,Math.min(N-1,Math.round(s)));
      if(idx!==active){ active=idx;
        layers.forEach(function(l,i){ l.classList.toggle("is-active",i===idx); });
        dots.forEach(function(d,i){ d.classList.toggle("on",i===idx); }); }
    }
    var ticking=false;
    window.addEventListener("scroll",function(){ if(ticking)return; ticking=true; requestAnimationFrame(function(){render();ticking=false;}); },{passive:true});
    window.addEventListener("resize",render); render();
  }

  /* ---------------- Lead magnet ---------------- */
  function initLeadmag(){
    [].forEach.call(document.querySelectorAll(".leadmag form"), function(form){
      form.addEventListener("submit", function(e){
        e.preventDefault();
        // TODO: POST to serverless/Formspree endpoint. For now, acknowledge.
        var card=form.closest(".lm-card") || form.parentNode;
        var note=document.createElement("div");
        note.className="lm-done";
        note.textContent="Thank you — we’ll be in touch within 24 hours.";
        form.replaceWith(note);
      });
    });
  }

  /* ---------------- Page transitions ---------------- */
  function initTransitions(){
    document.addEventListener("click", function(e){
      var a=e.target.closest && e.target.closest("a");
      if(!a) return;
      var href=a.getAttribute("href")||"";
      if(a.target==="_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
      if(href.indexOf("http")===0 || href.indexOf("mailto:")===0 || href.charAt(0)==="#") return;
      if(href.indexOf("#")>-1 && href.split("#")[0]===location.pathname) return;
      if(!href || href===location.pathname) return;
      e.preventDefault();
      document.body.classList.add("leaving");
      setTimeout(function(){ location.href=href; }, 360);
    });
  }

  /* ---------------- Boot ---------------- */
  function boot(){
    buildNav(); buildContact(); buildFooter();

    // muller backgrounds
    [].forEach.call(document.querySelectorAll(".js-muller"), function(el){ el.innerHTML=mullerSVG(); });
    // charts
    [].forEach.call(document.querySelectorAll("[data-chart]"), function(el){ var f=CHARTS[el.getAttribute("data-chart")]; if(f) f(el); });

    initJourney();
    initLeadmag();
    initTransitions();

    // reveal
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } }); },{threshold:0.15});
    [].forEach.call(document.querySelectorAll(".reveal"), function(el){ io.observe(el); });

    requestAnimationFrame(function(){ document.body.classList.add("ready"); });
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
