let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = 'all';
let editingTaskId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setDefaultDate();
    renderTasks();
    updateTaskStats();
    
    // Auto-save on input changes
    document.getElementById('taskTitle').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
});

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDate').value = today;
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    updateTaskStats();
}

function addTask() {
    const date = document.getElementById("taskDate").value;
    const endDate = document.getElementById("taskEndDate").value;
    const title = document.getElementById("taskTitle").value.trim();
    const note = document.getElementById("taskNote").value.trim();
    const priority = document.getElementById("taskPriority").value;
    const category = document.getElementById("taskCategory").value;

    if (!date || !title) {
        alert("Please enter both start date and task title.");
        return;
    }

    if (endDate && endDate < date) {
        alert("Due date cannot be earlier than start date.");
        return;
    }

    const newTask = {
        id: Date.now(),
        date,
        endDate: endDate || null,
        title,
        note,
        priority,
        category,
        status: "not-started",
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    tasks.push(newTask);

    // Clear form
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskNote").value = "";
    document.getElementById("taskEndDate").value = "";
    document.getElementById("taskPriority").value = "medium";
    document.getElementById("taskCategory").value = "";

    saveTasks();
    showNotification(`✅ Task "${title}" added successfully!`);
}

function updateStatus(id, status) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            const updatedTask = { ...task, status };
            if (status === 'done') {
                updatedTask.completedAt = new Date().toISOString();
            } else {
                updatedTask.completedAt = null;
            }
            return updatedTask;
        }
        return task;
    });
    saveTasks();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    editingTaskId = id;
    
    document.getElementById('editTitle').value = task.title;
    document.getElementById('editDate').value = task.date;
    document.getElementById('editEndDate').value = task.endDate || '';
    document.getElementById('editPriority').value = task.priority || 'medium';
    document.getElementById('editCategory').value = task.category || '';
    document.getElementById('editNote').value = task.note || '';
    
    document.getElementById('editModal').style.display = 'flex';
}

function saveEditedTask() {
    const title = document.getElementById('editTitle').value.trim();
    const date = document.getElementById('editDate').value;
    const endDate = document.getElementById('editEndDate').value;
    const priority = document.getElementById('editPriority').value;
    const category = document.getElementById('editCategory').value;
    const note = document.getElementById('editNote').value.trim();
    
    if (!title || !date) {
        alert("Please enter both title and start date.");
        return;
    }
    
    if (endDate && endDate < date) {
        alert("Due date cannot be earlier than start date.");
        return;
    }
    
    tasks = tasks.map(task => {
        if (task.id === editingTaskId) {
            return {
                ...task,
                title,
                date,
                endDate: endDate || null,
                priority,
                category,
                note
            };
        }
        return task;
    });
    
    closeEditModal();
    saveTasks();
    showNotification("✅ Task updated successfully!");
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingTaskId = null;
}

function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        showNotification("🗑️ Task deleted successfully!");
    }
}

function duplicateTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newTask = {
        ...task,
        id: Date.now(),
        title: task.title + " (Copy)",
        status: "not-started",
        createdAt: new Date().toISOString(),
        completedAt: null
    };
    
    tasks.push(newTask);
    saveTasks();
    showNotification("📋 Task duplicated successfully!");
}

function clearAllTasks() {
    if (confirm("Are you sure you want to delete ALL tasks? This cannot be undone.")) {
        tasks = [];
        saveTasks();
        showNotification("🗑️ All tasks cleared!");
    }
}

function filterTasks(filter) {
    currentFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    renderTasks();
}

function isTaskOverdue(task) {
    if (!task.endDate || task.status === 'done') return false;
    const today = new Date().toISOString().split('T')[0];
    return task.endDate < today;
}

function isTaskToday(task) {
    const today = new Date().toISOString().split('T')[0];
    return task.date === today || task.endDate === today;
}

function getFilteredTasks() {
    const searchQuery = document.getElementById("searchBox").value.toLowerCase();
    let filtered = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery) ||
                            (task.note && task.note.toLowerCase().includes(searchQuery)) ||
                            (task.category && task.category.toLowerCase().includes(searchQuery));
        
        if (!matchesSearch) return false;
        
        switch (currentFilter) {
            case 'today':
                return isTaskToday(task);
            case 'overdue':
                return isTaskOverdue(task);
            case 'not-started':
                return task.status === 'not-started';
            case 'in-progress':
                return task.status === 'in-progress';
            case 'done':
                return task.status === 'done';
            default:
                return true;
        }
    });
    
    return filtered;
}

function getPriorityIcon(priority) {
    switch (priority) {
        case 'high': return '🔴';
        case 'medium': return '🟡';
        case 'low': return '🔵';
        default: return '⚪';
    }
}

