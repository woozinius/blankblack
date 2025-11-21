
// 📦 컨테이너, 아이콘 요소 참조
const container = document.getElementById('container');
const icons = document.querySelectorAll('.icon');
const header = document.querySelector('header');
const footer = document.querySelector('footer');

// 🔳 Finder 요소 참조
const finderWindow = document.getElementById('finder-window');
const finderTitle = document.getElementById('finder-title');
const finderPath = document.getElementById('finder-path');
const finderContent = document.getElementById('finder-content');
const finderClose = document.getElementById('finder-close');

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

function alignTopLeft(withAnimation = false) {
  const margin = 20;
  const spacingX = 100;
  const spacingY = 100;
  const headerHeight = header ? header.offsetHeight : 0;
  const footerHeight = getFooterHeight();
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  let x = margin;
  let y = headerHeight + margin;

  icons.forEach(icon => {
    const iconWidth = icon.offsetWidth;
    const iconHeight = icon.offsetHeight;
    const maxX = containerWidth - iconWidth - margin;
    const maxY = containerHeight - iconHeight - footerHeight - margin;

    if (x > maxX) {
      x = margin;
      y += spacingY;
    }

    const left = Math.min(x, maxX);
    const top = Math.min(y, maxY);

    icon.style.transition = withAnimation ? 'left 0.3s ease, top 0.3s ease' : 'none';
    icon.style.left = `${left}px`;
    icon.style.top = `${top}px`;
    icon.style.opacity = '1';

    const center = getCenter();
    const relX = (left + iconWidth / 2 - center.x) / center.x;
    const relY = (top + iconHeight / 2 - center.y) / center.y;
    localStorage.setItem(icon.id, JSON.stringify({ x: relX, y: relY }));

    x += spacingX;
  });
}

function applyRelativePositions(withAnimation = false) {
  let hasSavedPosition = false;
  icons.forEach(icon => {
    if (localStorage.getItem(icon.id)) hasSavedPosition = true;
  });

  if (hasSavedPosition) {
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
  } else {
    alignTopLeft(withAnimation);
  }
}

window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => applyRelativePositions());
  });
});
window.addEventListener('resize', () => applyRelativePositions());

/*
// 🔳 Finder 더미 아이템 생성
function buildFinderItems(folderKey) {
  finderContent.innerHTML = '';
  const count = 10; // 아이콘 많은 상태 확인용

  for (let i = 1; i <= count; i++) {
    const item = document.createElement('div');
    item.className = 'finder-item';
    item.innerHTML = `
      <img src="/icons/folder.png" alt="Folder Icon" />
      <span>${folderKey} ${String(i).padStart(3, '0')}</span>
    `;
    finderContent.appendChild(item);
  }
}
  */





// ---------- Finder: 계층 구조 탐색용 상태 ----------
let currentRootKey = null;          // projects / study / notes
let currentNodeStack = [];          // [루트, 하위폴더, ...]
const finderDataCache = {};         // 루트 JSON 캐시

// 루트 JSON 로드
async function loadRootData(rootKey) {
  if (finderDataCache[rootKey]) return finderDataCache[rootKey];

  const res = await fetch(`/data/${rootKey}.json`);
  const data = await res.json();
  finderDataCache[rootKey] = data;
  return data;
}

// 현재 폴더(node)를 기준으로 Finder 내용 렌더링
function renderCurrentFolder() {
  const node = currentNodeStack[currentNodeStack.length - 1];
  const items = node.items || [];

  // 제목 / 경로
  const title = node.name || currentRootKey;
  finderTitle.textContent = title;

  const pathParts = currentNodeStack
    .map(n => n.name)
    .filter(Boolean);
  finderPath.textContent = '/' + pathParts.join('/');

  // 내용 비우기
  finderContent.innerHTML = '';

  // 상위 폴더로 올라가기 아이템 (루트가 아닐 때만)
  if (currentNodeStack.length > 1) {
    const up = document.createElement('div');
    up.className = 'finder-item';
    up.innerHTML = `
      <div class="finder-item-inner" data-type="up">
        <img src="/icons/folder.png" alt="Up" />
        <span>..</span>
      </div>
    `;
    up.querySelector('.finder-item-inner').addEventListener('click', () => {
      currentNodeStack.pop();
      renderCurrentFolder();
    });
    finderContent.appendChild(up);
  }

  // 실제 아이템 렌더링
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'finder-item';

    div.innerHTML = `
      <div class="finder-item-inner" data-type="${item.type}">
        <img src="${item.type === 'folder' ? '/icons/folder.png' : '/icons/file.png'}" alt="${item.type}" />
        <span>${item.name}</span>
      </div>
    `;

    const inner = div.querySelector('.finder-item-inner');

inner.addEventListener('mousedown', e => {
  // 선택 처리 (mousedown이 click보다 먼저 실행됨)
  finderContent.querySelectorAll('.finder-item-inner')
    .forEach(el => el.classList.remove('selected'));
  inner.classList.add('selected');
  e.stopPropagation();
});

inner.addEventListener('click', e => {
  if (item.type === 'folder') {
    currentNodeStack.push(item);
    renderCurrentFolder();
  }
  // 파일 click 동작도 여기서 처리 가능
  e.stopPropagation();
});

    finderContent.appendChild(div);
  });
}

// ---------- Finder 열기 / 닫기 ----------
async function openFinder(icon) {
  const key = icon.id; // projects / study / notes (아이콘 id 기준)
  currentRootKey = key;

  const rootData = await loadRootData(key);
  currentNodeStack = [rootData];

  renderCurrentFolder();
  finderWindow.classList.add('open');
}

function closeFinder() {
  finderWindow.classList.remove('open');
  currentRootKey = null;
  currentNodeStack = [];
}

finderClose.addEventListener('click', closeFinder);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeFinder();
    icons.forEach(icon => icon.classList.remove('selected'));
  }
});




// 아이콘 선택
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

// 드래그
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
      // 🔳 기존: href로 이동 → 변경: Finder 열기
      openFinder(icon);
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
  alignTopLeft(true);
});

// ---------- Finder 내부 아이콘 선택 ----------
finderContent.addEventListener('click', e => {
  const target = e.target.closest('.finder-item-inner');
  if (!target) return;

  // 기존 선택 제거
  finderContent.querySelectorAll('.finder-item-inner').forEach(el => {
    el.classList.remove('selected');
  });

  // 현재 선택
  target.classList.add('selected');

  e.stopPropagation();
});

// Finder 외부 클릭 시 선택 해제
finderWindow.addEventListener('click', e => {
  if (!e.target.closest('.finder-item-inner')) {
    finderContent.querySelectorAll('.finder-item-inner').forEach(el => {
      el.classList.remove('selected');
    });
  }
});