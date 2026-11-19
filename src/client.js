/* ===== Окно обновления ПО в клиенте TRASSIR — второй подход =====
   Окно настроек нового формата (дерево слева, страница «vms» справа). Обновление по сети — по сценарию продукта:
   подарочек и подсветка → меню → окно «Обновление по сети» → загрузка в фоне → «Перезапустить и установить»
   (или сразу, если стоит галочка) → установка в фоне → итог в той же строке. Окон — только там, где нужен выбор. */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SRV='vms';
const LATEST='4.9.15.0';
const SITE='site.html#pick';
const SITE_TXT='dssl.ru/support/tech/soft/trassir_index.php'; // адрес видимым текстом — чтобы набрать с телефона
const PHONE='8 (499) 111-25-50';
const XSVG='<svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1L1 9" stroke="#333"/></svg>';
const ARROW='<svg width="18" height="10" viewBox="0 0 18 10"><path d="M1 5h15m-4-4l4 4-4 4" stroke="#8f9093" fill="none"/></svg>';
const SPIN='<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.8" stroke="#ecd9a8" stroke-width="1.6"/><path d="M7 1.2a5.8 5.8 0 0 1 5.8 5.8" stroke="#8a6400" stroke-width="1.6"/></svg>';
const BI = {
  dl:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 2v8m0 0L4.5 6.5M8 10l3.5-3.5M2.5 13.5h11"/></svg>',
  spin:'<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-opacity=".25" stroke-width="1.8"/><path d="M8 1.8A6.2 6.2 0 0 1 14.2 8" stroke="currentColor" stroke-width="1.8"/></svg>',
  ok:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8.5l3 3L13 4.5"/></svg>',
  err:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.8v3.8m0 2.2v.3"/></svg>',
  pause:'<svg viewBox="0 0 16 16" fill="currentColor"><rect x="4" y="3" width="2.6" height="10" rx=".6"/><rect x="9.4" y="3" width="2.6" height="10" rx=".6"/></svg>'
};
const GIFT='<svg class="gift" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="7" width="12" height="7.5" rx="1" fill="currentColor"/><rect x="1" y="4.5" width="14" height="3" rx="1" fill="currentColor"/><path d="M8 4.5v10" stroke="#fff" stroke-width="1.4"/><path d="M8 4.5C7 2 4.2 1.6 4.4 3.3 4.6 4.6 8 4.5 8 4.5zm0 0c1-2.5 3.8-2.9 3.6-1.2C11.4 4.6 8 4.5 8 4.5z" fill="currentColor"/></svg>';
const WARN_IMG='<img class="warn" src="__ASSET:warning__" width="16" height="16" alt="">';

/* ---------- данные (номера сборок и тексты изменений условные) ---------- */
const CH = {
  '4.9.15.0':{d:'28.10.2026', b:'1321840', items:['Видеоаналитика на видеокартах NVIDIA GeForce RTX 50-й серии.','Исправлены разрывы подключений через Cloud Connect примерно через сутки работы.','СКУД: уведомления через МАКС, PIN-код на контроллерах Hikvision.']},
  '4.9.14.0':{d:'14.10.2026', b:'1319665', items:['Для камеры TR-D6124IR10v3 (D) снова видны кнопки PTZ-пресетов.','Быстрее поиск по архиву на серверах с большим числом каналов.']},
  '4.9.13.0':{d:'30.09.2026', b:'1317308', items:['Базовый «Детектор вторжения» на серверах NeuroStation и UltraStation.','До 60 FPS для камеры TR-D2343WDZIR7v3 (R).']},
  '4.9.12.0':{d:'16.09.2026', b:'1316200', items:['Экспорт архива в MP4 без перекодирования.','Исправлено зависание клиента при быстром переключении раскладок.']},
  '4.9.11.0':{d:'02.09.2026', b:'1314420', items:['Поддержка камер TRASSIR серии v8.','Исправлены ложные срабатывания детектора движения ночью.']},
  '4.9.10.0':{d:'12.08.2026', b:'1312005', items:['Новый вид журнала событий.','Ускорен запуск сервера с большим архивом.']}
};
const VERS = Object.keys(CH);
// более ранние версии для «Показать более ранние версии» — подгружаются сколько угодно раз (тексты условные)
const OLD_ITEMS = ['Исправления стабильности сервера.','Поддержка новых моделей IP-камер.','Ускорена работа с архивом.','Исправлены ошибки интерфейса клиента.','Улучшена работа детекторов.','Обновлены драйверы устройств.'];
const OLD = {};
(()=>{ const [d0,m0,y0]=CH[VERS[VERS.length-1]].d.split('.').map(Number); let t=new Date(y0,m0-1,d0), k=0;
  const tops={'4.9':9,'4.8':12,'4.7':20,'4.6':11,'4.5':29};
  for(const br of Object.keys(tops)) for(let n=tops[br]; n>=0; n--){ const v=`${br}.${n}.0`; if(CH[v]) continue;
    t=new Date(t.getTime()-14*864e5); OLD[v]={d:t.toLocaleDateString('ru-RU'), items:[OLD_ITEMS[k%6],OLD_ITEMS[(k+3)%6]]}; k++; } })();
const ALL_VERS = [...VERS, ...Object.keys(OLD)];
const verInfo = v => CH[v] || OLD[v];
// версия, которая выходит, пока загруженное обновление ждёт установки (сценарий «вышла версия новее»)
const NEXT = {v:'4.9.16.0', d:'11.11.2026', b:'1324302', items:['Исправлена остановка записи при переполнении архивного диска.','Быстрее открывается журнал событий.']};
const BR_LAST = {'4.7':'4.7.9.2','4.8':'4.8.3.5','4.9':LATEST};
const SIZE = 1300;  // МБ — единый файл сервера
const SPEED = 4.3;  // МБ/с — для оценки «осталось»; сама загрузка в демо ускорена
const FILES = [
  {n:'Trassir-Server-4.9.15.0-1321840-win64.pack', v:'4.9.15.0', mb:1300, where:'Загрузки', ok:true, tag:'Рекомендуем: последняя версия'},
  {n:'Trassir (1).pack', v:'4.9.15.0', mb:1300, where:'Рабочий стол', ok:true, tag:'Имя изменено', tip:'Версию определили по содержимому файла — название не важно.'},
  {n:'Trassir-Server-4.9.14.0-1319665-win64.pack', v:'4.9.14.0', mb:1290, where:'Загрузки', ok:true, tag:'Подходит, но есть версия новее'},
  {n:'Trassir-Client-4.9.15.0-1321840-win64.pack', mb:693, where:'Загрузки', err:'Не подходит: это файл для TRASSIR Client'},
  {n:'Trassir-4.9.15.0-1321844-LITE', mb:2300, where:'USB-накопитель (E:)', err:'Не подходит: прошивка для регистраторов MiniNVR'}
];
// «Обзор…»: первый выбор — подходящий файл, дальше по кругу сценарии ошибок
const PICKS = [
  {n:'Trassir-Server-4.9.15.0-1321840-win64.pack', v:'4.9.15.0', mb:1300, where:'Выбран вручную', ok:true, tag:'Подходит: последняя версия'},
  {n:'trassir_4.9.15.zip', mb:1240, where:'Выбран вручную', err:'Некорректное расширение файла', kind:'format'},
  {n:'Trassir-Server-4.9.15.0-1321840-win64.pack', mb:910, where:'Выбран вручную', err:'Файл повреждён', kind:'sign'},
  {n:'Trassir-Server-4.9.12.0-1316200-win64.pack', v:'4.9.12.0', mb:1280, where:'Выбран вручную', err:'Версия 4.9.12.0 старше установленной', kind:'older'}
];
const PICK_RECS = {
  format:['Нужен файл .pack с сайта TRASSIR.','Если скачали архив, распакуйте его.'],
  sign:['Скачайте файл заново.','Если переносили на флешке, запишите его ещё раз.','Проверьте, не мешает ли антивирус.'],
  older:['Нужен файл с более новой версией.']
};
// дерево разделов — как в макете окна настроек
const TREE = [
  {id:'vms', t:'vms', lvl:0, big:1, icon:'db', open:1},
  {id:'srvset', t:'Настройки сервера', lvl:1, big:1, icon:'gear', open:1},
  {id:'upd', t:'Обновление ПО', lvl:2, page:1},
  {id:'cloud', t:'Облако TRASSIR', lvl:2, bold:1, closed:1},
  {id:'archive', t:'Архив', lvl:2}, {id:'iscsi', t:'iSCSI', lvl:2}, {id:'netrec', t:'Запись сетевых каналов', lvl:2},
  {id:'sync', t:'Синхронизация архива', lvl:2}, {id:'shots', t:'Скриншоты', lvl:2}, {id:'web', t:'Веб-сервер', lvl:2},
  {id:'map', t:'Карта', lvl:2}, {id:'geo', t:'Геокарта', lvl:2}, {id:'reports', t:'Отчеты', lvl:2}, {id:'db', t:'База Данных', lvl:2},
  {id:'time', t:'Дата и время', lvl:2}, {id:'ifaces', t:'Сетевые интерфейсы', lvl:2}, {id:'persons', t:'Персоны', lvl:2},
  {id:'users', t:'Пользователи', lvl:2, bold:1, closed:1}, {id:'audit', t:'Аудит', lvl:2}, {id:'wm', t:'Водяной знак', lvl:2},
  {id:'mods', t:'Модули', lvl:1, big:1, icon:'ext', closed:1}, {id:'devs', t:'Устройства', lvl:1, big:1, icon:'chip', closed:1},
  {id:'chans', t:'Каналы', lvl:1, big:1, icon:'cam'}, {id:'net', t:'Сеть', lvl:1, big:1, icon:'lan', closed:1},
  {id:'auto', t:'Автоматизация', lvl:1, big:1, icon:'bot', closed:1}, {id:'lic', t:'Лицензия', lvl:1, big:1, icon:'doc', open:1},
  {id:'eula', t:'Лицензионное соглашение', lvl:2}
];
const TICON = {db:'__ASSET:t-db__', gear:'__ASSET:t-gear__', ext:'__ASSET:t-ext__', chip:'__ASSET:t-chip__', cam:'__ASSET:t-cam__', lan:'__ASSET:t-lan__', bot:'__ASSET:t-bot__', doc:'__ASSET:t-doc__'};

/* ---------- состояние ---------- */
const S = {
  net:'avail', files:'found', dlOut:'ok', outcome:'ok', newerOut:false,
  autoCheck:true, backup:true, restartNow:false, sel:'vms',
  notify:true, // уведомлять о новых версиях (красная отметка)
  ui:'page' // вид обновления: page — отдельная страница «Обновление ПО» (новый), modal — меню и окна (было)
};
let CUR=null, BTNS=[], ONX=null, tDl=null, tRs=null, tChk=null, tFind=null;