function getCategoryIcon(category) {
    switch (category) {
        case 'work': return '💼';
        case 'personal': return '👤';
        case 'health': return '💪';
        case 'learning': return '📚';
        case 'finance': return '💰';
        case 'other': return '📝';
        default: return '📂';
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'done': return '#4CAF50';
        case 'in-progress': return '#FF9800';
        case 'not-started': return '#9E9E9E';
        default: return '#9E9E9E';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOnly = dateString;
    const todayOnly = today.toISOString().split('T')[0];
    const yesterdayOnly = yesterday.toISOString().split('T')[0];
    const tomorrowOnly = tomorrow.toISOString().split('T')[0];
    
    if (dateOnly === todayOnly) return 'Today';
    if (dateOnly === yesterdayOnly) return 'Yesterday';
    if (dateOnly === tomorrowOnly) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
}

function renderTasks() {
    const taskList = document.getElementById("taskList");
    const filtered = getFilteredTasks();
    
    taskList.innerHTML = "";

    if (filtered.length === 0) {
        taskList.innerHTML = `
            <div class="no-tasks">
                <div class="no-tasks-icon">📝</div>
                <p>No tasks found.</p>
                <p class="no-tasks-subtitle">Add a new task to get started!</p>
            </div>
        `;
        return;
    }

    // Group tasks by date
    const grouped = {};
    filtered.forEach(task => {
        if (!grouped[task.date]) grouped[task.date] = [];
        grouped[task.date].push(task);
    });

    // Sort dates
    const sortedDates = Object.keys(grouped).sort();

    sortedDates.forEach(date => {
        // Sort tasks within each date by priority and status
        const dateTasks = grouped[date].sort((a, b) => {
            const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
            const statusOrder = { 'not-started': 0, 'in-progress': 1, 'done': 2 };
            
            if (a.priority !== b.priority) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return statusOrder[a.status] - statusOrder[b.status];
        });

        const dateHeader = document.createElement("div");
        dateHeader.className = "date-header";
        dateHeader.innerHTML = `
            <h2>� ${formatDate(date)}</h2>
            <span class="task-count">${dateTasks.length} task${dateTasks.length !== 1 ? 's' : ''}</span>
        `;
        taskList.appendChild(dateHeader);

        dateTasks.forEach(task => {
            const div = document.createElement("div");
            div.className = `task ${task.status}`;
            div.style.borderLeftColor = getStatusColor(task.status);
            
            const isOverdue = isTaskOverdue(task);
            if (isOverdue) div.classList.add('overdue');

            const dueDateText = task.endDate ? 
                `<span class="due-date ${isOverdue ? 'overdue-text' : ''}">
                    📅 Due: ${formatDate(task.endDate)}
                    ${isOverdue ? ' ⚠️' : ''}
                </span>` : '';

            div.innerHTML = `
                <div class="task-header">
                    <div class="task-meta">
                        ${getPriorityIcon(task.priority)}
                        ${task.category ? getCategoryIcon(task.category) : ''}
                        <h3 class="task-title">${task.title}</h3>
                    </div>
                    <div class="task-actions">
                        <button onclick="editTask(${task.id})" class="edit-btn" title="Edit Task">✏️</button>
                        <button onclick="duplicateTask(${task.id})" class="duplicate-btn" title="Duplicate Task">📋</button>
                        <button onclick="deleteTask(${task.id})" class="delete-btn" title="Delete Task">🗑️</button>
                    </div>
                </div>
                
                ${task.note ? `<div class="task-note">${task.note.replace(/\n/g, '<br>')}</div>` : ''}
                
                <div class="task-footer">
                    <div class="task-info">
                        ${dueDateText}
                        ${task.completedAt ? `<span class="completed-date">✅ Completed: ${formatDate(task.completedAt.split('T')[0])}</span>` : ''}
                    </div>
                    <select onchange="updateStatus(${task.id}, this.value)" class="status-select">
                        <option value="not-started" ${task.status === "not-started" ? "selected" : ""}>🔄 Not Started</option>
                        <option value="in-progress" ${task.status === "in-progress" ? "selected" : ""}>⏳ In Progress</option>
                        <option value="done" ${task.status === "done" ? "selected" : ""}>✅ Done</option>
                    </select>
                </div>
            `;
            taskList.appendChild(div);
        });
    });
}

function updateTaskStats() {
    const stats = {
        total: tasks.length,
        notStarted: tasks.filter(t => t.status === 'not-started').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        done: tasks.filter(t => t.status === 'done').length,
        overdue: tasks.filter(t => isTaskOverdue(t)).length
    };
    
    const completion = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
    
    document.getElementById('taskStats').innerHTML = `
        <span title="Total Tasks">📊 ${stats.total}</span>
        <span title="Completion Rate">✅ ${completion}%</span>
        ${stats.overdue > 0 ? `<span title="Overdue Tasks" class="overdue-stat">⚠️ ${stats.overdue}</span>` : ''}
    `;
}

function exportTasks() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `mytasks_backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
    showNotification("� Tasks exported successfully!");
}

function importTasks() {
    const fileInput = document.getElementById("importFile");
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                if (confirm(`Import ${imported.length} tasks? This will add to your existing tasks.`)) {
                    tasks = [...tasks, ...imported];
                    saveTasks();
                    showNotification(`📥 ${imported.length} tasks imported successfully!`);
                }
            } else {
                alert("Invalid file format. Please select a valid JSON file.");
            }
        } catch {
            alert("Failed to import tasks. Please check the file format.");
        }
    };
    if (fileInput.files[0]) {
        reader.readAsText(fileInput.files[0]);
    }
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Dark mode toggle
document.getElementById("toggleDark").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

// Load dark mode preference
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
}

// Initialize app
setDefaultDate();
renderTasks();
updateTaskStats();