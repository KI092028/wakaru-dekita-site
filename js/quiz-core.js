/* quiz-core.js (no build tools)
 * A tiny, consistent quiz engine for simple math apps.
 */
(function(){
  function todayKey(){
    const d=new Date();
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,'0');
    const da=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${da}`;
  }

  function safeJsonParse(raw){
    try{ return raw?JSON.parse(raw):null; }catch(e){ return null; }
  }

  function createTonePlayer(){
    let audioCtx=null;
    function ensure(){
      if(audioCtx) return audioCtx;
      try{ audioCtx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){}
      return audioCtx;
    }
    function beep(seq){
      const ctx=ensure();
      if(!ctx) return;
      let t=ctx.currentTime;
      for(const s of seq){
        const o=ctx.createOscillator();
        const g=ctx.createGain();
        o.type=s.type||'triangle';
        o.frequency.value=s.freq||440;
        g.gain.value=s.gain||0.06;
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t+(s.dur||0.14));
        t += (s.delay!=null ? s.delay : (s.dur||0.14)+0.04);
      }
    }
    return {
      ok: ()=>beep([{freq:523},{freq:659},{freq:784}]),
      ng: ()=>beep([{freq:220,type:'sawtooth',dur:0.18,gain:0.05}])
    };
  }

  function normalizeDigits(v){
    if(typeof v!=='string') v=String(v??'');
    v=v.replace(/[０-９]/g, s=>String.fromCharCode(s.charCodeAt(0)-0xFEE0));
    v=v.replace(/[^0-9\-]/g,'');
    return v;
  }

  function byId(id){ return document.getElementById(id); }

  window.QuizCore = {
    create: function(config){
      const {
        appId,
        title,
        subtitle,
        dailyGoal=3,
        buildQuestion, // (state) => {text, answer, choices?}
        onInitUI,       // optional (state, api)
        allowNegative=false,
        choiceMode=false // if true, expects question.choices and uses selection
      } = config;

      const els = {
        title: byId('qc-title'),
        subtitle: byId('qc-subtitle'),
        pillCorrect: byId('qc-correct'),
        pillTotal: byId('qc-total'),
        pillDaily: byId('qc-daily'),
        problem: byId('qc-problem'),
        input: byId('qc-input'),
        choices: byId('qc-choices'),
        feedback: byId('qc-feedback'),
        nextBtn: byId('qc-next'),
        submitBtn: byId('qc-submit'),
        dailyBtn: byId('qc-daily-btn'),
        practiceBtn: byId('qc-practice-btn'),
        soundBtn: byId('qc-sound-btn'),
        backBtn: byId('qc-back')
      };

      const tone = createTonePlayer();

      const DAILY_KEY = `wakaru.${appId}.daily.v2`;
      const SOUND_KEY = `wakaru.sound.v1`;

      const state = {
        mode: 'practice', // practice | daily
        correct: 0,
        total: 0,
        streak: 0,
        dailyDone: 0,
        dailyGoal,
        soundOn: true,
        q: {text:'', answer:0, choices:null},
        selectedValue: null
      };

      function loadSound(){
        const raw=localStorage.getItem(SOUND_KEY);
        state.soundOn = raw==null ? true : (raw==='1');
        updateSoundBtn();
      }
      function saveSound(){
        try{ localStorage.setItem(SOUND_KEY, state.soundOn?'1':'0'); }catch(e){}
        updateSoundBtn();
      }
      function updateSoundBtn(){
        if(els.soundBtn) els.soundBtn.textContent = `${state.soundOn?'🔊':'🔇'} おと: ${state.soundOn?'ON':'OFF'}`;
      }

      function loadDaily(){
        const st=safeJsonParse(localStorage.getItem(DAILY_KEY))||{};
        if(st.date!==todayKey()){
          state.dailyDone=0;
        }else{
          state.dailyDone=Number(st.done||0)||0;
        }
        updatePills();
      }
      function saveDaily(){
        try{ localStorage.setItem(DAILY_KEY, JSON.stringify({date: todayKey(), done: state.dailyDone})); }catch(e){}
        updatePills();
      }

      function updatePills(){
        if(els.pillCorrect) els.pillCorrect.textContent = `せいかい: ${state.correct}`;
        if(els.pillTotal) els.pillTotal.textContent = `もんだい: ${state.total}`;
        if(els.pillDaily){
          const d=Math.min(state.dailyDone, state.dailyGoal);
          els.pillDaily.textContent = (d>=state.dailyGoal) ? `きょう: ✅ ${state.dailyGoal}/${state.dailyGoal}` : `きょう: ${d}/${state.dailyGoal}`;
          els.pillDaily.className = 'pill ' + (d>=state.dailyGoal ? 'ok' : 'warn');
        }
      }

      function setFeedback(msg, ok){
        els.feedback.className = 'feedback ' + (ok?'ok':'ng');
        els.feedback.textContent = msg;
      }

      function renderChoices(){
        if(!els.choices) return;
        els.choices.innerHTML='';
        const choices = state.q.choices;
        if(!choices || !Array.isArray(choices)) return;

        // choices can be primitives or {label,value}
        choices.forEach((c)=>{
          const val = (c && typeof c==='object') ? c.value : c;
          const label = (c && typeof c==='object') ? c.label : String(c);
          const b=document.createElement('button');
          b.type='button';
          b.className='btn blue choice';
          b.textContent=label;
          b.dataset.val=String(val);
          b.addEventListener('click', ()=>{
            state.selectedValue = val;
            if(els.input) els.input.value = String(val);
            // highlight
            [...els.choices.querySelectorAll('.btn.choice')].forEach(x=>x.classList.remove('selected'));
            b.classList.add('selected');
          });
          els.choices.appendChild(b);
        });
      }

      function newQuestion(){
        state.selectedValue = null;
        state.q = buildQuestion(state);
        if(els.problem) els.problem.textContent = state.q.text;
        if(els.feedback){
          els.feedback.className='feedback';
          els.feedback.textContent='';
        }
        if(els.nextBtn) els.nextBtn.style.display='none';

        if(choiceMode){
          if(els.input) els.input.value='';
          renderChoices();
        }else{
          if(els.input){
            els.input.value='';
            els.input.focus();
          }
        }
      }

      function startDaily(){
        state.mode='daily';
        loadDaily();
        setFeedback(`🎯 きょうの${state.dailyGoal}もん：せいかいを ${state.dailyGoal}かい めざそう！`, true);
        newQuestion();
      }
      function startPractice(){
        state.mode='practice';
        setFeedback('', true);
        newQuestion();
      }

      function check(){
        let ans;
        if(choiceMode){
          if(state.selectedValue==null){
            setFeedback('どれか えらんでね！', false);
            if(state.soundOn) tone.ng();
            return;
          }
          ans = Number(state.selectedValue);
        }else{
          const raw=normalizeDigits(els.input.value);
          if(raw===''){
            setFeedback('すうじを いれてね！', false);
            if(state.soundOn) tone.ng();
            return;
          }
          ans=parseInt(raw,10);
          if(Number.isNaN(ans)){
            setFeedback('すうじを いれてね！', false);
            if(state.soundOn) tone.ng();
            return;
          }
          if(!allowNegative && ans<0){
            setFeedback('0いじょう の すうじを いれてね！', false);
            if(state.soundOn) tone.ng();
            return;
          }
        }

        state.total++;
        if(ans===state.q.answer){
          state.correct++;
          state.streak++;
          if(state.mode==='daily' && state.dailyDone < state.dailyGoal){
            state.dailyDone++;
            saveDaily();
          }
          updatePills();

          if(state.soundOn) tone.ok();
          if(state.mode==='daily' && state.dailyDone>=state.dailyGoal){
            setFeedback('🏅 せいかい！ きょうのミッション クリア！', true);
          }else{
            setFeedback('🎉 せいかい！', true);
          }
          if(els.nextBtn){
            els.nextBtn.style.display='inline-flex';
          }
        }else{
          state.streak=0;
          updatePills();
          if(state.soundOn) tone.ng();
          setFeedback(`ちがうよ。こたえは ${state.q.answer} だよ。もういちど！`, false);
          if(!choiceMode && els.input){
            setTimeout(()=>{ els.input.value=''; els.input.focus(); }, 900);
          }
        }
      }

      function goBack(){
        // keep it simple; avoid confirm for kids
        window.history.back();
      }

      // Wire UI
      if(els.title) els.title.textContent=title||'';
      if(els.subtitle) els.subtitle.textContent=subtitle||'';
      if(els.backBtn) els.backBtn.addEventListener('click', goBack);
      if(els.submitBtn) els.submitBtn.addEventListener('click', check);
      if(els.nextBtn) els.nextBtn.addEventListener('click', newQuestion);
      if(els.dailyBtn) els.dailyBtn.addEventListener('click', startDaily);
      if(els.practiceBtn) els.practiceBtn.addEventListener('click', startPractice);
      if(els.soundBtn) els.soundBtn.addEventListener('click', ()=>{ state.soundOn=!state.soundOn; saveSound(); });

      if(els.input){
        els.input.addEventListener('input', ()=>{ els.input.value=normalizeDigits(els.input.value).slice(0,4); });
        els.input.addEventListener('keypress', (e)=>{ if(e.key==='Enter') check(); });
      }

      // allow audio init on first gesture
      document.addEventListener('pointerdown', ()=>{}, {once:true});

      // Generic selected highlight for any .btn.choice buttons (even pages not using choiceMode)
      document.addEventListener('click', (e)=>{
        const t=e.target;
        if(!(t && t.classList && t.classList.contains('choice') && t.classList.contains('btn'))) return;
        const scope = t.closest('#qc-choices') || t.parentElement;
        if(scope){
          [...scope.querySelectorAll('.btn.choice')].forEach(b=>b.classList.remove('selected'));
        }
        t.classList.add('selected');
      });

      loadSound();
      loadDaily();
      updatePills();

      const api = { state, newQuestion, startDaily, startPractice, check };
      if(typeof onInitUI==='function') onInitUI(state, api);

      newQuestion();
      return api;
    }
  };
})();
