/* ===============================
   AUDIO ENGINE(CRT STYLE)
================================ */

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/* MASTER SFX GAIN */
const sfxGain = audioCtx.createGain();
sfxGain.gain.value = 0.12;

/* CRT LOWPASS (warm, boxy) */
const lowpass = audioCtx.createBiquadFilter();
lowpass.type = "lowpass";
lowpass.frequency.value = 1800;

/* SOFT DISTORTION */
const distortion = audioCtx.createWaveShaper();
distortion.curve = makeDistortionCurve(6);
distortion.oversample = "2x";

/* CLEAN TYPING HIGHPASS */
const typeHighpass = audioCtx.createBiquadFilter();
typeHighpass.type = "highpass";
typeHighpass.frequency.value = 1200;

/* WIREGRAPH (ONCE) */
distortion.connect(lowpass);
lowpass.connect(sfxGain);

typeHighpass.connect(sfxGain);

sfxGain.connect(audioCtx.destination);

/* DISTORTION CURVE*/
function makeDistortionCurve(amount) {
    const k = amount;
    const n = 44100;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        const x = (i * 2) / n - 1;
        curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
    }
    return curve;
}

/* ===============================
   BUFFER LOADER
================================ */

const buffers = {};

async function loadSFX(name, url) {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    buffers[name] = await audioCtx.decodeAudioData(arrayBuffer);
}

Promise.all([
    loadSFX("side", "audio/get1.mp3"),
    loadSFX("continue", "audio/select2.mp3"),
    loadSFX("back", "audio/select1.mp3"),
    loadSFX("type", "audio/blip.mp3")
]);

/* ===============================
   PLAY HELPER
================================ */

function playSFX(
    name,
    {
        volume = 2,
        rate = 1,
        randomizeRate = 0,
        clean = false
    } = {}
) {
    if (!buffers[name]) return;

    const source = audioCtx.createBufferSource();
    source.buffer = buffers[name];

    source.playbackRate.value =
        rate + (Math.random() * randomizeRate * 2 - randomizeRate);

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);

    if (clean) {
        // typing  clean path
        gainNode.connect(typeHighpass);
    } else {
        // buttons  CRT chain
        gainNode.connect(distortion);
    }

    source.start();
}
/* ===============================
   INTERACTIVEFLOW
================================ */






const textEl = document.getElementById("screenText");
const continueBtn = document.getElementById("continueBtn");
const skipBtn = document.getElementById("skipBtn");

const historyStack = [];


