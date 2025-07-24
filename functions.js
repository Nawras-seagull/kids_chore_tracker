// Call this on page load
window.onload = function() {
    loadKidsData();
    checkAndResetChoresForNewDay();
    updateDisplays();
    
     

};

// Call these functions on page load
document.addEventListener('DOMContentLoaded', function() {
    renderChores();
    renderTrackers();
    renderRewards();
    saveKidsData();
  
});

// Define your kids and their thresholds
const kids = [
    { id: 'asir', name: 'Asir', threshold: 110 },
    { id: 'mila', name: 'Mila', threshold: 70 },
    { id: 'ayham', name: 'Ayham', threshold: 50 },
    { id: 'nawras', name: 'Nawras', threshold: 500 } // Added Nawras
];

// Define your chores
const chores = [
    { icon: '🍽️', label: 'Unload Dishwasher', defaultPoints: 4 },
    { icon: '🧹', label: 'Kitchen Floor', defaultPoints: 5 },
    { icon: '🧽', label: 'Kitchen Tops', defaultPoints: 7 },
    { icon: '🍳', label: 'Kitchen Stove', defaultPoints: 7 },
    { icon: '👕', label: 'Collect Clothes', defaultPoints: 7 },
    { icon: '👚', label: 'Put Out Clothes', defaultPoints: 3 },
    { icon: '🛏️', label: 'Kids’ Room Floor', defaultPoints: 5 },
    { icon: '🖥️', label: 'Desk', defaultPoints: 2 },
    { icon: '🛏️', label: 'Bed', defaultPoints: 2 },
    { icon: '🚪', label: 'Corridor', defaultPoints: 2 },
    { icon: '🚰', label: 'Bathroom Sink', defaultPoints: 2 },
    { icon: '🛁', label: 'Bathroom Floor', defaultPoints: 2 },
    { icon: '🛋️', label: 'Living Room', defaultPoints: 5 },
    { icon: '🌇', label: 'Balcony', defaultPoints: 2 },
    { icon: '🗑️', label: 'Garbage', defaultPoints: 3 },
    { icon: '🪴', label: 'Plant Watering', defaultPoints: 2 },
    { icon: '⚡', label: 'Fight', defaultPoints: -1 },
    { icon: '❓', label: 'Mystery Point', defaultPoints: 1 }
];

// Generate chores grid
function renderChores() {
    const grid = document.querySelector('.chores-grid');
    grid.innerHTML = `
        <div class="chore-header">Chore Adventure</div>
        <div class="chore-header">Points</div>
        <div class="chore-header">Assigned To</div>
        <div class="chore-header">Complete</div>
    `;
    chores.forEach((chore, i) => {
        grid.innerHTML += `
            <div class="chore-item">
                <span class="icon">${chore.icon}</span>
                <span>${chore.label}</span>
            </div>
            <div class="chore-points">
                ${chore.defaultPoints === -1 || chore.defaultPoints === 1
                    ? `<div class="${chore.defaultPoints < 0 ? 'negative-points' : ''}">${chore.defaultPoints}</div>`
                    : `<input type="number" id="chore-points-${i}" value="${chore.defaultPoints}" min="-50" max="50" style="width:40px;text-align:center;">`
                }
            </div>
            <select class="chore-dropdown" id="chore-${i}">
                <option value="">Choose Kid</option>
                ${kids.map(kid => `<option value="${kid.id}">${kid.name}</option>`).join('')}
            </select>
            <button class="done-btn" onclick="completeChore(${i}, getChorePoints(${i}))">Done!</button>
        `;
    });
}

// Generate trackers
function renderTrackers() {
    const grid = document.querySelector('.kids-grid');
    grid.innerHTML = '';
    kids.forEach(kid => {
        grid.innerHTML += `
            <div class="kid-card">
                <div class="kid-name">${kid.name}</div>
                <div class="points-display" id="points-display-${kid.id}">___ pts</div>
                <div class="days-grid" id="days-grid-${kid.id}">
                    <div class="day-box day-label">MON</div>
                    <div class="day-box day-label">TUE</div>
                    <div class="day-box day-label">WED</div>
                    <div class="day-box day-label">THU</div>
                    <div class="day-box day-label">FRI</div>
                    <div class="day-box day-label">SAT</div>
                    <div class="day-box day-label">SUN</div>
                    ${[...Array(7)].map(() => `<div class="day-box">___</div>`).join('')}
                </div>
                <div class="week-summary" id="week-summary-${kid.id}"></div>
            </div>
        `;
    });
}



// Track points for each kid
const kidsData = {
    asir: { total: 32, days: [0,0,0,0,0,0,0] },
    mila: { total: 63, days: [0,0,0,0,0,0,0] },
    ayham: { total: 0, days: [0,0,0,0,0,0,0] },
    nawras: { total: 0, days: [0,0,0,0,0,0,0] } // Added Nawras
};

// Map kid names to their card index
const kidIndexMap = { asir: 0, mila: 1, ayham: 2, nawras: 3 }; // Added Nawras

// Get today's day index (0=Mon, 6=Sun)
function getTodayIndex() {
    const jsDay = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    return jsDay === 0 ? 6 : jsDay - 1;
}

