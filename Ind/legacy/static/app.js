'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const courseData={
    python:{name:'Python Development',description:'Пиши зрозумілий код, працюй з даними та створюй API.',duration:'5 місяців',price:'4 500',tools:'Python · SQL · Git · FastAPI',project:'API для власного сервісу',modules:[['Основи Python','Змінні, типи даних, умови, цикли та функції.'],['Структури даних і ООП','Колекції, класи та організація коду.'],['Бази даних та API','SQL, HTTP і створення API на FastAPI.'],['Власний проєкт','Розробка, перевірка та презентація результату.']]},
    frontend:{name:'Frontend Development',description:'Від першої HTML-сторінки до власного застосунку на React.',duration:'4 місяці',price:'4 200',tools:'HTML · CSS · JavaScript · React',project:'власний вебзастосунок',modules:[['HTML та CSS','Семантична розмітка, стилі та адаптивні сітки.'],['JavaScript','Логіка, події, DOM та робота з API.'],['React','Компоненти, стан і маршрутизація.'],['Власний проєкт','Застосунок, тестування та публікація.']]},
    qa:{name:'QA Engineering',description:'Знаходь помилки та допомагай командам створювати якісний продукт.',duration:'3 місяці',price:'3 800',tools:'Test cases · SQL · Postman',project:'тестування вебпродукту',modules:[['Основи тестування','Життєвий цикл продукту й типи тестування.'],['Тестова документація','Чеклісти, тест-кейси та баг-репорти.'],['API та бази даних','Postman, HTTP і основи SQL.'],['Фінальний проєкт','Перевірка продукту й звіт про якість.']]},
  };
  document.documentElement.classList.add('js');
  const menu=$('.menu-toggle'),navigation=$('#main-navigation');
  menu.hidden=false;
  function closeMenu(focus=false){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Відкрити меню');navigation.classList.remove('is-open');if(focus)menu.focus();}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрити меню':'Відкрити меню');navigation.classList.toggle('is-open',open);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && menu.getAttribute('aria-expanded')==='true')closeMenu(true);});
  document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
  matchMedia('(min-width: 641px)').addEventListener('change',e=>{if(e.matches)closeMenu();});

  if($('#course-grid')) {
    $('[data-enhanced]').hidden=false;
    let filter='all';const cards=all('#course-grid .course-card');
    const update=()=>{
      const query=$('#course-search').value.trim().toLocaleLowerCase('uk-UA');
      let count=0;
      for(const card of cards){const visible=(filter==='all'||card.dataset.category===filter)&&card.dataset.title.toLocaleLowerCase('uk-UA').includes(query);card.hidden=!visible;if(visible)count++;}
      const sort=$('#course-sort').value;
      const sorted=sort==='default'?[...cards]:[...cards].sort((a,b)=>(Number(a.dataset.price)-Number(b.dataset.price))*(sort==='price-asc'?1:-1));
      sorted.forEach(card=>$('#course-grid').append(card));
      $('#result-count').textContent=`Знайдено курсів: ${count} · Онлайн · Для початківців`;
      $('#empty-state').hidden=count!==0;
    };
    all('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;all('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));update();}));
    $('#course-search').addEventListener('input',update);$('#course-sort').addEventListener('change',update);
    $('#reset-filters').addEventListener('click',()=>{filter='all';$('#course-search').value='';$('#course-sort').value='default';all('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter==='all')));update();$('#course-search').focus();});
  }
  const requested=new URLSearchParams(location.search).get('course');
  const courseId=Object.hasOwn(courseData,requested)?requested:'python';
  if($('#course-name')) {
    const course=courseData[courseId];
    for(const [id,key] of [['course-name','name'],['course-description','description'],['course-tools','tools'],['course-price','price'],['course-duration','duration']])$('#'+id).textContent=course[key];
    $('#course-project').textContent='Фінальний результат: '+course.project+'.';
    all('#course-modules li').forEach((item,i)=>{item.querySelector('h3').textContent=course.modules[i][0];item.querySelector('p').textContent=course.modules[i][1];});
    all('[data-enroll]').forEach(link=>link.href=`contact.html?course=${courseId}`);
    document.title=course.name+' | IT.SCHOOL';
    $('meta[name="description"]').content=course.description;
  }
  const form=$('#application-form');
  if(!form)return;
  const storageKey='it-school.application.v1';let currentReceipt=null;
  const nameField=$('#student-name'),emailField=$('#student-email'),consent=$('#student-consent');
  if(Object.hasOwn(courseData,requested))$('#student-course').value=requested;
  $('#submit-application').disabled=false;
  const fields=[[nameField,$('#name-error')],[emailField,$('#email-error')],[consent,$('#consent-error')]];
  function clearErrors(){for(const [input,error] of fields){input.removeAttribute('aria-invalid');error.hidden=true;error.textContent='';}$('#form-error-summary').hidden=true;}
  function error(input,target,message){input.setAttribute('aria-invalid','true');target.textContent=message;target.hidden=false;}
  function readSaved(){try{const value=JSON.parse(localStorage.getItem(storageKey)||'null');if(value && typeof value.id==='string' && typeof value.name==='string' && typeof value.email==='string' && typeof value.course==='string')return value;}catch{}return null;}
  function showReceipt(value,saved=true){
    currentReceipt=value;form.hidden=true;$('#show-saved').hidden=true;$('#application-receipt').hidden=false;
    $('#receipt-title').textContent=saved?'Заявку збережено.':'Заявку підготовлено.';
    $('#receipt-status').textContent=saved?'Дані збережено лише в цьому браузері. Можеш завантажити копію або видалити їх.':'Браузер не дозволив зберегти дані. Завантаж копію заявки, щоб не втратити її.';
    for(const key of ['id','name','email','course'])$('#receipt-'+key).textContent=value[key];
    $('#delete-application').hidden=!saved;$('#application-receipt').focus();
  }
  $('#show-saved').hidden=!readSaved();$('#show-saved').addEventListener('click',()=>{const value=readSaved();if(value)showReceipt(value);});
  form.addEventListener('submit',event=>{
    event.preventDefault();clearErrors();let first=null;
    nameField.value=nameField.value.trim();emailField.value=emailField.value.trim();
    if(nameField.value.length<2){error(nameField,$('#name-error'),'Вкажи ім’я: щонайменше 2 символи.');first=nameField;}
    if(!emailField.validity.valid){error(emailField,$('#email-error'),'Вкажи коректну email-адресу, наприклад name@example.com.');first=first||emailField;}
    if(!consent.checked){error(consent,$('#consent-error'),'Потрібна згода на локальне збереження заявки.');first=first||consent;}
    if(first){$('#form-error-summary').textContent='Перевір позначені поля. Заявку ще не збережено.';$('#form-error-summary').hidden=false;first.focus();return;}
    const id=globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
    const value={id:'IT-'+id.slice(0,8).toUpperCase(),createdAt:new Date().toISOString(),name:nameField.value,email:emailField.value,course:$('#student-course').selectedOptions[0].textContent,message:$('#student-message').value.trim()};
    let saved=true;try{localStorage.setItem(storageKey,JSON.stringify(value));}catch{saved=false;}
    showReceipt(value,saved);
  });
  for(const [input,target] of fields)input.addEventListener('input',()=>{input.removeAttribute('aria-invalid');target.hidden=true;});
  $('#new-application').addEventListener('click',()=>{form.reset();clearErrors();if(Object.hasOwn(courseData,requested))$('#student-course').value=requested;$('#application-receipt').hidden=true;form.hidden=false;$('#show-saved').hidden=!readSaved();nameField.focus();});
  $('#delete-application').addEventListener('click',()=>{try{localStorage.removeItem(storageKey);currentReceipt=null;$('#application-receipt').hidden=true;form.reset();form.hidden=false;$('#show-saved').hidden=true;$('#storage-status').textContent='Збережену заявку видалено з цього браузера.';nameField.focus();}catch{$('#receipt-status').textContent='Не вдалося видалити запис. Очисти дані цього сайту в налаштуваннях браузера.';}});
  $('#download-application').addEventListener('click',()=>{if(!currentReceipt)return;const r=currentReceipt;const text=`IT.SCHOOL — навчальна заявка\nНомер: ${r.id}\nДата: ${r.createdAt}\nІм’я: ${r.name}\nEmail: ${r.email}\nНапрям: ${r.course}\nЗапитання: ${r.message||'—'}\n\nЦе локальна копія. Дані не надіслано школі.`;const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=r.id+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
})();
