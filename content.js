(function() {
  const oldHost = document.getElementById('clippy-host');
  if (oldHost) oldHost.remove();

  const host = document.createElement('div');
  host.id = 'clippy-host';
  host.style.position = 'fixed'; host.style.bottom = '20px'; host.style.right = '20px';
  host.style.width = '280px'; host.style.height = '400px'; host.style.zIndex = '2147483647';
  document.body.appendChild(host);

  const launcher = document.createElement('button');
  launcher.id = 'clippy-launcher';
  launcher.textContent = '📎';
  launcher.style.position = 'fixed'; launcher.style.bottom = '20px'; launcher.style.right = '20px';
  launcher.style.width = '50px'; launcher.style.height = '50px'; launcher.style.background = '#4f46e5';
  launcher.style.color = 'white'; launcher.style.border = 'none'; launcher.style.borderRadius = '50%';
  launcher.style.cursor = 'move'; launcher.style.display = 'none'; launcher.style.zIndex = '2147483646';
  launcher.style.display = 'flex'; launcher.style.alignItems = 'center'; launcher.style.justifyContent = 'center'; launcher.style.fontSize = '24px';
  document.body.appendChild(launcher);

  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      #clippy-root { width: 100%; height: 100%; background: white; border: 2px solid #4f46e5; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; position: relative; }
      .clippy-header { background: #4f46e5; color: white; padding: 5px 12px; cursor: move; font-weight: bold; font-size: 12px; display: flex; justify-content: space-between; align-items: center; }
      #clippy-resizer { position: absolute; bottom: 0; right: 0; width: 15px; height: 15px; cursor: se-resize; background: #4f46e5; clip-path: polygon(100% 0, 100% 100%, 0 100%); }
      .hidden { display: none !important; } .visible { display: flex !important; }
      #main-ui { padding: 10px; flex-direction: column; flex: 1; gap: 8px; box-sizing: border-box; }
      #clippy-settings { padding: 10px; display: none; flex-direction: column; gap: 4px; flex: 1; font-size: 11px; }
      textarea { width: 100%; flex: 1; border: 1px solid #ccc; border-radius: 6px; padding: 8px; resize: none; box-sizing: border-box; }
      #clippy-notes { flex: 0 0 30%; }
      #clippy-scan-btn { background: #10b981; color: white; border: none; padding: 8px; border-radius: 6px; font-weight: bold; cursor: pointer; }
    </style>
    <div id="clippy-root">
      <div class="clippy-header" id="clippy-drag">Clippy <div><button id="clippy-settings-btn" style="background:none;border:none;color:white;cursor:pointer">⚙️</button><button id="clippy-close" style="background:none;border:none;color:white;cursor:pointer">×</button></div></div>
      <div id="clippy-resizer"></div>
      <div id="main-ui" class="visible">
        <textarea id="clippy-notes" placeholder="Notes..."></textarea>
        <button id="clippy-scan-btn">SUMMARY</button>
        <textarea id="clippy-resume" readonly placeholder="Results..."></textarea>
      </div>
      <div id="clippy-settings" class="hidden">
        <label>Top Bar: <input type="color" id="color-header" value="#4f46e5"></label>
        <label>Button: <input type="color" id="color-btn" value="#10b981"></label>
        <label>BG: <input type="color" id="color-bg" value="#ffffff"></label>
        <label>Text BG: <input type="color" id="color-area-bg" value="#f9f9f9"></label>
        <label>Launcher: <input type="color" id="color-launcher" value="#4f46e5"></label>
        <label>Text: <input type="color" id="color-text" value="#333333"></label>
        <button id="save-colors">Apply Colors</button>
      </div>
    </div>
  `;

  const ui = shadow.getElementById('main-ui'), set = shadow.getElementById('clippy-settings'), header = shadow.querySelector('.clippy-header'), resizer = shadow.getElementById('clippy-resizer'), scanBtn = shadow.getElementById('clippy-scan-btn'), root = shadow.getElementById('clippy-root'), notes = shadow.getElementById('clippy-notes'), resume = shadow.getElementById('clippy-resume');

  function applyColors(s) {
    header.style.background = resizer.style.background = s.h;
    scanBtn.style.background = s.b;
    root.style.borderColor = s.h;
    root.style.backgroundColor = s.bg;
    notes.style.color = resume.style.color = s.txt;
    notes.style.backgroundColor = resume.style.backgroundColor = s.abg;
    launcher.style.background = s.l;
  }

  shadow.getElementById('save-colors').onclick = () => {
    const s = { h: shadow.getElementById('color-header').value, b: shadow.getElementById('color-btn').value, bg: shadow.getElementById('color-bg').value, txt: shadow.getElementById('color-text').value, abg: shadow.getElementById('color-area-bg').value, l: shadow.getElementById('color-launcher').value };
    browser.runtime.sendMessage({ action: "save", data: s });
    applyColors(s);
    ui.classList.toggle('visible'); ui.classList.toggle('hidden');
    set.classList.toggle('visible'); set.classList.toggle('hidden');
  };

  browser.runtime.sendMessage({ action: "get" }).then(res => res && res.clippySettings && applyColors(res.clippySettings));

  shadow.getElementById('clippy-settings-btn').onclick = () => { ui.classList.toggle('visible'); ui.classList.toggle('hidden'); set.classList.toggle('visible'); set.classList.toggle('hidden'); };
  shadow.getElementById('clippy-close').onclick = () => { host.style.display = 'none'; launcher.style.display = 'flex'; };
  
  let moved = false;
  launcher.onmousedown = (e) => { moved = false; lDragging = true; lX = e.clientX - launcher.offsetLeft; lY = e.clientY - launcher.offsetTop; };
  launcher.onclick = () => { if (!moved) { host.style.display = 'block'; launcher.style.display = 'none'; } };

  scanBtn.onclick = () => {
    const paras = Array.from(document.querySelectorAll('p')).filter(p => p.innerText.split(' ').length > 20);
    const words = paras.flatMap(p => p.innerText.toLowerCase().split(/\W+/));
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const ranked = paras.map(p => ({text: p.innerText.trim(), score: p.innerText.toLowerCase().split(/\W+/).reduce((acc, w) => acc + (freq[w] || 0), 0)}))
      .sort((a,b) => b.score - a.score).slice(0, 3).map(i => i.text).join('\n\n');
    resume.value = ranked || "No significant text found.";
  };

  let dragging = false, resizing = false, lDragging = false, startX, startY, startW, startH, lX, lY;
  header.onmousedown = (e) => { dragging = true; startX = e.clientX - host.offsetLeft; startY = e.clientY - host.offsetTop; };
  resizer.onmousedown = (e) => { resizing = true; startX = e.clientX; startY = e.clientY; startW = host.offsetWidth; startH = host.offsetHeight; e.stopPropagation(); };
  
  window.onmousemove = (e) => {
    if (dragging) { host.style.left = (e.clientX - startX) + 'px'; host.style.top = (e.clientY - startY) + 'px'; }
    else if (resizing) { host.style.width = (startW + e.clientX - startX) + 'px'; host.style.height = (startH + e.clientY - startY) + 'px'; }
    else if (lDragging) { 
      moved = true; 
      launcher.style.left = (e.clientX - lX) + 'px'; 
      launcher.style.top = (e.clientY - lY) + 'px'; 
      launcher.style.right = 'auto'; launcher.style.bottom = 'auto'; 
    }
  };
  window.onmouseup = () => { dragging = false; resizing = false; lDragging = false; };
})();
