// handle mouse tracking for unblurring title
const title = document.querySelector(".title");
title.addEventListener('mousemove', e => {
    const rect = title.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    title.style.setProperty('--x', x + 'px');
    title.style.setProperty('--y', y + 'px');
})

// handle redaction selection & image pop up
const redactedTexts = document.querySelectorAll(".redacted-text");
redactedTexts.forEach(redactedText => {
    redactedText.addEventListener('click', e => {
        if (redactedText.classList.contains('revealed')) {
            return; // do nothing - already been clicked
        }

        const identifier = redactedText.classList[1];
        document.querySelectorAll("." + identifier).forEach(o => o.classList.add('revealed'));
    })
})