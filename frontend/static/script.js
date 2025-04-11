function timeToSeconds(timeStr) {
    if (!timeStr) return null;
    const parts = timeStr.split(":");
    return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
}

function secondsToTimeString(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3).padStart(6, '0');
    return `${minutes}:${secs}`;
}

document.getElementById("driversBtn").addEventListener("click", async () => {
    const drivers = await (await fetch("/get-drivers")).json();

    let html = `<h2>Drivers</h2><table><tr><th>Name</th><th>Surname</th><th>Nationality</th><th>Number</th></tr>`;
    drivers.forEach(d => {
        html += `<tr>
            <td>${d.name}</td>
            <td>${d.surname}</td>
            <td>${d.nationality}</td>
            <td>${d.number}</td>
        </tr>`;
    });
    html += `</table>`;
    document.getElementById("formContainer").style.display = "none";
    document.getElementById("result").innerHTML = html;
});

document.getElementById("teamsBtn").addEventListener("click", async () => {
    const res = await fetch("/get-teams");
    const teams = await res.json();

    let html = `<h2>Teams</h2><table><tr><th>Name</th><th>Nationality</th><th>First Appeareance</th>
    <th>Constructors Championships</th><th>Drivers Championships</th></tr>`;
    teams.forEach(t => {
        html += `<tr>
            <td>${t.teamName}</td>
            <td>${t.teamNationality}</td>
            <td>${t.firstAppeareance ?? "No data"}</td>
            <td>${t.constructorsChampionships ?? "No data"}</td>
            <td>${t.driversChampionships ?? "No data"}</td>
        </tr>`;
    });
    html += `</table>`;
    document.getElementById("formContainer").style.display = "none";
    document.getElementById("result").innerHTML = html;
});


document.getElementById("qualyBtn").addEventListener("click", async () => {
    const res = await fetch("/get-latest-qualy");
    const data = await res.json();
    const info = data.info;
    const qualyResults = data.results;

    qualyResults.sort((a, b) => a.grid_position - b.grid_position);

    let html = `<h2>${info.raceName}</h2>
                <p><strong>Date:</strong> ${info.date}</p>
                <p><strong>Circuit:</strong> ${info.circuitName} (${info.city})</p>
                <table border="1" cellspacing="0" cellpadding="5">
                    <thead>
                        <tr>
                            <th>Driver</th>
                            <th>Team</th>
                            <th>Q1</th>
                            <th>Q2</th>
                            <th>Q3</th>
                            <th>Grid Position</th>
                        </tr>
                    </thead>
                    <tbody>`;

    for (const r of qualyResults) {
        html += `<tr>
                    <td>${r.driverName}</td>
                    <td>${r.teamName}</td>
                    <td>${r.q1 ?? "No data"}</td>
                    <td>${r.q2 ?? "No data"}</td>
                    <td>${r.q3 ?? "No data"}</td>
                    <td>${r.grid_position}</td>
                </tr>`;
    }

    html += `</tbody></table>`;
    document.getElementById("formContainer").style.display = "none";
    document.getElementById("result").innerHTML = html;
});


document.getElementById("raceBtn").addEventListener("click", async () => {
    const res = await fetch("/get-latest-race");
    const data = await res.json();
    const info = data.info;
    const results = data.results;

    results.sort((a, b) => a._id - b._id);

    let html = `<h2>${info.raceName}</h2>
                <p><strong>Date:</strong> ${info.date}</p>
                <p><strong>Circuit:</strong> ${info.circuitName} (${info.city})</p>
                <table border="1" cellspacing="0" cellpadding="5">
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th>Driver</th>
                            <th>Team</th>
                            <th>Grid</th>
                            <th>Time</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>`;

    results.forEach(r => {
        let rowStyle = "";
        if (r._id === 1) rowStyle = 'style="background-color: #FFD700;"';
        else if (r._id === 2) rowStyle = 'style="background-color: #C0C0C0;"';
        else if (r._id === 3) rowStyle = 'style="background-color: #CD7F32;"';

        const isPolePosition = r.grid === 1;
        const driverName = isPolePosition
            ? `<strong>${r.driverName} 🏁</strong>`
            : r.driverName;

        html += `<tr ${rowStyle}>
                    <td>${r._id}</td>
                    <td>${driverName}</td>
                    <td>${r.teamName}</td>
                    <td>${r.grid}</td>
                    <td>${r.time}</td>
                    <td>${r.points}</td>
                </tr>`;
    });

    html += `</tbody></table>`;
    document.getElementById("formContainer").style.display = "none";
    document.getElementById("result").innerHTML = html;
});


