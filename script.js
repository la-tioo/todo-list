const todoInput = document.getElementById('todo-input');
const todoDate = document.getElementById('todo-date');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');
const emptyMsg = document.getElementById('empty-msg');
const clearAllBtn = document.getElementById('clear-all');

const countAll = document.getElementById('count-all');
const countActive = document.getElementById('count-active');
const countCompleted = document.getElementById('count-completed');

// 自動設定今日日期
const today = new Date().toISOString().split('T')[0];
todoDate.value = today;

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

function addTodo() {
    const taskText = todoInput.value.trim();
    const taskDate = todoDate.value;
    if (taskText === '') return; 

    const li = document.createElement('li');
    
    let isUrgent = false;
    if (taskDate) {
        isUrgent = taskDate <= today;
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
    todoDate.value = today; 
    updateStats();
}

addButton.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addTodo();
});

function toggleComplete(checkbox) {
    const li = checkbox.closest('li');
    if (checkbox.checked) {
        li.classList.add('completed');
    } else {
        li.classList.remove('completed');
    }
    updateStats();
}

function deleteTodo(button) {
    const li = button.parentElement;
    li.remove();
    updateStats();
}

clearAllBtn.addEventListener('click', function() {
    if (confirm('確定要清除所有待辦事項嗎？')) {
        todoList.innerHTML = '';
        updateStats();
    }
});

// 初始化統計數據
updateStats();
