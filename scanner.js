function waitForOpenCV() {

    return new Promise(resolve => {

        let timer = setInterval(() => {

            if (window.cv && cv.imread) {

                clearInterval(timer);

                resolve();

            }

        },100);

    });

}



async function startScanner(file){

    await waitForOpenCV();

    return new Promise((resolve,reject)=>{

        const reader=new FileReader();

        reader.onload=function(e){

            const img=new Image();

            img.onload=function(){

                try{

                    const canvas=document.createElement("canvas");

                    canvas.width=img.width;

                    canvas.height=img.height;

                    const ctx=canvas.getContext("2d");

                    ctx.drawImage(img,0,0);

                    let src=cv.imread(canvas);

                    let dst=new cv.Mat();

                    cv.convertScaleAbs(
                        src,
                        dst,
                        1.2,
                        15
                    );

                    cv.imshow(canvas,dst);

                    const result=
                    canvas.toDataURL(
                        "image/jpeg",
                        0.95
                    );

                    src.delete();

                    dst.delete();

                    resolve(result);

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