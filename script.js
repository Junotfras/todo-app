// --- DOM REFERENCES ---
const taskForm = document.getElementById("task-form");
const confirmCloseDialog = document.getElementById("confirm-close-dialog");
const openTaskFormBtn = document.getElementById("open-task-form-btn");
const closeTaskFormBtn = document.getElementById("close-task-form-btn");
const addOrUpdateTaskBtn = document.getElementById("add-or-update-task-btn");
const cancelBtn = document.getElementById("cancel-btn");
const discardBtn = document.getElementById("discard-btn");
const tasksContainer = document.getElementById("tasks-container");
const titleInput = document.getElementById("title-input");
const dateInput = document.getElementById("date-input");
const descriptionInput = document.getElementById("description-input");

// --- STATE ---
const taskData = JSON.parse(localStorage.getItem("data")) || [];
let currentTask = {};

// --- HELPERS ---
const removeSpecialChars = (val) => {
  return val.trim().replace(/[^A-Za-z0-9\-\s]/g, "");
};

const addOrUpdateTask = () => {
  // TWEAK: Use native browser validation instead of alert()
  if (!titleInput.value.trim()) {
      titleInput.reportValidity(); 
      return;
  }

  const dataArrIndex = taskData.findIndex((item) => item.id === currentTask.id);

  const taskObj = {
    id: `${removeSpecialChars(titleInput.value).toLowerCase().split(" ").join("-")}-${Date.now()}`,
    title: removeSpecialChars(titleInput.value),
    date: dateInput.value || "No Due Date", // Fallback text
    description: removeSpecialChars(descriptionInput.value),
  };

  if (dataArrIndex === -1) {
    taskData.unshift(taskObj);
  } else {
    taskData[dataArrIndex] = taskObj;
  }

  localStorage.setItem("data", JSON.stringify(taskData));
  updateTaskContainer();
  reset();
};

const updateTaskContainer = () => {
  tasksContainer.innerHTML = "";

  taskData.forEach(({ id, title, date, description }) => {
    // TWEAK: Improved HTML structure for styling
    tasksContainer.innerHTML += `
      <div class="task" id="${id}">
        <h3>${title}</h3>
        <span class="task-date">📅 ${date}</span>
        <p class="task-desc">${description}</p>
        
        <div class="task-actions">
            <button onclick="editTask(this)" type="button" class="btn secondary-btn task-btn">Edit</button>
            <button onclick="deleteTask(this)" type="button" class="btn danger-btn task-btn">Delete</button>
        </div>
      </div>
    `;
  });
};

const deleteTask = (buttonEl) => {
  // Traverse up to find the .task div (div > div > button)
  const taskEl = buttonEl.closest('.task'); 
  const dataArrIndex = taskData.findIndex((item) => item.id === taskEl.id);
  taskEl.remove();
  taskData.splice(dataArrIndex, 1);
  localStorage.setItem("data", JSON.stringify(taskData));
};

const editTask = (buttonEl) => {
  const taskEl = buttonEl.closest('.task');
  const dataArrIndex = taskData.findIndex((item) => item.id === taskEl.id);
  currentTask = taskData[dataArrIndex];

  titleInput.value = currentTask.title;
  dateInput.value = currentTask.date === "No Due Date" ? "" : currentTask.date;
  descriptionInput.value = currentTask.description;

  addOrUpdateTaskBtn.innerText = "Update Task";
  taskForm.classList.remove("hidden");
};

const reset = () => {
  addOrUpdateTaskBtn.innerText = "Save Task";
  titleInput.value = "";
  dateInput.value = "";
  descriptionInput.value = "";
  taskForm.classList.add("hidden");
  currentTask = {};
};

if (taskData.length) {
  updateTaskContainer();
}

// --- EVENT LISTENERS ---
openTaskFormBtn.addEventListener("click", () =>
  taskForm.classList.remove("hidden")
);

closeTaskFormBtn.addEventListener("click", () => {
  const formInputsContainValues = titleInput.value || dateInput.value || descriptionInput.value;
  const formInputValuesUpdated = titleInput.value !== currentTask.title || dateInput.value !== currentTask.date || descriptionInput.value !== currentTask.description;

  if (formInputsContainValues && formInputValuesUpdated) {
    confirmCloseDialog.showModal();
  } else {
    reset();
  }
});

cancelBtn.addEventListener("click", () => confirmCloseDialog.close());

discardBtn.addEventListener("click", () => {
  confirmCloseDialog.close();
  reset();
});

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addOrUpdateTask();
});

// Expose to window for inline HTML onclicks
window.editTask = editTask;
window.deleteTask = deleteTask;
