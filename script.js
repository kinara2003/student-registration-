// Page-aware script: supports index (add), students (list/table + delete), and edit pages
const API_URL = "http://localhost:3000/students";

const studentForm = document.getElementById('studentForm');
const studentsTable = document.getElementById('studentsTable');
const editForm = document.getElementById('editForm');

async function fetchStudentsFromAPI() {
    const res = await fetch(API_URL);
    return res.json();
}

async function renderListIfNeeded() {
    // Render simple UL list if present (older versions) — kept for safety
    const studentList = document.getElementById('studentList');
    if (studentList) {
        const students = await fetchStudentsFromAPI();
        studentList.innerHTML = '';
        students.forEach(s => {
            const li = document.createElement('li');
            li.textContent = `${s.name} - ${s.email} - ${s.course}`;
            studentList.appendChild(li);
        });
    }
}

async function renderTableIfNeeded() {
    if (!studentsTable) return;
    const tbody = studentsTable.querySelector('tbody');
    const students = await fetchStudentsFromAPI();
    tbody.innerHTML = '';
    students.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(s.name)}</td>
            <td>${escapeHtml(s.email)}</td>
            <td>${s.age ?? ''}</td>
            <td>${escapeHtml(s.course)}</td>
            <td>${escapeHtml(s.gender)}</td>
            <td>${escapeHtml(s.address)}</td>
            <td>
                <a href="edit.html?id=${s._id}">Edit</a>
                <button data-id="${s._id}" class="deleteBtn">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Attach delete handlers
    tbody.querySelectorAll('.deleteBtn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (!confirm('Delete this student?')) return;
            try {
                await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                renderTableIfNeeded();
            } catch (err) {
                console.error(err);
                alert('Failed to delete');
            }
        });
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();
    // Validate age (prevent negative values)
    const ageValue = document.getElementById('age').value;
    const ageNum = Number(ageValue);
    if (Number.isNaN(ageNum) || ageNum < 0) {
        alert('Please enter a valid non-negative age.');
        return;
    }

    const student = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        age: ageNum,
        course: document.getElementById('course').value,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value
    };
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });
        if (!res.ok) throw new Error('Failed to save');
        const saved = await res.json();
        studentForm.reset();
        // Redirect to students page so the newly saved student's details are visible
        window.location.href = 'students.html';
    } catch (err) {
        console.error(err);
        alert('Failed to add student');
    }
}

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

async function handleEditPage() {
    if (!editForm) return;
    const id = getQueryParam('id');
    if (!id) {
        alert('No student id provided');
        return;
    }
    // Populate form
    try {
        const res = await fetch(`${API_URL}/${id}`);
        const s = await res.json();
        if (!s) { alert('Student not found'); return; }
        document.getElementById('name').value = s.name || '';
        document.getElementById('email').value = s.email || '';
        document.getElementById('age').value = s.age || '';
        document.getElementById('course').value = s.course || '';
        document.getElementById('gender').value = s.gender || '';
        document.getElementById('address').value = s.address || '';
    } catch (err) {
        console.error(err);
        alert('Failed to load student');
    }

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Validate age before updating
        const ageValue = document.getElementById('age').value;
        const ageNum = Number(ageValue);
        if (Number.isNaN(ageNum) || ageNum < 0) {
            alert('Please enter a valid non-negative age.');
            return;
        }

        const updated = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            age: ageNum,
            course: document.getElementById('course').value,
            gender: document.getElementById('gender').value,
            address: document.getElementById('address').value
        };
        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            window.location.href = 'students.html';
        } catch (err) {
            console.error(err);
            alert('Failed to update student');
        }
    });
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Wire up page-specific behavior
if (studentForm) {
    studentForm.addEventListener('submit', handleFormSubmit);
}

renderListIfNeeded();
renderTableIfNeeded();
handleEditPage();
