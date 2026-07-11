const table = document.getElementById("ordersBody");
const logoutBtn = document.getElementById("logoutBtn");

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
        console.log("Load Error:", error);
        return;
    }

    console.log("Orders:", data);

    table.innerHTML = "";

    data.forEach(order => {

        table.innerHTML += `
        <tr>
            <td>${order.id}</td>
            <td><a href="${order.file_url}" target="_blank">Open File</a></td>
            <td>${order.service}</td>
            <td>${order.print_type}</td>
            <td>${order.copies}</td>
            <td>₹${order.amount}</td>
            <td>${order.print_status}</td>
        </tr>
        `;

    });
}

logoutBtn.addEventListener("click", async () => {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.log(error);
        alert(error.message);
        return;
    }

    window.location.href = "login.html";
});

checkLogin();
