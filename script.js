const todoInput = document.getElementById('todo-input');
const todoDate = document.getElementById('todo-date');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');
const emptyMsg = document.getElementById('empty-msg');
const clearAllBtn = document.getElementById('clear-all');

const countAll = document.getElementById('count-all');
const countActive = document.getElementById('count-active');
const countCompleted = document.getElementById('count-completed');

// 移除了自動注入今天日期的設定，保留選單空白供自由選擇

// 更新狀態面板與空白提示
function updateStats() {
    const total = todoList.children.length;
    const completed = todoList.querySelectorAll('li.completed').length;
    const active = total - completed;

    countAll.textContent = total;
    countActive.textContent = active;
    countCompleted.textContent = completed;

    if (total === 0) {
        emptyMsg.style.display = 'block';
    } else {
        emptyMsg.style.display = 'none';
    }
}

// 新增任務邏輯
function addTodo() {
    const taskText = todoInput.value.trim();
    const taskDate = todoDate.value;
    if (taskText === '') return; 

    const li = document.createElement('li');
    
    // 計算是否快過期或已過期
    let isUrgent = false;
    const todayStr = new Date().toISOString().split('T')[0];
    if (taskDate) {
        isUrgent = taskDate <= todayStr;
    }
    if (isUrgent) {
        li.classList.add('urgent');
    }
    
    const dateDisplay = taskDate ? `📅 截止日期: ${taskDate}` : '📅 未設定日期';

    li.innerHTML = `
        <div class="todo-content">
            <input type="checkbox" onchange="toggleComplete(this)">
            <div class="text-group">
                <span class="todo-text">${taskText}</span>
                <span class="todo-date">${dateDisplay} ${isUrgent ? '⚠️ 快過期或已過期！' : ''}</span>
            </div>
        </div>
        <button class="delete-btn" onclick="deleteTodo(this)">刪除</button>
    `;

    todoList.appendChild(li);
    todoInput.value = ''; 
    todoDate.value = ''; // 新增完畢後清空日期選單，回復空白
    updateStats();
}

// 監聽點擊與 Enter 鍵事件
addButton.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addTodo();
});

// 切換完成狀態
window.toggleComplete = function(checkbox) {
    const li = checkbox.closest('li');
    if (checkbox.checked) {
        li.classList.add('completed');
    } else {
        li.classList.remove('completed');
    }
    updateStats();
};

// 刪除單個任務
window.deleteTodo = function(button) {
    const li = button.parentElement;
    li.remove();
    updateStats();
};

// 清除全部任務
clearAllBtn.addEventListener('click', function() {
    if (confirm('確定要清除所有待辦事項嗎？')) {
        todoList.innerHTML = '';
        updateStats();
    }
});

// 網頁初始化載入
updateStats();