function baseLog(){
  if(S.net==='old') return [{t:'05.03.2025 12:40', a:'Обновление', from:'4.6.8.0', to:'4.6.9.0', ok:true, who:'admin', bk:false},{t:'22.11.2024 22:34', a:'Установка', to:'4.5.26.0', ok:true, who:'—'}];
  const l=[
    {t:'21.10.2026 10:02', a:'Обновление', from:'4.9.11.0', to:'4.9.13.0', ok:true, who:'admin', bk:true},
    {t:'20.10.2026 18:47', a:'Обновление', from:'4.9.11.0', to:'4.9.13.0', ok:false, who:'admin', why:'Файл повреждён — не прошёл проверку подписи. Сервер остался на 4.9.11.0'},
    {t:'02.09.2026 09:15', a:'Обновление', from:'4.9.10.0', to:'4.9.11.0', ok:true, who:'i.petrov', bk:true},
    {t:'12.08.2026 22:05', a:'Обновление', from:'4.9.9.0', to:'4.9.10.0', ok:true, who:'admin', bk:true},
    {t:'22.11.2024 22:34', a:'Установка', to:'4.5.26.0', ok:true, who:'—'}
  ];
  if(S.net==='latest') l.unshift({t:'28.10.2026 23:10', a:'Обновление', from:'4.9.13.0', to:LATEST, ok:true, who:'admin', bk:true});
  return l;
}
function reset(){
  clearTimeout(tDl); clearTimeout(tRs); clearTimeout(tChk); clearTimeout(tFind);
  const cur = S.net==='latest'?LATEST : S.net==='old'?'4.6.9.0' : '4.9.13.0';
  Object.assign(S, {cur, build:CH[cur]?.b||'1268000', checked:S.autoCheck, checking:false,
    dl:null, ready:null, busy:null, note:null, extra:[], fileSel:0, pickN:0,
    src:(S.net==='offline'||S.net==='nohost')?'file':'net', failTo:null, rbFrom:null, moreCh:0, back:[], exp:{}, sel:'vms', log:baseLog(), pfile:null, upOpen:{ch:false,log:false,wn:false}});
  CUR=null; resetGeom(DW); draw();
}

/* ---------- помощники разметки ---------- */
const ICO = k => ICON[k==='ok'?'ok':k==='warn'?'warn':k==='err'?'err':'info'];
// пояснения второго плана — в подсказку по иконке ⓘ (span, а не button: бывает внутри строки-кнопки)
const hint = t => `<span class="hi" tabindex="0" role="img" data-tip="${esc(t)}" aria-label="Подсказка: ${esc(t)}">${ICON.info}</span>`;
const sh = (k,title,text,tip) => `<div class="sh">${ICO(k)}<div><b>${title}${tip?hint(tip):''}</b>${text?`<p>${text}</p>`:''}</div></div>`;
const box = (k,html) => `<div class="ubox ${k}">${html}</div>`;
const ck = (key,label,sub) => `<label class="ck"><button type="button" class="cb" role="checkbox" aria-checked="${!!S[key]}" data-ck="${key}">${ICON.check}</button><span>${label}${sub?hint(sub):''}</span></label>`;
const lnk = (act,t) => `<a class="lnk" data-act="${act}" tabindex="0">${t}</a>`;
const bAct = lnk; // действия в фоновой строке — ссылками, как раньше
const site = () => `<a class="lnk url" href="${SITE}" target="_blank">${SITE_TXT}</a>`;
const ul = a => `<ul class="chg">${a.map(x=>`<li>${x}</li>`).join('')}</ul>`;
const mb = v => v>=1000 ? (v/1000).toFixed(1).replace('.',',')+' ГБ' : Math.round(v)+' МБ';
const left = s => { const sec=s/SPEED; return sec<60?'меньше минуты':`~${Math.ceil(sec/60)} мин`; };
const br = v => v.split('.').slice(0,2).join('.');
const newer = (a,b) => { const x=a.split('.').map(Number), y=b.split('.').map(Number); for(let i=0;i<4;i++) if(x[i]!==y[i]) return x[i]>y[i]; return false; };
function chainFrom(v){ const b=br(v); if(b==='4.9') return [LATEST]; return Object.keys(BR_LAST).filter(k=>newer(k+'.0.0',b+'.0.0')).map(k=>BR_LAST[k]); }
function changesSince(v){ return VERS.filter(x=>newer(x,v)); }
const help = () => `<div class="helpl"><span>Не получается? Техподдержка TRASSIR: <b>${PHONE}</b>, пн–пт 9:00–18:00.</span><a class="lnk" href="#" onclick="return false">Все контакты ↗</a></div>`;
const verList = vers => `<div class="vlist">${vers.map(v=>{
  // «Доступна» — только у последней версии, у промежуточных отметок нет
  const tag = v===S.cur?'<span class="chip">Установлена</span>' : (v===LATEST && newer(v,S.cur))?'<span class="chip ok">Доступна</span>':'';
  return `<div><div class="ver-h"><b>${v}</b><small>${verInfo(v).d}</small>${tag}</div>${ul(verInfo(v).items)}</div>`; }).join('')}</div>`;
// ссылка, которая разворачивает содержимое прямо в этом окне
const exp = (key,label,html,keep) => `<a class="lnk exp-t${S.exp[key]?' on':''}" data-act="exp" data-k="${key}" role="button" tabindex="0" aria-expanded="${!!S.exp[key]}">${S.exp[key]&&!keep?'Свернуть':label}</a>${S.exp[key]?`<div class="exp-b">${html}</div>`:''}`;
// галочки окна: бэкап и перезапуск сразу. Автопоиск обновлений — настройка раздела «Сеть», в окнах его нет
const opts = () => `<div class="opts">${ck('backup','Сохранить бэкап настроек','Перед установкой — на архивный диск. Если после обновления что-то пойдёт не так, к нему можно вернуться')}
  ${S.backup?'':`<p class="fine" style="color:var(--warn);margin:-2px 0 0 22px">Без бэкапа вернуться к ${S.cur} не получится — только переустановкой.</p>`}
  ${ck('restartNow','Перезапустить сервер и установить сразу после загрузки','Сервер будет недоступен около 5 минут, запись архива на это время остановится')}</div>`;

/* ---------- состояние обновления ---------- */
function netState(){
  if(S.busy) return 'busy'; if(S.dl) return 'dl'; if(S.ready) return 'ready';
  if(S.checking) return 'checking';
  if(!S.checked) return 'unchecked';
  if(S.net==='offline'||S.net==='nohost') return S.net;
  if(!newer(LATEST,S.cur)) return 'latest';
  if(br(S.cur)!=='4.9') return 'old';
  return S.net==='space'?'space':'avail';
}
function openNet(){ const st=netState();
  if(st==='ready') return open('ready');
  if(st==='dl'||st==='busy') return; // загрузка и установка идут в фоне — их видно в строке под кнопками
  open('net', st);
}

