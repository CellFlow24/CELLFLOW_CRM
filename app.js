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

// --- MOCK DATA ---
const mockOrders = [
    { ticketId: "CF-849201", name: "Shubhabrata Dokal", type: "B2B E-Commerce Setup", paymentStatus: "Pending", workCompleted: false, time: "10 mins ago" },
    { ticketId: "CF-492103", name: "SK MD Asib", type: "Mess Khata Management", paymentStatus: "Paid", workCompleted: false, time: "2 hours ago" },
    { ticketId: "CF-112233", name: "Khadimul Islam", type: "CBT Portal", paymentStatus: "Paid", workCompleted: true, time: "1 day ago" }
];

let currentFilter = 'Payment Pending';

function switchTab(tabName, event) {
    currentFilter = tabName;
    document.getElementById('currentTabTitle').textContent = tabName;
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    if(event) event.target.classList.add('active');
    
    renderFeed();
}

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
                <div class="status-badge ${statusClass}">${displayStatus}</div>
            </div>`;
    });
}

function openActionModal(ticketId) {
    const order = mockOrders.find(o => o.ticketId === ticketId);
    document.getElementById('modalTitle').textContent = `Manage: ${ticketId}`;
    let bodyHtml = ``;

    // Action Buttons based on Status
    if (order.paymentStatus === 'Pending') {
        bodyHtml += `<button class="action-btn btn-quote" onclick="alert('Send Quote Logic Goes Here')">📄 Send Quotation</button>`;
        bodyHtml += `<button class="action-btn btn-view" onclick="openTracker('${ticketId}', 'Pending')">🔍 View Tracker</button>`;
    } else if (order.paymentStatus === 'Paid' && !order.workCompleted) {
        bodyHtml += `<button class="action-btn btn-deliver" onclick="alert('Deliver App Logic Goes Here')">🚀 Deliver App</button>`;
        bodyHtml += `<button class="action-btn btn-view" onclick="openTracker('${ticketId}', 'Work Pending')">🔍 View Tracker</button>`;
    } else {
        bodyHtml += `<button class="action-btn btn-view" onclick="openTracker('${ticketId}', 'Completed')">🔍 View Tracker</button>`;
    }

    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('actionModal').classList.add('active');
}

function openTracker(ticketId, status) {
    closeModal('actionModal');
    document.getElementById('track-id').textContent = ticketId;
    
    // Generate Timeline dynamically
    let timelineHtml = `
        <div class="timeline-step completed"><div class="step-icon">✓</div><div class="step-text"><strong>Request Received</strong></div></div>
    `;
    
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

function closeModal(modalId) { 
    document.getElementById(modalId).classList.remove('active'); 
}

function refreshData() { 
    document.getElementById('appLoader').classList.add('active');
    setTimeout(() => {
        document.getElementById('appLoader').classList.remove('active');
        renderFeed();
    }, 800);
}
