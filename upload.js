const uploadFileInput = document.getElementById("file");
const orderButton = document.getElementById("orderBtn");

orderButton.addEventListener("click", async () => {

    const selectedFile = uploadFileInput.files[0];

    if (!selectedFile) {
        alert("Please select a file");
        return;
    }

    const newFileName = Date.now() + "_" + selectedFile.name;

    const { data, error } = await supabase.storage
        .from("documents")
        .upload(newFileName, selectedFile);

    if (error) {
        console.log(error);
        alert("Upload failed");
        return;
    }

    const publicUrl =
    "https://xtwffnvrykavuorvzpjj.supabase.co/storage/v1/object/public/documents/" + newFileName;


    alert("File Uploaded Successfully");

    console.log("File URL:", publicUrl);

});
