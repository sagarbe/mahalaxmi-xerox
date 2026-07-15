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

                    // Gray
                    let gray = new cv.Mat();
                    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

                    // Blur
                    let blur = new cv.Mat();
                    cv.GaussianBlur(gray, blur, new cv.Size(3,3), 0);

                    // Adaptive Threshold
                    let scan = new cv.Mat();
                    cv.adaptiveThreshold(
                        blur,
                        scan,
                        255,
                        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
                        cv.THRESH_BINARY,
                        21,
                        15
                    );

                    cv.cvtColor(scan, src, cv.COLOR_GRAY2RGBA);

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