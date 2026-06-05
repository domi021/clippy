(function() {
  const oldHost = document.getElementById('clippy-host');
  if (oldHost) oldHost.remove();
  const oldLauncher = document.getElementById('clippy-launcher');
  if (oldLauncher) oldLauncher.remove();

  const defaultS = { h: "#4f46e5", b: "#10b981", bg: "#ffffff", txt: "#333333", abg: "#f9f9f9", l: "#4f46e5" };

  const host = document.createElement('div');
  host.id = 'clippy-host';
  host.style.cssText = 'position:fixed; bottom:20px; right:20px; width:280px; height:400px; z-index:2147483647; display:none;';
  document.body.appendChild(host);

  const launcher = document.createElement('button');
  launcher.id = 'clippy-launcher';
  launcher.textContent = '📎';
  launcher.style.cssText = 'position:fixed; bottom:20px; right:20px; width:50px; height:50px; z-index:2147483646; background:#4f46e5; color:white; border:none; border-radius:50%; cursor:move; display:flex; align-items:center; justify-content:center; font-size:24px;';
  document.body.appendChild(launcher);

  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      #clippy-root { width:100%; height:100%; background:white; border:2px solid #4f46e5; border-radius:12px; display:flex; flex-direction:column; overflow:hidden; position:relative; }
      .clippy-header { background:#4f46e5; color:white; padding:5px 12px; cursor:move; font-weight:bold; font-size:12px; display:flex; justify-content:space-between; align-items:center; }
      #clippy-resizer { position:absolute; bottom:0; right:0; width:15px; height:15px; cursor:se-resize; background:#4f46e5; clip-path:polygon(100% 0, 100% 100%, 0 100%); }
      #main-ui { padding:10px; display:flex; flex-direction:column; flex:1; gap:8px; }
      #clippy-settings { padding:10px; display:none; flex-direction:column; gap:4px; flex:1; font-size:11px; }
      textarea { width:100%; flex:1; border:1px solid #ccc; border-radius:6px; padding:8px; resize:none; box-sizing:border-box; }
      #clippy-scan-btn { background:#10b981; color:white; border:none; padding:8px; border-radius:6px; font-weight:bold; cursor:pointer; }
    </style>
    <div id="clippy-root">
      <div class="clippy-header" id="clippy-drag">Clippy <div><button id="clippy-settings-btn" style="background:none;border:none;color:white;cursor:pointer">⚙️</button><button id="clippy-close" style="background:none;border:none;color:white;cursor:pointer">×</button></div></div>
      <div id="clippy-resizer"></div>
      <div id="main-ui">
        <textarea id="clippy-notes" placeholder="Notes..."></textarea>
        <button id="clippy-scan-btn">SUMMARY</button>
        <textarea id="clippy-resume" readonly placeholder="Results..."></textarea>
      </div>
      <div id="clippy-settings">
        <label>Top Bar: <input type="color" id="color-header"></label>
        <label>Button: <input type="color" id="color-btn"></label>
        <label>BG: <input type="color" id="color-bg"></label>
        <label>Text BG: <input type="color" id="color-area-bg"></label>
        <label>Launcher: <input type="color" id="color-launcher"></label>
        <label>Text: <input type="color" id="color-text"></label>
        <button id="save-colors">Apply Colors</button>
      </div>
    </div>
  `;

  const ui = shadow.getElementById('main-ui'), set = shadow.getElementById('clippy-settings'), header = shadow.getElementById('clippy-drag'), resizer = shadow.getElementById('clippy-resizer'), scanBtn = shadow.getElementById('clippy-scan-btn'), root = shadow.getElementById('clippy-root'), notes = shadow.getElementById('clippy-notes'), resume = shadow.getElementById('clippy-resume');

  function applyColors(s) {
    const data = s || defaultS;
    header.style.background = resizer.style.background = data.h;
    scanBtn.style.background = data.b;
    root.style.borderColor = data.h;
    root.style.backgroundColor = data.bg;
    notes.style.color = resume.style.color = data.txt;
    notes.style.backgroundColor = resume.style.backgroundColor = data.abg;
    launcher.style.background = data.l;
    shadow.getElementById('color-header').value = data.h;
    shadow.getElementById('color-btn').value = data.b;
    shadow.getElementById('color-bg').value = data.bg;
    shadow.getElementById('color-area-bg').value = data.abg;
    shadow.getElementById('color-launcher').value = data.l;
    shadow.getElementById('color-text').value = data.txt;
  }

  scanBtn.onclick = () => {
    const paras = Array.from(document.querySelectorAll('p')).filter(p => p.innerText.split(' ').length > 20);
    const words = paras.flatMap(p => p.innerText.toLowerCase().split(/\W+/));
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const ranked = paras.map(p => ({text: p.innerText.trim(), score: p.innerText.toLowerCase().split(/\W+/).reduce((acc, w) => acc + (freq[w] || 0), 0)}))
      .sort((a,b) => b.score - a.score).slice(0, 3).map(i => i.text).join('\n\n');
    resume.value = ranked || "No significant text found.";
  };

  let dragging = false, resizing = false, lDragging = false, moved = false, startX, startY, startW, startH, lX, lY;
  header.onmousedown = (e) => { dragging = true; startX = e.clientX - host.offsetLeft; startY = e.clientY - host.offsetTop; };
  resizer.onmousedown = (e) => { resizing = true; startX = e.clientX; startY = e.clientY; startW = host.offsetWidth; startH = host.offsetHeight; e.stopPropagation(); };
  launcher.onmousedown = (e) => { lDragging = true; moved = false; lX = e.clientX - launcher.offsetLeft; lY = e.clientY - launcher.offsetTop; };

  window.onmousemove = (e) => {
    if (dragging) { host.style.left = (e.clientX - startX) + 'px'; host.style.top = (e.clientY - startY) + 'px'; }
    else if (resizing) { host.style.width = (startW + e.clientX - startX) + 'px'; host.style.height = (startH + e.clientY - startY) + 'px'; }
    else if (lDragging) { moved = true; launcher.style.left = (e.clientX - lX) + 'px'; launcher.style.top = (e.clientY - lY) + 'px'; }
  };
  window.onmouseup = () => { dragging = resizing = lDragging = false; };

  launcher.onclick = () => { if (!moved) { host.style.display = 'block'; launcher.style.display = 'none'; } };
  shadow.getElementById('clippy-close').onclick = () => { host.style.display = 'none'; launcher.style.display = 'flex'; };
  shadow.getElementById('clippy-settings-btn').onclick = () => { ui.style.display = (ui.style.display === 'none' ? 'flex' : 'none'); set.style.display = (set.style.display === 'flex' ? 'none' : 'flex'); };
  
  shadow.getElementById('save-colors').onclick = () => {
    const s = { h: shadow.getElementById('color-header').value, b: shadow.getElementById('color-btn').value, bg: shadow.getElementById('color-bg').value, txt: shadow.getElementById('color-text').value, abg: shadow.getElementById('color-area-bg').value, l: shadow.getElementById('color-launcher').value };
    browser.runtime.sendMessage({ action: "save", data: s });
    applyColors(s);
    ui.style.display = 'flex';
    set.style.display = 'none';
  };
  browser.runtime.sendMessage({ action: "get" }).then(res => applyColors(res ? res.clippySettings : defaultS));
})();
