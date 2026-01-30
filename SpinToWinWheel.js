// 在全局變量區域修改
let SpinToWinWheels = JSON.parse(localStorage.getItem('SpinToWinWheels')) || [];
let currentSpinToWinWheelId = localStorage.getItem('currentSpinToWinWheelId') || null;
let SpinToWinWheelRotations = {}; // 新增：儲存每個轉盤的旋轉角度

// 預設轉盤數據
const defaultPrizes = [
  { name: '獎品一', color: '#FF6B6B', probability: 25 },
  { name: '獎品二', color: '#4ECDC4', probability: 25 },
  { name: '獎品11', color: '#F38181', probability: 25 },
  { name: '獎品12', color: '#AA96DA', probability: 25 }
];

// 初始化：如果沒有轉盤，創建一個預設的
if (SpinToWinWheels.length === 0) {
  const defaultSpinToWinWheel = {
    id: Date.now(),
    name: '我的轉盤 1',
    prizes: defaultPrizes,
    createdAt: new Date().toISOString()
  };
  SpinToWinWheels.push(defaultSpinToWinWheel);
  currentSpinToWinWheelId = defaultSpinToWinWheel.id;
  saveSpinToWinWheels();
}

// 如果沒有當前轉盤ID，設置為第一個
if (!currentSpinToWinWheelId && SpinToWinWheels.length > 0) {
  currentSpinToWinWheelId = SpinToWinWheels[0].id;
  localStorage.setItem('currentSpinToWinWheelId', currentSpinToWinWheelId);
}

// 獲取當前轉盤
function getCurrentSpinToWinWheel() {
  return SpinToWinWheels.find(t => t.id == currentSpinToWinWheelId) || SpinToWinWheels[0];
}

// 保存到 localStorage
function saveSpinToWinWheels() {
  localStorage.setItem('SpinToWinWheels', JSON.stringify(SpinToWinWheels));
  localStorage.setItem('currentSpinToWinWheelId', currentSpinToWinWheelId);
}

// 更新頂部標題顯示
function updateTitleDisplay() {
  const currentSpinToWinWheel = getCurrentSpinToWinWheel();
  const titleInput = document.getElementById('titleInput');
  titleInput.value = currentSpinToWinWheel.name;
}

// 生成轉盤扇形 (根據機率比例分配大小)
function createWheel() {
  const wheelSegments = document.getElementById('wheelSegments');
  wheelSegments.innerHTML = '';
  
  const currentSpinToWinWheel = getCurrentSpinToWinWheel();
  const prizes = currentSpinToWinWheel.prizes;
  
  const centerX = 200;
  const centerY = 200;
  const radius = 200;
  
  // 計算總機率
  const totalProbability = prizes.reduce((sum, prize) => sum + (parseFloat(prize.probability) || 0), 0);
  
  let currentAngle = -90; // 從頂部開始 (-90度)

  prizes.forEach((prize, index) => {
    // 根據機率計算扇形角度
    const probability = parseFloat(prize.probability) || 0;
    const segmentAngle = (probability / totalProbability) * 360;
    
    // 計算起始和結束角度（弧度）
    const startAngle = currentAngle * Math.PI / 180;
    const endAngle = (currentAngle + segmentAngle) * Math.PI / 180;
    
    // 計算路徑點
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    // 創建扇形路徑
    const largeArcFlag = segmentAngle > 180 ? 1 : 0;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `
      M ${centerX} ${centerY}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      Z
    `);
    path.setAttribute('fill', prize.color);
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '2');
    
    wheelSegments.appendChild(path);
    
    // 添加文字（在扇形中央）
    const textAngle = (currentAngle + segmentAngle / 2) * Math.PI / 180;
    const textRadius = radius * 0.65;
    const textX = centerX + textRadius * Math.cos(textAngle);
    const textY = centerY + textRadius * Math.sin(textAngle);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', textX);
    text.setAttribute('y', textY);
    text.setAttribute('class', 'wheel-text');
    text.setAttribute('dominant-baseline', 'middle');
    
    // 文字旋轉，使其沿著半徑方向
    const textRotation = currentAngle + segmentAngle / 2 + 90;
    text.setAttribute('transform', `rotate(${textRotation}, ${textX}, ${textY})`);
    
    // 處理長文字
    const displayName = prize.name.length > 10 ? prize.name.substring(0, 10) + '...' : prize.name;
    text.textContent = displayName;
    
    // 如果扇形太小，調整文字大小或隱藏
    if (segmentAngle < 15) {
      text.setAttribute('font-size', '10');
    } else if (segmentAngle < 30) {
      text.setAttribute('font-size', '12');
    }
    
    wheelSegments.appendChild(text);
    
    // 更新當前角度
    currentAngle += segmentAngle;
  });
  
  updateTitleDisplay();
}

