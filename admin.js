const table = document.getElementById("ordersTable");

const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const searchBox = document.getElementById("searchBox");

const totalOrders = document.getElementById("totalOrders");
const pendingOrders = document.getElementById("pendingOrders");
const printedOrders = document.getElementById("printedOrders");
const totalIncome = document.getElementById("totalIncome");

// Price Settings
const bwPrice = document.getElementById("bwPrice");
const colorPrice = document.getElementById("colorPrice");
const savePriceBtn = document.getElementById("savePriceBtn");

let allOrders = [];

// ---------------- LOGIN ----------------

async function checkLogin() {

    const { data } =
    await supabaseClient.auth.getSession();

    if (!data.session) {

        window.location.href = "login.html";
        return;

    }

    loadPrices();
    loadOrders();

}

// ---------------- PRICE SETTINGS ----------------

async function loadPrices() {

    const { data, error } =
    await supabaseClient
    .from("settings")
    .select("*");


    if(error){

        console.log(error.message);
        return;

    }


    data.forEach(item => {


        if(item.key === "bw_price"){

            bwPrice.value = item.value;

        }


        if(item.key === "color_price"){

            colorPrice.value = item.value;

        }


    });


}


// SAVE PRICE

savePriceBtn.onclick = async () => {


    const { error: bwError } =
    await supabaseClient
    .from("settings")
    .update({

        value: bwPrice.value

    })
    .eq("key","bw_price");



    const { error: colorError } =
    await supabaseClient
    .from("settings")
    .update({

        value: colorPrice.value

    })
    .eq("key","color_price");



    if(bwError || colorError){

        alert("Price Update Failed");

        console.log(bwError || colorError);

        return;

    }



    alert("✅ Prices Updated Successfully");


};

// ---------------- LOAD ORDERS ----------------

async function loadOrders() {

    const { data: orders, error } =
    await supabaseClient
    .from("orders")
    .select("*")
    .order("id", {
        ascending: false
    });

    if (error) {

        alert(error.message);
        return;

    }

    allOrders = orders || [];

    updateDashboard();

    displayOrders(allOrders);

}

// ---------------- DASHBOARD ----------------

function updateDashboard() {

    totalOrders.innerText =
    allOrders.length;

    pendingOrders.innerText =
    allOrders.filter(
        o => o.print_status === "Pending"
    ).length;

    printedOrders.innerText =
    allOrders.filter(
        o => o.print_status === "Printed"
    ).length;

    let income = 0;

    allOrders.forEach(order => {

        income += Number(order.amount || 0);

    });

    totalIncome.innerText =
    "₹" + income;

}

// ---------------- DISPLAY ----------------

function displayOrders(list) {

    table.innerHTML = "";

    list.forEach(order => {

        let actionButtons = "";

        // Payment Pending
        if (order.payment === "Pending") {

            actionButtons = `
                <button class="cash" onclick="approveCash(${order.id})">
                    💵 Cash
                </button>

                <button class="upi" onclick="approveUPI(${order.id})">
                    📱 UPI
                </button>
            `;

        }
        else {

            actionButtons = `
                <button class="print" onclick="reprint(${order.id})">
                    🖨 Reprint
                </button>
            `;

        }

        let badge = "";

        if (order.print_status === "Pending") {

            badge = `<span class="pending">Pending</span>`;

        }
        else if (order.print_status === "Printing") {

            badge = `<span class="printing">Printing</span>`;

        }
        else if (order.print_status === "Printed") {

            badge = `<span class="printed">Printed</span>`;

        }
        else {

            badge = `<span class="failed">Failed</span>`;

        }

        table.innerHTML += `

        <tr>

            <td>${order.id}</td>

            <td>
                <a href="${order.file_url}" target="_blank">
                    ${order.file_name}
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

                ${badge}

            </td>

            <td>

                ${actionButtons}

            </td>

        </tr>

        `;

    });

}

// ---------------- SEARCH ----------------

searchBox.addEventListener("keyup", () => {

    const value = searchBox.value.toLowerCase();

    const filtered = allOrders.filter(order =>
        (order.file_name || "")
        .toLowerCase()
        .includes(value)
    );

    displayOrders(filtered);

});

// ---------------- CASH ----------------

async function approveCash(id) {

    if (!confirm("Cash Payment Received?"))
        return;

    const { error } =
    await supabaseClient
        .from("orders")
        .update({
            payment: "Cash"
        })
        .eq("id", id);

    if (error) {

        alert(error.message);
        return;

    }

    loadOrders();

}

// ---------------- UPI ----------------

async function approveUPI(id) {

    if (!confirm("UPI Payment Received?"))
        return;

    const { error } =
    await supabaseClient
        .from("orders")
        .update({
            payment: "Paid"
        })
        .eq("id", id);

    if (error) {

        alert(error.message);
        return;

    }

    loadOrders();

}

// ---------------- REPRINT ----------------

async function reprint(id) {

    if (!confirm("Reprint this order?"))
        return;

    await supabaseClient
        .from("orders")
        .update({
            print_status: "Pending"
        })
        .eq("id", id);

    loadOrders();

}

// ---------------- BUTTONS ----------------

refreshBtn.onclick = loadOrders;

logoutBtn.onclick = async () => {

    await supabaseClient.auth.signOut();

    window.location.href = "login.html";

};

// ---------------- START ----------------

checkLogin();

// ---------------- AUTO REFRESH ----------------

setInterval(loadOrders, 5000);

// ---------------- REALTIME ----------------

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
        loadPrices();
    }
)
.subscribe();