/* =========================================================
   ALUMNI BRIDGE - COMPLETE JAVASCRIPT
   Compatible with the updated index.html + styles.css
   ========================================================= */

const STORAGE_KEYS = {
    users: "alumniBridgeUsers",
    currentUser: "alumniBridgeCurrentUser",
    sessions: "alumniBridgeSessions",
    availability: "alumniBridgeAvailability",
    notifications: "alumniBridgeNotifications",
    referrals: "alumniBridgeReferrals"
};

let selectedAuthRole = "student";

/* =========================================================
   STORAGE HELPERS
   ========================================================= */
function getStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error("Storage error:", error);
        return defaultValue;
    }
}

function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() { return getStorage(STORAGE_KEYS.users, []); }
function saveUsers(users) { setStorage(STORAGE_KEYS.users, users); }
function getSessions() { return getStorage(STORAGE_KEYS.sessions, []); }
function saveSessions(sessions) { setStorage(STORAGE_KEYS.sessions, sessions); }
function getAvailability() { return getStorage(STORAGE_KEYS.availability, []); }
function saveAvailability(availability) { setStorage(STORAGE_KEYS.availability, availability); }
function getNotifications() { return getStorage(STORAGE_KEYS.notifications, []); }
function saveNotifications(notifications) { setStorage(STORAGE_KEYS.notifications, notifications); }
function getReferrals() { return getStorage(STORAGE_KEYS.referrals, []); }
function saveReferrals(referrals) { setStorage(STORAGE_KEYS.referrals, referrals); }

function getCurrentUser() {
    const id = localStorage.getItem(STORAGE_KEYS.currentUser);
    if (!id) return null;
    return getUsers().find(user => user.id === id) || null;
}

function generateId(prefix = "id") {
    return prefix + "_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
}

/* =========================================================
   UTILITY HELPERS
   ========================================================= */
