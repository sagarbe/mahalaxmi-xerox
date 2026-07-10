const uploadFileInput = document.getElementById("file");
const orderButton = document.getElementById("orderBtn");
const serviceSelect = document.getElementById("service");

orderButton.addEventListener("click", async () => {

    const selectedFile = uploadFileInput.files[0];

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

    // Copies
    const copies = parseInt(copiesInput.value);

    // Total Amount
    const amount = parseInt(
        totalDisplay.innerText.replace("₹", "")
    );

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
                page_count: pageCount,
                print_status: "Pending"
            }
        ]);

    if (orderError) {
        console.log(orderError);
        alert("Order Save Failed");
        return;
    }

    alert("Order Placed Successfully");

    console.log("Order Saved");
    console.log(fileURL);

});
