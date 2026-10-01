/* =========================================================
   ALUMNI BRIDGE - FRONTEND SCRIPT (PHP + MySQL BACKED)
   Same UI, function names and IDs as the original version,
   but all data now comes from the PHP backend instead of
   localStorage.
   ========================================================= */

let selectedAuthRole = "student";
let currentUser = null; // cached profile of the logged-in user

/* =========================================================
   API CLIENT
   ========================================================= */
async function apiRequest(url, method = "GET", body = null) {
    const options = { method, credentials: "same-origin", headers: {} };
    if (body !== null) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }
    try {
        const response = await fetch(url, options);
        return await response.json();
    } catch (error) {
        console.error("API request failed:", error);
        return { success: false, message: "Unable to reach the server. Please check that Apache/MySQL are running." };
    }
}

const API = {
    me: () => apiRequest("backend/api/auth/me.php"),
    login: (payload) => apiRequest("backend/api/auth/login.php", "POST", payload),
    register: (payload) => apiRequest("backend/api/auth/register.php", "POST", payload),
    logout: () => apiRequest("backend/api/auth/logout.php", "POST", {}),
    forgotPassword: (email) => apiRequest("backend/api/auth/forgot_password.php", "POST", { email }),

    updateStudentProfile: (payload) => apiRequest("backend/api/students/update_profile.php", "POST", payload),
    updateAlumniProfile: (payload) => apiRequest("backend/api/alumni/update_profile.php", "POST", payload),

    listMentors: (search) => apiRequest("backend/api/alumni/list.php" + (search ? ("?search=" + encodeURIComponent(search)) : "")),
    getAlumni: (id) => apiRequest("backend/api/alumni/get.php?id=" + encodeURIComponent(id)),

    listAvailability: () => apiRequest("backend/api/availability/list.php"),
    createAvailability: (payload) => apiRequest("backend/api/availability/create.php", "POST", payload),
    deleteAvailability: (id) => apiRequest("backend/api/availability/delete.php", "POST", { id }),

    createSession: (payload) => apiRequest("backend/api/sessions/create.php", "POST", payload),
    listSessions: () => apiRequest("backend/api/sessions/list.php"),
    acceptSession: (id) => apiRequest("backend/api/sessions/accept.php", "POST", { id }),
    declineSession: (id) => apiRequest("backend/api/sessions/decline.php", "POST", { id }),
    cancelSession: (id, reason) => apiRequest("backend/api/sessions/cancel.php", "POST", { id, reason }),

    createReferral: (payload) => apiRequest("backend/api/referrals/create.php", "POST", payload),
    listReferrals: () => apiRequest("backend/api/referrals/list.php"),
    declineReferral: (id) => apiRequest("backend/api/referrals/update_status.php", "POST", { id, status: "declined" }),
    submitReferralProof: (id, proofNote, proofLink) => apiRequest("backend/api/referrals/submit_proof.php", "POST", { id, proofNote, proofLink }),

    listNotifications: () => apiRequest("backend/api/notifications/list.php"),
    markNotificationsRead: () => apiRequest("backend/api/notifications/mark_read.php", "POST", {}),
    clearNotifications: () => apiRequest("backend/api/notifications/clear.php", "POST", {})
};

