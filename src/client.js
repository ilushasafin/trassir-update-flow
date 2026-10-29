/* ===== Окно обновления ПО в клиенте TRASSIR =====
   Окна: net — обновление по сети, file — из файла, dl — загрузка, ready — готово к установке, restart — установка,
   done — итог, changes — список изменений, log — журнал. Каждое окно — функция состояния, рисуется заново при любом изменении. */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SRV='VMS-DEMOSTAND-1';
const LATEST='4.9.15.0';
const SITE='site.html#pick';
const PHONE='8 (499) 111-25-50';
const XSVG='<svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1L1 9" stroke="#333"/></svg>';
const ARROW='<svg width="18" height="10" viewBox="0 0 18 10"><path d="M1 5h15m-4-4l4 4-4 4" stroke="#8f9093" fill="none"/></svg>';
const SPIN='<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.8" stroke="#ecd9a8" stroke-width="1.6"/><path d="M7 1.2a5.8 5.8 0 0 1 5.8 5.8" stroke="#8a6400" stroke-width="1.6"/></svg>';

/* ---------- данные (номера сборок и тексты изменений условные) ---------- */
const CH = {
  '4.9.15.0':{d:'28.10.2026', b:'1321840', items:['Видеоаналитика на видеокартах NVIDIA GeForce RTX 50-й серии.','Исправлены разрывы подключений через Cloud Connect примерно через сутки работы.','СКУД: уведомления через МАКС, PIN-код на контроллерах Hikvision.']},
  '4.9.14.0':{d:'14.10.2026', b:'1319665', items:['Для камеры TR-D6124IR10v3 (D) снова видны кнопки PTZ-пресетов.','Быстрее поиск по архиву на серверах с большим числом каналов.']},
  '4.9.13.0':{d:'30.09.2026', b:'1317308', items:['Базовый «Детектор вторжения» на серверах NeuroStation и UltraStation.','До 60 FPS для камеры TR-D2343WDZIR7v3 (R).']},
  '4.9.12.0':{d:'16.09.2026', b:'1316200', items:['Экспорт архива в MP4 без перекодирования.','Исправлено зависание клиента при быстром переключении раскладок.']},
  '4.9.11.0':{d:'02.09.2026', b:'1314420', items:['Поддержка камер TRASSIR серии v8.','Исправлены ложные срабатывания детектора движения ночью.']},
  '4.9.10.0':{d:'12.08.2026', b:'1312005', items:['Новый вид журнала событий.','Ускорен запуск сервера с большим архивом.']}
};
const VERS = Object.keys(CH); // от новых к старым
const BR_LAST = {'4.7':'4.7.9.2','4.8':'4.8.3.5','4.9':LATEST};
const SIZE_NET = 1300; // МБ, ServicePack сервера
const SPEED = 4.3;     // МБ/с — для оценки «осталось»; сама загрузка в демо ускорена
const FILES_SERVER = [
  {n:'Trassir-4.9.15.0-1321840-64-Release-sp.pack', v:'4.9.15.0', mb:1300, where:'Загрузки', ok:true, tag:'Рекомендуем: последняя версия'},
  {n:'Trassir (1).pack', v:'4.9.15.0', mb:1300, where:'Рабочий стол', ok:true, tag:'Имя изменено', tip:'Версию определили по содержимому файла — название не важно.'},
  {n:'Trassir-4.9.14.0-1319665-64-Release-sp.pack', v:'4.9.14.0', mb:1290, where:'Загрузки', ok:true, tag:'Подходит, но есть версия новее'},
  {n:'Trassir-4.9.15.0-1321840-64-Release-client-sp.pack', mb:693, where:'Загрузки', err:'Не подходит: обновление для TRASSIR Client, а это сервер'},
  {n:'Trassir-4.9.15.0-1321844-LITE', mb:2300, where:'USB-накопитель (E:)', err:'Не подходит: для регистраторов MiniNVR на TRASSIR OS'}
];
const FILES_CLIENT = [
  {n:'Trassir-4.9.15.0-1321840-64-Release-client-sp.pack', v:'4.9.15.0', mb:693, where:'Загрузки', ok:true, tag:'Рекомендуем: последняя версия'},
  {n:'client-update.pack', v:'4.9.15.0', mb:693, where:'Рабочий стол', ok:true, tag:'Имя изменено', tip:'Версию определили по содержимому файла — название не важно.'},
  {n:'Trassir-4.9.14.0-1319665-64-Release-client-sp.pack', v:'4.9.14.0', mb:688, where:'Загрузки', ok:true, tag:'Подходит, но есть версия новее'},
  {n:'Trassir-4.9.15.0-1321840-64-Release-sp.pack', mb:1300, where:'Загрузки', err:'Не подходит: обновление для TRASSIR Server, а это клиент'},
  {n:'Trassir-4.9.15.0-1321844-LITE', mb:2300, where:'USB-накопитель (E:)', err:'Не подходит: для регистраторов MiniNVR на TRASSIR OS'}
];
const FILES_ = () => S.sel===CLIENT||kindOf(S.sel)==='client' ? FILES_CLIENT : FILES_SERVER;
/* Слова, которые зависят от того, что обновляем: сервер (обновление по сети с регистратора) или клиент на этом компьютере */
function W(){
  if(kindOf(S.sel)==='client') return {
    client:true, size:693, Subj:'Этот компьютер', subjGen:'этого компьютера', Name:'TRASSIR Client', obj:'клиент', Obj:'Клиент',
    backupTip:'Перед установкой — в папку настроек клиента на этом компьютере. Если после обновления что-то пойдёт не так, к нему можно вернуться',
    restartLbl:'Перезапустить клиент и установить сразу после загрузки',
    restartTip:'Клиент закроется и откроется снова — около минуты. Серверы продолжат работать, запись архива не прервётся',
    restartBtn:'Перезапустить клиент и установить', downtime:'Клиент закроется и откроется снова — около минуты. Серверы продолжат работать, запись архива не прервётся.',
    backupWhere:'в папку настроек клиента', netWhere:'«Параметры Windows» → «Сеть и Интернет»',
    stepsHint:'Настройки клиента сохранятся. После каждого шага клиент перезапустится — снова откройте «Обновление по сети», и мы предложим следующий.',
    reinstallHint:`Сразу ${LATEST} одним шагом. Установщик запускается на этом компьютере.`,
    restarting:'Клиент закроется и откроется снова — это займёт около минуты. Серверы и запись архива это не затрагивает.',
    works:'Клиент перезапущен и снова подключён к серверам.', worksBack:'Клиент работает, подключение к серверам восстановлено.',
    brokeEx:'Например, не открываются раскладки или пропал звук.',
    rbDowntime:'Клиент закроется примерно на минуту.', rbKeeps:'Серверы и архив это не затрагивает.'
  };
  return {
    client:false, size:SIZE_NET, Subj:S.sel, subjGen:S.sel, Name:S.sel, obj:'сервер', Obj:'Сервер',
    backupTip:'Перед установкой — на архивный диск. Если после обновления что-то пойдёт не так, к нему можно вернуться',
    restartLbl:'Перезапустить сервер и установить сразу после загрузки',
    restartTip:'Сервер будет недоступен около 5 минут, запись архива на это время остановится',
    restartBtn:'Перезапустить сервер и установить', downtime:'Сервер перезапустится и будет недоступен около 5 минут. Запись архива на это время остановится.',
    backupWhere:'на архивный диск', netWhere:'«Настройки сервера» → «Сетевые интерфейсы»',
    stepsHint:'Можно удалённо, настройки и архив сохранятся. После каждого шага сервер перезапустится — снова откройте «Обновление по сети», и мы предложим следующий.',
    reinstallHint:`Сразу ${LATEST} одним шагом. Нужен доступ к компьютеру, на котором стоит сервер.`,
    restarting:`${S.sel} перезапускается и сейчас недоступен — это нормально. Займёт около 5 минут, окно можно закрыть.`,
    works:`${S.sel} работает. Камеры: 50 из 50, диски и база данных в порядке.`, worksBack:'Сервер работает, камеры: 50 из 50.',
    brokeEx:'Например, пропала камера или не запускается модуль.',
    rbDowntime:'Сервер перезапустится и будет недоступен около 5 минут.', rbKeeps:'Архив сохранится.'
  };
}
// «Обзор…» в демо выбирает по очереди файлы с ошибками, которые ловим до загрузки
const PICKS = [
  {n:'trassir_4.9.15.zip', mb:1240, where:'Выбран вручную', err:'Это не файл обновления TRASSIR', kind:'format'},
  {n:'Trassir-4.9.15.0-1321840-64-Release-sp.pack', mb:910, where:'Выбран вручную', err:'Файл повреждён — не прошёл проверку подписи', kind:'sign'},
  {n:'Trassir-4.9.12.0-1316200-64-Release-sp.pack', v:'4.9.12.0', mb:1280, where:'Выбран вручную', err:'Версия 4.9.12.0 старше установленной', kind:'older'}
];
const PICK_RECS = {
  format:['Нужен файл с расширением .pack со страницы загрузок dssl.ru. Архивы .zip и установщики .exe для обновления не подходят.','Если скачивали архив — распакуйте его и выберите файл .pack внутри.'],
  sign:['Скачайте файл заново — скорее всего, загрузка прервалась.','Если переносили файл на флешке — запишите его на флешку ещё раз.','Антивирус, брандмауэр или роутер могут портить скачанные файлы — проверьте их настройки.'],
  older:['Обновлением нельзя вернуться на прошлую версию.','Вернуть предыдущую версию можно из журнала обновлений, если перед обновлением сохранялся бэкап.']
};

