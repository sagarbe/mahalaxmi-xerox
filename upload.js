const orderButton = document.getElementById("orderBtn");

orderButton.addEventListener("click", async () => {

    const fileInput = document.getElementById("file");
    const serviceSelect = document.getElementById("service");
    const copiesInput = document.getElementById("copies");
    const totalDisplay = document.getElementById("totalPrice");
    const printRadios = document.getElementsByName("print");

    const selectedFile = fileInput.files[0];

    if (!selectedFile) {
        alert("Please select a file");
        return;
    }

    // Upload File
    const newFileName = Date.now() + "_" + selectedFile.name;

    const { error: uploadError } = await supabaseClient.storage
        .from("documents")
        .upload(newFileName, selectedFile);

    if (uploadError) {
        console.log(uploadError);
        alert("File Upload Failed");
        return;
    }

    // Get Public URL
    const { data: urlData } = supabaseClient.storage
        .from("documents")
        .getPublicUrl(newFileName);

    const fileURL = urlData.publicUrl;

    // Print Type
    let printType = "Black & White";

    if (printRadios[1].checked) {
        printType = "Color";
    }

    // Copies & Amount
    const copies = parseInt(copiesInput.value) || 1;
    const amount = parseInt(totalDisplay.innerText.replace("₹", ""));

    // Save Order
    const { error: orderError } = await supabaseClient
        .from("orders")
        .insert([
            {
                file_name: newFileName,
                file_url: fileURL,
                service: serviceSelect.value,
                print_type: printType,
                copies: copies,
                amount: amount,
                payment: "Pending",
                status: "New",
                page_count: 1,
                print_status: "Pending"
            }
        ]);

    if (orderError) {
        console.log("Database Error:", orderError);
        alert("Order Save Failed");
        return;
    }

    alert("Order Placed Successfully!");

    console.log("Order Saved Successfully");
});
