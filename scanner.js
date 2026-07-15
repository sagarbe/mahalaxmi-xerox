// ================= WAIT OPENCV =================

function waitForOpenCV(){

    return new Promise((resolve,reject)=>{

        let count = 0;

        const timer = setInterval(()=>{


            if(window.cv && cv.Mat){

                clearInterval(timer);

                resolve();

            }


            count++;


            if(count > 100){

                clearInterval(timer);

                reject("OpenCV Load Failed");

            }


        },100);


    });

}



// ================= IMAGE SCANNER =================


async function startScanner(file){


    await waitForOpenCV();



    return new Promise((resolve,reject)=>{


        const reader = new FileReader();



        reader.onload = function(e){


            const img = new Image();



            img.onload = function(){


                try{


                    let src = cv.imread(img);



                    let gray = new cv.Mat();



                    cv.cvtColor(
                        src,
                        gray,
                        cv.COLOR_RGBA2GRAY
                    );



                    cv.GaussianBlur(
                        gray,
                        gray,
                        new cv.Size(5,5),
                        0
                    );



                    let edges = new cv.Mat();



                    cv.Canny(
                        gray,
                        edges,
                        75,
                        200
                    );



                    let contours =
                    new cv.MatVector();



                    let hierarchy =
                    new cv.Mat();



                    cv.findContours(

                        edges,

                        contours,

                        hierarchy,

                        cv.RETR_EXTERNAL,

                        cv.CHAIN_APPROX_SIMPLE

                    );



                    let maxArea = 0;

                    let bestRect = null;



                    for(
                        let i=0;
                        i<contours.size();
                        i++
                    ){


                        let cnt =
                        contours.get(i);



                        let area =
                        cv.contourArea(cnt);



                        let rect =
                        cv.boundingRect(cnt);



                        if(
                            area > maxArea &&
                            rect.width > 150 &&
                            rect.height > 150
                        ){


                            maxArea = area;

                            bestRect = rect;


                        }


                    }



                    let output;



                    if(bestRect){


                        output =
                        src.roi(

                            new cv.Rect(

                                bestRect.x,

                                bestRect.y,

                                bestRect.width,

                                bestRect.height

                            )

                        );


                        console.log(
                            "Document Cropped"
                        );


                    }
                    else{


                        output =
                        src.clone();


                        console.log(
                            "No Crop Found"
                        );


                    }




                    // Enhance

                    cv.convertScaleAbs(

                        output,

                        output,

                        1.25,

                        15

                    );




                    let canvas =
                    document.createElement("canvas");



                    cv.imshow(
                        canvas,
                        output
                    );



                    let result =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.95
                    );



                    resolve(result);




                    // cleanup

                    src.delete();

                    gray.delete();

                    edges.delete();

                    contours.delete();

                    hierarchy.delete();

                    output.delete();



                }

                catch(err){


                    console.log(
                        "Scanner Error",
                        err
                    );


                    reject(err);


                }


            };



            img.onerror=function(){

                reject(
                    "Image Load Failed"
                );

            };



            img.src =
            e.target.result;



        };



        reader.onerror=function(){

            reject(
                "File Read Failed"
            );

        };



        reader.readAsDataURL(file);



    });


}