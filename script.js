const apiKey = "2a4bf544-b888-4e0f-9bb9-68176cea9247";
const apiUrl = `https://js1-todo-api.vercel.app/api/todos?apikey=${apiKey}`;

const todoContainer = document.querySelector(".todo-container");
const form = document.querySelector(".form");
const inputTodo = document.querySelector("#input-todo");

const modal = document.createElement("div");
modal.classList.add("modal");
modal.innerHTML = `
    <div class="modal-content">
        <p>Du kan inte ta bort en todo som inte är klarmarkerad.</p>
        <button id="close-modal">OK</button>
    </div>
`;
document.body.appendChild(modal);

modal.querySelector("#close-modal").addEventListener("click", () => modal.classList.remove("show"));

async function fetchTodos() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Kunde inte hämta todos");

        const todos = await response.json();
        todoContainer.innerHTML = ""; 
        todos.forEach(addTodoToDOM);
    } catch (error) {
        console.error(error);
    }
}

function addTodoToDOM(todo) {
    const todoElement = document.createElement("div");
    todoElement.classList.add("todo");
    if (todo.completed) {
        todoElement.classList.add("completed");
    }
    todoElement.innerHTML = `
        <div class="todo-details">
            <input type="checkbox" class="todo-completed" data-id="${todo._id}" ${todo.completed ? "checked" : ""}>
            <p class="todo-name">${todo.title}</p>
        </div>
        <div class="todo-btn">
            <button class="todo-delete" data-id="${todo._id}">Delete</button>
        </div>
    `;

    todoContainer.appendChild(todoElement);

    const checkbox = todoElement.querySelector(".todo-completed");
    const todoName = todoElement.querySelector(".todo-name");

    todoName.addEventListener("click", () => toggleTodoStatus(todo._id, !todo.completed, todoElement));
    checkbox.addEventListener("change", () => toggleTodoStatus(todo._id, checkbox.checked, todoElement));

    todoElement.querySelector(".todo-delete").addEventListener("click", () => {
        if (!checkbox.checked) {
            modal.classList.add("show");
        } else {
            deleteTodo(todo._id, todoElement);
        }
    });
}

async function addTodo() {
    const title = inputTodo.value.trim();
    if (!title) {
        alert("Du måste skriva något för att lägga till en todo!");
        return;
    }

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
        });

        if (!response.ok) throw new Error("Kunde inte lägga till todo");

        const newTodo = await response.json();
        addTodoToDOM(newTodo);
        inputTodo.value = ""; 
    } catch (error) {
        console.error(error);
    }
}

async function deleteTodo(id, todoElement) {
    try {
        const response = await fetch(`${apiUrl}/${id}?apikey=${apiKey}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Kunde inte ta bort todo");

        todoElement.remove(); 
    } catch (error) {
        console.error(error);
    }
}

async function toggleTodoStatus(id, completed, todoElement) {
    try {
        const response = await fetch(`${apiUrl}/${id}?apikey=${apiKey}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed }),
        });

        if (!response.ok) throw new Error("Kunde inte uppdatera todo");

        const checkbox = todoElement.querySelector(".todo-completed");
        const todoName = todoElement.querySelector(".todo-name");

        if (completed) {
            todoElement.classList.add("completed");
            checkbox.checked = true;
        } else {
            todoElement.classList.remove("completed");
            checkbox.checked = false;
        }
    } catch (error) {
        console.error("Fel vid uppdatering av todo status: ", error);
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    addTodo();
});

fetchTodos();
