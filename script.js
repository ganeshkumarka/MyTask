let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

function addTask() {
  const date = document.getElementById("taskDate").value;
  const title = document.getElementById("taskTitle").value.trim();
  const note = document.getElementById("taskNote").value.trim();

  if (!date || !title) return alert("Please enter both date and task title.");

  tasks.push({
    id: Date.now(),
    date,
    title,
    note,
    status: "Not Started"
  });

  document.getElementById("taskTitle").value = "";
  document.getElementById("taskNote").value = "";

  saveTasks();
}

function updateStatus(id, status) {
  tasks = tasks.map(task => task.id === id ? { ...task, status } : task);
  saveTasks();
}

function deleteTask(id) {
  if (confirm("Delete this task?")) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
  }
}

function exportTasks() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "mytasks_backup.json");
  dlAnchor.click();
}

function importTasks() {
  const fileInput = document.getElementById("importFile");
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        tasks = imported;
        saveTasks();
      } else {
        alert("Invalid file format.");
      }
    } catch {
      alert("Failed to import tasks.");
    }
  };
  reader.readAsText(fileInput.files[0]);
}

function renderTasks() {
  const taskList = document.getElementById("taskList");
  const searchQuery = document.getElementById("searchBox").value.toLowerCase();
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = "<p>No tasks yet.</p>";
    return;
  }

  const grouped = {};
  tasks.forEach(task => {
    if (!grouped[task.date]) grouped[task.date] = [];
    grouped[task.date].push(task);
  });

  Object.keys(grouped).sort().forEach(date => {
    const filtered = grouped[date].filter(task =>
      task.title.toLowerCase().includes(searchQuery) ||
      (task.note && task.note.toLowerCase().includes(searchQuery))
    );
    if (filtered.length === 0) return;

    const dateHeader = document.createElement("h2");
    dateHeader.textContent = `📆 ${date}`;
    taskList.appendChild(dateHeader);

    filtered.forEach(task => {
      const div = document.createElement("div");
      div.className = "task";
      div.style.borderLeftColor = task.status === "Done" ? "green" : task.status === "In Progress" ? "orange" : "#ccc";
      div.innerHTML = \`
        <h3>\${task.title}</h3>
        <p class="note">\${task.note || ""}</p>
        <select onchange="updateStatus(\${task.id}, this.value)">
          <option \${task.status === "Not Started" ? "selected" : ""}>Not Started</option>
          <option \${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option \${task.status === "Done" ? "selected" : ""}>Done</option>
        </select>
        <button onclick="deleteTask(\${task.id})">🗑️ Delete</button>
      \`;
      taskList.appendChild(div);
    });
  });
}

document.getElementById("toggleDark").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

renderTasks();