// 渲染轉盤列表
function renderSpinToWinWheelList() {
  const listContainer = document.getElementById('SpinToWinWheelList');
  listContainer.innerHTML = '';
  
  SpinToWinWheels.forEach(SpinToWinWheel => {
    const item = document.createElement('div');
    item.className = 'SpinToWinWheelItem';
    if (SpinToWinWheel.id == currentSpinToWinWheelId) {
      item.classList.add('active');
    }
    
    const info = document.createElement('div');
    info.innerHTML = `
      <div class="SpinToWinWheelItemName">${SpinToWinWheel.name}</div>
      <div class="SpinToWinWheelItemDate">${new Date(SpinToWinWheel.createdAt).toLocaleDateString()}</div>
    `;
    
    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'SpinToWinWheelItemDelete';
    deleteBtn.textContent = '刪除';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteSpinToWinWheel(SpinToWinWheel.id);
    };
    
    item.appendChild(info);
    item.appendChild(deleteBtn);
    
    item.onclick = () => {
      switchSpinToWinWheel(SpinToWinWheel.id);
    };
    
    listContainer.appendChild(item);
  });
}

// 渲染編輯項目列表
function renderEditItems() {
  const currentSpinToWinWheel = getCurrentSpinToWinWheel();
  const listContainer = document.getElementById('editItemsList');
  listContainer.innerHTML = '';
  
  currentSpinToWinWheel.prizes.forEach((prize, index) => {
    const item = document.createElement('div');
    item.className = 'editItem';
    
    item.innerHTML = `
      <div class="editItemRow">
        <div class="editItemColor">
          <input type="color" value="${prize.color}" data-index="${index}">
        </div>
        <div class="editItemName">
          <input type="text" value="${prize.name}" placeholder="項目名稱" data-index="${index}">
        </div>
        <div class="editItemProbability">
          <input type="number" value="${prize.probability}" min="0.01" max="100" step="0.01" placeholder="%" data-index="${index}">
        </div>
        <div class="editItemDelete" data-index="${index}">×</div>
      </div>
    `;
    
    listContainer.appendChild(item);
  });
  
  // 綁定事件
  bindEditEvents();
  updateTotalProbability();
}

// 綁定編輯事件
function bindEditEvents() {
  const currentSpinToWinWheel = getCurrentSpinToWinWheel();
  
  // 顏色修改
  document.querySelectorAll('.editItemColor input').forEach(input => {
    input.addEventListener('change', (e) => {
      const index = parseInt(e.target.dataset.index);
      currentSpinToWinWheel.prizes[index].color = e.target.value;
      saveSpinToWinWheels();
      createWheel();
    });
  });
  
  // 名稱修改
  document.querySelectorAll('.editItemName input').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      currentSpinToWinWheel.prizes[index].name = e.target.value;
      saveSpinToWinWheels();
      createWheel();
    });
  });
  
  // 機率修改
  document.querySelectorAll('.editItemProbability input').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      let value = parseFloat(e.target.value);
      
      // 限制範圍
      if (value < 0.01) value = 0.01;
      if (value > 100) value = 100;
      
      currentSpinToWinWheel.prizes[index].probability = value;
      saveSpinToWinWheels();
      updateTotalProbability();
    });
  });
  
  // 刪除項目
  document.querySelectorAll('.editItemDelete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      deleteItem(index);
    });
  });
}

