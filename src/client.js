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
const CHEV='<svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 3.5l3 3 3-3" stroke="#333" fill="none"/></svg>';
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
const FILES = [
  {n:'Trassir-4.9.15.0-1321840-64-Release-sp.pack', v:'4.9.15.0', mb:1300, where:'Загрузки', ok:true, tag:'Рекомендуем: последняя версия'},
  {n:'Trassir (1).pack', v:'4.9.15.0', mb:1300, where:'Рабочий стол', ok:true, tag:'Имя изменено — версию определили по содержимому файла'},
  {n:'Trassir-4.9.14.0-1319665-64-Release-sp.pack', v:'4.9.14.0', mb:1290, where:'Загрузки', ok:true, tag:'Подходит, но есть версия новее'},
  {n:'Trassir-4.9.15.0-1321840-64-Release-client-sp.pack', mb:693, where:'Загрузки', err:'Не подходит: обновление для TRASSIR Client, а это сервер'},
  {n:'Trassir-4.9.15.0-1321844-LITE', mb:2300, where:'USB-накопитель (E:)', err:'Не подходит: для регистраторов MiniNVR на TRASSIR OS'}
];
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

/* ---------- состояние ---------- */
const S = {
  net:'avail', files:'found', dlOut:'ok', outcome:'ok',
  flags:{auto:'dialog', min:'yes', cancel:'ask', help:'errors'},
  autoCheck:true, backup:true, restartNow:false, keepPart:true
};
let CUR=null, BTNS=[], ONX=null, tDl=null, tRs=null, tChk=null, galSel=null;

function baseLog(){
  const l=[
    {t:'21.10.2026 10:02', a:'Обновление', from:'4.9.11.0', to:'4.9.13.0', ok:true, who:'admin', bk:true},
    {t:'20.10.2026 18:47', a:'Обновление', from:'4.9.11.0', to:'4.9.13.0', ok:false, who:'admin', why:'Файл повреждён — не прошёл проверку подписи. Сервер остался на 4.9.11.0'},
    {t:'02.09.2026 09:15', a:'Обновление', from:'4.9.10.0', to:'4.9.11.0', ok:true, who:'i.petrov', bk:true},
    {t:'12.08.2026 22:05', a:'Обновление', from:'4.9.9.0', to:'4.9.10.0', ok:true, who:'admin', bk:true},
    {t:'22.11.2024 22:34', a:'Установка', to:'4.5.26.0', ok:true, who:'—'}
  ];
  if(S.net==='latest') l.unshift({t:'28.10.2026 23:10', a:'Обновление', from:'4.9.13.0', to:LATEST, ok:true, who:'admin', bk:true});
  if(S.net==='old') return [{t:'05.03.2025 12:40', a:'Обновление', from:'4.6.8.0', to:'4.6.9.0', ok:true, who:'admin', bk:false},{t:'22.11.2024 22:34', a:'Установка', to:'4.5.26.0', ok:true, who:'—'}];
  return l;
}
function reset(){
  clearTimeout(tDl); clearTimeout(tRs); clearTimeout(tChk);
  Object.assign(S, {
    cur: S.net==='latest'?LATEST : S.net==='old'?'4.6.9.0' : '4.9.13.0',
    checked: S.autoCheck || S.flags.auto==='off', checking:false,
    dl:null, ready:null, busy:null, extra:[], fileSel:0, moreCh:0, called:false, pickN:0, cancelFrom:null, exported:false
  });
  S.build = CH[S.cur]?.b || '1268000';
  S.log = baseLog();
  CUR=null; draw();
}

