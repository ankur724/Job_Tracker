// Initialize job fields and counter
const jobFieldsContainer = document.getElementById('job-fields');
const addFieldButton = document.getElementById('add-field');
const showSummaryButton = document.getElementById('show-summary');
const downloadExcelButton = document.getElementById('download-excel');
const newDayButton = document.getElementById('new-day');

// Get current date
const today = new Date().toLocaleDateString();
let dataSaved = false; // Track if data has been saved

// Load saved data and check if it's a new day
chrome.storage.local.get(['jobFields', 'lastSavedDate', 'weeklyData'], (result) => {
    const lastSavedDate = result.lastSavedDate || today;
    const jobFields = result.jobFields || [];
    
    if (today !== lastSavedDate) {
        // Save yesterday's data and reset for today
        saveDataForDay(lastSavedDate, jobFields);
        chrome.storage.local.set({ jobFields: [], lastSavedDate: today });
        downloadExcelButton.disabled = false;
    } else {
        jobFields.forEach((field, index) => addField(field.name, field.count, index));
        downloadExcelButton.disabled = Object.keys(result.weeklyData || {}).length === 0;
    }
});

// Function to add a new field
function addField(name = '', count = 0, index = null) {
    const fieldDiv = document.createElement('div');
    fieldDiv.classList.add('job-field');
  
    const nameSpan = document.createElement('span');
    nameSpan.innerText = name || 'Enter name';
    nameSpan.classList.add('job-name-span');
    fieldDiv.appendChild(nameSpan);

    const countSpan = document.createElement('span');
    countSpan.innerText = `: ${count}`;
    countSpan.classList.add('count-span');
    fieldDiv.appendChild(countSpan);
  
    const incrementButton = document.createElement('button');
    incrementButton.innerText = '+';
    incrementButton.classList.add('circle-button');
    incrementButton.onclick = () => {
        count += 1;
        countSpan.innerText = `: ${count}`;
        saveField(nameSpan.innerText, count, index);
    };
    fieldDiv.appendChild(incrementButton);

    const decrementButton = document.createElement('button');
    decrementButton.innerText = '-';
    decrementButton.classList.add('circle-button');
    decrementButton.onclick = () => {
        if (count > 0) {
            count -= 1;
            countSpan.innerText = `: ${count}`;
            saveField(nameSpan.innerText, count, index);
        }
    };
    fieldDiv.appendChild(decrementButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.classList.add('delete-button');
    deleteButton.onclick = () => {
        fieldDiv.remove();
        deleteField(index);
    };
    fieldDiv.appendChild(deleteButton);

    jobFieldsContainer.appendChild(fieldDiv);

    if (index === null) {
        index = jobFieldsContainer.children.length - 1;
        saveField(nameSpan.innerText, count, index);
    }

    nameSpan.contentEditable = true;
    nameSpan.onblur = () => saveField(nameSpan.innerText, count, index);
}

// Save field data to storage
function saveField(name, count, index) {
    chrome.storage.local.get(['jobFields'], (result) => {
        const jobFields = result.jobFields || [];
        jobFields[index] = { name, count };
        chrome.storage.local.set({ jobFields });
    });
}

// Delete field data
function deleteField(index) {
    chrome.storage.local.get(['jobFields'], (result) => {
        const jobFields = result.jobFields || [];
        if (index !== null && jobFields[index]) {
            jobFields.splice(index, 1);
            chrome.storage.local.set({ jobFields });
        }
    });
}

// Function to save data for the day
function saveDataForDay(date, jobFields) {
    chrome.storage.local.get(['weeklyData'], (result) => {
        const weeklyData = result.weeklyData || {};
        weeklyData[date] = jobFields;
        chrome.storage.local.set({ weeklyData });
        dataSaved = true; // Mark data as saved
    });
}

// Add new field
addFieldButton.onclick = () => addField();

// Show summary of all fields
showSummaryButton.onclick = () => {
    chrome.storage.local.get(['jobFields'], (result) => {
        const jobFields = result.jobFields || [];
        let totalJobs = 0;
        let summary = `Today's Date: ${today}\n\nJob Applications:\n`;

        jobFields.forEach(field => {
            summary += `${field.name}: ${field.count}\n`;
            totalJobs += field.count;
        });

        summary += `\nTotal Jobs Applied: ${totalJobs}`;
        alert(summary);
    });
};

// Function to download the data as an Excel file
downloadExcelButton.onclick = () => {
    if (!dataSaved) {
        alert("Please save the data before downloading.");
        return;
    }

    chrome.storage.local.get(['weeklyData'], (result) => {
        const weeklyData = result.weeklyData || {};

        if (Object.keys(weeklyData).length === 0) {
            alert("No data available to download.");
            return;
        }

        // Create a new workbook and worksheet
        const wb = XLSX.utils.book_new();
        const wsData = [["Date", "Job Name", "Count"]];

        let totalJobs = 0;

        // Populate worksheet data
        for (let date in weeklyData) {
            weeklyData[date].forEach(field => {
                wsData.push([date, field.name, field.count]);
                totalJobs += field.count;
            });
        }

        // Add a row for the total count
        wsData.push([]);
        wsData.push(["Total Jobs Applied", totalJobs]);

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Job Applications");

        // Generate Excel file and prompt download
        XLSX.writeFile(wb, `Job_Applications_${new Date().toLocaleDateString()}.xlsx`);
    });
};

// Function to save data for a new day
newDayButton.onclick = () => {
    chrome.storage.local.get(['jobFields', 'lastSavedDate'], (result) => {
        const lastSavedDate = result.lastSavedDate || today;
        const jobFields = result.jobFields || [];

        // Save data for the current day
        saveDataForDay(lastSavedDate, jobFields);

        // Reset job fields for the new day
        chrome.storage.local.set({ jobFields: [], lastSavedDate: today });

        // Clear job fields on the UI
        jobFieldsContainer.innerHTML = '';

        // Enable the download button
        downloadExcelButton.disabled = false;
    });
};
