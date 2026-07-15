function waitForOpenCV() {
    return new Promise(resolve => {
        const timer = setInterval(() => {
            if (window.cv && cv.imread) {
                clearInterval(timer);
                resolve();
            }
        }, 100);
    });
}

async function startScanner(file) {

    await waitForOpenCV();

    return new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = function(e){

            const img = new Image();

            img.onload = function(){

                try{

                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img,0,0);

                    let src = cv.imread(canvas);

                    // Brightness + Contrast
let enhanced = new cv.Mat();

// Original Color Enhance

let enhanced = new cv.Mat();

// Contrast + Brightness
cv.convertScaleAbs(
    src,
    enhanced,
    1.15,   // Contrast (हलका)
    12      // Brightness (हलकी)
);

// Sharpen
let kernel = cv.matFromArray(
    3,
    3,
    cv.CV_32F,
    [
        0,-1,0,
        -1,5,-1,
        0,-1,0
    ]
);

let sharpen = new cv.Mat();

cv.filter2D(
    enhanced,
    sharpen,
    -1,
    kernel
);

// Final image
cv.imshow(canvas, sharpen);

const result = canvas.toDataURL("image/jpeg", 0.98);

kernel.delete();
enhanced.delete();
sharpen.delete();
src.delete();

resolve(result);

// Sharpen
let kernel = cv.matFromArray(
    3,
    3,
    cv.CV_32F,
    [
        0,-1,0,
       -1,5,-1,
        0,-1,0
    ]
);

cv.filter2D(
    enhanced,
    enhanced,
    -1,
    kernel
);

cv.imshow(canvas, enhanced);

const result = canvas.toDataURL("image/jpeg", 0.98);

kernel.delete();
enhanced.delete();
src.delete();

resolve(result);

                    cv.imshow(canvas, src);

                    const result = canvas.toDataURL("image/jpeg",0.98);

                    src.delete();
                    gray.delete();
                    blur.delete();
                    scan.delete();

                    resolve(result);

                }catch(err){

                    console.log(err);

                    resolve(e.target.result);

                }

            };

            img.src = e.target.result;

        };

        reader.readAsDataURL(file);

    });

}