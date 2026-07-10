const { data } = await supabaseClient.auth.getSession();

if (!data.session) {
    window.location.href = "login.html";
}
const table = document.getElementById("ordersTable");

async function loadOrders(){

    const { data, error } = await supabaseClient
        .from("orders")
        .select("*")
        .order("id", { ascending:false });

    if(error){
        console.log(error);
        return;
    }

    table.innerHTML = "";

    data.forEach(order=>{

        table.innerHTML += `
        <tr>

            <td>${order.id}</td>

            <td>
                <a href="${order.file_url}" target="_blank">
                    Open File
                </a>
            </td>

            <td>${order.service}</td>

            <td>${order.print_type}</td>

            <td>${order.copies}</td>

            <td>₹${order.amount}</td>

            <td>${order.print_status}</td>

        </tr>
        `;

    });

}

loadOrders();
