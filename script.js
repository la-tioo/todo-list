const todoInput = document.getElementById('todo-input');
const todoDate = document.getElementById('todo-date');
const todoPriority = document.getElementById('todo-priority');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');
const emptyMsg = document.getElementById('empty-msg');
const clearAllBtn = document.getElementById('clear-all');
const sortTasksBtn = document.getElementById('sort-tasks');

const countAll = document.getElementById('count-all');
const countActive = document.getElementById('count-active');
const countCompleted = document.getElementById('count-completed');

// 從 LocalStorage 載入資料（如果沒有則初始化為空陣列）
let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [];

// 同步資料並重新渲染畫面
function saveAndRender() {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks));
    renderTasks();
}

// 渲染畫面功能
function renderTasks() {
    todoList.innerHTML = '';
    const todayStr = new Date().toISOString().split('T')[0];

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        
        // 判斷是否過期
        let isUrgent = false;
        if (task.date && task.date <= todayStr && !task.completed) {
            isUrgent = true;
            li.classList.add('urgent');
        }

        // 注入標籤樣式
        if (task.priority === 'high') {
            li.classList.add('priority-high');
        }
        if (task.completed) {
            li.classList.add('completed');
        }

        const dateDisplay = task.date ? `📅 截止日期: ${task.date}` : '📅 未設定日期';
        const priorityTag = task.priority === 'high' ? '🔥 [重要] ' : '';

        li.innerHTML = `
            <div class="todo-content">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete(${index})">
                <div class="text-group">
                    <span class="todo-text">${priorityTag}${task.text}</span>
                    <span class="todo-date">${dateDisplay} ${isUrgent ? '⚠️ 已過期！' : ''}</span>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteTodo(${index})">刪除</button>
        `;
        todoList.appendChild(li);
    });

    updateStats();
}

// 更新統計面板
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    countAll.textContent = total;
    countActive.textContent = active;
    countCompleted.textContent = completed;

    emptyMsg.style.display = total === 0 ? 'block' : 'none';
}

// 新增任務
function addTodo() {
    const taskText = todoInput.value.trim();
    const taskDate = todoDate.value;
    const taskPrio = todoPriority.value;

    if (taskText === '') return;

    // 將新任務推入陣列
    tasks.push({
        text: taskText,
        date: taskDate,
        priority: taskPrio,
        completed: false
    });

    todoInput.value = '';
    todoDate.value = '';
    todoPriority.value = 'normal';

    saveAndRender();
}

// 事件監聽
addButton.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

// 切換完成狀態
window.toggleComplete = function(index) {
    tasks[index].completed = !tasks[index].completed;
    saveAndRender();
};

// 刪除任務
window.deleteTodo = function(index) {
    tasks.splice(index, 1);
    saveAndRender();
};

// 依據日期排序任務（未設定日期的排在最後面）
sortTasksBtn.addEventListener('click', () => {
    tasks.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
    });
    saveAndRender();
});

// 清除所有任務
clearAllBtn.addEventListener('click', () => {
    if (confirm('確定要清除所有待辦事項嗎？這會連同瀏覽器快取紀錄一起清空喔！')) {
        tasks = [];
        saveAndRender();
    }
});

// 網頁載入時首次渲染
renderTasks();
