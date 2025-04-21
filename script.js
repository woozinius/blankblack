// 아이콘 중앙 기준 상대 위치 설정
const defaultRelativePositions = {
  photo: { x: 0, y: 0 },
  todo: { x: -150, y: -100 },
  clock: { x: 100, y: -120 },
  viewer: { x: 120, y: 130 }
};

// 현재 시간 출력
function updateTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('time').textContent = `${hh}:${mm}:${ss}`;
}
updateTime();
setInterval(updateTime, 1000);

// 현재 연도 출력
const year = new Date().getFullYear();
document.getElementById('year').textContent = year;

const icons = document.querySelectorAll('.icon');

// 중앙 기준 상대 위치 적용
function applyInitialPosition() {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  icons.forEach(icon => {
    const saved = localStorage.getItem(icon.id);
    let left, top;

    if (saved) {
      const pos = JSON.parse(saved);
      left = pos.left;
      top = pos.top;
    } else {
      const rel = defaultRelativePositions[icon.id];
      if (!rel) return;
      left = `${(centerX + rel.x) / window.innerWidth * 100}vw`;
      top = `${(centerY + rel.y) / window.innerHeight * 100}vh`;
    }

    icon.style.left = left;
    icon.style.top = top;
    icon.style.opacity = '1';
  });
}
applyInitialPosition();

window.addEventListener('resize', () => {
  icons.forEach(icon => {
    const saved = localStorage.getItem(icon.id);
    if (!saved) {
      applyInitialPosition();
    }
  });
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
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const left = (e.clientX - offsetX) / vw * 100;
    const top = (e.clientY - offsetY) / vh * 100;
    icon.style.left = `${left}vw`;
    icon.style.top = `${top}vh`;
    hasMoved = true;
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      if (!hasMoved) {
        const href = icon.querySelector('a')?.getAttribute('href');
        if (href) window.location.href = href;
      }

      const left = icon.style.left;
      const top = icon.style.top;
      const position = { left, top };
      localStorage.setItem(icon.id, JSON.stringify(position));

      icon.style.cursor = 'grab';
      isDragging = false;
    }
  });
});

// 리셋 버튼
const reset = document.getElementById('reset-link');
if (reset) {
  reset.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    applyInitialPosition();
  });
}

