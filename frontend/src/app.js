const width = document.getElementById('width');
const height = document.getElementById('height');
const locked = document.getElementById('locked');
const create = document.getElementById('create');
const clear = document.getElementById('clear');
const canvas = document.getElementById('canvas');
const colorpicker = document.getElementById('colorpicker');
const filepicker = document.getElementById('filepicker');
let shiftPressed = false;
let pixels = localStorage.getItem('pixels') ? JSON.parse(localStorage.getItem('pixels')) : [];

let cvs = document.createElement("canvas");
let ctx = cvs.getContext("2d");
var imageData;

function onCreate() {
    pixels = [];
    canvas.replaceChildren();
    const w = width.value || 32;
    const h = height.value || 32;
    console.log(w, h);
    for(let i = 0; i < h; i++) {
        let row = [];
        const rowElem = document.createElement('div');
        rowElem.classList.add('row');
        rowElem.id = `${i}`;
        for(let j = 0; j < w; j++) {
            row.push('#000000');
            const cell = document.createElement('div');
            cell.id = `${i}-${j}`;
            cell.classList.add('cell');
            cell.style.backgroundColor = '#000000';
            cell.addEventListener('mouseover', mouseover);

            cell.addEventListener('click', mouseclick);

            rowElem.appendChild(cell);
        }
        pixels.push(row);
        canvas.appendChild(rowElem);
    }

    localStorage.setItem('pixels', JSON.stringify(pixels));
}


function mouseover(e) {
    if(!shiftPressed) return;
    e.target.style.backgroundColor = colorpicker.value;
    let id = e.target.id;
    let [row, col] = id.split('-');
    pixels[row][col] = colorpicker.value;
}

function mouseclick(e) {
    e.target.style.backgroundColor = colorpicker.value;
    let id = e.target.id;
    let [row, col] = id.split('-');
    pixels[row][col] = colorpicker.value;
    localStorage.setItem('pixels', JSON.stringify(pixels));
}

function openFile(event) {
	var input=event.target;
	var reader=new FileReader();
	reader.onload=function(){
		showImage(reader);
	}
	reader.readAsDataURL(input.files[0]);
}

function showImage(fileReader) {
    var img = document.getElementById("myImage");
    const w = width.value || 32;
    const h = height.value || 32;
    // img.onload = () => getImageData(img);
    img.onload = () => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, w, h);
        const target = document.createElement('img');
        target.onload = () => {
            ctx.imageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.drawImage(target, 0, 0);
            imageData = ctx.getImageData(0, 0, w, h).data;
            processImageData(imageData, w, h);
        };
        target.src = cvs.toDataURL();
        document.getElementById('canvasImage').appendChild(target);
    }
    img.style.visibility = "hidden";
    img.src = fileReader.result;
}

function processImageData(data, width, height) {
    console.log(width, height);
    let p = [];
    for(let i = 0; i < height; i++) {
        let row = [];
        for(let j = 0; j < width; j++) {
            row.push('#000000');
        }   
        p.push(row);
    }
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        let hex = rgbToHex(r, g, b);
        let x = Math.floor((i/4) / width);
        let y = (i/4) % height;
        p[x][y] = hex;
    }

    renderPixels(p);
    localStorage.setItem('pixels', JSON.stringify(p));
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function renderPixels(pixels) {
    canvas.replaceChildren();
    if(pixels.length > 0) {
        for(let i = 0; i < pixels.length; i++) {
            const rowElem = document.createElement('div');
            rowElem.classList.add('row');
            rowElem.id = `${i}`;
            for(let j = 0; j < pixels[i].length; j++) {
                const cell = document.createElement('div');
                cell.id = `${i}-${j}`;
                cell.classList.add('cell');
                cell.style.backgroundColor = pixels[i][j];

                cell.addEventListener('mouseover', mouseover);

                cell.addEventListener('click', mouseclick);

                rowElem.appendChild(cell);
            }
            canvas.appendChild(rowElem);
        }
    }
}

function start() {
    create.addEventListener('click', onCreate);
    clear.addEventListener('click', () => canvas.replaceChildren());
    filepicker.addEventListener('change', openFile);

    renderPixels(pixels);

    document.body.addEventListener('keydown', (e) => {
        if(e.key === 'Shift') {
            shiftPressed = true;
        }
    });
    document.body.addEventListener('keyup', (e) => {
        if(e.key === 'Shift') {
            shiftPressed = false;
            localStorage.setItem('pixels', JSON.stringify(pixels));
        }
    });
}



start();