/* =========================================================
   UTILITY HELPERS (unchanged from the original frontend)
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
    const date = new Date(dateString.replace(" ", "T"));
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

async function signup(event) {
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

    const result = await API.register({
        role: selectedAuthRole,
        name,
        email,
        password,
        confirmPassword
    });

    if (!result.success) {
        showToast(result.message || "Could not create account.");
        return;
    }

    showToast("Account created successfully.");
    document.getElementById("signupForm")?.reset();
    showLogin();
}

async function login(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
    const password = document.getElementById("loginPassword")?.value;

    const result = await API.login({ role: selectedAuthRole, email, password });

    if (!result.success) {
        showToast(result.message || "Invalid email, password or account type.");
        return;
    }

    currentUser = result.data;
    document.getElementById("authPage")?.classList.add("hidden");

    if (currentUser.role === "student") {
        document.getElementById("studentApp")?.classList.remove("hidden");
        showStudentPage("dashboard");
    } else {
        document.getElementById("alumniApp")?.classList.remove("hidden");
        showAlumniPage("dashboard");
    }
    updateAllNotifications();
}

async function logout() {
    await API.logout();
    currentUser = null;
    document.getElementById("studentApp")?.classList.add("hidden");
    document.getElementById("alumniApp")?.classList.add("hidden");
    document.getElementById("authPage")?.classList.remove("hidden");
    showRoleSelection();
    showToast("Logged out successfully.");
}

async function resetPassword(event) {
    event.preventDefault();
    const email = document.getElementById("forgotEmail")?.value.trim().toLowerCase();
    const result = await API.forgotPassword(email);

    if (!result.success) {
        showToast(result.message || "No account found with this email.");
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
async function loadStudentDashboard() {
    if (!currentUser || currentUser.role !== "student") return;

    const welcomeName = document.getElementById("studentWelcomeName");
    const headerName = document.getElementById("studentHeaderName");
    if (welcomeName) welcomeName.textContent = currentUser.name;
    if (headerName) headerName.textContent = currentUser.name;

    const [mentorsResult, sessionsResult, referralsResult] = await Promise.all([
        API.listMentors(),
        API.listSessions(),
        API.listReferrals()
    ]);

    const mentors = mentorsResult.success ? mentorsResult.data : [];
    const sessions = sessionsResult.success ? sessionsResult.data : [];
    const referrals = referralsResult.success ? referralsResult.data : [];

    const mentorCount = document.getElementById("studentMentorCount");
    const sessionCount = document.getElementById("studentSessionCount");
    const referralCount = document.getElementById("studentReferralCount");

    if (mentorCount) mentorCount.textContent = mentors.length;
    if (sessionCount) sessionCount.textContent = sessions.length;
    if (referralCount) referralCount.textContent = referrals.length;

    loadRecommendedMentors(mentors);
}

function loadRecommendedMentors(mentors) {
    const container = document.getElementById("studentRecommendedMentors");
    if (!container) return;

    const featured = mentors.slice(0, 6);

    if (featured.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👨‍💼</div>
                No alumni mentors available yet.
            </div>
        `;
        return;
    }
    container.innerHTML = featured.map(mentor => createMentorCard(mentor)).join("");
}

/* =========================================================
   STUDENT MENTORS
   ========================================================= */
