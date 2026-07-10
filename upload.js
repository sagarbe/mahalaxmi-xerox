const fileInput = document.getElementById("file");
const orderBtn = document.getElementById("orderBtn");

const copiesInput = document.getElementById("copies");
const printOptions = document.getElementsByName("print");


orderBtn.addEventListener("click", async () => {

    const file = fileInput.files[0];

    if (!file) {
        alert("Please select file");
        return;
    }


    let price = 5;

    if(printOptions[1].checked){
        price = 10;
    }


    let copies = Number(copiesInput.value);


    const fileName = Date.now() + "_" + file.name;


    // Upload File

    const {data:uploadData, error:uploadError} =
    await supabase.storage
    .from("documents")
    .upload(fileName,file);


    if(uploadError){

        alert("Upload Failed");
        console.log(uploadError);
        return;

    }


    const fileUrl =
    "https://xtwffnvrykavuorvzpjj.supabase.co/storage/v1/object/public/documents/"
    + fileName;



    // Save Order

    const {data,error} = await supabase
    .from("orders")
    .insert([{

        file_name:file.name,

        file_url:fileUrl,

        print_type:
        printOptions[1].checked ? "Color" : "Black & White",

        copies:copies,

        amount:price*copies,

        status:"Pending",

        print_status:"Pending"

    }]);


    if(error){

        console.log(error);

        alert("Order Save Failed");

        return;

    }


    alert("Order Placed Successfully");


});