const flows = {
    start: [
        {
            text: "what if your customers came back because your brand was actually fun?",
            continueLabel: "HUH?"
        },
        {
            text: "your revenue's plateaued.\n\ncustomers bought once. maybe twice.\n\nnow? crickets.",
            continueLabel: "YEP, THAT'S ME"
        },
        {
            text: "so you're running more ads.\noffering more discounts.\nsending more emails.\n\nand it's... boring. expensive. unsustainable.",
            continueLabel: "CONTINUE"
        },
        {
            text: "people don't come back to boring.\n\nthey come back to fun.\nto progress.\nto play.",
            continueLabel: "I'M LISTENING"
        },
        {
            text: "games keep players engaged without discounts or ads.\n\nwhy?\n\nbecause they understand motivation:\n✰ curiosity over urgency\n✰ progress over points\n✰ identity over transactions",
            continueLabel: "OKAY BUT..."
        },
        {
            text: "\"isn't gamification just... gimmicky?\"\n\nnope. cheap gamification is.\n\nbadges and leaderboards without strategy?\nthat's a gimmick.\n\na game system designed around YOUR customer journey? \nthat's intention.",
            continueLabel: "FAIR"
        },
        {
            text: "\"will this actually move revenue?\"\n\nyes. here's the goal:\n\nrepeat engagement and repeat purchases within 90 days.\n\nmore visits = more purchases = higher LTV.",
            continueLabel: "I GUESS..."
        },
        {
            text: "wanna see it in action?",
            continueLabel: "PLAY",
        },
        {
            text: "[interactive demo would go here]\n\nthis is what happens when buying feels like playing.",
            continueLabel: "I WANT THIS",
            nextFlow: "me"
        }
    ],

    me: [
        {
            text: "hey, i'm asha.\n\ni design game experiences for e-commerce brands who are bored of the same old retention tactics.",
            continueLabel: "CONTINUE"
        },
        {
            text: "i've been building playful digital experiences since i was 12.\n\nmonetized a gaming youtube channel at 14.\nbuilt interactive games and archives for creatives.\n\nnow? i help e-commerce founders turn their businesses into something fun again.",
            continueLabel: "CONTINUE"
        },
        {
            text: "no discounts. no gimmicks. no boring funnels.\n\njust play.",
            continueLabel: "HOW DOES IT WORK?",
            nextFlow: "packages"
        }
    ],
    packages: [
        {
            text: "tier 1: game loop\nstarting at $2,500\n\n✰ loyalty program games\n✰ email & social challenges  \n✰ scavenger hunts\n\nbest for: testing gamification\ntimeline: 4–6 weeks",
            continueLabel: "CONTINUE"
        },
        {
            text: "tier 2: interactive experience\nstarting at $4,700\n\n✰ custom web-based games\n✰ branded standalone experiences\n\nbest for: making play part of the journey\ntimeline: 8–10 weeks",
            continueLabel: "CONTINUE"
        },
        {
            text: "tier 3: full game system\nstarting at $8,200\n\n✰ complete game integration\n✰ ongoing updates\n✰ live support\n\noptional maintenance: $750–1000/month\n\nbest for: all-in brand transformation\ntimeline: 10–12 weeks",
            continueLabel: "WHAT'S THE PROCESS?"
        },
        {
            text: "step 1: discovery call\n\nwe talk about your brand, your customers, and what's not working.",
            continueLabel: "CONTINUE"
        },
        {
            text: "step 2: game design & strategy\n\ni design a custom system aligned with your business goals.",
            continueLabel: "CONTINUE"
        },
        {
            text: "step 3: build & launch\n\nwe go live, iterate, and watch engagement grow.",
            continueLabel: "CONTINUE"
        },
        {
            text: "step 4: optional ongoing support\n\nmaintenance retainer for live experiences.",
            continueLabel: "I'M READY",
            nextFlow: "connect"
        }
    ],
    connect: [
        {
            text:
                "ready to make your business fun again?",
            continueLabel: "LET’S CONNECT",
            nextFlow: "loading"
        }
    ],
    loading: [
        {
            text:
                "establishing connection...\n\nloading interface...\n\nsyncing calendars...",
            autoRedirect: true
        }
    ]

};



let currentText = "";
let typingIndex = 0;
let typingInterval;
let currentFlow = null;
let currentStep = 0;
let isTyping = false;
let skipRequested = false;


function typeText(text, onComplete) {
    clearInterval(typingInterval);

    textEl.textContent = "";
    typingIndex = 0;
    currentText = text;
    isTyping = true;
    skipRequested = false;

    continueBtn.classList.add("hidden");
    skipBtn.classList.remove("hidden");

    typingInterval = setInterval(() => {

        if (skipRequested) {
            clearInterval(typingInterval);
            textEl.textContent = currentText;
            isTyping = false;
            skipBtn.classList.add("hidden");

            if (onComplete) onComplete();
            return;
        }

        if (typingIndex < currentText.length) {
            textEl.textContent += currentText[typingIndex];
            textEl.scrollTop = textEl.scrollHeight;

            const char = currentText[typingIndex];

            if (
                typingIndex % 3 === 0 &&
                ![" ", "\n", ".", ",", "!", "?"].includes(char)
            ) {
                playSFX("type", {
                    volume: 0.05,
                    rate: 1.8 + Math.random() * 0.3,
                    randomizeRate: 0.2,
                    clean: true
                });
            }

            typingIndex++;
        } else {
            clearInterval(typingInterval);
            isTyping = false;
            skipBtn.classList.add("hidden");

            if (onComplete) onComplete();
        }

    }, 42);
}


function saveHistory() {
    // never save the very first screen
    if (currentFlow === "start" && currentStep === 0) return;

    historyStack.push({
        flow: currentFlow,
        step: currentStep
    });
}