/* ================= окна ================= */
const WIN = {
  net(st){
    const T='Обновление по сети';
    if(st==='checking') return {t:T, body:`<div class="sh">${ICON.spin}<div><b>Проверяем обновления…</b><p>Обращаемся к серверу обновлений TRASSIR.</p></div></div>`, btns:[{t:'Закрыть',act:close}]};
    // автопоиск выключен в разделе «Сеть»: вместо обновления — просьба включить
    if(st==='unchecked') return {t:T,
      body:sh('info','Автоматический поиск обновлений выключен','Включите его — найдём обновление сейчас и дальше будем проверять сами. Настройка — в разделе «Сеть».'),
      btns:[{t:'Обновить из файла',act:()=>openFile()},{t:'Включить',pri:1,act:enableAuto}]};
    if(st==='latest') return {t:T,
      body:sh('ok',`Установлена последняя версия ${S.cur}`,'Проверено сегодня в 14:32.')+(CH[S.cur]?`<div>${exp('whatsnew','Что нового в этой версии',ul(CH[S.cur].items),true)}</div>`:''),
      btns:[{t:'Проверить снова',act:check},{t:'Закрыть',pri:1,act:close}]};
    if(st==='offline') return {t:T,
      body:sh('err','Нет доступа к сети',`${SRV} не подключён к интернету, поэтому проверить обновления нельзя.`)
        +`<div><div class="sec-h">Что можно сделать</div><ol class="recs">
          <li><b>Восстановить подключение.</b> Проверьте кабель и настройки в «Настройки сервера» → «Сетевые интерфейсы»: адрес, шлюз и DNS.</li>
          <li><b>Обновить из файла.</b> Скачайте файл на любом компьютере с интернетом — ${site()} — и загрузите его сюда.</li></ol></div>`+help(),
      btns:[{t:'Проверить снова',act:check},{t:'Обновить из файла',pri:1,act:()=>openFile()}]};
    if(st==='nohost') return {t:T,
      body:sh('err','Не удаётся связаться с сервером обновлений',`Интернет есть, но ${SRV} не находит адрес updates.cloud.trassir.com — обычно не указан шлюз или DNS.`)
        +`<div><div class="sec-h">Как исправить</div><ol class="recs">
          <li>Откройте «Настройки сервера» → «Сетевые интерфейсы».</li>
          <li>У интерфейса с доступом в интернет укажите шлюз и DNS. Подойдут DNS Яндекса <b>77.88.8.8</b> и <b>77.88.8.1</b>, за пределами России — Google <b>8.8.8.8</b>.</li></ol></div>`+help(),
      btns:[{t:'Закрыть',act:close},{t:'Проверить снова',pri:1,act:check}]};
    if(st==='old'){
      const ch=chainFrom(S.cur);
      return {t:T,
        body:sh('warn',`Сразу до ${LATEST} обновиться нельзя`,`Установлена ${S.cur}. Обновлять нужно по порядку: ${ch.length} шага.`)
          +`<div class="ways">
            <div class="way best"><b>Обновить по шагам${hint('Можно удалённо, настройки и архив сохранятся. После каждого шага сервер перезапустится.')}</b>
              <ol>${ch.map((v,i)=>`<li>${i===0?`<b>${v}</b> — сейчас`:v}</li>`).join('')}</ol></div>
            <div class="way"><b>Установить заново${hint(`Сразу ${LATEST} одним шагом. Нужен доступ к компьютеру, на котором стоит сервер.`)}</b>
              <span class="fine">Файл — на сайте ${site()}</span></div></div>`+opts(),
        btns:[{t:'Отмена',act:close},{t:`Загрузить шаг 1 — ${ch[0]}`,pri:1,act:()=>startDl('net',ch[0],SIZE)}]};
    }
    const space = st!=='space' ? '' : box('err',`<b>Не хватает места на системном диске</b><span>Нужно 2,6 ГБ, свободно 1,1 ГБ. Проверили до загрузки, чтобы она не оборвалась на середине.</span>
        <ol class="recs"><li>Удалите старые скриншоты и экспортированные видео: «Настройки сервера» → «Скриншоты».</li><li>Или загрузите обновление на архивный диск — места там достаточно.</li></ol>
        <div class="row"><button type="button" class="btn" data-act="toArchive">Загружать на архивный диск</button></div>`);
    return {t:T,
      body:sh('info',`Доступно обновление до ${LATEST}`,`Установлена ${S.cur} · загрузка ${mb(SIZE)}`,'Загрузка идёт в фоне — с TRASSIR можно работать как обычно.')
        // что изменилось — свёрнуто: хочет — разворачивает, смотрит и сворачивает
        +`<div>${exp('whatsnew',`Что изменилось в ${LATEST}`,ul(CH[LATEST].items),true)}</div>`
        +space+opts(),
      btns:[{t:'Отмена',act:close},{t:'Загрузить обновление',pri:1,dis:st==='space',act:()=>startDl('net',LATEST,SIZE)}]};
  },

  file(st){
    const T='Обновление из файла';
    const browseBtn = `<button type="button" class="btn sm" data-act="browse">Обзор…</button>`;
    // поиск и «ничего не нашлось» — одна строка с заголовком и «Обзор…»; где искали — в подсказке
    const head = (ic,title,tip,btn) => `<div class="fstate"><span class="t">${ic}<b>${title}</b>${hint(tip)}</span>${btn?browseBtn:''}</div>`;
    const WHERE = 'В «Загрузках», на «Рабочем столе» и на подключённых флешках этого компьютера.';
    if(st==='search') return {t:T,
      body:head(`<span class="spin">${ICON.spin}</span>`,'Ищем файлы обновления…',WHERE)
        +`<div class="fman"><span>Если поиск идёт долго, выберите файл вручную</span>${browseBtn}</div>`,
      btns:[{t:'Отмена',act:close},{t:'Загрузить обновление',pri:1,dis:true,act:()=>{}}]};
    if(st==='none') return {t:T,
      body:head(ICON.info,'Файлы обновления не найдены','Искали '+WHERE.charAt(0).toLowerCase()+WHERE.slice(1),true)
        +`<p class="fnote">Скачайте файл на сайте ${site()} и нажмите «Искать снова».</p>`
        +((S.net==='avail'||S.net==='space') && newer(LATEST,S.cur) && S.checked
          ? `<p class="fnote">Или ${lnk('net',`обновитесь по сети до ${LATEST}`)} — файл не понадобится.</p>` : ''),
      btns:[{t:'Отмена',act:close},{t:'Искать снова',pri:1,act:()=>startFind()}]};
    // выбран вручную — в списке только он; иначе — что нашёл поиск
    const manual=S.extra.length>0, all=manual?S.extra:FILES, f=all[S.fileSel]||all[0];
    const rows=all.map((x,i)=>`<button type="button" class="frow${i===S.fileSel?' on':''}${x.err?' bad':''}" data-fsel="${i}" role="radio" aria-checked="${i===S.fileSel}">
        <span class="rd"></span><span><span class="fn">${esc(x.n)}</span><br><span class="fm">${x.where}${x.v?' · версия '+x.v:''}</span><br>${x.err?`<span class="fe">${x.err}</span>`:`<span class="fo">${x.tag}</span>${x.tip?hint(x.tip):''}`}</span><span class="sz">${mb(x.mb)}</span></button>`).join('');
    let detail='';
    if(f.err && f.kind) detail=box('err',`<b>${f.err}</b><ol class="recs">${PICK_RECS[f.kind].map(r=>`<li>${r}</li>`).join('')}</ol>${f.kind==='older'?'':`<div>Скачайте файл заново: ${site()}</div>`}`);
    else if(f.err) detail=box('warn',`<span>${f.err}. Выберите файл с отметкой «Рекомендуем» или скачайте нужный: ${site()}</span>`);
    else detail=`<div class="flow"><span>Установлена <b>${S.cur}</b></span>${ARROW}<span>будет <b>${f.v}</b></span></div>`
      +(newer(LATEST,f.v)&&!manual?box('warn',`<span>Есть версия новее — ${LATEST}. Её файл тоже в списке.</span>`):'')+opts();
    return {t:T,
      body:`<div class="fsrc"><span>${manual?'Файл выбран вручную':`Нашли ${FILES.filter(x=>x.ok).length} подходящих файла на этом компьютере и флешке`} · ${lnk('refind','Искать снова')}</span>${browseBtn}</div>
        <div class="files" role="radiogroup" aria-label="Файлы обновления">${rows}</div>`+detail,
      btns:[{t:'Отмена',act:close},{t:'Загрузить обновление',pri:1,dis:!!f.err,act:()=>startDl('file',f.v,f.mb)}]};
  },

  // единственное окно после загрузки — если не стояла галочка «перезапустить сразу»
  ready(){
    const v=S.ready.target, nx = S.newerOut && newer(NEXT.v,v);
    const pg=S.ui==='page';
    return {t:'Обновление загружено',
      left: pg ? '' : `<button type="button" class="nbtn" data-act="delReady">Удалить загруженное</button>`,
      body:sh('ok',`${v} готово к установке`,'Сервер перезапустится и будет недоступен около 5 минут. Запись архива на это время остановится.',
        S.backup?'Перед установкой сохраним бэкап настроек.':'')
        // пока обновление ждало установки, вышла версия новее — предлагаем её вместо этой
        +(nx?box('info',`<b>Вышла версия новее — ${NEXT.v}</b><span>Можно удалить загруженную ${v} и загрузить ${NEXT.v}.</span><div class="row"><button type="button" class="btn" data-act="swapNewer">Удалить ${v} и загрузить ${NEXT.v}</button></div>`):''),
      btns:[{t:'Позже',act:close},{t:pg?'Установить сейчас':'Перезапустить сервер и установить',pri:1,act:()=>startRestart('install')}]};
  },
  // откат на версию, сохранённую перед прошлым обновлением
  rb(){ const r=S.log[0];
    return {t:'Восстановить прошлую версию',
      body:sh('warn',`Восстановить версию ${r.from}?`,`Сейчас установлена ${r.to}.`)
        +`<ol class="recs"><li>Сервер перезапустится и будет недоступен около 5 минут.</li><li>Настройки восстановятся из бэкапа от ${r.t}.</li><li>Изменения настроек после этой даты пропадут. Архив сохранится.</li></ol>`,
      btns:[{t:'Отмена',act:close},{t:'Восстановить',pri:1,act:()=>startRestart('rollback')}]};
  },

  changes(st){
    const T='Список изменений';
    if(st==='offline') return {t:T,
      body:sh('warn','Список изменений недоступен без интернета',`Он загружается с сервера обновлений, а ${SRV} сейчас не подключён к сети.`)
        +`<p>Посмотрите изменения на сайте: ${site()}</p>`,
      btns:[{t:'Закрыть',pri:1,act:close}]};
    if(st==='unchecked') return {t:T,
      body:sh('info','Автоматический поиск обновлений выключен','Список изменений приходит с сервера обновлений. Включите поиск — покажем, что изменилось. Настройка — в разделе «Сеть».'),
      btns:[{t:'Закрыть',act:close},{t:'Включить',pri:1,act:()=>{ setAuto(true); open('changes','list'); }}]};
    let idx=ALL_VERS.indexOf(S.cur); if(idx<0) idx=VERS.length-1;
    const shown = ALL_VERS.slice(0, idx+1+S.moreCh), rest = ALL_VERS.length - shown.length;
    return {t:T, wide:1,
      body:verList(shown)+(rest>0?`<div>${lnk('more','Показать более ранние версии')}</div>`:''),
      btns:[...(netState()==='avail'&&S.ui!=='page'?[{t:`Обновить до ${LATEST}`,act:()=>openNet()}]:[]),{t:closeLbl(),pri:1,act:close}]};
  },

  // что изменилось в доступном обновлении — все версии новее установленной
  whatsnew(){ const vs=ALL_VERS.filter(v=>newer(v,S.cur)), can=netState()==='avail'||netState()==='old';
    return {t:vs.length>1?'Что изменилось':`Что изменилось в ${LATEST}`, wide:1, body:verList(vs),
      btns:[{t:'Закрыть',act:close},...(can?[{t:'Загрузить',pri:1,act:()=>{ close(); ACT.upDl(); }}]:[])]};
  },

  // журнал: весь список сразу; откат и «Сохранить для техподдержки» по решению продукта убраны
  log(){
    return {t:'Журнал обновлений', wide:1,
      body:`<table class="ulog"><thead><tr><th>Дата и время</th><th>Действие</th><th>Версия</th><th>Результат</th><th>Пользователь</th></tr></thead><tbody>
        ${S.log.map(r=>`<tr><td class="v">${r.t}</td><td>${r.a}</td><td class="v">${r.from?`${r.from} → ${r.to}`:r.to}</td>
          <td><span class="res">${r.ok?ICON.ok:ICON.err}<span>${r.ok?'Успешно':'Ошибка'}${r.why?hint(r.why):''}${r.ok&&r.bk===false&&r.a!=='Установка'?'<span class="why">Без бэкапа</span>':''}</span></span></td>
          <td>${r.who}</td></tr>`).join('')}
        </tbody></table>`,
      btns:[{t:closeLbl(),pri:1,act:close}]};
  }
};

/* ================= отрисовка окон ================= */
function open(key,st){ S.back=[]; S.exp={}; keepPos(key); CUR={key,st}; closeMenu(); draw(); }
function openSub(key,st){ if(CUR) S.back.push(CUR); keepPos(key); CUR={key,st}; closeMenu(); draw(); }
function close(){ if(S.back.length){ CUR=S.back.pop(); draw(); return; } CUR=null; resetGeom(DW); draw(); }
function keepPos(key){ if(CUR&&CUR.key!==key){ DW.sized=false; DW.max=false; } }
const closeLbl = () => S.back.length ? 'Назад' : 'Закрыть';
function draw(){
  hideTip();
  const bg=$('dlgBg');
  if(!CUR){ bg.classList.remove('show'); bg.innerHTML=''; renderPage(); return; }
  const w=WIN[CUR.key](CUR.st);
  ONX = w.x || close; BTNS = w.btns;
  bg.innerHTML=`<div class="uw${w.wide?' wide':''}" role="dialog" aria-modal="true" aria-labelledby="uwT">
    <div class="tbar"><div class="ttl" id="uwT">${w.t}</div><div class="wctl"><button class="wbtn close" type="button" data-x aria-label="Закрыть">${XSVG}</button></div></div>
    <div class="uw-b">${w.body}</div>
    <div class="uw-f"><div class="l">${w.left||''}</div>${w.btns.map((b,i)=>`<button type="button" class="nbtn" data-b="${i}"${b.dis?' disabled':''}>${b.t}</button>`).join('')}</div></div>`; // кнопки окон — стандартные, без синих акцентных
  bg.classList.add('show');
  makeWin(bg.querySelector('.uw'), DW, DLG_MIN);
  renderPage();
}

