const container = document.getElementById('container');
const icons = document.querySelectorAll('.icon');

// 상대 위치 기본값
const defaultRelativePositions = {
  photo: { x: 0, y: 0 },
  todo: { x: -0.4, y: -0.3 },
  clock: { x: 0.4, y: -0.3 },
  viewer: { x: 0.4, y: 0.4 }
};

// 시간 출력
function updateTime() {
  const now = new Date();
  document.getElementById('time').textContent = now.toTimeString().split(' ')[0];
}
updateTime();
setInterval(updateTime, 1000);

// 연도
document.getElementById('year').textContent = new Date().getFullYear();

// 중심 좌표 계산
function getCenter() {
  const rect = container.getBoundingClientRect();
  return { x: rect.width / 2, y: rect.height / 2 };
}

// 위치 적용
function applyRelativePositions(withAnimation = false) {
  const center = getCenter();

  icons.forEach(icon => {
    const saved = localStorage.getItem(icon.id);
    const rel = saved ? JSON.parse(saved) : defaultRelativePositions[icon.id];
    if (!rel) return;

    const offsetX = icon.offsetWidth / 2;
    const offsetY = icon.offsetHeight / 2;
    const margin = 6;

    let left = center.x + rel.x * center.x - offsetX;
    let top = center.y + rel.y * center.y - offsetY;

    // 안전 영역 계산
    const maxX = container.clientWidth - icon.offsetWidth - margin;
    const maxY = container.clientHeight - icon.offsetHeight - margin;

    left = Math.max(margin, Math.min(left, maxX));
    top = Math.max(margin, Math.min(top, maxY));

    icon.style.transition = withAnimation ? 'left 0.3s ease, top 0.3s ease' : 'none';
    icon.style.left = `${left}px`;
    icon.style.top = `${top}px`;
    icon.style.opacity = '1';
  });
}

// 초기 적용
window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => applyRelativePositions());
  });
});
window.addEventListener('resize', () => applyRelativePositions());

// 선택 효과
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

// 드래그 기능
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

    const maxX = container.clientWidth - iconWidth;
    const maxY = container.clientHeight - iconHeight;

    // duringDrag 함수나 applyRelativePositions 안에서
    const margin = 6; // box-shadow 또는 안전 영역 여유
    const newX = Math.max(margin, Math.min(x - offsetX, maxX - margin));
    const newY = Math.max(margin, Math.min(y - offsetY, maxY - margin));

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

  // 마우스
  icon.addEventListener('mousedown', e => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  });
  window.addEventListener('mousemove', e => duringDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);

  // 터치
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

// 리셋
document.getElementById('reset-link')?.addEventListener('click', e => {
  e.preventDefault();
  localStorage.clear();
  applyRelativePositions(true);
});

// 정렬
document.getElementById('align-link')?.addEventListener('click', e => {
  e.preventDefault();
  const center = getCenter();
  const spacing = 100;
  const gridSize = Math.ceil(Math.sqrt(icons.length));

  icons.forEach((icon, index) => {
    const offsetX = icon.offsetWidth / 2;
    const offsetY = icon.offsetHeight / 2;

    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const dx = (col - (gridSize - 1) / 2) * spacing;
    const dy = (row - (gridSize - 1) / 2) * spacing;

    const left = center.x + dx - offsetX;
    const top = center.y + dy - offsetY;

    icon.style.transition = 'left 0.3s ease, top 0.3s ease';
    icon.style.left = `${Math.max(0, Math.min(left, container.clientWidth - icon.offsetWidth))}px`;
    icon.style.top = `${Math.max(0, Math.min(top, container.clientHeight - icon.offsetHeight))}px`;

    const relX = dx / center.x;
    const relY = dy / center.y;
    localStorage.setItem(icon.id, JSON.stringify({ x: relX, y: relY }));
  });
});