function renderStep() {
    const step = flows[currentFlow][currentStep];

    continueBtn.classList.add("hidden");
    backBtn.classList.add("hidden");

    typeText(step.text || "", () => {
        const isFirstScreen = currentFlow === "start" && currentStep === 0;

        if (!isFirstScreen && historyStack.length > 0) {
            backBtn.classList.remove("hidden");
        }

        if (step.continueLabel) {
            continueBtn.textContent = step.continueLabel;
            continueBtn.classList.remove("hidden");
        }

        // --- ADD THIS FIX HERE ---
        // Wait a tiny fraction of a second for the browser to calculate 
        // the new height now that buttons are visible, then scroll.
        setTimeout(() => {
            textEl.scrollTop = textEl.scrollHeight;
        }, 10);
    });
}


const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
    if (isTyping) return;
    if (historyStack.length < 1) return;

    playSFX("back", { volume: 0.3 });


    const prev = historyStack.pop();
    currentFlow = prev.flow;
    currentStep = prev.step;

    renderStep();
});

skipBtn.addEventListener("click", () => {
    if (!isTyping) return;

    skipRequested = true;

    playSFX("continue", { volume: 0.25 });
});




function redirectToCalendly() {
    window.open(
        "https://calendly.com/its-asha/30min",
        "_blank",
        "noopener,noreferrer"
    );
}





// Side button clicks
document.querySelectorAll(".side-buttons button").forEach(btn => {
    btn.addEventListener("click", () => {
        playSFX("side", { volume: 0.4, randomizeRate: 0.03 });


        const state = btn.dataset.state;
        if (!flows[state]) return;

        currentFlow = state;
        currentStep = 0;
        renderStep();
    });
});



// Continue button cycles
continueBtn.addEventListener("click", () => {
    if (isTyping) return;
    if (!currentFlow) return;

    playSFX("continue", { volume: .4 });


    const step = flows[currentFlow][currentStep];

    if (step.autoRedirect) {
        redirectToCalendly();
        return;
    }
    if (step.nextFlow === "loading") {
        window.open("https://calendly.com/its-asha/30min", "_blank", "noopener,noreferrer");

        saveHistory();
        currentFlow = "loading";
        currentStep = 0;
        renderStep();
        return;
    }

    if (step.nextFlow) {
        saveHistory();
        currentFlow = step.nextFlow;
        currentStep = 0;
        renderStep();
        return;
    }

    saveHistory();
    currentStep++;

    if (currentStep < flows[currentFlow].length) {
        renderStep();
    }
});






// init on page load
currentFlow = "start";
currentStep = 0;
renderStep();

const audio = document.getElementById("bgAudio");
const volumeSlider = document.getElementById("volumeSlider");
const muteBtn = document.getElementById("muteBtn");
const volOn = document.querySelector(".volume-on");
const volOff = document.querySelector(".volume-off");

audio.volume = volumeSlider.value;

let hasInteracted = false;

/* START AUDIO AFTER FIRST USER ACTION */
function startAudio() {
    if (hasInteracted) return;

    audio.play().catch(() => { });
    hasInteracted = true;
}

/* Any click counts as interaction */
document.addEventListener("click", startAudio, { once: true });

/* Volume slider */
volumeSlider.addEventListener("input", e => {
    const v = e.target.value;
    audio.volume = v;
    setSFXVolume(v);
});

function setSFXVolume(v) {
    sfxGain.gain.value = v * 0.2;
}



/* Mute toggle */
muteBtn.addEventListener("click", e => {
    e.stopPropagation();

    audio.muted = !audio.muted;
    sfxGain.gain.value = audio.muted ? 0 : volumeSlider.value * 0.2;

    updateIcon();
});


document.addEventListener("click", () => {
    if (audioCtx.state !== "running") {
        audioCtx.resume();
    }
}, { once: true });

/* Icon state */
function updateIcon() {
    if (audio.muted || audio.volume === 0) {
        volOn.classList.add("hidden");
        volOff.classList.remove("hidden");
    } else {
        volOn.classList.remove("hidden");
        volOff.classList.add("hidden");
    }
}
