/* ===============================
   AUDIO ENGINE (CRT STYLE)
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

/* WIRE GRAPH (ONCE) */
distortion.connect(lowpass);
lowpass.connect(sfxGain);

typeHighpass.connect(sfxGain);

sfxGain.connect(audioCtx.destination);

/* DISTORTION CURVE */
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
    volume = 1,
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
    // typing → clean path
    gainNode.connect(typeHighpass);
  } else {
    // buttons → CRT chain
    gainNode.connect(distortion);
  }

  source.start();
}
/* ===============================
   INTERACTIVE FLOW
================================ */






const textEl = document.getElementById("screenText");
const continueBtn = document.getElementById("continueBtn");

const historyStack = [];


const flows = {
    start: [
        {
            text: "what if your customers came back because your brand was actually fun?",
            continueLabel: "CONTINUE →"
        },
        {
            text:
                "i design game experiences for e-commerce brands who've hit a plateau.\n\nno discounts. no gimmicks. just play.",
            continueLabel: "GO ON...",
            nextFlow: "what"
        }
    ],

    what: [
        {
            text:
                "most brands rely on urgency.\npoints. discounts. fake scarcity.",
            continueLabel: "CONTINUE →"
        },
        {
            text: "games rely on curiosity.\nprogress. identity. choice.",
            continueLabel: "SO?"
        },
        {
            text:
                "i bring game design thinking into commerce so buying feels like playing.",
            continueLabel: "HOW?",
            nextFlow: "how"
        }
    ],
    how: [
        {
            text:
                "by creating design systems, identity systems, and progress systems.\nthese work together to make play a core part of the customer journey.",
            continueLabel: "CONTINUE →"
        },

        {
            text:
                "customers having fun means turning: \n\n✰ loyalty into progression\n✰ purchases into quests\n✰ customers into regulars",
            continueLabel: "I'M INTERESTED...",
        },
        {
            text:
                "here's how we can work together:",
            continueLabel: "CONTINUE →",
        },

        {
            text:
                "tier 1:  game loop  (starting at $2,500)\n\n✰ loyalty program games\n✰ email & social challenges\n✰ scavenger hunts\n\nbest for brands testing gamification\n\ntimeline: 4–6 weeks",
            continueLabel: "CONTINUE →"
        },

        {
            text:
                "tier 2:  interactive experience (starting at $4,700)\n\n✰ custom web-based games\n✰ branded standalone experiences\n\nbest for brands making play part of the journey\n\ntimeline: 8–10 weeks",
            continueLabel: "CONTINUE →"
        },

        {
            text:
                "tier 3:  full game system (starting at $8,200)\n\n✰ complete game integration\n✰ ongoing updates\n✰ live support\n\noptional maintenance:\n$750-1000 / month\n\ntimeline: 10–12 weeks",
            continueLabel: "PROCESS? →"
        },
        {
            text:
                "the process is simple:",
            continueLabel: "CONTINUE →"
        },

        {
            text:
                "step 1:  discovery call\n\nwe talk about:\n✰ your brand\n✰ your pain points\n✰ your customers",
            continueLabel: "CONTINUE →"
        },

        {
            text:
                "step 2:  game design & strategy\n\ni design a custom game system aligned with your business goals",
            continueLabel: "CONTINUE →"
        },

        {
            text:
                "step 3:  build & launch\n\nwe go live, iterate, and watch engagement grow",
            continueLabel: "CONTINUE →"
        },

        {
            text:
                "step 4:  optional ongoing support\n\nmaintenance retainer for live experiences",
            continueLabel: "LET'S CONNECT →",
            nextFlow: "connect"
        }
    ],
    connect: [
        {
            text:
                "this is where we talk.\n\nno decks.\nno pressure.\njust ideas.",
            continueLabel: "LET’S TALK",
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


function typeText(text, onComplete) {
    clearInterval(typingInterval);
    textEl.textContent = "";
    typingIndex = 0;
    currentText = text;
    isTyping = true;
    continueBtn.classList.add("hidden");

    typingInterval = setInterval(() => {
        if (typingIndex < currentText.length) {
            textEl.textContent += currentText[typingIndex];

            // play blip every 2–3 chars
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
    backBtn.classList.add("hidden"); // always hide first

    typeText(step.text || "", () => {

        // ❌ no back button on very first screen
        const isFirstScreen =
            currentFlow === "start" && currentStep === 0;

        if (!isFirstScreen && historyStack.length > 0) {

            backBtn.classList.remove("hidden");
        }

        if (step.continueLabel) {
            continueBtn.textContent = step.continueLabel;
            continueBtn.classList.remove("hidden");
        }
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






function redirectToCalendly() {
    setTimeout(() => {
        window.open(
            "https://calendly.com/YOUR-CALENDLY-LINK",
            "_blank",
            "noopener,noreferrer"
        );
    }, 1800);
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
