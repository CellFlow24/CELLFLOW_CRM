// --- LOGIN LOGIC ---
function verifyLogin() {
    const user = document.getElementById("adminId").value;
    const pass = document.getElementById("adminPass").value;
    
    if(user === "admin_dipun" && pass === "Cellflow@2026") {
        document.getElementById("loginOverlay").style.display = "none";
        document.getElementById('appLoader').classList.add('active');
        setTimeout(() => { 
            document.getElementById('appLoader').classList.remove('active'); 
            renderFeed(); 
        }, 800);
    } else {
        alert("Access Denied. Invalid credentials.");
    }
}

// --- MOCK DATA (JSON) ---
const mockOrders = [
    { ticketId: "CF-849201", name: "Shubhabrata Dokal", type: "B2B E-Commerce Setup", paymentStatus: "Pending", workCompleted: false, time: "10 mins ago", history: "[10 Aug] Client requested quote." },
    { ticketId: "CF-492103", name: "SK MD Asib", type: "Mess Khata Management", paymentStatus: "Paid", workCompleted: false, time: "2 hours ago", history: "[11 Aug] Payment received." },
    { ticketId: "CF-112233", name: "Khadimul Islam", type: "CBT Portal", paymentStatus: "Paid", workCompleted: true, time: "1 day ago", history: "[12 Aug] App delivered." }
];

const mockSettings = [
    { item: "Mess Khata", amount: 199, discount: 99, link: "https://drive.google.com/..." },
    { item: "Bill Flow", amount: 8999, discount: 5999, link: "" },
    { item: "Mok Test APK", amount: 6999, discount: 3999, link: "" }
];

let currentFilter = 'Payment Pending';