document.getElementById("findRaceBtn").addEventListener("click", () => {
    document.getElementById("result").innerHTML = "";
    document.getElementById("formContainer").style.display = "block";
});

document.getElementById("searchBtn").addEventListener("click", async () => {
    const year = document.getElementById("yearInput").value;
    const round = document.getElementById("roundInput").value;

    if (!year || !round) {
        alert("Please enter both year and round.");
        return;
    }

    const res = await fetch(`/get-race/${year}/${round}`);
    if (!res.ok) {
        document.getElementById("result").innerHTML = `<p>Error fetching race data.</p>`;
        return;
    }

    const data = await res.json();
    const race = data.races;
    const results = race.results;

    let html = `<h2>${race.raceName}</h2>
                <p><strong>Date:</strong> ${race.date}</p>
                <p><strong>Circuit:</strong> ${race.circuit.circuitName} (${race.circuit.city})</p>
                <table border="1" cellspacing="0" cellpadding="5">
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th>Driver</th>
                            <th>Team</th>
                            <th>Grid</th>
                            <th>Time</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>`;

    results.sort((a, b) => a.position - b.position).slice(0, 10).forEach(r => {
        let rowStyle = "";
        if (r.position === 1) rowStyle = 'style="background-color: #FFD700;"';
        else if (r.position === 2) rowStyle = 'style="background-color: #C0C0C0;"';
        else if (r.position === 3) rowStyle = 'style="background-color: #CD7F32;"';

        const isPolePosition = r.grid === 1;
        const driverName = isPolePosition 
            ? `<strong>${r.driver.name} ${r.driver.surname} 🏁</strong>` 
            : `${r.driver.name} ${r.driver.surname}`;

        html += `<tr ${rowStyle}>
                    <td>${r.position}</td>
                    <td>${driverName}</td>
                    <td>${r.team.teamName}</td>
                    <td>${r.grid}</td>
                    <td>${r.time}</td>
                    <td>${r.points}</td>
                </tr>`;
    });

    html += `</tbody></table>`;
    document.getElementById("result").innerHTML = html;
    document.getElementById("formContainer").style.display = "none";
});

let allBets = [];
let originalBets = [];
let sortDesc = false;

function setupDriverSelectLogic() {
    const selects = document.querySelectorAll('.driver-select');

    selects.forEach(select => {
        select.addEventListener('change', () => {
            const selectedValues = Array.from(selects)
                .map(s => s.value)
                .filter(v => v !== "");

            selects.forEach(s => {
                const currentValue = s.value;

                Array.from(s.options).forEach(option => {
                    if (option.value === "" || option.value === currentValue) {
                        option.hidden = false;
                    } else {
                        option.hidden = selectedValues.includes(option.value);
                    }
                });
            });
        });
    });
}

let drivers = [];

async function fetchDrivers() {
    const res = await fetch("/get-drivers");
    drivers = await res.json();
}

function createDriverSelect(index, selectedDriverId = null) {
    const select = document.createElement("select");
    select.name = `position-${index + 1}`;
    select.style.width = "200px";
    select.style.fontSize = "26px";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Choose driver";
    select.appendChild(defaultOption);

    const selectedDriverIds = getSelectedDriverIds();

    drivers.forEach((driver) => {
        const option = document.createElement("option");
        option.value = driver._id;
        option.textContent = `${driver.name} ${driver.surname}`;

        const isSelectedElsewhere = selectedDriverIds.includes(driver._id);
        const isCurrent = selectedDriverId === driver._id;

        if (!isSelectedElsewhere || isCurrent) {
            if (isCurrent) option.selected = true;
            select.appendChild(option);
        }
    });

    select.addEventListener("change", updateAllSelects);
    return select;
}

function getSelectedDriverIds() {
    return Array.from(document.querySelectorAll("select[name^='position']"))
        .map((s) => s.value)
        .filter((v) => v);
}


function updateAllSelects() {
    const selects = document.querySelectorAll("select[name^='position']");
    const currentValues = getSelectedDriverIds();

    selects.forEach((select, i) => {
        const selectedValue = select.value;
        const newSelect = createDriverSelect(i, selectedValue);
        select.replaceWith(newSelect);
    });
}