// 更新總機率顯示
function updateTotalProbability() {
  const currentSpinToWinWheel = getCurrentSpinToWinWheel();
  const total = currentSpinToWinWheel.prizes.reduce((sum, prize) => sum + (parseFloat(prize.probability) || 0), 0);
  const totalElement = document.getElementById('totalProbability');
  
  totalElement.textContent = total.toFixed(2);
  
  // 根據總和變色
  totalElement.classList.remove('valid', 'invalid');
  if (total === 0) {
    totalElement.classList.add('invalid');
  } else if (Math.abs(total - 100) < 0.01) {
    totalElement.classList.add('valid');
  } else {
    // 機率總和不是100也可以用，但會提示
    totalElement.style.color = '#ff9800'; // 橘色警告
  }
}

// 新增項目
function addNewItem() {
  const currentSpinToWinWheel = getCurrentSpinToWinWheel();
  const newItem = {
    name: `新項目 ${currentSpinToWinWheel.prizes.length + 1}`,
    color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
    probability: 0
  };
  
  currentSpinToWinWheel.prizes.push(newItem);
  saveSpinToWinWheels();
  renderEditItems();
  createWheel(); // 立即更新轉盤
}

function deleteItem(index) {
  const currentSpinToWinWheel = getCurrentSpinToWinWheel();
  
  if (currentSpinToWinWheel.prizes.length <= 2) {
    alert('至少需要保留2個項目！');
    return;
  }
  
  // if (confirm('確定要刪除這個項目嗎？')) {
    currentSpinToWinWheel.prizes.splice(index, 1);
    saveSpinToWinWheels();
    renderEditItems();
    createWheel(); // 立即更新轉盤
  // }
}

// 新增轉盤
function addNewSpinToWinWheel() {
  const newSpinToWinWheel = {
    id: Date.now(),
    name: `我的轉盤 ${SpinToWinWheels.length + 1}`,
    prizes: [...defaultPrizes],
    createdAt: new Date().toISOString()
  };
  
  SpinToWinWheels.push(newSpinToWinWheel);
  currentSpinToWinWheelId = newSpinToWinWheel.id;
  
  // 初始化新轉盤的旋轉角度為0
  SpinToWinWheelRotations[newSpinToWinWheel.id] = 0;
  
  saveSpinToWinWheels();
  renderSpinToWinWheelList();
  
  // 重置轉盤顯示
  const wheel = document.getElementById('wheel');
  wheel.style.transition = 'none';
  wheel.style.transform = `rotate(0deg)`;
  wheel.offsetHeight;
  setTimeout(() => {
    wheel.style.transition = 'transform 6s cubic-bezier(0.05, 0.9, 0.4, 1)';
  }, 50);
  
  createWheel();
  
  // 關閉側邊欄
  switchContainer.classList.remove('show');
  overlay.classList.remove('show');
}

// 切換轉盤
function switchSpinToWinWheel(id) {
  currentSpinToWinWheelId = id;
  saveSpinToWinWheels();
  
  // 先重置轉盤角度再渲染
  const wheel = document.getElementById('wheel');
  wheel.style.transition = 'none'; // 暫時關閉動畫
  degree = 0;
  wheel.style.transform = `rotate(0deg)`;
  
  // 強制重繪
  wheel.offsetHeight; // 觸發 reflow
  
  // 恢復動畫
  setTimeout(() => {
    wheel.style.transition = 'transform 6s cubic-bezier(0.05, 0.9, 0.4, 1)';
  }, 50);
  
  // 渲染新轉盤
  createWheel();
  renderSpinToWinWheelList();
  
  // 關閉側邊欄
  switchContainer.classList.remove('show');
  overlay.classList.remove('show');
}


