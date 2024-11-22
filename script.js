const apiKey = "2a4bf544-b888-4e0f-9bb9-68176cea9247";
const apiUrl = `https://js1-todo-api.vercel.app/api/todos?apikey=${apiKey}`;

const todoContainer = document.querySelector(".todo-container");
const form = document.querySelector(".form");
const inputTodo = document.querySelector("#input-todo");
const errorMessage = document.querySelector("#error-message");

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

    checkbox.addEventListener("change", async () => {
        try {
            checkbox.disabled = true; // Förhindra ytterligare klick under API-anropet
            const completed = checkbox.checked;
            await toggleTodoStatus(todo._id, completed);

            if (completed) {
                todoElement.classList.add("completed");
                todoName.style.textDecoration = "line-through";
            } else {
                todoElement.classList.remove("completed");
                todoName.style.textDecoration = "none";
            }
        } catch (error) {
            checkbox.checked = !checkbox.checked; // Återställ vid fel
            console.error("Misslyckades att uppdatera todo-status.");
        } finally {
            checkbox.disabled = false; // Aktivera checkbox igen
        }
    });

    todoElement.querySelector(".todo-delete").addEventListener("click", async () => {
        if (checkbox.checked) {
            try {
                await deleteTodo(todo._id);
                todoElement.remove();
            } catch (error) {
                console.error("Misslyckades att ta bort todo.");
            }
        } else {
            modal.classList.add("show");
        }
    });
}

async function addTodo() {
    const title = inputTodo.value.trim();
    if (!title) {
        showError("Du måste skriva något för att lägga till en todo!");
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
        hideError();
    } catch (error) {
        console.error(error);
    }
}

async function toggleTodoStatus(id, completed) {
    console.log("Updating todo:", { id, completed });

    try {
        const response = await fetch(`https://js1-todo-api.vercel.app/api/todos/${id}?apikey=${apiKey}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed }),
        });

        const responseData = await response.text();
        console.log("API response:", responseData);

        if (!response.ok) {
            console.error("API Response Error:", responseData);
            throw new Error("Kunde inte uppdatera todo-status");
        }

        console.log("Todo updated successfully:", { id, completed });
    } catch (error) {
        console.error("Fel vid uppdatering av todo-status:", error);
        alert("Det gick inte att uppdatera todo-status. Försök igen senare.");
    }
}




async function deleteTodo(id) {
    const response = await fetch(`https://js1-todo-api.vercel.app/api/todos/${id}?apikey=${apiKey}`, { method: "DELETE" });

    if (!response.ok) {
        throw new Error("Kunde inte ta bort todo");
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
}

function hideError() {
    errorMessage.style.display = "none";
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    addTodo();
});

fetchTodos();
