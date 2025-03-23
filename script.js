document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("taskInput");
    const addTaskButton = document.getElementById("addTaskButton");
    const todoList = document.getElementById("todoList");
    const doneList = document.getElementById("doneList");
    const backgroundInput = document.getElementById("backgroundInput");
    const assistantButton = document.getElementById("assistantButton");
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    addTaskButton.addEventListener("click", function () {
        if (taskInput.value.trim() !== "") {
            addTask(taskInput.value.trim());
            taskInput.value = "";
        }
    });

    function addTask(taskText) {
        const li = document.createElement("li");
        li.textContent = taskText;
        
        const bell = document.createElement("span");
        bell.textContent = "🔔";
        bell.classList.add("bell");
        bell.onclick = function () {
            openScheduleModal(taskText);
        };
        
        li.appendChild(bell);
        li.onclick = function (event) {
            if (event.target !== bell) {
                moveTask(li);
            }
        };
        
        todoList.appendChild(li);
    }

    function moveTask(taskElement) {
        if (taskElement.parentNode === todoList) {
            doneList.appendChild(taskElement);
        } else {
            todoList.appendChild(taskElement);
        }
    }

    function changeBackground() {
        const file = backgroundInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.body.style.backgroundImage = `url('${e.target.result}')`;
            };
            reader.readAsDataURL(file);
        }
    }
    backgroundInput.addEventListener("change", changeBackground);

    function openScheduleModal(taskText) {
        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Pianifica Attività</h3>
                <p>${taskText}</p>
                <label>Data:</label>
                <input type="date" id="taskDate">
                <label>Ora:</label>
                <input type="time" id="taskTime">
                <label>Prezzo (€):</label>
                <input type="number" id="taskPrice" step="0.01">
                <button onclick="saveSchedule('${taskText}')">Salva</button>
                <button onclick="closeModal()">Chiudi</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    window.closeModal = function () {
        document.querySelector(".modal").remove();
    };

    window.saveSchedule = function (taskText) {
        const date = document.getElementById("taskDate").value;
        const time = document.getElementById("taskTime").value;
        const price = parseFloat(document.getElementById("taskPrice").value) || 0;
        
        if (date && time) {
            setTimeout(() => {
                new Notification("Promemoria", { body: `È ora di: ${taskText}` });
            }, new Date(`${date}T${time}`).getTime() - Date.now());
        }
        
        if (price > 0) {
            expenses.push({ task: taskText, price, date });
            localStorage.setItem("expenses", JSON.stringify(expenses));
        }
        closeModal();
    };

    assistantButton.addEventListener("click", function () {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "it-IT";
        recognition.start();
        
        recognition.onresult = function (event) {
            const command = event.results[0][0].transcript.toLowerCase();
            if (command.includes("aggiungi")) {
                const task = command.replace("aggiungi", "").trim();
                if (task) addTask(task);
            }
        };
    });
});
