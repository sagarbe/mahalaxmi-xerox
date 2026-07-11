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

async function checkLogin(){

    const {data} = await supabaseClient.auth.getSession();

    if(!data.session){
        window.location.href="login.html";
        return;
    }

    loadOrders();

}



// LOAD ORDERS

async function loadOrders(){

    const {data: orders, error} = await supabaseClient
    .from("orders")
    .select("*")
    .order("id",{ascending:false});


    console.log("Orders:",orders);
    console.log("Error:",error);


    if(error){
        alert(error.message);
        return;
    }


    allOrders = orders || [];

    updateDashboard();
    displayOrders(allOrders);

}



// DASHBOARD

function updateDashboard(){

    if(totalOrders)
    totalOrders.innerText = allOrders.length;


    if(pendingOrders)
    pendingOrders.innerText =
    allOrders.filter(
        o=>o.print_status==="Pending"
    ).length;


    if(printedOrders)
    printedOrders.innerText =
    allOrders.filter(
        o=>o.print_status==="Printed"
    ).length;


    let income = 0;


    allOrders.forEach(order=>{
        income += Number(order.amount || 0);
    });


    if(totalIncome)
    totalIncome.innerText="₹"+income;

}



// DISPLAY

function displayOrders(list){

    if(!table) return;


    table.innerHTML="";


    list.forEach(order=>{


        let paymentButton="";


        if(order.payment==="Pending"){

            paymentButton=`

            <button onclick="approveCash(${order.id})">
            💵 Cash Approve
            </button>

            <button onclick="approveUPI(${order.id})">
            📱 UPI Approve
            </button>

            `;

        }



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
        Payment:
        <b>${order.payment}</b>
        <br>
        Print:
        <b>${order.print_status}</b>
        </td>

        <td>

        ${paymentButton}

        <button onclick="printOrder(${order.id})">
        🖨 Print
        </button>

        </td>

        </tr>

        `;


    });


}



// SEARCH

if(searchBox){

searchBox.addEventListener("keyup",()=>{


    let value = searchBox.value.toLowerCase();


    let filtered = allOrders.filter(order=>

        (order.file_name || "")
        .toLowerCase()
        .includes(value)

    );


    displayOrders(filtered);


});

}



// CASH

async function approveCash(id){

    if(!confirm("Cash received?"))
    return;


    const {error}=await supabaseClient
    .from("orders")
    .update({
        payment:"Cash"
    })
    .eq("id",id);



    if(error){
        alert(error.message);
        return;
    }


    alert("Cash Approved");

    loadOrders();

}



// UPI

async function approveUPI(id){

    if(!confirm("UPI Payment Received?"))
    return;


    const {error}=await supabaseClient
    .from("orders")
    .update({
        payment:"Paid"
    })
    .eq("id",id);



    if(error){
        alert(error.message);
        return;
    }


    alert("UPI Approved");

    loadOrders();

}



// PRINT

async function printOrder(id){

    if(!confirm("Print this order?"))
    return;


    await supabaseClient
    .from("orders")
    .update({
        print_status:"Printing"
    })
    .eq("id",id);



    setTimeout(async()=>{


        await supabaseClient
        .from("orders")
        .update({
            print_status:"Printed"
        })
        .eq("id",id);


        loadOrders();


    },3000);


}



// BUTTONS

if(refreshBtn){

refreshBtn.onclick=loadOrders;

}


if(logoutBtn){

logoutBtn.onclick=async()=>{

    await supabaseClient.auth.signOut();

    window.location.href="login.html";

};

}



// START

checkLogin();



// AUTO REFRESH

setInterval(loadOrders,5000);



// REALTIME

supabaseClient
.channel("orders-channel")
.on(
"postgres_changes",
{
event:"*",
schema:"public",
table:"orders"
},
()=>{
    loadOrders();
}
)
.subscribe();