/* ---------- состояние ----------
   Общее (сеть, сценарии, флаги, галочки) — в S. Своё у каждого элемента списка слева (версия, загрузка, установка, журнал) — в TS[имя];
   S.cur, S.dl и т. п. читают и пишут TS[S.sel], поэтому окна всегда показывают выбранный сервер или клиент. */
const S = {
  net:'avail', files:'found', dlOut:'ok', outcome:'ok',
  flags:{auto:'dialog', min:'yes', cancel:'ask', help:'errors'},
  autoCheck:true, backup:true, restartNow:false, keepPart:true, sel:SRV
};
const CLIENT='Клиент';
const TKEYS=['cur','build','dl','ready','busy','log','checked','checking','extra','fileSel','pickN','cancelFrom','exported','rbFrom','failTo','moreCh'];
let TS={};
const kindOf = sel => /^VMS-/.test(sel) ? 'server' : 'client';
function tsOf(sel){ if(!TS[sel]) TS[sel]=initTS(sel); return TS[sel]; }
TKEYS.forEach(k=>Object.defineProperty(S,k,{get:()=>tsOf(S.sel)[k], set:v=>{ tsOf(S.sel)[k]=v; }, enumerable:true}));
// выполнить код от имени другого элемента списка (фоновая загрузка или установка, пока пользователь смотрит другой)
function inTarget(sel,fn){ const prev=S.sel; S.sel=sel; try{ return fn(); } finally{ S.sel=prev; } }
let CUR=null, BTNS=[], ONX=null, tChk=null, galSel=null;

function initTS(sel){
  const cur = S.net==='latest'?LATEST : S.net==='old'?'4.6.9.0' : '4.9.13.0';
  return {cur, build:CH[cur]?.b||'1268000', checked:S.autoCheck||S.flags.auto==='off', checking:false,
    dl:null, ready:null, busy:null, extra:[], fileSel:0, pickN:0, cancelFrom:null, exported:false, rbFrom:null, failTo:null, moreCh:0,
    log:baseLog(kindOf(sel))};
}
function baseLog(kind){
  const obj = kind==='client' ? 'Клиент' : 'Сервер', who = kind==='client' ? 'ilya.safin' : 'admin';
  const l=[
    {t:'21.10.2026 10:02', a:'Обновление', from:'4.9.11.0', to:'4.9.13.0', ok:true, who, bk:true},
    {t:'20.10.2026 18:47', a:'Обновление', from:'4.9.11.0', to:'4.9.13.0', ok:false, who, why:`Файл повреждён — не прошёл проверку подписи. ${obj} остался на 4.9.11.0`},
    {t:'02.09.2026 09:15', a:'Обновление', from:'4.9.10.0', to:'4.9.11.0', ok:true, who:kind==='client'?who:'i.petrov', bk:true},
    {t:'12.08.2026 22:05', a:'Обновление', from:'4.9.9.0', to:'4.9.10.0', ok:true, who, bk:true},
    {t:'22.11.2024 22:34', a:'Установка', to:'4.5.26.0', ok:true, who:'—'}
  ];
  if(S.net==='latest') l.unshift({t:'28.10.2026 23:10', a:'Обновление', from:'4.9.13.0', to:LATEST, ok:true, who, bk:true});
  if(S.net==='old') return [{t:'05.03.2025 12:40', a:'Обновление', from:'4.6.8.0', to:'4.6.9.0', ok:true, who, bk:false},{t:'22.11.2024 22:34', a:'Установка', to:'4.5.26.0', ok:true, who:'—'}];
  return l;
}
function reset(){
  Object.values(TS).forEach(t=>{ clearTimeout(t._tDl); clearTimeout(t._tRs); }); clearTimeout(tChk);
  TS={}; Object.assign(S, {called:false, back:[], exp:{}, sel:SRV}); tsOf(SRV); tsOf(CLIENT);
  CUR=null; renderPanel(); draw();
}

/* ---------- помощники разметки ---------- */
const ICO = k => ICON[k==='ok'?'ok':k==='warn'?'warn':k==='err'?'err':'info'];
// пояснения второго плана — в подсказку по иконке ⓘ, чтобы не нагружать окно (просьба 29.10.2026)
// span, а не button: подсказка бывает внутри строки-кнопки (список файлов), а кнопки нельзя вкладывать друг в друга
const hint = t => `<span class="hi" tabindex="0" role="img" data-tip="${esc(t)}" aria-label="Подсказка: ${esc(t)}">${ICON.info}</span>`;
const sh = (k,title,text,tip) => `<div class="sh">${ICO(k)}<div><b>${title}${tip?hint(tip):''}</b>${text?`<p>${text}</p>`:''}</div></div>`;
const box = (k,html) => `<div class="ubox ${k}">${html}</div>`;
const ck = (key,label,sub) => `<label class="ck"><button type="button" class="cb" role="checkbox" aria-checked="${!!S[key]}" data-ck="${key}">${ICON.check}</button><span>${label}${sub?hint(sub):''}</span></label>`;
const lnk = (act,t) => `<a class="lnk" data-act="${act}" tabindex="0">${t}</a>`;
const site = t => `<a class="lnk" href="${SITE}" target="_blank">${t||'Открыть страницу загрузок ↗'}</a>`;
const ul = a => `<ul class="chg">${a.map(x=>`<li>${x}</li>`).join('')}</ul>`;
const mb = v => v>=1000 ? (v/1000).toFixed(1).replace('.',',')+' ГБ' : Math.round(v)+' МБ';
const left = s => { const sec=s/SPEED; return sec<60?'меньше минуты':`~${Math.ceil(sec/60)} мин`; };
const br = v => v.split('.').slice(0,2).join('.');
const newer = (a,b) => { const x=a.split('.').map(Number), y=b.split('.').map(Number); for(let i=0;i<4;i++) if(x[i]!==y[i]) return x[i]>y[i]; return false; };
function chainFrom(v){ const b=br(v); if(b==='4.9') return [LATEST]; return Object.keys(BR_LAST).filter(k=>newer(k+'.0.0',b+'.0.0')).map(k=>BR_LAST[k]); }
function changesSince(v){ return VERS.filter(x=>newer(x,v)); }
function help(isErr){
  const f=S.flags.help; if(f==='none'||(f==='errors'&&!isErr)) return '';
  if(f==='always') return `<div class="helpl"><span><b>Нужна помощь специалиста?</b> Перезвоним в течение 15 минут в рабочее время.</span>${S.called?'<span class="chip ok">Заявка отправлена — специалист перезвонит</span>':'<button type="button" class="btn" data-act="callme">Связаться со специалистом</button>'}</div>`;
  return `<div class="helpl"><span>Не получается? Техподдержка TRASSIR: <b>${PHONE}</b>, пн–пт 9:00–18:00.</span><a class="lnk" href="#" onclick="return false">Все контакты ↗</a></div>`;
}
// список изменений по версиям — общий для окна «Список изменений» и разворота внутри окон
const verList = vers => `<div class="vlist">${vers.map(v=>{
  const tag = v===S.cur?'<span class="chip">Установлена</span>' : newer(v,S.cur)?'<span class="chip ok">Доступна</span>':'';
  return `<div><div class="ver-h"><b>${v}</b><small>${CH[v].d}</small>${tag}</div>${ul(CH[v].items)}</div>`; }).join('')}</div>`;
