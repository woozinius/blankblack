// 📦 컨테이너, 아이콘 요소 참조
const container = document.getElementById('container');
const icons = document.querySelectorAll('.icon');
const header = document.querySelector('header');
const footer = document.querySelector('footer');

// 상대 위치 기본값
const defaultRelativePositions = {
  photo: { x: 0, y: 0 },
  todo: { x: -0.4, y: -0.4 },
  clock: { x: 0.4, y: -0.3 },
  viewer: { x: 0.3, y: 0.4 },
  test: { x: 0.2, y: 0.4 }
};

// 시계 출력
function updateTime() {
  const now = new Date();
  document.getElementById('time').textContent = now.toTimeString().split(' ')[0];
}
updateTime();
setInterval(updateTime, 1000);

document.getElementById('year').textContent = new Date().getFullYear();

function getCenter() {
  const rect = container.getBoundingClientRect();
  return { x: rect.width / 2, y: rect.height / 2 };
}

function getFooterHeight() {
  return footer ? footer.offsetHeight : 0;
}

function applyRelativePositions(withAnimation = false) {
  const center = getCenter();
  const footerHeight = getFooterHeight();
  const headerHeight = header ? header.offsetHeight : 0;

  icons.forEach(icon => {
    const saved = localStorage.getItem(icon.id);
    const rel = saved ? JSON.parse(saved) : defaultRelativePositions[icon.id];
    if (!rel) return;

    const offsetX = icon.offsetWidth / 2;
    const offsetY = icon.offsetHeight / 2;
    const margin = 6;

    let left = center.x + rel.x * center.x - offsetX;
    let top = center.y + rel.y * center.y - offsetY;

    const maxX = container.clientWidth - icon.offsetWidth - margin;
    const maxY = container.clientHeight - icon.offsetHeight - footerHeight - margin;

    left = Math.max(margin, Math.min(left, maxX));
    top = Math.max(headerHeight + margin, Math.min(top, maxY));

    icon.style.transition = withAnimation ? 'left 0.3s ease, top 0.3s ease' : 'none';
    icon.style.left = `${left}px`;
    icon.style.top = `${top}px`;
    icon.style.opacity = '1';
  });
}

window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => applyRelativePositions());
  });
});
window.addEventListener('resize', () => applyRelativePositions());

icons.forEach(icon => {
  icon.addEventListener('click', e => {
    e.preventDefault();
    icons.forEach(i => i.classList.remove('selected'));
    icon.classList.add('selected');
    e.stopPropagation();
  });
});
document.body.addEventListener('click', () => {
  icons.forEach(icon => icon.classList.remove('selected'));
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    icons.forEach(icon => icon.classList.remove('selected'));
  }
});

icons.forEach(icon => {
  let isDragging = false;
  let hasMoved = false;
  let offsetX = 0, offsetY = 0;

  const startDrag = (x, y) => {
    const rect = icon.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    offsetX = x - rect.left + containerRect.left;
    offsetY = y - rect.top + containerRect.top;

    isDragging = true;
    hasMoved = false;
    icons.forEach(i => i.classList.remove('selected'));
    icon.classList.add('selected');
    icon.style.cursor = 'grabbing';
    icon.style.transition = 'none';
  };

  const duringDrag = (x, y) => {
    if (!isDragging) return;

    const containerRect = container.getBoundingClientRect();
    const iconWidth = icon.offsetWidth;
    const iconHeight = icon.offsetHeight;
    const headerHeight = header ? header.offsetHeight : 0;
    const footerHeight = getFooterHeight();
    const margin = 6;

    const maxX = container.clientWidth - iconWidth - margin;
    const maxY = container.clientHeight - iconHeight - footerHeight - margin;

    const newX = Math.max(margin, Math.min(x - offsetX, maxX));
    const newY = Math.max(headerHeight + margin, Math.min(y - offsetY, maxY));

    icon.style.left = `${newX}px`;
    icon.style.top = `${newY}px`;
    hasMoved = true;
  };

  const endDrag = () => {
    if (!isDragging) return;

    if (!hasMoved) {
      const href = icon.querySelector('a')?.getAttribute('href');
      if (href) window.location.href = href;
    }

    const containerRect = container.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();
    const centerX = iconRect.left + iconRect.width / 2 - containerRect.left;
    const centerY = iconRect.top + iconRect.height / 2 - containerRect.top;
    const center = getCenter();

    const relX = (centerX - center.x) / center.x;
    const relY = (centerY - center.y) / center.y;
    localStorage.setItem(icon.id, JSON.stringify({ x: relX, y: relY }));

    icon.style.cursor = 'grab';
    isDragging = false;
  };

  icon.addEventListener('mousedown', e => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  });
  window.addEventListener('mousemove', e => duringDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);

  icon.addEventListener('touchstart', e => {
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
    e.stopPropagation();
  }, { passive: false });
  window.addEventListener('touchmove', e => {
    const touch = e.touches[0];
    duringDrag(touch.clientX, touch.clientY);
  }, { passive: false });
  window.addEventListener('touchend', endDrag);
});

document.getElementById('reset-link')?.addEventListener('click', e => {
  e.preventDefault();
  localStorage.clear();
  applyRelativePositions(true);
});

document.getElementById('align-link')?.addEventListener('click', e => {
  e.preventDefault();
  const center = getCenter();
  const spacing = 100;
  const gridSize = Math.ceil(Math.sqrt(icons.length));
  const headerHeight = header ? header.offsetHeight : 0;
  const footerHeight = getFooterHeight();

  icons.forEach((icon, index) => {
    const offsetX = icon.offsetWidth / 2;
    const offsetY = icon.offsetHeight / 2;
    const margin = 6;

    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const dx = (col - (gridSize - 1) / 2) * spacing;
    const dy = (row - (gridSize - 1) / 2) * spacing;

    let left = center.x + dx - offsetX;
    let top = center.y + dy - offsetY;

    const maxX = container.clientWidth - icon.offsetWidth - margin;
    const maxY = container.clientHeight - icon.offsetHeight - footerHeight - margin;

    left = Math.max(margin, Math.min(left, maxX));
    top = Math.max(headerHeight + margin, Math.min(top, maxY));

    icon.style.transition = 'left 0.3s ease, top 0.3s ease';
    icon.style.left = `${left}px`;
    icon.style.top = `${top}px`;

    const relX = dx / center.x;
    const relY = dy / center.y;
    localStorage.setItem(icon.id, JSON.stringify({ x: relX, y: relY }));
  });
});