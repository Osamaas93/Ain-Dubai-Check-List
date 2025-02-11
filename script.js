import { getFirestore, collection, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; 
import { db } from './firebase.js';

// Global function declarations
window.loadChecklistData = loadChecklistData;
window.clearData = clearData;
window.printChecklistTable = printChecklistTable;
window.printIssueReportTable = printIssueReportTable;

document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const saveButton = document.getElementById('save-button');
    const clearButton = document.getElementById('clear-button');
    const printChecklistBtn = document.getElementById('print-checklist');
    const printIssueBtn = document.getElementById('print-issue');

    dateInput.addEventListener('change', function() {
        const selectedDate = this.value;
        document.getElementById('selected-date').textContent = `Selected date is: ${selectedDate}`;
        loadChecklistData(selectedDate);
    });

    saveButton.addEventListener('click', saveData);
    clearButton.addEventListener('click', clearData);
    printChecklistBtn.addEventListener('click', printChecklistTable);
    printIssueBtn.addEventListener('click', printIssueReportTable);
});

async function loadChecklistData(selectedDate) {
    try {
        if (!selectedDate) {
            alert("Please select a date first");
            return;
        }

        const formattedDate = formatDate(selectedDate);
        
        // Load Checklist
        const checklistDoc = await getDoc(doc(db, 'checklists', formattedDate));
        if (checklistDoc.exists()) {
            const data = checklistDoc.data();
            populateChecklistTable(data.tasks);
            document.getElementById('selected-date').textContent = `Selected date is: ${selectedDate}`;
        } else {
            console.log("No checklist found for:", formattedDate);
            document.getElementById('selected-date').textContent = "No checklist found for the selected date.";
        }

        // Load Reports
        const reportDoc = await getDoc(doc(db, 'reports', formattedDate));
        if (reportDoc.exists()) {
            populateIssueReport(reportDoc.data().issues);
        }
    } catch (error) {
        console.error("Load error:", error);
        alert("Error loading data. Check console for details.");
    }
}

function populateChecklistTable(tasks) {
    // Map tasks to their corresponding HTML elements
    const taskMap = {
        'Audio System Functionality': ['audio-system-checkbox', 'audio-system-signature'],
        'Fog Machines Liquid Level and Functionality': ['fog-machine-checkbox', 'fog-machine-signature'],
        'Screens (Mesh and Curved) Functionality': ['screens-checkbox', 'screens-signature'],
        'Lighting System Functionality': ['lighting-checkbox', 'lighting-signature'],
        'Laser Effects Functionality': ['laser-checkbox', 'laser-signature'],
        'Stage Equipment Check': ['stage-equipment-checkbox', 'stage-equipment-signature']
    };

    tasks.forEach(task => {
        const elements = taskMap[task.name];
        if (elements) {
            // Update checkbox
            const checkbox = document.getElementById(elements[0]);
            if (checkbox) checkbox.checked = task.completed;
            
            // Update signature
            const signatureField = document.getElementById(elements[1]);
            if (signatureField) signatureField.value = task.assignedTo || '';
        }
    });
}

// Add this function for issue reports
function populateIssueReport(issues) {
    const issueMap = {
        'Fog Machines Functionality': ['fog-machine-report', 'fog-machine-issue-signature'],
        'Screens (mesh and curved)': ['screens-report', 'screens-issue-signature'],
        'Lighting Functionality': ['lighting-report', 'lighting-issue-signature'],
        'Laser, Tracker and Trackers Grid System': ['laser-report', 'laser-issue-signature'],
        'Other Issue': ['grid-report', 'grid-issue-signature']
    };

    issues.forEach(issue => {
        const elements = issueMap[issue.name];
        if (elements) {
            const reportField = document.getElementById(elements[0]);
            if (reportField) reportField.value = issue.issue || '';
            
            const signatureField = document.getElementById(elements[1]);
            if (signatureField) signatureField.value = issue.signature || '';
        }
    });
}