// ссылка, которая разворачивает содержимое прямо в этом окне (не открывает другое окно); состояние — в S.exp
const exp = (key,label,html) => `<a class="lnk exp-t${S.exp[key]?' on':''}" data-act="exp" data-k="${key}" role="button" tabindex="0" aria-expanded="${!!S.exp[key]}">${S.exp[key]?'Свернуть':label}</a>${S.exp[key]?`<div class="exp-b">${html}</div>`:''}`;
const autoRow = () => S.flags.auto==='dialog' ? ck('autoCheck','Проверять обновления автоматически') : '';
const opts = () => `<div class="opts">${ck('backup','Сохранить бэкап настроек',W().backupTip)}
  ${S.backup?'':`<p class="fine" style="color:var(--warn);margin:-2px 0 0 22px">Без бэкапа вернуться к ${S.cur} не получится — только переустановкой.</p>`}
  ${ck('restartNow',W().restartLbl,W().restartTip)}</div>`;

/* ---------- сетевое состояние ---------- */
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
  if(st==='dl') return open('dl', S.dl.state);
  if(st==='ready') return open('ready');
  if(st==='busy') return open('restart');
  open('net', st);
}

/* ================= окна ================= */
const WIN = {
  net(st){
    const T='Обновление по сети';
    if(st==='checking') return {t:T, body:`<div class="sh">${ICON.spin}<div><b>Проверяем обновления…</b><p>Обращаемся к серверу обновлений TRASSIR.</p></div></div>`, btns:[{t:'Закрыть',act:close}]};
    if(st==='unchecked') return {t:T, left:autoRow(),
      body:sh('info','Автоматическая проверка выключена',`${W().Subj} не обращается к серверу обновлений сам. Проверьте вручную, когда удобно.`),
      btns:[{t:'Закрыть',act:close},{t:'Проверить сейчас',pri:1,act:check}]};
    if(st==='latest') return {t:T, left:autoRow(),
      body:sh('ok',`Установлена последняя версия ${S.cur}`,'Проверено сегодня в 14:32.')+(CH[S.cur]?`<div>${exp('whatsnew','Что нового в этой версии',ul(CH[S.cur].items))}</div>`:''),
      btns:[{t:'Проверить снова',act:check},{t:'Закрыть',pri:1,act:close}]};
    if(st==='offline') return {t:T, left:autoRow(),
      body:sh('err','Нет доступа к сети',`${W().Subj} не подключён к интернету, поэтому проверить обновления нельзя.`)
        +`<div><div class="sec-h">Что можно сделать</div><ol class="recs">
          <li><b>Восстановить подключение.</b> Проверьте кабель и настройки в ${W().netWhere}: адрес, шлюз и DNS. Затем нажмите «Проверить снова».</li>
          <li><b>Обновить из файла.</b> Скачайте файл обновления на любом компьютере с интернетом — страница загрузок подберёт нужный по версии — и загрузите его сюда. ${site()}</li></ol></div>`+help(true),
      btns:[{t:'Проверить снова',act:check},{t:'Обновить из файла',pri:1,act:()=>openFile()}]};
    if(st==='nohost') return {t:T, left:autoRow(),
      body:sh('err','Не удаётся связаться с сервером обновлений',`Интернет есть, но ${W().Subj} не находит адрес updates.cloud.trassir.com — обычно не указан шлюз или DNS.`)
        +`<div><div class="sec-h">Как исправить</div><ol class="recs">
          <li>Откройте ${W().netWhere}.</li>
          <li>У интерфейса с доступом в интернет нажмите «Настроить» и заполните поля «Шлюз» и «DNS». Подойдут публичные DNS Яндекса <b>77.88.8.8</b> и <b>77.88.8.1</b>, за пределами России — Google <b>8.8.8.8</b>.</li>
          <li>Если не знаете адрес шлюза — уточните у системного администратора.</li></ol></div>`
        +`<p class="fine">Пока доступа нет, можно ${lnk('file','обновиться из файла')}.</p>`+help(true),
      btns:[{t:'Закрыть',act:close},{t:'Проверить снова',pri:1,act:check}]};
    if(st==='old'){
      const ch=chainFrom(S.cur);
      return {t:T, left:autoRow(),
        body:sh('warn',`Сразу до ${LATEST} обновиться нельзя`,`Установлена ${S.cur}. Обновлять нужно по порядку: ${ch.length} шага, по одной ветке за раз.`)
          +`<div class="ways">
            <div class="way rec"><b>Обновить по шагам${hint(W().stepsHint)}</b>
              <ol>${ch.map((v,i)=>`<li>${i===0?`<b>${v}</b> — сейчас`:v}</li>`).join('')}</ol>
              ${br(ch[0])==='4.7'?`<span class="fine" style="color:var(--warn)">На 4.7 меняется формат базы данных — <a class="lnk" href="#" onclick="return false">прочитайте инструкцию</a>.</span>`:''}</div>
            <div class="way"><b>Переустановить ПО${hint(W().reinstallHint)}</b>
              ${site('Скачать установщик на сайте ↗')}</div></div>`+opts(),
        btns:[{t:'Отмена',act:close},{t:`Загрузить шаг 1 — ${ch[0]}`,pri:1,act:()=>startDl('net',ch[0],W().size)}]};
    }
    // avail / space
    const list=changesSince(S.cur);
    const space = st!=='space' ? '' : W().client
      ? box('err',`<b>Не хватает места на диске C:</b><span>Для загрузки и установки нужно 1,4 ГБ, свободно 0,6 ГБ. Проверили до загрузки, чтобы она не оборвалась на середине.</span>
        <ol class="recs"><li>Удалите старые скриншоты и экспортированные видео — папка указана в «Настройки рабочей станции» → «Сохранять скриншоты в».</li><li>Очистите корзину и папку «Загрузки».</li></ol>
        <div class="row"><button type="button" class="btn" data-act="recheck">Проверить снова</button></div>`)
      : box('err',`<b>Не хватает места на системном диске</b><span>Для загрузки и установки нужно 2,6 ГБ, свободно 1,1 ГБ. Проверили до загрузки, чтобы она не оборвалась на середине.</span>
        <ol class="recs"><li>Удалите старые скриншоты и экспортированные видео: «Настройки сервера» → «Скриншоты».</li><li>Или загрузите обновление на архивный диск — места там достаточно.</li></ol>
        <div class="row"><button type="button" class="btn" data-act="toArchive">Загружать на архивный диск</button><button type="button" class="btn" data-act="recheck">Проверить снова</button></div>`);
    return {t:T, left:autoRow(),
      body:sh('info',`Доступно обновление до ${LATEST}`,`Установлена ${S.cur} · загрузка ${mb(W().size)}`, S.flags.min==='yes'?'Загрузка идёт в фоне — с TRASSIR можно работать как обычно.':'')
        +`<div><div class="sec-h">Что изменилось</div>${S.exp.allch?'':ul(CH[LATEST].items)}${list.length>1?`<div style="margin-top:6px">${exp('allch',`Полный список изменений — ${list.length} версии после ${S.cur}`,verList(list))}</div>`:''}</div>`
        +space+opts(),
      btns:[{t:'Отмена',act:close},{t:'Загрузить обновление',pri:1,dis:st==='space',act:()=>startDl('net',LATEST,W().size)}]};
  },

  file(st){
    const T='Обновление из файла';
    if(st==='none') return {t:T,
      body:sh('info','Не нашли файлы обновления','Искали в папках «Загрузки» и «Рабочий стол» на этом компьютере и на подключённых флешках.')
        +`<ol class="recs"><li>Скачайте файл на странице загрузок — она подберёт нужный по вашей версии ${S.cur}. ${site()}</li>
          <li>Положите файл в «Загрузки» или на флешку и нажмите «Искать снова».</li></ol>
          <p>Файл в другом месте? ${lnk('browse','Укажите его вручную')}.</p>`
        +((S.net==='avail'||S.net==='space') && newer(LATEST,S.cur) && S.checked
          ? box('info',`<div class="row"><span>Файл не нужен: по сети доступна <b>${LATEST}</b> · ${mb(W().size)}.</span><button type="button" class="btn" data-act="net">Обновиться по сети</button></div>`) : ''),
      btns:[{t:'Отмена',act:close},{t:'Искать снова',pri:1,act:()=>{ S.files='found'; $('sFiles').value='found'; open('file','found'); }}]};
    const all=[...S.extra,...FILES_()], f=all[S.fileSel]||all[0];
    const rows=all.map((x,i)=>`<button type="button" class="frow${i===S.fileSel?' on':''}${x.err?' bad':''}" data-fsel="${i}" role="radio" aria-checked="${i===S.fileSel}">
        <span class="rd"></span><span><span class="fn">${esc(x.n)}</span><br><span class="fm">${x.where}${x.v?' · версия '+x.v:''}</span><br>${x.err?`<span class="fe">${x.err}</span>`:`<span class="fo">${x.tag}</span>${x.tip?hint(x.tip):''}`}</span><span class="sz">${mb(x.mb)}</span></button>`).join('');
    let detail='';
    if(f.err && f.kind) detail=box('err',`<b>${f.err}</b><ol class="recs">${PICK_RECS[f.kind].map(r=>`<li>${r}</li>`).join('')}</ol>${f.kind==='older'?`<div>${lnk('log','Открыть журнал обновлений')}</div>`:''}${f.kind!=='older'?`<div>${site('Скачать файл заново ↗')}</div>`:''}`);
    else if(f.err) detail=box('warn',`<span>${f.err}. Выберите файл с отметкой «Рекомендуем» или ${site('скачайте нужный ↗')}</span>`);
    else detail=`<div class="flow"><span>Установлена <b>${S.cur}</b></span>${ARROW}<span>будет <b>${f.v}</b></span></div>`
      +(newer(LATEST,f.v)?box('warn',`<span>Есть версия новее — ${LATEST}. Её файл тоже в списке.</span>`):'')+opts();
    return {t:T,
      body:`<div class="fsrc"><span>Нашли ${FILES_().filter(x=>x.ok).length} подходящих файла на этом компьютере и флешке</span><button type="button" class="btn sm" data-act="browse">Обзор…</button></div>
        <div class="files" role="radiogroup" aria-label="Файлы обновления">${rows}</div>`+detail,
      btns:[{t:'Отмена',act:close},{t:'Загрузить обновление',pri:1,dis:!!f.err,act:()=>startDl('file',f.v,f.mb)}]};
  },

  dl(st){
    const d=S.dl, pct=Math.floor(d.done/d.total*100);
    const T=d.src==='net'?'Загрузка обновления':'Передача файла на сервер';
    const dlTip = (d.src==='net'?'Скачиваем с сервера обновлений TRASSIR.':`Передаём файл с этого компьютера на ${S.sel}.`)+' '+(S.restartNow?`Сразу после загрузки ${W().obj} перезапустится и установит обновление.`:`После загрузки предложим перезапустить ${W().obj}.`)+(S.flags.min==='yes'?' Окно можно закрыть и продолжать работать — прогресс виден в меню «Обновление ПО».':'');
    const head=`<div class="dlh"><span style="color:var(--txt)">${d.src==='net'?'Загружаем':'Передаём'} ${d.target}${hint(dlTip)}</span><span>${pct}%</span></div>`;
    const bar=k=>`<div class="pbar ${k||''}"><i style="width:${pct}%"></i></div>`;
    if(st==='paused') return {t:T, x:minimize,
      body:sh('warn','Связь с сервером прервалась',`Загружено ${mb(d.done)} из ${mb(d.total)} — эта часть сохранится. Как только связь восстановится, загрузка продолжится с того же места.`,'Повторяем попытку каждые 30 секунд.')+bar('paused'),
      btns:[{t:'Отменить загрузку',act:askCancel},{t:'Повторить сейчас',pri:1,act:resumeDl}]};
    if(st==='cancel') return {t:T, x:()=>open('dl',S.cancelFrom||'run'),
      body:sh('warn','Отменить загрузку?',`Загружено ${mb(d.done)} из ${mb(d.total)}.`)
        +`<div class="opts" style="border:0;padding:0">${ck('keepPart','Сохранить загруженную часть на 7 дней','Если начнёте загрузку снова, она продолжится с этого места. Потом файл удалится сам')}</div>`,
      btns:[{t:'Продолжить загрузку',act:()=>{ S.dl.frozen=false; open('dl',S.cancelFrom||'run'); if(S.cancelFrom!=='paused') tickDl(S.sel); }},{t:'Отменить загрузку',pri:1,act:doCancel}]};
    if(st==='fail') return {t:T,
      body:sh('err','Загрузка обновления не удалась',`Связь с сервером обновлений обрывалась слишком часто. Загружено ${mb(d.done)} из ${mb(d.total)} — эта часть сохранена, повторная загрузка продолжится с неё.`)+bar('fail')
        +`<ol class="recs"><li>Проверьте подключение ${W().subjGen} к интернету и попробуйте ещё раз.</li><li>Если канал медленный или нестабильный, скачайте файл на другом компьютере и обновитесь из файла.</li></ol>`+help(true),
      btns:[{t:'Обновить из файла',act:()=>{ S.dl=null; openFile(); }},{t:'Повторить загрузку',pri:1,act:()=>{ S.dl.state='run'; S.dl.failed=true; S.dl.frozen=false; open('dl','run'); tickDl(S.sel); }}]};
    const remain=d.total-d.done;
    return {t:T, x:S.flags.min==='yes'?minimize:null,
      body:head+bar()+`<div class="dlm"><span>${mb(d.done)} из ${mb(d.total)}</span><span>Осталось ${left(remain)}</span></div>`,
      btns:[...(S.flags.min==='yes'?[{t:'Свернуть',act:minimize}]:[]),{t:'Отменить загрузку',act:askCancel}]};
  },

  ready(){
    const v=S.ready.target;
    return {t:'Обновление загружено',
      body:sh('ok',`${v} готово к установке`,W().client?'Файл проверен и готов к установке.':`Файл загружен на ${S.sel}.`)
        +box('info',`<ol class="recs" style="padding-left:16px"><li>${W().downtime}</li>
          ${S.backup?`<li>Перед установкой сохраним бэкап настроек ${W().backupWhere}.</li><li>Если после обновления что-то пойдёт не так, вернуть ${S.cur} можно будет из журнала обновлений.</li>`:`<li>Бэкап настроек не сохранится — вернуть ${S.cur} после обновления не получится.</li>`}</ol>`),
      btns:[{t:'Позже',act:close},{t:W().restartBtn,pri:1,act:()=>startRestart('install')}]};
  },

  restart(){
    const b=S.busy, steps=restartSteps();
    const T=b.kind==='install'?'Установка обновления':'Возврат прошлой версии';
    return {t:T,
      body:`<div class="sh">${ICON.spin}<div><b>${b.kind==='install'?`Устанавливаем ${b.to}`:`Возвращаем ${b.to}`}</b><p>${W().restarting}</p></div></div>
        <ol class="steps">${steps.map((s,i)=>`<li class="${i<b.step?(s.bad?'bad':'done'):i===b.step?'now':''}"><span class="st"></span><span>${s.t}</span></li>`).join('')}</ol>`,
      btns:[{t:'Закрыть',act:close}]};
  },

  done(st){
    if(st==='rolled') return {t:'Прошлая версия возвращена',
      body:sh('ok',`${W().Name} снова на версии ${S.cur}`,`Настройки восстановлены из бэкапа от ${S.rbFrom}. ${W().worksBack}`,'Изменения настроек, сделанные после обновления, не сохранились. Обновиться снова можно в любой момент.')+help(false),
      btns:[{t:'Журнал обновлений',act:()=>openSub('log','table')},{t:'Готово',pri:1,act:close}]};
    if(st==='fail') return {t:'Обновление не установилось',
      body:sh('err',`${S.failTo} не установилась — ${W().obj} вернулся на ${S.cur}`,`${W().Obj} не запустился с новой версией, поэтому мы автоматически вернули прошлую и восстановили настройки из бэкапа. ${W().Obj} работает как раньше.`)
        +box('err',`<span><b>Причина:</b> ошибка при установке пакета (код 0x2F). Подробности сохранены в журнале обновлений — их увидит техподдержка.</span>`)
        +`<div><div class="sec-h">Что можно сделать</div><ol class="recs"><li>Попробуйте обновиться ещё раз — иногда помогает повторная загрузка файла.</li><li>Переустановите ПО: ${site('скачать установщик на сайте ↗')}</li><li>Обратитесь в техподдержку и назовите время обновления — детали уже есть в журнале.</li></ol></div>`+help(true),
      btns:[{t:'Журнал обновлений',act:()=>openSub('log','table')},{t:'Закрыть',pri:1,act:close}]};
    const last=S.log[0];
    return {t:'Обновление установлено',
      body:sh('ok',`Установлена версия ${S.cur}`,W().works)
        +(CH[S.cur]?`<div><div class="sec-h">Что нового</div>${ul(CH[S.cur].items)}</div>`:'')
        +(newer(LATEST,S.cur)?box('info',`<span>Это шаг ${chainFrom(last.from).indexOf(S.cur)+1} из ${chainFrom(last.from).length}. Чтобы продолжить, снова откройте «Обновление по сети».</span>`):'')
        +(last.bk?box('info',`<b>Если что-то работает не так</b><span>${W().brokeEx} Можно вернуть версию ${last.from} и настройки на момент обновления — бэкап от ${last.t}.</span><div class="row"><button type="button" class="btn" data-act="rollback">Вернуть ${last.from}</button></div>`)
                 :box('warn',`<span>Бэкап перед обновлением не сохранялся — вернуть ${last.from} можно будет только переустановкой.</span>`))
        +help(false),
      btns:[{t:'Журнал обновлений',act:()=>openSub('log','table')},{t:'Готово',pri:1,act:close}]};
  },

  changes(st){
    const T='Список изменений';
    if(st==='offline') return {t:T,
      body:sh('warn','Список изменений недоступен без интернета',`Он загружается с сервера обновлений, а ${W().Subj} сейчас не подключён к сети.`)
        +`<p>Восстановите подключение или посмотрите изменения на сайте: ${site('Список изменений на dssl.ru ↗')}</p>`,
      btns:[{t:'Закрыть',pri:1,act:close}]};
    let idx=VERS.indexOf(S.cur); if(idx<0) idx=VERS.length-1;
    const shown = VERS.slice(0, idx+1+S.moreCh);
    const rest = VERS.length - shown.length;
    return {t:T, wide:1,
      body:verList(shown)
        +`<div>${rest>0?lnk('more',`Показать более ранние версии`):`<span class="fine">Изменения в версиях до 4.9.10.0 — ${site('на сайте ↗')}</span>`}</div>`,
      btns:[...(newer(LATEST,S.cur)&&!S.dl&&!S.ready&&S.checked?[{t:`Обновить до ${LATEST}`,act:()=>openNet()}]:[]),{t:closeLbl(),pri:1,act:close}]};
  },

  log(st){
    if(st==='confirm'){ const r=S.log[0];
      return {t:'Вернуть прошлую версию',
        body:sh('warn',`Вернуть версию ${r.from}?`,`Сейчас установлена ${r.to}.`)
          +`<ol class="recs"><li>${W().rbDowntime}</li><li>Настройки восстановятся из бэкапа от ${r.t}.</li><li>Изменения настроек после этой даты пропадут. ${W().rbKeeps}</li></ol>`,
        btns:[{t:'Отмена',act:()=>S.back.length?close():open('log','table')},{t:`Вернуть ${r.from}`,pri:1,act:()=>startRestart('rollback')}]};
    }
    const canRb = r => r===S.log[0] && r.ok && r.bk && r.a==='Обновление' && !S.busy;
    return {t:'Журнал обновлений', wide:1,
      left:`<button type="button" class="btn" data-act="export">${S.exported?'Сохранено в «Загрузки» ✓':'Сохранить для техподдержки'}</button>`,
      body:`<table class="ulog"><thead><tr><th>Дата и время</th><th>Действие</th><th>Версия</th><th>Результат</th><th>Пользователь</th><th></th></tr></thead><tbody>
        ${S.log.map(r=>`<tr><td class="v">${r.t}</td><td>${r.a}</td><td class="v">${r.from?`${r.from} → ${r.to}`:r.to}</td>
          <td><span class="res">${r.ok?ICON.ok:ICON.err}<span>${r.ok?'Успешно':'Ошибка'}${r.why?hint(r.why):''}${r.ok&&r.bk===false&&r.a!=='Установка'?'<span class="why">Без бэкапа</span>':''}</span></span></td>
          <td>${r.who}</td><td>${canRb(r)?`<button type="button" class="btn" data-act="rollback">Вернуть ${r.from}</button>`:''}</td></tr>`).join('')}
        </tbody></table><p class="more">Показаны последние ${S.log.length} записей. ${lnk('noop','Показать все')}</p>`,
      btns:[{t:closeLbl(),pri:1,act:close}]};
  }
};

