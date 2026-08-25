// --- MOCK DATA (Mirroring your G-Sheet Columns) ---
const mockOrders = [
    { ticketId: "CF-849201", name: "Shubhabrata Dokal", type: "B2B E-Commerce Setup", paymentStatus: "Pending", workCompleted: false, time: "10 mins ago", history: "[10 Aug] Client requested quote." },
    { ticketId: "CF-492103", name: "SK MD Asib", type: "Mess Khata Management", paymentStatus: "Paid", workCompleted: false, time: "2 hours ago", history: "[11 Aug] Payment received." },
    { ticketId: "CF-112233", name: "Khadimul Islam", type: "CBT Portal", paymentStatus: "Paid", workCompleted: true, time: "1 day ago", history: "[12 Aug] App delivered." }
];

let currentFilter = 'Payment Pending';

// --- INITIALIZE & RENDER ---
window.onload = () => {
    setTimeout(() => {
        document.getElementById('appLoader').classList.remove('active');
        renderFeed();
    }, 1200); // Simulate network fetch
};

function switchTab(tabName) {
    if (tabName === 'Settings') return alert("Settings coming soon!");
    
    currentFilter = tabName;
    document.getElementById('currentTabTitle').textContent = tabName;
    
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
        if (li.textContent.includes(tabName.split(' ')[0])) li.classList.add('active');
    });
    renderFeed();
}

function renderFeed() {
    const feed = document.getElementById('orderFeed');
    feed.innerHTML = ''; 

    // Filter logic mimicking your exact G-Sheet requirements
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
        let cardHTML = `
            <div class="crm-card" onclick="openActionModal('${order.ticketId}')">
                <div class="card-top">
                    <span class="ticket-id">${order.ticketId}</span>
                    <span class="time-ago">${order.time}</span>
                </div>
                <div class="client-name">${order.name}</div>
                <div class="req-type">${order.type}</div>
                <div class="status-badge ${statusClass}">${order.paymentStatus === 'Paid' ? (order.workCompleted ? 'Completed' : 'Work Pending') : 'Payment Pending'}</div>
            </div>
        `;
        feed.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// --- DYNAMIC MODAL ENGINE ---
const modal = document.getElementById('actionModal');

function openActionModal(ticketId) {
    const order = mockOrders.find(o => o.ticketId === ticketId);
    document.getElementById('modalTitle').textContent = `Manage: ${ticketId}`;
    
    let bodyHtml = `<div style="background:#f8fafc; padding:15px; border-radius:8px; margin-bottom:20px; font-size:0.9rem;">
        <strong>Client:</strong> ${order.name}<br>
        <strong>Request:</strong> ${order.type}<br>
        <strong>History:</strong> <span style="color:#64748b;">${order.history || 'No emails sent yet.'}</span>
    </div>`;

    if (order.paymentStatus === 'Pending') {
        bodyHtml += `
            <div style="margin-bottom:15px;">
                <label style="font-weight:bold; font-size:0.9rem;">Set Quotation Amount (₹):</label>
                <input type="number" id="quoteAmount" placeholder="e.g. 5999" style="width:100%; padding:12px; margin-top:5px; border:1px solid #cbd5e0; border-radius:8px;">
            </div>
            <button class="action-btn btn-quote" onclick="triggerAction('Send Quote', '${ticketId}')">📄 Send Quote & Payment Link</button>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e2e8f0;">
            
            <div style="margin-bottom:15px;">
                <label style="font-weight:bold; font-size:0.9rem;">Send Custom Email:</label>
                <textarea id="customMsg" placeholder="Type message to client..." style="width:100%; padding:12px; margin-top:5px; border:1px solid #cbd5e0; border-radius:8px; height:80px;"></textarea>
            </div>
            <button class="action-btn" style="background:#e2e8f0; color:#1e293b;" onclick="triggerAction('Custom Mail', '${ticketId}')">✉️ Send Message</button>
        `;
    } else if (order.paymentStatus === 'Paid' && !order.workCompleted) {
        bodyHtml += `
            <div style="margin-bottom:15px;">
                <label style="font-weight:bold; font-size:0.9rem;">Final App Link:</label>
                <input type="text" id="appLink" placeholder="https://..." style="width:100%; padding:12px; margin-top:5px; border:1px solid #cbd5e0; border-radius:8px;">
            </div>
            <div style="display:flex; gap:10px; margin-bottom:15px;">
                <div style="flex:1;">
                    <label style="font-weight:bold; font-size:0.9rem;">User ID:</label>
                    <input type="text" id="userId" placeholder="Admin" style="width:100%; padding:12px; margin-top:5px; border:1px solid #cbd5e0; border-radius:8px;">
                </div>
                <div style="flex:1;">
                    <label style="font-weight:bold; font-size:0.9rem;">Password:</label>
                    <input type="text" id="userPass" placeholder="***" style="width:100%; padding:12px; margin-top:5px; border:1px solid #cbd5e0; border-radius:8px;">
                </div>
            </div>
            <button class="action-btn btn-deliver" onclick="triggerAction('Deliver App', '${ticketId}')">🚀 Deliver App & Mark Completed</button>
        `;
    }

    document.getElementById('modalBody').innerHTML = bodyHtml;
    modal.classList.add('active');
}

function closeModal() { modal.classList.remove('active'); }
window.onclick = function(event) { if (event.target == modal) closeModal(); }

function triggerAction(action, ticketId) {
    let payload = {};
    if (action === 'Send Quote') payload.amount = document.getElementById('quoteAmount').value;
    if (action === 'Custom Mail') payload.msg = document.getElementById('customMsg').value;
    if (action === 'Deliver App') {
        payload.link = document.getElementById('appLink').value;
        payload.userId = document.getElementById('userId').value;
        payload.password = document.getElementById('userPass').value;
    }
    
    console.log(`Action: ${action} for ${ticketId}`, payload);
    alert(`Sending ${action} payload to Google Sheets API...\nCheck console for data.`);
    closeModal();
}

function refreshData() {
    document.getElementById('appLoader').classList.add('active');
    setTimeout(() => {
        document.getElementById('appLoader').classList.remove('active');
        renderFeed();
    }, 800);
}

// Apps Script mapping for 'Payment Ditels' tab
function getPaymentDetails() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Payment Ditels");
  const data = sheet.getDataRange().getValues();
  
  // Skip header row (row 1)
  let itemsList = [];
  for(let i = 1; i < data.length; i++) {
    if(data[i][0]) { // If Item name exists
      itemsList.push({
        item: data[i][0],              // Column A: Items (Mess Khata, Bill Flow, etc.)
        amount: data[i][1],            // Column B: Amount
        discountedAmount: data[i][2],  // Column C: Discounted Amount
        tutorialLink: data[i][3]       // Column D: Tutorial Link
      });
    }
  }
  return itemsList;
}
