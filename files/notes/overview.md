# Classic Desktop Project
---

📂 1. Backlog (해야 할 전체 작업)

● 데스크탑 아이콘 우측정렬 기반 자동 정렬 개선

● Finder 내 폴더 이동 시 히스토리(뒤로/앞으로)

● 파일 뷰어(Window) 시스템 고도화

	•	텍스트
	•	마크다운
	•	이미지
	•	HTML
	•	PDF

● JSON 기반 파일 시스템 통합 구조

	•	key / slug / fileType / path / children 완전 정착
	•	전역 root.json 구성
	•	Finder가 root.json → 각 폴더 JSON으로 내려가는 방식

● 창(Window) 공통 UI 통합

	•	드래그
	•	z-index manager
	•	Close
	•	Resize (옵션)

● Finder 내부 더블클릭 제거 → 단일클릭 열기

● Finder 내부 아이콘 hover 커서 변경

● Finder → Window로 파일 열기 연결

● URL Router 고려 (향후 Next.js 이전 대비)

● 모바일 레이아웃 탐색(무한 스크롤 X, Finder 중심 UI)

---

🟩 2. In Progress (현재 작업 중)

● JSON 기반 폴더/파일 트리 구조 확장

	•	items[] 안에 폴더/파일 재귀 구조
	•	id, slug, path, fileType 적용
	•	JS에서 children 인식 준비 중

● Finder → 하위 폴더 이동 구현

	•	단일 Finder 창 내부에서 이동
	•	상단 path 표시
	•	스택 기반 히스토리 구조 설계

● Window 시스템 초기 구축

	•	창 생성(createWindow)
	•	Body 콘텐츠 동적 삽입
	•	Drag
	•	Z-index 관리
	•	Close

---

🟧 3. To Do Next (다음 단계로 바로 넘어갈 작업)

✔ 파일 타입별 뷰어 연결

	•	fileType: "markdown" → Markdown Viewer
	•	fileType: "image" → 이미지 Viewer
	•	fileType: "html" → iframe Viewer
	•	fileType: "text" → Plain text Viewer

✔ Finder 아이콘 이벤트 정비

	•	click 시 선택
	•	다시 click 시 열기
	•	drag는 disabled
	•	hover 시 cursor: pointer

✔ Finder Header에 버튼 추가

	•	Back
	•	Forward
	•	View: Icon / List (아이콘 뷰는 현재처럼 유지)

✔ Finder 내부 grid 레이아웃 정식 정의

	•	column width
	•	row height
	•	간격
	•	overflow → 스크롤

⸻

🟦 4. Ready for Future (향후 단계)

▶ 정적 → 동적 사이트 전환 대비 구조 확립

	•	JSON은 content API 같은 Layer로 분리
	•	path는 실제 파일 or API endpoint로 변환 가능하게 설계
	•	slug 기반 라우팅 여지를 유지

▶ URL 직접 접근 기능

예:
/desktop/projects → Projects Finder 자동 open
/desktop/projects/readme → Window로 README.md 자동 open

▶ 앱 시스템 확장

	•	Settings 앱
	•	Info 패널
	•	Spotlight-like 검색 기능
	•	Clipboard 구조

▶ LocalStorage 기반 “세션 복원”

	•	마지막 찾았던 Finder path
	•	열린 창들 위치/크기 복원
	•	데스크탑 아이콘 위치 그대로 유지

---

🟥 5. Future (반응형 대응)

● 데스크탑 → 모바일 구조 전환 규칙 정의

	•	데스크탑: 바탕화면 + 창
	•	태블릿: 창 유지, 데스크탑 아이콘 축소
	•	모바일: 바탕화면 숨김 → Finder 중심 UI
	•	창(Window)은 모바일에서는 modal/card 형태

● 모바일 Finder 최적화

	•	좌우 스와이프 → Back/Forward
	•	아이콘 → 리스트 뷰 전환
	•	창 Drag 비활성화 or 최소화

● 이미지 뷰어 확대/축소 제스처

● 모바일 전용 상단바(시간/뒤로가기/현재 path)

⸻

🟩 6. Done (이미 구현 완료된 것)

✔ 데스크탑 아이콘 드래그

✔ 데스크탑 아이콘 위치 LocalStorage 저장

✔ 하나의 Finder 창

✔ Finder 열기

✔ 폴더 클릭 → Finder 로딩

✔ JSON 기반 폴더/파일 구성

✔ 창(Window) 기본 틀 완성

✔ App Window 드래그 & z-index

⸻

🔵 전체 개발 흐름 요약

	1.	데스크탑 완성
	2.	Finder 완성
	3.	Window 시스템 완성
	4.	파일 뷰어 완성
	5.	트리 JSON 완성
	6.	라우팅 여지 확보
	7.	모바일 컨셉 정리 및 반응형 시작