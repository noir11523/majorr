document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const confirmationModal = document.getElementById('confirmation-modal');
    const closeModals = document.querySelectorAll('.close-modal');
    const bookFromViewBtn = document.getElementById('book-from-view');
    const heroBookBtn = document.getElementById('hero-book-btn');
    const registerFromLogin = document.getElementById('register-from-login');
    const loginFromRegister = document.getElementById('login-from-register');
    const bookingForm = document.getElementById('booking-form');
    const departmentSelect = document.getElementById('department');
    const doctorSelect = document.getElementById('doctor');
    const dateInput = document.getElementById('date');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const filterStatus = document.getElementById('filter-status');
    const refreshAppointments = document.getElementById('refresh-appointments');
    const appointmentsList = document.getElementById('appointments-list');
    const printAppointmentBtn = document.getElementById('print-appointment');
    const viewAppointmentsBtn = document.getElementById('view-appointments');
    
    const patientLoginBtn = document.getElementById('patient-login-btn');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const loginLabel = document.getElementById('login-label');


    // Calendar instance variable
    let calendar = null;

    // Sample data for doctors and time slots
    const doctorsData = {
        cardiology: [
            { id: 'doc-1', name: 'Dr. Sarah Johnson', availableDays: ['Monday', 'Wednesday', 'Friday'] },
            { id: 'doc-2', name: 'Dr. Robert Smith', availableDays: ['Tuesday', 'Thursday', 'Saturday'] }
        ],
        neurology: [
            { id: 'doc-3', name: 'Dr. Michael Chen', availableDays: ['Monday', 'Tuesday', 'Thursday'] },
            { id: 'doc-4', name: 'Dr. Jennifer Lee', availableDays: ['Wednesday', 'Friday', 'Saturday'] }
        ],
        general: [
            { id: 'doc-5', name: 'Dr. James Brown', availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
            { id: 'doc-6', name: 'Dr. Emily Rodriguez', availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] }
        ]
    };
    
    // Helper function to find doctor by name
    function findDoctorByName(name) {
        for (const department in doctorsData) {
            const doctor = doctorsData[department].find(doc => doc.name === name);
            if (doctor) {
                return doctor;
            }
        }
        return null;
    }

    // Function to update calendar with doctor's available days
    function updateCalendar(doctorName) {
        if (calendar) {
            calendar.destroy();
        }

        const doctor = findDoctorByName(doctorName);
        if (!doctor) {
            console.error("Doctor not found!");
            return;
        }

        const allowedDays = doctor.availableDays;

        // Generate list of available dates in next 14 days
        const today = new Date();
        const availableDates = [];

        for (let i = 0; i <= 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            if (allowedDays.includes(dayName)) {
                availableDates.push(date.toISOString().split('T')[0]);
            }
        }

        // Setup flatpickr
        calendar = flatpickr(dateInput, {
            dateFormat: "Y-m-d",
            enable: availableDates,
            minDate: "today",
            maxDate: new Date().fp_incr(14)
        });
    }
    
    // Sample appointments data
    let appointments = [
        {
            id: 'MC-2023-001',
            department: 'Cardiology',
            doctor: 'Dr. Sarah Johnson',
            date: '2023-06-15',
            patientName: 'John Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            status: 'upcoming'
        },
        {
            id: 'MC-2023-002',
            department: 'Neurology',
            doctor: 'Dr. Michael Chen',
            date: '2023-05-20',
            patientName: 'John Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            status: 'completed'
        },
        {
            id: 'MC-2023-003',
            department: 'General Medicine',
            doctor: 'Dr. Jennifer Lee',
            date: '2023-06-01',
            patientName: 'John Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            status: 'cancelled'
        }
    ];
    
    // Sample user database (in a real app, this would be server-side)
    const userDatabase = {
        'admin@company.com': {
            password: 'admin123',
            role: 'admin',
            name: 'Admin User'
        },
        'staff@company.com': {
            password: 'staff123',
            role: 'staff',
            name: 'Staff User'
        },
        'user@example.com': {
            password: 'user123',
            role: 'user',
            name: 'Regular User'
        }
    };

    // Add this after the userDatabase declaration
    let registeredUsers = {};

    // Function to check user role based on email domain
    function getUserRole(email) {
        if (email.endsWith('@company.com')) {
            return email.startsWith('admin') ? 'admin' : 'staff';
        }
        return 'user';
    }

    // Function to handle login
    function handleLogin(email, password) {
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        // Check both userDatabase and registeredUsers
        const user = userDatabase[email] || registeredUsers[email];
        if (!user || user.password !== password) {
            alert('Invalid credentials');
            return;
        }

        // Store user info in session
        sessionStorage.setItem('currentUser', JSON.stringify({
            email: email,
            role: user.role,
            name: user.name
        }));

        // Close login modal
        document.getElementById('login-modal').classList.remove('active');

        // Update UI based on role
        updateUIForRole(user.role);

        // Show appropriate section
        if (user.role === 'admin' || user.role === 'staff') {
            showSection('admin-section');
        } else {
            showSection('home-section');
        }
    }

    // Function to update UI based on user role
    function updateUIForRole(role) {
        const nav = document.querySelector('nav');
        const authButtons = document.querySelector('.auth-buttons');
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const displayName = currentUser && currentUser.name ? currentUser.name : (role.charAt(0).toUpperCase() + role.slice(1));
        let adminBtn = '';
        if (role === 'admin') {
            adminBtn = `<button id="admin-dashboard-btn" class="header-btn" title="Go to Admin Dashboard"><i class='fas fa-tools'></i>Admin Dashboard</button>`;
        } else if (role === 'staff') {
            adminBtn = `<button id="admin-dashboard-btn" class="header-btn" title="Go to Staff Dashboard"><i class='fas fa-user-cog'></i>Staff Dashboard</button>`;
        }
        authButtons.innerHTML = `
            <span class="user-info header-btn" id="user-info-display" style="cursor:pointer;" title="Click to view/edit your profile">
                <i class='fas fa-user-circle' style='margin-right:6px;'></i>${displayName}
            </span>
            ${adminBtn}
            <button id="logout-btn">Logout</button>
        `;
        nav.style.display = (role === 'admin' || role === 'staff') ? 'none' : 'flex';
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        document.getElementById('user-info-display').addEventListener('click', openProfileModal);
        if (role === 'admin' || role === 'staff') {
            document.getElementById('admin-dashboard-btn').addEventListener('click', () => {
                showSection('admin-section');
                if (typeof initDashboard === 'function') initDashboard();
            });
        }
        if (!sessionStorage.getItem('profileTipShown')) {
            showProfileTip();
            sessionStorage.setItem('profileTipShown', '1');
        }
    }

    // Function to handle logout
    function handleLogout() {
        // Clear session
        sessionStorage.removeItem('currentUser');
        
        // Reset UI
        document.querySelector('nav').style.display = 'flex';
        document.querySelector('.auth-buttons').innerHTML = `
            <button id="login-btn">Login</button>
            <button id="register-btn">Register</button>
        `;
        
        // Show home section
        showSection('home-section');
        
        // Reset nav active state
        document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
        document.getElementById('home-link').classList.add('active');
        
        // Reinitialize event listeners
        setupEventListeners();
    }

    // Function to handle registration
    function handleRegistration(formData) {
        const { name, email, password, phone } = formData;
        
        // Check if user already exists
        if (userDatabase[email] || registeredUsers[email]) {
            alert('User with this email already exists');
            return false;
        }

        // Add new user to registered users
        registeredUsers[email] = {
            password: password,
            role: 'user',
            name: name,
            phone: phone
        };

        // Store in session storage for persistence
        sessionStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        alert('Registration successful! Please login.');
        return true;
    }

    // Initialize the page
    init();
    
    function init() {
        console.log('Init called');
        // Set current date as min date for appointment
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
        
        // Load appointments
        renderAppointments();
        
        // Load registered users from session storage
        const storedUsers = sessionStorage.getItem('registeredUsers');
        if (storedUsers) {
            registeredUsers = JSON.parse(storedUsers);
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Add registration form handler
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = {
                    name: document.getElementById('reg-name').value,
                    email: document.getElementById('reg-email').value,
                    password: document.getElementById('reg-password').value,
                    phone: document.getElementById('reg-phone').value
                };
                if (handleRegistration(formData)) {
                    document.getElementById('register-modal').classList.remove('active');
                    document.getElementById('login-modal').classList.add('active');
                    registerForm.reset();
                }
            });
        }

        // Always show home section if not logged in
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) {
            showSection('home-section');
        }
    }
    
    function setupEventListeners() {
        // Navigation links
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.id.replace('-link', '-section');
                showSection(sectionId);
                
                // Update active nav link
                document.querySelectorAll('nav a').forEach(navLink => {
                    navLink.classList.remove('active');
                });
                this.classList.add('active');
            });
        });

        // Add this to the setupEventListeners function
