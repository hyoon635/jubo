/**
 * @OnlyCurrentDoc  권한을 "이 시트 하나"로 좁힘 (구글 드라이브의 다른 시트에는 손대지 않음)
 */
/**
 * 중등부 주보 저장소 (구글 시트 + Apps Script)
 *
 * 설치: 구글 시트 > 확장 프로그램 > Apps Script 에 이 파일 내용을 붙여 넣고,
 *      아래 PASSWORD를 바꾼 뒤 배포 > 새 배포 > 웹 앱 (실행: 나, 액세스: 모든 사용자)
 *      자세한 순서는 apps-script/README.md
 *
 * 시트 두 개를 씀
 *   _작업내용 : 주보 페이지의 작업 상태 전체(JSON). 셀 한 칸에 5만 자까지라 잘라서 A열에 넣음. 숨김
 *   주보 기록 : 주차별로 한 줄. 사람이 보기 좋은 열 + 마지막 열에 원본 JSON
 */
const PASSWORD = '여기에-비밀번호';

const STATE_SHEET = '_작업내용';
const REC_SHEET = '주보 기록';
const CHUNK = 40000;
/* 셀이 =, +, 숫자로 시작하면 수식·숫자로 바뀌므로 조각마다 붙였다가 읽을 때 뗌 */
const MARK = '~';
const REC_COLS = [
  ['date', '날짜'], ['title', '말씀 제목'], ['passage', '본문'], ['preacher', '설교자'],
  ['song', '찬양대 곡'], ['choir', '찬양대'], ['bible', '성경 읽기'], ['memRef', '암송 구절'], ['memText', '암송 본문'],
  ['nextPrayer', '다음 주 대표기도'], ['nextOffering', '다음 주 헌금기도'], ['offeringTeam', '헌금위원'],
  ['shareWorshipUrl', '예배 영상'], ['shareChoirUrl', '찬양대 영상'], ['savedAt', '저장한 때'],
];

function doGet() {
  return out({ ok: true, hint: '주보 페이지의 기록 탭 > 구글 시트 연결 설정에 이 주소를 넣어 주세요.' });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return out({ error: '요청 형식이 잘못됐어요.' }); }
  if (!PASSWORD || PASSWORD === '여기에-비밀번호') return out({ error: 'Apps Script 코드 맨 위의 PASSWORD를 먼저 바꾸고 다시 배포해 주세요.' });
  if (req.pass !== PASSWORD) return out({ error: '비밀번호가 맞지 않아요.' });
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    switch (req.action) {
      case 'ping': return out({ ok: true, name: SpreadsheetApp.getActive().getName() });
      case 'getState': return out({ ok: true, state: readState() });
      case 'putState': writeState(req.state); return out({ ok: true });
      case 'putRecord': writeRecord(req.record); return out({ ok: true });
      case 'listRecords': return out({ ok: true, dates: listDates() });
      case 'getRecord': return out({ ok: true, record: readRecord(req.date) });
    }
    return out({ error: '알 수 없는 요청이에요: ' + req.action });
  } catch (err) {
    return out({ error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet(name, header) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (header) { sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold'); sh.setFrozenRows(1); }
    else sh.hideSheet();
  }
  return sh;
}

function readState() {
  const sh = SpreadsheetApp.getActive().getSheetByName(STATE_SHEET);
  if (!sh || sh.getLastRow() < 1) return null;
  const s = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(r => String(r[0]).slice(MARK.length)).join('');
  return s ? JSON.parse(s) : null;
}

function writeState(state) {
  if (!state || typeof state !== 'object') throw new Error('저장할 내용이 없어요.');
  const s = JSON.stringify(state), rows = [];
  for (let i = 0; i < s.length; i += CHUNK) rows.push([MARK + s.slice(i, i + CHUNK)]);
  const sh = sheet(STATE_SHEET);
  sh.clearContents();
  sh.getRange(1, 1, rows.length, 1).setNumberFormat('@').setValues(rows);
}

const recHeader = () => REC_COLS.map(c => c[1]).concat(['예배 순서', '원본(JSON)']);
/* 기록 줄은 서식을 일반 텍스트(@)로 두고 쓰므로 =, 날짜처럼 보이는 글자도 그대로 남음 */
const cell = v => v == null ? '' : String(v);

function writeRecord(rec) {
  if (!rec || !/^\d{4}-\d{2}-\d{2}$/.test(rec.date || '')) throw new Error('날짜가 없는 기록이에요.');
  const sh = sheet(REC_SHEET, recHeader());
  const order = (rec.order || []).map(x => (x || []).filter(Boolean).join(' / ')).join(' | ');
  const row = REC_COLS.map(c => cell(rec[c[0]])).concat([cell(order), MARK + JSON.stringify(rec)]);
  const dates = listDates();
  const at = dates.indexOf(rec.date);
  const r = at >= 0 ? at + 2 : sh.getLastRow() + 1;
  sh.getRange(r, 1, 1, row.length).setNumberFormat('@').setValues([row]);
  if (at < 0) sh.getRange(2, 1, sh.getLastRow() - 1, row.length).sort({ column: 1, ascending: false });
}

function listDates() {
  const sh = SpreadsheetApp.getActive().getSheetByName(REC_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 1).getDisplayValues().map(r => r[0]);
}

function readRecord(date) {
  const at = listDates().indexOf(date);
  if (at < 0) return null;
  const sh = SpreadsheetApp.getActive().getSheetByName(REC_SHEET);
  const v = String(sh.getRange(at + 2, REC_COLS.length + 2).getValue());
  return JSON.parse(v.slice(MARK.length));
}
