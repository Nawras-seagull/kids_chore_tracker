        // Track points for each kid
        const kids = {
            asir: { total: 0, days: [0,0,0,0,0,0,0] },
            mila: { total: 0, days: [0,0,0,0,0,0,0] },
            ayham: { total: 0, days: [0,0,0,0,0,0,0] }
        };

        // Map kid names to their card index
        const kidIndexMap = { asir: 0, mila: 1, ayham: 2 };

        // Get today's day index (0=Mon, 6=Sun)
        function getTodayIndex() {
            const jsDay = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
            return jsDay === 0 ? 6 : jsDay - 1;
        }

        function updateDisplays() {
            // Update total points
            document.querySelectorAll('.kid-card').forEach((card, idx) => {
                const kid = Object.keys(kidIndexMap)[idx];
                card.querySelector('.points-display').textContent = kids[kid].total + ' pts';
                // Update daily points
                const dayBoxes = card.querySelectorAll('.days-grid .day-box:not(.day-label)');
                kids[kid].days.forEach((pts, i) => {
                    dayBoxes[i].textContent = pts === 0 ? '___' : pts;
                });
            });
            saveKidsData();
        }

        function completeChore(choreIdx, points) {
            const dropdown = document.getElementById('chore-' + choreIdx);
            const kid = dropdown.value;
            if (!kid) {
                alert('Please assign this chore to a kid first!');
                return;
            }
            const btn = dropdown.nextElementSibling;
            if (btn.classList.contains('completed')) return;
            kids[kid].total += points;
            const today = getTodayIndex();
            kids[kid].days[today] += points;
            updateDisplays();
            btn.classList.add('completed');
               confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 }
    });
     // Play sound effect
    const audio = document.getElementById('celebrate-audio');
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
            btn.textContent = 'Done ✔';
            btn.disabled = true;
            dropdown.disabled = true;
            saveKidsData();
        }

        // Store the last day index in localStorage to detect day change
function checkAndResetChoresForNewDay() {
    const today = getTodayIndex();
    const lastDay = localStorage.getItem('lastChoreDay');
    if (lastDay === null || parseInt(lastDay) !== today) {
        resetChoreAssignments();
        localStorage.setItem('lastChoreDay', today);
    }
}

// --- Persistent Storage Helpers ---
function saveKidsData() {
    localStorage.setItem('kidsData', JSON.stringify(kids));
    saveChoreAssignments();
}
function loadKidsData() {
    const data = localStorage.getItem('kidsData');
    if (data) {
        const parsed = JSON.parse(data);
        for (let k in kids) {
            if (parsed[k]) {
                kids[k].total = parsed[k].total;
                kids[k].days = parsed[k].days;
            }
        }
    }
    loadChoreAssignments();
}

// --- Save/Load Chore Assignments ---
function saveChoreAssignments() {
    let assignments = {};
    for (let i = 0; i <= 16; i++) {
        const dropdown = document.getElementById('chore-' + i);
        const btn = dropdown ? dropdown.nextElementSibling : null;
        assignments[i] = {
            value: dropdown ? dropdown.value : "",
            disabled: dropdown ? dropdown.disabled : false,
            completed: btn && btn.classList.contains('completed'),
            btnDisabled: btn ? btn.disabled : false,
            btnText: btn ? btn.textContent : "Done!"
        };
    }
    localStorage.setItem('choreAssignments', JSON.stringify(assignments));
}
function loadChoreAssignments() {
    const data = localStorage.getItem('choreAssignments');
    if (data) {
        const assignments = JSON.parse(data);
        for (let i = 0; i <= 16; i++) {
            const dropdown = document.getElementById('chore-' + i);
            const btn = dropdown ? dropdown.nextElementSibling : null;
            if (dropdown && assignments[i]) {
                dropdown.value = assignments[i].value;
                dropdown.disabled = assignments[i].disabled;
            }
            if (btn && assignments[i]) {
                if (assignments[i].completed) btn.classList.add('completed');
                else btn.classList.remove('completed');
                btn.disabled = assignments[i].btnDisabled;
                btn.textContent = assignments[i].btnText;
            }
        }
    }
}

// --- Reset all chore dropdowns and buttons (but keep scores) ---
function resetChoreAssignments() {
    for (let i = 0; i <= 16; i++) {
        const dropdown = document.getElementById('chore-' + i);
        if (dropdown) {
            dropdown.value = "";
            dropdown.disabled = false;
        }
        const btn = dropdown ? dropdown.nextElementSibling : null;
        if (btn && btn.classList.contains('done-btn')) {
            btn.classList.remove('completed');
            btn.textContent = 'Done!';
            btn.disabled = false;
        }
    }
    localStorage.removeItem('choreAssignments');
}

// --- Reset All Data ---
function resetAllData() {
    if (!confirm("Are you sure you want to reset all scores and history?")) return;
    for (let k in kids) {
        kids[k].total = 0;
        kids[k].days = [0,0,0,0,0,0,0];
    }
    localStorage.removeItem('kidsData');
    localStorage.removeItem('lastChoreDay');
    resetChoreAssignments();
    updateDisplays();
}

// Call this on page load
window.onload = function() {
    loadKidsData();
    checkAndResetChoresForNewDay();
    updateDisplays();
};

        let rewardPointsToDeduct = 0;

function showRewardPicker(points) {
    rewardPointsToDeduct = points;
    document.getElementById('rewardPickerModal').style.display = 'flex';
}

function closeRewardPicker() {
    document.getElementById('rewardPickerModal').style.display = 'none';
}

function giveReward(kid) {
    // Deduct only from total, NOT from today's log
    if (kids[kid].total < rewardPointsToDeduct) {
        alert("Not enough total points for this reward!");
        return;
    }
    kids[kid].total -= rewardPointsToDeduct;
        // Play sound effect
    const audio = document.getElementById('reward-audio');
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
    updateDisplays();
    closeRewardPicker();
    saveKidsData();
}
