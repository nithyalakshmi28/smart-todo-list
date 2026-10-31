
// ===================================
// TASKFLOW - SMART TODO LIST
// ===================================

// GET HTML ELEMENTS

const taskList = document.getElementById("task-list");
const taskModal = document.getElementById("task-modal");
const taskForm = document.getElementById("task-form");

const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskPriority = document.getElementById("task-priority");
const taskDate = document.getElementById("task-date");

const searchInput = document.getElementById("search-input");
const priorityFilter = document.getElementById("priority-filter");

const emptyState = document.getElementById("empty-state");

let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];

let currentFilter = "all";
let editingTaskId = null;


// ===================================
// SAVE TASKS TO LOCAL STORAGE
// ===================================

function saveTasks() {
    localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
}


// ===================================
// DISPLAY CURRENT DATE
// ===================================

function displayDate() {
    const date = new Date();

    document.getElementById("current-date").textContent =
        date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        });
}


// ===================================
// UPDATE STATISTICS
// ===================================

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const pending = total - completed;

    document.getElementById("total-tasks").textContent = total;

    document.getElementById("pending-tasks").textContent = pending;

    document.getElementById("completed-tasks").textContent = completed;

    document.getElementById("all-count").textContent = total;
}


// ===================================
// OPEN AND CLOSE MODAL
// ===================================

function openModal() {

    taskForm.reset();

    editingTaskId = null;

    document.getElementById("modal-title").textContent = "Create New Task";

    taskModal.classList.add("show");

    taskTitle.focus();
}

function closeModal() {

    taskModal.classList.remove("show");

    taskForm.reset();

    editingTaskId = null;
}

document.getElementById("open-modal").addEventListener("click", openModal);

document.getElementById("close-modal").addEventListener("click", closeModal);

document.getElementById("cancel-modal").addEventListener("click", closeModal);

taskModal.addEventListener("click", function(event) {

    if (event.target === taskModal) {
        closeModal();
    }

});


// ===================================
// ADD OR EDIT TASK
// ===================================

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = taskTitle.value.trim();

    const description = taskDescription.value.trim();

    const priority = taskPriority.value;

    const dueDate = taskDate.value;

    if (!title) {
        alert("Please enter a task name!");
        return;
    }

    if (dueDate && dueDate < getTodayDate()) {
        alert("Please select today or a future date!");
        return;
    }

    if (editingTaskId !== null) {

        const task = tasks.find(task => task.id === editingTaskId);

        if (task) {
            task.title = title;
            task.description = description;
            task.priority = priority;
            task.dueDate = dueDate;
        }

    } else {

        const newTask = {
            id: Date.now(),
            title: title,
            description: description,
            priority: priority,
            dueDate: dueDate,
            completed: false
        };

        tasks.unshift(newTask);

    }

    saveTasks();

    renderTasks();

    closeModal();

});


// ===================================
// GET TODAY'S DATE
// ===================================

function getTodayDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ===================================
// EDIT TASK
// ===================================

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    editingTaskId = id;

    taskTitle.value = task.title;

    taskDescription.value = task.description;

    taskPriority.value = task.priority;

    taskDate.value = task.dueDate;

    document.getElementById("modal-title").textContent = "Edit Task";

    taskModal.classList.add("show");

}


// ===================================
// DELETE TASK
// ===================================

function deleteTask(id) {

    const confirmDelete = confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    renderTasks();

}


// ===================================
// COMPLETE / UNCOMPLETE TASK
// ===================================

function toggleTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    task.completed = !task.completed;

    saveTasks();

    renderTasks();

}


// ===================================
// FILTER TASKS
// ===================================

function getFilteredTasks() {

    let filteredTasks = [...tasks];

    const today = getTodayDate();

    if (currentFilter === "today") {

        filteredTasks = filteredTasks.filter(task =>
            task.dueDate === today
        );

    }

    else if (currentFilter === "pending") {

        filteredTasks = filteredTasks.filter(task =>
            !task.completed
        );

    }

    else if (currentFilter === "completed") {

        filteredTasks = filteredTasks.filter(task =>
            task.completed
        );

    }

    const searchText = searchInput.value.toLowerCase().trim();

    filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchText) ||
        task.description.toLowerCase().includes(searchText)
    );

    const selectedPriority = priorityFilter.value;

    if (selectedPriority !== "all") {

        filteredTasks = filteredTasks.filter(task =>
            task.priority === selectedPriority
        );

    }

    return filteredTasks;

}


// ===================================
// FORMAT DUE DATE
// ===================================

function formatDueDate(dateString) {

    if (!dateString) return "No due date";

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

}


// ===================================
// DISPLAY TASKS
// ===================================

function renderTasks() {

    taskList.innerHTML = "";

    const filteredTasks = getFilteredTasks();

    updateStatistics();

    document.getElementById("section-title").textContent =
        currentFilter === "all" ? "All Tasks" :
        currentFilter === "today" ? "Today's Tasks" :
        currentFilter === "pending" ? "Pending Tasks" :
        "Completed Tasks";

    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

        taskList.style.display = "none";

        return;

    }

    emptyState.style.display = "none";

    taskList.style.display = "flex";


    filteredTasks.forEach(task => {

        const card = document.createElement("div");

        card.className = "task-card";

        if (task.completed) {
            card.classList.add("completed");
        }

        // CHECKBOX

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.className = "task-check";

        checkbox.checked = task.completed;

        checkbox.setAttribute("aria-label", "Mark task as completed");

        checkbox.addEventListener("change", () => toggleTask(task.id));


        // TASK INFORMATION

        const info = document.createElement("div");

        info.className = "task-info";

        const title = document.createElement("h3");

        title.textContent = task.title;

        const description = document.createElement("p");

        const dueDate = formatDueDate(task.dueDate);

        description.textContent =
            `${task.description || "No description"} • ${dueDate}`;


        info.appendChild(title);

        info.appendChild(description);


        // PRIORITY

        const priority = document.createElement("span");

        priority.className = `priority ${task.priority}`;

        priority.textContent = task.priority;


        // ACTION BUTTONS

        const actions = document.createElement("div");

        actions.className = "task-actions";

        const editButton = document.createElement("button");

        editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';

        editButton.title = "Edit task";

        editButton.setAttribute("aria-label", "Edit task");

        editButton.addEventListener("click", () => editTask(task.id));


        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";

        deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';

        deleteButton.title = "Delete task";

        deleteButton.setAttribute("aria-label", "Delete task");

        deleteButton.addEventListener("click", () => deleteTask(task.id));


        actions.appendChild(editButton);

        actions.appendChild(deleteButton);


        // ADD ELEMENTS TO CARD

        card.appendChild(checkbox);

        card.appendChild(info);

        card.appendChild(priority);

        card.appendChild(actions);

        taskList.appendChild(card);

    });

}


// ===================================
// SIDEBAR FILTER NAVIGATION
// ===================================

document.querySelectorAll(".nav-link").forEach(link => {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        document.querySelectorAll(".nav-link").forEach(nav => {
            nav.classList.remove("active");
        });

        this.classList.add("active");

        currentFilter = this.dataset.filter;

        renderTasks();

    });

});


// ===================================
// SEARCH TASKS
// ===================================

searchInput.addEventListener("input", renderTasks);


// ===================================
// PRIORITY FILTER
// ===================================

priorityFilter.addEventListener("change", renderTasks);


// ===================================
// INITIALIZE APPLICATION
// ===================================

displayDate();

renderTasks();
