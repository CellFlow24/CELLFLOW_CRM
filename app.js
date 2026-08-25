// --- LIVE GOOGLE SHEETS API URL ---
const API_URL = "https://script.google.com/macros/s/AKfycbxi5eKscJULcVf9ygblyu3MJqLAaHLAaqEk5_VN7DTe1e4BSOeE_gk9xvwaNkGF4mq4yQ/exec";

// --- MOCK DATA (Updated with 'details' and 'amount') ---
let liveOrders = [
    { ticketId: "CF-690234", name: "Dipun Chakraborty", email: "test@mail.com", type: "Inquiry about Apps", details: "I want to know more about Mess Khata and how it handles multiple PG branches.", paymentStatus: "Pending", amount: 0, workCompleted: false, time: "22 Aug, 10:59 PM", history: "" },
    { ticketId: "CF-849201", name: "Shubhabrata Dokal", email: "test2@mail.com", type: "B2B E-Commerce Setup", details: "Direct order from website.", paymentStatus: "Pending", amount: 5999, workCompleted: false, time: "23 Aug, 01:30 AM", history: "[10 Aug] Quote Sent." },
    { ticketId: "CF-112233", name: "SK MD Asib", email: "test3@mail.com", type: "CBT Portal", details: "Mock test app setup.", paymentStatus: "Paid", amount: 3999, workCompleted: false, time: "1 day ago", history: "[12 Aug] Payment Received." }
];

let liveSettings = [
    { item: "Mess Khata", amount: 199, discount: 99, link: "https://drive.google.com/..." },
    { item: "Bill Flow", amount: 8999, discount: 5999, link: "" },
    { item: "Mok Test APK", amount: 6999, discount: 3999, link: "" }
];

let liveCompanySettings = [
    { key: "AdminID", value: "admin_dipun" },
    { key: "AdminPassword", value: "Cellflow@2026" },
    { key: "Note", value: "This is a system-generated invoice." }
];

let currentFilter = 'Inquiries';

// --- INITIALIZATION ---
window.onload = () => {
    // Simulated fetch for now until backend is hooked up
    if (localStorage.getItem('crm_logged_in') === 'true') {
        document.getElementById("loginOverlay").style.display = "none";
        renderFeed();
    } else {
        document.getElementById("loginOverlay").style.display = "flex";
    }
};

// --- LOGOUT LOGIC ---
function logout() {
    localStorage.removeItem('crm_logged_in');
    location.reload();
}

function verifyLogin() {
    const user = document.getElementById("adminId").value;
    const pass = document.getElementById("adminPass").value;
    
    const realUser = liveCompanySettings.find(s => s.key === "AdminID")?.value || "admin_dipun";
    const realPass = liveCompanySettings.find(s => s.key === "AdminPassword")?.value || "Cellflow@2026";
    
    if (user === realUser && pass === realPass) {
        localStorage.setItem('crm_logged_in', 'true');
        document.getElementById("loginOverlay").style.display = "none";
        renderFeed();
    } else {
        alert("Access Denied. Invalid credentials.");
    }
}

// --- TAB SWITCHING ---
function switchTab(tabName, event) {
    currentFilter = tabName;
    document.getElementById('currentTabTitle').textContent = tabName;
    
    // Update Desktop Nav
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    // Update Mobile Nav
    document.querySelectorAll('.mobile-nav .nav-item').forEach(li => li.classList.remove('active'));
    
    if(event) {
        if(event.currentTarget.tagName === 'LI') event.currentTarget.classList.add('active'); // Desktop
        else event.currentTarget.classList.add('active'); // Mobile
    }
    
    if(tabName === 'Settings') {
        document.getElementById('orderFeed').style.display = 'none';
        document.getElementById('settingsFeed').style.display = 'block';
        renderSettings();
    } else {
        document.getElementById('settingsFeed').style.display = 'none';
        document.getElementById('orderFeed').style.display = 'flex';
        renderFeed();
    }
}

