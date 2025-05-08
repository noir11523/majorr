// Admin functionality
let appointmentsChart = null;

// Admin credentials (in a real app, this would be server-side)
const adminCredentials = {
    username: "admin",
    password: "admin123"
};

// Function to check if user has access to admin features
function checkAdminAccess() {
    return true; // For demo, always allow access
}

function handleAdminLogin(username, password) {
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }

    if (username === adminCredentials.username && password === adminCredentials.password) {
        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.remove('active-section');
        });
        
        // Show admin section
        document.getElementById('admin-section').classList.add('active-section');
        
        // Close login modal
        document.getElementById('login-modal').classList.remove('active');
        
        // Update UI
        document.querySelector('nav').style.display = 'none';
        document.querySelector('.auth-buttons').innerHTML = '<button id="logout-btn">Logout</button>';
        
        // Set up logout button
        document.getElementById('logout-btn').addEventListener('click', logoutAdmin);
        
        // Initialize dashboard
        initDashboard();
    } else {
        alert('Invalid admin credentials');
    }
}

function logoutAdmin() {
    // Show all sections again
    document.querySelector('nav').style.display = 'flex';
    document.querySelector('.auth-buttons').innerHTML = `
        <button id="login-btn">Login</button>
        <button id="register-btn">Register</button>
    `;
    
    // Show home section
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active-section');
    });
    document.getElementById('home-section').classList.add('active-section');
    
    // Reset nav active state
    document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
    document.getElementById('home-link').classList.add('active');
    
    // Reinitialize event listeners
    setupEventListeners();
}

// Function to initialize dashboard based on user role
function initDashboard() {
    if (!checkAdminAccess()) return;

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const isStaff = currentUser.role === 'staff';

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dashboard-date').value = today;
    document.getElementById('selected-date-text').textContent = formatDate(today);
    
    // Load data for today
    loadDashboardData(today);
    
    // Set up date change listener
    document.getElementById('dashboard-date').addEventListener('change', function() {
        const selectedDate = this.value;
        document.getElementById('selected-date-text').textContent = formatDate(selectedDate);
        loadDashboardData(selectedDate);
    });

    // Hide admin-only features for staff
    if (isStaff) {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
}

function loadDashboardData(date) {
    if (!checkAdminAccess()) return;

    // Always show improved sample data
    const sampleData = {
        total: 42,
        booked: 30,
        completed: 8,
        cancelled: 4,
        appointments: [
            { id: 'MC-2023-201', patient: 'John Doe', doctor: 'Dr. Sarah Johnson', department: 'Cardiology', time: '09:00 AM', status: 'booked' },
            { id: 'MC-2023-202', patient: 'Jane Smith', doctor: 'Dr. Michael Chen', department: 'Neurology', time: '10:30 AM', status: 'completed' },
            { id: 'MC-2023-203', patient: 'Robert Brown', doctor: 'Dr. Emily Rodriguez', department: 'General', time: '11:15 AM', status: 'cancelled' },
            { id: 'MC-2023-204', patient: 'Alice Johnson', doctor: 'Dr. Sarah Johnson', department: 'Cardiology', time: '02:00 PM', status: 'booked' },
            { id: 'MC-2023-205', patient: 'Michael Lee', doctor: 'Dr. Jennifer Lee', department: 'Neurology', time: '03:00 PM', status: 'booked' },
            { id: 'MC-2023-206', patient: 'Emily White', doctor: 'Dr. James Brown', department: 'General', time: '04:00 PM', status: 'completed' }
        ],
        dailyStats: {
            labels: ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM'],
            booked: [5, 10, 7, 4, 3, 1],
            completed: [1, 2, 2, 2, 1, 0],
            cancelled: [0, 1, 1, 1, 1, 0]
        }
    };
    
    // Update stats
    document.getElementById('total-appointments').textContent = sampleData.total;
    document.getElementById('booked-appointments').textContent = sampleData.booked;
    document.getElementById('completed-appointments').textContent = sampleData.completed;
    document.getElementById('cancelled-appointments').textContent = sampleData.cancelled;
    
    // Get search value
    const searchValue = (document.getElementById('admin-appointments-search')?.value || '').toLowerCase();
    // Filter appointments by search
    const filteredAppointments = sampleData.appointments.filter(app =>
        app.id.toLowerCase().includes(searchValue) ||
        app.patient.toLowerCase().includes(searchValue) ||
        app.doctor.toLowerCase().includes(searchValue) ||
        app.department.toLowerCase().includes(searchValue) ||
        app.status.toLowerCase().includes(searchValue)
    );
    // Update appointments table
    const tableBody = document.getElementById('admin-appointments-list');
    tableBody.innerHTML = '';
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const isStaff = currentUser && currentUser.role === 'staff';
    filteredAppointments.forEach(appointment => {
        const row = document.createElement('tr');
        const statusCell = document.createElement('td');
        const statusSpan = document.createElement('span');
        statusSpan.className = `appointment-status status-${appointment.status}`;
        statusSpan.textContent = appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);
        // Add status change dropdown for staff
        if (isStaff) {
            const statusSelect = document.createElement('select');
            statusSelect.className = 'status-select';
            ['booked', 'completed', 'cancelled'].forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
                option.selected = status === appointment.status;
                statusSelect.appendChild(option);
            });
            statusSelect.addEventListener('change', (e) => updateAppointmentStatus(appointment.id, e.target.value));
            statusCell.appendChild(statusSelect);
        } else {
            statusCell.appendChild(statusSpan);
        }
        row.innerHTML = `
            <td>${appointment.id}</td>
            <td>${appointment.patient}</td>
            <td>${appointment.doctor}</td>
            <td>${appointment.department}</td>
            <td>${appointment.time}</td>
        `;
        row.appendChild(statusCell);
        // Action cell
        const actionCell = document.createElement('td');
        // View button
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-outline';
        viewBtn.title = 'View';
        viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
        viewBtn.addEventListener('click', () => showAdminAppointmentDetails(appointment));
        actionCell.appendChild(viewBtn);
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-outline';
        editBtn.title = 'Edit';
        editBtn.style.marginLeft = '6px';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.addEventListener('click', () => showEditAppointmentModal(appointment));
        actionCell.appendChild(editBtn);
        // Cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-danger';
        cancelBtn.title = 'Cancel';
        cancelBtn.style.marginLeft = '6px';
        cancelBtn.innerHTML = '<i class="fas fa-ban"></i>';
        cancelBtn.addEventListener('click', () => confirmCancelAppointment(appointment));
        actionCell.appendChild(cancelBtn);
        // Delete button (admin only)
        if (currentUser && currentUser.role === 'admin') {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger';
            deleteBtn.title = 'Delete';
            deleteBtn.style.marginLeft = '6px';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => confirmDeleteAppointment(appointment));
            actionCell.appendChild(deleteBtn);
        }
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
    // Update chart
    updateChart(sampleData.dailyStats);
}

