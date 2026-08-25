// --- MOCK DATA (To test the UI before we hook up Google Sheets) ---
const mockOrders = [
    {
        ticketId: "CF-849201",
        name: "Shubhabrata Dokal",
        type: "B2B E-Commerce Setup",
        status: "Pending",
        time: "10 mins ago",
        amount: 5999
    },
    {
        ticketId: "CF-492103",
        name: "SK MD Asib",
        type: "Mess Khata Management",
        status: "Paid",
        time: "2 hours ago",
        amount: 199
    }
];

// --- RENDER FEED ---
function renderFeed() {
    const feed = document.getElementById('orderFeed');
    feed.innerHTML = ''; // Clear current feed

    mockOrders.forEach(order => {
        // Determine status color
        let statusClass = order.status === 'Paid' ? 'status-paid' : 'status-pending';
        
        let cardHTML = `
            <div class="crm-card" onclick="openActionModal('${order.ticketId}', '${order.name}', '${order.type}', '${order.status}', ${order.amount})">
                <div class="card-top">
                    <span class="ticket-id">${order.ticketId}</span>
                    <span class="time-ago">${order.time}</span>
                </div>
                <div class="client-name">${order.name}</div>
                <div class="req-type">${order.type}</div>
                <div class="status-badge ${statusClass}">${order.status}</div>
            </div>
        `;
        feed.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// --- MODAL LOGIC ---
const modal = document.getElementById('actionModal');

function openActionModal(id, name, type, status, amount) {
    document.getElementById('modalTitle').textContent = `Manage: ${id}`;
    
    let bodyHtml = `
        <p style="margin-bottom: 20px; color: #64748b;"><strong>Client:</strong> ${name}<br><strong>Request:</strong> ${type}</p>
    `;

    // Show different buttons based on status
    if(status === 'Pending') {
        bodyHtml += `
            <button class="action-btn btn-quote" onclick="triggerAction('Send Quote', '${id}')">
                <span>📄 Send Quotation (₹${amount})</span> <span>→</span>
            </button>
            <button class="action-btn" style="background:#f8fafc; border:1px solid #e2e8f0; color:#1e293b;" onclick="triggerAction('Custom Mail', '${id}')">
                <span>✉️ Send Custom Message</span> <span>→</span>
            </button>
        `;
    } else if (status === 'Paid') {
        bodyHtml += `
            <button class="action-btn btn-deliver" onclick="triggerAction('Deliver App', '${id}')">
                <span>🚀 Deliver App Credentials</span> <span>→</span>
            </button>
        `;
    }

    document.getElementById('modalBody').innerHTML = bodyHtml;
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

// Close modal if clicking outside the white box
window.onclick = function(event) {
    if (event.target == modal) { closeModal(); }
}

// --- PLACEHOLDER FOR API ACTIONS ---
function triggerAction(action, ticketId) {
    alert(`Action: [${action}] triggered for Ticket [${ticketId}].\n\nSoon, this will send a silent API request to your Google Sheet!`);
    closeModal();
}

function refreshData() {
    document.getElementById('orderFeed').innerHTML = '<p style="text-align:center; padding: 20px; color: #64748b;">Fetching from Google Sheets...</p>';
    setTimeout(() => { renderFeed(); }, 800);
}

// Initialize the app on load
window.onload = renderFeed;

// Basic Tab Switching UI
function switchTab(tabName) {
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    event.target.classList.add('active');
    // We will filter data here later
}
