/* ============================================================
   PointMe.live — Shared Scripts
   ============================================================ */

/* ===== NAV TOGGLE (hamburger) ===== */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  // Highlight active nav link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === currentPath ||
        a.getAttribute('href') === './' + currentPath) {
      a.classList.add('active');
    }
  });
});

/* ===== COMPASS ENGINE ===== */
const DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE',
              'S','SSW','SW','WSW','W','WNW','NW','NNW'];

function headingToDir(h) {
  return DIRS[Math.round(h / 22.5) % 16];
}

/**
 * Start the compass on a page.
 * @param {Object} opts - { onHeading(deg), onStatus(msg), onPermissionGranted() }
 */
async function startCompass(opts = {}) {
  const { onHeading, onStatus, onPermissionGranted } = opts;

  // iOS 13+ permission
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      if (onStatus) onStatus('Requesting sensor permission…');
      const res = await DeviceOrientationEvent.requestPermission();
      if (res !== 'granted') {
        if (onStatus) onStatus('⚠ Permission denied. Enable motion sensors in browser settings.');
        return false;
      }
    } catch (e) {
      if (onStatus) onStatus('⚠ Could not request permission: ' + e.message);
      return false;
    }
  } else if (typeof DeviceOrientationEvent === 'undefined') {
    if (onStatus) onStatus('⚠ This device does not support orientation sensors. Open on a mobile phone.');
    return false;
  }

  if (onPermissionGranted) onPermissionGranted();

  window.addEventListener('deviceorientation', (e) => {
    let heading;
    if (typeof e.webkitCompassHeading !== 'undefined' && e.webkitCompassHeading !== null) {
      heading = e.webkitCompassHeading; // iOS
    } else if (e.alpha !== null) {
      heading = 360 - e.alpha;          // Android
    } else return;

    if (onHeading) onHeading(heading);
  }, true);

  // Try auto-detect on non-iOS (no permission dialog)
  return true;
}

/* ===== COMPASS UI HELPERS ===== */
function buildCompassRoseTicks(svgId) {
  const g = document.getElementById(svgId + '-ticks');
  if (!g) return;
  const cx = 180, cy = 180, r = 156;
  for (let deg = 0; deg < 360; deg++) {
    if (deg % 5 !== 0) continue;
    const rad  = (deg - 90) * Math.PI / 180;
    const isMaj = deg % 90 === 0;
    const isMed = deg % 45 === 0;
    const isMn  = deg % 10 === 0;
    const len   = isMaj ? 20 : isMed ? 13 : isMn ? 8 : 4;
    const op    = isMaj ? 0.8 : isMed ? 0.5 : isMn ? 0.28 : 0.14;
    const sw    = isMaj ? 2.5 : isMed ? 1.5 : 1;

    const x1 = (cx + r * Math.cos(rad)).toFixed(1);
    const y1 = (cy + r * Math.sin(rad)).toFixed(1);
    const x2 = (cx + (r - len) * Math.cos(rad)).toFixed(1);
    const y2 = (cy + (r - len) * Math.sin(rad)).toFixed(1);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', 'rgba(0,255,65,0.4)');
    line.setAttribute('stroke-width', sw);
    line.setAttribute('opacity', op);
    line.setAttribute('stroke-linecap', 'round');
    g.appendChild(line);
  }
}

/* ===== FULLSCREEN TOGGLE ===== */
function initFullscreenBtn(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      btn.textContent = '⊠';
    } else {
      document.exitFullscreen();
      btn.textContent = '⛶';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) btn.textContent = '⛶';
  });
}

/* ===== QIBLA CALCULATOR ===== */
function calcQibla(lat, lon) {
  // Mecca coords
  const mLat = 21.4225 * Math.PI / 180;
  const mLon = 39.8262 * Math.PI / 180;
  const uLat = lat * Math.PI / 180;
  const dLon = mLon - (lon * Math.PI / 180);
  const bearing = Math.atan2(
    Math.sin(dLon),
    Math.cos(uLat) * Math.tan(mLat) - Math.sin(uLat) * Math.cos(dLon)
  ) * 180 / Math.PI;
  return (bearing + 360) % 360;
}