// 刪除轉盤
function deleteSpinToWinWheel(id) {
  if (SpinToWinWheels.length <= 1) {
    alert('至少需要保留一個轉盤！');
    return;
  }
  
  if (confirm('確定要刪除這個轉盤嗎？')) {
    SpinToWinWheels = SpinToWinWheels.filter(t => t.id !== id);
    
    // 刪除該轉盤的旋轉角度記錄
    delete SpinToWinWheelRotations[id];
    
    // 如果刪除的是當前轉盤，切換到第一個
    if (currentSpinToWinWheelId == id) {
      currentSpinToWinWheelId = SpinToWinWheels[0].id;
      
      // 重置轉盤顯示
      const wheel = document.getElementById('wheel');
      wheel.style.transition = 'none';
      const savedDegree = SpinToWinWheelRotations[currentSpinToWinWheelId] || 0;
      wheel.style.transform = `rotate(${savedDegree}deg)`;
      wheel.offsetHeight;
      setTimeout(() => {
        wheel.style.transition = 'transform 6s cubic-bezier(0.05, 0.9, 0.4, 1)';
      }, 50);
    }
    
    saveSpinToWinWheels();
    renderSpinToWinWheelList();
    createWheel();
  }
}
// 轉盤旋轉功能（根據機率）
let isSpinning = false;

document.querySelector('.startButton').addEventListener('click', function() {
  if (isSpinning) return;
  const wheel = document.getElementById('wheel');
  const currentSpinToWinWheel = getCurrentSpinToWinWheel();
  
  // 檢查機率總和
  const total = currentSpinToWinWheel.prizes.reduce((sum, prize) => sum + (parseFloat(prize.probability) || 0), 0);
  if (total === 0) {
    alert('請設定機率！');
    return;
  }
  
  isSpinning = true;
  
  // 根據機率選擇中獎項目
  const random = Math.random() * total;
  let cumulative = 0;
  let winnerIndex = 0;
  
  for (let i = 0; i < currentSpinToWinWheel.prizes.length; i++) {
    cumulative += parseFloat(currentSpinToWinWheel.prizes[i].probability) || 0;
    if (random <= cumulative) {
      winnerIndex = i;
      break;
    }
  }
  
  // 計算目標角度（根據機率比例）
  let targetAngle = 0;
  for (let i = 0; i < winnerIndex; i++) {
    const probability = parseFloat(currentSpinToWinWheel.prizes[i].probability) || 0;
    targetAngle += (probability / total) * 360;
  }
  
  // 加上中獎扇形的一半角度，讓指針指向扇形中央
  const winnerProbability = parseFloat(currentSpinToWinWheel.prizes[winnerIndex].probability) || 0;
  const winnerSegmentAngle = (winnerProbability / total) * 360;
  targetAngle += winnerSegmentAngle / 2;
  
  // 獲取當前轉盤的旋轉角度
  const currentDegree = SpinToWinWheelRotations[currentSpinToWinWheelId] || 0;
  
  // 計算最終旋轉角度（至少轉10圈 + 目標角度）
  const finalAngle = 360 - targetAngle;
  const newDegree = currentDegree + 3600 + finalAngle - (currentDegree % 360);
  
  // 儲存新角度
  SpinToWinWheelRotations[currentSpinToWinWheelId] = newDegree;
  
  wheel.style.transform = `rotate(${newDegree}deg)`;
  
  setTimeout(() => {
    isSpinning = false;
    console.log('🎉 中獎: ' + currentSpinToWinWheel.prizes[winnerIndex].name + '\n機率: ' + currentSpinToWinWheel.prizes[winnerIndex].probability + '%');
  }, 6000);
});

// 側邊欄控制
const switchC = document.querySelector('.switch');
const edit = document.querySelector('.edit');
const switchContainer = document.querySelector('.switchContainer');
const editContainer = document.querySelector('.editContainer');
const back = document.querySelector('.back');
const editBack = document.querySelector('.editBack');
const overlay = document.getElementById('overlay');

switchC.addEventListener('click', function() {
  switchContainer.classList.toggle('show');
  overlay.classList.add('show');
  renderSpinToWinWheelList();
});

edit.addEventListener('click', function() {
  editContainer.classList.toggle('show');
  overlay.classList.add('show');
  renderEditItems();
});

