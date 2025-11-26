// 📦 컨테이너, 아이콘 요소 참조
const container = document.getElementById('container');
// const icons = document.querySelectorAll('.icon');
const icons = document.querySelectorAll('.icon:not(#trash)');
const trashIcon = document.getElementById('trash');

const header = document.querySelector('header');
const footer = document.querySelector('footer');

// 🔳 Finder 요소 참조
const finderWindow = document.getElementById('finder-window');
const finderHeader = document.querySelector('#finder-window .finder-header');
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


function alignTopRight(withAnimation = false) {
  const margin = 20;
  const headerHeight = header ? header.offsetHeight : 0;
  const footerHeight = getFooterHeight();
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const center = getCenter();

  const iconsArr = Array.from(icons);
  const count = iconsArr.length;

  if (count === 0) return;

  // 링당 최대 아이콘 개수
  const iconsPerRing = 12;
  const ringSpacing = 110; // 링 사이 간격(px)

  // 각 링에 몇 개씩 들어가는지 계산
  const ringSizes = [];
  let remaining = count;
  while (remaining > 0) {
    const size = Math.min(iconsPerRing, remaining);
    ringSizes.push(size);
    remaining -= size;
  }

  // 기본 반지름 (컨테이너 크기에 비례)
  const usableHeight = containerHeight - headerHeight - footerHeight;
  const baseRadiusX = Math.min(containerWidth, usableHeight) * 0.3;
  const baseRadiusY = Math.min(containerWidth, usableHeight) * 0.3;

  let ringIndex = 0;
  let indexInRing = 0;

  iconsArr.forEach(icon => {
    const iconWidth = icon.offsetWidth;
    const iconHeight = icon.offsetHeight;

    const itemsInThisRing = ringSizes[ringIndex];
    const angle = (indexInRing / itemsInThisRing) * Math.PI * 2;

    // 링마다 반지름 증가
    const radiusX = baseRadiusX + ringIndex * ringSpacing;
    const radiusY = baseRadiusY + ringIndex * ringSpacing * 0.8;

    // 약간의 랜덤 흔들림
    const jitterX = (Math.random() - 0.5) * 100; // ±15px
    const jitterY = (Math.random() - 0.5) * 100;

    // 중앙 기준 타원 위치
    let left = center.x + Math.cos(angle) * radiusX + jitterX - iconWidth / 2;
    let top =
      headerHeight +
      usableHeight / 2 +
      Math.sin(angle) * radiusY +
      jitterY -
      iconHeight / 2;

    // 컨테이너/헤더/푸터 안으로 클램프
    const maxX = containerWidth - iconWidth - margin;
    const maxY = containerHeight - iconHeight - footerHeight - margin;

    left = Math.max(margin, Math.min(left, maxX));
    top = Math.max(headerHeight + margin, Math.min(top, maxY));

    icon.style.transition = withAnimation ? 'left 0.3s ease, top 0.3s ease' : 'none';
    icon.style.left = `${left}px`;
    icon.style.top = `${top}px`;
    icon.style.opacity = '1';

    // 상대 위치(localStorage 저장용)
    const c = getCenter();
    const relX = (left + iconWidth / 2 - c.x) / c.x;
    const relY = (top + iconHeight / 2 - c.y) / c.y;
    localStorage.setItem(icon.id, JSON.stringify({ x: relX, y: relY }));

    // 다음 아이콘을 위해 인덱스 증가
    indexInRing++;
    if (indexInRing >= itemsInThisRing) {
      ringIndex++;
      indexInRing = 0;
    }
  });
}