/* ================= окно настроек: дерево и страница ================= */
const CHEV_O='<img src="__ASSET:chev-open__" width="14" height="14" alt="">', CHEV_C='<img src="__ASSET:chev-closed__" width="14" height="14" alt="">';
// отметка у «vms» в дереве — чтобы ход обновления был виден из любого раздела
function vmsMark(){
  if(S.ui==='page') return ''; // в варианте «страница» — красные бейджи на «Настройках сервера» и «Обновлении ПО»
  const st=netState();
  if(st==='busy') return `<span class="vmk busy" data-tip="Сервер перезапускается для установки обновления">${SPIN}обновляется</span>`;
  if(st==='dl'){ const p=Math.floor(S.dl.done/S.dl.total*100);
    if(S.dl.state==='stopped') return `<span class="vmk" data-tip="Загрузка остановлена">${GIFT}</span>`;
    if(S.dl.state==='paused') return `<span class="vmk" data-tip="Загрузка на паузе — нет связи">${GIFT}пауза</span>`;
    if(S.dl.state==='fail') return `<span class="vmk err" data-tip="Загрузка обновления не удалась">${GIFT}</span>`;
    return `<span class="vmk run" data-tip="${S.dl.src==='net'?'Загружаем':'Передаём на сервер'} ${S.dl.target}">↓ ${p}%</span>`; }
  if(st==='ready') return `<span class="vmk" data-tip="${S.ready.target} загружено — можно устанавливать">${GIFT}</span>`;
  if(st==='avail'||st==='old'||st==='space') return `<span class="vmk" data-tip="Доступно обновление до ${LATEST}">${GIFT}</span>`;
  return '';
}
function renderTree(){
  $('tree').innerHTML = TREE.filter(n=>!n.page||S.ui==='page').map(n=>{
    const pad = [6,26,46][n.lvl];
    const cs = n.open?CHEV_O : n.closed?CHEV_C : '';
    const ic = n.icon?`<img class="ic" src="${TICON[n.icon]}" width="26" height="26" alt="">`:'';
    return `<button type="button" class="ti ${n.big?'big':'sm'}${n.bold?' bold':''}${S.sel===n.id?' on':''}" data-node="${n.id}" style="padding-left:${pad}px"><span class="cs">${cs}</span>${ic}<span class="tl">${n.t}</span>${n.id==='vms'?vmsMark():S.ui==='page'?pageMark(n.id):''}</button>`;
  }).join('');
}
function pathOf(id){
  const n=TREE.find(x=>x.id===id); if(!n||id==='vms') return 'vms';
  if(n.lvl===2) return (TREE.indexOf(n)>TREE.findIndex(x=>x.id==='lic')?'vms/Лицензия/':'vms/Настройки сервера/')+n.t;
  return 'vms/'+n.t;
}
function updBtnHtml(){
  if(S.ui==='page') return `<button type="button" class="nbtn uupd" id="updBtn" title="Открыть «Обновление ПО»">Обновление ПО</button>`; // без бейджа: такого паттерна у кнопок нет
  const st=netState(); let attn=false, title='';
  if(st==='dl'){ if(S.dl.state!=='run'){ attn=true; title=S.dl.state==='stopped'?'Загрузка остановлена':S.dl.state==='paused'?'Загрузка на паузе — нет связи':'Загрузка обновления не удалась'; } else title=`Загружаем ${S.dl.target} в фоне`; }
  else if(st==='ready'){ attn=true; title=`${S.ready.target} загружено и готово к установке`; }
  else if(st==='busy'){ title='Сервер перезапускается для установки обновления'; }
  else if(st==='avail'||st==='old'||st==='space'){ attn=true; title=`Доступно обновление до ${LATEST}`; }
  // подсветки нет — только подарочек, пока есть что загрузить или установить
  const gift = attn && (st==='avail'||st==='old'||st==='space'||st==='ready'||(st==='dl'&&S.dl.state==='stopped'));
  const open = $('menu') && !$('menu').hidden;
  return `<button type="button" class="nbtn uupd" id="updBtn" aria-haspopup="menu" aria-expanded="${open}" title="${esc(title)}"${st==='busy'?' disabled':''}>${gift?GIFT:attn?WARN_IMG:''}Обновление ПО</button>`;
}
// фоновая строка: загрузка, передача файла, установка и итог — вместо отдельных окон
function bgpHtml(){
  if(S.ui==='page') return ''; // всё про обновление — на странице «Обновление ПО»
  const row = (k,ic,text,meta,acts,bar,spin) => `<div class="bgp ${k}" id="bgp"><span class="bi${spin?' spin':''}">${ic}</span><span class="bt">${text}${meta?` <span class="bm">· ${meta}</span>`:''}</span><span class="ba">${acts||''}</span>${bar||''}</div>`;
  const pbar = (pct,k) => `<div class="pbar ${k||''}"><i style="width:${pct}%"></i></div>`;
  if(S.busy){ const b=S.busy, steps=restartSteps();
    const step = steps[Math.min(b.step, steps.length-1)].t;
    return row('', BI.spin, `<b>Устанавливаем ${b.to}</b>`, `${step} · сервер недоступен около 5 минут`, '', '', true); }
  if(S.dl){ const d=S.dl, pct=Math.floor(d.done/d.total*100), what=d.src==='net'?'Загружаем':'Передаём на сервер';
    // остановили сами: можно продолжить с того же места или удалить загруженное
    if(d.state==='stopped') return row('', BI.pause, '<b>Загрузка остановлена</b>', `загружено ${mb(d.done)} из ${mb(d.total)}`, `${bAct('resume','Продолжить')}${bAct('delDl','Удалить загруженное')}`, pbar(pct,'paused'));
    if(d.state==='paused') return row('warn', BI.pause, '<b>Связь прервалась</b> — продолжим, когда она вернётся', `${mb(d.done)} из ${mb(d.total)}`, `${lnk('resume','Повторить сейчас')}${bAct('stopDl','Остановить')}`, pbar(pct,'paused'));
    if(d.state==='fail') return row('err', BI.err, '<b>Загрузка не удалась</b> — связь обрывалась слишком часто', `загруженное сохранено: ${mb(d.done)} из ${mb(d.total)}`, `${lnk('retry','Повторить')}${lnk('file','Обновить из файла')}${bAct('delDl','Удалить загруженное')}`, pbar(pct,'fail'));
    return row('', BI.dl, `<b>${what} ${d.target}</b>`, `${mb(d.done)} из ${mb(d.total)} · осталось ${left(d.total-d.done)}`, bAct('stopDl','Остановить'), pbar(pct)); }
  if(S.ready) return row('ok', BI.ok, `<b>${S.ready.target} загружено</b>`, S.newerOut&&newer(NEXT.v,S.ready.target)?`вышла версия новее — ${NEXT.v}`:'можно устанавливать', `${lnk('install','Перезапустить и установить')}${bAct('delReady','Удалить')}`);
  const n=S.note; if(!n) return '';
  const x = '<button type="button" class="x" data-act="dismiss" aria-label="Скрыть">×</button>';
  if(n.k==='ok'){
    return row('ok', BI.ok, `<b>Установлена версия ${S.cur}</b>`, 'сервер работает', `${lnk('changes','Что нового')}${x}`); }
  if(n.k==='fail') return row('err', BI.err, `<b>${S.failTo} не установилась</b> — сервер сам вернулся на ${S.cur}`, 'подробности в журнале', `${lnk('log','Журнал обновлений')}${x}`);
  return '';
}
function renderPage(){
  $('pTitle').textContent = `< Владелец лицензии: D1-pool > Настройки - Admin - ${pathOf(S.sel)}`;
  renderTree();
  if(S.sel==='net'){ $('page').innerHTML = netPage(); return; }
  if(S.sel==='upd'){ $('page').innerHTML = updPage(); return; }
  if(S.sel!=='vms'){
    const n=TREE.find(x=>x.id===S.sel);
    $('page').innerHTML = `<div class="pg-blank"><div><b>${n.t}</b><br>В прототипе этого раздела нет — он нужен, чтобы показать, что обновление идёт в фоне.${S.dl||S.busy?'<br>Ход обновления виден у «vms» в дереве.':''}</div></div>`;
    return;
  }
  const busy=!!S.busy, menuOpen=$('menu')&&!$('menu').hidden;
  const hl = busy ? [['Диски:','н/д','na'],['Камеры:','н/д','na'],['База данных:','н/д','na'],['Сеть:','н/д','na'],['Загрузка CPU:','н/д','na'],['Облако:','н/д','na']]
    : [['Диски:','OK','pos'],['Камеры:','50 / 50','pos'],['База данных:','OK','pos'],['Сеть:',S.net==='offline'?'нет сети':'OK',S.net==='offline'?'neg':'pos'],['Загрузка CPU:','1.0%','pos'],['Облако:','н/д','na']];
  $('page').innerHTML = `
    <div class="pg-top">
      <div class="pg-ver"><span>Версия ПО:</span><b>${busy?'—':S.cur}</b><span class="r">Сборка:</span><span>${busy?'—':S.build}</span></div>
      <div class="pg-acts">
        <div class="umenu-w">${updBtnHtml()}${S.ui==='page'?'':`<div class="umenu" id="menu" role="menu"${menuOpen?'':' hidden'}>${menuHtml()}</div>`}</div>
        <button type="button" class="nbtn"><img src="__ASSET:qube__" width="16" height="16" alt="">Журналы &amp; дампы падений...</button>
        <button type="button" class="nbtn">Перезагрузка</button>
      </div>
    </div>
    ${bgpHtml()}
    <div class="pg-cols">
      <div><p class="pg-h">Индикаторы здоровья</p><div class="pg-box hl">${hl.map(([l,v,k])=>`<span>${l}</span><b class="${k}">${v}</b>`).join('')}</div></div>
      <div><p class="pg-h">Настройки сервера</p><div class="pg-box prm">
        <span>Имя сервера:</span><span class="f">vms</span>
        <span>Язык:</span><span class="f sel">Русский</span>
        <span>Сохранять скриншоты в:</span><span class="f">D:\\TRASSIR\\Release\\shots</span>
      </div></div>
    </div>
    <div class="pg-bk"><button type="button" class="nbtn"><img src="__ASSET:arrow-down__" width="16" height="16" alt="">Сохранить бэкап</button><button type="button" class="nbtn"><img src="__ASSET:warning__" width="16" height="16" alt="">Восстановить бэкап</button></div>`;
}
function netPage(){
  const tbl = (row) => `<div class="ntbl"><div class="th"><span>Имя канала</span><span>Fps</span><span>Скорость</span><span>Принято</span></div>
    <div class="tr"><span class="ind">${row}</span><span>0.0 fps</span><span>0.0 kBps</span><span>0.0 Kb</span></div></div>`;
  return `<div class="netp">
    <p class="cap">Входящий трафик (Клиент):</p>${tbl('0 серверов, 0 каналов')}
    <p class="cap">Исходящий трафик (Сервер):</p>${tbl('0 клиентов, 0 каналов')}
    <fieldset class="gbox"><legend>Шифрование портов</legend>
      <p>Минимальная версия протокола шифрования для подключений.</p>
      <div class="gr"><span>Порт управления сервером <span class="mut">(3080)</span></span><span class="nsel">TLS 1.2</span></div>
      <div class="gr"><span>Порт подключения к облаку <span class="mut">(443)</span></span><span class="nsel">TLS 1.2</span></div>
      <p class="mut">После изменений для их применения рекомендуется перезагрузка.</p></fieldset>
    <div class="netupd">${ck('autoCheck','Автоматически искать обновления ПО','Сервер сам обращается к серверу обновлений TRASSIR и сообщает о новых версиях. Выключите, если правила безопасности запрещают такие подключения — тогда обновляйте из файла.')}</div>
    <div class="nmore">Дополнительные параметры</div>
  </div>`;
}
// во время загрузки обновляем только строку, отметку в дереве и чип в меню — не сбиваем наведение и фокус
function drawProgress(){
  const d=S.dl, pct=Math.floor(d.done/d.total*100);
  const b=$('bgp'); if(b&&S.sel==='vms'){ const i=b.querySelector('.pbar i'); if(i) i.style.width=pct+'%'; const m=b.querySelector('.bm'); if(m) m.textContent=`· ${mb(d.done)} из ${mb(d.total)} · осталось ${left(d.total-d.done)}`; }
  const ub=$('upbar'); if(ub){ ub.querySelector('i').style.width=pct+'%'; const um=$('upmeta'); if(um) um.textContent=`${mb(d.done)} из ${mb(d.total)} · осталось ${left(d.total-d.done)}`; }
  const mk=document.querySelector('.ti .vmk.run'); if(mk) mk.textContent=`↓ ${pct}%`; else renderTree();
  const c=document.querySelector('#menu .chip.run'); if(c) c.textContent=`Загрузка ${pct}%`;
}
function chipFor(st){
  if(st==='dl') return S.dl.state==='stopped'?'<span class="chip">Загрузка остановлена</span>':S.dl.state==='paused'?'<span class="chip w">Пауза — нет связи</span>':S.dl.state==='fail'?'<span class="chip w">Загрузка не удалась</span>':`<span class="chip run">Загрузка ${Math.floor(S.dl.done/S.dl.total*100)}%</span>`;
  if(st==='busy') return '<span class="chip run">Устанавливается</span>';
  if(st==='ready') return '<span class="chip ok">Готово к установке</span>';
  if(st==='avail'||st==='space'||st==='old') return `<span class="chip ok">Доступна ${LATEST}</span>`;
  if(st==='latest') return '<span class="chip">Последняя версия</span>';
  if(st==='offline') return '<span class="chip w">Нет доступа к сети</span>';
  if(st==='nohost') return '<span class="chip w">Сервер обновлений недоступен</span>';
  if(st==='unchecked') return '<span class="chip">Автопоиск выключен</span>';
  if(st==='checking') return '<span class="chip">Проверяем…</span>';
  return '';
}
function menuHtml(){
  const st=netState(), lock=st==='dl'||st==='busy';
  return `<button type="button" class="mi" role="menuitem" data-m="net"${lock?' disabled':''}>Обновление по сети${chipFor(st)}</button>
    <button type="button" class="mi" role="menuitem" data-m="file"${lock?' disabled':''}>Обновление из файла…</button>
    <div class="sep"></div>
    <button type="button" class="mi" role="menuitem" data-m="changes">Список изменений</button>
    <button type="button" class="mi" role="menuitem" data-m="log">Журнал обновлений</button>`;
}
function toggleMenu(){ const m=$('menu'); if(!m) return; m.hidden=!m.hidden; $('updBtn').setAttribute('aria-expanded',String(!m.hidden)); }
function closeMenu(){ const m=$('menu'); if(m&&!m.hidden){ m.hidden=true; $('updBtn')?.setAttribute('aria-expanded','false'); } }