async function saveData() {
    try {
        const date = document.getElementById('date').value;
        if (!date) {
            alert("Please select a date first");
            return;
        }

        const formattedDate = formatDate(date);

        // Save Checklist Data
        const tasks = Array.from(document.querySelectorAll('#checklist-table-body tr')).map(tr => {
            const cells = tr.cells;
            return {
                name: cells[0].textContent,
                completed: cells[1].querySelector('input').checked,
                assignedTo: cells[2].querySelector('input').value || "NA"
            };
        });

        await setDoc(doc(db, 'checklists', formattedDate), {
            date: formattedDate,
            tasks: tasks
        });

        // Save Issue Reports
        const issueRows = document.querySelectorAll('#issue-report-table tbody tr');
        const issues = Array.from(issueRows).map(row => {
            const cells = row.cells;
            return {
                name: cells[0].textContent.trim(),
                issue: cells[1].querySelector('textarea').value,
                signature: cells[2].querySelector('input').value || "NA"
            };
        });

        await setDoc(doc(db, 'reports', formattedDate), {
            date: formattedDate,
            issues: issues
        });

        alert("Data saved successfully!");
    } catch (error) {
        console.error("Save error:", error);
        alert("Error saving data. Check console for details.");
    }
}

// Helper function to format date to MM-DD-YYYY
function formatDate(date) {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero
    const day = d.getDate().toString().padStart(2, '0'); // Add leading zero
    const year = d.getFullYear();
    return `${month}-${day}-${year}`; // Return the formatted date
}

// Function to clear data from the form
function clearData() {
    document.getElementById("day").value = '';
    document.getElementById("date").value = '';
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
    document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
    document.querySelectorAll('textarea').forEach(textarea => textarea.value = ''); // Clear textareas
}

// Print checklist table function
function printChecklistTable() {
    const checklistTable = document.getElementById("checklist-table");
    const rows = checklistTable.rows;
    let tableContent = `<table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">`;
    tableContent += `<tr>${Array.from(rows[0].cells).map(cell => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #4CAF50; color: white;">${cell.innerText}</th>`).join("")}</tr>`;

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].cells;
        tableContent += `<tr>${Array.from(cells).map((cell, index) => {
            if (index === 1) {
                const checkbox = cell.querySelector("input[type='checkbox']");
                return `<td style="border: 1px solid #ddd; padding: 8px;">${checkbox.checked ? "✔" : ""}</td>`;
            } else if (index === 2) {
                const signature = cell.querySelector("input[type='text']").value;
                return `<td style="border: 1px solid #ddd; padding: 8px;">${signature}</td>`;
            } else {
                return `<td style="border: 1px solid #ddd; padding: 8px;">${cell.innerText}</td>`;
            }
        }).join("")}</tr>`;
    }

    tableContent += `</table>`;

    const newWindow = window.open("", "", "width=800,height=600");
    newWindow.document.write(`
    <html>
    <head>
        <title>Checklist Table</title>
        <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #4CAF50; color: white; }
        </style>
    </head>
    <body>
        <h1>Checklist Table</h1>
        ${tableContent}
    </body>
    </html>
    `);
    newWindow.document.close();
    newWindow.print();
}

// Print issue report table function
function printIssueReportTable() {
    const issueReportTable = document.getElementById("issue-report-table");
    const rows = issueReportTable.rows;
    let tableContent = `<table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">`;
    tableContent += `<tr>${Array.from(rows[0].cells).map(cell => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #4CAF50; color: white;">${cell.innerText}</th>`).join("")}</tr>`;

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].cells;
        tableContent += `<tr>${Array.from(cells).map((cell, index) => {
            if (index === 1) {
                const issueReport = cell.querySelector("textarea").value;
                return `<td style="border: 1px solid #ddd; padding: 8px;">${issueReport}</td>`;
            } else if (index === 2) {
                const signature = cell.querySelector("input[type='text']").value;
                return `<td style="border: 1px solid #ddd; padding: 8px;">${signature}</td>`;
            } else {
                return `<td style="border: 1px solid #ddd; padding: 8px;">${cell.innerText}</td>`;
            }
        }).join("")}</tr>`;
    }

    tableContent += `</table>`;

    const newWindow = window.open("", "", "width=800,height=600");
    newWindow.document.write(`
    <html>
    <head>
        <title>Issue Report Table</title>
        <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #4CAF50; color: white; }
        </style>
    </head>
    <body>
        <h1>Issue Report Table</h1>
        ${tableContent}
    </body>
    </html>
    `);
    newWindow.document.close();
    newWindow.print();
}

// Attach loadChecklistData to the window object for global access
window.loadChecklistData = loadChecklistData;