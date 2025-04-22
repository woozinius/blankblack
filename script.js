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

function applyRelativePositions(withAnimation = false) {
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

window.addEventListener('resize', () => {
  icons.forEach(icon => icon.style.transition = 'none');
  applyRelativePositions();
});

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

  const startDrag = (x, y) => {
    const rect = icon.getBoundingClientRect();
    offsetX = x - rect.left;
    offsetY = y - rect.top;
    isDragging = true;
    hasMoved = false;
    icons.forEach(i => i.classList.remove('selected'));
    icon.classList.add('selected');
    icon.style.cursor = 'grabbing';
    icon.style.transition = 'none';
  };

  const duringDrag = (x, y) => {
    if (!isDragging) return;
    const iconWidth = icon.offsetWidth;
    const iconHeight = icon.offsetHeight;
    const maxX = window.innerWidth - iconWidth;
    const maxY = window.innerHeight - iconHeight;

    const newX = Math.max(0, Math.min(x - offsetX, maxX));
    const newY = Math.max(0, Math.min(y - offsetY, maxY));

    icon.style.left = `${newX}px`;
    icon.style.top = `${newY}px`;
    hasMoved = true;
  };

  const endDrag = () => {
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
  };

  // 마우스 이벤트
  icon.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
    e.stopPropagation();
  });
  window.addEventListener('mousemove', (e) => duringDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);

  // 터치 이벤트
  icon.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
    e.stopPropagation();
  });
  window.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    duringDrag(touch.clientX, touch.clientY);
  }, { passive: false });
  window.addEventListener('touchend', endDrag);
});

const reset = document.getElementById('reset-link');
if (reset) {
  reset.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    applyRelativePositions(true);
  });
}

const align = document.getElementById('align-link');
if (align) {
  align.addEventListener('click', (e) => {
    e.preventDefault();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const center = getCenter();
        const gridSize = Math.ceil(Math.sqrt(icons.length));
        const spacing = 100;

        icons.forEach((icon, index) => {
          const iconRect = icon.getBoundingClientRect();
          const offsetX = iconRect.width / 2;
          const offsetY = iconRect.height / 2;

          const row = Math.floor(index / gridSize);
          const col = index % gridSize;
          const dx = (col - (gridSize - 1) / 2) * spacing;
          const dy = (row - (gridSize - 1) / 2) * spacing;

          const left = center.x + dx - offsetX;
          const top = center.y + dy - offsetY;

          icon.style.transition = 'left 0.3s ease, top 0.3s ease';
          icon.style.left = `${left}px`;
          icon.style.top = `${top}px`;

          const relX = dx / center.x;
          const relY = dy / center.y;
          localStorage.setItem(icon.id, JSON.stringify({ x: relX, y: relY }));
        });
      });
    });
  });
}