/* ================= страница «Обновление ПО» в «Настройках сервера» — вместо модальных окон (просьба А. Воронцова) =================
   Порядок, как в «Центре обновления Windows»: статус и одна главная кнопка → параметры → из файла → история. Одна колонка, строки одной высоты. */
// бейдж-уведомление: красный, как остальные счётчики в дереве; подарочков нет
const BADGE = '<span class="nbadge" aria-label="Есть уведомление">1</span>';
function pageAttn(){ const st=netState();
  return (S.notify&&(st==='avail'||st==='old'||st==='space'))||st==='ready'||(st==='dl'&&S.dl.state!=='run'); }
function pageMark(id){
  const st=netState();
  if(id==='upd'){
    if(st==='busy') return `<span class="vmk busy" data-tip="Сервер перезапускается">${SPIN}</span>`;
    if(st==='dl'&&S.dl.state==='run') return `<span class="vmk run" data-tip="Загружаем ${S.dl.target}">↓ ${Math.floor(S.dl.done/S.dl.total*100)}%</span>`;
  }
  return (id==='upd'||id==='srvset') && pageAttn() ? BADGE : '';
}
// QR-код на страницу загрузок — условный рисунок для прототипа (настоящий сгенерирует разработка)
function qrSvg(txt, px=64){
  const n=25, cell=px/n; let h=2166136261; for(const ch of txt){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619); }
  const rnd=()=>{ h^=h<<13; h^=h>>>17; h^=h<<5; return (h>>>0)/4294967296; };
  const finder=(x,y)=>`<rect x="${x*cell}" y="${y*cell}" width="${7*cell}" height="${7*cell}" fill="#1c1c1c"/><rect x="${(x+1)*cell}" y="${(y+1)*cell}" width="${5*cell}" height="${5*cell}" fill="#fff"/><rect x="${(x+2)*cell}" y="${(y+2)*cell}" width="${3*cell}" height="${3*cell}" fill="#1c1c1c"/>`;
  const inF=(x,y)=>(x<8&&y<8)||(x>=n-8&&y<8)||(x<8&&y>=n-8);
  let r=''; for(let y=0;y<n;y++) for(let x=0;x<n;x++){ if(inF(x,y)) continue; if(rnd()<.47) r+=`<rect x="${(x*cell).toFixed(2)}" y="${(y*cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}"/>`; }
  return `<svg class="qr" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}" role="img" aria-label="QR-код страницы загрузок"><rect width="${px}" height="${px}" fill="#fff"/><g fill="#1c1c1c">${r}</g>${finder(0,0)}${finder(n-7,0)}${finder(0,n-7)}</svg>`;
}
const upBtn = (act,t,pri,dis) => `<button type="button" class="nbtn" data-act="${act}"${dis?' disabled':''}>${t}</button>`;
const SPIN_IC = `<span class="u2-spin">${ICON.spin}</span>`;
const pbar = (k,pct) => `<div class="pbar ${k||''}" id="upbar"><i style="width:${pct}%"></i></div>`;
const stat = (ic,title,meta,act='') => `<div class="u2-stat">${ic?`<span class="u2-ic">${ic}</span>`:''}<div class="u2-t"><b>${title}</b>${meta?`<span>${meta}</span>`:''}</div>${act}</div>`;
const radio = (id,on,dis) => `<button type="button" class="u2-rd" role="radio" aria-checked="${on}" data-src="${id}"${dis?' disabled':''} aria-label="${id==='net'?'По сети':'Из файла'}"></button>`;
// «По сети» и «Из файла» — один блок с переключателем: выбранный вариант раскрыт, в нём же идёт загрузка; внизу одна общая кнопка, главное действие справа
function upSource(){
  const st=netState(), n=S.note, lock=!!(S.dl||S.ready);
  const active = S.dl ? S.dl.src : S.ready ? (S.ready.src||'net') : S.src;
  const L=[], R=[], sta=(i,t,m)=>stat(i,t,m,'%ACT%'); // кнопки встают в строку статуса, к которому относятся
  let netBody='', fileBody='';
  // идёт загрузка или файл загружен — всё внутри варианта, откуда он пришёл
  let lockBody='';
  if(S.dl){ const d=S.dl, pct=Math.floor(d.done/d.total*100), got=`${mb(d.done)} из ${mb(d.total)}`, what=d.src==='net'?'Загружаем':'Передаём на сервер';
    if(d.state==='stopped'){ lockBody=sta('',`Загрузка ${d.target} остановлена`,`Загружено ${got}`)+pbar('paused',pct); L.push(lnk('delDl','Отменить')); R.push(upBtn('resume','Продолжить')); }
    else if(d.state==='paused'){ lockBody=sta(ICON.warn,'Связь прервалась',`Продолжим, когда она вернётся · ${got}`)+pbar('paused',pct); L.push(lnk('delDl','Отменить')); R.push(upBtn('resume','Повторить')); }
    else if(d.state==='fail'){ lockBody=sta(ICON.err,'Загрузка не удалась',`Связь обрывалась слишком часто · загружено ${got}`)+pbar('fail',pct); L.push(lnk('delDl','Отменить')); R.push(upBtn('retry','Повторить')); }
    else { lockBody=sta('',`${what} ${d.target}`,`<span id="upmeta">${got} · осталось ${left(d.total-d.done)}</span>`)+pbar('',pct); L.push(lnk('delDl','Отменить')); R.push(upBtn('stopDl','Остановить')); }
  } else if(S.ready){ const v=S.ready.target, nx=S.newerOut&&newer(NEXT.v,v);
    lockBody=sta(ICON.ok,`${v} загружено`,'Сервер перезапустится и будет недоступен около 5 минут')
      +(nx?`<p class="u2-note">Вышла версия ${NEXT.v} · ${lnk('swapNewer',`загрузить её вместо ${v}`)}</p>`:'');
    L.push(lnk('delReady','Удалить обновление')); R.push(upBtn('installNow','Установить сейчас'));
  }
  // по сети: короткая сводка в строке варианта и подробности, когда он выбран
  const prev = n&&n.k==='fail' ? `<p class="u2-note err">Прошлая попытка: ${S.failTo} не установилась, сервер вернулся на ${S.cur}</p>` : n&&n.k==='rolled' ? `<p class="u2-note">Восстановлена версия ${S.cur} из бэкапа от ${S.rbFrom}</p>` : '';
  let netSum='', netBad=false, canNet=false;
  if(st==='checking'){ netSum='Проверяем…'; netBody=sta(SPIN_IC,'Проверяем обновления…',''); }
  else if(st==='unchecked'){ netSum='Автопоиск выключен'; netBody=sta('','Автоматический поиск выключен','Включите его в параметрах или проверьте вручную'); }
  else if(st==='offline'){ netSum='Нет доступа к сети'; netBad=true; netBody=sta(ICON.err,'Нет доступа к сети','Проверьте подключение в «Сетевые интерфейсы» или обновите из файла'); }
  else if(st==='nohost'){ netSum='Сервер обновлений недоступен'; netBad=true; netBody=sta(ICON.err,'Сервер обновлений недоступен','Укажите шлюз и DNS в «Сетевые интерфейсы», например 77.88.8.8'); }
  else if(st==='latest'){ netSum='Последняя версия'; netBody=prev+sta(ICON.ok, n&&n.k==='ok'?`Установлена версия ${S.cur}`:'Установлена последняя версия','Проверено сегодня в 14:32'); }
  else if(st==='old'){ const ch=chainFrom(S.cur); canNet=true; netSum=`Доступна ${LATEST} в ${ch.length} шага`;
    netBody=prev+sta('',`Доступно обновление ${LATEST} в ${ch.length} шага`,`Сначала ${ch[0]} · ${mb(SIZE)}`); }
  else if(st==='avail'||st==='space'){ canNet=st==='avail'; netSum=`Доступна ${LATEST} · ${mb(SIZE)}`;
    netBody=prev+sta('',`Доступно обновление ${LATEST}`,`${CH[LATEST].d} · ${mb(SIZE)} · проверено в 14:32`)
      +(st==='space'?`<p class="u2-note err">Не хватает места на системном диске: нужно 2,6 ГБ, свободно 1,1 ГБ · ${lnk('toArchiveP','загружать на архивный диск')}</p>`:''); }
  if(S.dl&&S.dl.src==='net'||S.ready&&(S.ready.src||'net')==='net') netSum = S.dl?'Загрузка':'Загружено';
  // из файла: ссылка на скачивание (QR и адрес текстом), «Выбрать файл…» — сразу «Обзор», без автопоиска
  const f=S.pfile, canFile=!!(f&&!f.err);
  const fileSum = S.dl&&S.dl.src==='file' ? 'Передача' : S.ready&&S.ready.src==='file' ? 'Загружено' : f ? (f.err?'Файл не подходит':esc(f.n)) : ''; // ничего не выбрано — справа пусто
  // файл выбран — ссылка и QR уже не нужны, на их месте строка файла
  fileBody = !f ? `<div class="u2-dl">${qrSvg(SITE_TXT)}<div class="u2-t"><b>Ссылка на скачивание</b><span class="u2-url">${SITE_TXT}</span></div>%ACT%</div>`
    : f.err ? sta(ICON.err,esc(f.n),`${f.err}. ${f.kind==='format'?'Нужен файл .pack':PICK_RECS[f.kind][0]}`)
    : sta(ICON.ok,esc(f.n),`Подходит · ${S.cur} → ${f.v} · ${mb(f.mb)}`);
  // кнопки выбранного варианта, когда ничего не загружается
  if(!lock){
    // одна главная кнопка на месте — справа внизу выбранного варианта; меняется только надпись, неактивных кнопок нет
    // «Что изменилось» — кнопкой рядом с «Загрузить», подробности в отдельном окне
    if(S.src==='net'){ if(st==='avail'||st==='old'||st==='space'){ L.push(upBtn('whatsNew','Что изменилось')); R.push(upBtn('upDl','Загрузить',0,!canNet)); }
      else if(st!=='checking') R.push(upBtn('checkNowP',st==='unchecked'?'Проверить сейчас':'Проверить снова')); }
    // выбранный файл можно отменить — вернёмся к ссылке на скачивание и QR-коду
    else if(canFile){ L.push(lnk('clrFile','Отменить')); R.push(upBtn('upFile','Загрузить')); }
    else if(f){ L.push(lnk('clrFile','Отменить')); R.push(upBtn('browseP','Выбрать другой файл…')); }
    else R.push(upBtn('browseP','Выбрать файл…'));
  }
  const opt = (id,title,sum,bad,body) => { const on = (lock?active:S.src)===id;
    return `<div class="u2-opt${on?' on':''}${lock&&!on?' dim':''}"><label class="u2-oh">${radio(id,on,lock)}<b>${title}</b>${on||!sum?'':`<span class="u2-sum${bad?' err':''}">${sum}</span>`}</label>${on?`<div class="u2-ob">${(lock?lockBody:body).replace('%ACT%',acts).replaceAll('%ACT%','')}</div>`:''}</div>`; };
  const acts = L.length||R.length ? `<div class="u2-act">${L.join('')}${R.join('')}</div>` : '';
  return `<div class="u2-list u2-src">
    ${opt('net','По сети',netSum,netBad,netBody)}
    ${opt('file','Из файла',fileSum,!!(f&&f.err),fileBody)}
  </div>`;
}
// установка и возврат версии — отдельным статусом вместо блока выбора
// что стоит сейчас — две подписи над блоком
const upCur = () => { const busy=!!S.busy;
  return `<div class="u2-cur"><span>Версия ПО: <b>${busy?'—':S.cur}</b></span><span>Сборка: ${busy?'—':S.build}</span></div>`; };