overlay.addEventListener('click', () => {
  const wheel = document.getElementById('wheel');
  
  // 如果編輯側邊欄是開啟的，重置角度
  if (editContainer.classList.contains('show')) {
    wheel.style.transition = 'none';
    SpinToWinWheelRotations[currentSpinToWinWheelId] = 0;
    wheel.style.transform = `rotate(0deg)`;
    wheel.offsetHeight;
    setTimeout(() => {
      wheel.style.transition = 'transform 6s cubic-bezier(0.05, 0.9, 0.4, 1)';
    }, 50);
    createWheel();
  }
  
  switchContainer.classList.remove('show');
  editContainer.classList.remove('show');
  overlay.classList.remove('show');
});

back.addEventListener('click', () => {
  switchContainer.classList.remove('show');
  overlay.classList.remove('show');
});

editBack.addEventListener('click', () => {
  const currentSpinToWinWheel = getCurrentSpinToWinWheel();
  const total = currentSpinToWinWheel.prizes.reduce((sum, prize) => sum + (parseFloat(prize.probability) || 0), 0);
  
  // 檢查是否有空的項目名稱（可選）
  const hasEmptyName = currentSpinToWinWheel.prizes.some(prize => !prize.name || prize.name.trim() === '');
  if (hasEmptyName) {
    if (!confirm('有項目名稱為空，確定要關閉嗎？')) {
      return;
    }
  }
  
  // 關閉編輯側邊欄
  editContainer.classList.remove('show');
  overlay.classList.remove('show');
  
  // 重置轉盤角度並重新渲染
  const wheel = document.getElementById('wheel');
  wheel.style.transition = 'none'; // 關閉動畫
  
  // 重置當前轉盤的旋轉角度為0
  SpinToWinWheelRotations[currentSpinToWinWheelId] = 0;
  wheel.style.transform = `rotate(0deg)`;
  
  // 強制重繪
  wheel.offsetHeight;
  
  // 恢復動畫效果
  setTimeout(() => {
    wheel.style.transition = 'transform 6s cubic-bezier(0.05, 0.9, 0.4, 1)';
  }, 50);
  
  // 重新渲染轉盤
  createWheel();
});

// 頂部標題編輯功能
const titleInput = document.getElementById('titleInput');

// 點擊時進入編輯模式
titleInput.addEventListener('click', function() {
  this.removeAttribute('readonly');
  this.select();
});

// 失去焦點時保存並設為只讀
titleInput.addEventListener('blur', function() {
  const currentSpinToWinWheel = getCurrentSpinToWinWheel();
  const newName = this.value.trim();
  
  if (newName === '') {
    // 如果名稱為空，恢復原名稱
    this.value = currentSpinToWinWheel.name;
  } else {
    // 保存新名稱
    currentSpinToWinWheel.name = newName;
    saveSpinToWinWheels();
    renderSpinToWinWheelList(); // 更新轉盤列表顯示
  }
  
  this.setAttribute('readonly', 'readonly');
});

// 按下 Enter 鍵時也保存
titleInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    this.blur();
  }
});

// 新增項目按鈕
document.getElementById('addItem').addEventListener('click', addNewItem);

// 新增轉盤按鈕
document.getElementById('addSpinToWinWheel').addEventListener('click', addNewSpinToWinWheel);

// 頁面載入時初始化
createWheel();
renderSpinToWinWheelList();

// 初始化當前轉盤的旋轉角度
const wheel = document.getElementById('wheel');
const initialDegree = SpinToWinWheelRotations[currentSpinToWinWheelId] || 0;
wheel.style.transform = `rotate(${initialDegree}deg)`;