/* ================= отрисовка ================= */
// open — новое окно (стек «назад» сбрасывается); openSub — окно поверх текущего: «Закрыть»/✕ вернут обратно
function open(key,st){ S.back=[]; S.exp={}; keepPos(key); CUR={key,st}; closeMenu(); draw(); }
function openSub(key,st){ if(CUR) S.back.push(CUR); keepPos(key); CUR={key,st}; closeMenu(); draw(); }
function close(){ if(S.back.length){ CUR=S.back.pop(); draw(); return; } CUR=null; resetGeom(DW); draw(); }
// другое окно открывается там, куда пользователь передвинул прошлое, но со своим размером по умолчанию
function keepPos(key){ if(CUR&&CUR.key!==key){ DW.sized=false; DW.max=false; } }
const closeLbl = () => S.back.length ? 'Назад' : 'Закрыть';
function draw(){
  hideTip();
  const bg=$('dlgBg');
  if(!CUR){ bg.classList.remove('show'); bg.innerHTML=''; renderParent(); return; }
  const w=WIN[CUR.key](CUR.st);
  const lockX = CUR.key==='dl' && CUR.st==='run' && S.flags.min==='no';
  ONX = w.x || close; BTNS = w.btns;
  bg.innerHTML=`<div class="uw${w.wide?' wide':''}" role="dialog" aria-modal="true" aria-labelledby="uwT">
    <div class="tbar"><div class="ttl" id="uwT">${w.t}</div><div class="wctl"><button class="wbtn close" type="button" data-x aria-label="Закрыть" ${lockX?'disabled title="Загрузку можно только отменить"':''}>${XSVG}</button></div></div>
    <div class="uw-b">${w.body}</div>
    <div class="uw-f"><div class="l">${w.left||''}</div>${w.btns.map((b,i)=>`<button type="button" class="btn${b.pri?' pri':''}" data-b="${i}"${b.dis?' disabled':''}>${b.t}</button>`).join('')}</div></div>`;
  bg.classList.add('show');
  makeWin(bg.querySelector('.uw'), DW, DLG_MIN);
  renderParent();
}
// во время загрузки обновляем только прогресс, чтобы не сбивать фокус и наведение
function drawProgress(){
  const d=S.dl, pct=Math.floor(d.done/d.total*100), bg=$('dlgBg');
  const i=bg.querySelector('.pbar i'); if(i) i.style.width=pct+'%';
  const h=bg.querySelector('.dlh span:last-child'); if(h) h.textContent=pct+'%';
  const m=bg.querySelectorAll('.dlm span'); if(m.length){ m[0].textContent=`${mb(d.done)} из ${mb(d.total)}`; m[1].textContent=`Осталось ${left(d.total-d.done)}`; }
  renderParent();
}

