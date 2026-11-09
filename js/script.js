
const state = {
  user: {
    name: "Aarav Sharma",
    age: 24,
    gender: "Male",
    weight: 68,
    height: 175,
    dailyTarget: 2200
  },
  water: { current: 4, goal: 8 },
  steps: { current: 6240, goal: 10000 },
  food: [
    { id: 1, name: "Oatmeal with banana", cal: 320, meal: "Breakfast" },
    { id: 2, name: "Grilled chicken salad", cal: 480, meal: "Lunch" }
  ],
  activities: [
    { id: 1, type: "Walking", duration: 25, cal: 110 }
  ],
  nextFoodId: 3,
  nextActId: 2
};

function fmt(n){ return Number(n).toLocaleString('en-IN'); }
function clampPct(v){ return Math.max(0, Math.min(100, v)); }

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('show'), 1800);
}

function switchView(name){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.nav-btn[data-view="' + name + '"]').classList.add('active');
  document.getElementById('appContent').scrollTop = 0;
}

function totals(){
  const consumed = state.food.reduce((s, f) => s + Number(f.cal), 0);
  const burned = state.activities.reduce((s, a) => s + Number(a.cal), 0);
  const net = consumed - burned;
  const remaining = state.user.dailyTarget - net;
  return { consumed, burned, net, remaining };
}

function render(){
  const { consumed, burned, net, remaining } = totals();
  const target = state.user.dailyTarget;

  document.getElementById('dashName').textContent = state.user.name.split(' ')[0];
  document.getElementById('dashAvatar').textContent = state.user.name.charAt(0);
  document.getElementById('ringTarget').textContent = fmt(target);
  document.getElementById('ringNetNum').textContent = fmt(net);
  document.getElementById('statConsumed').textContent = fmt(consumed);
  document.getElementById('statBurned').textContent = fmt(burned);
  document.getElementById('statRemaining').textContent = fmt(remaining);

  const circumference = 389.6;
  const ringPct = clampPct((consumed / target) * 100) / 100;
  const offset = circumference - (circumference * ringPct);
  const ringEl = document.getElementById('ringProgress');
  ringEl.style.strokeDashoffset = offset;
  ringEl.style.stroke = net > target ? '#F87171' : '#34D399';

  document.getElementById('waterVal').textContent = state.water.current;
  document.getElementById('waterGoalVal').textContent = state.water.goal;
  const waterPct = clampPct((state.water.current / state.water.goal) * 100);
  document.getElementById('waterBar').style.width = waterPct + '%';
  document.getElementById('waterTag').textContent = Math.round(waterPct) + '%';

  document.getElementById('stepsVal').textContent = fmt(state.steps.current);
  const stepsPct = clampPct((state.steps.current / state.steps.goal) * 100);
  document.getElementById('stepsBar').style.width = stepsPct + '%';

  document.getElementById('goalCalSub').textContent = fmt(consumed) + ' / ' + fmt(target) + ' kcal';
  document.getElementById('goalCalPct').textContent = Math.round(clampPct((consumed / target) * 100)) + '%';
  document.getElementById('goalStepsSub').textContent = fmt(state.steps.current) + ' / ' + fmt(state.steps.goal);
  document.getElementById('goalStepsPct').textContent = Math.round(stepsPct) + '%';
  document.getElementById('goalWaterSub').textContent = state.water.current + ' / ' + state.water.goal + ' glasses';
  document.getElementById('goalWaterPct').textContent = Math.round(waterPct) + '%';

  document.getElementById('foodTotalConsumed').textContent = fmt(consumed);
  document.getElementById('foodTargetLabel').textContent = fmt(target);
  document.getElementById('foodRemainingLabel').textContent = fmt(remaining);
  document.getElementById('foodRemainingLabel').style.color = remaining < 0 ? 'var(--danger)' : 'var(--blue)';
  document.getElementById('foodCountTag').textContent = state.food.length + ' item' + (state.food.length === 1 ? '' : 's');
  renderFoodList();

  document.getElementById('actTotalBurned').textContent = fmt(burned);
  document.getElementById('actSessionCount').textContent = state.activities.length;
  document.getElementById('actMinutes').textContent = fmt(state.activities.reduce((s, a) => s + Number(a.duration || 0), 0));
  document.getElementById('actCountTag').textContent = state.activities.length + ' session' + (state.activities.length === 1 ? '' : 's');
  renderActivityList();

  document.getElementById('gpCalVal').textContent = fmt(consumed) + ' / ' + fmt(target) + ' kcal';
  document.getElementById('gpCalFill').style.width = clampPct((consumed / target) * 100) + '%';
  document.getElementById('gpStepsVal').textContent = fmt(state.steps.current) + ' / ' + fmt(state.steps.goal);
  document.getElementById('gpStepsFill').style.width = stepsPct + '%';

  const deficit = target - net;
  document.getElementById('gpDeficitVal').textContent = (deficit >= 0 ? '−' : '+') + fmt(Math.abs(deficit)) + ' kcal ' + (deficit >= 0 ? 'deficit' : 'surplus');
  const deficitPct = clampPct(50 + (deficit / target) * 50);
  document.getElementById('gpDeficitFill').style.width = deficitPct + '%';

  document.getElementById('calorieSlider').value = target;
  document.getElementById('sliderCalVal').textContent = fmt(target);
  document.getElementById('stepsSlider').value = state.steps.goal;
  document.getElementById('sliderStepsVal').textContent = fmt(state.steps.goal);

  document.getElementById('profileAvatar').textContent = state.user.name.charAt(0);
  document.getElementById('profileName').textContent = state.user.name;
  document.getElementById('stripAge').textContent = state.user.age;
  document.getElementById('stripWeight').textContent = state.user.weight + ' kg';
  document.getElementById('stripHeight').textContent = state.user.height + ' cm';
  document.getElementById('stripTarget').textContent = fmt(state.user.dailyTarget);
}