function renderBetForm(race) {
    let html = `<h2>Upcoming Race: ${race.raceName}</h2>
        <p><strong>Date:</strong> ${race.date}</p>
        <p><strong>Time:</strong> ${race.time}</p>
        <p><strong>Circuit:</strong> ${race.circuitName} (${race.circuitLocation})</p>
        <hr>
        <form id="betForm">
            <h3>Race Prediction</h3>`;

    html += `<div style="display: flex; justify-content: center;"><div>`;
    for (let i = 0; i < 20; i++) {
        html += `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="width: 20px;">${i + 1}.</span>
                <div class="driver-select" id="select-${i}"></div>
            </div>
        `;
    }
    html += `</div></div>`;

    html += `
        <div style="margin-top: 20px;">
            <label for="fastestLapSelect">Fastest Lap:</label><br>
            <select name="fastest-lap" id="fastestLapSelect" style="width: 300px; font-size: 26px; margin-bottom: 10px;"></select>
        </div>

        <div>
            <label for="amount">Amount:</label><br>
            <input type="number" name="amount" min="1" required style="width: 200px; font-size: 16px; margin-bottom: 10px;">
        </div>

        <div>
            <button type="submit" style="font-size: 16px; padding: 8px 16px;">Submit Bet</button>
        </div>
    </form>`;

    document.getElementById("result").innerHTML = html;

    for (let i = 0; i < 20; i++) {
        const container = document.getElementById(`select-${i}`);
        container.appendChild(createDriverSelect(i));
    }

    const fastestLapSelect = document.getElementById("fastestLapSelect");
    fastestLapSelect.innerHTML = `<option value="" disabled selected>Choose driver</option>`;
    drivers.forEach((driver) => {
        const option = document.createElement("option");
        option.value = driver._id;
        option.textContent = `${driver.name} ${driver.surname}`;
        fastestLapSelect.appendChild(option);
    });

    document.getElementById("betForm").addEventListener("submit", async (e) => {
        e.preventDefault();
    
        const form = e.target;
        const predicted_positions = Array.from(form.querySelectorAll("select[name^='position']"))
            .map((s) => s.value);
    
        const fastest_lap = form.fastestLapSelect.value;
        const amount = parseInt(form.amount.value);
    
        const bet = {
            predicted_positions,
            fastest_lap,
            race_date: race.date,
            amount,
            resolved: false
        };
    
        await fetch("/bets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bet)
        });
        
        alert("Bet placed successfully!");
    });    
}

document.getElementById("placeBetBtn").addEventListener("click", async () => {
    console.log("Clicked Place Bet");

    const res = await fetch("/get-next-race");
    if (!res.ok) {
        document.getElementById("result").innerHTML = "<p>Failed to load next race info.</p>";
        return;
    }

    const race = await res.json();
    await fetchDrivers();
    renderBetForm(race);
});

