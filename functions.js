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
                updateWeeklySummaries();

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
              saveKidsData();
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
let rewardQty = 1;

function showRewardPicker(points, qtyInputId) {
    const qtyInput = document.getElementById(qtyInputId);
    rewardQty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10)) : 1;
    rewardPointsToDeduct = points * rewardQty;
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

function getChorePoints(index) {
    const input = document.getElementById('chore-points-' + index);
    return input ? parseInt(input.value, 10) : 0;
}

//////7///////////////
// Track weekly winners (now an array)
let weeklyWinners = [];

// Check for weekly winner and reset points
function checkForWeeklyWinner() {
    const thresholds = { asir: 110, mila: 70, ayham: 50 };
    weeklyWinners = []; // Reset winners array
    
    // Check each kid's weekly points
    for (const kid in thresholds) {
        if (getWeeklyPoints(kid) >= thresholds[kid]) {
            weeklyWinners.push(kid);
        }
    }
    
    // Save winners to localStorage
    localStorage.setItem('weeklyWinners', JSON.stringify(weeklyWinners));
    
    // Reset all weekly points (days array) without affecting total points
    for (const kid in kids) {
        kids[kid].days = [0,0,0,0,0,0,0];
    }
    
    updateDisplays();
    updateWeeklyWinnerBanner();
    
    // Celebrate if there are winners
    if (weeklyWinners.length > 0) {
        celebrateWinners();
    }
}

// Update the winner banner display for multiple winners
function updateWeeklyWinnerBanner() {
    const banner = document.getElementById('weeklyWinnerBanner');
    const winnerText = document.getElementById('weeklyWinnerText');
    
    // Load saved winners if they exist
    const savedWinners = localStorage.getItem('weeklyWinners');
    if (savedWinners) weeklyWinners = JSON.parse(savedWinners);
    
    if (weeklyWinners.length > 0) {
        banner.style.display = 'block';
        
        if (weeklyWinners.length === 1) {
            const kidName = weeklyWinners[0].charAt(0).toUpperCase() + weeklyWinners[0].slice(1);
            winnerText.innerHTML = `
                🏆 ${kidName} IS THIS WEEK'S HERO! 🏆<br>
                <span style="font-size:0.8em;">Super amazing job this week!</span>
            `;
            banner.classList.remove('multiple-winners');
        } else {
            const winnerNames = weeklyWinners.map(kid => 
                `<span class="winner-icon">🏆</span>${kid.charAt(0).toUpperCase() + kid.slice(1)}<span class="winner-icon">🏆</span>`
            ).join(' & ');
            
            winnerText.innerHTML = `
                ${winnerNames}<br>
                <span style="font-size:0.8em;">ARE THIS WEEK'S HEROES!</span><br>
                <span style="font-size:0.7em;">Teamwork makes the dream work!</span>
            `;
            banner.classList.add('multiple-winners');
        }
    } else {
        banner.style.display = 'none';
        banner.classList.remove('multiple-winners');
    }
}

// Fun celebration for winners
function celebrateWinners() {
    // Big confetti explosion
    confetti({
        particleCount: 300,
        spread: 100,
        origin: { y: 0.6 }
    });
    
    // Play celebration sound
    const audio = document.getElementById('celebrate-audio');
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
    
    // Special effect for multiple winners
    if (weeklyWinners.length > 1) {
        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { x: 0.3, y: 0.7 }
            });
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { x: 0.7, y: 0.7 }
            });
        }, 500);
    }
}
//////7///////////////
// End of Track weekly winners
function updateWeeklySummaries() {
    // Set your thresholds here
    const thresholds = { asir: 110, mila: 70, ayham: 50 };
    for (const kid in thresholds) {
        // Sum the kid's days array for the week
        const weekSum = kids[kid].days.reduce((a, b) => a + b, 0);
        const el = document.getElementById('week-summary-' + kid);
        if (el) {
            el.textContent = `This week: ${weekSum} / ${thresholds[kid]}`;
        }
    }
}