/* ---------- помощники разметки ---------- */
const ICO = k => ICON[k==='ok'?'ok':k==='warn'?'warn':k==='err'?'err':'info'];
const sh = (k,title,text) => `<div class="sh">${ICO(k)}<div><b>${title}</b>${text?`<p>${text}</p>`:''}</div></div>`;
const box = (k,html) => `<div class="ubox ${k}">${html}</div>`;
const ck = (key,label,sub) => `<label class="ck"><button type="button" class="cb" role="checkbox" aria-checked="${!!S[key]}" data-ck="${key}">${ICON.check}</button><span>${label}${sub?`<small>${sub}</small>`:''}</span></label>`;
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
const autoRow = () => S.flags.auto==='dialog' ? ck('autoCheck','Проверять обновления автоматически') : '';
const opts = () => `<div class="opts">${ck('backup','Сохранить бэкап настроек','Перед установкой — на архивный диск. Если после обновления что-то пойдёт не так, к нему можно вернуться')}
  ${S.backup?'':`<p class="fine" style="color:var(--warn);margin:-2px 0 0 22px">Без бэкапа вернуться к ${S.cur} не получится — только переустановкой.</p>`}
  ${ck('restartNow','Перезапустить сервер и установить сразу после загрузки','Сервер будет недоступен около 5 минут, запись архива на это время остановится')}</div>`;

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
      body:sh('info','Автоматическая проверка выключена',`${SRV} не обращается к серверу обновлений сам. Проверьте вручную, когда удобно.`),
      btns:[{t:'Закрыть',act:close},{t:'Проверить сейчас',pri:1,act:check}]};
    if(st==='latest') return {t:T, left:autoRow(),
      body:sh('ok',`Установлена последняя версия ${S.cur}`,'Проверено сегодня в 14:32.')+`<div>${lnk('changes','Что нового в этой версии')}</div>`,
      btns:[{t:'Проверить снова',act:check},{t:'Закрыть',pri:1,act:close}]};
    if(st==='offline') return {t:T, left:autoRow(),
      body:sh('err','Нет доступа к сети',`${SRV} не подключён к интернету, поэтому проверить обновления нельзя.`)
        +`<div><div class="sec-h">Что можно сделать</div><ol class="recs">
          <li><b>Восстановить подключение.</b> Проверьте кабель и настройки в «Настройки сервера» → «Сетевые интерфейсы»: адрес, шлюз и DNS. Затем нажмите «Проверить снова».</li>
          <li><b>Обновить из файла.</b> Скачайте файл обновления на любом компьютере с интернетом — страница загрузок подберёт нужный по версии — и загрузите его сюда. ${site()}</li></ol></div>`+help(true),
      btns:[{t:'Проверить снова',act:check},{t:'Обновить из файла',pri:1,act:()=>openFile()}]};
    if(st==='nohost') return {t:T, left:autoRow(),
      body:sh('err','Не удаётся связаться с сервером обновлений',`Интернет есть, но ${SRV} не находит адрес updates.cloud.trassir.com — обычно не указан шлюз или DNS.`)
        +`<div><div class="sec-h">Как исправить</div><ol class="recs">
          <li>Откройте «Настройки сервера» → «Сетевые интерфейсы».</li>
          <li>У интерфейса с доступом в интернет нажмите «Настроить» и заполните поля «Шлюз» и «DNS». Подойдут публичные DNS Яндекса <b>77.88.8.8</b> и <b>77.88.8.1</b>, за пределами России — Google <b>8.8.8.8</b>.</li>
          <li>Если не знаете адрес шлюза — уточните у системного администратора.</li></ol></div>`
        +`<p class="fine">Пока доступа нет, можно ${lnk('file','обновиться из файла')}.</p>`+help(true),
      btns:[{t:'Закрыть',act:close},{t:'Проверить снова',pri:1,act:check}]};
    if(st==='old'){
      const ch=chainFrom(S.cur);
      return {t:T, left:autoRow(),
        body:sh('warn',`Сразу до ${LATEST} обновиться нельзя`,`Установлена ${S.cur}. Обновлять нужно по порядку: ${ch.length} шага, по одной ветке за раз.`)
          +`<div class="ways">
            <div class="way rec"><b>Обновить по шагам</b><span class="fine">Можно удалённо, настройки и архив сохранятся</span>
              <ol>${ch.map((v,i)=>`<li>${i===0?`<b>${v}</b> — сейчас`:v}</li>`).join('')}</ol>
              <span class="fine">После каждого шага сервер перезапустится. Снова откройте «Обновление по сети» — предложим следующий.</span>
              ${br(ch[0])==='4.7'?`<span class="fine" style="color:var(--warn)">На 4.7 меняется формат базы данных — <a class="lnk" href="#" onclick="return false">прочитайте инструкцию</a>.</span>`:''}</div>
            <div class="way"><b>Переустановить ПО</b><span class="fine">Сразу ${LATEST} одним шагом. Нужен доступ к компьютеру, на котором стоит сервер</span>
              ${site('Скачать установщик на сайте ↗')}</div></div>`+opts(),
        btns:[{t:'Отмена',act:close},{t:`Загрузить шаг 1 — ${ch[0]}`,pri:1,act:()=>startDl('net',ch[0],SIZE_NET)}]};
    }
    // avail / space
    const list=changesSince(S.cur);
    const space = st==='space' ? box('err',`<b>Не хватает места на системном диске</b><span>Для загрузки и установки нужно 2,6 ГБ, свободно 1,1 ГБ. Проверили до загрузки, чтобы она не оборвалась на середине.</span>
      <ol class="recs"><li>Удалите старые скриншоты и экспортированные видео: «Настройки сервера» → «Скриншоты».</li><li>Или загрузите обновление на архивный диск — места там достаточно.</li></ol>
      <div class="row"><button type="button" class="btn" data-act="toArchive">Загружать на архивный диск</button><button type="button" class="btn" data-act="recheck">Проверить снова</button></div>`) : '';
    return {t:T, left:autoRow(),
      body:sh('info',`Доступно обновление до ${LATEST}`,`Установлена ${S.cur} · загрузка ${mb(SIZE_NET)}`)
        +`<div><div class="sec-h">Что изменилось</div>${ul(CH[LATEST].items)}<div style="margin-top:6px">${lnk('changes',`Полный список изменений — ${list.length} ${list.length===1?'версия':'версии'} после ${S.cur}`)}</div></div>`
        +space+opts()+(S.flags.min==='yes'?'<p class="fine">Загрузка идёт в фоне — с TRASSIR можно работать как обычно.</p>':''),
      btns:[{t:'Отмена',act:close},{t:'Загрузить обновление',pri:1,dis:st==='space',act:()=>startDl('net',LATEST,SIZE_NET)}]};
  },

  file(st){
    const T='Обновление из файла';
    if(st==='none') return {t:T,
      body:sh('info','Не нашли файлы обновления','Искали в папках «Загрузки» и «Рабочий стол» на этом компьютере и на подключённых флешках.')
        +`<ol class="recs"><li>Скачайте файл на странице загрузок — она подберёт нужный по вашей версии ${S.cur}. ${site()}</li>
          <li>Положите файл в «Загрузки» или на флешку и нажмите «Искать снова».</li></ol>
          <p>Файл в другом месте? ${lnk('browse','Укажите его вручную')}.</p>`
        +(S.net==='avail'||S.net==='space'?box('info',`<div class="row"><span>У ${SRV} есть интернет — обновиться можно без файла.</span><button type="button" class="btn" data-act="net">Обновление по сети</button></div>`):''),
      btns:[{t:'Отмена',act:close},{t:'Искать снова',pri:1,act:()=>{ S.files='found'; $('sFiles').value='found'; open('file','found'); }}]};
    const all=[...S.extra,...FILES], f=all[S.fileSel]||all[0];
    const rows=all.map((x,i)=>`<button type="button" class="frow${i===S.fileSel?' on':''}${x.err?' bad':''}" data-fsel="${i}" role="radio" aria-checked="${i===S.fileSel}">
        <span class="rd"></span><span><span class="fn">${esc(x.n)}</span><br><span class="fm">${x.where}${x.v?' · версия '+x.v:''}</span><br>${x.err?`<span class="fe">${x.err}</span>`:`<span class="fo">${x.tag}</span>`}</span><span class="sz">${mb(x.mb)}</span></button>`).join('');
    let detail='';
    if(f.err && f.kind) detail=box('err',`<b>${f.err}</b><ol class="recs">${PICK_RECS[f.kind].map(r=>`<li>${r}</li>`).join('')}</ol>${f.kind==='older'?`<div>${lnk('log','Открыть журнал обновлений')}</div>`:''}${f.kind!=='older'?`<div>${site('Скачать файл заново ↗')}</div>`:''}`);
    else if(f.err) detail=box('warn',`<span>${f.err}. Выберите файл с отметкой «Рекомендуем» или ${site('скачайте нужный ↗')}</span>`);
    else detail=`<div class="flow"><span>Установлена <b>${S.cur}</b></span>${ARROW}<span>будет <b>${f.v}</b></span></div>`
      +(newer(LATEST,f.v)?box('warn',`<span>Есть версия новее — ${LATEST}. Её файл тоже в списке.</span>`):'')+opts();
    return {t:T,
      body:`<div class="fsrc"><span>Нашли ${FILES.filter(x=>x.ok).length} подходящих файла на этом компьютере и флешке</span><button type="button" class="btn sm" data-act="browse">Обзор…</button></div>
        <div class="files" role="radiogroup" aria-label="Файлы обновления">${rows}</div>`+detail,
      btns:[{t:'Отмена',act:close},{t:'Загрузить обновление',pri:1,dis:!!f.err,act:()=>startDl('file',f.v,f.mb)}]};
  },

  dl(st){
    const d=S.dl, pct=Math.floor(d.done/d.total*100);
    const T=d.src==='net'?'Загрузка обновления':'Передача файла на сервер';
    const head=`<div class="dlh"><span style="color:var(--txt)">${d.src==='net'?'Загружаем':'Передаём'} ${d.target}</span><span>${pct}%</span></div>`;
    const bar=k=>`<div class="pbar ${k||''}"><i style="width:${pct}%"></i></div>`;
    if(st==='paused') return {t:T, x:minimize,
      body:sh('warn','Связь с сервером прервалась',`Загружено ${mb(d.done)} из ${mb(d.total)} — эта часть сохранится. Как только связь восстановится, загрузка продолжится с того же места.`)+bar('paused')
        +`<p class="fine">Повторяем попытку каждые 30 секунд.</p>`,
      btns:[{t:'Отменить загрузку',act:askCancel},{t:'Повторить сейчас',pri:1,act:resumeDl}]};
    if(st==='cancel') return {t:T, x:()=>open('dl',S.cancelFrom||'run'),
      body:sh('warn','Отменить загрузку?',`Загружено ${mb(d.done)} из ${mb(d.total)}.`)
        +`<div class="opts" style="border:0;padding:0">${ck('keepPart','Сохранить загруженную часть на 7 дней','Если начнёте загрузку снова, она продолжится с этого места. Потом файл удалится сам')}</div>`,
      btns:[{t:'Продолжить загрузку',act:()=>{ S.dl.frozen=false; open('dl',S.cancelFrom||'run'); if(S.cancelFrom!=='paused') tickDl(); }},{t:'Отменить загрузку',pri:1,act:doCancel}]};
    if(st==='fail') return {t:T,
      body:sh('err','Загрузка обновления не удалась',`Связь с сервером обновлений обрывалась слишком часто. Загружено ${mb(d.done)} из ${mb(d.total)} — эта часть сохранена, повторная загрузка продолжится с неё.`)+bar('fail')
        +`<ol class="recs"><li>Проверьте подключение ${SRV} к интернету и попробуйте ещё раз.</li><li>Если канал медленный или нестабильный, скачайте файл на другом компьютере и обновитесь из файла.</li></ol>`+help(true),
      btns:[{t:'Обновить из файла',act:()=>{ S.dl=null; openFile(); }},{t:'Повторить загрузку',pri:1,act:()=>{ S.dl.state='run'; S.dl.failed=true; S.dl.frozen=false; open('dl','run'); tickDl(); }}]};
    const remain=d.total-d.done;
    return {t:T, x:S.flags.min==='yes'?minimize:null,
      body:head+bar()+`<div class="dlm"><span>${mb(d.done)} из ${mb(d.total)}</span><span>Осталось ${left(remain)}</span></div>`
        +`<p>${d.src==='net'?'Скачиваем с сервера обновлений TRASSIR.':`Передаём файл с этого компьютера на ${SRV}.`} ${S.restartNow?'Сразу после загрузки сервер перезапустится и установит обновление.':'После загрузки предложим перезапустить сервер.'}</p>`
        +(S.flags.min==='yes'?'<p class="fine">Окно можно закрыть и продолжать работать — прогресс виден на кнопке «Обновление ПО».</p>':''),
      btns:[...(S.flags.min==='yes'?[{t:'Свернуть',act:minimize}]:[]),{t:'Отменить загрузку',act:askCancel}]};
  },

  ready(){
    const v=S.ready.target;
    return {t:'Обновление загружено',
      body:sh('ok',`${v} готово к установке`,`Файл загружен на ${SRV}.`)
        +box('info',`<ol class="recs" style="padding-left:16px"><li>Сервер перезапустится и будет недоступен около 5 минут. Запись архива на это время остановится.</li>
          ${S.backup?`<li>Перед установкой сохраним бэкап настроек на архивный диск.</li><li>Если после обновления что-то пойдёт не так, вернуть ${S.cur} можно будет из журнала обновлений.</li>`:`<li>Бэкап настроек не сохранится — вернуть ${S.cur} после обновления не получится.</li>`}</ol>`),
      btns:[{t:'Позже',act:close},{t:'Перезапустить сервер и установить',pri:1,act:()=>startRestart('install')}]};
  },

  restart(){
    const b=S.busy, steps=restartSteps();
    const T=b.kind==='install'?'Установка обновления':'Возврат прошлой версии';
    return {t:T,
      body:`<div class="sh">${ICON.spin}<div><b>${b.kind==='install'?`Устанавливаем ${b.to}`:`Возвращаем ${b.to}`}</b><p>${SRV} перезапускается и сейчас недоступен — это нормально. Займёт около 5 минут, окно можно закрыть.</p></div></div>
        <ol class="steps">${steps.map((s,i)=>`<li class="${i<b.step?(s.bad?'bad':'done'):i===b.step?'now':''}"><span class="st"></span><span>${s.t}</span></li>`).join('')}</ol>`,
      btns:[{t:'Закрыть',act:close}]};
  },

  done(st){
    if(st==='rolled') return {t:'Прошлая версия возвращена',
      body:sh('ok',`${SRV} снова на версии ${S.cur}`,`Настройки восстановлены из бэкапа от ${S.rbFrom}. Сервер работает, камеры: 50 из 50.`)
        +`<p class="fine">Изменения настроек, сделанные после обновления, не сохранились. Обновиться снова можно в любой момент.</p>`+help(false),
      btns:[{t:'Журнал обновлений',act:()=>open('log','table')},{t:'Готово',pri:1,act:close}]};
    if(st==='fail') return {t:'Обновление не установилось',
      body:sh('err',`${S.failTo} не установилась — сервер вернулся на ${S.cur}`,'Сервер не запустился с новой версией, поэтому мы автоматически вернули прошлую и восстановили настройки из бэкапа. Сервер работает как раньше.')
        +box('err',`<span><b>Причина:</b> ошибка при установке пакета (код 0x2F). Подробности сохранены в журнале обновлений — их увидит техподдержка.</span>`)
        +`<div><div class="sec-h">Что можно сделать</div><ol class="recs"><li>Попробуйте обновиться ещё раз — иногда помогает повторная загрузка файла.</li><li>Переустановите ПО: ${site('скачать установщик на сайте ↗')}</li><li>Обратитесь в техподдержку и назовите время обновления — детали уже есть в журнале.</li></ol></div>`+help(true),
      btns:[{t:'Журнал обновлений',act:()=>open('log','table')},{t:'Закрыть',pri:1,act:close}]};
    const last=S.log[0];
    return {t:'Обновление установлено',
      body:sh('ok',`Установлена версия ${S.cur}`,`${SRV} работает. Камеры: 50 из 50, диски и база данных в порядке.`)
        +(CH[S.cur]?`<div><div class="sec-h">Что нового</div>${ul(CH[S.cur].items)}</div>`:'')
        +(newer(LATEST,S.cur)?box('info',`<span>Это шаг ${chainFrom(last.from).indexOf(S.cur)+1} из ${chainFrom(last.from).length}. Чтобы продолжить, снова откройте «Обновление по сети».</span>`):'')
        +(last.bk?box('info',`<b>Если что-то работает не так</b><span>Например, пропала камера или не запускается модуль. Можно вернуть версию ${last.from} и настройки на момент обновления — бэкап от ${last.t}.</span><div class="row"><button type="button" class="btn" data-act="rollback">Вернуть ${last.from}</button></div>`)
                 :box('warn',`<span>Бэкап перед обновлением не сохранялся — вернуть ${last.from} можно будет только переустановкой.</span>`))
        +help(false),
      btns:[{t:'Журнал обновлений',act:()=>open('log','table')},{t:'Готово',pri:1,act:close}]};
  },

  changes(st){
    const T='Список изменений';
    if(st==='offline') return {t:T,
      body:sh('warn','Список изменений недоступен без интернета',`Он загружается с сервера обновлений, а ${SRV} сейчас не подключён к сети.`)
        +`<p>Восстановите подключение или посмотрите изменения на сайте: ${site('Список изменений на dssl.ru ↗')}</p>`,
      btns:[{t:'Закрыть',pri:1,act:close}]};
    let idx=VERS.indexOf(S.cur); if(idx<0) idx=VERS.length-1;
    const shown = VERS.slice(0, idx+1+S.moreCh);
    const rest = VERS.length - shown.length;
    return {t:T, wide:1,
      body:`<div class="vlist">${shown.map(v=>{
        const tag = v===S.cur?'<span class="chip">Установлена</span>' : newer(v,S.cur)?`<span class="chip ok">Доступна</span>`:'';
        return `<div><div class="ver-h"><b>${v}</b><small>${CH[v].d}</small>${tag}</div>${ul(CH[v].items)}</div>`; }).join('')}</div>`
        +`<div>${rest>0?lnk('more',`Показать более ранние версии`):`<span class="fine">Изменения в версиях до 4.9.10.0 — ${site('на сайте ↗')}</span>`}</div>`,
      btns:[...(newer(LATEST,S.cur)&&!S.dl&&!S.ready&&S.checked?[{t:`Обновить до ${LATEST}`,act:()=>openNet()}]:[]),{t:'Закрыть',pri:1,act:close}]};
  },

  log(st){
    if(st==='confirm'){ const r=S.log[0];
      return {t:'Вернуть прошлую версию',
        body:sh('warn',`Вернуть версию ${r.from}?`,`Сейчас установлена ${r.to}.`)
          +`<ol class="recs"><li>Сервер перезапустится и будет недоступен около 5 минут.</li><li>Настройки восстановятся из бэкапа от ${r.t}.</li><li>Изменения настроек после этой даты пропадут. Архив сохранится.</li></ol>`,
        btns:[{t:'Отмена',act:()=>open('log','table')},{t:`Вернуть ${r.from}`,pri:1,act:()=>startRestart('rollback')}]};
    }
    const canRb = r => r===S.log[0] && r.ok && r.bk && r.a==='Обновление' && !S.busy;
    return {t:'Журнал обновлений', wide:1,
      left:`<button type="button" class="btn" data-act="export">${S.exported?'Сохранено в «Загрузки» ✓':'Сохранить для техподдержки'}</button>`,
      body:`<table class="ulog"><thead><tr><th>Дата и время</th><th>Действие</th><th>Версия</th><th>Результат</th><th>Пользователь</th><th></th></tr></thead><tbody>
        ${S.log.map(r=>`<tr><td class="v">${r.t}</td><td>${r.a}</td><td class="v">${r.from?`${r.from} → ${r.to}`:r.to}</td>
          <td><span class="res">${r.ok?ICON.ok:ICON.err}<span>${r.ok?'Успешно':'Ошибка'}${r.why?`<span class="why">${r.why}</span>`:''}${r.ok&&r.bk===false&&r.a!=='Установка'?'<span class="why">Без бэкапа</span>':''}</span></span></td>
          <td>${r.who}</td><td>${canRb(r)?`<button type="button" class="btn" data-act="rollback">Вернуть ${r.from}</button>`:''}</td></tr>`).join('')}
        </tbody></table><p class="more">Показаны последние ${S.log.length} записей. ${lnk('noop','Показать все')}</p>`,
      btns:[{t:'Закрыть',pri:1,act:close}]};
  }
};

