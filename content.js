(function() {
  const oldHost = document.getElementById('clippy-host');
  if (oldHost) oldHost.remove();

  const host = document.createElement('div');
  host.id = 'clippy-host';
  host.style.position = 'fixed';
  host.style.bottom = '20px';
  host.style.right = '20px';
  host.style.width = '280px';
  host.style.height = '400px';
  host.style.zIndex = '2147483647';
  document.body.appendChild(host);

  const launcher = document.createElement('button');
  launcher.id = 'clippy-launcher';
  launcher.textContent = '📎';
  launcher.style.position = 'fixed';
  launcher.style.top = '20px';
  launcher.style.right = '20px';
  launcher.style.width = '40px';
  launcher.style.height = '40px';
  launcher.style.background = '#4f46e5';
  launcher.style.color = 'white';
  launcher.style.border = 'none';
  launcher.style.borderRadius = '50%';
  launcher.style.cursor = 'pointer';
  launcher.style.display = 'none';
  launcher.style.zIndex = '2147483646';
  document.body.appendChild(launcher);

  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      #clippy-root { width: 100%; height: 100%; background: white; border: 2px solid #4f46e5; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; position: relative; }
      .clippy-header { background: #4f46e5; color: white; padding: 5px 12px; cursor: move; font-weight: bold; font-size: 12px; display: flex; justify-content: space-between; align-items: center; }
      button { cursor: pointer; }
      #clippy-settings-btn, #clippy-close { background: none; border: none; color: white; font-weight: bold; }
      #clippy-resizer { position: absolute; bottom: 0; right: 0; width: 15px; height: 15px; cursor: se-resize; background: #4f46e5; clip-path: polygon(100% 0, 100% 100%, 0 100%); }
      
      .hidden { display: none !important; }
      .visible { display: flex !important; }

      #main-ui { padding: 10px; flex-direction: column; flex: 1; gap: 8px; }
      #clippy-settings { padding: 10px; display: none; flex-direction: column; gap: 4px; flex: 1; font-size: 11px; }
      
      textarea { width: 100%; border: 1px solid #ccc; border-radius: 6px; padding: 8px; font-size: 12px; resize: none; box-sizing: border-box; }
      #clippy-notes { flex: 0 0 80px; }
      #clippy-resume { flex: 1; }
      #clippy-scan-btn { background: #10b981; color: white; border: none; padding: 8px; border-radius: 6px; font-weight: bold; }
    </style>
    <div id="clippy-root">
      <div class="clippy-header" id="clippy-drag">Clippy 
        <div><button id="clippy-settings-btn">⚙️</button><button id="clippy-close">×</button></div>
      </div>
      <div id="clippy-resizer"></div>
      <div id="main-ui" class="visible">
        <textarea id="clippy-notes" placeholder="Notes..."></textarea>
        <button id="clippy-scan-btn">SUMMARY</button>
        <textarea id="clippy-resume" readonly placeholder="Results..."></textarea>
      </div>
      <div id="clippy-settings">
        <label>Top Bar: <input type="color" id="color-header" value="#4f46e5"></label>
        <label>Button: <input type="color" id="color-btn" value="#10b981"></label>
        <label>Background: <input type="color" id="color-bg" value="#ffffff"></label>
        <label>Text: <input type="color" id="color-text" value="#333333"></label>
        <label>Area BG: <input type="color" id="color-area-bg" value="#f9f9f9"></label>
        <label>Area Border: <input type="color" id="color-area-border" value="#cccccc"></label>
        <button id="save-colors">Apply Colors</button>
      </div>
    </div>
  `;

  const ui = shadow.getElementById('main-ui'), set = shadow.getElementById('clippy-settings'), header = shadow.querySelector('.clippy-header'), resizer = shadow.getElementById('clippy-resizer'), scanBtn = shadow.getElementById('clippy-scan-btn'), root = shadow.getElementById('clippy-root'), notes = shadow.getElementById('clippy-notes'), resume = shadow.getElementById('clippy-resume');

  shadow.getElementById('clippy-settings-btn').onclick = () => { ui.classList.toggle('visible'); ui.classList.toggle('hidden'); set.classList.toggle('visible'); set.classList.toggle('hidden'); };
  shadow.getElementById('clippy-close').onclick = () => { host.style.display = 'none'; launcher.style.display = 'block'; };
  launcher.onclick = () => { host.style.display = 'block'; launcher.style.display = 'none'; };

  shadow.getElementById('save-colors').onclick = () => {
    const h = shadow.getElementById('color-header').value, b = shadow.getElementById('color-btn').value, bg = shadow.getElementById('color-bg').value, txt = shadow.getElementById('color-text').value, abg = shadow.getElementById('color-area-bg').value, ab = shadow.getElementById('color-area-border').value;
    header.style.background = resizer.style.background = h;
    scanBtn.style.background = b;
    root.style.borderColor = h;
    root.style.backgroundColor = bg;
    notes.style.color = resume.style.color = txt;
    notes.style.backgroundColor = resume.style.backgroundColor = abg;
    notes.style.borderColor = resume.style.borderColor = ab;
  };

  scanBtn.onclick = () => { resume.value = Array.from(document.querySelectorAll('p')).map(p => p.innerText.trim()).filter(t => t.length > 100).slice(0, 3).join(" ") || "No text found."; };

  let dragging = false, resizing = false, ox, oy, sw, sh;
  shadow.getElementById('clippy-drag').onmousedown = (e) => { dragging = true; ox = e.clientX - host.offsetLeft; oy = e.clientY - host.offsetTop; };
  resizer.onmousedown = (e) => { resizing = true; ox = e.clientX; oy = e.clientY; sw = host.offsetWidth; sh = host.offsetHeight; e.stopPropagation(); };
  window.onmousemove = (e) => {
    if (dragging) { host.style.left = (e.clientX - ox) + 'px'; host.style.top = (e.clientY - oy) + 'px'; }
    else if (resizing) { host.style.width = Math.max(150, sw + (e.clientX - ox)) + 'px'; host.style.height = Math.max(200, sh + (e.clientY - oy)) + 'px'; }
  };
  window.onmouseup = () => { dragging = false; resizing = false; };
})();