// --- RENDER LIVE ORDERS ---
function renderFeed() {
    const feed = document.getElementById('orderFeed');
    feed.innerHTML = ''; 

    let filteredOrders = liveOrders.filter(order => {
        let isZeroAmount = !order.amount || order.amount == 0;
        
        if (currentFilter === 'Inquiries') return order.paymentStatus === 'Pending' && isZeroAmount;
        if (currentFilter === 'Payment Pending') return order.paymentStatus === 'Pending' && !isZeroAmount;
        if (currentFilter === 'Work Pending') return order.paymentStatus === 'Paid' && !order.workCompleted;
        if (currentFilter === 'Completed') return order.workCompleted || order.paymentStatus === 'Closed';
    });

    if (filteredOrders.length === 0) {
        feed.innerHTML = `<p style="color: #64748b; text-align:center; padding: 40px;">No records found for ${currentFilter}.</p>`;
        return;
    }

    filteredOrders.forEach(order => {
        let isZeroAmount = !order.amount || order.amount == 0;
        let statusClass = 'status-pending';
        let displayStatus = 'Inquiry';

        if (order.workCompleted || order.paymentStatus === 'Closed') {
            statusClass = 'status-paid';
            displayStatus = 'Completed';
        } else if (order.paymentStatus === 'Paid') {
            statusClass = 'status-paid';
            displayStatus = 'Work Pending';
        } else if (order.paymentStatus === 'Pending' && !isZeroAmount) {
            displayStatus = 'Payment Pending';
        }

        // Details preview
        let shortDetails = order.details ? order.details.substring(0, 60) + (order.details.length > 60 ? '...' : '') : 'No details provided.';
        
        feed.innerHTML += `
            <div class="crm-card" onclick="openActionModal('${order.ticketId}')">
                <div class="card-top">
                    <span class="ticket-id">${order.ticketId}</span>
                    <span class="time-ago">${order.time}</span>
                </div>
                <div class="client-name">${order.name}</div>
                <div class="req-type" style="font-size:0.9rem; margin-bottom:5px; color: var(--primary); font-weight:600;">${order.type}</div>
                <div style="font-size:0.85rem; color:#64748b; margin-bottom:12px; line-height:1.4;">${shortDetails}</div>
                <div class="status-badge ${statusClass}">${displayStatus}</div>
            </div>`;
    });
}

function renderSettings() {
    const feed = document.getElementById('settingsFeed');
    feed.innerHTML = `
        <div style="margin-bottom: 20px;">
            <button class="action-btn" style="background:#ef4444; color:white; width:auto; padding:8px 20px;" onclick="logout()">Logout / Clear Remember Me</button>
        </div>
        <p style="color:#64748b;">Settings tables go here (same as previous code)...</p>
    `;
}