function updateDisplays() {
    // Update total points
    document.querySelectorAll('.kid-card').forEach((card, idx) => {
        const kid = Object.keys(kidIndexMap)[idx];
        card.querySelector('.points-display').textContent = kidsData[kid].total + ' pts';
        // Update daily points
        const dayBoxes = card.querySelectorAll('.days-grid .day-box:not(.day-label)');
        kidsData[kid].days.forEach((pts, i) => {
            dayBoxes[i].textContent = pts === 0 ? '___' : pts;
        });
    });

    saveKidsData();

        updateWeeklySummaries();
        
          // Only check for weekly winner if it's a new week (Monday)
      if (isNewWeek()) {
        checkForWeeklyWinner();
        
    } else {
        updateWeeklyWinnerBanner(); // Show banner if there are winners from last week
    }  
        

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
    kidsData[kid].total += points;
    const today = getTodayIndex();
    kidsData[kid].days[today] += points;



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
    localStorage.setItem('kidsData', JSON.stringify(kidsData));
    saveChoreAssignments();
}
function loadKidsData() {
    const data = localStorage.getItem('kidsData');
    if (data) {
        const parsed = JSON.parse(data);
        for (let k in kidsData) {
            if (parsed[k]) {
                kidsData[k].total = parsed[k].total;
                kidsData[k].days = parsed[k].days;
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
    for (let k in kidsData) {
        kidsData[k].total = 0;
        kidsData[k].days = [0,0,0,0,0,0,0];
    }
    localStorage.removeItem('kidsData');
    localStorage.removeItem('lastChoreDay');
    resetChoreAssignments();
    updateDisplays();
}



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
    if (kidsData[kid].total < rewardPointsToDeduct) {
        alert("Not enough total points for this reward!");
        return;
    }
    kidsData[kid].total -= rewardPointsToDeduct;
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
// Calculate sum of points for the current week (days array)
function getWeeklyPoints(kid) {
    return kidsData[kid].days.reduce((sum, pts) => sum + pts, 0);
}
// Check for weekly winner and reset points
function checkForWeeklyWinner() {
    const thresholds = { asir: 110, mila: 70, ayham: 50, nawras: 60 }; // Added Nawras
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
    for (const kid in kidsData) {
        if (kidsData[kid]) {
            kidsData[kid].days = [0,0,0,0,0,0,0];
        }
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
        
        // Add click handler to the banner
        banner.onclick = function() {
            // Play celebration sound
            const audio = document.getElementById('celebrate-audio2');
            if (audio) {
                audio.currentTime = 0;
                audio.play();
            }
            
            // Create confetti burst
       const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            const timeLeft = end - Date.now();
            if (timeLeft <= 0) return;

            const particleCount = 2;
            const angle = (timeLeft / duration) * 360 * 4;
            
            confetti({
                particleCount,
                angle: angle,
                spread: 20,
                origin: { x: 0.5, y: 0.5 },
                colors: ['#ffd700', '#ff0000', '#00ff00', '#0000ff'],
                ticks: 300
            });
            
            requestAnimationFrame(frame);
        }());
       
            
            // Add side bursts for multiple winners
            if (weeklyWinners.length > 1) {
                setTimeout(() => {
                    confetti({
                        particleCount: 100,
                        spread: 60,
                        origin: { x: 0.3, y: 0.7 }
                    });
                    confetti({
                        particleCount: 100,
                        spread: 60,
                        origin: { x: 0.7, y: 0.7 }
                    });
                }, 200);
            }
        };
        
        // Rest of your existing banner update code...
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
        // Remove click handler when banner is hidden
        banner.onclick = null;
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
    const audio = document.getElementById('celebrate-audio2');
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
    // Remove test data! Only use real kidsData
    const thresholds = { asir: 110, mila: 70, ayham: 50, nawras: 60 };
    for (const kid in thresholds) {
        const weekSum = kidsData[kid].days.reduce((a, b) => a + b, 0);
        const el = document.getElementById('week-summary-' + kid);
        if (el) {
            el.textContent = `This week: ${weekSum} / ${thresholds[kid]}`;
        }
    }
}

// Rewards system
const rewards = [
    { icon: '📱', label: '10 min extra screen time', points: 1, id: 'screen-qty' },
    { icon: '💸', label: '5TL', points: 1, id: 'tl-qty' },
    { icon: '🍭', label: 'Treat', points: 1, id: 'treat-qty' },
    { icon: '🎨', label: 'Skip one chore', points: 10, id: 'skipchore-qty' },
    { icon: '🎪', label: 'Skip Class', points: 10, id: 'skipclass-qty' },
    { icon: '🍿', label: 'Movie Night', points: 15, id: 'movie-qty' },
    { icon: '🌟', label: 'Stay up 15 min late', points: 10, id: 'late-qty' },
    { icon: '🍕', label: 'Choose dinner menu', points: 10, id: 'dinner-qty' },
    { icon: '🍦', label: 'Ice Cream', points: 2, id: 'icecream-qty' }
];

function renderRewards() {
    const grid = document.getElementById('rewardsGrid');
    grid.innerHTML = '';
    rewards.forEach(reward => {
        grid.innerHTML += `
            <div class="reward-item">
                <div class="reward-text">
                    <span class="icon">${reward.icon}</span>
                    <span>${reward.label}</span>
                </div>
                <div class="reward-cost">
                    ${reward.points} pts
                    <input type="number" id="${reward.id}" min="1" value="1" style="width:44px; margin-left:8px; border-radius:8px; border:1.5px solid #ffd166; text-align:center;">
                    <button onclick="showRewardPicker(${reward.points}, '${reward.id}')">Cash Out</button>
                </div>
            </div>
        `;
    });
}


// Helper: Returns true if today is Monday and it's a new week
function isNewWeek() {
    const today = getTodayIndex(); // 0 = Monday
    const lastWeek = localStorage.getItem('lastCheckedWeek');
    const currentWeek = new Date().getFullYear() + '-' + getWeekNumber(new Date());
    if (today === 2 && lastWeek !== currentWeek) {
        localStorage.setItem('lastCheckedWeek', currentWeek);
        return true;
    }
    return false;
}

// Helper: Get ISO week number
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    return weekNo;
}