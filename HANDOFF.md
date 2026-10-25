# 중등부 주보 만들기: 작업 인수인계 문서

> 이 문서는 다른 대화(Claude 프로젝트)에서 이어서 작업하기 위한 요약입니다.
> 마지막 정리: 2026-10-18

## 1. 한 줄 요약

임마누엘교회 중등부 주보(A4 가로 2면), 설교·찬양대 썸네일, 카톡·유튜브 글을 **매주 Claude 없이** 만드는 웹페이지입니다.
전에는 Canva와 Claude 스킬로 만들었는데 토큰을 많이 써서 free 요금제로는 쓸 수 없었습니다. 그래서 브라우저에서 혼자 동작하는 HTML 파일 하나로 옮겼습니다.

## 2. 위치

| 항목 | 위치 |
|---|---|
| 페이지 코드 | `hyoon635/jubo` 저장소의 `index.html` (공개 저장소) |
| 페이지 주소 | https://hyoon635.github.io/jubo/ (GitHub Pages: Settings › Pages › main / root) |
| 데이터 저장소 | `hyoon635/jubo-records` (비공개, 페이지가 GitHub API로 직접 저장) |
| 기도자 구글 시트 | https://docs.google.com/spreadsheets/d/1k5T4x7MkEh-f7qsqLdApimXRke185XRmDncfscj6_eI/edit?gid=784677230 (링크 공개, 열: 날짜 / 헌금기도 / 대표기도 / 비고) |

## 3. 사용자 정보와 선호

- 사용자: 중등부 주보 담당 교사. 지금은 혼자 작업하고, PC와 휴대폰을 오가며 씀.
- 답변은 한국어로, 짧고 실용적으로.
- 원본 디자인과 **똑같이** 맞추는 것을 중요하게 여김. 글꼴, 정렬, 너비를 자주 지적함.
- 비개발자. GitHub 설정 같은 작업은 클릭 단위로 안내해야 함.
- 매주 하는 일에는 Claude 토큰이 들지 않아야 함. 개발할 때만 Claude를 씀.

## 4. 매주 사용 흐름

1. **이번 주 내용** 탭에서 전달받은 메시지를 붙여 넣고 **주보에 넣기**
   ```
   [2026.10.09 중등부 예배]
   찬송 : 찬171장 하나님의 독생자 예수
   제목 : 부활하신 그리스도의 메세지
   본문 : 행1:8
   헌금찬송 : 말씀대로 되리라(1절 + 브릿지 + 후렴)
   성가대곡 : 천국 열쇠를 사용해요
   암송구절 : 마28:18~20
   ```
2. 구글 시트에서 이번 주·다음 주 대표기도와 헌금기도가 자동으로 채워짐
3. **PDF 저장**, **이미지 저장**, **썸네일 저장**
4. **카톡·유튜브** 탭에서 글 복사
5. 저장할 때 `jubo-records`에 기록이 자동으로 쌓임

## 5. 구현된 기능

### 주보 (A4 가로 1123×794px, 2면)
- **겉면**: 소식, 모임·신청 안내, 지교회, 선교사, 섬기는 이, 표지(로고·목표·기도제목·장소·말씀)
- **안면**: 예배 순서표, 사회·찬양인도·설교자, 붙잡은 말씀 상자, 체크리스트 표, 성경 읽기, 암송 말씀
- **위젯 방식 레이아웃**: `state.layout.pages[].ws[]`. 위젯 종류는 text, line, box, image, logo, order, checklist
- **디자인 편집 모드**(평소에는 꺼져 있음): 드래그, 크기 조절, 자석 정렬(Alt로 끔), 더블클릭 편집, 실행 취소, 복제, 레이어 순서, 면 사이 이동, 레이아웃 JSON 저장·불러오기
- **글상자 형식**: plain / list(`-`는 점 항목) / star / num / kv(직분:이름 균등 정렬). `==강조==`는 분홍 강조, `[[배지]]`는 그라데이션 배지
- **자리표시**: `{날짜}` `{사회}` `{찬양인도}` `{설교자}` `{대표기도}` `{헌금기도}` `{헌금위원}` `{성경읽기}` `{암송말씀}` `{암송본문}` `{암송구절}`
- **가끔 바뀌는 문구 수정**(접힘): 모임 안내 등 고정 문구와 체크리스트 표 항목을 디자인 모드 없이 고침

