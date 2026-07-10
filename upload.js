const uploadFileInput = document.getElementById("file");
const orderButton = document.getElementById("orderBtn");

const serviceInput = document.getElementById("service");
const copiesInput = document.getElementById("copies");

const printRadios = document.getElementsByName("print");
const totalDisplay = document.getElementById("totalPrice");


orderButton.addEventListener("click", async () => {


    const selectedFile = uploadFileInput.files[0];


    if (!selectedFile) {
        alert("Please select a file");
        return;
    }


    // File Upload

    const newFileName = Date.now() + "_" + selectedFile.name;


    const { data: uploadData, error: uploadError } =
        await supabaseClient.storage
        .from("documents")
        .upload(newFileName, selectedFile);



    if (uploadError) {

        console.log(uploadError);
        alert("File Upload Failed");
        return;

    }



    // Get File URL

    const { data: urlData } =
        supabaseClient.storage
        .from("documents")
        .getPublicUrl(newFileName);



    const fileURL = urlData.publicUrl;



    // Print Type

    let printType = "Black & White";


    if(printRadios[1].checked){

        printType = "Color";

    }



    // Amount

    const amountText = totalDisplay.innerHTML.replace("₹","");
    const amount = parseInt(amountText);



    // Copies

    const copies = parseInt(copiesInput.value);



    // Save Order In Database


    const { data: orderData, error: orderError } =
        await supabaseClient
        .from("orders")
        .insert([{

            file_name: newFileName,

            file_url: fileURL,

            service: serviceInput.value,

            print_type: printType,

            copies: copies,

            amount: amount,

            payment: "Pending",

            status: "New",

            page_count: 1,

            print_status: "Pending"


        }]);



    if(orderError){

        console.log(orderError);
        alert("Order Save Failed");
        return;

    }



    alert("Order Placed Successfully 🎉");


    console.log("Order Saved:", orderData);
    console.log("File URL:", fileURL);


});