/* ================= отрисовка ================= */
function open(key,st){ CUR={key,st}; closeMenu(); draw(); }
function close(){ CUR=null; draw(); }
function draw(){
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

function renderParent(){
  $('pVer').textContent = S.busy ? '—' : S.cur;
  $('pBuild').textContent = S.busy ? '—' : S.build;
  const st=netState(), b=$('updBtn');
  let html='Обновление ПО', hot=false;
  if(st==='dl'){ const p=Math.floor(S.dl.done/S.dl.total*100); html=S.dl.state==='paused'?'Обновление ПО · пауза':S.dl.state==='fail'?'Обновление ПО · ошибка':`Обновление ПО · ${p}% <span class="mini"><i style="width:${p}%"></i></span>`; hot=S.dl.state!=='run'; }
  else if(st==='ready'){ html='<span class="dot"></span>Установить обновление'; hot=true; }
  else if(st==='busy'){ html='Сервер обновляется…'; }
  else if(st==='avail'||st==='old'||st==='space'){ html='<span class="dot"></span>Обновление ПО'; hot=true; }
  b.innerHTML = html+`<span class="chev">${CHEV}</span>`;
  b.classList.toggle('hot',hot); b.disabled = st==='busy';
  const ban=$('pBanner');
  ban.hidden=!S.busy;
  if(S.busy) ban.innerHTML=`${SPIN}<span><b>${SRV} перезапускается для ${S.busy.kind==='install'?'установки обновления':'возврата прошлой версии'}</b> · около 5 минут. ${lnk('openRestart','Подробнее')}</span>`;
  $('pHealth').querySelectorAll('b').forEach((x,i)=>{ x.className=S.busy?'n':'g'; x.textContent=S.busy?'нет связи':['OK','OK','50 / 50'][i]; });
  if(!$('menu').hidden) renderMenu();
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
  S.dl={src,target,total,done:0,state:'run',failed:false};
  open('dl','run'); tickDl();
}
function tickDl(){
  clearTimeout(tDl); const d=S.dl; if(!d||d.state!=='run'||d.frozen) return;
  tDl=setTimeout(()=>{
    if(!S.dl||S.dl.state!=='run') return;
    d.done=Math.min(d.total, d.done + d.total/70);
    if(S.dlOut==='fail' && !d.failed && d.done>=d.total*0.6){ d.done=d.total*0.6; d.state='fail'; if(CUR&&CUR.key==='dl') open('dl','fail'); else renderParent(); return; }
    if(d.done>=d.total){ finishDl(); return; }
    if(CUR&&CUR.key==='dl'&&CUR.st==='run') drawProgress(); else renderParent();
    tickDl();
  },200);
}
function finishDl(){
  const d=S.dl, wasOpen=CUR&&CUR.key==='dl'; S.dl=null; S.ready={target:d.target};
  $('sDrop').disabled=true;
  if(S.restartNow) return startRestart('install');
  if(wasOpen) open('ready'); else renderParent();
}
function minimize(){ close(); }
function askCancel(){ clearTimeout(tDl); S.cancelFrom=CUR.st; if(S.flags.cancel==='ask') open('dl','cancel'); else doCancel(); }
function doCancel(){ clearTimeout(tDl); S.dl=null; close(); }
function resumeDl(){ S.dl.state='run'; S.dl.frozen=false; open('dl','run'); tickDl(); }
function dropConn(){ if(!S.dl||S.dl.state!=='run') return; clearTimeout(tDl); S.dl.state='paused'; if(CUR&&CUR.key==='dl') open('dl','paused'); else renderParent(); }

function restartSteps(){
  const b=S.busy;
  if(b.kind==='rollback') return [{t:'Останавливаем сервер'},{t:`Возвращаем версию ${b.to}`},{t:`Восстанавливаем настройки из бэкапа от ${b.bkt}`},{t:'Запускаем сервер и проверяем камеры'}];
  const s=[]; if(S.backup) s.push({t:'Сохраняем бэкап настроек на архивный диск'});
  s.push({t:`Устанавливаем ${b.to}`},{t:'Перезапускаем сервер'});
  if(b.fail) s.push({t:'Сервер не запустился с новой версией',bad:1},{t:`Возвращаем ${b.from} и настройки из бэкапа`});
  else s.push({t:'Проверяем камеры, диски и базу данных'});
  return s;
}
function startRestart(kind){
  clearTimeout(tRs);
  if(kind==='install'){ const to=S.ready.target; S.ready=null; S.busy={kind, from:S.cur, to, step:0, fail:S.outcome==='fail'}; }
  else { const r=S.log[0]; S.busy={kind, from:r.to, to:r.from, bkt:r.t, step:0}; }
  open('restart'); tickRs();
}
function tickRs(){
  tRs=setTimeout(()=>{
    const b=S.busy; if(!b) return; b.step++;
    if(b.step>=restartSteps().length){ finishRs(); return; }
    if(CUR&&CUR.key==='restart') draw(); else renderParent();
    tickRs();
  },1400);
}
function finishRs(){
  const b=S.busy; S.busy=null; const now='29.10.2026 '+new Date().toTimeString().slice(0,5);
  if(b.kind==='rollback'){
    S.cur=b.to; S.rbFrom=b.bkt; S.log.unshift({t:now,a:'Возврат',from:b.from,to:b.to,ok:true,who:'admin',bk:false});
    S.build=CH[S.cur]?.b||S.build; open('done','rolled'); return;
  }
  if(b.fail){
    S.failTo=b.to; S.log.unshift({t:now,a:'Обновление',from:b.from,to:b.to,ok:false,who:'admin',why:`Ошибка установки пакета (код 0x2F). Сервер автоматически вернулся на ${b.from}`});
    open('done','fail'); return;
  }
  S.cur=b.to; S.build=CH[S.cur]?.b||'1291377';
  S.log.unshift({t:now,a:'Обновление',from:b.from,to:b.to,ok:true,who:'admin',bk:S.backup});
  open('done','ok');
}

/* ================= события ================= */
$('updBtn').addEventListener('click',e=>{ e.stopPropagation(); toggleMenu(); });
document.addEventListener('click',e=>{ if(!e.target.closest('.umenu-w')) closeMenu(); });
$('menu').addEventListener('click',e=>{
  const c=e.target.closest('[data-ck]'); if(c){ S[c.dataset.ck]=!S[c.dataset.ck]; renderMenu(); return; }
  const m=e.target.closest('[data-m]'); if(!m) return; closeMenu();
  ({net:openNet, file:openFile, changes:()=>open('changes',(S.net==='offline'||S.net==='nohost')?'offline':'list'), log:()=>open('log','table')})[m.dataset.m]();
});
const ACT = {
  changes:()=>open('changes',(S.net==='offline'||S.net==='nohost')?'offline':'list'),
  log:()=>open('log','table'), file:()=>openFile(), net:()=>openNet(),
  more:()=>{ S.moreCh+=10; draw(); }, noop:()=>{},
  browse:()=>{ const p=PICKS[S.pickN%PICKS.length]; S.pickN++; S.extra=[p]; S.fileSel=0; open('file','found'); },
  callme:()=>{ S.called=true; draw(); },
  rollback:()=>open('log','confirm'),
  export:()=>{ S.exported=true; draw(); },
  toArchive:()=>{ S.net='avail'; $('sNet').value='avail'; open('net','avail'); },
  recheck:()=>check(),
  openRestart:()=>open('restart')
};
$('dlgBg').addEventListener('click',e=>{
  const t=e.target;
  const b=t.closest('[data-b]'); if(b&&!b.disabled){ BTNS[+b.dataset.b].act(); return; }
  if(t.closest('[data-x]')){ ONX(); return; }
  const c=t.closest('[data-ck]'); if(c){ S[c.dataset.ck]=!S[c.dataset.ck]; e.preventDefault(); draw(); return; }
  const f=t.closest('[data-fsel]'); if(f){ S.fileSel=+f.dataset.fsel; draw(); return; }
  const a=t.closest('[data-act]'); if(a&&ACT[a.dataset.act]){ e.preventDefault(); ACT[a.dataset.act](); }
});
$('pBanner').addEventListener('click',e=>{ const a=e.target.closest('[data-act]'); if(a) ACT[a.dataset.act](); });
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){ if(!$('menu').hidden) closeMenu(); else if(CUR && !$('dlgBg').querySelector('[data-x]:disabled')) ONX(); }
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('a.lnk[data-act]')){ e.preventDefault(); e.target.click(); }
});