### 매주 자동화
- **붙여넣기 해석**: 콜론, 대시, 번호, 이모지, 전각 콜론 형식 모두 인식. 날짜는 가까운 주일로 맞춤
- **구글 시트**: gviz JSONP로 읽음. 이번 주 기도자는 예배 순서에(렘넌트·교사), 다음 주 기도자는 소식에(렘넌트·선생님) 들어감. 비고도 표시
- **성경 읽기**: 매주 7장씩 자동 진행. 기준은 2026-10-04 이사야 46장. 지난주·이번 주 비교 표시
- **암송 구절**: 한 번 입력한 본문을 기억. 대한성서공회 개역개정 바로가기
  - 링크 형식: `https://www.bskorea.or.kr/bible/korbibReadpage.php?version=GAE&book=mat&chap=28&sec=18`
  - 책 코드는 표준 3글자(mat, jhn, 1co, sng 등)
  - 복사해 붙여 넣으면 절 번호와 각주가 자동으로 지워짐
  - 개역개정은 저작권 때문에 본문을 페이지에 넣을 수 없어서 사용자가 직접 붙여 넣음
- **헌금위원**: 3개월마다 교체. 시작일별 명단을 넣어 두면 날짜에 맞게 자동 적용, 교체 알림
- **썸네일**
  - 설교 1280×720: 남색 #183d78 바탕(모서리에 분홍·파랑 빛), 그라데이션 리본·설교자 알약, 제목은 그라데이션 글자, SUMMIT 로고(원본에서 잘라 data URI로 넣음)
  - 찬양대 1920×1080: 연한 파랑 모눈 배경, 둥근 흰 카드 + 그라데이션 그림자, 남색 글자, 곡 제목은 그라데이션, 분홍 집게
  - 글꼴은 모두 빗썸고딕 Original(리본 영문 포함, 없는 글자는 프리텐다드). 글꼴 탭 설정과 상관없이 PDF·이미지에 항상 넣음. 제목 그라데이션은 `.gtx`(fitThumbText가 넣는 span에 적용)
  - 제목이 길면 한 줄에 들어가게 글자 크기를 줄임
- **카톡·유튜브 탭**: 카톡 전달 글과 유튜브 설명 글을 만들고 복사 버튼 제공. 유튜브 설명은 5,000자 한도 표시. 원작 설교 정보 입력 가능
- **기록 탭 (구글 시트 또는 GitHub 동기화, 2026-10-25 구글 시트 추가)**
  - 저장소는 `STORES.sheet` / `STORES.github` 두 가지이고 같은 모양(getState·putState·putRecord·listRecords·getRecord·test)으로 씀. `store()`가 고름: 시트 주소+비밀번호가 있으면 시트, 아니면 GitHub 열쇠
  - **구글 시트**: `apps-script/Code.gs`를 시트의 Apps Script 웹 앱(실행: 나, 액세스: 모든 사용자)으로 배포. 코드 맨 위 `PASSWORD`가 공용 비밀번호. 페이지는 `text/plain` POST(사전 요청 없음)로 `{pass, action, ...}`를 보냄. 설치 안내는 `apps-script/README.md`
    - `_작업내용` 시트(숨김): state JSON을 4만 자씩 잘라 A열에 넣음. 각 조각 앞에 `~`를 붙여 수식·숫자로 바뀌지 않게 함
    - `주보 기록` 시트: 날짜별 한 줄(보기용 열 + 마지막 열에 원본 JSON), 서식은 일반 텍스트(@), 날짜 내림차순 정렬
    - 주소·비밀번호는 localStorage `jungdeungbu-bulletin-v1-gsheet`에만 저장
    - 실제 구글 배포로는 아직 시험하지 않음. 브라우저에서 SpreadsheetApp 등을 흉내 낸 가짜 환경으로 Code.gs를 돌려 저장·불러오기·엇갈림 방지·조각 나눔을 확인함
  - **파일로 보관**: 기록 탭의 "파일로 내보내기/가져오기"는 디자인 모드의 레이아웃 파일 저장·불러오기와 같은 기능(state 전체+직접 넣은 글꼴). 가져올 때 `syncBase`는 이 기기 값을 유지
  - GitHub 저장 위치: `state/current.json`(작업 전체)과 `records/YYYY/YYYY-MM-DD.json`(주차별 기록)
  - 열쇠는 fine-grained PAT, `jubo-records`의 Contents 읽기·쓰기 권한만 줌. localStorage 키 `jungdeungbu-bulletin-v1-github`에 저장하고, state와 레이아웃 파일에는 넣지 않음
  - 엇갈림 방지: `state.syncBase`(마지막으로 맞춘 원격 updatedAt)보다 원격이 새로우면 덮어쓰지 않고 먼저 물어봄
  - 자동 저장 시점: PDF·썸네일 저장할 때, 페이지를 벗어날 때(visibilitychange)
  - 지난 주보 불러오기, CSV(엑셀용) 내보내기
  - (2026-10-18 수정) 예전에는 `ghApi`가 404를 모두 null로 넘겨서, 저장소에 접근할 수 없을 때도 PUT이 "저장했어요"로 표시됐음. 이제 PUT의 404는 오류(`GH_NOREPO`)이고, 응답에 `content.sha`가 없으면 실패로 봄. 불러오기에서 파일이 없으면 `ghRepoOk()`로 "아직 저장 안 함"과 "저장소 접근 불가"를 구분함
  - 사용자 쪽에서 실제로 저장이 안 되던 상태였음(열쇠의 저장소 접근 권한 또는 저장소 이름 문제로 추정). 사용자 확인 필요

