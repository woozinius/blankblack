// 📦 컨테이너, 아이콘 요소 참조
const container = document.getElementById('container');
const icons = document.querySelectorAll('.icon');
const header = document.querySelector('header');
const footer = document.querySelector('footer');

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
  alignTopLeft(true);
});
