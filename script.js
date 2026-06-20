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

// 載入 localStorage 資料
let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [];
tasks.forEach(t => t.isEditing = false); 

// 當前選擇的篩選器模式
let currentFilter = 'all';

function saveAndRender() {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks));
    renderTasks();
}

// 渲染畫面（包含篩選機制）
function renderTasks() {
    todoList.innerHTML = '';
    const todayStr = new Date().toISOString().split('T')[0];

    tasks.forEach((task, index) => {
        // 頁籤過濾邏輯
        if (currentFilter === 'active' && task.completed) return;
        if (currentFilter === 'completed' && !task.completed) return;

        const li = document.createElement('li');
        
        let isUrgent = false;
        if (task.date && task.date <= todayStr && !task.completed) {
            isUrgent = true;
            li.classList.add('urgent');
        }
        if (task.priority === 'high') li.classList.add('priority-high');
        if (task.completed) li.classList.add('completed');

        const dateDisplay = task.date ? `📅 截止日期: ${task.date}` : '📅 未設定日期';
        const priorityTag = task.priority === 'high' ? '🔥 [重要] ' : '';

        if (task.isEditing) {
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

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    countAll.textContent = total;
    countActive.textContent = active;
    countCompleted.textContent = completed;

    const displayedTasks = todoList.children.length;
    emptyMsg.style.display = displayedTasks === 0 ? 'block' : 'none';
}

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

window.startEdit = function(index) {
    tasks[index].isEditing = true;
    renderTasks();
    setTimeout(() => {
        const editField = document.getElementById(`input-edit-${index}`);
        if (editField) editField.focus();
    }, 50);
};

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

sortTasksBtn.addEventListener('click', () => {
    tasks.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
    });
    saveAndRender();
});

clearAllBtn.addEventListener('click', () => {
    if (confirm('確定要清除所有待辦事項嗎？')) {
        tasks = [];
        saveAndRender();
    }
});

addButton.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

// 🌟【關鍵修正】為篩選頁籤註冊點擊事件
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 清除所有按鈕的 active 狀態，並把當前點擊的按鈕設為 active
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // 取得篩選模式並重新渲染畫面
        currentFilter = button.getAttribute('data-filter');
        renderTasks();
    });
});

// 首次加載渲染
renderTasks();
