// --- MOCK DATA (JSON) ---
const mockOrders = [
    { ticketId: "CF-849201", name: "Shubhabrata Dokal", type: "B2B E-Commerce Setup", paymentStatus: "Pending", workCompleted: false, time: "10 mins ago", history: "[10 Aug] Client requested quote." },
    { ticketId: "CF-492103", name: "SK MD Asib", type: "Mess Khata Management", paymentStatus: "Paid", workCompleted: false, time: "2 hours ago", history: "[11 Aug] Payment received." },
    { ticketId: "CF-112233", name: "Khadimul Islam", type: "CBT Portal", paymentStatus: "Paid", workCompleted: true, time: "1 day ago", history: "[12 Aug] App delivered." }
];

// Product Pricing (From "Payment Ditels" sheet)
const mockSettings = [
    { item: "Mess Khata", amount: 199, discount: 99, link: "https://drive.google.com/..." },
    { item: "Bill Flow", amount: 8999, discount: 5999, link: "" },
    { item: "Mok Test APK", amount: 6999, discount: 3999, link: "" }
];

// Company Profile & Admin Auth (From "Settings" sheet)
const mockCompanySettings = [
    { key: "AdminID", value: "admin_dipun" },
    { key: "AdminPassword", value: "Cellflow@2026" },
    { key: "CompanyName", value: "Cell Flow" },
    { key: "CompanyAddress", value: "Jamalpur, Purba barddhaman pin 7012408" },
    { key: "CompanyPhone", value: "7501230258" },
    { key: "CompanyEmail", value: "cellflow24@gmail.com" },
    { key: "CompanyWebsite", value: "cellflow24.github.io" },
    { key: "BankName", value: "SBI" },
    { key: "AccountNumber", value: "567777393637" },
    { key: "IFSCCode", value: "SBIN00123" },
    { key: "UPIID", value: "cellflow@oksbi" },
    { key: "Note", value: "This is a system-generated invoice and requires no physical signature. Thank you for doing business with Cellflow." }
];

// --- LOGIN LOGIC (Now dynamic!) ---
function verifyLogin() {
    const user = document.getElementById("adminId").value;
    const pass = document.getElementById("adminPass").value;
    
    // Pull the credentials directly from the settings array
    const realUser = mockCompanySettings.find(s => s.key === "AdminID").value;
    const realPass = mockCompanySettings.find(s => s.key === "AdminPassword").value;
    
    if(user === realUser && pass === realPass) {
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

// --- RENDER SETTINGS (Products AND Company Details) ---
function renderSettings() {
    const feed = document.getElementById('settingsFeed');
    
    // 1. Products Table
    let html = `
        <div style="margin-bottom: 40px;">
            <h3 style="color: var(--text-dark); margin-bottom: 15px;">Product Pricing & Links</h3>
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
        html += `
            <tr>
                <td><input type="text" value="${setting.item}" id="item-${index}"></td>
                <td><input type="number" value="${setting.amount}" id="amt-${index}"></td>
                <td><input type="number" value="${setting.discount}" id="disc-${index}"></td>
                <td><input type="text" value="${setting.link}" placeholder="https..." id="link-${index}"></td>
                <td><button class="btn-refresh" style="background:#0056b3; color:white; border:none;" onclick="alert('Saved row ${index} to G-Sheets!')">Save</button></td>
            </tr>
        `;
    });

    html += `</tbody></table></div></div>`;

    // 2. Company Profile & Auth Table
    html += `
        <div style="margin-bottom: 20px;">
            <h3 style="color: var(--text-dark); margin-bottom: 15px;">Company Profile & Authentication</h3>
            <div style="background:white; border-radius:12px; border:1px solid #e2e8f0; overflow-x:auto;">
                <table class="settings-table">
                    <thead>
                        <tr>
                            <th style="width: 25%;">Setting Name</th>
                            <th style="width: 60%;">Value</th>
                            <th style="width: 15%;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    mockCompanySettings.forEach((setting, index) => {
        let inputType = setting.key.includes("Password") ? "password" : "text";
        html += `
            <tr>
                <td style="font-weight: 600; color: var(--text-dark);">${setting.key}</td>
                <td>
                    ${setting.key === "Note" 
                        ? `<textarea id="comp-${index}" style="width:100%; padding:8px 12px; border:1px solid var(--border); border-radius:6px; font-family:inherit; resize:vertical; min-height:60px;">${setting.value}</textarea>`
                        : `<input type="${inputType}" value="${setting.value}" id="comp-${index}">`
                    }
                </td>
                <td><button class="btn-refresh" style="background:#0056b3; color:white; border:none;" onclick="alert('Saved ${setting.key} to G-Sheets!')">Save</button></td>
            </tr>
        `;
    });

    html += `</tbody></table></div></div>`;
    feed.innerHTML = html;
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