function upBusy(){ const b=S.busy, steps=restartSteps(), cur=Math.min(b.step,steps.length-1);
  return `<div class="u2-list u2-src"><div class="u2-ob solo">${stat(SPIN_IC, b.kind==='rollback'?`Восстанавливаем версию ${b.to}`:`Устанавливаем ${b.to}`, `Шаг ${cur+1} из ${steps.length}: ${steps[cur].t.toLowerCase()} · сервер недоступен около 5 минут`)}${pbar('',Math.round((cur+1)/steps.length*100))}</div></div>`; }
// параметр: подпись с подсказкой слева, галочка справа
const opt = (key,label,tip) => `<label class="u2-row"><span>${label}${tip?hint(tip):''}</span><button type="button" class="cb" role="checkbox" aria-checked="${!!S[key]}" data-ck="${key}">${ICON.check}</button></label>`;
function upParams(){
  return `<p class="u2-h">Параметры</p><div class="u2-list">
    ${opt('autoCheck','Автоматически искать обновления','Сервер сам проверяет, вышла ли новая версия')}
    ${opt('notify','Уведомлять о новых версиях','Красная отметка в настройках, когда вышла новая версия')}
    ${opt('backup','Сохранять бэкап перед установкой','Сохраним настройки, чтобы при сбое вернуть прошлую версию')}
    ${opt('restartNow','Устанавливать сразу после загрузки','Сервер перезапустится сам, примерно на 5 минут')}
  </div>`;
}
// внизу — кнопки, каждая открывает своё окно
function upHistory(){
  const last=S.log[0], canRb = last && last.ok && last.bk && last.a==='Обновление' && !S.busy;
  return `<div class="u2-btns">${upBtn('changes','Список изменений')}${upBtn('log','Журнал обновлений')}${canRb?upBtn('rbAsk','Восстановить прошлую версию'):''}</div>`;
}
function updPage(){
  const busy=!!S.busy;
  return `<div class="up2">
    ${upCur()}${busy?upBusy():upSource()}${upParams()}${upHistory()}</div>`;
}
function checkNowP(){ S.checked=true; S.checking=true; renderPage(); clearTimeout(tChk); tChk=setTimeout(()=>{ S.checking=false; renderPage(); },1100); }

/* ================= сценарий ================= */
function check(){ S.checking=true; S.checked=true; open('net','checking'); clearTimeout(tChk);
  tChk=setTimeout(()=>{ S.checking=false; if(CUR&&CUR.key==='net') open('net',netState()); else renderPage(); },1100); }
// автопоиск обновлений: настройка раздела «Сеть». Включили — проверяем сразу; выключили — подарочка нет
function setAuto(on){ S.autoCheck=on; S.checked=on; S.checking=false; }
function enableAuto(){ S.autoCheck=true; check(); }
// из файла: поиск запускается сам, «Обзор…» доступен сразу
function openFile(){ open('file','search'); startFind(); }
function startFind(){ clearTimeout(tFind); S.extra=[]; S.fileSel=0; if(CUR&&CUR.key==='file'){ CUR.st='search'; draw(); }
  tFind=setTimeout(()=>{ if(CUR&&CUR.key==='file'&&CUR.st==='search'){ CUR.st=S.files; draw(); } },1600); }

function startDl(src,target,total){
  clearTimeout(tFind); S.note=null; S.dl={src,target,total,done:0,state:'run',failed:false};
  S.back=[]; close(); tickDl();
}
function tickDl(){
  clearTimeout(tDl); const d=S.dl; if(!d||d.state!=='run'||d.frozen) return;
  tDl=setTimeout(()=>{
    if(!S.dl||S.dl.state!=='run') return;
    d.done=Math.min(d.total, d.done + d.total/70);
    if(S.dlOut==='fail' && !d.failed && d.done>=d.total*0.6){ d.done=d.total*0.6; d.state='fail'; renderPage(); return; }
    if(d.done>=d.total){ finishDl(); return; }
    drawProgress(); tickDl();
  },200);
}
function finishDl(){
  const d=S.dl; S.dl=null; S.ready={target:d.target, src:d.src};
  if(S.restartNow) return startRestart('install');  // галочка стояла — всё само, без окон
  if(!CUR) open('ready'); else renderPage();          // иначе — одно окно «Перезапустить и установить»
}
// остановить загрузку — загруженное остаётся; удалить — чистим и возвращаемся к «доступно обновление»
function stopDl(){ clearTimeout(tDl); if(S.dl){ S.dl.state='stopped'; S.dl.frozen=false; } renderPage(); }
function delDl(){ clearTimeout(tDl); S.dl=null; S.note=null; renderPage(); }
function dropConn(){ if(!S.dl||S.dl.state!=='run') return; clearTimeout(tDl); S.dl.state='paused'; renderPage(); }

function restartSteps(){
  const b=S.busy;
  if(b.kind==='rollback') return [{t:'Останавливаем сервер'},{t:`Возвращаем ${b.to}`},{t:'Восстанавливаем настройки из бэкапа'},{t:'Запускаем сервер'}];
  const s=[]; if(S.backup) s.push({t:'Сохраняем бэкап настроек'});
  s.push({t:`Ставим ${b.to}`},{t:'Перезапускаем сервер'});
  s.push({t:b.fail?'Сервер не запустился — возвращаем прошлую версию':'Проверяем камеры и архив'});
  return s;
}
function startRestart(kind){
  clearTimeout(tRs); S.note=null;
  if(kind==='rollback'){ const r=S.log[0]; S.busy={kind, from:r.to, to:r.from, bkt:r.t, step:0}; }
  else { const to=S.ready.target; S.ready=null; S.busy={kind, from:S.cur, to, step:0, fail:S.outcome==='fail'}; }
  CUR=null; S.back=[]; if(S.ui!=='page') S.sel='vms'; draw(); tickRs();
}
function tickRs(){
  tRs=setTimeout(()=>{
    const b=S.busy; if(!b||b.frozen) return; b.step++;
    if(b.step>=restartSteps().length){ finishRs(); return; }
    renderPage(); tickRs();
  },1400);
}
function finishRs(){
  const b=S.busy; S.busy=null; const now='10.11.2026 '+new Date().toTimeString().slice(0,5);
  if(b.kind==='rollback'){ S.cur=b.to; S.rbFrom=b.bkt; S.build=CH[S.cur]?.b||S.build; S.log.unshift({t:now,a:'Возврат',from:b.from,to:b.to,ok:true,who:'admin',bk:false}); S.note={k:'rolled'}; }
  else if(b.fail){ S.failTo=b.to; S.log.unshift({t:now,a:'Обновление',from:b.from,to:b.to,ok:false,who:'admin',why:`Ошибка установки пакета (код 0x2F). Сервер автоматически вернулся на ${b.from}`}); S.note={k:'fail'}; }
  else { S.cur=b.to; S.build=CH[S.cur]?.b||(S.cur===NEXT.v?NEXT.b:'1291377'); S.log.unshift({t:now,a:'Обновление',from:b.from,to:b.to,ok:true,who:'admin',bk:S.backup}); S.note={k:'ok'}; }
  renderPage();
}

