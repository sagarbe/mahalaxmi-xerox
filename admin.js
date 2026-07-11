const table = document.getElementById("ordersTable");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const searchBox = document.getElementById("searchBox");

const totalOrders = document.getElementById("totalOrders");
const pendingOrders = document.getElementById("pendingOrders");
const printedOrders = document.getElementById("printedOrders");
const totalIncome = document.getElementById("totalIncome");

let allOrders = [];

async function checkLogin() {

    const { data } = await supabaseClient.auth.getSession();

    if (!data.session) {
        window.location.href = "login.html";
        return;
    }

    loadOrders();
}

async function loadOrders() {

    const { data, error } = await supabaseClient
        .from("orders")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.log(error);
        return;
    }

    allOrders = data;

    updateDashboard();

    displayOrders(allOrders);
}

function updateDashboard() {

    totalOrders.innerText = allOrders.length;

    pendingOrders.innerText =
        allOrders.filter(o => o.print_status === "Pending").length;

    printedOrders.innerText =
        allOrders.filter(o => o.print_status === "Printed").length;

    let income = 0;

    allOrders.forEach(order => {

        income += order.amount || 0;

    });

    totalIncome.innerText = "₹" + income;

}

function displayOrders(list) {

    table.innerHTML = "";

    list.forEach(order => {

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

<td>${order.print_status}</td>

<td>

<button onclick="printOrder(${order.id})">

🖨 Print

</button>

</td>

</tr>

`;

    });

}

searchBox.addEventListener("keyup", () => {

    const value = searchBox.value.toLowerCase();

    const filtered = allOrders.filter(order =>

        (order.file_name || "")
        .toLowerCase()
        .includes(value)

    );

    displayOrders(filtered);

});

refreshBtn.addEventListener("click", loadOrders);

logoutBtn.addEventListener("click", async () => {

    await supabaseClient.auth.signOut();

    window.location.href = "login.html";

});

checkLogin();
// =========================
// PRINT ORDER
// =========================

async function printOrder(id) {

    const ok = confirm("Print this order?");

    if (!ok) return;

    // Status = Printing

    const { error } = await supabaseClient
        .from("orders")
        .update({
            print_status: "Printing"
        })
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    loadOrders();

    // PDF Open

    const order = allOrders.find(o => o.id === id);

    if (order) {
        window.open(order.file_url, "_blank");
    }

    // 3 sec नंतर Printed

    setTimeout(async () => {

        await supabaseClient
            .from("orders")
            .update({
                print_status: "Printed"
            })
            .eq("id", id);

        loadOrders();

    }, 3000);

}



// =========================
// AUTO REFRESH EVERY 5 SEC
// =========================

setInterval(() => {

    loadOrders();

}, 5000);



// =========================
// REALTIME
// =========================

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
