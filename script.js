const todoInput = document.getElementById('todo-input');
const todoDate = document.getElementById('todo-date');
const todoPriority = document.getElementById('todo-priority');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');
const emptyMsg = document.getElementById('empty-msg');
const clearAllBtn = document.getElementById('clear-all');
const sortTasksBtn = document.getElementById('sort-tasks');
const tabButtons = document.querySelectorAll('.tab-btn');

const countAll = document.getElementById('count-all');
const countActive = document.getElementById('count-active');
const countCompleted = document.getElementById('count-completed');

// 載入資料，並確保初始時無任何任務處於編輯狀態
let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [];
tasks.forEach(t => t.isEditing = false); 

// 當前選擇的篩選模式：'all', 'active', 'completed'
let currentFilter = 'all';

function saveAndRender() {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks));
    renderTasks();
}

// 渲染畫面核心（包含篩選邏輯）
function renderTasks() {
    todoList.innerHTML = '';
    const todayStr = new Date().toISOString().split('T')[0];

    tasks.forEach((task, index) => {
        // 頁籤篩選過濾器
        if (currentFilter === 'active' && task.completed) return;
        if (currentFilter === 'completed' && !task.completed) return;

        const li = document.createElement('li');
        
        // 判定過期與重要度
        let isUrgent = false;
        if (task.date && task.date <= todayStr && !task.completed) {
            isUrgent = true;
            li.classList.add('urgent');
        }
        if (task.priority === 'high') li.classList.add('priority-high');
        if (task.completed) li.classList.add('completed');

        const dateDisplay = task.date ? `📅 截止日期: ${task.date}` : '📅 未設定日期';
        const priorityTag = task.priority === 'high' ? '🔥 [重要] ' : '';

        // 動態判定：是處於「一般顯示」還是「編輯模式」
        if (task.isEditing) {
            // 編輯模式 HTML
            li.innerHTML = `
                <div class="todo-content">
                    <div class="text-group">
                        <input type="text" class="edit-input" id="input-edit-${index}" value="${task.text}">
                        <span class="todo-date">${dateDisplay}</span>
                    </div>
                </div>
                <div class="btn-group">
                    <button class="save-btn" onclick="saveEdit(${index})">儲存</button>
                    <button class="delete-btn" onclick="cancelEdit(${index})">取消</button>
                </div>
            `;
        } else {
            // 一般顯示 HTML
            li.innerHTML = `
                <div class="todo-content">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete(${index})">
                    <div class="text-group" onclick="toggleComplete(${index})">
                        <span class="todo-text">${priorityTag}${task.text}</span>
                        <span class="todo-date">${dateDisplay} ${isUrgent ? '⚠️ 已過期！' : ''}</span>
                    </div>
                </div>
                <div class="btn-group">
                    <button class="edit-btn" onclick="startEdit(${index})">✏️ 編輯</button>
                    <button class="delete-btn" onclick="deleteTodo(${index})">刪除</button>
                </div>
            `;
        }
        todoList.appendChild(li);
    });

    updateStats();
}

// 更新上方總數面板
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    countAll.textContent = total;
    countActive.textContent = active;
    countCompleted.textContent = completed;

    // 依據當前篩選下是否有顯示物件來控制提示文字
    const displayedTasks = todoList.children.length;
    emptyMsg.style.display = displayedTasks === 0 ? 'block' : 'none';
}

// 新增任務
function addTodo() {
    const taskText = todoInput.value.trim();
    const taskDate = todoDate.value;
    const taskPrio = todoPriority.value;

    if (taskText === '') return;

    tasks.push({
        text: taskText,
        date: taskDate,
        priority: taskPrio,
        completed: false,
        isEditing: false
    });

    todoInput.value = '';
    todoDate.value = '';
    todoPriority.value = 'normal';

    saveAndRender();
}

// 啟動編輯狀態
window.startEdit = function(index) {
    tasks[index].isEditing = true;
    renderTasks();
    // 自動將輸入游標聚焦到該編輯框中
    setTimeout(() => {
        const editField = document.getElementById(`input-edit-${index}`);
        if (editField) editField.focus();
    }, 50);
};

// 儲存編輯內容
window.saveEdit = function(index) {
    const editField = document.getElementById(`input-edit-${index}`);
    if (editField) {
        const newText = editField.value.trim();
        if (newText !== '') {
            tasks[index].text = newText;
        }
    }
    tasks[index].isEditing = false;
    saveAndRender();
};

// 取消編輯
window.cancelEdit = function(index) {
    tasks[index].isEditing = false;
    renderTasks();
};

window.toggleComplete = function(index) {
    tasks[index].completed = !tasks[index].completed;
    saveAndRender();
};

window.deleteTodo = function(index) {
    tasks.splice(index, 1);
    saveAndRender();
};

// 依據日期排序
sortTasksBtn.addEventListener('click', () => {
    tasks.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
    });
    saveAndRender();
});

// 清除所有
clearAllBtn.addEventListener('click', () => {
    if (confirm('確定要清除所有待辦事項嗎？這會連同瀏覽器快取紀錄一起清空喔！')) {
        tasks = [];
        saveAndRender();
    }
});

// 監聽新增按鍵
addButton.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

// 監聽頁籤切換事件
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.getAttribute('data-filter');
        renderTasks(); // 重新過濾渲染
    });
});

// 首次執行渲染
renderTasks();
