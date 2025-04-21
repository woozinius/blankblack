// 현재 시간 표시
function updateTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('time').textContent = `${hh}:${mm}:${ss}`;
}
updateTime();
setInterval(updateTime, 1000);

// 연도 표시
const year = new Date().getFullYear();
document.getElementById('year').textContent = year;

const icons = document.querySelectorAll('.icon');

// 위치 복원
icons.forEach(icon => {
  const saved = localStorage.getItem(icon.id);
  if (saved) {
    const pos = JSON.parse(saved);
    icon.style.left = pos.left;
    icon.style.top = pos.top;
  }
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

// 드래그 기능
icons.forEach(icon => {
  let isDragging = false;
  let hasMoved = false;
  let startMouseX, startMouseY;
  let startIconX, startIconY;

  icon.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    hasMoved = false;

    // 선택 상태 초기화 후 현재 아이콘만 선택
    icons.forEach(i => i.classList.remove('selected'));
    icon.classList.add('selected');

    startMouseX = e.clientX;
    startMouseY = e.clientY;

    const rect = icon.getBoundingClientRect();
    startIconX = rect.left + window.scrollX;
    startIconY = rect.top + window.scrollY;

    icon.style.cursor = 'grabbing';
    e.stopPropagation();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startMouseX;
    const dy = e.clientY - startMouseY;

    const newX = startIconX + dx;
    const newY = startIconY + dy;

    icon.style.left = `${newX}px`;
    icon.style.top = `${newY}px`;

    hasMoved = true;
  });

  window.addEventListener('mouseup', () => {
    if (isDragging && !hasMoved) {
      const href = icon.getAttribute('href');
      if (href) window.location.href = href;
    }

    icon.classList.add('selected');

    const position = {
      left: icon.style.left,
      top: icon.style.top
    };
    localStorage.setItem(icon.id, JSON.stringify(position));

    isDragging = false;
    icon.style.cursor = 'grab';
  });
});

// Reset 기능
const defaultPositions = {
  todo: { left: '100px', top: '100px' },
  clock: { left: '200px', top: '200px' },
  viewer: { left: '300px', top: '400px' }
};

document.getElementById('reset-link').addEventListener('click', (e) => {
  e.preventDefault();
  icons.forEach(icon => {
    const id = icon.id;
    const defaultPos = defaultPositions[id];
    if (defaultPos) {
      icon.style.left = defaultPos.left;
      icon.style.top = defaultPos.top;
      localStorage.setItem(id, JSON.stringify(defaultPos));
    }
  });
});