let testResult = {};
function testStart() {
  if (isSpinning) return;
  const wheel = document.getElementById('wheel');
  const currentSpinToWinWheel = getCurrentSpinToWinWheel();
  
  // 檢查機率總和
  const total = currentSpinToWinWheel.prizes.reduce((sum, prize) => sum + (parseFloat(prize.probability) || 0), 0);
  if (total === 0) {
    alert('請設定機率！');
    return;
  }
  
  isSpinning = true;
  
  // 根據機率選擇中獎項目
  const random = Math.random() * total;
  let cumulative = 0;
  let winnerIndex = 0;
  
  for (let i = 0; i < currentSpinToWinWheel.prizes.length; i++) {
    cumulative += parseFloat(currentSpinToWinWheel.prizes[i].probability) || 0;
    if (random <= cumulative) {
      winnerIndex = i;
      break;
    }
  }
  
  // 計算目標角度（根據機率比例）
  let targetAngle = 0;
  for (let i = 0; i < winnerIndex; i++) {
    const probability = parseFloat(currentSpinToWinWheel.prizes[i].probability) || 0;
    targetAngle += (probability / total) * 360;
  }
  
  // 加上中獎扇形的一半角度，讓指針指向扇形中央
  const winnerProbability = parseFloat(currentSpinToWinWheel.prizes[winnerIndex].probability) || 0;
  const winnerSegmentAngle = (winnerProbability / total) * 360;
  targetAngle += winnerSegmentAngle / 2;
  
  // 計算最終旋轉角度（至少轉10圈 + 目標角度）
  const finalAngle = 360 - targetAngle; // 因為轉盤是順時針轉，所以要反向計算
  degree = degree + 3600 + finalAngle - (degree % 360);
  
  wheel.style.transform = `rotate(${degree}deg)`;
  
  if (!testResult[currentSpinToWinWheel.prizes[winnerIndex].name]) {
    testResult[currentSpinToWinWheel.prizes[winnerIndex].name] = 0;
  }
  testResult[currentSpinToWinWheel.prizes[winnerIndex].name] += 1;

  setTimeout(() => {
    isSpinning = false;
    console.log('🎉 中獎: ' + currentSpinToWinWheel.prizes[winnerIndex].name + '\n機率: ' + currentSpinToWinWheel.prizes[winnerIndex].probability + '%');
  }, 100);

  console.log(testResult)
}

// function sleep(ms) {
//   return new Promise(resolve => {
//     setTimeout(resolve, ms);
//   });
// }

// async function runLoop() {
//   for (let i = 0; i < 1000; i++) {
//     testStart();
//     await sleep(100);
//   }
// }

// runLoop();

// 模擬測試功能
// const simulationContainer = document.getElementById('simulationContainer');
// const simulationButton = document.getElementById('simulationButton');

// simulationButton.addEventListener('click', function() {
//   // 切換到控制介面
//   simulationContainer.innerHTML = `
//     <div class="simulationControls">
//       <input type="number" id="simulationCount" placeholder="測試次數" value="100" min="1" max="10000">
//       <div class="simulationControlButton simulationStartButton" id="simulationStart">開始</div>
//       <div class="simulationControlButton simulationCloseButton" id="simulationClose">關閉</div>
//     </div>
//   `;
  
//   // 綁定開始按鈕
//   document.getElementById('simulationStart').addEventListener('click', function() {
//     const count = parseInt(document.getElementById('simulationCount').value) || 100;
//     runSimulation(count);
//   });
  
//   // 綁定關閉按鈕
//   document.getElementById('simulationClose').addEventListener('click', function() {
//     simulationContainer.innerHTML = `
//       <div class="simulationButton cursor-pointer" id="simulationButton">
//         <div class="text">模擬測試</div>
//       </div>
//     `;
//     // 重新綁定點擊事件
//     document.getElementById('simulationButton').addEventListener('click', arguments.callee.caller);
//   });
// });
// 頁面載入時初始化模擬測試按鈕
bindSimulationButton();

// 執行模擬測試
let isSimulating = false;
let simulationResultDiv = null;