/* ---------- панель сценариев ---------- */
const SEL = {sNet:'net', sFiles:'files', sDl:'dlOut', sOut:'outcome'};
Object.entries(SEL).forEach(([id,k])=>$(id).addEventListener('change',e=>{ S[k]=e.target.value; if(k==='net') reset(); }));
[['fAuto','auto'],['fMin','min'],['fCancel','cancel'],['fHelp','help']].forEach(([id,k])=>$(id).addEventListener('change',e=>{ S.flags[k]=e.target.value; if(k==='auto'&&S.flags.auto==='off') { S.autoCheck=true; S.checked=true; } if(CUR) draw(); else renderParent(); }));
$('sReset').addEventListener('click',reset);
$('sDrop').addEventListener('click',dropConn);
$('scnTog').addEventListener('click',()=>{ const b=$('scnBody'); b.hidden=!b.hidden; $('scnTog').setAttribute('aria-expanded',String(!b.hidden)); });
$('galHide').addEventListener('click',()=>{ document.body.classList.remove('gal-on'); $('galShow').hidden=false; });
$('galShow').addEventListener('click',()=>{ document.body.classList.add('gal-on'); $('galShow').hidden=true; });
setInterval(()=>{ $('sDrop').disabled=!(S.dl&&S.dl.state==='run'); },300);