async function loadStudentMentors() {
    const container = document.getElementById("studentMentorList");
    if (!container) return;
    const search = document.getElementById("mentorSearch")?.value.trim() || "";

    const result = await API.listMentors(search);
    const mentors = result.success ? result.data : [];

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
async function openAlumniProfileModal(alumniId) {
    const result = await API.getAlumni(alumniId);
    if (!result.success) {
        showToast(result.message || "Could not load this profile.");
        return;
    }
    const alumni = result.data;

    const availableSlots = alumni.slots.length
        ? alumni.slots.map(slot => `
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
async function loadStudentSessions() {
    const container = document.getElementById("studentSessionList");
    if (!container) return;

    const result = await API.listSessions();
    const sessions = result.success ? result.data : [];

    if (sessions.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📅</div>No mentorship sessions yet.</div>`;
        return;
    }

    container.innerHTML = sessions.map(session => `
        <div class="data-card">
            <div>
                <h3>${escapeHTML(session.alumniName || "Alumni")}</h3>
                <p>${escapeHTML(session.alumniCompany || "")}</p>
                <p>📅 ${formatDateTime(session.date, session.time)}</p>
                <span class="status status-${getSessionStatusClass(session.status)}">${capitalize(session.status)}</span>
            </div>
            <div class="data-card-actions">
                ${(session.status === "pending" || session.status === "confirmed")
                    ? `<button class="danger-button" onclick="openCancelSessionModal(${session.id})">Cancel Session</button>` : ""}
            </div>
        </div>
    `).join("");
}

function getSessionStatusClass(status) {
    if (status === "confirmed") return "confirmed";
    if (status === "cancelled" || status === "declined") return "cancelled";
    return "pending";
}

/* =========================================================
   MENTORSHIP SESSION REQUEST
   ========================================================= */
async function openMentorSessionModal(alumniId) {
    const result = await API.getAlumni(alumniId);
    if (!result.success) {
        showToast(result.message || "Could not load this mentor.");
        return;
    }
    const alumni = result.data;
    const slots = alumni.slots;

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

async function requestMentorshipSession(event, alumniId) {
    event.preventDefault();
    const slotId = document.getElementById("sessionSlot")?.value;
    const message = document.getElementById("sessionMessage")?.value.trim();

    if (!slotId) {
        showToast("Please select a valid slot.");
        return;
    }

    const result = await API.createSession({ alumniId, slotId, message });
    if (!result.success) {
        showToast(result.message || "Could not send request.");
        return;
    }

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
        <form onsubmit="confirmCancelSession(event, ${sessionId})">
            <div class="form-group">
                <label>Reason for Cancellation</label>
                <textarea id="cancelReason" placeholder="Enter reason..." required></textarea>
            </div>
            <button type="submit" class="danger-button full-width">Confirm Cancellation</button>
        </form>
    `;
    openModal(html);
}

async function confirmCancelSession(event, sessionId) {
    event.preventDefault();
    const reason = document.getElementById("cancelReason")?.value.trim();
    await cancelSession(sessionId, reason);
    closeModal();
}

async function cancelSession(sessionId, reason = "") {
    const result = await API.cancelSession(sessionId, reason);
    if (!result.success) {
        showToast(result.message || "This session cannot be cancelled.");
        return;
    }

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
async function loadAlumniDashboard() {
    if (!currentUser || currentUser.role !== "alumni") return;

    const welcomeName = document.getElementById("alumniWelcomeName");
    const headerName = document.getElementById("alumniHeaderName");
    if (welcomeName) welcomeName.textContent = currentUser.name;
    if (headerName) headerName.textContent = currentUser.name;

    const [availabilityResult, sessionsResult, referralsResult] = await Promise.all([
        API.listAvailability(),
        API.listSessions(),
        API.listReferrals()
    ]);

    const slots = (availabilityResult.success ? availabilityResult.data : []).filter(s => s.status === "available");
    const sessions = sessionsResult.success ? sessionsResult.data : [];
    const pendingSessions = sessions.filter(s => s.status === "pending");
    const referrals = (referralsResult.success ? referralsResult.data : []).filter(r => r.status === "pending");

    const slotCount = document.getElementById("alumniSlotCount");
    const pendingCount = document.getElementById("alumniPendingCount");
    const referralCount = document.getElementById("alumniReferralCount");

    if (slotCount) slotCount.textContent = slots.length;
    if (pendingCount) pendingCount.textContent = pendingSessions.length;
    if (referralCount) referralCount.textContent = referrals.length;

    loadAlumniRecentRequests(pendingSessions);
}

function loadAlumniRecentRequests(pendingSessions) {
    const container = document.getElementById("alumniRecentRequests");
    if (!container) return;

    const sessions = pendingSessions.slice(0, 5);

    if (sessions.length === 0) {
        container.innerHTML = `<div class="empty-state">No pending requests.</div>`;
        return;
    }

    container.innerHTML = sessions.map(session => `
        <div class="data-card">
            <div>
                <h3>${escapeHTML(session.studentName || "Student")}</h3>
                <p>Requested a mentorship session.</p>
            </div>
            <div class="data-card-actions">
                <button class="primary-button" onclick="showAlumniPage('requests')">View Request</button>
            </div>
        </div>
    `).join("");
}

/* =========================================================
   ALUMNI REQUESTS
   ========================================================= */
async function loadAlumniRequests() {
    const container = document.getElementById("alumniRequestList");
    if (!container) return;

    const result = await API.listSessions();
    const sessions = result.success ? result.data : [];

    if (sessions.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📩</div>No mentorship requests.</div>`;
        return;
    }

    container.innerHTML = sessions.map(session => `
        <div class="data-card">
            <div>
                <h3>${escapeHTML(session.studentName || "Student")}</h3>
                <p>${escapeHTML(session.studentDepartment || "")}</p>
                <p>📅 ${formatDateTime(session.date, session.time)}</p>
                <p>${escapeHTML(session.message || "")}</p>
                <span class="status status-${getSessionStatusClass(session.status)}">${capitalize(session.status)}</span>
            </div>
            <div class="data-card-actions">
                ${session.status === "pending"
                    ? `<button class="success-button" onclick="acceptSession(${session.id})">Accept</button>
                       <button class="danger-button" onclick="declineSession(${session.id})">Decline</button>
                       <button class="danger-button" onclick="openCancelSessionModal(${session.id})">Cancel Session</button>`
                    : session.status === "confirmed"
                    ? `<button class="danger-button" onclick="openCancelSessionModal(${session.id})">Cancel Session</button>`
                    : ""}
            </div>
        </div>
    `).join("");
}

async function acceptSession(sessionId) {
    const result = await API.acceptSession(sessionId);
    if (!result.success) {
        showToast(result.message || "Could not accept this session.");
        return;
    }
    showToast("Session accepted.");
    loadAlumniRequests();
    loadAlumniDashboard();
    updateAllNotifications();
}

async function declineSession(sessionId) {
    const result = await API.declineSession(sessionId);
    if (!result.success) {
        showToast(result.message || "Could not decline this session.");
        return;
    }
    showToast("Session request declined.");
    loadAlumniRequests();
    loadAlumniDashboard();
    updateAllNotifications();
}

/* =========================================================
   ALUMNI AVAILABILITY
   ========================================================= */
async function loadAlumniAvailability() {
    const container = document.getElementById("alumniAvailabilityList");
    if (!container) return;

    const result = await API.listAvailability();
    const slots = result.success ? result.data : [];

    if (slots.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📅</div>No availability added yet.</div>`;
        return;
    }

    container.innerHTML = slots.map(slot => `
        <div class="availability-card">
            <h3>${formatDate(slot.date)}</h3>
            <div class="availability-date">${formatTime(slot.time)}</div>
            <div class="availability-time">${slot.duration} minutes</div>
            <span class="status ${slot.status === "available" ? "status-confirmed" : "status-pending"}">${capitalize(slot.status)}</span>
            ${slot.status === "available" ? `<br><br><button class="danger-button" onclick="deleteAvailability(${slot.id})">Remove Slot</button>` : ""}
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

async function addAvailability(event) {
    event.preventDefault();
    const date = document.getElementById("availDate")?.value;
    const time = document.getElementById("availTime")?.value;
    const duration = parseInt(document.getElementById("availDuration")?.value);

    if (!date || !time || !duration) {
        showToast("Please fill all availability fields.");
        return;
    }

    const result = await API.createAvailability({ date, time, duration });
    if (!result.success) {
        showToast(result.message || "Could not add slot.");
        return;
    }

    closeModal();
    showToast("Availability slot added.");
    loadAlumniAvailability();
    loadAlumniDashboard();
}

async function deleteAvailability(slotId) {
    const result = await API.deleteAvailability(slotId);
    if (!result.success) {
        showToast(result.message || "Could not remove slot.");
        return;
    }
    showToast("Slot removed.");
    loadAlumniAvailability();
    loadAlumniDashboard();
}

/* =========================================================
   REFERRALS
   ========================================================= */
async function openReferralRequestModal(alumniId = "") {
    const result = await API.listMentors();
    const mentors = result.success ? result.data : [];

    if (mentors.length === 0) {
        showToast("No alumni available for referral requests.");
        return;
    }

    const defaultCv = currentUser?.cvLink || "";
    const defaultPortfolio = currentUser?.portfolioLink || "";

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

async function submitReferralRequest(event) {
    event.preventDefault();

    const alumniId = document.getElementById("referralAlumni")?.value;
    const company = document.getElementById("referralCompany")?.value.trim();
    const position = document.getElementById("referralPosition")?.value.trim();
    const cvLink = document.getElementById("referralCvLink")?.value.trim();
    const portfolioLink = document.getElementById("referralPortfolioLink")?.value.trim();
    const message = document.getElementById("referralMessage")?.value.trim();

    const result = await API.createReferral({ alumniId, company, position, cvLink, portfolioLink, message });
    if (!result.success) {
        showToast(result.message || "Could not submit referral request.");
        return;
    }

    closeModal();
    showToast("Referral request submitted successfully.");
    loadStudentReferrals();
    updateAllNotifications();
}

/* =========================================================
   STUDENT REFERRALS
   ========================================================= */
async function loadStudentReferrals() {
    const container = document.getElementById("studentReferralList");
    if (!container) return;

    const result = await API.listReferrals();
    const referrals = result.success ? result.data : [];

    if (referrals.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📄</div>No referral requests sent yet.</div>`;
        return;
    }

    container.innerHTML = referrals.map(r => `
        <div class="referral-card">
            <div class="referral-card-header">
                <div>
                    <h3>${escapeHTML(r.position)} at ${escapeHTML(r.company)}</h3>
                    <p>Requested to <strong>${escapeHTML(r.alumniName || "Alumni")}</strong></p>
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
    `).join("");
}

/* =========================================================
   ALUMNI REFERRALS
   ========================================================= */
async function loadAlumniReferrals() {
    const container = document.getElementById("alumniReferralList");
    if (!container) return;

    const result = await API.listReferrals();
    const referrals = result.success ? result.data : [];

    if (referrals.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🤝</div><h3>No referral requests yet</h3></div>`;
        return;
    }

    container.innerHTML = referrals.map(r => createAlumniReferralCard(r)).join("");
}

function createAlumniReferralCard(referral) {
    return `
        <div class="referral-card">
            <div class="referral-card-header">
                <div class="referral-user">
                    <div class="referral-avatar">${escapeHTML(getInitials(referral.studentName || "Student"))}</div>
                    <div>
                        <h3>${escapeHTML(referral.studentName || "Student")}</h3>
                        <p>${escapeHTML(referral.studentDepartment || "Student")}</p>
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
                    <button class="success-button" onclick="openReferralSubmitModal(${referral.id})">Accept & Submit Referral</button>
                    <button class="danger-button" onclick="updateReferralStatus(${referral.id}, 'declined')">Decline</button>
                </div>
            ` : ""}
        </div>
    `;
}

async function updateReferralStatus(referralId, newStatus) {
    if (newStatus !== "declined") return;

    const result = await API.declineReferral(referralId);
    if (!result.success) {
        showToast(result.message || "Could not update referral status.");
        return;
    }

    showToast("Referral status updated to declined.");
    loadAlumniReferrals();
    loadAlumniDashboard();
    updateAllNotifications();
}

function openReferralSubmitModal(referralId) {
    const html = `
        <h2 class="modal-title">Mark Referral as Submitted</h2>
        <p class="modal-subtitle">Provide details or proof for this referral</p>
        <form onsubmit="submitReferralProof(event, ${referralId})">
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

async function submitReferralProof(event, referralId) {
    event.preventDefault();
    const proofNote = document.getElementById("referralProofNote")?.value.trim() || "";
    const proofLink = document.getElementById("referralProofLink")?.value.trim() || "";

    const result = await API.submitReferralProof(referralId, proofNote, proofLink);
    if (!result.success) {
        showToast(result.message || "Could not submit referral.");
        return;
    }

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
    if (!currentUser || currentUser.role !== "student") return;

    const name = document.getElementById("studentProfileName");
    const email = document.getElementById("studentProfileEmail");
    const department = document.getElementById("studentProfileDepartment");
    const skills = document.getElementById("studentProfileSkills");
    const cvLink = document.getElementById("studentProfileCvLink");
    const portfolioLink = document.getElementById("studentProfilePortfolioLink");

    if (name) name.value = currentUser.name || "";
    if (email) email.value = currentUser.email || "";
    if (department) department.value = currentUser.department || "";
    if (skills) skills.value = currentUser.skills || "";
    if (cvLink) cvLink.value = currentUser.cvLink || "";
    if (portfolioLink) portfolioLink.value = currentUser.portfolioLink || "";
}

async function updateStudentProfile(event) {
    event.preventDefault();

    const payload = {
        name: document.getElementById("studentProfileName")?.value.trim() || "",
        department: document.getElementById("studentProfileDepartment")?.value.trim() || "",
        skills: document.getElementById("studentProfileSkills")?.value.trim() || "",
        cvLink: document.getElementById("studentProfileCvLink")?.value.trim() || "",
        portfolioLink: document.getElementById("studentProfilePortfolioLink")?.value.trim() || ""
    };

    const result = await API.updateStudentProfile(payload);
    if (!result.success) {
        showToast(result.message || "Could not update profile.");
        return;
    }

    currentUser = result.data;
    showToast("Profile updated successfully.");
    loadStudentDashboard();
}

/* =========================================================
   ALUMNI PROFILE
   ========================================================= */
function loadAlumniProfile() {
    if (!currentUser || currentUser.role !== "alumni") return;

    const name = document.getElementById("alumniProfileName");
    const email = document.getElementById("alumniProfileEmail");
    const company = document.getElementById("alumniProfileCompany");
    const job = document.getElementById("alumniProfileJob");
    const skills = document.getElementById("alumniProfileSkills");
    const bio = document.getElementById("alumniProfileBio");

    if (name) name.value = currentUser.name || "";
    if (email) email.value = currentUser.email || "";
    if (company) company.value = currentUser.company || "";
    if (job) job.value = currentUser.jobTitle || "";
    if (skills) skills.value = currentUser.skills || "";
    if (bio) bio.value = currentUser.bio || "";
}

async function updateAlumniProfile(event) {
    event.preventDefault();

    const payload = {
        name: document.getElementById("alumniProfileName")?.value.trim() || "",
        company: document.getElementById("alumniProfileCompany")?.value.trim() || "",
        jobTitle: document.getElementById("alumniProfileJob")?.value.trim() || "",
        skills: document.getElementById("alumniProfileSkills")?.value.trim() || "",
        bio: document.getElementById("alumniProfileBio")?.value.trim() || ""
    };

    const result = await API.updateAlumniProfile(payload);
    if (!result.success) {
        showToast(result.message || "Could not update profile.");
        return;
    }

    currentUser = result.data;
    showToast("Profile updated successfully.");
    loadAlumniDashboard();
}

/* =========================================================
   NOTIFICATIONS
   ========================================================= */
async function updateAllNotifications() {
    if (!currentUser) return;

    const badge = document.getElementById(`${currentUser.role}NotificationBadge`);
    const list = document.getElementById(`${currentUser.role}NotificationList`);
    if (!badge || !list) return;

    const result = await API.listNotifications();
    const allNotifs = result.success ? result.data : [];

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

async function markNotificationsAsRead() {
    await API.markNotificationsRead();
    const badge = document.getElementById(`${currentUser.role}NotificationBadge`);
    if (badge) badge.classList.add("hidden");
    updateAllNotifications();
}

async function clearNotifications(role) {
    await API.clearNotifications();
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
window.addEventListener("DOMContentLoaded", async () => {
    const result = await API.me();
    const user = result.success ? result.data : null;

    if (user) {
        currentUser = user;
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
