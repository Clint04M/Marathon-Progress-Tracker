function formatSpeed(speed) {
    return `${speed.toFixed(2)} km/h`;
}

function formatTime(time) {
    return `${time.toFixed(2)} h`;
}

function showError(message) {
    document.getElementById('errorMsg').innerText = message;
    document.getElementById('results').innerHTML = "";
}

function clearError() {
    document.getElementById('errorMsg').innerText = "";
}

function submitData() {
    clearError();
    const totalDistance = parseFloat(document.getElementById('totalDistance').value);
    const coveredDistance = parseFloat(document.getElementById('coveredDistance').value);
    const elapsedTime = parseFloat(document.getElementById('elapsedTime').value);
    const targetTime = parseFloat(document.getElementById('targetTime').value);

    // Input validation
    if (isNaN(totalDistance) || isNaN(coveredDistance) ||
        isNaN(elapsedTime) || isNaN(targetTime) ||
        totalDistance <= 0 || coveredDistance < 0 ||
        elapsedTime <= 0 || targetTime <= 0) {
        showError("Please enter positive numeric values for all fields.");
        return;
    }
    if (coveredDistance > totalDistance) {
        showError("Covered distance cannot exceed total distance!");
        return;
    }
    if (elapsedTime > targetTime) {
        showError("Elapsed time exceeds the target time!");
        return;
    }
    if (elapsedTime === 0) {
        showError("Elapsed time cannot be zero.");
        return;
    }

    
    const currentSpeed = (coveredDistance / elapsedTime);
    const remainingDistance = totalDistance - coveredDistance;
    const remainingTime = targetTime - elapsedTime;
    let requiredSpeed;

    if (remainingDistance <= 0) {
        requiredSpeed = 0;
    } else if (remainingTime > 0) {
        requiredSpeed = remainingDistance / remainingTime;
    } else {
        requiredSpeed = null; 
    }

    const percent = Math.min(100, (coveredDistance / totalDistance) * 100);

    
    let resultHTML = `
        <div class="progress-container">
            <div class="progress-bar" style="width: ${percent}%;"></div>
        </div>
        <div style="margin-bottom:8px;color:#5E388C;">Progress: <b>${percent.toFixed(1)}%</b></div>
        <p>Current speed: <b>${formatSpeed(currentSpeed)}</b></p>
    `;
    if (requiredSpeed === null) {
        resultHTML += `<p class='error'>It's impossible to reach the target time. 😢</p>`;
    } else {
        resultHTML += `<p>Required speed to finish in target time: <b>${formatSpeed(requiredSpeed)}</b></p>`;
    }
    resultHTML += `<p>Elapsed time: <b>${formatTime(elapsedTime)}</b> &nbsp; | &nbsp; Remaining distance: <b>${remainingDistance.toFixed(2)} km</b></p>`;
    document.getElementById('results').innerHTML = resultHTML;

   
    setTimeout(() => {
        const bar = document.querySelector('.progress-bar');
        if (bar) bar.style.width = percent + '%';
    }, 80);

    
    const data = {
        totalDistance,
        coveredDistance,
        elapsedTime,
        targetTime,
        currentSpeed: currentSpeed,
        requiredSpeed: requiredSpeed,
        timestamp: new Date().toISOString().slice(0, 19).replace("T", " ")
    };

    saveToBackend(data);
}

function saveToBackend(data) {
    fetch('save_race.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }).then(res => res.json())
    .then(resp => {
        if (resp.status !== "success") {
            throw new Error(resp.message);
        }
    }).catch(err => {
        showError("Error saving data: " + err.message);
    });
}