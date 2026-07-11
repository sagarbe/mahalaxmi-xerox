const table = document.getElementById("ordersTable");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const searchBox = document.getElementById("searchBox");

const totalOrders = document.getElementById("totalOrders");
const pendingOrders = document.getElementById("pendingOrders");
const printedOrders = document.getElementById("printedOrders");
const totalIncome = document.getElementById("totalIncome");

let allOrders = [];

// LOGIN
async function checkLogin() {

    const { data } = await supabaseClient.auth.getSession();

    if (!data.session) {
        window.location.href = "login.html";
        return;
    }

    loadOrders();
}

// LOAD ORDERS
async function loadOrders() {

    const { data: orders, error } = await supabaseClient
        .from("orders")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        alert(error.message);
        return;
    }

    allOrders = orders || [];

    updateDashboard();
    displayOrders(allOrders);
}

// DASHBOARD
function updateDashboard() {

    totalOrders.innerText = allOrders.length;

    pendingOrders.innerText =
        allOrders.filter(o => o.print_status === "Pending").length;

    printedOrders.innerText =
        allOrders.filter(o => o.print_status === "Printed").length;

    let income = 0;

    allOrders.forEach(order => {
        income += Number(order.amount || 0);
    });

    totalIncome.innerText = "₹" + income;
}

// DISPLAY
function displayOrders(list) {

    table.innerHTML = "";

    list.forEach(order => {

        let paymentButtons = "";

        if (order.payment === "Pending") {

            paymentButtons = `
                <button class="cash" onclick="approveCash(${order.id})">
                    💵 Cash Approve
                </button>

                <button class="upi" onclick="approveUPI(${order.id})">
                    📱 UPI Approve
                </button>
            `;
        }

        let badgeClass = "pending";

        if (order.print_status === "Printed")
            badgeClass = "printed";

        else if (order.print_status === "Printing")
            badgeClass = "printing";

        else if (order.print_status === "Failed")
            badgeClass = "failed";

        table.innerHTML += `
        <tr>

            <td>${order.id}</td>

            <td>
                <a href="${order.file_url}" target="_blank">
                    📄 View
                </a>
            </td>

            <td>${order.service}</td>

            <td>${order.print_type}</td>

            <td>${order.page_count ?? "-"}</td>

            <td>${order.copies}</td>

            <td>₹${order.amount}</td>

            <td>

                <b>${order.payment}</b>

                <br><br>

                <span class="${badgeClass}">
                    ${order.print_status}
                </span>

            </td>

            <td>

                ${paymentButtons}

            </td>

        </tr>
        `;
    });
}

// SEARCH
searchBox.addEventListener("keyup", () => {

    const value = searchBox.value.toLowerCase();

    const filtered = allOrders.filter(order =>
        (order.file_name || "")
            .toLowerCase()
            .includes(value)
    );

    displayOrders(filtered);
});

// CASH APPROVE
async function approveCash(id) {

    if (!confirm("Cash payment received?")) return;

    const { error } = await supabaseClient
        .from("orders")
        .update({
            payment: "Cash"
        })
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    alert("Cash Approved");

    loadOrders();
}

// UPI APPROVE
async function approveUPI(id) {

    if (!confirm("UPI payment received?")) return;

    const { error } = await supabaseClient
        .from("orders")
        .update({
            payment: "Paid"
        })
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    alert("UPI Approved");

    loadOrders();
}

// BUTTONS
refreshBtn.onclick = loadOrders;

logoutBtn.onclick = async () => {

    await supabaseClient.auth.signOut();

    window.location.href = "login.html";
};

// START
checkLogin();

// AUTO REFRESH
setInterval(loadOrders, 5000);

// REALTIME
supabaseClient
.channel("orders-channel")
.on(
    "postgres_changes",
    {
        event: "*",
        schema: "public",
        table: "orders"
    },
    () => {
        loadOrders();
    }
)
.subscribe();