function renderBetsTable() {
    let html = `<h2>All Bets</h2>
        <button id="sortByAmountBtn">Sort by Amount ↓</button><br><br>
        <table border="1" cellspacing="0" cellpadding="5">
        <thead>
            <tr>
                <th>Placed at</th>
                <th>Fastest Lap</th>
                <th>Amount</th>
                <th>Positions</th>
                <th>Edit</th>
                <th>Delete</th>
            </tr>
        </thead>
        <tbody>`;

    allBets.forEach((bet, index) => {
        const localDate = new Date(bet.created_at + "Z");
        const formatted = localDate.toLocaleString("pl-PL");
        html += `<tr id="bet-row-${index}">
            <td>${formatted}</td>
            <td>${bet.fastest_lap}</td>
            <td>${bet.amount}</td>
            <td><button onclick="showPositions(${index})">View</button></td>
            <td><button onclick="editBet(${index})">Edit</button></td>
            <td><button onclick="deleteBet('${bet._id}', ${index})" style="all: unset; cursor: pointer;">✖</button></td>
        </tr>`;
    });

    html += `</tbody></table>
        <div id="betPopup" style="display:none; position:fixed; top:20%; left:50%; transform:translateX(-50%);
        background:white; padding:20px; border:1px solid black; box-shadow:0 0 10px rgba(0,0,0,0.2); z-index:1000;"></div>`;

    document.getElementById("result").innerHTML = html;

    document.getElementById("sortByAmountBtn").addEventListener("click", () => {
        sortDesc = !sortDesc;
        if (sortDesc) {
            allBets.sort((a, b) => b.amount - a.amount);
            document.getElementById("sortByAmountBtn").innerText = "Sort by Amount ↑";
        } else {
            allBets = [...originalBets];
            document.getElementById("sortByAmountBtn").innerText = "Sort by Amount ↓";
        }
        renderBetsTable();
    });

    window.showPositions = (index) => {
        const bet = allBets[index];
        let popupHtml = `<h3>Predicted Positions</h3><ol>`;
        bet.predicted_positions.forEach(name => {
            popupHtml += `<li>${name}</li>`;
        });
        popupHtml += `</ol><button onclick="document.getElementById('betPopup').style.display='none'">Close</button>`;

        const popup = document.getElementById("betPopup");
        popup.innerHTML = popupHtml;
        popup.style.display = "block";
    };

    window.deleteBet = async (id, index) => {
        const confirmed = confirm("Are you sure you want to delete this bet?");
        if (!confirmed) return;

        const res = await fetch(`/bets/${id}`, { method: "DELETE" });

        if (res.ok) {
            alert("Bet deleted!");
            allBets.splice(index, 1);
            renderBetsTable();
        } else {
            alert("Failed to delete bet.");
        }
    };

    window.editBet = async (index) => {
        const bet = allBets[index];
        const race = await fetch("/get-next-race").then(r => r.json());
        await fetchDrivers();
    
        let html = `<h2>Edit Bet</h2>
            <p><strong>Race:</strong> ${race.raceName} (${race.date})</p>
            <form id="editBetForm">
            <h3>Predicted Positions</h3>
            <div style="display: flex; justify-content: center;"><div>`;
    
        for (let i = 0; i < 20; i++) {
            html += `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <span style="width: 20px;">${i + 1}.</span>
                    <select name="position-${i + 1}" style="width: 300px; font-size: 26px; padding: 4px;"></select>
                </div>`;
        }
    
        html += `</div></div>
    
            <div style="margin-top: 20px;">
                <label style="display: block; margin-bottom: 4px;">Fastest Lap:</label>
                <select name="fastest-lap" id="editFastestLapSelect" style="width: 300px; font-size: 26px; padding: 4px;">
                    <option value="">Choose driver</option>
                </select>
            </div>
    
            <div style="margin-top: 20px;">
                <label style="display: block; margin-bottom: 4px;">Amount:</label>
                <input type="number" name="amount" min="1" required value="${bet.amount}" style="width: 300px; font-size: 26px; padding: 4px;">
            </div>
    
            <br>
            <div style="display: flex; justify-content: center; gap: 12px;">
                <button type="submit">Save Changes</button>
                <button type="button" id="cancelEditBtn">Cancel</button>
            </div>
            </form>`;
    
        document.getElementById("result").innerHTML = html;
    
        for (let i = 0; i < 20; i++) {
            const select = document.querySelector(`select[name="position-${i + 1}"]`);
            const current = bet.predicted_positions[i];
        
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Choose driver";
            select.appendChild(defaultOption);
        
            drivers.forEach((driver) => {
                const fullName = `${driver.name} ${driver.surname}`;
                const option = document.createElement("option");
                option.value = driver._id;
                option.textContent = fullName;
        
                if (fullName === current) {
                    option.selected = true;
                }
        
                select.appendChild(option);
            });
        
            select.style.width = "300px";
            select.style.fontSize = "26px";
            select.style.padding = "4px";
        }                
    
        const fastestLapSelect = document.getElementById("editFastestLapSelect");
        fastestLapSelect.innerHTML = `<option value="">Choose driver</option>`;

        drivers.forEach((driver) => {
            const option = document.createElement("option");
            option.value = driver._id;
            option.textContent = `${driver.name} ${driver.surname}`;
            
            if (`${driver.name} ${driver.surname}` === bet.fastest_lap) {
                option.selected = true;
            }

            fastestLapSelect.appendChild(option);
        });

        fastestLapSelect.style.width = "300px";
        fastestLapSelect.style.fontSize = "26px";
        fastestLapSelect.style.padding = "4px";
    
        document.getElementById("editBetForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const form = e.target;
    
            const predicted_positions = [];
            for (let i = 0; i < 20; i++) {
                const value = form[`position-${i + 1}`].value;
                predicted_positions.push(value);
            }
    
            const updated = {
                predicted_positions,
                fastest_lap: form["fastest-lap"].value,
                amount: parseInt(form.amount.value),
                race_date: race.date,
                created_at: bet.created_at,
                resolved: bet.resolved
            };
    
            const res = await fetch(`/bets/${bet._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated)
            });
    
            if (res.ok) {
                alert("Bet updated!");
                document.getElementById("allBetsBtn").click();
            } else {
                alert("Failed to update bet.");
            }
        });
    
        document.getElementById("cancelEditBtn").addEventListener("click", () => {
            renderBetsTable();
        });
    };    
}

document.getElementById("allBetsBtn").addEventListener("click", async () => {
    const res = await fetch("/bets");
    allBets = await res.json();
    originalBets = [...allBets];
    sortDesc = false;
    renderBetsTable();
});