/* ================= события ================= */
const openChanges = () => open('changes', !S.checked?'unchecked' : (S.net==='offline'||S.net==='nohost')?'offline':'list');
const ACT = {
  changes:openChanges,
  log:()=>CUR?openSub('log','table'):open('log','table'),
  file:()=>{ clearTimeout(tDl); S.dl=null; openFile(); },
  net:()=>openNet(),
  more:()=>{ S.moreCh+=5; draw(); }, noop:()=>{}, // можно жать сколько угодно раз
  browse:()=>{ clearTimeout(tFind); const p=PICKS[S.pickN%PICKS.length]; S.pickN++; S.extra=[p]; S.fileSel=0; CUR.st='found'; draw(); },
  refind:()=>startFind(),
  exp:a=>{ S.exp[a.dataset.k]=!S.exp[a.dataset.k]; draw(); },
  toArchive:()=>{ S.net='avail'; $('sNet').value='avail'; open('net','avail'); },
  stopDl:()=>stopDl(), delDl:()=>delDl(),
  resume:()=>{ S.dl.state='run'; S.dl.frozen=false; renderPage(); tickDl(); },
  retry:()=>{ S.dl.state='run'; S.dl.failed=true; S.dl.frozen=false; renderPage(); tickDl(); },
  install:()=>open('ready'),
  // удалить загруженное: место освобождается, обновление снова «доступно»
  delReady:()=>{ S.ready=null; S.note=null; CUR=null; S.back=[]; draw(); },
  swapNewer:()=>{ S.ready=null; startDl('net',NEXT.v,SIZE); },
  dismiss:()=>{ S.note=null; renderPage(); },
  // страница «Обновление ПО»
  goUpd:()=>{ S.sel='upd'; renderPage(); },
  // при выборе «Из файла» сразу предлагаем файл, если его ещё нет — как при нажатии «Выбрать файл…»
  whatsNew:()=>open('whatsnew'),
  upDl:()=>{ const ch=netState()==='old'?chainFrom(S.cur)[0]:LATEST; startDl('net',ch,SIZE); },
  clrFile:()=>{ S.pfile=null; renderPage(); },
  browseP:()=>{ const p=PICKS[S.pickN%PICKS.length]; S.pickN++; S.pfile=p; renderPage(); }, // «Обзор»: первым — подходящий файл, дальше ошибки
  upFile:()=>{ const f=S.pfile; S.pfile=null; startDl('file',f.v,f.mb); },
  checkNowP:()=>checkNowP(),
  installNow:()=>startRestart('install'),
  upTog:a=>{ S.upOpen[a.dataset.k]=!S.upOpen[a.dataset.k]; renderPage(); },
  rbAsk:()=>open('rb'),
  toArchiveP:()=>{ S.net='avail'; $('sNet').value='avail'; renderPage(); }
};
$('tree').addEventListener('click',e=>{ const b=e.target.closest('[data-node]'); if(!b) return; closeMenu(); S.sel=b.dataset.node; renderPage(); });
$('page').addEventListener('click',e=>{
  const t=e.target;
  if(t.closest('.hi')){ e.preventDefault(); return; } // ⓘ внутри строки не переключает галочку
  if(t.closest('#updBtn')){ e.stopPropagation(); if(S.ui==='page') ACT.goUpd(); else toggleMenu(); return; }
  const m=t.closest('[data-m]'); if(m){ if(m.disabled) return; closeMenu();
    ({net:openNet, file:openFile, changes:openChanges, log:()=>open('log','table')})[m.dataset.m](); return; }
  const sr=t.closest('[data-src]'); if(sr){ e.preventDefault(); if(!sr.disabled){ S.src=sr.dataset.src; renderPage(); } return; }
  const c=t.closest('[data-ck]'); if(c){ e.preventDefault(); if(c.dataset.ck==='autoCheck') setAuto(!S.autoCheck); else S[c.dataset.ck]=!S[c.dataset.ck]; renderPage(); return; }
  const a=t.closest('[data-act]'); if(a&&ACT[a.dataset.act]){ e.preventDefault(); ACT[a.dataset.act](a); }
});
document.addEventListener('click',e=>{ if(!e.target.closest('.umenu-w')) closeMenu(); });
$('dlgBg').addEventListener('click',e=>{
  const t=e.target;
  if(t.closest('.hi')){ e.preventDefault(); return; }
  const b=t.closest('[data-b]'); if(b&&!b.disabled){ BTNS[+b.dataset.b].act(); return; }
  if(t.closest('[data-x]')){ ONX(); return; }
  const c=t.closest('[data-ck]'); if(c){ S[c.dataset.ck]=!S[c.dataset.ck]; e.preventDefault(); draw(); return; }
  const f=t.closest('[data-fsel]'); if(f){ S.fileSel=+f.dataset.fsel; draw(); return; }
  const a=t.closest('[data-act]'); if(a&&ACT[a.dataset.act]){ e.preventDefault(); ACT[a.dataset.act](a); }
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){ const m=$('menu'); if(m&&!m.hidden) closeMenu(); else if(CUR) ONX(); }
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('a.lnk[data-act]')){ e.preventDefault(); e.target.click(); }
});

/* ---------- перемещение и изменение размера окон ---------- */
const PW={}, DW={}, PW_MIN={w:820,h:520}, DLG_MIN={w:420,h:200};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function resetGeom(g){ Object.keys(g).forEach(k=>delete g[k]); }
function applyGeom(el,g){
  const st=el.style; el.classList.toggle('wmax',!!g.max);
  if(g.max){ Object.assign(st,{position:'absolute',left:'0px',top:'0px',width:'100%',height:'100%',transform:'none',maxHeight:'none'}); return; }
  if(!g.custom){ ['position','left','top','width','height','transform','maxHeight'].forEach(k=>st[k]=''); return; }
  Object.assign(st,{position:'absolute',left:g.x+'px',top:g.y+'px',transform:'none',
    width:g.sized?g.w+'px':'', height:g.sized?g.h+'px':'', maxHeight:g.sized?'none':''});
}
function takeGeom(el,g,sized){
  const c=el.parentElement.getBoundingClientRect(), r=el.getBoundingClientRect();
  if(!g.custom){ g.custom=true; g.x=r.left-c.left; g.y=r.top-c.top; }
  if(sized&&!g.sized){ g.sized=true; g.w=r.width; g.h=r.height; }
}
function track(e,onMove){
  const x0=e.clientX, y0=e.clientY, el=e.currentTarget, c=el.closest('.swin,.uw').parentElement.getBoundingClientRect();
  try{ el.setPointerCapture(e.pointerId); }catch(_){}
  document.body.classList.add('is-dragging');
  const mv=ev=>onMove(ev.clientX-x0, ev.clientY-y0, c);
  const up=()=>{ document.body.classList.remove('is-dragging'); el.removeEventListener('pointermove',mv); el.removeEventListener('pointerup',up); el.removeEventListener('pointercancel',up); };
  el.addEventListener('pointermove',mv); el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up);
  e.preventDefault();
}
function toggleMax(el,g){ if(g.max) g.max=false; else { takeGeom(el,g,false); g.max=true; } applyGeom(el,g); }
function makeWin(el,g,min){
  if(!el.querySelector(':scope>.rh')) ['n','s','e','w','ne','nw','se','sw'].forEach(d=>{ const h=document.createElement('div'); h.className='rh '+d; h.dataset.rh=d; el.appendChild(h); });
  applyGeom(el,g);
  const tb=el.querySelector(':scope>.tbar');
  tb.onpointerdown=e=>{
    if(e.button!==0||e.target.closest('button')||g.max) return;
    takeGeom(el,g,false); const sx=g.x, sy=g.y, w=el.offsetWidth;
    track(e,(dx,dy,c)=>{ g.x=clamp(sx+dx, 80-w, c.width-80); g.y=clamp(sy+dy, 0, c.height-30); applyGeom(el,g); });
  };
  tb.ondblclick=e=>{ if(!e.target.closest('button')) toggleMax(el,g); };
  el.querySelectorAll(':scope>.rh').forEach(h=>h.onpointerdown=e=>{
    if(e.button!==0||g.max) return; e.stopPropagation();
    takeGeom(el,g,true); const d=h.dataset.rh, s0={x:g.x,y:g.y,w:g.w,h:g.h};
    track(e,(dx,dy,c)=>{
      if(d.includes('e')) g.w=clamp(s0.w+dx, min.w, c.width-s0.x);
      if(d.includes('s')) g.h=clamp(s0.h+dy, min.h, c.height-s0.y);
      if(d.includes('w')){ const w=clamp(s0.w-dx, min.w, s0.x+s0.w); g.x=s0.x+s0.w-w; g.w=w; }
      if(d.includes('n')){ const hh=clamp(s0.h-dy, min.h, s0.y+s0.h); g.y=s0.y+s0.h-hh; g.h=hh; }
      applyGeom(el,g);
    });
  });
}
makeWin($('pw'), PW, PW_MIN);
$('pMax').addEventListener('click',()=>toggleMax($('pw'),PW));
$('sWin').addEventListener('click',()=>{ resetGeom(PW); applyGeom($('pw'),PW); resetGeom(DW); const u=document.querySelector('#dlgBg .uw'); if(u) applyGeom(u,DW); });

/* ---------- подсказки ⓘ ---------- */
function showTip(el){
  const tip=$('tip'); tip.textContent=el.dataset.tip; tip.classList.add('show');
  const r=el.getBoundingClientRect(), w=tip.offsetWidth, h=tip.offsetHeight;
  let x=Math.min(Math.max(8, r.left+r.width/2-w/2), innerWidth-w-8), y=r.bottom+6;
  if(y+h>innerHeight-8) y=r.top-h-6;
  tip.style.left=x+'px'; tip.style.top=y+'px';
}
function hideTip(){ $('tip').classList.remove('show'); }
document.addEventListener('pointerover',e=>{ const h=e.target.closest('[data-tip]'); if(h) showTip(h); });
document.addEventListener('pointerout',e=>{ if(e.target.closest('[data-tip]')) hideTip(); });
document.addEventListener('focusin',e=>{ if(e.target.matches('[data-tip]')) showTip(e.target); });
document.addEventListener('focusout',e=>{ if(e.target.matches('[data-tip]')) hideTip(); });

/* ---------- панель сценариев ---------- */
[['sNet','net'],['sFiles','files'],['sDl','dlOut'],['sOut','outcome']].forEach(([id,k])=>$(id).addEventListener('change',e=>{ S[k]=e.target.value; if(k==='net') reset(); }));
$('sNewer').addEventListener('change',e=>{ S.newerOut=e.target.value==='yes'; draw(); });
$('sUi').addEventListener('change',e=>{ S.ui=e.target.value; if(S.ui!=='page'&&S.sel==='upd') S.sel='vms'; if(S.ui==='page') S.sel='upd'; closeMenu(); CUR=null; draw(); });
$('sReset').addEventListener('click',reset);
$('sDrop').addEventListener('click',dropConn);
$('scnTog').addEventListener('click',()=>{ const b=$('scnBody'); b.hidden=!b.hidden; $('scnTog').setAttribute('aria-expanded',String(!b.hidden)); });
$('galHide').addEventListener('click',()=>{ document.body.classList.remove('gal-on'); $('galShow').hidden=false; });
$('galShow').addEventListener('click',()=>{ document.body.classList.add('gal-on'); $('galShow').hidden=true; });
setInterval(()=>{ $('sDrop').disabled=!(S.dl&&S.dl.state==='run'); },300);