function capitalize(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function getInitials(name) {
    if (!name) return "U";
    return name.trim().split(/\s+/).slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
}

function escapeHTML(value) {
    if (value === undefined || value === null) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getTodayDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(time) {
    if (!time) return "";
    const parts = time.split(":");
    let hour = parseInt(parts[0]);
    const minute = parts[1] || "00";
    const suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${suffix}`;
}

function formatDateTime(date, time) {
    return `${formatDate(date)} at ${formatTime(time)}`;
}

function formatNotificationTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/* =========================================================
   AUTH LOGIC
   ========================================================= */
function hideAuthBoxes() {
    ["roleSelection", "loginBox", "signupBox", "forgotBox"].forEach(id => {
        document.getElementById(id)?.classList.add("hidden");
    });
}

function showRoleSelection() {
    hideAuthBoxes();
    document.getElementById("roleSelection")?.classList.remove("hidden");
}

function selectAuthRole(role) {
    selectedAuthRole = role;
    hideAuthBoxes();
    document.getElementById("loginBox")?.classList.remove("hidden");
    const roleText = document.getElementById("loginRoleText");
    if (roleText) {
        roleText.textContent = `Login as ${capitalize(role)}`;
    }
}

function showLogin() {
    hideAuthBoxes();
    document.getElementById("loginBox")?.classList.remove("hidden");
}

function showSignup() {
    hideAuthBoxes();
    document.getElementById("signupBox")?.classList.remove("hidden");
    const roleText = document.getElementById("signupRoleText");
    if (roleText) {
        roleText.textContent = `Create a ${capitalize(selectedAuthRole)} account`;
    }
    updateSignupFields();
}

function showForgotPassword() {
    hideAuthBoxes();
    document.getElementById("forgotBox")?.classList.remove("hidden");
}

function updateSignupFields() {
    const studentFields = document.getElementById("studentSignupFields");
    const alumniFields = document.getElementById("alumniSignupFields");
    if (!studentFields || !alumniFields) return;

    if (selectedAuthRole === "student") {
        studentFields.classList.remove("hidden");
        alumniFields.classList.add("hidden");
    } else {
        studentFields.classList.add("hidden");
        alumniFields.classList.remove("hidden");
    }
}

function signup(event) {
    event.preventDefault();
    const name = document.getElementById("signupName")?.value.trim();
    const email = document.getElementById("signupEmail")?.value.trim().toLowerCase();
    const password = document.getElementById("signupPassword")?.value;
    const confirmPassword = document.getElementById("signupConfirmPassword")?.value;

    if (!name || !email || !password) {
        showToast("Please fill in all required fields.");
        return;
    }
    if (password !== confirmPassword) {
        showToast("Passwords do not match.");
        return;
    }

    const users = getUsers();
    if (users.some(user => user.email.toLowerCase() === email)) {
        showToast("An account with this email already exists.");
        return;
    }

    const newUser = {
        id: generateId(selectedAuthRole),
        role: selectedAuthRole,
        name: name,
        email: email,
        password: password,
        department: document.getElementById("signupDepartment")?.value.trim() || "",
        company: document.getElementById("signupCompany")?.value.trim() || "",
        jobTitle: document.getElementById("signupJobTitle")?.value.trim() || "",
        skills: "",
        bio: "",
        cvLink: "",
        portfolioLink: "",
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    showToast("Account created successfully.");
    document.getElementById("signupForm")?.reset();
    showLogin();
}

function login(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
    const password = document.getElementById("loginPassword")?.value;

    const user = getUsers().find(item =>
        item.email.toLowerCase() === email &&
        item.password === password &&
        item.role === selectedAuthRole
    );

    if (!user) {
        showToast("Invalid email, password or account type.");
        return;
    }

    localStorage.setItem(STORAGE_KEYS.currentUser, user.id);
    document.getElementById("authPage")?.classList.add("hidden");

    if (user.role === "student") {
        document.getElementById("studentApp")?.classList.remove("hidden");
        showStudentPage("dashboard");
    } else {
        document.getElementById("alumniApp")?.classList.remove("hidden");
        showAlumniPage("dashboard");
    }
    updateAllNotifications();
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    document.getElementById("studentApp")?.classList.add("hidden");
    document.getElementById("alumniApp")?.classList.add("hidden");
    document.getElementById("authPage")?.classList.remove("hidden");
    showRoleSelection();
    showToast("Logged out successfully.");
}

function resetPassword(event) {
    event.preventDefault();
    const email = document.getElementById("forgotEmail")?.value.trim().toLowerCase();
    const user = getUsers().find(u => u.email.toLowerCase() === email);

    if (!user) {
        showToast("No account found with this email.");
        return;
    }
    showToast("Password reset instructions have been sent.");
    showLogin();
}

/* =========================================================
   NAVIGATION
   ========================================================= */
function showStudentPage(page) {
    ["dashboard", "mentors", "sessions", "referrals", "profile"].forEach(name => {
        document.getElementById(`student${capitalize(name)}Page`)?.classList.add("hidden");
    });
    document.getElementById(`student${capitalize(page)}Page`)?.classList.remove("hidden");

    if (page === "dashboard") loadStudentDashboard();
    if (page === "mentors") loadStudentMentors();
    if (page === "sessions") loadStudentSessions();
    if (page === "referrals") loadStudentReferrals();
    if (page === "profile") loadStudentProfile();

    updateAllNotifications();
}

function showAlumniPage(page) {
    ["dashboard", "requests", "availability", "referrals", "profile"].forEach(name => {
        document.getElementById(`alumni${capitalize(name)}Page`)?.classList.add("hidden");
    });
    document.getElementById(`alumni${capitalize(page)}Page`)?.classList.remove("hidden");

    if (page === "dashboard") loadAlumniDashboard();
    if (page === "requests") loadAlumniRequests();
    if (page === "availability") loadAlumniAvailability();
    if (page === "referrals") loadAlumniReferrals();
    if (page === "profile") loadAlumniProfile();

    updateAllNotifications();
}

/* =========================================================
   STUDENT DASHBOARD
   ========================================================= */
function loadStudentDashboard() {
    const user = getCurrentUser();
    if (!user || user.role !== "student") return;

    const welcomeName = document.getElementById("studentWelcomeName");
    const headerName = document.getElementById("studentHeaderName");
    if (welcomeName) welcomeName.textContent = user.name;
    if (headerName) headerName.textContent = user.name;

    const mentors = getUsers().filter(u => u.role === "alumni");
    const sessions = getSessions().filter(s => s.studentId === user.id);
    const referrals = getReferrals().filter(r => r.studentId === user.id);

    const mentorCount = document.getElementById("studentMentorCount");
    const sessionCount = document.getElementById("studentSessionCount");
    const referralCount = document.getElementById("studentReferralCount");

    if (mentorCount) mentorCount.textContent = mentors.length;
    if (sessionCount) sessionCount.textContent = sessions.length;
    if (referralCount) referralCount.textContent = referrals.length;

    loadRecommendedMentors();
}

function loadRecommendedMentors() {
    const container = document.getElementById("studentRecommendedMentors");
    if (!container) return;

    const mentors = getUsers().filter(u => u.role === "alumni").slice(0, 6);

    if (mentors.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👨‍💼</div>
                No alumni mentors available yet.
            </div>
        `;
        return;
    }
    container.innerHTML = mentors.map(mentor => createMentorCard(mentor)).join("");
}

/* =========================================================
   STUDENT MENTORS
   ========================================================= */
function loadStudentMentors() {
    const container = document.getElementById("studentMentorList");
    if (!container) return;
    const search = document.getElementById("mentorSearch")?.value.trim().toLowerCase() || "";

    const mentors = getUsers()
        .filter(user => user.role === "alumni")
        .filter(mentor => {
            const text = [mentor.name, mentor.company, mentor.jobTitle, mentor.skills, mentor.bio].join(" ").toLowerCase();
            return text.includes(search);
        });

    if (mentors.length === 0) {
        container.innerHTML = `<div class="empty-state">No mentors found.</div>`;
        return;
    }
    container.innerHTML = mentors.map(mentor => createMentorCard(mentor)).join("");
}

function createMentorCard(mentor) {
    return `
        <div class="mentor-card">
            <div class="mentor-top">
                <div class="mentor-avatar">${escapeHTML(getInitials(mentor.name))}</div>
                <div>
                    <h3>${escapeHTML(mentor.name)}</h3>
                    <div class="job-title">${escapeHTML(mentor.jobTitle || "Alumni")}</div>
                </div>
            </div>
            <div class="mentor-company">🏢 ${escapeHTML(mentor.company || "Company not specified")}</div>
            <p>${escapeHTML(mentor.bio || "Experienced alumni available to guide students.")}</p>
            ${mentor.skills ? `<p><strong>Skills:</strong> ${escapeHTML(mentor.skills)}</p>` : ""}
            <div class="mentor-actions">
                <button class="secondary-button" onclick="openAlumniProfileModal('${mentor.id}')">View Full Profile</button>
                <button class="secondary-button" onclick="openMentorSessionModal('${mentor.id}')">Request Session</button>
                <button class="primary-button" onclick="openReferralRequestModal('${mentor.id}')">Request Referral</button>
            </div>
        </div>
    `;
}

/* =========================================================
   ALUMNI FULL PROFILE MODAL
   ========================================================= */
function openAlumniProfileModal(alumniId) {
    const alumni = getUsers().find(u => u.id === alumniId && u.role === "alumni");
    if (!alumni) return;

    const slots = getAvailability()
        .filter(slot => slot.alumniId === alumniId && slot.status === "available")
        .filter(slot => slot.date >= getTodayDate())
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    const availableSlots = slots.length
        ? slots.map(slot => `
            <div class="profile-slot">
                <span>📅 ${formatDateTime(slot.date, slot.time)}</span>
                <span>${slot.duration} mins</span>
            </div>
        `).join("")
        : `<p class="profile-muted">No available slots at the moment.</p>`;

    const html = `
        <div class="alumni-profile-modal">
            <div class="profile-modal-header">
                <div class="mentor-avatar profile-avatar">${escapeHTML(getInitials(alumni.name))}</div>
                <div>
                    <h2 class="modal-title">${escapeHTML(alumni.name)}</h2>
                    <p class="profile-job">${escapeHTML(alumni.jobTitle || "Alumni")}</p>
                </div>
            </div>
            <div class="profile-details">
                <div class="profile-detail-item"><strong>📧 Email</strong><span>${escapeHTML(alumni.email || "Not specified")}</span></div>
                <div class="profile-detail-item"><strong>🏢 Company</strong><span>${escapeHTML(alumni.company || "Not specified")}</span></div>
                <div class="profile-detail-item"><strong>🎓 Department</strong><span>${escapeHTML(alumni.department || "Not specified")}</span></div>
                <div class="profile-detail-item"><strong>🛠️ Skills</strong><span>${escapeHTML(alumni.skills || "Not specified")}</span></div>
            </div>
            <div class="profile-section">
                <h3>About</h3>
                <p>${escapeHTML(alumni.bio || "No bio provided.")}</p>
            </div>
            <div class="profile-section">
                <h3>Available Mentorship Slots</h3>
                ${availableSlots}
            </div>
            <div class="mentor-actions profile-actions">
                <button class="secondary-button" onclick="closeModal()">Close</button>
                <button class="primary-button" onclick="closeModal(); openMentorSessionModal('${alumni.id}')">Request Session</button>
            </div>
        </div>
    `;
    openModal(html);
}

/* =========================================================
   STUDENT SESSIONS
   ========================================================= */
function loadStudentSessions() {
    const container = document.getElementById("studentSessionList");
    if (!container) return;
    const user = getCurrentUser();
    if (!user) return;

    const sessions = getSessions()
        .filter(s => s.studentId === user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (sessions.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📅</div>No mentorship sessions yet.</div>`;
        return;
    }

    const users = getUsers();
    container.innerHTML = sessions.map(session => {
        const alumni = users.find(u => u.id === session.alumniId);
        return `
            <div class="data-card">
                <div>
                    <h3>${escapeHTML(alumni?.name || "Alumni")}</h3>
                    <p>${escapeHTML(alumni?.company || "")}</p>
                    <p>📅 ${formatDateTime(session.date, session.time)}</p>
                    <span class="status status-${getSessionStatusClass(session.status)}">${capitalize(session.status)}</span>
                </div>
                <div class="data-card-actions">
                    ${(session.status === "pending" || session.status === "confirmed")
                        ? `<button class="danger-button" onclick="cancelSession('${session.id}')">Cancel Session</button>` : ""}
                </div>
            </div>
        `;
    }).join("");
}

function getSessionStatusClass(status) {
    if (status === "confirmed") return "confirmed";
    if (status === "cancelled") return "cancelled";
    return "pending";
}

/* =========================================================
   MENTORSHIP SESSION REQUEST
   ========================================================= */
function openMentorSessionModal(alumniId) {
    const alumni = getUsers().find(u => u.id === alumniId && u.role === "alumni");
    if (!alumni) return;

    const slots = getAvailability()
        .filter(slot => slot.alumniId === alumniId && slot.status === "available")
        .filter(slot => slot.date >= getTodayDate());

    if (slots.length === 0) {
        showToast("This alumni has no available session slots.");
        return;
    }

    const html = `
        <h2 class="modal-title">Request Mentorship Session</h2>
        <p class="modal-subtitle">Request a session with <strong>${escapeHTML(alumni.name)}</strong></p>
        <form onsubmit="requestMentorshipSession(event, '${alumniId}')">
            <div class="form-group">
                <label>Select Available Slot</label>
                <select id="sessionSlot" required>
                    <option value="">Select a slot</option>
                    ${slots.map(slot => `<option value="${slot.id}">${formatDateTime(slot.date, slot.time)} - ${slot.duration} mins</option>`).join("")}
                </select>
            </div>
            <div class="form-group">
                <label>Message</label>
                <textarea id="sessionMessage" placeholder="Tell the alumni what you want to discuss..." required></textarea>
            </div>
            <button type="submit" class="primary-button">Send Session Request</button>
        </form>
    `;
    openModal(html);
}

function requestMentorshipSession(event, alumniId) {
    event.preventDefault();
    const student = getCurrentUser();
    if (!student || student.role !== "student") return;

    const slotId = document.getElementById("sessionSlot")?.value;
    const message = document.getElementById("sessionMessage")?.value.trim();
    const availability = getAvailability();
    const slot = availability.find(s => s.id === slotId);

    if (!slot) {
        showToast("Please select a valid slot.");
        return;
    }

    const sessions = getSessions();
    sessions.push({
        id: generateId("session"),
        studentId: student.id,
        alumniId: alumniId,
        slotId: slot.id,
        date: slot.date,
        time: slot.time,
        duration: slot.duration,
        message: message,
        status: "pending",
        createdAt: new Date().toISOString()
    });

    saveSessions(sessions);
    saveAvailability(availability); // Keeps the slot available for multiple requests 

    addNotification(alumniId, "New Mentorship Request", `${student.name} requested a mentorship session with you.`);
    closeModal();
    showToast("Mentorship request sent successfully.");
    loadStudentSessions();
}

/* =========================================================
   CANCEL SESSION
   ========================================================= */
function openCancelSessionModal(sessionId) {
    const html = `
        <h2 class="modal-title">Cancel Session</h2>
        <p class="modal-subtitle">Please provide a reason for cancelling this session.</p>
        <form onsubmit="confirmCancelSession(event, '${sessionId}')">
            <div class="form-group">
                <label>Reason for Cancellation</label>
                <textarea id="cancelReason" placeholder="Enter reason..." required></textarea>
            </div>
            <button type="submit" class="danger-button full-width">Confirm Cancellation</button>
        </form>
    `;
    openModal(html);
}

function confirmCancelSession(event, sessionId) {
    event.preventDefault();
    const reason = document.getElementById("cancelReason")?.value.trim();
    cancelSession(sessionId, reason);
    closeModal();
}

function cancelSession(sessionId, reason = "") {
    const sessions = getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const isStudentOwner = currentUser.role === "student" && currentUser.id === session.studentId;
    const isAlumniOwner = currentUser.role === "alumni" && currentUser.id === session.alumniId;
    if (!isStudentOwner && !isAlumniOwner) {
        showToast("You are not allowed to cancel this session.");
        return;
    }

    if (session.status !== "pending" && session.status !== "confirmed") {
        showToast("This session cannot be cancelled.");
        return;
    }

    session.status = "cancelled";
    session.cancelledAt = new Date().toISOString();
    session.cancelledBy = currentUser.role;

    saveSessions(sessions);

    const availability = getAvailability();
    const slot = availability.find(s => s.id === session.slotId);
    if (slot) {
        slot.status = "available";
        saveAvailability(availability);
    }

    const recipientId = currentUser.role === "student" ? session.alumniId : session.studentId;
    const notificationMessage = currentUser.role === "alumni"
        ? `${currentUser.name} cancelled your mentorship session scheduled for ${formatDateTime(session.date, session.time)}.` + (reason ? ` Reason: ${reason}` : "")
        : `${currentUser.name} cancelled the mentorship session scheduled for ${formatDateTime(session.date, session.time)}.`;

    addNotification(recipientId, "Session Cancelled", notificationMessage);
    showToast("Session cancelled successfully.");

    if (currentUser.role === "student") {
        loadStudentSessions();
        loadStudentDashboard();
    } else {
        loadAlumniRequests();
        loadAlumniDashboard();
    }
    updateAllNotifications();
}

/* =========================================================
   ALUMNI DASHBOARD
   ========================================================= */
function loadAlumniDashboard() {
    const alumni = getCurrentUser();
    if (!alumni || alumni.role !== "alumni") return;

    const welcomeName = document.getElementById("alumniWelcomeName");
    const headerName = document.getElementById("alumniHeaderName");
    if (welcomeName) welcomeName.textContent = alumni.name;
    if (headerName) headerName.textContent = alumni.name;

    const slots = getAvailability().filter(s => s.alumniId === alumni.id && s.status === "available");
    const sessions = getSessions().filter(s => s.alumniId === alumni.id);
    const pendingSessions = sessions.filter(s => s.status === "pending");
    const referrals = getReferrals().filter(r => r.alumniId === alumni.id && r.status === "pending");

    const slotCount = document.getElementById("alumniSlotCount");
    const pendingCount = document.getElementById("alumniPendingCount");
    const referralCount = document.getElementById("alumniReferralCount");

    if (slotCount) slotCount.textContent = slots.length;
    if (pendingCount) pendingCount.textContent = pendingSessions.length;
    if (referralCount) referralCount.textContent = referrals.length;

    loadAlumniRecentRequests();
}

function loadAlumniRecentRequests() {
    const container = document.getElementById("alumniRecentRequests");
    if (!container) return;
    const alumni = getCurrentUser();
    if (!alumni) return;

    const sessions = getSessions()
        .filter(s => s.alumniId === alumni.id && s.status === "pending")
        .slice(0, 5);

    if (sessions.length === 0) {
        container.innerHTML = `<div class="empty-state">No pending requests.</div>`;
        return;
    }

    const users = getUsers();
    container.innerHTML = sessions.map(session => {
        const student = users.find(u => u.id === session.studentId);
        return `
            <div class="data-card">
                <div>
                    <h3>${escapeHTML(student?.name || "Student")}</h3>
                    <p>Requested a mentorship session.</p>
                </div>
                <div class="data-card-actions">
                    <button class="primary-button" onclick="showAlumniPage('requests')">View Request</button>
                </div>
            </div>
        `;
    }).join("");
}

/* =========================================================
   ALUMNI REQUESTS
   ========================================================= */
function loadAlumniRequests() {
    const container = document.getElementById("alumniRequestList");
    if (!container) return;
    const alumni = getCurrentUser();
    if (!alumni) return;

    const sessions = getSessions()
        .filter(s => s.alumniId === alumni.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (sessions.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📩</div>No mentorship requests.</div>`;
        return;
    }

    const users = getUsers();
    container.innerHTML = sessions.map(session => {
        const student = users.find(u => u.id === session.studentId);
        return `
            <div class="data-card">
                <div>
                    <h3>${escapeHTML(student?.name || "Student")}</h3>
                    <p>${escapeHTML(student?.department || "")}</p>
                    <p>📅 ${formatDateTime(session.date, session.time)}</p>
                    <p>${escapeHTML(session.message || "")}</p>
                    <span class="status status-${getSessionStatusClass(session.status)}">${capitalize(session.status)}</span>
                </div>
                <div class="data-card-actions">
                    ${session.status === "pending"
                        ? `<button class="success-button" onclick="acceptSession('${session.id}')">Accept</button>
                           <button class="danger-button" onclick="declineSession('${session.id}')">Decline</button>
                           <button class="danger-button" onclick="openCancelSessionModal('${session.id}')">Cancel Session</button>`
                        : session.status === "confirmed"
                        ? `<button class="danger-button" onclick="openCancelSessionModal('${session.id}')">Cancel Session</button>`
                        : ""}
                </div>
            </div>
        `;
    }).join("");
}

function acceptSession(sessionId) {
    const sessions = getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    session.status = "confirmed";
    session.updatedAt = new Date().toISOString();
    saveSessions(sessions);

    const alumni = getCurrentUser();
    if (!alumni) return;

    addNotification(session.studentId, "Session Accepted", `${alumni.name} accepted your mentorship session request for ${formatDateTime(session.date, session.time)}.`);
    showToast("Session accepted.");
    loadAlumniRequests();
    loadAlumniDashboard();
    updateAllNotifications();
}

function declineSession(sessionId) {
    const sessions = getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    session.status = "cancelled";
    session.cancelledAt = new Date().toISOString();
    session.cancelledBy = "alumni";
    saveSessions(sessions);

    const availability = getAvailability();
    const slot = availability.find(s => s.id === session.slotId);
    if (slot) {
        slot.status = "available";
        saveAvailability(availability);
    }

    const alumni = getCurrentUser();
    if (!alumni) return;

    addNotification(session.studentId, "Session Request Declined", `${alumni.name} declined your mentorship session request.`);
    showToast("Session request declined.");
    loadAlumniRequests();
    loadAlumniDashboard();
    updateAllNotifications();
}

/* =========================================================
   ALUMNI AVAILABILITY
   ========================================================= */
function loadAlumniAvailability() {
    const container = document.getElementById("alumniAvailabilityList");
    if (!container) return;
    const alumni = getCurrentUser();
    if (!alumni) return;

    const slots = getAvailability().filter(s => s.alumniId === alumni.id);

    if (slots.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📅</div>No availability added yet.</div>`;
        return;
    }

    container.innerHTML = slots.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .map(slot => `
            <div class="availability-card">
                <h3>${formatDate(slot.date)}</h3>
                <div class="availability-date">${formatTime(slot.time)}</div>
                <div class="availability-time">${slot.duration} minutes</div>
                <span class="status ${slot.status === "available" ? "status-confirmed" : "status-pending"}">${capitalize(slot.status)}</span>
                ${slot.status === "available" ? `<br><br><button class="danger-button" onclick="deleteAvailability('${slot.id}')">Remove Slot</button>` : ""}
            </div>
        `).join("");
}

function openAvailabilityModal() {
    const html = `
        <h2 class="modal-title">Add Availability</h2>
        <p class="modal-subtitle">Students will be able to request sessions during this time.</p>
        <form onsubmit="addAvailability(event)">
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="availDate" min="${getTodayDate()}" required>
            </div>
            <div class="form-group">
                <label>Start Time</label>
                <input type="time" id="availTime" required>
            </div>
            <div class="form-group">
                <label>Duration (Minutes)</label>
                <select id="availDuration">
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60" selected>60 minutes</option>
                </select>
            </div>
            <button type="submit" class="primary-button full-width">Add Slot</button>
        </form>
    `;
    openModal(html);
}

function addAvailability(event) {
    event.preventDefault();
    const alumni = getCurrentUser();
    if (!alumni || alumni.role !== "alumni") return;

    const date = document.getElementById("availDate")?.value;
    const time = document.getElementById("availTime")?.value;
    const duration = parseInt(document.getElementById("availDuration")?.value);

    if (!date || !time || !duration) {
        showToast("Please fill all availability fields.");
        return;
    }

    const availability = getAvailability();
    availability.push({
        id: generateId("slot"),
        alumniId: alumni.id,
        date: date,
        time: time,
        duration: duration,
        status: "available",
        createdAt: new Date().toISOString()
    });

    saveAvailability(availability);
    closeModal();
    showToast("Availability slot added.");
    loadAlumniAvailability();
    loadAlumniDashboard();
}

function deleteAvailability(slotId) {
    let availability = getAvailability();
    availability = availability.filter(s => s.id !== slotId);
    saveAvailability(availability);
    showToast("Slot removed.");
    loadAlumniAvailability();
    loadAlumniDashboard();
}

/* =========================================================
   REFERRALS
   ========================================================= */
function openReferralRequestModal(alumniId = "") {
    const mentors = getUsers().filter(u => u.role === "alumni");
    if (mentors.length === 0) {
        showToast("No alumni available for referral requests.");
        return;
    }

    const student = getCurrentUser();
    const defaultCv = student?.cvLink || "";
    const defaultPortfolio = student?.portfolioLink || "";

    const html = `
        <h2 class="modal-title">Request Job Referral</h2>
        <p class="modal-subtitle">Ask an alumni to refer you for an open position</p>
        <form onsubmit="submitReferralRequest(event)">
            <div class="form-group">
                <label>Select Alumni Mentor</label>
                <select id="referralAlumni" required>
                    <option value="">Choose mentor</option>
                    ${mentors.map(person => `
                        <option value="${person.id}" ${person.id === alumniId ? "selected" : ""}>
                            ${escapeHTML(person.name)} - ${escapeHTML(person.company || "Company not specified")}
                        </option>
                    `).join("")}
                </select>
            </div>
            <div class="form-group">
                <label>Target Company</label>
                <input type="text" id="referralCompany" placeholder="e.g. Google, Microsoft" required>
            </div>
            <div class="form-group">
                <label>Job / Position</label>
                <input type="text" id="referralPosition" placeholder="e.g. Software Engineer" required>
            </div>
            <div class="form-group">
                <label>CV Link <span style="font-weight:400; color:#6b7280;">(Google Drive, Dropbox, etc.)</span></label>
                <input type="url" id="referralCvLink" placeholder="https://drive.google.com/..." value="${escapeHTML(defaultCv)}" required>
            </div>
            <div class="form-group">
                <label>Portfolio / GitHub / Previous Job Link <span style="font-weight:400; color:#6b7280;">(Optional)</span></label>
                <input type="url" id="referralPortfolioLink" placeholder="https://github.com/..." value="${escapeHTML(defaultPortfolio)}">
            </div>
            <div class="form-group">
                <label>Message to Alumni</label>
                <textarea id="referralMessage" placeholder="Introduce yourself and explain why you are interested in this position..." required></textarea>
            </div>
            <button type="submit" class="primary-button full-width">Send Referral Request</button>
        </form>
    `;
    openModal(html);
}

function submitReferralRequest(event) {
    event.preventDefault();
    const student = getCurrentUser();
    if (!student || student.role !== "student") return;

    const alumniId = document.getElementById("referralAlumni")?.value;
    const company = document.getElementById("referralCompany")?.value.trim();
    const position = document.getElementById("referralPosition")?.value.trim();
    const cvLink = document.getElementById("referralCvLink")?.value.trim();
    const portfolioLink = document.getElementById("referralPortfolioLink")?.value.trim();
    const message = document.getElementById("referralMessage")?.value.trim();

    const referrals = getReferrals();
    referrals.push({
        id: generateId("referral"),
        studentId: student.id,
        alumniId: alumniId,
        company: company,
        position: position,
        cvLink: cvLink,
        portfolioLink: portfolioLink,
        message: message,
        status: "pending",
        proofNote: "",
        proofLink: "",
        createdAt: new Date().toISOString()
    });

    saveReferrals(referrals);
    addNotification(alumniId, "New Referral Request", `${student.name} requested a job referral for ${position} at ${company}.`);
    closeModal();
    showToast("Referral request submitted successfully.");
    loadStudentReferrals();
    updateAllNotifications();
}

/* =========================================================
   STUDENT REFERRALS
   ========================================================= */
function loadStudentReferrals() {
    const container = document.getElementById("studentReferralList");
    if (!container) return;
    const student = getCurrentUser();
    if (!student || student.role !== "student") return;

    const referrals = getReferrals()
        .filter(r => r.studentId === student.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (referrals.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📄</div>No referral requests sent yet.</div>`;
        return;
    }

    const users = getUsers();
    container.innerHTML = referrals.map(r => {
        const alumni = users.find(u => u.id === r.alumniId);
        return `
            <div class="referral-card">
                <div class="referral-card-header">
                    <div>
                        <h3>${escapeHTML(r.position)} at ${escapeHTML(r.company)}</h3>
                        <p>Requested to <strong>${escapeHTML(alumni?.name || "Alumni")}</strong></p>
                    </div>
                    <span class="status status-${r.status}">${capitalize(r.status)}</span>
                </div>
                ${r.cvLink ? `<a href="${escapeHTML(r.cvLink)}" target="_blank" class="referral-job-link">📄 View CV</a><br>` : ""}
                ${r.portfolioLink ? `<a href="${escapeHTML(r.portfolioLink)}" target="_blank" class="referral-job-link">🔗 View Portfolio/GitHub</a><br>` : ""}
                <br>
                <div class="referral-message">
                    <strong>Message:</strong>
                    ${escapeHTML(r.message)}
                </div>
                ${r.status === "referred" ? `
                    <div class="referral-success-box">
                        <strong>🎉 Referral Submitted by Alumni!</strong>
                        ${r.proofNote ? `<p style="margin-top:4px;">${escapeHTML(r.proofNote)}</p>` : ""}
                        ${r.proofLink ? `<p style="margin-top:4px;"><a href="${escapeHTML(r.proofLink)}" target="_blank" style="color:#15803d; font-weight:700;">View Referral Confirmation Link</a></p>` : ""}
                    </div>
                ` : ""}
            </div>
        `;
    }).join("");
}

/* =========================================================
   ALUMNI REFERRALS
   ========================================================= */
function loadAlumniReferrals() {
    const container = document.getElementById("alumniReferralList");
    if (!container) return;
    const alumni = getCurrentUser();
    if (!alumni || alumni.role !== "alumni") return;

    const referrals = getReferrals()
        .filter(r => r.alumniId === alumni.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (referrals.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🤝</div><h3>No referral requests yet</h3></div>`;
        return;
    }

    const users = getUsers();
    container.innerHTML = referrals.map(r => createAlumniReferralCard(r, users.find(u => u.id === r.studentId))).join("");
}

function createAlumniReferralCard(referral, student) {
    return `
        <div class="referral-card">
            <div class="referral-card-header">
                <div class="referral-user">
                    <div class="referral-avatar">${escapeHTML(getInitials(student?.name || "Student"))}</div>
                    <div>
                        <h3>${escapeHTML(student?.name || "Student")}</h3>
                        <p>${escapeHTML(student?.department || "Student")}</p>
                    </div>
                </div>
                <span class="status status-${referral.status}">${capitalize(referral.status)}</span>
            </div>
            <div class="referral-details">
                <div class="referral-detail">
                    <span class="referral-detail-label">Position</span>
                    <span class="referral-detail-value">${escapeHTML(referral.position)}</span>
                </div>
                <div class="referral-detail">
                    <span class="referral-detail-label">Company</span>
                    <span class="referral-detail-value">${escapeHTML(referral.company)}</span>
                </div>
            </div>
            ${referral.cvLink ? `<a href="${escapeHTML(referral.cvLink)}" target="_blank" class="referral-job-link">📄 View CV</a><br>` : ""}
            ${referral.portfolioLink ? `<a href="${escapeHTML(referral.portfolioLink)}" target="_blank" class="referral-job-link">🔗 View Portfolio/GitHub</a><br>` : ""}
            <br>
            <div class="referral-message">
                <strong>Message:</strong>
                ${escapeHTML(referral.message)}
            </div>
            ${referral.status === "pending" ? `
                <div class="referral-actions">
                    <button class="success-button" onclick="openReferralSubmitModal('${referral.id}')">Accept & Submit Referral</button>
                    <button class="danger-button" onclick="updateReferralStatus('${referral.id}', 'declined')">Decline</button>
                </div>
            ` : ""}
        </div>
    `;
}

function updateReferralStatus(referralId, newStatus) {
    const referrals = getReferrals();
    const referral = referrals.find(r => r.id === referralId);
    if (!referral) return;

    referral.status = newStatus;
    referral.updatedAt = new Date().toISOString();
    saveReferrals(referrals);

    const alumni = getCurrentUser();
    if (!alumni) return;

    addNotification(referral.studentId, `Referral Status: ${capitalize(newStatus)}`, `${alumni.name} updated your referral status for ${referral.position} at ${referral.company} to ${newStatus}.`);
    showToast(`Referral status updated to ${newStatus}.`);
    loadAlumniReferrals();
    loadAlumniDashboard();
    updateAllNotifications();
}

function openReferralSubmitModal(referralId) {
    const referral = getReferrals().find(r => r.id === referralId);
    if (!referral) return;

    const html = `
        <h2 class="modal-title">Mark Referral as Submitted</h2>
        <p class="modal-subtitle">Provide details or proof for referring ${escapeHTML(referral.position)} at ${escapeHTML(referral.company)}</p>
        <form onsubmit="submitReferralProof(event, '${referralId}')">
            <div class="form-group">
                <label>Notes / Message to Student</label>
                <textarea id="referralProofNote" placeholder="e.g. Submitted your resume internally via employee portal." required></textarea>
            </div>
            <div class="form-group">
                <label>Proof Link <span style="font-weight:400; color:#6b7280;">(Optional)</span></label>
                <input type="url" id="referralProofLink" placeholder="https://company.portal/referral-id">
            </div>
            <button type="submit" class="primary-button full-width">Confirm Referral</button>
        </form>
    `;
    openModal(html);
}

function submitReferralProof(event, referralId) {
    event.preventDefault();
    const referrals = getReferrals();
    const referral = referrals.find(r => r.id === referralId);
    if (!referral) return;

    referral.status = "referred";
    referral.proofNote = document.getElementById("referralProofNote")?.value.trim() || "";
    referral.proofLink = document.getElementById("referralProofLink")?.value.trim() || "";
    referral.updatedAt = new Date().toISOString();
    saveReferrals(referrals);

    const alumni = getCurrentUser();
    if (!alumni) return;

    addNotification(referral.studentId, "Referral Submitted 🎉", `${alumni.name} submitted a referral for ${referral.position} at ${referral.company}.`);
    closeModal();
    showToast("Referral submitted successfully.");
    loadAlumniReferrals();
    loadAlumniDashboard();
    updateAllNotifications();
}

/* =========================================================
   STUDENT PROFILE
   ========================================================= */
function loadStudentProfile() {
    const user = getCurrentUser();
    if (!user || user.role !== "student") return;

    const name = document.getElementById("studentProfileName");
    const email = document.getElementById("studentProfileEmail");
    const department = document.getElementById("studentProfileDepartment");
    const skills = document.getElementById("studentProfileSkills");
    const cvLink = document.getElementById("studentProfileCvLink");
    const portfolioLink = document.getElementById("studentProfilePortfolioLink");

    if (name) name.value = user.name || "";
    if (email) email.value = user.email || "";
    if (department) department.value = user.department || "";
    if (skills) skills.value = user.skills || "";
    if (cvLink) cvLink.value = user.cvLink || "";
    if (portfolioLink) portfolioLink.value = user.portfolioLink || "";
}

function updateStudentProfile(event) {
    event.preventDefault();
    const user = getCurrentUser();
    if (!user) return;

    user.name = document.getElementById("studentProfileName")?.value.trim() || "";
    user.department = document.getElementById("studentProfileDepartment")?.value.trim() || "";
    user.skills = document.getElementById("studentProfileSkills")?.value.trim() || "";
    user.cvLink = document.getElementById("studentProfileCvLink")?.value.trim() || "";
    user.portfolioLink = document.getElementById("studentProfilePortfolioLink")?.value.trim() || "";

    const users = getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
        users[index] = user;
        saveUsers(users);
        showToast("Profile updated successfully.");
        loadStudentDashboard();
    }
}

/* =========================================================
   ALUMNI PROFILE
   ========================================================= */
function loadAlumniProfile() {
    const user = getCurrentUser();
    if (!user || user.role !== "alumni") return;

    const name = document.getElementById("alumniProfileName");
    const email = document.getElementById("alumniProfileEmail");
    const company = document.getElementById("alumniProfileCompany");
    const job = document.getElementById("alumniProfileJob");
    const skills = document.getElementById("alumniProfileSkills");
    const bio = document.getElementById("alumniProfileBio");

    if (name) name.value = user.name || "";
    if (email) email.value = user.email || "";
    if (company) company.value = user.company || "";
    if (job) job.value = user.jobTitle || "";
    if (skills) skills.value = user.skills || "";
    if (bio) bio.value = user.bio || "";
}

function updateAlumniProfile(event) {
    event.preventDefault();
    const user = getCurrentUser();
    if (!user) return;

    user.name = document.getElementById("alumniProfileName")?.value.trim() || "";
    user.company = document.getElementById("alumniProfileCompany")?.value.trim() || "";
    user.jobTitle = document.getElementById("alumniProfileJob")?.value.trim() || "";
    user.skills = document.getElementById("alumniProfileSkills")?.value.trim() || "";
    user.bio = document.getElementById("alumniProfileBio")?.value.trim() || "";

    const users = getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
        users[index] = user;
        saveUsers(users);
        showToast("Profile updated successfully.");
        loadAlumniDashboard();
    }
}

/* =========================================================
   NOTIFICATIONS
   ========================================================= */
function addNotification(userId, title, message) {
    const notifications = getNotifications();
    notifications.push({
        id: generateId("notif"),
        userId: userId,
        title: title,
        message: message,
        isRead: false,
        createdAt: new Date().toISOString()
    });
    saveNotifications(notifications);
}

function updateAllNotifications() {
    const user = getCurrentUser();
    if (!user) return;

    const badge = document.getElementById(`${user.role}NotificationBadge`);
    const list = document.getElementById(`${user.role}NotificationList`);
    if (!badge || !list) return;

    const allNotifs = getNotifications()
        .filter(n => n.userId === user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const unreadCount = allNotifs.filter(n => !n.isRead).length;

    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove("hidden");
    } else {
        badge.classList.add("hidden");
    }

    if (allNotifs.length === 0) {
        list.innerHTML = `<div class="notification-item" style="text-align:center; color:#6b7280;">No notifications yet.</div>`;
        return;
    }

    list.innerHTML = allNotifs.map(n => `
        <div class="notification-item ${!n.isRead ? "unread" : ""}">
            <strong>${escapeHTML(n.title)}</strong>
            <p>${escapeHTML(n.message)}</p>
            <span class="notification-time">${formatNotificationTime(n.createdAt)}</span>
        </div>
    `).join("");
}

function toggleNotifications(role) {
    const panel = document.getElementById(`${role}NotificationPanel`);
    if (!panel) return;

    panel.classList.toggle("show");
    if (panel.classList.contains("show")) {
        markNotificationsAsRead();
    }
}

function markNotificationsAsRead() {
    const user = getCurrentUser();
    if (!user) return;

    let notifications = getNotifications();
    let updated = false;

    notifications = notifications.map(n => {
        if (n.userId === user.id && !n.isRead) {
            n.isRead = true;
            updated = true;
        }
        return n;
    });

    if (updated) {
        saveNotifications(notifications);
        const badge = document.getElementById(`${user.role}NotificationBadge`);
        if (badge) badge.classList.add("hidden");
    }
}

function clearNotifications(role) {
    const user = getCurrentUser();
    if (!user) return;

    let notifications = getNotifications();
    notifications = notifications.filter(n => n.userId !== user.id);
    saveNotifications(notifications);
    updateAllNotifications();
}

/* =========================================================
   MODAL LOGIC
   ========================================================= */
function openModal(htmlContent) {
    const modal = document.getElementById("modal");
    const modalBody = document.getElementById("modalBody");
    if (!modal || !modalBody) return;
    modalBody.innerHTML = htmlContent;
    modal.classList.remove("hidden");
}

function closeModal() {
    const modal = document.getElementById("modal");
    if (modal) modal.classList.add("hidden");
}

window.addEventListener("click", (event) => {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
        closeModal();
    }
});

/* =========================================================
   INITIALIZATION
   ========================================================= */
window.addEventListener("DOMContentLoaded", () => {
    const user = getCurrentUser();
    if (user) {
        document.getElementById("authPage")?.classList.add("hidden");
        if (user.role === "student") {
            document.getElementById("studentApp")?.classList.remove("hidden");
            showStudentPage("dashboard");
        } else {
            document.getElementById("alumniApp")?.classList.remove("hidden");
            showAlumniPage("dashboard");
        }
    } else {
        document.getElementById("authPage")?.classList.remove("hidden");
        showRoleSelection();
    }
});