// --- TAB SWITCHING ---
function switchTab(tabName, event) {
    currentFilter = tabName;
    document.getElementById('currentTabTitle').textContent = tabName;
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    if(event) event.target.classList.add('active');
    
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

// --- RENDER ORDERS ---
function renderFeed() {
    const feed = document.getElementById('orderFeed');
    feed.innerHTML = ''; 

    let filteredOrders = mockOrders.filter(order => {
        if (currentFilter === 'Payment Pending') return order.paymentStatus === 'Pending';
        if (currentFilter === 'Work Pending') return order.paymentStatus === 'Paid' && !order.workCompleted;
        if (currentFilter === 'Completed') return order.paymentStatus === 'Paid' && order.workCompleted;
    });

    if (filteredOrders.length === 0) {
        feed.innerHTML = `<p style="color: #64748b; text-align:center; padding: 40px;">No records found for ${currentFilter}.</p>`;
        return;
    }

    filteredOrders.forEach(order => {
        let statusClass = order.paymentStatus === 'Paid' ? 'status-paid' : 'status-pending';
        let displayStatus = order.paymentStatus === 'Paid' ? (order.workCompleted ? 'Completed' : 'Work Pending') : 'Payment Pending';
        
        feed.innerHTML += `
            <div class="crm-card" onclick="openActionModal('${order.ticketId}')">
                <div class="card-top">
                    <span class="ticket-id">${order.ticketId}</span>
                    <span class="time-ago">${order.time}</span>
                </div>
                <div class="client-name">${order.name}</div>
                <div class="req-type" style="font-size:0.9rem; margin-bottom:10px;">${order.type}</div>
                <div class="status-badge ${statusClass}">${displayStatus}</div>
            </div>`;
    });
}

// --- RENDER SETTINGS (Payment Ditels) ---
function renderSettings() {
    const feed = document.getElementById('settingsFeed');
    let tableHtml = `
        <div style="background:white; border-radius:12px; border:1px solid #e2e8f0; overflow-x:auto;">
            <table class="settings-table">
                <thead>
                    <tr>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Discounted Amount</th>
                        <th>Tutorial Link</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
    `;

    mockSettings.forEach((setting, index) => {
        tableHtml += `
            <tr>
                <td><input type="text" value="${setting.item}" id="item-${index}"></td>
                <td><input type="number" value="${setting.amount}" id="amt-${index}"></td>
                <td><input type="number" value="${setting.discount}" id="disc-${index}"></td>
                <td><input type="text" value="${setting.link}" placeholder="https..." id="link-${index}"></td>
                <td><button class="btn-refresh" style="background:#0056b3; color:white;" onclick="alert('Saved row ${index} to G-Sheets!')">Save</button></td>
            </tr>
        `;
    });

    tableHtml += `</tbody></table></div>`;
    feed.innerHTML = tableHtml;
}

// --- DYNAMIC ACTION MODAL (Merged Inputs + Tracker) ---
function openActionModal(ticketId) {
    const order = mockOrders.find(o => o.ticketId === ticketId);
    document.getElementById('modalTitle').textContent = `Manage: ${ticketId}`;
    
    let bodyHtml = `<div style="background:#f8fafc; padding:15px; border-radius:8px; margin-bottom:20px; font-size:0.9rem;">
        <strong>Client:</strong> ${order.name}<br>
        <strong>Request:</strong> ${order.type}<br>
        <strong>History:</strong> <span style="color:#64748b;">${order.history || 'No emails sent yet.'}</span>
    </div>`;

    let trackerStatus = '';

    if (order.paymentStatus === 'Pending') {
        trackerStatus = 'Pending';
        bodyHtml += `
            <div style="margin-bottom:15px;">
                <label style="font-weight:bold; font-size:0.9rem;">Quotation Amount (₹):</label>
                <input type="number" id="quoteAmount" placeholder="e.g. 5999" class="modal-input">
            </div>
            <button class="action-btn btn-quote" onclick="triggerAction('Send Quote', '${ticketId}')">📄 Send Quote & Payment Link</button>
            <div style="margin-bottom:15px; margin-top:15px;">
                <label style="font-weight:bold; font-size:0.9rem;">Send Custom Email:</label>
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
            <div style="display:flex; gap:10px; margin-bottom:15px;">
                <div style="flex:1;">
                    <label style="font-weight:bold; font-size:0.9rem;">User ID:</label>
                    <input type="text" id="userId" placeholder="Admin" class="modal-input">
                </div>
                <div style="flex:1;">
                    <label style="font-weight:bold; font-size:0.9rem;">Password:</label>
                    <input type="text" id="userPass" placeholder="***" class="modal-input">
                </div>
            </div>
            <button class="action-btn btn-deliver" onclick="triggerAction('Deliver App', '${ticketId}')">🚀 Deliver App</button>
            <div style="margin-bottom:15px; margin-top:15px;">
                <textarea id="customMsg" placeholder="Type message to client..." class="modal-input" style="height:60px;"></textarea>
            </div>
            <button class="action-btn" style="background:#e2e8f0; color:#1e293b;" onclick="triggerAction('Custom Mail', '${ticketId}')">✉️ Send Message</button>
        `;
    } else {
        trackerStatus = 'Completed';
    }

    // Append Tracker Button to ALL states
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
    
    if(status === 'Pending') {
        timelineHtml += `<div class="timeline-step active"><div class="step-icon">⏳</div><div class="step-text"><strong>Payment Pending</strong></div></div>`;
    } else if(status === 'Work Pending') {
        timelineHtml += `<div class="timeline-step completed"><div class="step-icon">✓</div><div class="step-text"><strong>Payment Received</strong></div></div>
                         <div class="timeline-step active"><div class="step-icon">📦</div><div class="step-text"><strong>Work Pending</strong></div></div>`;
    } else {
        timelineHtml += `<div class="timeline-step completed"><div class="step-icon">✓</div><div class="step-text"><strong>Payment Received</strong></div></div>
                         <div class="timeline-step completed"><div class="step-icon">✓</div><div class="step-text"><strong>App Delivered</strong></div></div>`;
    }

    document.getElementById('trackerTimeline').innerHTML = timelineHtml;
    document.getElementById('trackerModal').classList.add('active');
}

function triggerAction(action, ticketId) {
    alert(`Payload Prepared for Google Sheets!\nAction: ${action}\nTicket: ${ticketId}`);
    closeModal('actionModal');
}

function closeModal(modalId) { document.getElementById(modalId).classList.remove('active'); }
function refreshData() { 
    document.getElementById('appLoader').classList.add('active');
    setTimeout(() => { document.getElementById('appLoader').classList.remove('active'); renderFeed(); if(currentFilter === 'Settings') renderSettings(); }, 800);
}