### 디자인 개편 (2026-10-18, `designV5` 이주 플래그)
- 배치는 그대로 두고 색, 글꼴, 표지 타이틀만 바꿈
- 색: `--navy #183d78`(제목), `--ink`(본문), `--pink`/`--pink-soft`/`--pink-line`, 그라데이션 `--g`는 #ff829b → #d47fc8 → #5199f5. 글자색 '그라데이션'은 이제 남색 단색으로 나옴
- 표지 로고: 기본은 `TITLE_IMG` 이미지(사용자가 준 "임마누엘서울교회 중등부" 시안에서 잘라 크림색 바탕을 투명하게 만든 906×535 PNG, `designV7`). 위젯 속성 "시안 이미지 타이틀 쓰기"를 끄면 글자 버전(남색 "임마누엘교회" + 그라데이션 "중등부" + SVG 타원 곡선 + 별, Pretendard 800/900)으로 그림
- 원본 해상도가 낮아(840px) 인쇄 시 약간 흐릴 수 있음. 더 큰 원본 이미지를 받으면 교체
- 굵기가 여러 개인 글꼴은 `WEIGHTS`로 역할별 굵기를 정해 `--w-title` 등 변수로 넣음
- 프리텐다드는 `SUBSETS`(dynamic-subset CSS)에서 쓰인 글자가 든 조각만 PDF에 넣음
- 빗썸고딕(OFL)은 빗썸 서버에 CORS가 없어 woff2를 base64로 index.html에 넣음(`BITHUMB_ORIGINAL`/`BITHUMB_BASIC`, 각 약 350KB). 2,450자라 드문 글자는 프리텐다드로 대체됨
- 사용자 레이아웃은 기본 위치와 다름(디자인 편집으로 옮겨 둔 상태). 기본 위치를 가정한 수정은 위험함. `fitTextToNeighbors()`(`designV12`, 한 번 실행)가 실제 위치를 기준으로 글상자 높이를 바로 아래 위젯 6px 위까지로 줄이고, 넘치면 글자를 0.2px씩 줄임(최소 9px). 옆 단과 20px 미만으로 걸친 위젯은 아래 위젯으로 치지 않음
- index.html이 약 1.2MB가 되어 Claude 미리보기 창에서 file://로 바로 열리지 않음. 확인할 때는 로컬 서버(localhost)로 열기

### 글꼴 (역할별 설정)
| 역할 | 글꼴 | 예전 디자인 |
|---|---|---|
| 타이틀(작은 제목들) | 빗썸고딕 Original (`designV8`, Basic도 선택 가능) | Black Han Sans |
| 기본 | 프리텐다드 | Do Hyeon |
| 배지("2026년 목표" 등) | 빗썸고딕 Original (`designV10`) | 여기어때 잘난체 (Jalnan) |
| 표지 "예배 장소/시간" 줄 | 타이틀 글꼴(빗썸고딕)을 씀 (`font:'disp'`) | 기본 글꼴 |
| 표지 목표·기도제목 | 프리텐다드 | 카페24 오스퀘어 |
| 썸네일 대부분 | 카페24 오스퀘어 | 원본 썸네일 비교로 확인 |
| MIDDLE SCHOOL | Bebas Neue | |

- 무료 웹폰트 주소(jsDelivr, 커밋 고정)
  - `cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@5421a2f.../Cafe24Ohsquare.woff`
  - `cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_four@83c75bb.../JalnanOTF00.woff`
- 사용자가 글꼴 파일을 올릴 수 있음(IndexedDB `jubo-fonts`)
- PDF와 이미지로 내보낼 때는 구글 글꼴을 쓰인 글자만 잘라 data URI로 넣고, 웹폰트는 파일 전체를 넣음(`buildFontCSS`)

