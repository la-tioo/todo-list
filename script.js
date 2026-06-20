const todoInput = document.getElementById('todo-input');
const todoDate = document.getElementById('todo-date');
const todoPriority = document.getElementById('todo-priority');
const todoTag = document.getElementById('todo-tag'); // 🆕 取得標籤
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');
const emptyMsg = document.getElementById('empty-msg');
const clearAllBtn = document.getElementById('clear-all');
const sortSelect = document.getElementById('sort-select');
const tabButtons = document.querySelectorAll('.tab-btn');
const themeButtons = document.querySelectorAll('.theme-btn'); // 🆕 取得主題按鈕

const countAll = document.getElementById('count-all');
const countActive = document.getElementById('count-active');
const countCompleted = document.getElementById('count-completed');

const viewListBtn = document.getElementById('view-list-btn');
const viewCalendarBtn = document.getElementById('view-calendar-btn');
const listWrapper = document.getElementById('list-wrapper');
const calendarView = document.getElementById('calendar-view');
const listFilterTabs = document.getElementById('list-filter-tabs');
const listActionRow = document.getElementById('list-action-row');

let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [];
tasks.forEach(t => t.isEditing = false); 

let currentFilter = 'all';
let calendar = null;

// 🆕 標籤中文化對照表
const tagMap = {
    life: { text: '☕ 生活', class: 'tag-life' },
    work: { text: '🔥 工作', class: 'tag-work' },
    study: { text: '📝 學習', class: 'tag-study' },
    sport: { text: '🏆 運動', class: 'tag-sport' }
};

function saveAndRender() {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks));
    renderTasks();
    if (calendar) {
        syncCalendarEvents();
    }
}

function renderTasks() {
    todoList.innerHTML = '';
    const todayStr = new Date().toISOString().split('T')[0];

    tasks.forEach((task, index) => {
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
        
        // 🆕 產生標籤 HTML
        const tagInfo = tagMap[task.tag || 'life'];
        const tagHtml = `<span class="task-tag ${tagInfo.class}">${tagInfo.text}</span>`;

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
                        <span class="todo-text">${priorityTag}${task.text} ${tagHtml}</span>
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
    const taskTagValue = todoTag.value; // 🆕 抓取標籤值

    if (taskText === '') return;

    tasks.push({
        text: taskText,
        date: taskDate,
        priority: taskPrio,
        tag: taskTagValue, // 🆕 儲存標籤
        completed: false,
        isEditing: false
    });

    todoInput.value = '';
    todoDate.value = '';
    todoPriority.value = 'normal';
    todoTag.value = 'life';

    applySort();
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
    applySort();
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

function applySort() {
    const mode = sortSelect.value;
    if (mode === 'date') {
        tasks.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(a.date) - new Date(b.date);
        });
    } else if (mode === 'priority') {
        tasks.sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (a.priority !== 'high' && b.priority === 'high') return 1;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(a.date) - new Date(b.date);
        });
    }
}

sortSelect.addEventListener('change', () => {
    applySort();
    renderTasks();
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

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.getAttribute('data-filter');
        renderTasks();
    });
});

function initCalendar() {
    if (calendar) return;

    calendar = new FullCalendar.Calendar(calendarView, {
        initialView: 'dayGridMonth',
        locale: 'zh-tw',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listMonth'
        },
        events: getCalendarEvents(),
        eventClick: function(info) {
            const taskIndex = info.event.extendedProps.index;
            if (taskIndex !== undefined) {
                tasks[taskIndex].completed = !tasks[taskIndex].completed;
                saveAndRender();
            }
        }
    });
    calendar.render();
}

function getCalendarEvents() {
    return tasks.filter(task => task.date).map((task, idx) => {
        let titlePrefix = task.priority === 'high' ? '🔥 ' : '';
        let tagText = tagMap[task.tag || 'life'].text;
        let titleSuffix = task.completed ? ' (已完成)' : ` [${tagText}]`;
        return {
            title: titlePrefix + task.text + titleSuffix,
            start: task.date,
            backgroundColor: task.completed ? '#475569' : (task.priority === 'high' ? '#ef4444' : '#38bdf8'),
            extendedProps: { index: idx }
        };
    });
}

function syncCalendarEvents() {
    calendar.removeAllEvents();
    calendar.addEventSource(getCalendarEvents());
}

viewListBtn.addEventListener('click', () => {
    viewListBtn.classList.add('active');
    viewCalendarBtn.classList.remove('active');
    listWrapper.style.display = 'block';
    listFilterTabs.style.display = 'flex';
    listActionRow.style.display = 'flex';
    calendarView.style.display = 'none';
    renderTasks();
});

viewCalendarBtn.addEventListener('click', () => {
    viewCalendarBtn.classList.add('active');
    viewListBtn.classList.remove('active');
    listWrapper.style.display = 'none';
    listFilterTabs.style.display = 'none';
    listActionRow.style.display = 'none';
    calendarView.style.display = 'block';
    initCalendar();
    calendar.updateSize();
});

// 🆕【核心切換邏輯】多主題事件綁定
themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        themeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const selectedTheme = btn.getAttribute('data-theme');
        // 切換 HTML 屬性
        if (selectedTheme === 'aurora') {
            document.documentElement.removeAttribute('data-theme-mode');
        } else {
            document.documentElement.setAttribute('data-theme-mode', selectedTheme);
        }
        localStorage.setItem('todo_theme', selectedTheme);
    });
});

// 🆕 初始化載入主題
const savedTheme = localStorage.getItem('todo_theme') || 'aurora';
const targetThemeBtn = document.querySelector(`.theme-btn[data-theme="${savedTheme}"]`);
if (targetThemeBtn) targetThemeBtn.click();

renderTasks();
