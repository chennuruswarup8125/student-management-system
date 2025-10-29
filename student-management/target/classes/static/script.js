// API Base URL
const API_BASE_URL = 'http://localhost:8080/api/students';

// DOM Elements
const studentsContainer = document.getElementById('studentsContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');
const studentModal = document.getElementById('studentModal');
const confirmModal = document.getElementById('confirmModal');
const studentForm = document.getElementById('studentForm');
const modalTitle = document.getElementById('modalTitle');
const submitBtn = document.getElementById('submitBtn');
const addStudentBtn = document.getElementById('addStudentBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const toast = document.getElementById('toast');

// State
let editingStudentId = null;
let deletingStudentId = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Add Student Button
    addStudentBtn.addEventListener('click', () => {
        openModal('add');
    });

    // Close Modal
    document.querySelector('.close').addEventListener('click', () => {
        closeModal();
    });

    // Cancel Button
    document.getElementById('cancelBtn').addEventListener('click', () => {
        closeModal();
    });

    // Form Submit
    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit();
    });

    // Search
    searchBtn.addEventListener('click', () => {
        handleSearch();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Search on input change (real-time search)
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            handleSearch();
        }, 500);
    });

    // Confirm Delete
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        if (deletingStudentId) {
            deleteStudent(deletingStudentId);
        }
    });

    // Cancel Delete
    document.getElementById('confirmCancelBtn').addEventListener('click', () => {
        confirmModal.style.display = 'none';
        deletingStudentId = null;
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === studentModal) {
            closeModal();
        }
        if (e.target === confirmModal) {
            confirmModal.style.display = 'none';
            deletingStudentId = null;
        }
    });
}

// Load All Students
async function loadStudents() {
    showLoading(true);
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch students');

        const students = await response.json();
        displayStudents(students);
    } catch (error) {
        console.error('Error loading students:', error);
        showToast('Error loading students. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Display Students
function displayStudents(students) {
    studentsContainer.innerHTML = '';

    if (students.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    students.forEach(student => {
        const card = createStudentCard(student);
        studentsContainer.appendChild(card);
    });
}

// Create Student Card
function createStudentCard(student) {
    const card = document.createElement('div');
    card.className = 'student-card';

    const initials = (student.firstName.charAt(0) + student.lastName.charAt(0)).toUpperCase();

    card.innerHTML = `
        <div class="student-header">
            <div class="student-avatar">${initials}</div>
            <div class="student-name">
                <h3>${student.firstName} ${student.lastName}</h3>
                <div class="student-roll">${student.rollNumber}</div>
            </div>
        </div>
        <div class="student-info">
            <div class="info-item">
                <span class="info-label">Email:</span>
                <span class="info-value">${student.email}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Department:</span>
                <span class="info-value">${student.department}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Year:</span>
                <span class="info-value">${getYearLabel(student.year)}</span>
            </div>
        </div>
        <div class="student-actions">
            <button class="btn-edit" onclick="editStudent(${student.id})">✏️ Edit</button>
            <button class="btn-delete" onclick="confirmDelete(${student.id})">🗑️ Delete</button>
        </div>
    `;

    return card;
}

// Get Year Label
function getYearLabel(year) {
    const labels = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
    return labels[year] || `${year}th Year`;
}

// Open Modal
function openModal(mode, student = null) {
    studentModal.style.display = 'block';

    if (mode === 'add') {
        modalTitle.textContent = 'Add Student';
        submitBtn.textContent = 'Add Student';
        studentForm.reset();
        editingStudentId = null;
    } else if (mode === 'edit' && student) {
        modalTitle.textContent = 'Edit Student';
        submitBtn.textContent = 'Update Student';
        editingStudentId = student.id;

        // Populate form
        document.getElementById('firstName').value = student.firstName;
        document.getElementById('lastName').value = student.lastName;
        document.getElementById('email').value = student.email;
        document.getElementById('rollNumber').value = student.rollNumber;
        document.getElementById('department').value = student.department;
        document.getElementById('year').value = student.year;
    }
}

// Close Modal
function closeModal() {
    studentModal.style.display = 'none';
    studentForm.reset();
    editingStudentId = null;
}

// Handle Form Submit
async function handleFormSubmit() {
    const studentData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        rollNumber: document.getElementById('rollNumber').value.trim(),
        department: document.getElementById('department').value,
        year: parseInt(document.getElementById('year').value)
    };

    try {
        let response;

        if (editingStudentId) {
            // Update existing student
            response = await fetch(`${API_BASE_URL}/${editingStudentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData)
            });
        } else {
            // Create new student
            response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData)
            });
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save student');
        }

        const message = editingStudentId ? 'Student updated successfully!' : 'Student added successfully!';
        showToast(message, 'success');
        closeModal();
        loadStudents();

    } catch (error) {
        console.error('Error saving student:', error);
        showToast(error.message, 'error');
    }
}

// Edit Student
async function editStudent(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch student details');

        const student = await response.json();
        openModal('edit', student);

    } catch (error) {
        console.error('Error fetching student:', error);
        showToast('Error loading student details', 'error');
    }
}

// Confirm Delete
function confirmDelete(id) {
    deletingStudentId = id;
    confirmModal.style.display = 'block';
}

// Delete Student
async function deleteStudent(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete student');

        showToast('Student deleted successfully!', 'success');
        confirmModal.style.display = 'none';
        deletingStudentId = null;
        loadStudents();

    } catch (error) {
        console.error('Error deleting student:', error);
        showToast('Error deleting student', 'error');
    }
}

// Handle Search
async function handleSearch() {
    const query = searchInput.value.trim();
    showLoading(true);

    try {
        const url = query ? `${API_BASE_URL}/search?q=${encodeURIComponent(query)}` : API_BASE_URL;
        const response = await fetch(url);

        if (!response.ok) throw new Error('Search failed');

        const students = await response.json();
        displayStudents(students);

    } catch (error) {
        console.error('Error searching students:', error);
        showToast('Error searching students', 'error');
    } finally {
        showLoading(false);
    }
}

// Show Loading
function showLoading(show) {
    if (show) {
        loadingSpinner.style.display = 'block';
        studentsContainer.style.display = 'none';
        emptyState.style.display = 'none';
    } else {
        loadingSpinner.style.display = 'none';
        studentsContainer.style.display = 'grid';
    }
}

// Show Toast Notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000);
}