### 저장·출력
- html-to-image@1.11.11과 jsPDF 2.5.1 사용
- `toPng(el,W,H,ratio)`는 **배경색을 요소의 실제 배경색으로 지정**함. 예전에는 흰색으로 고정돼 설교 썸네일 배경이 사라졌던 버그가 있었음
- 여러 파일을 한 번에 받으면 브라우저가 막기 때문에, 저장 창에서 한 장씩 누르는 방식을 씀

## 6. 코드 구조 메모 (index.html, 약 1,760줄)

- 상태: `state` 객체 하나. localStorage 키 `jungdeungbu-bulletin-v1`. 기본값은 `WEEK`, 고정 문구 기본값은 `FIXED`
- 저장 형식이 바뀌면 이주 플래그로 처리함: memMigrated, fontMigrated, fontV2/V3, badgeV2, creditsV2/V3, layoutV4
- 그리기: `renderAll()`은 syncBible, syncTeam, renderPages 순서로 부름. `renderPages()`는 주보 두 면과 `thumbsHTML()`을 그림
- 예배 순서 접근: `getOrderCell(label,col)`, `setOrderCell(label,col,val)`. 라벨 비교는 공백을 무시함
- 탭은 `showTab()`에 등록함: week / share / sync / fonts / props
- 보호 장치: 시작할 때는 `booting` 플래그가 켜져 있어서 updatedAt을 바꾸지 않음
- **성가대곡 칸**(`#choirSong`): 예배 순서 "찬양" 줄 내용과 같은 값. `setChoirSong()`은 찬양 줄이 없으면 "말씀 제목" 앞에 새로 만듦. 붙여넣기의 성가대곡도 이 함수를 씀
- `designV13`: 안면의 예배 순서표 바로 아래 상자를 순서표와 같은 x·너비로 맞추고 상자 안 글상자도 같이 옮김
- **모바일(폭 860px 이하) 미리보기**: `.stage`를 화면 밖(`translateY(100%)` + `visibility:hidden`)에 두고, 아래 `#previewFab` 버튼으로 전체 화면 창(`body.preview-open`)으로 엶. `display:none`을 쓰지 않는 이유는 숨겨 있어도 `fit()` 등 크기 계산이 맞게 하려는 것. 닫기는 `#previewClose`, 뒤로 가기(history.pushState), Esc
- **[hidden] 규칙**: 독립 HTML 파일이라 `[hidden]{display:none!important}`를 직접 넣어 둠. 이게 없어서 저장 창 오버레이가 클릭을 막았던 적이 있음

## 7. 검증 방법 (개발 환경)

- Playwright와 Chromium으로 확인함. 작업 환경에서 구글 글꼴과 CDN이 막혀 있어서 대신 이렇게 함:
  - 구글 글꼴은 `github.com/google/fonts`를 sparse clone해 로컬에서 route로 제공
  - noonnu 글꼴은 `github.com/projectnoonnu/*` 저장소에서 받음
  - html-to-image는 GitHub 소스를 tsc로 직접 묶어서 씀
- GitHub API는 가짜 서버(route)로 PC와 휴대폰 두 기기를 흉내 내 동기화와 엇갈림 방지를 확인함
- 원본 PNG와 렌더링 결과를 위아래로 붙여 비교함

## 8. 남은 일과 아이디어

1. **사용자 설정 확인**: Pages 켜기와 열쇠 만들기는 끝났고, 페이지에 열쇠를 붙여 넣는 단계(기록 탭)를 진행 중
2. **알려진 작은 버그**: PDF·이미지로 저장하면 표지 타원 테두리의 점선 부분(mask 사용)이 실선으로 나옴
3. 저작권 문구 기본값에 철자 오류가 있을 수 있음(EVANGELIZTION, ALLANCE, All Right). 사용자 확인 필요
4. **React 전환 계획** (사용자와 합의한 방향, 아직 시작 안 함)
   - React, TypeScript, Vite, GitHub Actions로 Pages에 배포
   - 옮기는 순서: 주보·썸네일 그리기 → 매주 입력 → 저장(모바일 공유 포함) → 카톡·유튜브 글 → 기록 → 디자인 편집기(PC 전용)
   - 아이폰 사파리에서 html-to-image 글꼴이 빠지는 문제는 초기에 시험해야 함
5. 구글 시트 저장(공용 비밀번호 + Apps Script)을 만들었음(2026-10-25). 사용자가 `apps-script/README.md` 순서대로 배포하고 실제로 저장되는지 확인 필요
6. 이전에 쓰던 Canva 스킬(`jubo-update`)은 토큰 문제로 쓰지 않음