// значок «нужно внимание» на кнопке — как в макете Figma (icon24/warning)
const WARN_IMG='<img src="__ASSET:warning__" width="24" height="24" alt="">';
function renderParent(){
  $('pVer').textContent = S.busy ? '—' : S.cur;
  $('pBuild').textContent = S.busy ? '—' : S.build;
  const st=netState(), b=$('updBtn');
  // подпись кнопки всегда «Обновление ПО», как в макете: состояние — значком ⚠, подсказкой и статусом в меню
  let warn=false, title='';
  if(st==='dl'){ if(S.dl.state!=='run'){ warn=true; title=S.dl.state==='paused'?'Загрузка приостановлена — нет связи':'Загрузка обновления не удалась'; } }
  else if(st==='ready'){ warn=true; title=`${S.ready.target} загружено и готово к установке`; }
  else if(st==='busy'){ title=`${W().Obj} перезапускается для установки обновления`; }
  else if(st==='avail'||st==='old'||st==='space'){ warn=true; title=`Доступно обновление до ${LATEST}`; }
  const html=(warn?WARN_IMG:'')+'Обновление ПО';
  b.innerHTML = html; b.title = title; b.disabled = st==='busy';
  const ban=$('pBanner');
  ban.hidden=!S.busy;
  if(S.busy) ban.innerHTML=`${SPIN}<span><b>${W().Name} перезапускается для ${S.busy.kind==='install'?'установки обновления':'возврата прошлой версии'}</b> · ${W().client?'около минуты':'около 5 минут'}. ${lnk('openRestart','Подробнее')}</span>`;
  renderHealth(); renderList();
  if(!$('menu').hidden) renderMenu();
}