/*
function alignTopRight(withAnimation = false) {
  const margin = 20;
  const spacingX = 100;
  const spacingY = 100;
  const headerHeight = header ? header.offsetHeight : 0;
  const footerHeight = getFooterHeight();
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // 시작 위치: 우측 상단
  let x = containerWidth - margin;
  let y = headerHeight + margin;

  icons.forEach(icon => {
    const iconWidth = icon.offsetWidth;
    const iconHeight = icon.offsetHeight;

    const minX = margin; // 왼쪽 최소 여백
    const maxY = containerHeight - iconHeight - footerHeight - margin;

    // 아래로 꽉 찼으면, 위로 올라가고 왼쪽으로 한 칸 이동
    if (y > maxY) {
      y = headerHeight + margin;
      x -= spacingX;
    }

    // 오른쪽 기준 정렬: x가 “아이콘 오른쪽”이 되도록 계산
    let left = x - iconWidth;
    left = Math.max(minX, left); // 왼쪽으로 너무 나가지 않게 제한
    const top = Math.min(y, maxY);

    icon.style.transition = withAnimation ? 'left 0.3s ease, top 0.3s ease' : 'none';
    icon.style.left = `${left}px`;
    icon.style.top = `${top}px`;
    icon.style.opacity = '1';

    // 상대 위치 저장(기존 로직 유지)
    const center = getCenter();
    const relX = (left + iconWidth / 2 - center.x) / center.x;
    const relY = (top + iconHeight / 2 - center.y) / center.y;
    localStorage.setItem(icon.id, JSON.stringify({ x: relX, y: relY }));

    // 다음 아이콘은 아래로
    y += spacingY;
  });
}
  */

/*
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
  */

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
    // alignTopLeft(withAnimation);
    alignTopRight(withAnimation);
  }
}

window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => applyRelativePositions());
  });

  /* 테스트용 임시 창
  createWindow({
    title: 'Test Window',
    content: '<p>This is a test window.</p>'
  });
*/

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

  // 선택 (mousedown: 선택만)
  inner.addEventListener('mousedown', e => {
    finderContent
      .querySelectorAll('.finder-item-inner')
      .forEach(el => el.classList.remove('selected'));
    inner.classList.add('selected');
    e.stopPropagation();
  });

  // 클릭: 폴더면 하위 폴더로 이동, 파일이면 뷰어 열기
  inner.addEventListener('click', e => {
    if (item.type === 'folder') {
      currentNodeStack.push(item);
      renderCurrentFolder();
    } else if (item.type === 'file') {
      openFile(item);
    }
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

  // 열릴 때마다 중앙 정렬
  centerWindowElement(finderWindow);
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
  alignTopRight(true);
  // alignTopLeft(true);
});


// ─────────────────────────────
// Finder 드래그
// ─────────────────────────────
if (finderHeader && finderWindow) {
  let draggingFinder = false;
  let startX = 0, startY = 0;
  let originLeft = 0, originTop = 0;

  finderHeader.addEventListener('mousedown', e => {
    draggingFinder = true;

    const winRect = finderWindow.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();

    originLeft = winRect.left - contRect.left;
    originTop  = winRect.top  - contRect.top;
    startX = e.clientX;
    startY = e.clientY;

    // 다른 창들과 z-index를 같이 쓰고 싶으면
    if (windowManager && typeof windowManager.bringToFront === 'function') {
      windowManager.bringToFront(finderWindow);
    } else {
      finderWindow.style.zIndex = 30;
    }

    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!draggingFinder) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newLeft = originLeft + dx;
    let newTop  = originTop  + dy;

const contRect = container.getBoundingClientRect();
const winRect  = finderWindow.getBoundingClientRect();
const footerHeight = getFooterHeight();
const margin = 0; // 필요 시 조정

const minLeft = 0;
const minTop  = header ? header.offsetHeight : 0;
const maxLeft = contRect.width  - winRect.width;
const maxTop  = contRect.height - footerHeight - winRect.height - margin;

newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
newTop  = Math.max(minTop,  Math.min(newTop,  maxTop));

    finderWindow.style.left = newLeft + 'px';
    finderWindow.style.top  = newTop  + 'px';
  });

  window.addEventListener('mouseup', () => {
    draggingFinder = false;
  });
}

finderWindow.addEventListener('mousedown', () => {
  windowManager.bringToFront(finderWindow);
});




// ─────────────────────────────
// 공통 Window 매니저
// ─────────────────────────────

const windowManager = {
  nextZ: 20,
  bringToFront(el) {
    this.nextZ += 1;
    el.style.zIndex = this.nextZ;
  }
};

