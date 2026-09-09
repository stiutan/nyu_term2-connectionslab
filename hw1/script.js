// preload all images to avoid bad sad animations
const beatImageSources = [
    'pear', 
    'apple', 
    'blueberry', 
    'coconut', 
    'watermelon',
    'empty_1', 
    'empty_2', 
    'empty_3', 
    'empty_4', 
    'empty_5',
    'empty_6'
].map((name) => `assets/${name}.jpg`);

const beatImages = new Map(beatImageSources.map((src) => {
    const image = new Image();
    image.src = src;
    const ready = image.decode().then(() => true).catch(() => {
        console.warn(`Could not load beat image: ${src}`);
        return false;
    });
    return [src, { image, ready }];
}));

/**
 * state handling (i miss react)
 */

const ingredientToDrumPatternMap = {
    empty: [],
    pear: [0],
    apple: [0, 0.5],
    blueberry: [0, 0.5, 0.75],
    coconut: [0, 0.25, 0.5],
    watermelon: [0, 0.25, 0.5, 0.75],
}

const state = { timeSig: 4, beats: ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'], bpm: 100, isPlaying: false };

/**
 * topbar shenanigans 
 */

const playButton = document.querySelector('.topbar-maincontrols-playbtn');
playButton.addEventListener('click', async () => {
    let wasPlaying = state.isPlaying;
    state.isPlaying = !wasPlaying;
    
    playButton.textContent = state.isPlaying ? 'Stop' : 'Play';
    playButton.setAttribute('aria-pressed', String(state.isPlaying));

    if (!wasPlaying){
        await Tone.start();
        if (!synth) setupAudio();
        if (!part) buildSequence();

        Tone.Transport.bpm.value = state.bpm;
        Tone.Transport.start();
    } else {
        Tone.Transport.stop();
    }
});

document.querySelectorAll('.topbar-maincontrols-ingredientsdropdown').forEach((button) => {
    button.addEventListener('click', () => {
        const isPressed = button.getAttribute('aria-pressed') === 'true';
        button.setAttribute('aria-pressed', String(!isPressed));
        document.querySelector('.ingredient-list-expanded').setAttribute('aria-hidden', String(isPressed));
    });
});


const servingSizeOption = document.querySelectorAll('.topbar-servingsize-option');
servingSizeOption.forEach((option) => {
    option.addEventListener('click', () => {
        servingSizeOption.forEach((button) => {
            button.setAttribute('aria-pressed', String(button === option));
        });

        let timeSig = parseInt(option.textContent.trim().split('/')[0], 10);
        state.timeSig = timeSig;
        document.querySelector('.content-beats').dataset.beats = timeSig;

        console.log(state);
      
        if (synth) buildSequence();
    });
});

const tempoInput = document.querySelector('.topbar-preptime-sliderinput');
const tempoValue = document.querySelector('.topbar-preptime-slidervalue');
tempoInput.addEventListener('input', () => {
    state.bpm = parseInt(tempoInput.value, 10);
    tempoValue.value = `${state.bpm} bpm`;
    
    if (window.Tone) Tone.Transport.bpm.value = state.bpm;
});

/**
 * murder on tha beat
 */

document.querySelectorAll('.beat-options button').forEach((button) => {
    button.addEventListener('click', async () => {
        const beatDiv = button.closest('.content-beat');
        const beatNum = beatDiv.dataset.beat;
        const ingredient = button.dataset.ingredient;
        
        const imgSrc = ingredient === 'empty'
            ? `assets/empty_${beatNum}.jpg`
            : `assets/${ingredient}.jpg`;

        // need to sync both beat 4's
        document.querySelectorAll(`.content-beat[data-beat="${beatNum}"]`).forEach((beat) => {
            beat.dataset.ingredient = ingredient;
            beat.style.backgroundImage = `url("${imgSrc}")`;

            beat.querySelectorAll('.beat-options button').forEach((choice) => {
                choice.setAttribute('aria-pressed', String(choice.dataset.ingredient === ingredient));
            });
        });

        state.beats[beatNum-1] = ingredient;
        if (synth) buildSequence();
    });
});

/**
 * tone.js logic
 */

let synth, part;
 
function setupAudio(){
    // use membrane synth for drum-like sounds
    synth = new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.16, sustain: 0 }
    }).toDestination();
    synth.volume.value = -4;
}

function buildSequence(){
    if (part) part.dispose();
 
    const ppq = Tone.Transport.PPQ; // ticks per quarter note ?!
    const events = [];
    state.beats.forEach((ingredient, beatIdx) => {
            if (beatIdx >= state.timeSig) return;

            ingredientToDrumPatternMap[ingredient].forEach((drumHit) => {
            // beatIdx + drumHit = position measured in quarter notes from bar start
            const quarters = beatIdx + drumHit;
            const ticks = Math.round(quarters * ppq);
            events.push({ time: `${ticks}i`, beatIdx });
        });
    });
 
    part = new Tone.Part((time, ev)=>{
        synth.triggerAttackRelease('C1', '16n', time, 0.9);
    }, events.map(e=>[e.time, e]));
 
    part.loop = true;
    part.loopEnd = `${Math.round(state.timeSig * ppq)}i`;
    part.start(0);
}
 