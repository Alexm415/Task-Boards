// Retrieve tasks and nextId from localStorage
const buttonEL = $("#addTask");
let dialogEL = document.querySelector("modal");
let taskList = JSON.parse(localStorage.getItem("newTasks"));
let nextId = parseInt(localStorage.getItem("nextId"));
const todoEl = $("#todo-cards");
const inProgressEl = $("#in-progress-cards");
const doneEl = $("#done-cards");
let myModal = null;
function displayMessage(type, message) {
  msgDiv.textContent = message;
  msgDiv.setAttribute("class", type);
}

// Todo: create a function to generate a unique task id
function generateTaskId() {
  if (!nextId) {
    nextId = 0;
  }
  nextId++;
  localStorage.setItem("nextId", nextId);
  return nextId;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  const postElement = document.createElement("div");
  postElement.classList.add("task-card");
  postElement.classList.add("draggable");
  postElement.setAttribute("id", task.id);
  // Create elements for the task details
  const titleElement = document.createElement("h2");
  const dateElement = document.createElement("h3");
  const contentElement = document.createElement("p");
  const deleteButton = document.createElement("button");

  // Set the content of the elements
  titleElement.textContent = task.taskTitle;
  dateElement.textContent = task.dueDate;
  contentElement.textContent = task.taskDescription;
  deleteButton.textContent = "Delete"; // Button to delete the task

  // Append the details to the task card
  postElement.appendChild(titleElement);
  postElement.appendChild(dateElement);
  postElement.appendChild(contentElement);
  postElement.appendChild(deleteButton);

  // Add event listener for delete button
  deleteButton.addEventListener("click", handleDeleteTask);

  if (task.dueDate && task.status !== "complete") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");
    const isDueToday = now.isSame(taskDueDate, "day");
    const isOverdue = now.isAfter(taskDueDate);

    if (isDueToday) {
      postElement.classList.add("bg-warning", "text-white");
    } else if (isOverdue) {
      postElement.classList.add("bg-danger", "text-white");
      deleteButton.classList.add("border-light");
    }
  }

  // Append the task card to the task list
  return postElement;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  console.log(taskList);
  todoEl.empty();
  inProgressEl.empty();
  doneEl.empty();
  for (let i = 0; i < taskList.length; i++) {
    const currentCard = createTaskCard(taskList[i]);
    if (taskList[i].status === "todo") {
      todoEl.append(currentCard);
    } else if (taskList[i].status === "in-progress") {
      inProgressEl.append(currentCard);
    } else if (taskList[i].status === "done") {
      currentCard.setAttribute(
        "style",
        "background-color: lightgray !important;"
      );
      doneEl.append(currentCard);
    }
    console.log(taskList[i]);
  }
  $(".draggable").draggable();
  $("#sortable").sortable();
  const TaskCard = ({ task }) => {
    const cardStyle =
      task.status === "done"
        ? { backgroundColor: "lightgray" }
        : { backgroundColor: "white" };

    return;
  };
  const onDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    // Update the task's status based on the destination column
    const updatedTask = { ...task, status: destination.droppableId };

    // Set the updated task in your state
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === task.id ? updatedTask : t))
    );
  };
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  console.log(event);
  event.preventDefault();
  const title = document.querySelector("#taskTitle").value;
  const date = document.querySelector("#datePicker").value;
  const description = document.querySelector("#taskDescription").value;
  myModal.hide();
  if (title === "") {
    displayMessage("error", "title cannot be blank");
  } else if (date === "") {
    displayMessage("error", "Date cannot be blank");
  } else if (description === "") {
    displayMessage("error", "Description cannot be blank");
  } else {
    const tasks = {
      taskTitle: title,
      dueDate: date,
      taskDescription: description,
      id: generateTaskId(),
      status: "todo",
    };
    console.log(tasks);
    document.querySelector("#taskTitle").value = "";
    document.querySelector("#datePicker").value = "";
    document.querySelector("#taskDescription").value = "";
    if (!taskList) {
      taskList = [];
    }
    taskList.push(tasks);
    localStorage.setItem("newTasks", JSON.stringify(taskList));
    renderTaskList();
  }
}
// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
  const taskCard = event.target.closest(".task-card");
  const taskId = taskCard.id;

  // Filter out the task from the taskList
  taskList = taskList.filter((task) => task.id !== parseInt(taskId));

  // Update local storage
  localStorage.setItem("newTasks", JSON.stringify(taskList));

  // Re-render the task list
  renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  console.log(event);
  console.log("drop");
  const taskId = ui.draggable[0].id;
  console.log(taskId);

  // Retrieve id of the lane where the card was dropped
  const newStatus = event.target.id;
  console.log(newStatus);

  // Update task status in taskList array
  const updatedTaskList = taskList.map((task) => {
    console.log(task.id, taskId);
    if (task.id == taskId) {
      task.status = newStatus;
    }
    return task;
  });
  localStorage.setItem("tasks", JSON.stringify(updatedTaskList));

  // Render updated task list
  renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker

$(document).ready(function () {
  buttonEL.on("click", handleAddTask);
  myModal = new bootstrap.Modal(document.getElementById("formModal"), {
    keyboard: false,
  });
  $(function () {
    $("#datePicker").datepicker();
  });
  $(function () {
    $(".lane").droppable({
      drop: function (event, ui) {
        $(this).addClass("ui-state-highlight").find("p").html("Dropped!");
        handleDrop(event, ui);
      },
    });
  });
  renderTaskList();
});