/**
 * 공통 창 생성 함수
 * @param {Object} options
 * @param {string} options.title  - 창 제목
 * @param {number} [options.width=480]
 * @param {number} [options.height=320]
 * @param {number} [options.x=80]
 * @param {number} [options.y=80]
 * @param {string|Node} [options.content] - 창 안에 넣을 내용
 */




/*
function createWindow({ title, width = 480, height = 320, x = 80, y = 80, content = '' }) {
  const win = document.createElement('div');
  win.className = 'app-window';
  win.style.width = width + 'px';
  win.style.height = height + 'px';
  win.style.left = x + 'px';
  win.style.top = y + 'px';

  win.innerHTML = `
    <div class="app-window-header">
      <span class="app-window-title">${title}</span>
      <button class="app-window-close" aria-label="Close">✕</button>
    </div>
    <div class="app-window-body"></div>
  `;
  */

  
function createWindow({ title, width = 480, height = 320, x = null, y = null, content = '' }) {
  const win = document.createElement('div');
  win.className = 'app-window';
  win.style.width = width + 'px';
  win.style.height = height + 'px';

  win.innerHTML = `
    <div class="app-window-header">
      <span class="app-window-title">${title}</span>
      <button class="app-window-close" aria-label="Close">✕</button>
    </div>
    <div class="app-window-body"></div>
  `;

  const bodyEl = win.querySelector('.app-window-body');

  if (typeof content === 'string') {
    bodyEl.innerHTML = content;
  } else if (content instanceof Node) {
    bodyEl.appendChild(content);
  }

  // 컨테이너에 추가
  container.appendChild(win);

  // 중앙 정렬 또는 지정 좌표 배치
  if (x == null || y == null) {
    centerWindowElement(win);
  } else {
    win.style.left = x + 'px';
    win.style.top = y + 'px';
  }

  // 맨 앞으로
  windowManager.bringToFront(win);

  // 창 클릭 시 맨 앞으로
  win.addEventListener('mousedown', () => {
    windowManager.bringToFront(win);
  });

  // 닫기 버튼
  const closeBtn = win.querySelector('.app-window-close');
  closeBtn.addEventListener('click', () => {
    win.remove();
  });

  // 드래그
  const headerEl = win.querySelector('.app-window-header');
  let dragging = false;
  let startX = 0, startY = 0;
  let originLeft = 0, originTop = 0;

  headerEl.addEventListener('mousedown', e => {
    dragging = true;

    const rect = win.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();

    originLeft = rect.left - contRect.left;
    originTop = rect.top - contRect.top;
    startX = e.clientX;
    startY = e.clientY;

    windowManager.bringToFront(win);
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newLeft = originLeft + dx;
    let newTop = originTop + dy;

    const contRect = container.getBoundingClientRect();
    const winRect = win.getBoundingClientRect();
    const footerHeight = getFooterHeight();
    const margin = 0;

    const minLeft = 0;
    const minTop = header ? header.offsetHeight : 0;
    const maxLeft = contRect.width - winRect.width;
    const maxTop = contRect.height - footerHeight - winRect.height - margin;

    newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
    newTop = Math.max(minTop, Math.min(newTop, maxTop));

    win.style.left = newLeft + 'px';
    win.style.top = newTop + 'px';
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
  });

  return win;
}




// ─────────────────────────────
// 파일 타입 판별 유틸
// ─────────────────────────────

// 확장자 기반 기본 매핑
const FILE_TYPE_BY_EXT = {
  text: ['txt', 'md', 'markdown', 'log'],
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
  html: ['html', 'htm'],
  markdown:['md', 'markdown'],
  code: ['js', 'ts', 'css', 'json']
};

function detectFileType(name, explicitType) {
  // JSON에서 명시한 타입이 있으면 그것을 우선 사용
  if (explicitType) return explicitType;

  const parts = name.split('.');
  if (parts.length < 2) return 'text'; // 확장자 없으면 기본 text 취급

  const ext = parts.pop().toLowerCase();

  for (const [type, extList] of Object.entries(FILE_TYPE_BY_EXT)) {
    if (extList.includes(ext)) return type;
  }

  return 'text'; // 그래도 모르면 텍스트로
}

