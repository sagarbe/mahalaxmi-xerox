// ================= WAIT =================

async function startScanner(file){

    return new Promise((resolve,reject)=>{

        const reader=new FileReader();

        reader.onload=function(e){

            const img=new Image();

            img.onload=function(){

                try{

                    const scanner=new jscanify();

                    const canvas=document.createElement("canvas");

                    canvas.width=img.width;
                    canvas.height=img.height;

                    const ctx=canvas.getContext("2d");

                    ctx.drawImage(img,0,0);

                    // Auto Detect + Crop
                    const result=scanner.extractPaper(
                        canvas,
                        canvas.width,
                        canvas.height
                    );

                    resolve(
                        result.toDataURL(
                            "image/jpeg",
                            0.95
                        )
                    );

                }
                catch(err){

                    console.log(err);

                    resolve(e.target.result);

                }

            };

            img.src=e.target.result;

        };

        reader.readAsDataURL(file);

    });

}