// --- DYNAMIC ACTION MODAL ---
function openActionModal(ticketId) {
    const order = liveOrders.find(o => o.ticketId === ticketId);
    if (!order) return;
    
    document.getElementById('modalTitle').textContent = `Manage: ${ticketId}`;
    
    let isZeroAmount = !order.amount || order.amount == 0;
    
    let bodyHtml = `<div style="background:#f8fafc; padding:15px; border-radius:8px; margin-bottom:20px; font-size:0.9rem;">
        <strong>Client:</strong> ${order.name}<br>
        <strong>Email:</strong> ${order.email}<br>
        <strong>Type:</strong> ${order.type}<br>
        <div style="margin-top:8px; padding:10px; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px;">
            <strong>Details:</strong><br>${order.details || 'N/A'}
        </div>
        <div style="margin-top:10px;"><strong>History:</strong> <span style="color:#64748b;">${order.history || 'No emails sent yet.'}</span></div>
    </div>`;

    let trackerStatus = '';

    if (order.paymentStatus === 'Pending' && isZeroAmount) {
        trackerStatus = 'Inquiry';
        bodyHtml += `
            <div style="margin-bottom:15px;">
                <label style="font-weight:bold; font-size:0.9rem;">Send Quotation (Moves to Payment Pending):</label>
                <input type="number" id="quoteAmount" placeholder="Amount (₹)" class="modal-input">
            </div>
            <button class="action-btn btn-quote" onclick="triggerAction('Send Quote', '${ticketId}')">📄 Send Quote & Payment Link</button>
            <button class="action-btn btn-deliver" onclick="triggerAction('Close Inquiry', '${ticketId}')">✅ Mark Resolved / Close</button>
            <div style="margin-bottom:15px; margin-top:15px;">
                <textarea id="customMsg" placeholder="Type message to client..." class="modal-input" style="height:60px;"></textarea>
            </div>
            <button class="action-btn" style="background:#e2e8f0; color:#1e293b;" onclick="triggerAction('Custom Mail', '${ticketId}')">✉️ Send Message</button>
        `;
    } else if (order.paymentStatus === 'Pending' && !isZeroAmount) {
        trackerStatus = 'Payment Pending';
        bodyHtml += `
            <button class="action-btn btn-quote" onclick="triggerAction('Resend Quote', '${ticketId}')">📄 Resend Payment Link (₹${order.amount})</button>
            <div style="margin-bottom:15px; margin-top:15px;">
                <textarea id="customMsg" placeholder="Type message to client..." class="modal-input" style="height:60px;"></textarea>
            </div>
            <button class="action-btn" style="background:#e2e8f0; color:#1e293b;" onclick="triggerAction('Custom Mail', '${ticketId}')">✉️ Send Message</button>
        `;
    } else if (order.paymentStatus === 'Paid' && !order.workCompleted) {
        trackerStatus = 'Work Pending';
        bodyHtml += `
            <div style="margin-bottom:15px;">
                <label style="font-weight:bold; font-size:0.9rem;">Final App Link:</label>
                <input type="text" id="appLink" placeholder="https://..." class="modal-input">
            </div>
            <button class="action-btn btn-deliver" onclick="triggerAction('Deliver App', '${ticketId}')">🚀 Deliver App</button>
        `;
    } else {
        trackerStatus = 'Completed';
    }

    bodyHtml += `<hr style="margin:20px 0; border:none; border-top:1px solid #e2e8f0;">
                 <button class="action-btn btn-view" onclick="openTracker('${ticketId}', '${trackerStatus}')">🔍 View Timeline Tracker</button>`;

    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('actionModal').classList.add('active');
}

// --- TRACKER MODAL ---
function openTracker(ticketId, status) {
    closeModal('actionModal');
    document.getElementById('track-id').textContent = ticketId;
    
    let timelineHtml = `<div class="timeline-step completed"><div class="step-icon">✓</div><div class="step-text"><strong>Request Received</strong></div></div>`;
    
    if(status === 'Inquiry') {
        timelineHtml += `<div class="timeline-step active"><div class="step-icon">📩</div><div class="step-text"><strong>Reviewing Inquiry</strong></div></div>`;
    } else if(status === 'Payment Pending') {
        timelineHtml += `<div class="timeline-step active"><div class="step-icon">⏳</div><div class="step-text"><strong>Payment Pending</strong></div></div>`;
    } else if(status === 'Work Pending') {
        timelineHtml += `<div class="timeline-step completed"><div class="step-icon">✓</div><div class="step-text"><strong>Payment Received</strong></div></div>
                         <div class="timeline-step active"><div class="step-icon">📦</div><div class="step-text"><strong>Work Pending</strong></div></div>`;
    } else {
        timelineHtml += `<div class="timeline-step completed"><div class="step-icon">✓</div><div class="step-text"><strong>Resolved / Completed</strong></div></div>`;
    }

    document.getElementById('trackerTimeline').innerHTML = timelineHtml;
    document.getElementById('trackerModal').classList.add('active');
}

function triggerAction(action, ticketId) {
    alert(`Payload Prepared!\nAction: ${action}\nTicket: ${ticketId}`);
    closeModal('actionModal');
}

function closeModal(modalId) { document.getElementById(modalId).classList.remove('active'); }
function refreshData() { 
    document.getElementById('appLoader').classList.add('active');
    setTimeout(() => { document.getElementById('appLoader').classList.remove('active'); renderFeed(); }, 800);
}