/* ---------- правая панель: сервер или клиент, выбранный в списке слева ---------- */
const isClient = () => !/^VMS-/.test(S.sel);
function renderHealth(){
  const net = (S.net==='offline') ? ['нет сети','neg'] : ['OK','pos'];
  const items = isClient()
    ? [['Загрузка CPU:','1.0%','pos'],['Облако:','н/д','na'],['Сеть:','OK','pos'],['Сервера:','OK','pos'],['Скрипты:','Ошибка','neg'],['Пользователи:','OK','pos']]
    : S.busy
      ? [['Загрузка CPU:','н/д','na'],['Облако:','н/д','na'],['Диски:','н/д','na'],['Камеры:','н/д','na'],['База данных:','н/д','na'],['Сеть:','н/д','na']]
      : [['Загрузка CPU:','1.0%','pos'],['Облако:','н/д','na'],['Диски:','OK','pos'],['Камеры:','50 / 50','pos'],['База данных:','OK','pos'],['Сеть:',...net]];
  $('pHealth').innerHTML = items.map(([l,v,k])=>`<span>${l}</span><b class="${k}">${v}</b>`).join('');
}
// список слева: «подарочек» — есть что установить (как в продукте сейчас), «обновляется…» — сервер или клиент перезапускается
const GIFT='<svg class="gift" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="7" width="12" height="7.5" rx="1" fill="currentColor"/><rect x="1" y="4.5" width="14" height="3" rx="1" fill="currentColor"/><path d="M8 4.5v10" stroke="#fff" stroke-width="1.4"/><path d="M8 4.5C7 2 4.2 1.6 4.4 3.3 4.6 4.6 8 4.5 8 4.5zm0 0c1-2.5 3.8-2.9 3.6-1.2C11.4 4.6 8 4.5 8 4.5z" fill="currentColor"/></svg>';
function renderList(){
  document.querySelectorAll('#srvList [data-srv]').forEach(b=>{
    const sel=b.dataset.srv, ts=TS[sel];
    let mark='';
    if(ts) inTarget(sel,()=>{ const st=netState();
      if(st==='busy') mark=`<span class="lst busy">${SPIN}обновляется…</span>`;
      else if(st==='ready') mark=`<span class="lst" data-tip="${S.ready.target} загружено — можно устанавливать">${GIFT}</span>`;
      else if(st==='avail'||st==='old'||st==='space') mark=`<span class="lst" data-tip="Доступно обновление до ${LATEST}">${GIFT}</span>`;
      else if(st==='dl'&&S.dl.state!=='run') mark=`<span class="lst" data-tip="${S.dl.state==='paused'?'Загрузка обновления на паузе — нет связи':'Загрузка обновления не удалась'}">${GIFT}</span>`;
    });
    b.innerHTML=`<span class="lnm">${esc(sel)}</span>${mark}`;
  });
}
const qSel = (l,v) => `<div class="qrow"><span>${l}</span><div class="qf sel">${v}</div></div>`;
const qTxt = (l,v) => `<div class="qrow"><span>${l}</span><div class="qf">${v}</div></div>`;
function renderPanel(){
  $('pTitle').textContent = `Настройки - Admin - ${S.sel}`;
  document.querySelectorAll('#srvList [data-srv]').forEach(x=>x.classList.toggle('on', x.dataset.srv===S.sel));
  $('pRestart').hidden = isClient();
  $('pSetT').textContent = isClient() ? 'Настройки рабочей станции' : 'Настройки сервера';
  $('pSet').innerHTML = isClient()
    ? qSel('Автоматический вход под пользователем:','не использовать')+qSel('Оконный режим:','Полноэкранный')
      +qSel('Устройство воспроизведения звука:','по умолчанию')+qSel('Устройство аудиозахвата:','по умолчанию')
      +qSel('Допустимый период бездействия:','30 мин')+'<div class="qrow"><span>Выход из системы при бездействии:</span><span class="qchk"></span></div>'
      +qTxt('Сохранять скриншоты в:','Рабочий стол / Новая папка')+'<div class="qrow"><button type="button" class="qbtn">Обзор...</button></div>'
      +qSel('Язык:','по умолчанию')
    : qTxt('Имя сервера:',S.sel)+qSel('Язык:','Русский')
      +qTxt('Сохранять скриншоты в:','D:\\TRASSIR\\Release\\shots')+'<div class="qrow"><button type="button" class="qbtn">Обзор...</button></div>';
  renderParent();
}
function chipFor(st){
  if(st==='dl') return S.dl.state==='paused'?'<span class="chip w">Пауза — нет связи</span>':S.dl.state==='fail'?'<span class="chip w">Загрузка не удалась</span>':`<span class="chip run">Загрузка ${Math.floor(S.dl.done/S.dl.total*100)}%</span>`;
  if(st==='ready') return '<span class="chip ok">Готово к установке</span>';
  if(st==='avail'||st==='space'||st==='old') return `<span class="chip ok">Доступна ${LATEST}</span>`;
  if(st==='latest') return '<span class="chip">Последняя версия</span>';
  if(st==='offline') return '<span class="chip w">Нет доступа к сети</span>';
  if(st==='nohost') return '<span class="chip w">Сервер обновлений недоступен</span>';
  if(st==='unchecked') return '<span class="chip">Не проверялось</span>';
  if(st==='checking') return '<span class="chip">Проверяем…</span>';
  return '';
}
function renderMenu(){
  const st=netState();
  $('menu').innerHTML=`<button type="button" class="mi" role="menuitem" data-m="net">Обновление по сети${chipFor(st)}</button>
    ${S.flags.auto==='menu'?`<div class="msub">${ck('autoCheck','Проверять обновления автоматически')}</div>`:''}
    <button type="button" class="mi" role="menuitem" data-m="file">Обновление из файла…</button>
    <div class="sep"></div>
    <button type="button" class="mi" role="menuitem" data-m="changes">Список изменений</button>
    <button type="button" class="mi" role="menuitem" data-m="log">Журнал обновлений</button>`;
}
function toggleMenu(){ const m=$('menu'); m.hidden=!m.hidden; $('updBtn').setAttribute('aria-expanded',String(!m.hidden)); if(!m.hidden) renderMenu(); }
function closeMenu(){ $('menu').hidden=true; $('updBtn').setAttribute('aria-expanded','false'); }

/* ================= сценарий ================= */
function check(){ S.checking=true; S.checked=true; open('net','checking'); clearTimeout(tChk); tChk=setTimeout(()=>{ S.checking=false; if(CUR&&CUR.key==='net') open('net',netState()); else renderParent(); },1100); }
function openFile(){ if(S.dl) return open('dl',S.dl.state); S.extra=[]; S.fileSel=0; open('file',S.files); }

function startDl(src,target,total){
  // клиент обновляется из файла на этом же компьютере — передавать нечего, сразу к установке
  if(src==='file' && W().client){ S.ready={target}; open('ready'); return; }
  S.dl={src,target,total,done:0,state:'run',failed:false};
  open('dl','run'); tickDl(S.sel);
}
// окно на экране показывает именно этот элемент списка
const shown = (sel,key) => S.sel===sel && CUR && CUR.key===key;
function tickDl(sel){
  const ts=tsOf(sel); clearTimeout(ts._tDl); const d=ts.dl; if(!d||d.state!=='run'||d.frozen) return;
  ts._tDl=setTimeout(()=>{
    if(!ts.dl||ts.dl.state!=='run') return;
    d.done=Math.min(d.total, d.done + d.total/70);
    if(S.dlOut==='fail' && !d.failed && d.done>=d.total*0.6){ d.done=d.total*0.6; d.state='fail'; if(shown(sel,'dl')) open('dl','fail'); else renderParent(); return; }
    if(d.done>=d.total){ finishDl(sel); return; }
    if(shown(sel,'dl')&&CUR.st==='run') drawProgress(); else renderParent();
    tickDl(sel);
  },200);
}
function finishDl(sel){
  const wasOpen=shown(sel,'dl');
  inTarget(sel,()=>{ S.ready={target:S.dl.target}; S.dl=null; });
  if(S.restartNow && S.sel===sel) return startRestart('install');
  if(wasOpen) open('ready'); else renderParent();
}
function minimize(){ close(); }
function askCancel(){ clearTimeout(tsOf(S.sel)._tDl); S.cancelFrom=CUR.st; if(S.flags.cancel==='ask') open('dl','cancel'); else doCancel(); }
function doCancel(){ clearTimeout(tsOf(S.sel)._tDl); S.dl=null; close(); }
function resumeDl(){ S.dl.state='run'; S.dl.frozen=false; open('dl','run'); tickDl(S.sel); }
// «Оборвать связь» из панели сценариев — для всех идущих загрузок, даже если окно свёрнуто или выбран другой элемент
function dropConn(){
  Object.entries(TS).forEach(([sel,ts])=>{ if(ts.dl&&ts.dl.state==='run'){ clearTimeout(ts._tDl); ts.dl.state='paused'; if(shown(sel,'dl')) open('dl','paused'); } });
  renderParent();
}

