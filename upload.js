const uploadFileInput = document.getElementById("file");
const orderButton = document.getElementById("orderBtn");


orderButton.addEventListener("click", async () => {


    const selectedFile = uploadFileInput.files[0];


    if (!selectedFile) {

        alert("Please select a file");
        return;

    }


    const newFileName = Date.now() + "_" + selectedFile.name;


    const { data, error } = await supabaseClient.storage
        .from("documents")
        .upload(newFileName, selectedFile);


    if (error) {

        console.log("Upload Error:", error);
        alert("Upload Failed");

        return;

    }


    const { data: urlData } = supabaseClient.storage
        .from("documents")
        .getPublicUrl(newFileName);



    console.log("File URL:", urlData.publicUrl);


    alert("File Uploaded Successfully");


});
