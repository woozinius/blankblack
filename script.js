// 현재 시간을 가져와서 헤더에 출력

function updateTime() {
  const now = new Date();

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  document.getElementById('time').textContent = `${hh}:${mm}:${ss}`;
}

updateTime(); // 페이지 로드시 1회 실행
setInterval(updateTime, 1000); // 1초마다 반복

// 현재 연도를 가져와서 푸터에 출력
const year = new Date().getFullYear();
document.getElementById('year').textContent = year;