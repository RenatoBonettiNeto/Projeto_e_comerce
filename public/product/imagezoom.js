function imageZoom(event) {
    const img = event.target;
    const zoomBox = document.createElement('div');
    zoomBox.id = 'zoom';
    zoomBox.style.backgroundImage = `url(${img.src})`;
    document.body.appendChild(zoomBox);

    zoomBox.style.display = 'block';
}

function moveZoom(event) {
    const img = event.target;
    const zoomBox = document.getElementById('zoom');

    if (!zoomBox) return;

    const rect = img.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    zoomBox.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
    zoomBox.style.left = `${event.pageX - zoomBox.offsetWidth / 2}px`;
    zoomBox.style.top = `${event.pageY - zoomBox.offsetHeight / 2}px`;
}

function disableZoom() {
    const zoomBox = document.getElementById('zoom');
    if (zoomBox) {
        zoomBox.remove();
    }
}


export { imageZoom};

export {moveZoom};

export {disableZoom};
