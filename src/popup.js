
// Initialize job fields and counter
const jobFieldsContainer = document.getElementById('job-fields');
const addFieldButton = document.getElementById('add-field');
const showSummaryButton = document.getElementById('show-summary');

// Load saved data
chrome.storage.local.get(['jobFields'], (result) => {
  const jobFields = result.jobFields || [];
  jobFields.forEach((field, index) => addField(field.name, field.count, index));
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

// Add new field
addFieldButton.onclick = () => addField();

// Show summary of all fields
showSummaryButton.onclick = () => {
    chrome.storage.local.get(['jobFields'], (result) => {
        
        const jobFields = result.jobFields || [];
        let totalJobs = 0;
        let summary = `Today's Date: ${new Date().toLocaleDateString()}\n\nJob Applications:\n`;
    
        jobFields.forEach(field => {
          summary += `${field.name}: ${field.count}\n`;
          totalJobs += field.count;
        });
    
        summary += `\nTotal Jobs Applied: ${totalJobs}`;
        alert(summary);


  });
};