patientLoginBtn?.addEventListener('click', () => {
    patientLoginBtn.classList.add('active-login-option');
    adminLoginBtn.classList.remove('active-login-option');
    document.getElementById('login-label').textContent = 'Email';
    document.getElementById('login-email').placeholder = 'Enter your email';
});

adminLoginBtn?.addEventListener('click', () => {
    adminLoginBtn.classList.add('active-login-option');
    patientLoginBtn.classList.remove('active-login-option');
    document.getElementById('login-label').textContent = 'Username';
    document.getElementById('login-email').placeholder = 'Enter admin username';
});
// In the setupEventListeners function, update the login form submission:
document.getElementById('login-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    handleLogin(email, password);
});


        
        // Auth buttons
        document.getElementById('login-btn')?.addEventListener('click', () => {
            document.getElementById('login-modal').classList.add('active');
        });
        
        document.getElementById('register-btn')?.addEventListener('click', () => {
            document.getElementById('register-modal').classList.add('active');
        });
        
        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('login-modal').classList.remove('active');
                document.getElementById('register-modal').classList.remove('active');
                document.getElementById('confirmation-modal').classList.remove('active');
            });
        });
        
        // Modal switches
        document.getElementById('register-from-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-modal').classList.remove('active');
            document.getElementById('register-modal').classList.add('active');
        });
        
        document.getElementById('login-from-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('register-modal').classList.remove('active');
            document.getElementById('login-modal').classList.add('active');
        });
        
        // Book appointment buttons
        document.getElementById('hero-book-btn')?.addEventListener('click', () => {
            showSection('book-section');
            document.querySelectorAll('nav a').forEach(navLink => navLink.classList.remove('active'));
            document.getElementById('book-link').classList.add('active');
        });
        
        document.getElementById('book-from-view')?.addEventListener('click', () => {
            showSection('book-section');
            document.querySelectorAll('nav a').forEach(navLink => navLink.classList.remove('active'));
            document.getElementById('book-link').classList.add('active');
        });

        departmentSelect?.addEventListener('change', populateDoctors);
        doctorSelect?.addEventListener('change', enableDateInput);
        
        bookingForm?.addEventListener('submit', handleBookingSubmit);
        
        [departmentSelect, doctorSelect, dateInput, nameInput, emailInput, phoneInput].forEach(input => {
            input?.addEventListener('change', updatePreview);
        });

        filterStatus?.addEventListener('change', renderAppointments);
        refreshAppointments?.addEventListener('click', renderAppointments);

        printAppointmentBtn?.addEventListener('click', () => window.print());
        viewAppointmentsBtn?.addEventListener('click', () => {
            confirmationModal.classList.remove('active');
            showSection('view-section');
            document.querySelectorAll('nav a').forEach(navLink => navLink.classList.remove('active'));
            document.getElementById('view-link').classList.add('active');
        });
    }
    
    function showSection(sectionId) {
        console.log('showSection called with:', sectionId);
        let found = false;
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active-section');
                found = true;
            } else {
                section.classList.remove('active-section');
            }
        });
        // Fallback: if not found, show home-section
        if (!found) {
            const homeSection = document.getElementById('home-section');
            if (homeSection) {
                homeSection.classList.add('active-section');
            }
        }
    }
    
    function populateDoctors() {
        const department = departmentSelect.value;
        doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
        
        if (department) {
            doctorSelect.disabled = false;
            const doctors = doctorsData[department];
            
            doctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = doctor.name;
                doctorSelect.appendChild(option);
            });
        } else {
            doctorSelect.disabled = true;
            dateInput.disabled = true;
        }
        
        updatePreview();
    }
    
    function enableDateInput() {
        if (doctorSelect.value) {
            dateInput.disabled = false;
            // Update calendar with doctor's available days
            const selectedDoctor = doctorSelect.options[doctorSelect.selectedIndex].text;
            updateCalendar(selectedDoctor);
        } else {
            dateInput.disabled = true;
        }
        
        updatePreview();
    }
    
    function updatePreview() {
        document.getElementById('preview-dept').textContent = departmentSelect.options[departmentSelect.selectedIndex].text || 'Not selected';
        document.getElementById('preview-doc').textContent = doctorSelect.options[doctorSelect.selectedIndex].text || 'Not selected';
        document.getElementById('preview-date').textContent = dateInput.value ? new Date(dateInput.value).toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        }) : 'Not selected';
        document.getElementById('preview-name').textContent = nameInput.value || 'Not provided';
        document.getElementById('preview-email').textContent = emailInput.value || 'Not provided';
        document.getElementById('preview-phone').textContent = phoneInput.value || 'Not provided';
    }
    
    function handleBookingSubmit(e) {
        e.preventDefault();
        
        // Validate required fields
        if (!departmentSelect.value || !doctorSelect.value || !dateInput.value || 
            !nameInput.value || !emailInput.value || !phoneInput.value) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Create new appointment
        const newAppointment = {
            id: generateAppointmentId(),
            department: departmentSelect.options[departmentSelect.selectedIndex].text,
            doctor: doctorSelect.options[doctorSelect.selectedIndex].text,
            date: dateInput.value,
            patientName: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            status: 'upcoming'
        };
        
        // Add to appointments array
        appointments.unshift(newAppointment);
        
        // Update confirmation modal
        document.getElementById('confirm-id').textContent = newAppointment.id;
        document.getElementById('confirm-doctor').textContent = newAppointment.doctor;
        document.getElementById('confirm-date').textContent = new Date(newAppointment.date).toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        
        // Show confirmation modal
        confirmationModal.classList.add('active');
        
        // Reset form
        bookingForm.reset();
        doctorSelect.disabled = true;
        dateInput.disabled = true;
        
        // Update preview
        updatePreview();
        
        // Update appointments list
        renderAppointments();
    }
    
    function generateAppointmentId() {
        const randomNum = Math.floor(Math.random() * 900) + 100;
        return `MC-${new Date().getFullYear()}-${randomNum}`;
    }
    
    function renderAppointments() {
        const statusFilter = filterStatus.value;
        let filteredAppointments = appointments;
        
        if (statusFilter !== 'all') {
            filteredAppointments = appointments.filter(app => app.status === statusFilter);
        }
        
        if (filteredAppointments.length === 0) {
            appointmentsList.innerHTML = `
                <div class="no-appointments">
                    <i class="far fa-calendar-alt"></i>
                    <p>No ${statusFilter !== 'all' ? statusFilter : ''} appointments found.</p>
                    <button id="book-from-view">Book Appointment</button>
                </div>
            `;
            
            document.getElementById('book-from-view')?.addEventListener('click', () => {
                showSection('book-section');
                document.querySelectorAll('nav a').forEach(navLink => navLink.classList.remove('active'));
                document.getElementById('book-link').classList.add('active');
            });
        } else {
            appointmentsList.innerHTML = '';
            
            filteredAppointments.forEach(appointment => {
                const appointmentCard = document.createElement('div');
                appointmentCard.className = 'appointment-card';
                
                const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                });
                
                appointmentCard.innerHTML = `
                    <div class="appointment-info">
                        <h4>${appointment.department} - ${appointment.doctor}</h4>
                        <p>${formattedDate}</p>
                        <p>Patient: ${appointment.patientName}</p>
                        <span class="appointment-status status-${appointment.status}">
                            ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                    </div>
                    <div class="appointment-actions">
                        ${appointment.status === 'upcoming' ? 
                            `<button class="btn btn-danger cancel-btn" data-id="${appointment.id}">Cancel</button>` : ''}
                        <button class="btn btn-outline details-btn" data-id="${appointment.id}">Details</button>
                    </div>
                `;
                
                appointmentsList.appendChild(appointmentCard);
            });
            
            // Add event listeners to action buttons
            document.querySelectorAll('.cancel-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const appointmentId = this.getAttribute('data-id');
                    cancelAppointment(appointmentId);
                });
            });
            
            document.querySelectorAll('.details-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const appointmentId = this.getAttribute('data-id');
                    showAppointmentDetails(appointmentId);
                });
            });
        }
    }
    
    function cancelAppointment(appointmentId) {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            const appointmentIndex = appointments.findIndex(app => app.id === appointmentId);
            if (appointmentIndex !== -1) {
                appointments[appointmentIndex].status = 'cancelled';
                renderAppointments();
                
                // Show notification
                alert('Appointment has been cancelled.');
            }
        }
    }
    
    function showAppointmentDetails(appointmentId) {
        const appointment = appointments.find(app => app.id === appointmentId);
        if (appointment) {
            const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
            
            const detailsHtml = `
                <h3>Appointment Details</h3>
                <div class="appointment-details">
                    <p><strong>Appointment ID:</strong> ${appointment.id}</p>
                    <p><strong>Department:</strong> ${appointment.department}</p>
                    <p><strong>Doctor:</strong> ${appointment.doctor}</p>
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Patient Name:</strong> ${appointment.patientName}</p>
                    <p><strong>Email:</strong> ${appointment.email}</p>
                    <p><strong>Phone:</strong> ${appointment.phone}</p>
                    <p><strong>Status:</strong> <span class="status-${appointment.status}">
                        ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span></p>
                </div>
            `;
            
            // Create a modal for details
            const detailsModal = document.createElement('div');
            detailsModal.className = 'modal active';
            detailsModal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    ${detailsHtml}
                </div>
            `;
            
            document.body.appendChild(detailsModal);
            
            // Add close event
            detailsModal.querySelector('.close-modal').addEventListener('click', () => {
                detailsModal.remove();
            });
        }
    }

    // Force show home-section on page load as a last resort
    window.addEventListener('DOMContentLoaded', function() {
        const homeSection = document.getElementById('home-section');
        if (homeSection) {
            homeSection.classList.add('active-section');
        }
    });

    // Open profile modal and populate fields
    function openProfileModal() {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) return;
        document.getElementById('profile-name').value = currentUser.name;
        document.getElementById('profile-email').value = currentUser.email;
        document.getElementById('profile-password').value = '';
        document.getElementById('profile-confirm-password').value = '';
        document.getElementById('profile-modal').classList.add('active');
    }

    // Handle profile form submit
    function handleProfileSave(e) {
        e.preventDefault();
        const name = document.getElementById('profile-name').value.trim();
        const password = document.getElementById('profile-password').value;
        const confirmPassword = document.getElementById('profile-confirm-password').value;
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) return;
        if (password && password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        // Update user in registeredUsers or userDatabase
        if (registeredUsers[currentUser.email]) {
            registeredUsers[currentUser.email].name = name;
            if (password) registeredUsers[currentUser.email].password = password;
            sessionStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        } else if (userDatabase[currentUser.email]) {
            userDatabase[currentUser.email].name = name;
            if (password) userDatabase[currentUser.email].password = password;
        }
        // Update session
        currentUser.name = name;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        // Update UI
        updateUIForRole(currentUser.role);
        document.getElementById('profile-modal').classList.remove('active');
        alert('Profile updated successfully!');
    }

    // Add event listener for profile form and close modal
    window.addEventListener('DOMContentLoaded', function() {
        document.getElementById('profile-form')?.addEventListener('submit', handleProfileSave);
        document.querySelectorAll('#profile-modal .close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('profile-modal').classList.remove('active');
            });
        });
    });
});