function restartSteps(){
  const b=S.busy, c=W().client, obj=W().obj;
  if(b.kind==='rollback') return c
    ? [{t:'Закрываем клиент'},{t:`Возвращаем версию ${b.to}`},{t:`Восстанавливаем настройки из бэкапа от ${b.bkt}`},{t:'Открываем клиент и подключаемся к серверам'}]
    : [{t:'Останавливаем сервер'},{t:`Возвращаем версию ${b.to}`},{t:`Восстанавливаем настройки из бэкапа от ${b.bkt}`},{t:'Запускаем сервер и проверяем камеры'}];
  const s=[]; if(S.backup) s.push({t:`Сохраняем бэкап настроек ${W().backupWhere}`});
  s.push({t:`Устанавливаем ${b.to}`},{t:`Перезапускаем ${obj}`});
  if(b.fail) s.push({t:`${W().Obj} не запустился с новой версией`,bad:1},{t:`Возвращаем ${b.from} и настройки из бэкапа`});
  else s.push({t:c?'Открываем клиент и подключаемся к серверам':'Проверяем камеры, диски и базу данных'});
  return s;
}
function startRestart(kind){
  clearTimeout(tsOf(S.sel)._tRs);
  if(kind==='install'){ const to=S.ready.target; S.ready=null; S.busy={kind, from:S.cur, to, step:0, fail:S.outcome==='fail'}; }
  else { const r=S.log[0]; S.busy={kind, from:r.to, to:r.from, bkt:r.t, step:0}; }
  open('restart'); tickRs(S.sel);
}
function tickRs(sel){
  const ts=tsOf(sel);
  ts._tRs=setTimeout(()=>{
    const b=ts.busy; if(!b) return; b.step++;
    if(b.step>=inTarget(sel,restartSteps).length){ finishRs(sel); return; }
    if(shown(sel,'restart')) draw(); else renderParent();
    tickRs(sel);
  },1400);
}
function finishRs(sel){
  const wasOpen=shown(sel,'restart')||(S.sel===sel&&!CUR);
  const res=inTarget(sel,()=>{
    const b=S.busy; S.busy=null; const now='29.10.2026 '+new Date().toTimeString().slice(0,5), who=W().client?'ilya.safin':'admin';
    if(b.kind==='rollback'){
      S.cur=b.to; S.rbFrom=b.bkt; S.log.unshift({t:now,a:'Возврат',from:b.from,to:b.to,ok:true,who,bk:false});
      S.build=CH[S.cur]?.b||S.build; return 'rolled';
    }
    if(b.fail){
      S.failTo=b.to; S.log.unshift({t:now,a:'Обновление',from:b.from,to:b.to,ok:false,who,why:`Ошибка установки пакета (код 0x2F). ${W().Obj} автоматически вернулся на ${b.from}`});
      return 'fail';
    }
    S.cur=b.to; S.build=CH[S.cur]?.b||'1291377';
    S.log.unshift({t:now,a:'Обновление',from:b.from,to:b.to,ok:true,who,bk:S.backup});
    return 'ok';
  });
  // итог показываем, если пользователь смотрит на этот сервер или клиент; иначе он увидит его по значку в списке
  if(wasOpen) open('done',res); else renderParent();
}

/* ================= события ================= */
$('updBtn').addEventListener('click',e=>{ e.stopPropagation(); toggleMenu(); });
$('srvList').addEventListener('click',e=>{ const b=e.target.closest('[data-srv]'); if(!b) return; S.sel=b.dataset.srv; S.back=[]; S.exp={}; closeMenu(); renderPanel(); });
document.addEventListener('click',e=>{ if(!e.target.closest('.umenu-w')) closeMenu(); });
$('menu').addEventListener('click',e=>{
  if(e.target.closest('.hi')){ e.preventDefault(); return; }
  const c=e.target.closest('[data-ck]'); if(c){ S[c.dataset.ck]=!S[c.dataset.ck]; renderMenu(); return; }
  const m=e.target.closest('[data-m]'); if(!m) return; closeMenu();
  ({net:openNet, file:openFile, changes:()=>open('changes',(S.net==='offline'||S.net==='nohost')?'offline':'list'), log:()=>open('log','table')})[m.dataset.m]();
});
const ACT = {
  changes:()=>open('changes',(S.net==='offline'||S.net==='nohost')?'offline':'list'),
  log:()=>openSub('log','table'), file:()=>openFile(), net:()=>openNet(),
  more:()=>{ S.moreCh+=10; draw(); }, noop:()=>{},
  browse:()=>{ const p=PICKS[S.pickN%PICKS.length]; S.pickN++; S.extra=[p]; S.fileSel=0; open('file','found'); },
  callme:()=>{ S.called=true; draw(); },
  rollback:()=>openSub('log','confirm'),
  exp:a=>{ S.exp[a.dataset.k]=!S.exp[a.dataset.k]; draw(); },
  export:()=>{ S.exported=true; draw(); },
  toArchive:()=>{ S.net='avail'; $('sNet').value='avail'; open('net','avail'); },
  recheck:()=>check(),
  openRestart:()=>open('restart')
};
$('dlgBg').addEventListener('click',e=>{
  const t=e.target;
  if(t.closest('.hi')){ e.preventDefault(); return; }
  const b=t.closest('[data-b]'); if(b&&!b.disabled){ BTNS[+b.dataset.b].act(); return; }
  if(t.closest('[data-x]')){ ONX(); return; }
  const c=t.closest('[data-ck]'); if(c){ S[c.dataset.ck]=!S[c.dataset.ck]; e.preventDefault(); draw(); return; }
  const f=t.closest('[data-fsel]'); if(f){ S.fileSel=+f.dataset.fsel; draw(); return; }
  const a=t.closest('[data-act]'); if(a&&ACT[a.dataset.act]){ e.preventDefault(); ACT[a.dataset.act](a); }
});
$('pBanner').addEventListener('click',e=>{ const a=e.target.closest('[data-act]'); if(a) ACT[a.dataset.act](); });
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){ if(!$('menu').hidden) closeMenu(); else if(CUR && !$('dlgBg').querySelector('[data-x]:disabled')) ONX(); }
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('a.lnk[data-act]')){ e.preventDefault(); e.target.click(); }
});

/* ---------- перемещение и изменение размера окон ----------
   Тянуть за заголовок — переместить, за края и углы — изменить размер, двойной клик по заголовку — развернуть на всю сцену.
   Положение хранится в PW (окно «Настройки») и DW (окно обновления; DW сбрасывается, когда окно закрыто). */
const PW={}, DW={}, PW_MIN={w:760,h:480}, DLG_MIN={w:420,h:200};
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
  const x0=e.clientX, y0=e.clientY, el=e.currentTarget, c=el.closest('.upw,.uw').parentElement.getBoundingClientRect();
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
    track(e,(dx,dy,c)=>{ g.x=clamp(sx+dx, 80-w, c.width-80); g.y=clamp(sy+dy, 0, c.height-30); applyGeom(el,g); }); // заголовок всегда остаётся на сцене
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
document.querySelector('#pw .wbtn[aria-label="Развернуть"]').addEventListener('click',()=>toggleMax($('pw'),PW));
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
const SEL = {sNet:'net', sFiles:'files', sDl:'dlOut', sOut:'outcome'};
Object.entries(SEL).forEach(([id,k])=>$(id).addEventListener('change',e=>{ S[k]=e.target.value; if(k==='net') reset(); }));
[['fAuto','auto'],['fMin','min'],['fCancel','cancel'],['fHelp','help']].forEach(([id,k])=>$(id).addEventListener('change',e=>{ S.flags[k]=e.target.value; if(k==='auto'&&S.flags.auto==='off') { S.autoCheck=true; S.checked=true; } if(CUR) draw(); else renderParent(); }));
$('sReset').addEventListener('click',reset);
$('sDrop').addEventListener('click',dropConn);
$('scnTog').addEventListener('click',()=>{ const b=$('scnBody'); b.hidden=!b.hidden; $('scnTog').setAttribute('aria-expanded',String(!b.hidden)); });
$('galHide').addEventListener('click',()=>{ document.body.classList.remove('gal-on'); $('galShow').hidden=false; });
$('galShow').addEventListener('click',()=>{ document.body.classList.add('gal-on'); $('galShow').hidden=true; });
setInterval(()=>{ $('sDrop').disabled=!Object.values(TS).some(t=>t.dl&&t.dl.state==='run'); },300);