/* ================= раскадровка ================= */
function scen(net,extra){ S.net=net; $('sNet').value=net; S.files='found'; $('sFiles').value='found'; S.dlOut='ok'; $('sDl').value='ok'; S.outcome='ok'; $('sOut').value='ok'; reset(); if(extra) extra(); }
function frozenDl(src,pct,state){ const total=src==='net'?SIZE_NET:1300; S.dl={src,target:LATEST,total,done:total*pct,state,frozen:true}; }
const GAL = [
  {g:'Меню «Обновление ПО»', items:[
    {t:'Доступно обновление', s:'Оранжевая кнопка, «Доступна 4.9.15.0»', run:()=>{ scen('avail'); toggleMenu(); }},
    {t:'Последняя версия', s:'Кнопка без подсветки', run:()=>{ scen('latest'); toggleMenu(); }},
    {t:'Нет доступа к сети', s:'Проверить актуальность нельзя', run:()=>{ scen('offline'); toggleMenu(); }},
    {t:'Идёт загрузка', s:'Проценты на кнопке и в меню', run:()=>{ scen('avail',()=>frozenDl('net',.42,'run')); toggleMenu(); }}]},
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
    {t:'Окно свёрнуто', s:'Работа продолжается, прогресс на кнопке', run:()=>{ scen('avail',()=>frozenDl('net',.42,'run')); renderParent(); }},
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
    {t:'Вернуть прошлую версию?', s:'Подтверждение', run:()=>{ scen('avail'); open('log','confirm'); }}]}
];
$('galList').innerHTML = GAL.map((g,gi)=>`<div class="ugal-g">${g.g}</div>`+g.items.map((it,ii)=>`<button type="button" class="ugal-i" data-gal="${gi}.${ii}">${it.t}${it.s?`<span>${it.s}</span>`:''}</button>`).join('')).join('');
$('galList').addEventListener('click',e=>{
  const b=e.target.closest('[data-gal]'); if(!b) return; e.stopPropagation();
  const [gi,ii]=b.dataset.gal.split('.').map(Number);
  document.querySelectorAll('.ugal-i.sel').forEach(x=>x.classList.remove('sel')); b.classList.add('sel');
  closeMenu(); GAL[gi].items[ii].run();
});

reset();