/* ================= раскадровка ================= */
function scenP(net,extra){ S.ui='page'; $('sUi').value='page'; S.net=net; $('sNet').value=net; S.files='found'; $('sFiles').value='found'; S.dlOut='ok'; $('sDl').value='ok'; S.outcome='ok'; $('sOut').value='ok';
  S.newerOut=false; $('sNewer').value='no'; S.autoCheck=true; reset(); S.sel='upd'; if(extra) extra(); renderPage(); }
function scen(net,extra){ S.ui='modal'; $('sUi').value='modal'; S.net=net; $('sNet').value=net; S.files='found'; $('sFiles').value='found'; S.dlOut='ok'; $('sDl').value='ok'; S.outcome='ok'; $('sOut').value='ok';
  S.newerOut=false; $('sNewer').value='no'; S.autoCheck=true; reset(); if(extra) extra(); renderPage(); }
const frozenDl = (src,pct,state) => { S.dl={src,target:LATEST,total:SIZE,done:SIZE*pct,state,frozen:true}; };
const doneOk = () => { S.cur=LATEST; S.build=CH[LATEST].b; S.log.unshift({t:'10.11.2026 14:41',a:'Обновление',from:'4.9.13.0',to:LATEST,ok:true,who:'admin',bk:true}); S.note={k:'ok'}; };
const autoOff = () => { S.autoCheck=false; S.checked=false; };
const GAL = [
  {g:'Страница «Обновление ПО» — по сети', items:[
    {t:'1. Уведомление в настройках', s:'Красный бейдж в дереве, на кнопке — нет', run:()=>scenP('avail',()=>{ S.sel='vms'; })},
    {t:'2. Доступно обновление', s:'Версия, что изменилось, «Загрузить»', run:()=>scenP('avail')},
    {t:'3. Загрузка', s:'Прогресс: остановить, отменить', run:()=>scenP('avail',()=>frozenDl('net',.42,'run'))},
    {t:'4. Загрузка остановлена', s:'Продолжить или отменить', run:()=>scenP('avail',()=>frozenDl('net',.42,'stopped'))},
    {t:'5. Окно после загрузки', s:'«Позже» или «Установить сейчас»', run:()=>{ scenP('avail',()=>{ S.ready={target:LATEST}; }); open('ready'); }},
    {t:'6. Установить позже', s:'Загружено — ждёт на странице', run:()=>scenP('avail',()=>{ S.ready={target:LATEST}; })},
    {t:'7. Установка', s:'Шаги, сервер недоступен', run:()=>scenP('avail',()=>{ S.busy={kind:'install',from:S.cur,to:LATEST,step:1,frozen:true}; })},
    {t:'8. Готово', s:'Новая версия', run:()=>scenP('avail',doneOk)},
    {t:'Пока ждали — вышла версия новее', s:'', run:()=>{ scenP('avail',()=>{ S.ready={target:LATEST}; S.newerOut=true; $('sNewer').value='yes'; }); }}]},
  {g:'Страница — автопоиск и сеть', items:[
    {t:'Автопоиск выключен', s:'Включить галочкой или проверить вручную', run:()=>scenP('avail',autoOff)},
    {t:'Нет доступа к сети', s:'Рекомендации и обновление из файла', run:()=>scenP('offline')},
    {t:'Сервер обновлений недоступен', s:'', run:()=>scenP('nohost')},
    {t:'Уже последняя версия', s:'', run:()=>scenP('latest')}]},
  {g:'Страница — из файла', items:[
    {t:'1. Выбран вариант «Из файла»', s:'Ссылка на скачивание, «Выбрать файл…»', run:()=>scenP('avail',()=>{ S.src='file'; })},
    {t:'2. Файл подходит', s:'«Отменить» слева, «Загрузить» справа', run:()=>scenP('avail',()=>{ S.src='file'; S.pfile=PICKS[0]; S.pickN=1; })},
    {t:'3. Файл не подходит', s:'Почему и что делать', run:()=>scenP('avail',()=>{ S.src='file'; S.pfile=PICKS[2]; S.pickN=3; })},
    {t:'4. Передача на сервер', s:'Прогресс — в блоке «Из файла»', run:()=>scenP('avail',()=>{ S.src='file'; frozenDl('file',.18,'run'); })}]},
  {g:'Страница — кнопки внизу: изменения, журнал, откат', items:[
    {t:'Список изменений', s:'Окно, подгружается сколько угодно раз', run:()=>{ scenP('avail'); openChanges(); }},
    {t:'Что изменилось', s:'Окно по кнопке рядом с «Загрузить»', run:()=>{ scenP('avail'); open('whatsnew'); }},
    {t:'Журнал обновлений', s:'Окно', run:()=>{ scenP('avail'); open('log','table'); }},
    {t:'Восстановить прошлую версию?', s:'Подтверждение', run:()=>{ scenP('avail'); open('rb'); }},
    {t:'Восстановление прошлой версии', s:'', run:()=>scenP('avail',()=>{ const r=S.log[0]; S.busy={kind:'rollback',from:r.to,to:r.from,bkt:r.t,step:1,frozen:true}; })}]},
  {g:'Окна (было): обновление по сети', items:[
    {t:'1. Пришло обновление', s:'Подарочек на кнопке и у «vms»', run:()=>scen('avail')},
    {t:'2. Меню «Обновление ПО»', s:'«Доступна 4.9.15.0»', run:()=>{ scen('avail'); toggleMenu(); }},
    {t:'3. Окно «Обновление по сети»', s:'«Что изменилось» свёрнуто, бэкап, перезапуск', run:()=>{ scen('avail'); openNet(); }},
    {t:'4. Загрузка в фоне', s:'Строка под кнопками, окно закрыто', run:()=>scen('avail',()=>frozenDl('net',.42,'run'))},
    {t:'5. Работа в другом разделе', s:'Ход загрузки — у «vms» в дереве', run:()=>scen('avail',()=>{ frozenDl('net',.42,'run'); S.sel='archive'; })},
    {t:'6. «Перезапустить и установить»', s:'Позже, удалить загруженное', run:()=>{ scen('avail',()=>{ S.ready={target:LATEST}; }); open('ready'); }},
    {t:'7. Установка позже', s:'Загружено — в строке под кнопками', run:()=>scen('avail',()=>{ S.ready={target:LATEST}; })},
    {t:'8. Пока ждали — вышла версия новее', s:'Удалить эту и загрузить новую', run:()=>{ scen('avail',()=>{ S.ready={target:LATEST}; S.newerOut=true; $('sNewer').value='yes'; }); open('ready'); }},
    {t:'9. Установка в фоне', s:'«обновляется» у «vms» в дереве', run:()=>scen('avail',()=>{ S.busy={kind:'install',from:S.cur,to:LATEST,step:1,frozen:true}; })},
    {t:'10. Готово', s:'Новая версия и «Что нового»', run:()=>scen('avail',doneOk)},
    {t:'Загрузка остановлена', s:'Продолжить или удалить загруженное', run:()=>scen('avail',()=>frozenDl('net',.42,'stopped'))}]},
  {g:'Окна (было): из файла', items:[
    {t:'1. Поиск файлов', s:'Долго — можно выбрать вручную', run:()=>{ scen('avail'); open('file','search'); }},
    {t:'2. Найдены файлы', s:'Подходящий отмечен', run:()=>{ scen('avail'); open('file','found'); }},
    {t:'3. Выбран вручную', s:'В списке только он', run:()=>{ scen('avail'); open('file','found'); S.pickN=0; ACT.browse(); }},
    {t:'4. Ничего не нашлось', s:'Адрес сайта, искать снова', run:()=>{ scen('avail'); S.files='none'; $('sFiles').value='none'; open('file','none'); }},
    {t:'5. Передача на сервер в фоне', s:'Та же строка под кнопками', run:()=>scen('avail',()=>frozenDl('file',.18,'run'))}]},
  {g:'Окна (было): автопоиск', items:[
    {t:'Настройка в разделе «Сеть»', s:'Под «Шифрованием портов»', run:()=>scen('avail',()=>{ S.sel='net'; })},
    {t:'Выключен — окно «по сети»', s:'Включить или обновить из файла', run:()=>{ scen('avail',autoOff); openNet(); }},
    {t:'Выключен — список изменений', s:'Просьба включить', run:()=>{ scen('avail',autoOff); openChanges(); }}]},
  {g:'Окна (было): справка', items:[
    {t:'Список изменений', s:'«Доступна» — только у последней', run:()=>{ scen('avail'); open('changes','list'); }},
    {t:'Журнал обновлений', s:'Весь список сразу', run:()=>{ scen('avail'); open('log','table'); }},
    {t:'Уже последняя версия', s:'', run:()=>{ scen('latest'); openNet(); }}]},
  {g:'Окна (было): проблемные — позже', items:[
    {t:'Нет доступа к сети', s:'', run:()=>{ scen('offline'); openNet(); }},
    {t:'Сервер обновлений недоступен', s:'', run:()=>{ scen('nohost'); openNet(); }},
    {t:'Версия слишком старая', s:'', run:()=>{ scen('old'); openNet(); }},
    {t:'Не хватает места', s:'', run:()=>{ scen('space'); openNet(); }},
    {t:'Файл повреждён', s:'', run:()=>{ scen('avail'); open('file','found'); S.pickN=2; ACT.browse(); }},
    {t:'Связь прервалась', s:'В строке под кнопками', run:()=>scen('avail',()=>frozenDl('net',.42,'paused'))},
    {t:'Загрузка не удалась', s:'В строке под кнопками', run:()=>scen('avail',()=>frozenDl('net',.6,'fail'))},
    {t:'Не установилось', s:'Сервер вернул прошлую версию', run:()=>scen('avail',()=>{ S.failTo=LATEST; S.log.unshift({t:'10.11.2026 14:41',a:'Обновление',from:'4.9.13.0',to:LATEST,ok:false,who:'admin',why:'Ошибка установки пакета (код 0x2F). Сервер автоматически вернулся на 4.9.13.0'}); S.note={k:'fail'}; })}]}
];
$('galList').innerHTML = GAL.map((g,gi)=>`<div class="ugal-g">${g.g}</div>`+g.items.map((it,ii)=>`<button type="button" class="ugal-i" data-gal="${gi}.${ii}">${it.t}${it.s?`<span>${it.s}</span>`:''}</button>`).join('')).join('');
$('galList').addEventListener('click',e=>{
  const b=e.target.closest('[data-gal]'); if(!b) return; e.stopPropagation();
  const [gi,ii]=b.dataset.gal.split('.').map(Number);
  document.querySelectorAll('.ugal-i.sel').forEach(x=>x.classList.remove('sel')); b.classList.add('sel');
  closeMenu(); GAL[gi].items[ii].run();
});

reset();
// ?gal=0.3 — сразу открыть шаг раскадровки; ?bare — без раскадровки
try{
  const q=new URLSearchParams(location.search), g=q.get('gal');
  if(g){ const [gi,ii]=g.split('.').map(Number); const it=GAL[gi]&&GAL[gi].items[ii]; if(it){ it.run(); document.querySelector(`[data-gal="${g}"]`)?.classList.add('sel'); } }
  if(q.has('bare')){ document.body.classList.remove('gal-on'); $('galShow').hidden=false; }
}catch(e){}