function updateAppointmentStatus(appointmentId, newStatus) {
    if (!checkAdminAccess()) return;
    
    // In a real app, this would make an API call to update the status
    console.log(`Updating appointment ${appointmentId} to ${newStatus}`);
    // Reload dashboard data to reflect changes
    loadDashboardData(document.getElementById('dashboard-date').value);
}

function updateChart(data) {
    if (!checkAdminAccess()) return;

    const ctx = document.getElementById('appointments-chart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (appointmentsChart) {
        appointmentsChart.destroy();
    }
    
    appointmentsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Booked',
                    data: data.booked,
                    backgroundColor: '#3498db',
                    borderColor: '#2980b9',
                    borderWidth: 1
                },
                {
                    label: 'Completed',
                    data: data.completed,
                    backgroundColor: '#27ae60',
                    borderColor: '#219653',
                    borderWidth: 1
                },
                {
                    label: 'Cancelled',
                    data: data.cancelled,
                    backgroundColor: '#e74c3c',
                    borderColor: '#c0392b',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Appointments'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time of Day'
                    }
                }
            }
        }
    });
}

function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Add search event listener
window.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('admin-appointments-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            loadDashboardData(document.getElementById('dashboard-date').value);
        });
    }
});

// Show appointment details modal for admin
function showAdminAppointmentDetails(appointment) {
    const detailsHtml = `
        <h3>Appointment Details</h3>
        <div class="appointment-details">
            <p><strong>Appointment ID:</strong> ${appointment.id}</p>
            <p><strong>Patient:</strong> ${appointment.patient}</p>
            <p><strong>Doctor:</strong> ${appointment.doctor}</p>
            <p><strong>Department:</strong> ${appointment.department}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
            <p><strong>Status:</strong> <span class="status-${appointment.status}">${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span></p>
        </div>
    `;
    const detailsModal = document.createElement('div');
    detailsModal.className = 'modal active';
    detailsModal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            ${detailsHtml}
        </div>
    `;
    document.body.appendChild(detailsModal);
    detailsModal.querySelector('.close-modal').addEventListener('click', () => {
        detailsModal.remove();
    });
}

// Edit appointment modal
function showEditAppointmentModal(appointment) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>Edit Appointment</h3>
            <form id="edit-appointment-form">
                <div class="form-group">
                    <label>Time</label>
                    <input type="text" id="edit-time" value="${appointment.time}" required>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="edit-status">
                        <option value="booked" ${appointment.status === 'booked' ? 'selected' : ''}>Booked</option>
                        <option value="completed" ${appointment.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${appointment.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
                <button type="submit" class="submit-btn">Save</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    modal.querySelector('#edit-appointment-form').onsubmit = function(e) {
        e.preventDefault();
        appointment.time = document.getElementById('edit-time').value;
        appointment.status = document.getElementById('edit-status').value;
        modal.remove();
        loadDashboardData(document.getElementById('dashboard-date').value);
        showToast('Appointment updated!');
    };
}

// Cancel appointment confirmation
function confirmCancelAppointment(appointment) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        appointment.status = 'cancelled';
        loadDashboardData(document.getElementById('dashboard-date').value);
        showToast('Appointment cancelled.');
    }
}

// Delete appointment confirmation (admin only)
function confirmDeleteAppointment(appointment) {
    if (confirm('Are you sure you want to delete this appointment? This cannot be undone.')) {
        const idx = sampleData.appointments.findIndex(a => a.id === appointment.id);
        if (idx !== -1) sampleData.appointments.splice(idx, 1);
        loadDashboardData(document.getElementById('dashboard-date').value);
        showToast('Appointment deleted.');
    }
}

// Toast notification
function showToast(msg) {
    let toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.right = '30px';
    toast.style.background = '#3498db';
    toast.style.color = 'white';
    toast.style.padding = '14px 26px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '1rem';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}