// --- LIVE GOOGLE SHEETS API URL ---
const API_URL = "https://script.google.com/macros/s/AKfycbxi5eKscJULcVf9ygblyu3MJqLAaHLAaqEk5_VN7DTe1e4BSOeE_gk9xvwaNkGF4mq4yQ/exec";

// --- GLOBAL DATA STORAGE (Starts 100% Empty!) ---
let liveOrders = [];
let liveSettings = [];
let liveCompanySettings = [];
let currentFilter = 'Inquiries';

// --- INITIALIZATION & LIVE FETCH ---
window.onload = () => {
    fetchCRMData();
};

function fetchCRMData() {
    document.getElementById('appLoader').classList.add('active');
    
    // Fetch data from your Google Script doGet function
    fetch(API_URL + "?action=getCRMData")
        .then(res => res.json())
        .then(data => {
            // Store the real data
            liveOrders = data.orders || [];
            liveSettings = data.settings || [];
            liveCompanySettings = data.companySettings || [];
            
            document.getElementById('appLoader').classList.remove('active');
            
            // Auto-login check (PWA Feature)
            if (localStorage.getItem('crm_logged_in') === 'true') {
                document.getElementById("loginOverlay").style.display = "none";
                if(currentFilter === 'Settings') {
                    renderSettings();
                } else {
                    renderFeed();
                }
            } else {
                document.getElementById("loginOverlay").style.display = "flex";
            }
        })
        .catch(err => {
            alert("Failed to connect to Google Sheets. Check your internet.");
            document.getElementById('appLoader').classList.remove('active');
        });
}

// --- SECURE LOGIN LOGIC ---
function verifyLogin() {
    const user = document.getElementById("adminId").value;
    const pass = document.getElementById("adminPass").value;
    
    // Check against live data from Settings Sheet
    const realUserObj = liveCompanySettings.find(s => s.key === "AdminID");
    const realPassObj = liveCompanySettings.find(s => s.key === "AdminPassword");
    
    if (realUserObj && realPassObj && user === realUserObj.value && pass === realPassObj.value) {
        localStorage.setItem('crm_logged_in', 'true'); // Remember login
        document.getElementById("loginOverlay").style.display = "none";
        renderFeed();
    } else {
        alert("Access Denied. Invalid credentials.");
    }
}

function logout() {
    localStorage.removeItem('crm_logged_in');
    location.reload();
}

// --- TAB SWITCHING ---
function switchTab(tabName, event) {
    currentFilter = tabName;
    document.getElementById('currentTabTitle').textContent = tabName;
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
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

    // Filter logic based on live Google Sheets data
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

// --- RENDER LIVE SETTINGS ---
function renderSettings() {
    const feed = document.getElementById('settingsFeed');
    
    let html = `
        <div style="margin-bottom: 20px;">
            <button class="action-btn" style="background:#ef4444; color:white; width:auto; padding:8px 20px;" onclick="logout()">Logout / Clear Remember Me</button>
        </div>
        <div style="margin-bottom: 40px;">
            <h3 style="color: #1e293b; margin-bottom: 15px;">Product Pricing & Links</h3>
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

    liveSettings.forEach((setting, index) => {
        html += `
            <tr>
                <td><input type="text" value="${setting.item}" id="item-${index}"></td>
                <td><input type="number" value="${setting.amount}" id="amt-${index}"></td>
                <td><input type="number" value="${setting.discount}" id="disc-${index}"></td>
                <td><input type="text" value="${setting.link}" placeholder="https..." id="link-${index}"></td>
                <td><button class="btn-refresh" style="background:#0056b3; color:white; border:none;" onclick="triggerAction('Update Setting', 'Products')">Save</button></td>
            </tr>
        `;
    });

    html += `</tbody></table></div></div>`;

    html += `
        <div style="margin-bottom: 20px;">
            <h3 style="color: #1e293b; margin-bottom: 15px;">Company Profile & Authentication</h3>
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

    liveCompanySettings.forEach((setting, index) => {
        let inputType = setting.key.includes("Password") ? "password" : "text";
        html += `
            <tr>
                <td style="font-weight: 600; color: #1e293b;">${setting.key}</td>
                <td>
                    ${setting.key === "Note" 
                        ? `<textarea id="comp-${index}" style="width:100%; padding:8px 12px; border:1px solid #e2e8f0; border-radius:6px; font-family:inherit; resize:vertical; min-height:60px;">${setting.value}</textarea>`
                        : `<input type="${inputType}" value="${setting.value}" id="comp-${index}">`
                    }
                </td>
                <td><button class="btn-refresh" style="background:#0056b3; color:white; border:none;" onclick="triggerAction('Update Setting', 'Company')">Save</button></td>
            </tr>
        `;
    });

    html += `</tbody></table></div></div>`;
    feed.innerHTML = html;
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
        <div style="margin-top:10px;"><strong>History:</strong> <span style="color:#64748b; white-space:pre-wrap;">${order.history || 'No emails sent yet.'}</span></div>
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

// --- PLACEHOLDER FOR WRITING DATA ---
function triggerAction(action, ticketId) {
    alert(`Read Only Mode: Success!\n\nTo make this button execute [${action}] and update your Google Sheet, we need to add a small POST function to your Code.gs next!`);
    closeModal('actionModal');
}

function closeModal(modalId) { document.getElementById(modalId).classList.remove('active'); }
function refreshData() { fetchCRMData(); }