// HTML escape 유틸 (여러 뷰어에서 공통 사용)
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─────────────────────────────
// 파일 뷰어 (fileType 기반)
// ─────────────────────────────

async function openTextViewer(item) {
  try {
    const res = await fetch(item.path);
    const text = await res.text();

    const escaped = escapeHTML(text);

    createWindow({
      title: item.name,
      width: 640,
      height: 400,
      content: `<pre class="viewer-text">${escaped}</pre>`
    });
  } catch (e) {
    createWindow({
      title: item.name,
      content: `<p>파일을 불러오지 못했습니다.<br><code>${item.path}</code></p>`
    });
  }
}

function openImageViewer(item) {
  createWindow({
    title: item.name,
    width: 640,
    height: 480,
    content: `
      <div class="viewer-image-wrap">
        <img src="${item.path}" alt="${item.name}" class="viewer-image" />
      </div>
    `
  });
}

function openHtmlViewer(item) {
  createWindow({
    title: item.name,
    width: 800,
    height: 500,
    content: `
      <iframe src="${item.path}" style="width:100%;height:100%;border:none;"></iframe>
    `
  });
}

// Markdown 뷰어
async function openMarkdownViewer(item) {
  try {
    const res = await fetch(item.path);
    const text = await res.text();

    // 아주 단순한 Markdown → HTML 변환 (라이브러리 없이 최소 구현)
    // 필요시 나중에 라이브러리(예: marked)로 교체 가능
    let html = text;

    // 1) HTML escape
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2) 가장 기초적인 변환 (헤더, 굵게, 코드블록 등) – 최소 버전
    //    나중에 정식 라이브러리로 바꾸는 전단계 정도로 생각하면 됨

    // # Heading
    html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');

    // * bullet list
    html = html.replace(/^\s*[-*] (.*)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

    // **bold**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // `inline code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 빈 줄 기준 단락
    html = html.replace(/^(?!<h\d>|<ul>|<li>|<\/ul>)(.+)$/gm, '<p>$1</p>');

    createWindow({
      title: item.name,
      width: 720,
      height: 480,
      content: `<div class="viewer-markdown">${html}</div>`
    });
  } catch (e) {
    createWindow({
      title: item.name,
      content: `<p>Markdown 파일을 불러오지 못했습니다.<br><code>${item.path}</code></p>`
    });
  }
}


// 파일 타입 → 뷰어 매핑
const fileViewers = {
  text: openTextViewer,
  markdown: openMarkdownViewer,
  image: openImageViewer,
  html: openHtmlViewer,
  // code: openCodeViewer,     // 나중에 추가하고 싶으면 여기에만 등록
  default: openTextViewer
};

function openFile(item) {
  // JSON에서 지정한 fileType + 파일명 기반 자동 판별을 같이 사용
  const type = detectFileType(item.name, item.fileType);
  const viewer = fileViewers[type] || fileViewers.default;

  // path가 JSON에 없으면 기본 규칙으로 자동 생성 (원하면 사용)
  const safePath = item.path || `/files/${item.name}`;

  viewer({
    ...item,
    fileType: type,
    path: safePath
  });
}



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


// ---------- 중앙 정렬 함수 ----------
function centerWindowElement(el) {
  if (!el) return;

  const contRect = container.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  const headerHeight = header ? header.offsetHeight : 0;
  const footerHeight = getFooterHeight();

  const usableHeight = contRect.height - headerHeight - footerHeight;

  let left = (contRect.width - rect.width) / 2;
  let top  = headerHeight + (usableHeight - rect.height) / 2;

  const maxLeft = contRect.width - rect.width;
  const maxTop  = contRect.height - footerHeight - rect.height;

  left = Math.max(0, Math.min(left, maxLeft));
  top  = Math.max(headerHeight, Math.min(top, maxTop));

  el.style.left = left + 'px';
  el.style.top  = top  + 'px';
}