const mealIcon = { Breakfast:'🍳', Lunch:'🥗', Dinner:'🍽️', Snack:'🍎' };
function renderFoodList(){
  const wrap = document.getElementById('foodList');
  if(state.food.length === 0){
    wrap.innerHTML = '<div class="empty-state"><div class="ee">🍽️</div><p>No meals logged yet today</p></div>';
    return;
  }

  wrap.innerHTML = state.food.map(f => `
    <div class="log-item">
      <div class="log-icon" style="background:#D1FAE5;">${mealIcon[f.meal] || '🍴'}</div>
      <div class="log-info">
        <div class="log-name">${escapeHtml(f.name)}</div>
        <div class="log-sub">${f.meal}</div>
      </div>
      <div class="log-cal" style="color:var(--emerald-dark);">+${fmt(f.cal)}</div>
      <button class="log-del" title="Delete" onclick="deleteFood(${f.id})">✕</button>
    </div>
  `).join('');
}

const actIcon = { Running:'🏃', Walking:'🚶', Cycling:'🚴', Swimming:'🏊', Yoga:'🧘', 'Strength Training':'🏋', Other:'✨' };
function renderActivityList(){
  const wrap = document.getElementById('activityList');
  if(state.activities.length === 0){
    wrap.innerHTML = '<div class="empty-state"><div class="ee">🏃</div><p>No activity logged yet today</p></div>';
    return;
  }

  wrap.innerHTML = state.activities.map(a => `
    <div class="log-item">
      <div class="log-icon" style="background:#FEF3C7;">${actIcon[a.type] || '✨'}</div>
      <div class="log-info">
        <div class="log-name">${escapeHtml(a.type)}</div>
        <div class="log-sub">${a.duration} min</div>
      </div>
      <div class="log-cal" style="color:var(--amber);">−${fmt(a.cal)}</div>
      <button class="log-del" title="Delete" onclick="deleteActivity(${a.id})">✕</button>
    </div>
  `).join('');
}

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

document.getElementById('foodForm').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('foodName').value.trim();
  const cal = parseInt(document.getElementById('foodCal').value, 10);
  const meal = document.getElementById('foodMeal').value;
  if(!name || !cal || cal <= 0) return;

  state.food.push({ id: state.nextFoodId++, name, cal, meal });
  this.reset();
  document.getElementById('foodMeal').value = meal;
  render();
  showToast('✓ Food item added');
});

function deleteFood(id){
  state.food = state.food.filter(f => f.id !== id);
  render();
  showToast('Item removed');
}

document.getElementById('activityForm').addEventListener('submit', function(e){
  e.preventDefault();
  const type = document.getElementById('actType').value;
  const duration = parseInt(document.getElementById('actDuration').value, 10);
  const cal = parseInt(document.getElementById('actCal').value, 10);
  if(!duration || !cal || duration <= 0 || cal <= 0) return;

  state.activities.push({ id: state.nextActId++, type, duration, cal });
  this.reset();
  render();
  showToast('✓ Activity logged');
});

function deleteActivity(id){
  state.activities = state.activities.filter(a => a.id !== id);
  render();
  showToast('Activity removed');
}

function adjustWater(delta){
  state.water.current = Math.max(0, Math.min(state.water.goal + 4, state.water.current + delta));
  render();
}

document.getElementById('calorieSlider').addEventListener('input', function(){
  state.user.dailyTarget = parseInt(this.value, 10);
  render();
});

document.getElementById('stepsSlider').addEventListener('input', function(){
  state.steps.goal = parseInt(this.value, 10);
  render();
});

document.getElementById('profileForm').addEventListener('submit', function(e){
  e.preventDefault();
  state.user.name = document.getElementById('pName').value.trim() || state.user.name;
  state.user.age = parseInt(document.getElementById('pAge').value, 10) || state.user.age;
  state.user.gender = document.getElementById('pGender').value;
  state.user.weight = parseFloat(document.getElementById('pWeight').value) || state.user.weight;
  state.user.height = parseFloat(document.getElementById('pHeight').value) || state.user.height;
  state.user.dailyTarget = parseInt(document.getElementById('pTarget').value, 10) || state.user.dailyTarget;
  render();
  showToast('✓ Profile updated');
});

function resetDay(){
  state.food = [];
  state.activities = [];
  state.water.current = 0;
  state.steps.current = 0;
  render();
  showToast("Today's data cleared");
}

function updateClock(){
  const now = new Date();
  let h = now.getHours(), m = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if(h === 0) h = 12;
  document.getElementById('clock').textContent = h + ':' + String(m).padStart(2, '0');

  const opts = { weekday: 'long', month: 'long', day: 'numeric' };
  document.getElementById('dashDate').textContent = now.toLocaleDateString('en-US', opts);
}

updateClock();
setInterval(updateClock, 30000);
render();