/* ================= раскадровка ================= */
function scen(net,extra){ S.net=net; $('sNet').value=net; S.files='found'; $('sFiles').value='found'; S.dlOut='ok'; $('sDl').value='ok'; S.outcome='ok'; $('sOut').value='ok'; reset(); if(extra) extra(); }
function frozenDl(src,pct,state){ const total=W().size; S.dl={src,target:LATEST,total,done:total*pct,state,frozen:true}; }
// то же для клиента: выбрать «Клиент» в списке слева
function toClient(){ S.sel=CLIENT; renderPanel(); }
const GAL = [
  {g:'Меню «Обновление ПО»', items:[
    {t:'Доступно обновление', s:'Значок ⚠ на кнопке, «Доступна 4.9.15.0»', run:()=>{ scen('avail'); toggleMenu(); }},
    {t:'Последняя версия', s:'Кнопка без значка', run:()=>{ scen('latest'); toggleMenu(); }},
    {t:'Нет доступа к сети', s:'Проверить актуальность нельзя', run:()=>{ scen('offline'); toggleMenu(); }},
    {t:'Идёт загрузка', s:'Проценты в меню, кнопка без изменений', run:()=>{ scen('avail',()=>frozenDl('net',.42,'run')); toggleMenu(); }}]},
  {g:'A. Обновление по сети', items:[
    {t:'Доступно обновление', s:'Версия, изменения, бэкап, перезапуск', run:()=>{ scen('avail'); openNet(); }},
    {t:'Проверка обновлений', s:'Короткое ожидание ответа сервера', run:()=>{ scen('avail'); S.checking=true; open('net','checking'); }},
    {t:'Автопроверка выключена', s:'Заказчики без запросов наружу', run:()=>{ scen('avail',()=>{ S.checked=false; }); open('net','unchecked'); }},
    {t:'Установлена последняя версия', s:'', run:()=>{ scen('latest'); openNet(); }},
    {t:'Нет доступа к сети', s:'Восстановить связь или обновиться из файла', run:()=>{ scen('offline'); openNet(); }},
    {t:'Сервер обновлений недоступен', s:'Could not resolve host — шлюз и DNS', run:()=>{ scen('nohost'); openNet(); }},
    {t:'Версия слишком старая', s:'По шагам или переустановка', run:()=>{ scen('old'); openNet(); }},
    {t:'Не хватает места', s:'Проверяем до загрузки', run:()=>{ scen('space'); openNet(); }}]},
  {g:'B. Обновление из файла', items:[
    {t:'Найдены файлы', s:'Рекомендованный отмечен, неподходящие — с причиной', run:()=>{ scen('avail'); openFile(); }},
    {t:'Неподходящий файл', s:'Для другой программы', run:()=>{ scen('avail'); openFile(); S.fileSel=3; draw(); }},
    {t:'Не файл обновления', s:'File format unrecognized', run:()=>{ scen('avail'); openFile(); S.pickN=0; ACT.browse(); }},
    {t:'Файл повреждён', s:'Signature check failed', run:()=>{ scen('avail'); openFile(); S.pickN=1; ACT.browse(); }},
    {t:'Версия старше установленной', s:'Service pack already installed', run:()=>{ scen('avail'); openFile(); S.pickN=2; ACT.browse(); }},
    {t:'Файлов не нашлось', s:'Где скачать и куда положить', run:()=>{ scen('avail'); S.files='none'; $('sFiles').value='none'; openFile(); }}]},
  {g:'C. Загрузка', items:[
    {t:'Загрузка по сети', s:'Прогресс, объём, время', run:()=>{ scen('avail',()=>frozenDl('net',.42,'run')); open('dl','run'); }},
    {t:'Передача файла на сервер', s:'С компьютера на регистратор', run:()=>{ scen('avail',()=>frozenDl('file',.18,'run')); open('dl','run'); }},
    {t:'Окно свёрнуто', s:'Работа продолжается, прогресс — в меню', run:()=>{ scen('avail',()=>frozenDl('net',.42,'run')); renderParent(); }},
    {t:'Связь прервалась', s:'Продолжим с места остановки', run:()=>{ scen('avail',()=>frozenDl('net',.42,'paused')); open('dl','paused'); }},
    {t:'Отменить загрузку?', s:'Оставить загруженную часть', run:()=>{ scen('avail',()=>frozenDl('net',.42,'run')); S.cancelFrom='run'; open('dl','cancel'); }},
    {t:'Загрузка не удалась', s:'Повторить или обновиться из файла', run:()=>{ scen('avail',()=>frozenDl('net',.6,'fail')); open('dl','fail'); }}]},
  {g:'D. Установка', items:[
    {t:'Готово к установке', s:'Перезапустить сейчас или позже', run:()=>{ scen('avail',()=>{ S.ready={target:LATEST}; }); open('ready'); }},
    {t:'Сервер перезапускается', s:'Статус и шаги установки', run:()=>{ scen('avail',()=>{ S.busy={kind:'install',from:S.cur,to:LATEST,step:1}; }); open('restart'); }},
    {t:'Обновление установлено', s:'Что нового и возврат прошлой версии', run:()=>{ scen('avail',()=>{ S.cur=LATEST; S.build=CH[LATEST].b; S.log.unshift({t:'29.10.2026 14:41',a:'Обновление',from:'4.9.13.0',to:LATEST,ok:true,who:'admin',bk:true}); }); open('done','ok'); }},
    {t:'Не установилось', s:'Сервер сам вернул прошлую версию', run:()=>{ scen('avail',()=>{ S.failTo=LATEST; S.log.unshift({t:'29.10.2026 14:41',a:'Обновление',from:'4.9.13.0',to:LATEST,ok:false,who:'admin',why:'Ошибка установки пакета (код 0x2F). Сервер автоматически вернулся на 4.9.13.0'}); }); open('done','fail'); }},
    {t:'Прошлая версия возвращена', s:'После отката из журнала', run:()=>{ scen('avail',()=>{ S.rbFrom='21.10.2026 10:02'; }); open('done','rolled'); }}]},
  {g:'E. Список изменений', items:[
    {t:'Изменения с текущей версии', s:'Установлена и доступные', run:()=>{ scen('avail'); open('changes','list'); }},
    {t:'Нет сети', s:'Куда посмотреть', run:()=>{ scen('offline'); open('changes','offline'); }}]},
  {g:'F. Журнал обновлений', items:[
    {t:'Журнал', s:'Статус, пользователь, возврат', run:()=>{ scen('avail'); open('log','table'); }},
    {t:'Вернуть прошлую версию?', s:'Подтверждение', run:()=>{ scen('avail'); open('log','confirm'); }}]},
  {g:'G. Список слева', items:[
    {t:'Обновление доступно', s:'«Подарочек» у сервера и клиента', run:()=>{ scen('avail'); }},
    {t:'Сервер обновляется', s:'Статус в списке, плашка в панели', run:()=>{ scen('avail',()=>{ S.busy={kind:'install',from:S.cur,to:LATEST,step:1}; }); renderPanel(); }}]},
  {g:'H. Обновление клиента', items:[
    {t:'Меню клиента', s:'Своя версия и статус', run:()=>{ scen('avail'); toClient(); toggleMenu(); }},
    {t:'Доступно обновление', s:'Без перезапуска сервера и архива', run:()=>{ scen('avail'); toClient(); openNet(); }},
    {t:'Из файла', s:'Файлы для клиента, серверный не подходит', run:()=>{ scen('avail'); toClient(); openFile(); }},
    {t:'Готово к установке', s:'Клиент закроется примерно на минуту', run:()=>{ scen('avail'); toClient(); S.ready={target:LATEST}; open('ready'); }},
    {t:'Клиент перезапускается', s:'Шаги установки', run:()=>{ scen('avail'); toClient(); S.busy={kind:'install',from:S.cur,to:LATEST,step:2}; open('restart'); }},
    {t:'Обновление установлено', s:'Возврат прошлой версии', run:()=>{ scen('avail'); toClient(); S.cur=LATEST; S.build=CH[LATEST].b; S.log.unshift({t:'29.10.2026 14:41',a:'Обновление',from:'4.9.13.0',to:LATEST,ok:true,who:'ilya.safin',bk:true}); open('done','ok'); }}]}
];
$('galList').innerHTML = GAL.map((g,gi)=>`<div class="ugal-g">${g.g}</div>`+g.items.map((it,ii)=>`<button type="button" class="ugal-i" data-gal="${gi}.${ii}">${it.t}${it.s?`<span>${it.s}</span>`:''}</button>`).join('')).join('');
$('galList').addEventListener('click',e=>{
  const b=e.target.closest('[data-gal]'); if(!b) return; e.stopPropagation();
  const [gi,ii]=b.dataset.gal.split('.').map(Number);
  document.querySelectorAll('.ugal-i.sel').forEach(x=>x.classList.remove('sel')); b.classList.add('sel');
  closeMenu(); GAL[gi].items[ii].run();
});

reset();