async function runSimulation(count) {
  if (isSimulating) {
    alert('模擬測試進行中，請稍候...');
    return;
  }
  
  const currentSpinToWinWheel = getCurrentSpinToWinWheel();
  const total = currentSpinToWinWheel.prizes.reduce((sum, prize) => sum + (parseFloat(prize.probability) || 0), 0);
  
  if (total === 0) {
    alert('請先設定機率！');
    return;
  }
  
  isSimulating = true;
  const result = {};
  const wheel = document.getElementById('wheel');
  
  // 初始化結果
  currentSpinToWinWheel.prizes.forEach(prize => {
    result[prize.name] = 0;
  });
  
  // 創建結果顯示區域
  simulationResultDiv = document.createElement('div');
  simulationResultDiv.className = 'simulationResult';
  document.body.appendChild(simulationResultDiv);
  
  // 暫時關閉編輯側邊欄
  editContainer.classList.remove('show');
  overlay.classList.remove('show');
  
  // 設定快速動畫
  wheel.style.transition = 'transform 0.1s cubic-bezier(0.05, 0.9, 0.4, 1)';
  
  // 執行模擬
  for (let i = 0; i < count; i++) {
    const random = Math.random() * total;
    let cumulative = 0;
    let winnerIndex = 0;
    
    for (let j = 0; j < currentSpinToWinWheel.prizes.length; j++) {
      cumulative += parseFloat(currentSpinToWinWheel.prizes[j].probability) || 0;
      if (random <= cumulative) {
        winnerIndex = j;
        break;
      }
    }
    
    // 計算目標角度
    let targetAngle = 0;
    for (let j = 0; j < winnerIndex; j++) {
      const probability = parseFloat(currentSpinToWinWheel.prizes[j].probability) || 0;
      targetAngle += (probability / total) * 360;
    }
    
    const winnerProbability = parseFloat(currentSpinToWinWheel.prizes[winnerIndex].probability) || 0;
    const winnerSegmentAngle = (winnerProbability / total) * 360;
    targetAngle += winnerSegmentAngle / 2;
    
    const currentDegree = SpinToWinWheelRotations[currentSpinToWinWheelId] || 0;
    const finalAngle = 360 - targetAngle;
    const newDegree = currentDegree + 360 + finalAngle - (currentDegree % 360);
    
    SpinToWinWheelRotations[currentSpinToWinWheelId] = newDegree;
    wheel.style.transform = `rotate(${newDegree}deg)`;
    
    // 記錄結果
    const name = currentSpinToWinWheel.prizes[winnerIndex].name;
    result[name] = (result[name] || 0) + 1;
    
    // 更新顯示
    updateSimulationDisplay(result, i + 1, count, total);
    
    // 等待動畫完成
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 恢復正常動畫速度
  wheel.style.transition = 'transform 6s cubic-bezier(0.05, 0.9, 0.4, 1)';
  
  // 顯示最終結果
  updateSimulationDisplay(result, count, count, total, true);
  
  // 顯示結果到控制台
  console.log(`=== 模擬測試結果 (${count}次) ===`);
  currentSpinToWinWheel.prizes.forEach(prize => {
    const actualCount = result[prize.name] || 0;
    const actualPercentage = ((actualCount / count) * 100).toFixed(2);
    const expectedPercentage = ((prize.probability / total) * 100).toFixed(2);
    console.log(`${prize.name}: ${actualCount}次 (${actualPercentage}%) - 預期: ${expectedPercentage}%`);
  });
  
  isSimulating = false;
}

// 綁定關閉按鈕
document.getElementById('simulationClose').addEventListener('click', function() {
  // 移除測試結果顯示
  removeSimulationDisplay();
  
  simulationContainer.innerHTML = `
    <div class="simulationButton cursor-pointer" id="simulationButton">
      <div class="text">模擬測試</div>
    </div>
  `;
  // 重新綁定點擊事件
  const newButton = document.getElementById('simulationButton');
  newButton.addEventListener('click', function() {
    simulationContainer.innerHTML = `
      <div class="simulationControls">
        <input type="number" id="simulationCount" placeholder="測試次數" value="100" min="1" max="10000">
        <div class="simulationControlButton simulationStartButton" id="simulationStart">開始</div>
        <div class="simulationControlButton simulationCloseButton" id="simulationClose">關閉</div>
      </div>
    `;
    
    document.getElementById('simulationStart').addEventListener('click', function() {
      const count = parseInt(document.getElementById('simulationCount').value) || 100;
      runSimulation(count);
    });
    
    document.getElementById('simulationClose').addEventListener('click', arguments.callee);
  });
});

// 更新模擬結果顯示
function updateSimulationDisplay(result, current, total, probabilityTotal, isFinal = false) {
  if (!simulationResultDiv) return;
  
  const currentSpinToWinWheel = getCurrentSpinToWinWheel();
  
  let html = `
    <div class="simulationResultClose" onclick="closeSimulation()">×</div>
    <div class="simulationResultTitle">${isFinal ? '最終結果' : '測試進行中'}</div>
  `;
  
  if (!isFinal) {
    html += `<div class="simulationResultProgress">進度: ${current} / ${total}</div>`;
  }
  
  currentSpinToWinWheel.prizes.forEach(prize => {
    const actualCount = result[prize.name] || 0;
    const actualPercentage = ((actualCount / current) * 100).toFixed(2);
    const expectedPercentage = ((prize.probability / probabilityTotal) * 100).toFixed(2);
    
    html += `
      <div class="simulationResultItem">
        <div class="simulationResultName">${prize.name}</div>
        <div class="simulationResultStats">
          次數: <span class="simulationResultCount">${actualCount}</span> 
          (<span class="simulationResultPercentage">${actualPercentage}%</span>)
        </div>
        <div class="simulationResultExpected">預期: ${expectedPercentage}%</div>
      </div>
    `;
  });
  
  simulationResultDiv.innerHTML = html;
}

// 關閉模擬測試（統一處理）
function closeSimulation() {
  // 移除測試結果顯示
  removeSimulationDisplay();
  
  // 重置模擬容器
  const simulationContainer = document.getElementById('simulationContainer');
  simulationContainer.innerHTML = `
    <div class="simulationButton cursor-pointer" id="simulationButton">
      <div class="text">模擬測試</div>
    </div>
  `;
  
  // 重新綁定點擊事件
  bindSimulationButton();
}


// 綁定模擬測試按鈕事件（獨立函數方便重複調用）
function bindSimulationButton() {
  const simulationButton = document.getElementById('simulationButton');
  if (!simulationButton) return;
  
  simulationButton.addEventListener('click', function() {
    const simulationContainer = document.getElementById('simulationContainer');
    simulationContainer.innerHTML = `
      <div class="simulationControls">
        <input type="number" id="simulationCount" placeholder="測試次數" value="100" min="1" max="10000">
        <div class="simulationControlButton simulationStartButton" id="simulationStart">開始</div>
        <div class="simulationControlButton simulationCloseButton" id="simulationClose">關閉</div>
      </div>
    `;
    
    document.getElementById('simulationStart').addEventListener('click', function() {
      const count = parseInt(document.getElementById('simulationCount').value) || 100;
      runSimulation(count);
    });
    
    document.getElementById('simulationClose').addEventListener('click', closeSimulation);
  });
}

// 移除模擬結果顯示
function removeSimulationDisplay() {
  if (simulationResultDiv) {
    simulationResultDiv.remove();
    simulationResultDiv = null;
  }
}

// 在文件最後新增觸控和視窗調整支援

// // 防止雙擊縮放（iOS Safari）
// document.addEventListener('touchstart', function(event) {
//   if (event.touches.length > 1) {
//     // event.preventDefault();
//   }
// }, { passive: false });

// let lastTouchEnd = 0;
// document.addEventListener('touchend', function(event) {
//   const now = Date.now();
//   if (now - lastTouchEnd <= 300) {
//     // event.preventDefault();
//   }
//   lastTouchEnd = now;
// }, false);

// 視窗大小改變時調整轉盤
window.addEventListener('resize', function() {
  const wheel = document.getElementById('wheel');
  const container = document.querySelector('.SpinToWinWheelcontainer');
  
  if (window.innerWidth <= 480) {
    wheel.setAttribute('width', '300');
    wheel.setAttribute('height', '300');
    wheel.setAttribute('viewBox', '0 0 400 400');
  } else if (window.innerWidth <= 768) {
    wheel.setAttribute('width', '350');
    wheel.setAttribute('height', '350');
    wheel.setAttribute('viewBox', '0 0 400 400');
  } else {
    wheel.setAttribute('width', '400');
    wheel.setAttribute('height', '400');
    wheel.setAttribute('viewBox', '0 0 400 400');
  }
});

// 初始化時執行一次
window.dispatchEvent(new Event('resize'));
