// 아이콘 중앙 기준 상대 위치 설정 (정규화된 값: -1 ~ 1)
const defaultRelativePositions = {
  photo: { x: 0, y: 0 },
  todo: { x: -0.4, y: -0.3 },
  clock: { x: 0.4, y: -0.3 },
  viewer: { x: 0.4, y: 0.4 }
};

function updateTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('time').textContent = `${hh}:${mm}:${ss}`;
}
updateTime();
setInterval(updateTime, 1000);

const year = new Date().getFullYear();
document.getElementById('year').textContent = year;

const icons = document.querySelectorAll('.icon');

function getCenter() {
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}

function applyRelativePositions() {
  const center = getCenter();

  icons.forEach(icon => {
    const saved = localStorage.getItem(icon.id);
    let rel;

    if (saved) {
      rel = JSON.parse(saved);
    } else {
      rel = defaultRelativePositions[icon.id];
    }

    if (!rel) return;

    const iconRect = icon.getBoundingClientRect();
    const offsetX = iconRect.width / 2;
    const offsetY = iconRect.height / 2;

    const left = center.x + rel.x * center.x - offsetX;
    const top = center.y + rel.y * center.y - offsetY;

    icon.style.left = `${left}px`;
    icon.style.top = `${top}px`;
    icon.style.opacity = '1';
  });
}

window.addEventListener('load', applyRelativePositions);
window.addEventListener('resize', applyRelativePositions);

// 선택 효과
icons.forEach(icon => {
  icon.addEventListener('click', (e) => {
    e.preventDefault();
    icons.forEach(i => i.classList.remove('selected'));
    icon.classList.add('selected');
    e.stopPropagation();
  });
});

document.body.addEventListener('click', () => {
  icons.forEach(icon => icon.classList.remove('selected'));
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    icons.forEach(icon => icon.classList.remove('selected'));
  }
});

icons.forEach(icon => {
  let isDragging = false;
  let hasMoved = false;
  let offsetX = 0;
  let offsetY = 0;

  icon.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    hasMoved = false;

    const rect = icon.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    icons.forEach(i => i.classList.remove('selected'));
    icon.classList.add('selected');
    icon.style.cursor = 'grabbing';
    e.stopPropagation();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

    const iconWidth = icon.offsetWidth;
    const iconHeight = icon.offsetHeight;
    const maxX = window.innerWidth - iconWidth;
    const maxY = window.innerHeight - iconHeight;

    const newX = Math.max(0, Math.min(x, maxX));
    const newY = Math.max(0, Math.min(y, maxY));

    icon.style.left = `${newX}px`;
    icon.style.top = `${newY}px`;
    hasMoved = true;
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      if (!hasMoved) {
        const href = icon.querySelector('a')?.getAttribute('href');
        if (href) window.location.href = href;
      }

      const center = getCenter();
      const iconRect = icon.getBoundingClientRect();
      const offsetX = iconRect.width / 2;
      const offsetY = iconRect.height / 2;

      const x = ((iconRect.left + offsetX) - center.x) / center.x;
      const y = ((iconRect.top + offsetY) - center.y) / center.y;

      localStorage.setItem(icon.id, JSON.stringify({ x, y }));

      icon.style.cursor = 'grab';
      isDragging = false;
    }
  });
});

// 리셋
const reset = document.getElementById('reset-link');
if (reset) {
  reset.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    applyRelativePositions();
  });
}