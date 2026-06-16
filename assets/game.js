const sceneImage = document.querySelector("#sceneImage");
const hotspotLayer = document.querySelector("#hotspotLayer");
const apparitionEl = document.querySelector("#apparition");
const stage = document.querySelector("#stage");
const canvas = document.querySelector("#fxCanvas");
const ctx = canvas.getContext("2d", { alpha: true });
const roomTitle = document.querySelector("#roomTitle");
const objectiveEl = document.querySelector("#objective");
const inventoryEl = document.querySelector("#inventory");
const messageEl = document.querySelector("#message");
const meterEl = document.querySelector(".meter");
const staticFill = document.querySelector("#staticFill");
const startScreen = document.querySelector("#startScreen");
const beginButton = document.querySelector("#beginButton");
const continueButton = document.querySelector("#continueButton");
const endingStampsEl = document.querySelector("#endingStamps");
const quietButton = document.querySelector("#quietButton");
const creditsButton = document.querySelector("#creditsButton");
const muteButton = document.querySelector("#muteButton");
const revealButton = document.querySelector("#revealButton");
const journalButton = document.querySelector("#journalButton");
const hintButton = document.querySelector("#hintButton");
const modalRoot = document.querySelector("#modalRoot");
const actionsEl = document.querySelector("#actions");
let apparitionTimer = null;
let lastModalFocus = null;
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const SAVE_KEY = "laundromat-name-save-v2";
const ENDINGS_KEY = "laundromat-endings-v1";
const AUDIO_PREF_KEY = "laundromat-audio-preference-v1";
const DEFAULT_MESSAGE = "The machines wait with their round black eyes.";

function readAudioPreference() {
  try {
    const raw = window.localStorage?.getItem(AUDIO_PREF_KEY);
    if (raw === "muted") return true;
    if (raw === "sound") return false;
  } catch {
    return null;
  }
  return null;
}

function writeAudioPreference(muted) {
  try {
    window.localStorage?.setItem(AUDIO_PREF_KEY, muted ? "muted" : "sound");
  } catch {
    // Audio preference is nice to keep, but storage failures should not block play.
  }
}

const defaultFlags = {
  started: false,
  quiet: false,
  washerOpened: false,
  vendingUsed: false,
  backUnlocked: false,
  officeUnlocked: false,
  ledgerRead: false,
  safeOpen: false,
  sinkRinsed: false,
  valveTurned: false,
  radioHeard: false,
  radioCaptured: false,
  shrineAwake: false,
  toneSolved: false,
  dryerFed: false,
  nameRestored: false,
  escaped: false,
};

const itemMeta = {
  wetCoin: {
    label: "Wet Coin",
    color: "#b5d7d2",
    inspect: "It leaves a perfect cold circle on your thumb. The soap machine will probably accept it.",
  },
  blackSoap: {
    label: "Black Soap",
    color: "#1b1d1f",
    inspect: "It smells like burnt lavender and unlocked doors. The red back door feels aware of it.",
  },
  claimTicket: {
    label: "Claim Ticket",
    color: "#d8be82",
    inspect: "The number is smudged, but the service window recognizes the paper before you do.",
  },
  brassKey: {
    label: "Brass Key",
    color: "#d6a74d",
    inspect: "The bow pulses once per second. Its teeth are cut for the claim safe.",
  },
  soot: {
    label: "Soot",
    color: "#2a2d2c",
    inspect: "A soft black stain that wants to become a shadow. The central dryer is hungry for it.",
  },
  rust: {
    label: "Rust",
    color: "#bd613b",
    inspect: "It gives weight to things that are too clean. The name basin asked for weight.",
  },
  voice: {
    label: "Voice",
    color: "#4cc7ce",
    inspect: "It vibrates against your palm instead of your throat. The name basin asked for breath.",
  },
  vowelSlip: {
    label: "Vowel Slip",
    color: "#e7e2c2",
    inspect: "Thin paper with the missing open sounds of your name. The name basin asked for letters.",
  },
  nameTag: {
    label: "Name Tag",
    color: "#f1d283",
    inspect: "The letters slide around, embarrassed to be seen without their missing pieces.",
  },
};

const state = {
  scene: "lobby",
  items: new Set(),
  selectedItem: null,
  flags: { ...defaultFlags, quiet: readAudioPreference() ?? false },
  clues: new Set(),
  static: 8,
  message: DEFAULT_MESSAGE,
};

const clueText = {
  radioTune: "The radio repeats the notes: low, high, middle.",
  time217: "The lost office keeps repeating 2:17.",
  vowels: "The ledger says every vowel in your name was filed away.",
  safe: "The claim safe opens with 217.",
  finalOrder: "The basin asks for weight, breath, and letters: rust, voice, vowel slip.",
  staticEnding: "The rules poster warns that high static makes the rain fray names.",
  sinkRinse: "An office notice says cloudy water can rinse static from claimed letters once.",
  endingFork: "The alley has more than one exit: rain, phone, and whatever static makes of you.",
  boilerPressure: "The boiler gauge says static is pressure looking for a mouth.",
  clockEnding: "The shift clock only accepts a restored name. Punching in means staying on payroll.",
};

const staticApparitions = {
  lobby: [
    "the glass remembers you wrong",
    "spin cycle: name removal",
    "someone is breathing through the coin slot",
  ],
  office: [
    "claim denied",
    "the ledger turns a page by itself",
    "2:17 is not a time anymore",
  ],
  shrine: [
    "heat makes the walls pronounce you",
    "the dryers are almost singing",
    "do not give it a better spelling",
  ],
  boiler: [
    "pressure is only a name with nowhere to go",
    "turn nothing you cannot forgive",
    "the pipes are full of almost-words",
  ],
  alley: [
    "rain audits the body",
    "the sheets above know every exit",
    "answer only if it uses your name",
  ],
};

const roomListen = {
  lobby: {
    caption: "washers breathe in different names",
    message:
      "You listen. The washers breathe in staggered circles, and one dryer ticks exactly like teeth.",
  },
  office: {
    caption: "2:17 scratches behind the ledger",
    message:
      "You listen. Paper drags inside the walls, filing cabinets cough, and the clock keeps failing to become morning.",
  },
  shrine: {
    caption: "low high middle",
    message:
      "You listen. The dryers answer each other in low, high, middle, then fall silent like they have been caught practicing.",
  },
  boiler: {
    caption: "pressure wants a mouth",
    message:
      "You listen. Pipes knock behind the boiler, steam chews the dark, and the gauge hums with your almost-name.",
  },
  alley: {
    caption: "rain remembers the exits",
    message:
      "You listen. Rain combs the sheets overhead, the payphone rings under the water, and the storm drain says stay or go.",
  },
};

const endingMeta = {
  clean: {
    title: "You Leave Named",
    image: "assets/images/rain-alley.webp",
    hint: "Restore your name and walk into the open rain while static is low.",
    body:
      "Morning opens like a clean wound. Behind you, the laundromat keeps spinning, but the sound is smaller now. Your name is damp, heavy, yours.",
  },
  frayed: {
    title: "You Leave Frayed",
    image: "assets/images/rain-alley.webp",
    hint: "Let static climb high, restore your name, then leave through the open rain.",
    body:
      "The rain lets you pass, but static follows under your tongue. You keep your name. Mostly. Some nights it answers from a dryer across town.",
  },
  soft: {
    title: "You Call Yourself",
    image: "assets/images/rain-alley.webp",
    hint: "Restore your name, enter the rain alley, and answer the payphone.",
    body:
      "The payphone rings once. You answer from the other end and say your name until it fits. The sheets above unfold into a road.",
  },
  attendant: {
    title: "You Clock In",
    image: "assets/images/shift-clock-closeup.webp",
    hint: "Restore your name, return to the lobby, and punch the shift clock.",
    body:
      "You slide your restored name into the shift clock. It stamps you with a time that has no numbers. By morning, the machines are quiet because they are listening to you.",
  },
};
const endingOrder = ["clean", "frayed", "soft", "attendant"];

const scenes = {
  lobby: {
    title: "Lobby",
    image: "assets/images/laundromat-lobby.webp",
    alt: "A dim green laundromat with rows of washers, wet floors, a red back door, and a lonely laundry basket.",
    ambience: "lobby",
    entry:
      "The lobby smells like rainwater, hot lint, and somebody else's childhood.",
    hotspots: [
      {
        id: "washer",
        label: "breathing washer",
        x: 5,
        y: 23,
        w: 21,
        h: 36,
        click: () => {
          if (!state.flags.washerOpened) {
            state.flags.washerOpened = true;
            addItem("wetCoin");
            audio.pickup();
            say("A coin rolls out of the rubber lip. It is warm, wet, and freshly ashamed.");
            pulseStatic(4);
            return;
          }
          say("The washer exhales once. Nothing else wants to be born from it.");
          audio.machineBreathe();
        },
      },
      {
        id: "vending",
        label: "soap machine",
        x: 28,
        y: 28,
        w: 8,
        h: 26,
        click: () => {
          if (state.flags.vendingUsed) {
            say("The soap machine has gone dark. Its last bottle and the ticket it coughed up are already in your pocket.");
            return;
          }
          if (consumeSelected("wetCoin")) {
            state.flags.vendingUsed = true;
            addItem("blackSoap");
            state.items.add("claimTicket");
            state.selectedItem = "blackSoap";
            renderInventory();
            audio.pickup();
            say("The machine accepts the wet coin and drops black soap plus a numbered claim ticket. The ticket is damp with somebody else's thumbprint.");
            return;
          }
          nudge("The slot clicks its tiny teeth. It wants money with water still inside it.");
        },
      },
      {
        id: "radio",
        label: "radio static",
        x: 17,
        y: 43,
        w: 8,
        h: 13,
        click: () => {
          state.flags.radioHeard = true;
          rememberClue("radioTune");
          audio.radioClue();
          if (state.flags.toneSolved && !state.flags.radioCaptured) {
            state.flags.radioCaptured = true;
            addItem("voice");
            say("The radio coughs up your voice. It lands in your hand like a cold moth.");
            return;
          }
          say("The radio repeats three notes: low, high, middle. Something in the walls hums along.");
        },
      },
      {
        id: "basket",
        label: "lost basket",
        x: 0,
        y: 63,
        w: 16,
        h: 27,
        click: () => {
          if (state.items.has("soot")) {
            say("Only damp socks remain. They refuse to match each other.");
            return;
          }
          addItem("soot");
          audio.pickup();
          say("Under the basket is a pinch of soft black soot. It stains your fingerprints before you touch it.");
        },
      },
      {
        id: "rulesPoster",
        label: "rules poster",
        x: 60,
        y: 9,
        w: 13,
        h: 20,
        click: () => {
          rememberClue("staticEnding");
          say("The rules poster is mostly mildew. Rule 7 remains: leave loud and the rain will keep a little of you.");
          if (state.static >= 35) flashApparition("leave loud, leave frayed");
        },
      },
      {
        id: "office",
        label: "lost office",
        x: 22,
        y: 28,
        w: 17,
        h: 25,
        click: () => {
          if (state.flags.officeUnlocked || state.items.has("claimTicket") || state.items.has("vowelSlip")) {
            state.flags.officeUnlocked = true;
            go("office");
            return;
          }
          nudge("The service window is locked. A brass slot under it says nothing, but it clearly wants a claim ticket.");
        },
      },
      {
        id: "backdoor",
        label: "red back door",
        x: 47,
        y: 35,
        w: 10,
        h: 25,
        click: () => {
          if (state.flags.backUnlocked) {
            go("shrine");
            return;
          }
          if (consumeSelected("blackSoap")) {
            state.flags.backUnlocked = true;
            audio.door();
            say("The black soap crawls into the lock. The red door remembers how to open.");
            go("shrine", 700);
            return;
          }
          nudge("The back door is sealed with a clean, dry hunger.");
        },
      },
      {
        id: "shiftClock",
        label: "shift clock",
        x: 74,
        y: 16,
        w: 7,
        h: 23,
        click: () => {
          rememberClue("clockEnding");
          if (!state.flags.nameRestored) {
            say("The shift clock has no hands, only a card slot shaped like a patient mouth. It refuses unnamed employees.");
            return;
          }
          openClockEnding();
        },
      },
      {
        id: "exit",
        label: "front exit",
        x: 82,
        y: 32,
        w: 16,
        h: 38,
        click: () => {
          if (state.flags.nameRestored) {
            go("alley");
            return;
          }
          nudge("The glass reflects you without a name. The street will not accept that.");
        },
      },
    ],
  },
  office: {
    title: "Lost Office",
    image: "assets/images/lost-office.webp",
    alt: "A cramped lost-and-found office with a claim ledger, key rack, cracked mirror, safe, and cloudy sink.",
    ambience: "office",
    entry:
      "The lost-and-found office catalogs things people swear they never owned.",
    hotspots: [
      {
        id: "lobbydoor",
        label: "lobby window",
        x: 0,
        y: 12,
        w: 13,
        h: 70,
        click: () => go("lobby"),
      },
      {
        id: "ledger",
        label: "claim ledger",
        x: 34,
        y: 65,
        w: 25,
        h: 14,
        click: () => {
          state.flags.ledgerRead = true;
          rememberClue("vowels");
          rememberClue("time217");
          lowerStatic(4);
          say("Your name appears in the ledger with every vowel filed away. The clerk's note repeats one time: 2:17.");
        },
      },
      {
        id: "timeClock",
        label: "time clock",
        x: 9,
        y: 45,
        w: 10,
        h: 18,
        click: () => {
          rememberClue("time217");
          rememberClue("radioTune");
          audio.toneAnswer();
          say("The time clock punches an invisible card: 2:17 AM. Low, high, middle follows from inside the gears.");
        },
      },
      {
        id: "keyRack",
        label: "key rack",
        x: 4,
        y: 18,
        w: 17,
        h: 25,
        click: () => {
          if (state.items.has("brassKey") || state.flags.safeOpen) {
            say("The remaining keys are too flat to turn anything real.");
            return;
          }
          addItem("brassKey");
          audio.pickup();
          say("One brass key is warm enough to have a pulse. It is tagged with a blank claim number.");
        },
      },
      {
        id: "mirror",
        label: "cracked mirror",
        x: 41,
        y: 15,
        w: 19,
        h: 34,
        click: () => {
          rememberClue("time217");
          whisper("two one seven");
          say("In the mirror, your reflection has no mouth. It taps the glass twice, once, then seven times.");
        },
      },
      {
        id: "safe",
        label: "claim safe",
        x: 70,
        y: 38,
        w: 16,
        h: 31,
        click: () => {
          if (state.flags.safeOpen) {
            say("The safe hangs open. A dry rectangle in the dust marks where the vowel slip waited.");
            return;
          }
          if (state.selectedItem === "brassKey" && state.items.has("brassKey")) {
            openSafePuzzle();
            return;
          }
          nudge("The safe's keyhole is clean from use. It wants the warm brass key from the rack.");
        },
      },
      {
        id: "sink",
        label: "cloudy sink",
        x: 86,
        y: 64,
        w: 13,
        h: 24,
        click: () => {
          if (state.items.has("vowelSlip")) {
            if (!state.flags.sinkRinsed && state.static > 8) {
              state.flags.sinkRinsed = true;
              lowerStatic(8);
              whisper("not clean. quieter.");
              say("The cloudy sink rinses static from the vowel slip. Your reflection grows less jagged around the mouth.");
              return;
            }
            say("The sink water reflects your name with its vowels back in place, then pretends it did not.");
            return;
          }
          nudge("The cloudy sink ripples into four empty oval shapes. Something is missing from the word that is you.");
        },
      },
      {
        id: "notice",
        label: "stained notice",
        x: 62,
        y: 14,
        w: 10,
        h: 19,
        click: () => {
          rememberClue("sinkRinse");
          say("A stained office notice reads like a policy and a dare: claimed letters may be rinsed once before leaving the counter.");
        },
      },
    ],
  },
  shrine: {
    title: "Back Room",
    image: "assets/images/dryer-shrine.webp",
    alt: "A hot back room arranged like a dryer shrine, with hanging tags, a tone panel, rust bucket, and name basin.",
    ambience: "shrine",
    entry:
      "Heat rolls over you. The dryers are arranged like an altar that learned plumbing.",
    hotspots: [
      {
        id: "lobbydoor",
        label: "lobby door",
        x: 0,
        y: 18,
        w: 10,
        h: 53,
        click: () => go("lobby"),
      },
      {
        id: "tonePanel",
        label: "three-note panel",
        x: 79,
        y: 26,
        w: 11,
        h: 25,
        click: () => {
          if (state.flags.toneSolved) {
            say("The panel's lights blink low, high, middle, over and over like a tiny apology.");
            audio.toneAnswer();
            return;
          }
          openTonePuzzle();
        },
      },
      {
        id: "bucket",
        label: "rust bucket",
        x: 62,
        y: 72,
        w: 9,
        h: 13,
        click: () => {
          if (!state.flags.toneSolved) {
            nudge("The bucket twitches away. The panel keeps it loyal.");
            return;
          }
          if (state.items.has("rust")) {
            say("The bucket is empty except for a circle of orange fingerprints.");
            return;
          }
          addItem("rust");
          audio.pickup();
          say("You lift a smear of rust. It sparks against your palm like an old argument.");
        },
      },
      {
        id: "hangingTags",
        label: "dangling tags",
        x: 43,
        y: 20,
        w: 16,
        h: 20,
        click: () => {
          if (state.items.has("nameTag")) {
            say("The remaining tags are blank. Some blanks feel louder than words.");
            return;
          }
          if (!state.flags.dryerFed) {
            nudge("A tag with your outline hangs too high. The central dryer keeps tugging it upward.");
            return;
          }
          addItem("nameTag");
          audio.pickup();
          say("You snatch the damp tag. Your name is on it, but the letters keep sliding around.");
        },
      },
      {
        id: "centralDryer",
        label: "central dryer",
        x: 36,
        y: 36,
        w: 28,
        h: 34,
        click: () => {
          if (state.flags.dryerFed) {
            say("The central dryer purrs with soot in its throat.");
            audio.machineBreathe();
            return;
          }
          if (consumeSelected("soot")) {
            state.flags.dryerFed = true;
            state.flags.shrineAwake = true;
            audio.success();
            say("The soot blackens the dryer glass. A damp name tag drops from the ceiling and swings closer.");
            pulseStatic(6);
            return;
          }
          nudge("The central dryer opens a little wider. It wants something dark enough to make a shadow.");
        },
      },
      {
        id: "boilerHatch",
        label: "boiler hatch",
        x: 88,
        y: 48,
        w: 11,
        h: 27,
        click: () => go("boiler"),
      },
      {
        id: "altar",
        label: "name basin",
        x: 39,
        y: 72,
        w: 23,
        h: 14,
        click: () => {
          if (state.flags.nameRestored) {
            say("The basin is dry. It has already failed to keep you.");
            return;
          }
          if (state.items.has("nameTag") && state.items.has("rust") && state.items.has("voice") && state.items.has("vowelSlip")) {
            rememberClue("finalOrder");
            openNamePuzzle();
            return;
          }
          nudge("The basin wants a tag, rust, a voice, and the missing vowels. It is not shy about wanting.");
        },
      },
    ],
  },
  boiler: {
    title: "Boiler Closet",
    image: "assets/images/boiler-closet.webp",
    alt: "A cramped boiler closet with rusted tanks, sweating pipes, a pressure gauge, red valve, and a hatch back to the dryers.",
    ambience: "boiler",
    entry:
      "The boiler closet is hotter than a confession and twice as badly ventilated.",
    hotspots: [
      {
        id: "shrineDoor",
        label: "dryer shrine",
        x: 0,
        y: 16,
        w: 14,
        h: 56,
        click: () => go("shrine"),
      },
      {
        id: "gauge",
        label: "pressure gauge",
        x: 52,
        y: 29,
        w: 9,
        h: 15,
        click: () => {
          rememberClue("boilerPressure");
          say("The gauge needle points to a number that is not printed there. Static is pressure looking for a mouth.");
        },
      },
      {
        id: "pressureValve",
        label: "pressure valve",
        x: 70,
        y: 36,
        w: 21,
        h: 36,
        click: () => {
          if (state.flags.valveTurned) {
            say("The red valve will not turn again. It has already given back what it could.");
            return;
          }
          if (state.static <= 8) {
            say("The red valve is cool. There is not enough static pressure to bleed from the pipes.");
            return;
          }
          state.flags.valveTurned = true;
          lowerStatic(14);
          audio.steamRelease();
          whisper("pressure gives back");
          say("You turn the red valve. Steam coughs into the ceiling, and the room gives some of your static back.");
        },
      },
      {
        id: "lintClumps",
        label: "lint clumps",
        x: 29,
        y: 69,
        w: 37,
        h: 20,
        click: () => {
          say("The lint clumps are packed with old pocket dust, hairpins, and a receipt for a childhood you do not remember buying.");
        },
      },
    ],
  },
  alley: {
    title: "Rain Alley",
    image: "assets/images/rain-alley.webp",
    alt: "A blue dawn alley with rain, a payphone, a storm drain, a laundromat door, and sheets spiraling overhead.",
    ambience: "alley",
    entry:
      "The alley is waiting in blue dawn. The sheets above turn slowly around an impossible drain in the sky.",
    hotspots: [
      {
        id: "payphone",
        label: "payphone",
        x: 2,
        y: 32,
        w: 12,
        h: 28,
        click: () => {
          if (!state.flags.nameRestored) {
            nudge("The phone rings from inside your chest, then gives up.");
            return;
          }
          audio.phoneRing();
          win("soft");
        },
      },
      {
        id: "openRain",
        label: "open rain",
        x: 42,
        y: 52,
        w: 24,
        h: 32,
        click: () => {
          if (!state.flags.nameRestored) {
            nudge("The rain passes through you where your name should be.");
            return;
          }
          audio.rainBreak();
          win(state.static > 55 ? "frayed" : "clean");
        },
      },
      {
        id: "spiralSheets",
        label: "sheet spiral",
        x: 43,
        y: 5,
        w: 33,
        h: 31,
        click: () => {
          whisper("do not fold yourself smaller");
          say("The hanging sheets turn in the dawn wind. For a moment, every cloth is shaped like a door.");
        },
      },
      {
        id: "stormDrain",
        label: "storm drain",
        x: 71,
        y: 72,
        w: 20,
        h: 16,
        click: () => {
          rememberClue("endingFork");
          say("The storm drain speaks through water teeth: rain keeps the named, phones call the soft, static follows the frayed, and clocks keep employees.");
        },
      },
      {
        id: "returnDoor",
        label: "laundromat door",
        x: 12,
        y: 34,
        w: 13,
        h: 29,
        click: () => go("lobby"),
      },
    ],
  },
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.noise = null;
    this.noiseGain = null;
    this.droneA = null;
    this.droneB = null;
    this.droneGain = null;
    this.filter = null;
    this.delay = null;
    this.scene = "lobby";
    this.staticLevel = 8;
    this.muted = false;
  }

  start() {
    if (this.ctx) {
      this.ctx.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return;
    }
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.72;
    this.master.connect(this.ctx.destination);

    this.delay = this.ctx.createDelay(1.8);
    this.delay.delayTime.value = 0.18;
    const delayGain = this.ctx.createGain();
    delayGain.gain.value = 0.18;
    this.delay.connect(delayGain).connect(this.master);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 690;
    this.filter.Q.value = 0.8;
    this.filter.connect(this.master);
    this.filter.connect(this.delay);

    this.noise = this.ctx.createBufferSource();
    this.noise.buffer = this.noiseBuffer(6);
    this.noise.loop = true;
    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = 0.035;
    this.noise.connect(this.noiseGain).connect(this.filter);
    this.noise.start();

    this.droneA = this.osc("sine", 53, 0.05);
    this.droneB = this.osc("triangle", 80, 0.025);
    this.setScene(this.scene);
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.72, this.ctx.currentTime, 0.04);
    }
    muteButton.classList.toggle("active", muted);
    quietButton.textContent = muted ? "Sound Off" : "Sound On";
    quietButton.setAttribute("aria-pressed", String(muted));
  }

  sceneSettings() {
    return {
      lobby: { noise: 0.035, freq: 620, a: 53, b: 83 },
      office: { noise: 0.04, freq: 740, a: 59, b: 118 },
      shrine: { noise: 0.058, freq: 460, a: 38, b: 71 },
      boiler: { noise: 0.065, freq: 390, a: 44, b: 67 },
      alley: { noise: 0.044, freq: 920, a: 47, b: 94 },
    }[this.scene];
  }

  applyMix(speed = 0.5) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const settings = this.sceneSettings();
    const pressure = Math.min(1, this.staticLevel / 100);
    this.noiseGain.gain.setTargetAtTime(settings.noise + pressure * 0.06, now, speed);
    this.filter.frequency.setTargetAtTime(settings.freq - pressure * 230, now, 0.8);
    this.droneA.frequency.setTargetAtTime(settings.a, now, 1.1);
    this.droneB.frequency.setTargetAtTime(settings.b, now, 1.1);
  }

  setScene(scene) {
    this.scene = scene;
    this.applyMix(0.5);
  }

  setStaticLevel(level) {
    this.staticLevel = level;
    this.applyMix(0.18);
  }

  noiseBuffer(seconds) {
    const sampleRate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, sampleRate * seconds, sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i += 1) {
      last = last * 0.94 + (Math.random() * 2 - 1) * 0.06;
      data[i] = last;
    }
    return buffer;
  }

  osc(type, frequency, gainValue) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = gainValue;
    osc.connect(gain).connect(this.filter);
    osc.start();
    return osc;
  }

  blip(freq, dur = 0.12, type = "sine", gain = 0.16, when = 0) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.72), now + dur);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(gain, now + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(env).connect(this.master);
    env.connect(this.delay);
    osc.start(now);
    osc.stop(now + dur + 0.03);
  }

  noiseHit(dur = 0.18, gain = 0.08, when = 0, frequency = 1200, type = "bandpass") {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime + when;
    const source = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const env = this.ctx.createGain();
    source.buffer = this.noiseBuffer(Math.max(0.25, dur + 0.1));
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = 0.8;
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(gain, now + 0.025);
    env.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    source.connect(filter).connect(env).connect(this.master);
    env.connect(this.delay);
    source.start(now);
    source.stop(now + dur + 0.08);
  }

  thud(freq = 92, gain = 0.18) {
    this.blip(freq, 0.28, "triangle", gain);
    this.blip(freq * 0.49, 0.38, "sine", gain * 0.5, 0.02);
  }

  click() {
    this.blip(680 + Math.random() * 80, 0.045, "square", 0.045);
  }

  hover() {
    this.blip(920 + Math.random() * 120, 0.025, "sine", 0.018);
  }

  pickup() {
    this.blip(360, 0.08, "triangle", 0.12);
    this.blip(540, 0.12, "sine", 0.12, 0.06);
    this.blip(820, 0.18, "sine", 0.09, 0.13);
  }

  error() {
    this.blip(210, 0.18, "sawtooth", 0.12);
    this.blip(161, 0.25, "sawtooth", 0.08, 0.08);
    this.noiseHit(0.16, 0.08, 0.02, 640, "lowpass");
  }

  success() {
    this.blip(240, 0.12, "triangle", 0.14);
    this.blip(360, 0.14, "triangle", 0.12, 0.08);
    this.blip(720, 0.22, "sine", 0.08, 0.18);
    this.noiseHit(0.28, 0.045, 0.12, 1800, "highpass");
  }

  door() {
    this.thud(68, 0.24);
    this.blip(112, 0.55, "sawtooth", 0.07, 0.18);
  }

  machineBreathe() {
    this.thud(74, 0.13);
    this.blip(118, 0.7, "sine", 0.05, 0.12);
  }

  toneAnswer() {
    this.blip(196, 0.2, "sine", 0.12);
    this.noiseHit(0.08, 0.026, 0.02, 700, "bandpass");
    this.blip(523.25, 0.2, "sine", 0.12, 0.28);
    this.noiseHit(0.08, 0.026, 0.3, 1700, "bandpass");
    this.blip(329.63, 0.2, "sine", 0.12, 0.56);
    this.noiseHit(0.08, 0.026, 0.58, 1100, "bandpass");
  }

  radioClue() {
    this.toneAnswer();
    this.blip(91, 0.5, "sawtooth", 0.05, 0.88);
    this.noiseHit(0.62, 0.07, 0.82, 1200, "bandpass");
  }

  whisper(text) {
    if ("speechSynthesis" in window && !this.muted) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.72;
      utterance.pitch = 0.48;
      utterance.volume = 0.32;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
    this.blip(144, 0.8, "triangle", 0.04);
  }

  ending() {
    this.success();
    this.blip(96, 1.4, "sine", 0.08, 0.25);
    this.blip(192, 1.2, "triangle", 0.05, 0.45);
  }

  phoneRing() {
    this.blip(880, 0.18, "sine", 0.11);
    this.blip(1320, 0.18, "sine", 0.08, 0.12);
    this.blip(880, 0.22, "sine", 0.1, 0.42);
    this.blip(1320, 0.2, "sine", 0.07, 0.54);
  }

  rainBreak() {
    this.thud(58, 0.19);
    this.blip(420, 0.45, "triangle", 0.06, 0.08);
    this.blip(122, 0.9, "sawtooth", 0.045, 0.16);
    this.noiseHit(0.95, 0.055, 0.04, 2100, "highpass");
  }

  steamRelease() {
    this.noiseHit(0.72, 0.14, 0, 1700, "highpass");
    this.blip(84, 0.42, "sawtooth", 0.07, 0.08);
    this.blip(48, 0.75, "sine", 0.05, 0.2);
  }

  clockIn() {
    this.thud(74, 0.2);
    this.blip(217, 0.12, "square", 0.08, 0.12);
    this.blip(108.5, 0.5, "sawtooth", 0.05, 0.22);
    this.noiseHit(0.32, 0.08, 0.08, 820, "bandpass");
  }

  listen(scene) {
    const cues = {
      lobby: () => {
        this.machineBreathe();
        this.noiseHit(0.24, 0.045, 0.18, 1100, "bandpass");
      },
      office: () => {
        this.blip(217, 0.11, "square", 0.055);
        this.blip(108.5, 0.35, "triangle", 0.045, 0.14);
        this.noiseHit(0.28, 0.04, 0.22, 760, "bandpass");
      },
      shrine: () => {
        this.toneAnswer();
        this.thud(63, 0.1);
      },
      boiler: () => {
        this.noiseHit(0.58, 0.09, 0, 1600, "highpass");
        this.thud(52, 0.09);
      },
      alley: () => {
        this.rainBreak();
        this.phoneRing();
      },
    };
    (cues[scene] || cues.lobby)();
  }
}

const audio = new AudioEngine();

function bindActivation(element, handler) {
  const activate = (event) => {
    if (event?.cancelable) event.preventDefault();
    handler(event);
  };

  element.addEventListener("click", activate);
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") activate(event);
  });
}

function resetGameState() {
  state.scene = "lobby";
  state.items = new Set();
  state.selectedItem = null;
  state.flags = { ...defaultFlags };
  state.clues = new Set();
  state.static = 8;
  state.message = DEFAULT_MESSAGE;
}

function readStoredSave() {
  try {
    const raw = window.localStorage?.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function hasStoredSave() {
  try {
    return Boolean(window.localStorage?.getItem(SAVE_KEY));
  } catch {
    return false;
  }
}

function updateContinueButton() {
  continueButton.hidden = !hasStoredSave();
}

function saveGame() {
  if (!state.flags.started || state.flags.escaped) return;
  try {
    window.localStorage?.setItem(
      SAVE_KEY,
      JSON.stringify({
        scene: state.scene,
        items: [...state.items],
        selectedItem: state.selectedItem,
        flags: { ...state.flags },
        clues: [...state.clues],
        static: state.static,
        message: state.message,
      }),
    );
  } catch {
    return;
  }
  updateContinueButton();
}

function clearSave() {
  try {
    window.localStorage?.removeItem(SAVE_KEY);
  } catch {
    // Browsers can reject storage in private modes; the game should still run.
  }
  updateContinueButton();
}

function readEndings() {
  try {
    const raw = window.localStorage?.getItem(ENDINGS_KEY);
    const endings = raw ? JSON.parse(raw) : [];
    return Array.isArray(endings)
      ? endings.filter((ending) => endingMeta[ending])
      : [];
  } catch {
    return [];
  }
}

function recordEnding(kind) {
  if (!endingMeta[kind]) return readEndings().length;
  const endings = new Set(readEndings());
  endings.add(kind);
  try {
    window.localStorage?.setItem(ENDINGS_KEY, JSON.stringify([...endings]));
  } catch {
    return endings.size;
  }
  renderEndingStamps();
  return endings.size;
}

function clearEndings() {
  try {
    window.localStorage?.removeItem(ENDINGS_KEY);
  } catch {
    // Ending stamps are a convenience; clearing can fail without blocking play.
  }
  renderEndingStamps();
}

function renderEndingStamps() {
  const endings = new Set(readEndings());
  endingStampsEl.innerHTML = "";
  endingStampsEl.hidden = !endings.size;
  if (!endings.size) return;

  const label = document.createElement("p");
  label.className = "ending-stamps-label";
  label.textContent = endings.size === endingOrder.length
    ? `Endings found ${endings.size}/${endingOrder.length} - all cycles recorded`
    : `Endings found ${endings.size}/${endingOrder.length}`;
  endingStampsEl.append(label);

  const list = document.createElement("div");
  list.className = "ending-stamp-list";
  endingOrder.forEach((ending) => {
    const stamp = document.createElement("span");
    const found = endings.has(ending);
    stamp.className = "ending-stamp";
    stamp.classList.toggle("locked", !found);
    stamp.textContent = found ? endingMeta[ending].title : "Unknown ending";
    stamp.title = found ? endingMeta[ending].title : endingMeta[ending].hint;
    stamp.setAttribute(
      "aria-label",
      found ? endingMeta[ending].title : `Unknown ending. ${endingMeta[ending].hint}`,
    );
    list.append(stamp);
  });
  endingStampsEl.append(list);

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "ending-clear";
  clearButton.textContent = "Burn Records";
  bindActivation(clearButton, () => {
    audio.click();
    clearEndings();
  });
  endingStampsEl.append(clearButton);
}

function hydrateState(save) {
  if (!save || typeof save !== "object") return false;
  const savedItems = Array.isArray(save.items)
    ? save.items.filter((item) => itemMeta[item])
    : [];
  const savedClues = Array.isArray(save.clues)
    ? save.clues.filter((clue) => clueText[clue])
    : [];
  const savedStatic = Number(save.static);

  state.scene = scenes[save.scene] ? save.scene : "lobby";
  state.items = new Set(savedItems);
  state.selectedItem = savedItems.includes(save.selectedItem) ? save.selectedItem : null;
  state.flags = {
    ...defaultFlags,
    ...(save.flags && typeof save.flags === "object" ? save.flags : {}),
    started: true,
    escaped: false,
  };
  state.clues = new Set(savedClues);
  state.static = Number.isFinite(savedStatic)
    ? Math.max(0, Math.min(100, savedStatic))
    : 8;
  state.message = typeof save.message === "string" ? save.message : scenes[state.scene].entry;
  return true;
}

function loadGame({ audioGesture = true } = {}) {
  const save = readStoredSave();
  if (!hydrateState(save)) {
    clearSave();
    return false;
  }
  state.flags.quiet = readAudioPreference() ?? state.flags.quiet;
  if (audioGesture) {
    try {
      audio.start();
    } catch {
      audio.setMuted(true);
    }
  }
  audio.setMuted(state.flags.quiet);
  startScreen.classList.add("is-hidden");
  const restoredMessage = state.message;
  renderScene();
  renderInventory();
  say(restoredMessage);
  renderStatic();
  if (audioGesture) whisper("continue");
  return true;
}

function rememberClue(clue) {
  if (!clueText[clue]) return;
  const isNew = !state.clues.has(clue);
  state.clues.add(clue);
  if (isNew) saveGame();
}

function describeItem(item) {
  const meta = itemMeta[item];
  return `${meta.label} selected. ${meta.inspect}`;
}

function renderStatic() {
  staticFill.style.width = `${state.static}%`;
  meterEl.setAttribute("aria-label", `Static pressure ${Math.round(state.static)} percent`);
  document.body.classList.toggle("static-rising", state.static >= 35);
  document.body.classList.toggle("static-critical", state.static >= 65);
  audio.setStaticLevel(state.static);
}

function joltStage() {
  stage.classList.remove("is-jolting");
  void stage.offsetWidth;
  stage.classList.add("is-jolting");
  window.setTimeout(() => stage.classList.remove("is-jolting"), 260);
}

function resetStageLook() {
  stage.style.setProperty("--look-x", "0px");
  stage.style.setProperty("--look-y", "0px");
}

function updateStageLook(event) {
  if (reduceMotionQuery.matches || event.pointerType === "touch") return;
  const rect = stage.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * -10;
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * -7;
  stage.style.setProperty("--look-x", `${x.toFixed(2)}px`);
  stage.style.setProperty("--look-y", `${y.toFixed(2)}px`);
}

function flashApparition(text) {
  window.clearTimeout(apparitionTimer);
  apparitionEl.textContent = text;
  apparitionEl.classList.remove("show");
  void apparitionEl.offsetWidth;
  apparitionEl.classList.add("show");
  apparitionTimer = window.setTimeout(() => {
    apparitionEl.classList.remove("show");
  }, 1900);
}

function whisper(text) {
  audio.whisper(text);
  flashApparition(text);
}

function flashStaticApparition() {
  const lines = staticApparitions[state.scene] || staticApparitions.lobby;
  flashApparition(lines[Math.floor(Math.random() * lines.length)]);
}

function addItem(item) {
  state.items.add(item);
  state.selectedItem = item;
  renderInventory();
  saveGame();
}

function removeItem(item) {
  state.items.delete(item);
  if (state.selectedItem === item) state.selectedItem = null;
  renderInventory();
  saveGame();
}

function consumeSelected(item) {
  if (state.selectedItem !== item || !state.items.has(item)) return false;
  removeItem(item);
  return true;
}

function say(message) {
  state.message = message;
  messageEl.textContent = message;
  saveGame();
}

function nudge(message) {
  audio.error();
  pulseStatic(8);
  say(message);
}

function pulseStatic(amount) {
  state.static = Math.max(0, Math.min(100, state.static + amount));
  renderStatic();
  if (amount >= 8) {
    joltStage();
    flashStaticApparition();
  }
  saveGame();
}

function lowerStatic(amount) {
  state.static = Math.max(0, Math.min(100, state.static - amount));
  renderStatic();
  saveGame();
}

function listenToRoom() {
  const line = roomListen[state.scene] || roomListen.lobby;
  audio.listen(state.scene);
  flashApparition(line.caption);
  say(line.message);
}

function currentObjective() {
  if (!state.flags.started) return "Find out why the machines know your name.";
  if (!state.flags.washerOpened) return "Search the lobby for something wet enough to spend.";
  if (!state.flags.vendingUsed) return "Use the wet coin on the soap machine.";
  if (!state.flags.safeOpen) return "Use the claim ticket to find the lost office, then recover your missing vowels.";
  if (!state.flags.backUnlocked) return "Use the black soap on the red back door.";
  if (!state.flags.dryerFed) return "Bring a dark stain to the central dryer.";
  if (!state.items.has("nameTag")) return "Take the damp name tag from the hanging tags.";
  if (!state.flags.toneSolved) return "Solve the three-note panel: low, high, middle.";
  if (!state.flags.radioCaptured) return "Return to the lobby radio and catch your voice.";
  if (!state.flags.nameRestored) return "Restore the name with tag, rust, voice, and vowels.";
  if (state.scene !== "alley") return "Leave through the front exit.";
  return "Choose how to walk into the rain.";
}

function renderObjective() {
  objectiveEl.textContent = currentObjective();
}

function renderInventory() {
  inventoryEl.innerHTML = "";
  renderObjective();
  if (!state.items.size) {
    const empty = document.createElement("p");
    empty.className = "message";
    empty.textContent = "Your pockets are dry.";
    inventoryEl.append(empty);
    return;
  }

  for (const item of state.items) {
    const meta = itemMeta[item];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "item-button";
    button.textContent = meta.label;
    button.title = meta.inspect;
    button.style.setProperty("--item-color", meta.color);
    button.setAttribute("aria-pressed", String(state.selectedItem === item));
    button.classList.toggle("selected", state.selectedItem === item);
    bindActivation(button, () => {
      state.selectedItem = item;
      audio.click();
      say(describeItem(item));
      saveGame();
      renderInventory();
    });
    inventoryEl.append(button);
  }
}

function renderActions(scene) {
  renderObjective();
  actionsEl.innerHTML = "";
  const listenButton = document.createElement("button");
  listenButton.type = "button";
  listenButton.className = "action-button";
  listenButton.textContent = "listen";
  listenButton.dataset.hotspot = "listen";
  listenButton.setAttribute("aria-keyshortcuts", "1");
  listenButton.title = "Shortcut: 1";
  bindActivation(listenButton, () => {
    listenToRoom();
    renderInventory();
    renderActions(scenes[state.scene]);
  });
  actionsEl.append(listenButton);

  scene.hotspots.forEach((hotspot, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "action-button";
    button.textContent = hotspot.label;
    button.dataset.hotspot = hotspot.id;
    if (index < 8) {
      const shortcut = String(index + 2);
      button.setAttribute("aria-keyshortcuts", shortcut);
      button.title = `Shortcut: ${shortcut}`;
    }
    bindActivation(button, () => {
      audio.click();
      hotspot.click();
      renderInventory();
      renderActions(scenes[state.scene]);
    });
    actionsEl.append(button);
  });
}

function renderScene() {
  const scene = scenes[state.scene];
  roomTitle.textContent = scene.title;
  renderObjective();
  resetStageLook();
  sceneImage.style.opacity = "0";
  window.setTimeout(() => {
    sceneImage.src = scene.image;
    sceneImage.alt = scene.alt;
    sceneImage.style.opacity = "1";
  }, 120);
  hotspotLayer.innerHTML = "";
  scene.hotspots.forEach((hotspot) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hotspot";
    button.dataset.label = hotspot.label;
    button.ariaLabel = hotspot.label;
    button.style.setProperty("--x", `${hotspot.x}%`);
    button.style.setProperty("--y", `${hotspot.y}%`);
    button.style.setProperty("--w", `${hotspot.w}%`);
    button.style.setProperty("--h", `${hotspot.h}%`);
    button.addEventListener("mouseenter", () => audio.hover());
    button.addEventListener("focus", () => audio.hover());
    bindActivation(button, () => {
      audio.click();
      hotspot.click();
      renderInventory();
      renderActions(scenes[state.scene]);
    });
    hotspotLayer.append(button);
  });
  renderActions(scene);
  audio.setScene(scene.ambience);
  say(scene.entry);
}

function go(scene, delay = 140) {
  window.setTimeout(() => {
    state.scene = scene;
    renderScene();
  }, delay);
}

function openSafePuzzle() {
  const digits = ["0", "0", "0"];

  openModal({
    title: "Claim Safe",
    body:
      "The brass key turns once. Three tumblers wait for the time the laundromat keeps repeating.",
    image: "assets/images/claim-safe-closeup.webp",
    imageAlt: "A damp brass claim safe with a key in the lock and three old number tumblers.",
    content: () => {
      const grid = document.createElement("div");
      grid.className = "dial-grid";
      digits.forEach((digit, index) => {
        const dial = document.createElement("button");
        dial.type = "button";
        dial.className = "dial";
        dial.innerHTML = `<span>digit ${index + 1}</span>${digit}`;
        bindActivation(dial, () => {
          digits[index] = String((Number(digits[index]) + 1) % 10);
          dial.innerHTML = `<span>digit ${index + 1}</span>${digits[index]}`;
          audio.blip(180 + Number(digits[index]) * 34, 0.12, "triangle", 0.1);
        });
        grid.append(dial);
      });
      return grid;
    },
    actions: [
      {
        label: "Recall Time",
        click: () => {
          rememberClue("time217");
          whisper("two one seven");
          say("The ledger, the mirror, and the time clock all keep returning to 2:17.");
        },
      },
      {
        label: "Open Safe",
        primary: true,
        click: () => {
          if (digits.join("") === "217") {
            state.flags.safeOpen = true;
            rememberClue("safe");
            removeItem("brassKey");
            addItem("vowelSlip");
            lowerStatic(10);
            audio.success();
            closeModal();
            say("The safe opens on a breath of dry paper. Inside is a vowel slip with the missing middle of your name.");
          } else {
            pulseStatic(10);
            audio.error();
            say("The safe rejects the number. Somewhere in the office, a claim ticket tears itself in half.");
          }
        },
      },
    ],
  });
}

function openTonePuzzle() {
  const slots = ["LOW", "LOW", "LOW"];
  const options = ["LOW", "MID", "HIGH"];
  const freqs = { LOW: 196, MID: 329.63, HIGH: 523.25 };
  let echoStrip = null;
  let echoCaption = null;

  const playMemory = () => {
    rememberClue("radioTune");
    audio.radioClue();
    if (!echoStrip || !echoCaption) return;
    echoCaption.textContent = "The speaker flashes its memory: low, high, middle.";
    echoStrip.classList.remove("is-playing");
    window.requestAnimationFrame(() => {
      echoStrip.classList.add("is-playing");
    });
  };

  openModal({
    title: "Three-Note Panel",
    body:
      "Three loose dials sit under a speaker grille. The first dial is cold, the second is hot, the third feels almost human.",
    image: "assets/images/tone-panel-closeup.webp",
    imageAlt: "A wet rusted three-note tone panel with a speaker grille, three rotary dials, and teal and amber indicator bulbs.",
    content: () => {
      const panel = document.createElement("div");
      panel.className = "tone-panel";

      const grid = document.createElement("div");
      grid.className = "dial-grid";
      slots.forEach((slot, index) => {
        const dial = document.createElement("button");
        dial.type = "button";
        dial.className = "dial";
        dial.setAttribute("aria-label", `dial ${index + 1}: ${slot}`);
        dial.innerHTML = `<span>dial ${index + 1}</span>${slot}`;
        bindActivation(dial, () => {
          const current = options.indexOf(slots[index]);
          slots[index] = options[(current + 1) % options.length];
          dial.setAttribute("aria-label", `dial ${index + 1}: ${slots[index]}`);
          dial.innerHTML = `<span>dial ${index + 1}</span>${slots[index]}`;
          audio.blip(freqs[slots[index]], 0.16, "sine", 0.11);
        });
        grid.append(dial);
      });

      echoStrip = document.createElement("div");
      echoStrip.className = "echo-strip";
      echoStrip.setAttribute("aria-label", "visual memory cue low high middle");
      ["low", "high", "middle"].forEach((note) => {
        const bar = document.createElement("i");
        bar.className = `echo-bar ${note}`;
        bar.setAttribute("aria-hidden", "true");
        echoStrip.append(bar);
      });

      echoCaption = document.createElement("p");
      echoCaption.className = "echo-caption";
      echoCaption.textContent = "The speaker grille is quiet, waiting to repeat the radio's memory.";

      panel.append(grid, echoStrip, echoCaption);
      return panel;
    },
    actions: [
      {
        label: "Play Memory",
        click: playMemory,
      },
      {
        label: "Set Dials",
        primary: true,
        click: () => {
          if (slots.join("-") === "LOW-HIGH-MID") {
            state.flags.toneSolved = true;
            addItem("rust");
            lowerStatic(12);
            audio.success();
            closeModal();
            say("The panel accepts the notes. A rust bloom opens under the shrine and flakes into your pocket.");
          } else {
            pulseStatic(12);
            audio.error();
            say("The panel spits heat through the room. Somewhere, a dryer laughs on a broken belt.");
          }
        },
      },
    ],
  });
}

function openNamePuzzle() {
  rememberClue("finalOrder");
  const chosen = [];
  const order = ["rust", "voice", "vowelSlip"];
  const choices = ["voice", "vowelSlip", "rust"];

  openModal({
    title: "Name Basin",
    body:
      "The basin has three drains. Your tag lies between them, waiting for weight, breath, and letters.",
    image: "assets/images/name-basin-closeup.webp",
    imageAlt: "A cracked porcelain basin with three drains, rust, a blue breath-like glow, and a damp name tag.",
    content: () => {
      const grid = document.createElement("div");
      grid.className = "stain-grid";
      choices.forEach((item) => {
        const meta = itemMeta[item];
        const button = document.createElement("button");
        button.type = "button";
        button.className = "stain-choice";
        button.setAttribute("aria-label", meta.label);
        button.setAttribute("aria-pressed", "false");
        button.style.borderColor = meta.color;
        button.innerHTML = `<span>${chosen.includes(item) ? "placed" : "stain"}</span>${meta.label}`;
        bindActivation(button, () => {
          if (chosen.includes(item)) return;
          chosen.push(item);
          button.setAttribute("aria-pressed", "true");
          button.innerHTML = `<span>placed</span>${meta.label}`;
          audio.blip(220 + chosen.length * 110, 0.18, "triangle", 0.12);
        });
        grid.append(button);
      });
      return grid;
    },
    actions: [
      {
        label: "Wash Name",
        primary: true,
        click: () => {
          if (chosen.join("-") === order.join("-")) {
            state.flags.nameRestored = true;
            removeItem("nameTag");
            removeItem("rust");
            removeItem("voice");
            removeItem("vowelSlip");
            lowerStatic(24);
            whisper("there you are");
            closeModal();
            say("Rust gives the name weight. Voice gives it teeth. The vowel slip gives it a throat. The front exit unlocks.");
            window.setTimeout(() => go("lobby"), 900);
          } else {
            pulseStatic(18);
            audio.error();
            chosen.splice(0, chosen.length);
            closeModal();
            say("The basin drains backward. The laundromat almost learns a new way to spell you.");
          }
        },
      },
    ],
  });
}

function openClockEnding() {
  openModal({
    title: "Shift Clock",
    body:
      "The punch slot opens like it has been expecting your restored name. The card inside is blank except for tomorrow's date and your handwriting.",
    image: "assets/images/shift-clock-closeup.webp",
    imageAlt: "A grimy laundromat shift clock with a blank punch card inserted into a dark slot under an old clock face.",
    content: () => {
      const note = document.createElement("p");
      note.className = "journal-meta";
      note.textContent = "Clocking in means the laundromat learns your name the honest way.";
      return note;
    },
    actions: [
      {
        label: "Punch Card",
        primary: true,
        click: () => {
          audio.clockIn();
          closeModal();
          win("attendant");
        },
      },
    ],
  });
}

function currentHint() {
  if (!state.flags.started) return "Begin the shift and search the lobby from left to right.";
  if (!state.flags.washerOpened) return "The breathing washer has something loose in its rubber lip.";
  if (!state.flags.vendingUsed) return "Select the Wet Coin, then use it on the soap machine.";
  if (!state.flags.safeOpen) {
    if (state.scene !== "office") return "Use the claim ticket at the lost office window in the lobby.";
    if (!state.flags.ledgerRead) return "Read the claim ledger. It tells you what the office stole and which time matters.";
    if (!state.items.has("brassKey")) return "Take the warm brass key from the rack before dealing with the safe.";
    return "Select the Brass Key, open the claim safe, and enter the time the office keeps repeating.";
  }
  if (state.scene === "office" && state.items.has("vowelSlip") && !state.flags.sinkRinsed && state.static > 20) {
    return "The cloudy sink can rinse some static from the vowel slip before you leave the office.";
  }
  if (!state.flags.backUnlocked) return "Select the Black Soap, then use it on the red back door.";
  if (!state.flags.dryerFed) return "The central dryer wants a dark stain. Select Soot before touching it.";
  if (!state.items.has("nameTag")) return "After feeding the dryer, take the dangling name tag.";
  if (!state.flags.toneSolved) return "The three-note panel wants the radio pattern: low, high, middle.";
  if (!state.flags.radioCaptured) return "Return to the lobby radio after solving the panel.";
  if (!state.flags.nameRestored) return "At the name basin, place the pieces in this order: Rust, Voice, Vowel Slip.";
  if (state.scene !== "alley") return "The front exit will now let you leave.";
  return "The open rain gives the clean ending, the payphone gives a stranger one, and the shift clock gives a darker choice.";
}

function openJournal() {
  openModal({
    title: "Shift Journal",
    body: "Your damp notes collect the parts of the laundromat that keep repeating.",
    content: () => {
      const panel = document.createElement("div");
      panel.className = "journal-panel";

      const objective = document.createElement("p");
      objective.className = "journal-meta";
      objective.textContent = `Next: ${currentObjective()}`;
      panel.append(objective);

      const entries = [...state.clues].map((clue) => clueText[clue]);
      if (!entries.length) {
        const empty = document.createElement("p");
        empty.className = "journal-empty";
        empty.textContent = "No clues logged yet. Touch odd things and the room will start telling on itself.";
        panel.append(empty);
      } else {
        const list = document.createElement("ul");
        list.className = "journal-list";
        entries.forEach((entry) => {
          const item = document.createElement("li");
          item.textContent = entry;
          list.append(item);
        });
        panel.append(list);
      }

      if (state.items.size) {
        const pocketTitle = document.createElement("h4");
        pocketTitle.className = "journal-subhead";
        pocketTitle.textContent = "Pockets";
        panel.append(pocketTitle);

        const pocketList = document.createElement("ul");
        pocketList.className = "journal-list";
        [...state.items].forEach((item) => {
          const meta = itemMeta[item];
          const entry = document.createElement("li");
          entry.textContent = `${meta.label}: ${meta.inspect}`;
          pocketList.append(entry);
        });
        panel.append(pocketList);
      }

      const endings = new Set(readEndings());
      if (endings.size) {
        const endingTitle = document.createElement("h4");
        endingTitle.className = "journal-subhead";
        endingTitle.textContent = "Ending Records";
        panel.append(endingTitle);

        const endingList = document.createElement("ul");
        endingList.className = "journal-list";
        endingOrder.forEach((ending) => {
          const entry = document.createElement("li");
          entry.textContent = endings.has(ending)
            ? endingMeta[ending].title
            : `Unknown ending: ${endingMeta[ending].hint}`;
          endingList.append(entry);
        });
        panel.append(endingList);
      }

      return panel;
    },
    actions: [],
  });
}

function openHint() {
  openModal({
    title: "Counter Hint",
    body: currentHint(),
    content: () => {
      const note = document.createElement("p");
      note.className = "journal-meta";
      note.textContent = `Objective: ${currentObjective()}`;
      return note;
    },
    actions: [],
  });
}

function openCredits() {
  openModal({
    title: "Credits",
    body:
      "The Laundromat Takes Your Name is an original static web game built for GitHub Pages.",
    content: () => {
      const list = document.createElement("ul");
      list.className = "journal-list";
      [
        "Scene and close-up artwork: generated original WebP assets for this game.",
        "Sound: procedural Web Audio synthesis, speech captions, and browser speech where available.",
        "Code and tests: plain HTML, CSS, JavaScript, and Playwright route coverage.",
      ].forEach((line) => {
        const item = document.createElement("li");
        item.textContent = line;
        list.append(item);
      });
      return list;
    },
    actions: [],
  });
}

function openModal({ title, body, content, actions, image, imageAlt = "" }) {
  lastModalFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  modalRoot.innerHTML = "";
  modalRoot.hidden = false;

  const modal = document.createElement("article");
  const titleId = `modal-title-${Date.now().toString(36)}`;
  modal.className = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", titleId);
  modal.innerHTML = `
    <header><h3 id="${titleId}">${title}</h3></header>
    <section><p>${body}</p></section>
    <footer></footer>
  `;
  const section = modal.querySelector("section");
  if (image) {
    const art = document.createElement("img");
    art.className = "modal-art";
    art.src = image;
    art.alt = imageAlt;
    section.append(art);
  }
  section.append(content());
  const footer = modal.querySelector("footer");
  actions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "modal-button";
    button.textContent = action.label;
    if (action.primary) button.classList.add("primary-action");
    bindActivation(button, action.click);
    footer.append(button);
  });
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "modal-button";
  cancel.textContent = "Step Back";
  bindActivation(cancel, closeModal);
  footer.prepend(cancel);
  modalRoot.append(modal);
  window.setTimeout(() => modal.querySelector("button")?.focus(), 0);
}

function closeModal() {
  modalRoot.hidden = true;
  modalRoot.innerHTML = "";
  if (lastModalFocus && document.contains(lastModalFocus)) {
    lastModalFocus.focus();
  }
  lastModalFocus = null;
}

function trapModalFocus(event) {
  const focusable = [...modalRoot.querySelectorAll("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")]
    .filter((element) => !element.disabled);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function win(kind) {
  if (state.flags.escaped) return;
  state.flags.escaped = true;
  clearSave();
  const endingCount = recordEnding(kind);
  audio.ending();
  const ending = document.createElement("section");
  ending.className = "ending-card";
  const endingText = endingMeta[kind];
  ending.style.setProperty("--ending-image", `url("${endingText.image}")`);
  ending.innerHTML = `
    <div class="ending-copy">
      <p class="kicker">ending</p>
      <h2>${endingText.title}</h2>
      <p>${endingText.body}</p>
      <p class="ending-record">Ending recorded ${endingCount}/${endingOrder.length}</p>
      <button class="primary-action" type="button" id="restartButton">Restart Shift</button>
    </div>
  `;
  document.body.append(ending);
  bindActivation(document.querySelector("#restartButton"), () => {
    window.location.reload();
  });
}

function resizeCanvas() {
  const rect = stage.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const motes = Array.from({ length: 72 }, () => ({
  x: Math.random(),
  y: Math.random(),
  r: 0.4 + Math.random() * 1.9,
  s: 0.05 + Math.random() * 0.2,
  a: 0.12 + Math.random() * 0.4,
}));

const weather = Array.from({ length: 42 }, () => ({
  x: Math.random(),
  y: Math.random(),
  l: 0.08 + Math.random() * 0.16,
  s: 0.18 + Math.random() * 0.32,
  a: 0.08 + Math.random() * 0.16,
}));

function drawSceneWeather(rect, time) {
  if (reduceMotionQuery.matches) return;

  if (state.scene === "alley") {
    ctx.globalCompositeOperation = "screen";
    ctx.lineWidth = 1;
    weather.forEach((drop) => {
      drop.y += drop.s * 0.006;
      if (drop.y > 1.1) {
        drop.y = -0.1;
        drop.x = Math.random();
      }
      const x = drop.x * rect.width;
      const y = drop.y * rect.height;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(176,238,246,${drop.a})`;
      ctx.moveTo(x, y);
      ctx.lineTo(x - rect.width * 0.018, y + rect.height * drop.l);
      ctx.stroke();
    });
  } else if (state.scene === "boiler") {
    ctx.globalCompositeOperation = "screen";
    weather.slice(0, 18).forEach((wisp, index) => {
      const rise = (time * 0.00004 * (1 + wisp.s) + wisp.y) % 1;
      const x = (0.62 + Math.sin(time * 0.00028 + index) * 0.12 + wisp.x * 0.18) * rect.width;
      const y = (0.92 - rise * 0.72) * rect.height;
      ctx.beginPath();
      ctx.fillStyle = `rgba(245,197,146,${0.012 + wisp.a * 0.12})`;
      ctx.ellipse(x, y, 10 + wisp.l * 56, 3 + wisp.l * 18, Math.sin(time * 0.0004 + index), 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

function animate(time = 0) {
  const rect = stage.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.globalCompositeOperation = "lighter";

  const sceneColor = {
    lobby: "147,217,178",
    office: "214,167,77",
    shrine: "242,94,55",
    boiler: "221,112,58",
    alley: "76,199,206",
  }[state.scene];

  motes.forEach((mote, index) => {
    const drift = Math.sin(time * 0.0003 + index) * 0.012;
    mote.y += mote.s * 0.0008;
    if (mote.y > 1.04) mote.y = -0.04;
    const x = (mote.x + drift) * rect.width;
    const y = mote.y * rect.height;
    ctx.beginPath();
    ctx.fillStyle = `rgba(${sceneColor}, ${mote.a})`;
    ctx.arc(x, y, mote.r, 0, Math.PI * 2);
    ctx.fill();
  });

  drawSceneWeather(rect, time);

  if (state.static > 35) {
    ctx.globalCompositeOperation = "source-over";
    const tears = Math.floor(state.static / 11);
    for (let i = 0; i < tears; i += 1) {
      const y = Math.random() * rect.height;
      const h = 1 + Math.random() * 5;
      ctx.fillStyle = `rgba(255,255,255,${0.015 + state.static / 5000})`;
      ctx.fillRect(0, y, rect.width, h);
    }
  }
  requestAnimationFrame(animate);
}

function startGame({ audioGesture = true } = {}) {
  if (state.flags.started) return;
  state.flags.started = true;
  if (audioGesture) {
    try {
      audio.start();
    } catch {
      audio.setMuted(true);
    }
  }
  audio.setMuted(state.flags.quiet);
  startScreen.classList.add("is-hidden");
  renderStatic();
  renderScene();
  if (audioGesture) whisper("wash gently");
}

bindActivation(beginButton, () => {
  const quiet = readAudioPreference() ?? state.flags.quiet;
  clearSave();
  resetGameState();
  state.flags.quiet = quiet;
  startGame();
  if (window.history?.replaceState) {
    window.history.replaceState(null, "", window.location.pathname);
  }
});

bindActivation(continueButton, () => {
  loadGame();
  if (window.history?.replaceState) {
    window.history.replaceState(null, "", window.location.pathname);
  }
});

bindActivation(quietButton, () => {
  state.flags.quiet = !state.flags.quiet;
  writeAudioPreference(state.flags.quiet);
  audio.setMuted(state.flags.quiet);
  saveGame();
});

bindActivation(creditsButton, openCredits);

bindActivation(muteButton, () => {
  state.flags.quiet = !audio.muted;
  writeAudioPreference(state.flags.quiet);
  audio.setMuted(state.flags.quiet);
  saveGame();
});

bindActivation(revealButton, () => {
  stage.classList.toggle("revealing");
  revealButton.classList.toggle("active", stage.classList.contains("revealing"));
  audio.click();
});

bindActivation(journalButton, () => {
  audio.click();
  openJournal();
});

bindActivation(hintButton, () => {
  audio.click();
  openHint();
});

window.addEventListener("resize", resizeCanvas);
stage.addEventListener("pointermove", updateStageLook);
stage.addEventListener("pointerleave", resetStageLook);
reduceMotionQuery.addEventListener("change", resetStageLook);
window.addEventListener("keydown", (event) => {
  if (event.key === "Tab" && !modalRoot.hidden) {
    trapModalFocus(event);
    return;
  }
  if (event.key === "Escape" && !modalRoot.hidden) closeModal();
  if (!state.flags.started || !modalRoot.hidden) return;

  const key = event.key.toLowerCase();
  if (/^[1-9]$/.test(event.key)) {
    const button = actionsEl.querySelectorAll("button")[Number(event.key) - 1];
    if (button) {
      event.preventDefault();
      button.click();
    }
  } else if (key === "r") {
    event.preventDefault();
    stage.classList.toggle("revealing");
    revealButton.classList.toggle("active", stage.classList.contains("revealing"));
    audio.click();
  } else if (key === "h") {
    event.preventDefault();
    audio.click();
    openHint();
  } else if (key === "j") {
    event.preventDefault();
    audio.click();
    openJournal();
  } else if (key === "m") {
    event.preventDefault();
    audio.setMuted(!audio.muted);
  }
});

resizeCanvas();
audio.setMuted(state.flags.quiet);
renderInventory();
renderStatic();
updateContinueButton();
renderEndingStamps();
requestAnimationFrame(animate);

const params = new URLSearchParams(window.location.search);

if (params.has("autostart") || params.has("play")) {
  clearSave();
  window.setTimeout(() => startGame({ audioGesture: false }), 120);
}

if (params.has("debug") && ["localhost", "127.0.0.1", ""].includes(window.location.hostname)) {
  window.__laundryDebug = {
    snapshot() {
      return {
        scene: state.scene,
        items: [...state.items],
        selectedItem: state.selectedItem,
        flags: { ...state.flags },
        static: state.static,
        message: state.message,
        hotspots: scenes[state.scene].hotspots.map((hotspot) => hotspot.id),
      };
    },
    select(item) {
      if (!state.items.has(item)) throw new Error(`Missing item: ${item}`);
      state.selectedItem = item;
      renderInventory();
      return this.snapshot();
    },
    trigger(id) {
      const hotspot = scenes[state.scene].hotspots.find((candidate) => candidate.id === id);
      if (!hotspot) throw new Error(`Missing hotspot ${id} in ${state.scene}`);
      hotspot.click();
      renderInventory();
      return this.snapshot();
    },
    solveTone() {
      state.flags.toneSolved = true;
      addItem("rust");
      lowerStatic(12);
      say("Debug: the panel accepts the notes. Rust flakes into your pocket.");
      return this.snapshot();
    },
    solveName() {
      if (!(state.items.has("nameTag") && state.items.has("rust") && state.items.has("voice") && state.items.has("vowelSlip"))) {
        throw new Error("Missing final basin items");
      }
      state.flags.nameRestored = true;
      removeItem("nameTag");
      removeItem("rust");
      removeItem("voice");
      removeItem("vowelSlip");
      lowerStatic(24);
      say("Debug: the name is restored. The front exit unlocks.");
      return this.snapshot();
    },
  };
}

if (params.has("selftest") && ["localhost", "127.0.0.1", ""].includes(window.location.hostname)) {
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const trigger = (id) => {
    const hotspot = scenes[state.scene].hotspots.find((candidate) => candidate.id === id);
    if (!hotspot) throw new Error(`Missing hotspot ${id} in ${state.scene}`);
    hotspot.click();
    renderInventory();
  };
  const select = (item) => {
    if (!state.items.has(item)) throw new Error(`Missing item ${item}`);
    state.selectedItem = item;
    renderInventory();
  };
  const snapshot = () => ({
    scene: state.scene,
    items: [...state.items],
    flags: { ...state.flags },
    static: state.static,
    message: state.message,
    ending: document.querySelector(".ending-copy h2")?.textContent || "",
  });

  (async () => {
    try {
      startGame({ audioGesture: false });
      await wait(260);
      trigger("basket");
      trigger("washer");
      select("wetCoin");
      trigger("vending");
      trigger("office");
      await wait(260);
      trigger("keyRack");
      select("brassKey");
      trigger("safe");
      state.flags.safeOpen = true;
      removeItem("brassKey");
      addItem("vowelSlip");
      closeModal();
      trigger("lobbydoor");
      await wait(260);
      select("blackSoap");
      trigger("backdoor");
      await wait(850);
      select("soot");
      trigger("centralDryer");
      trigger("hangingTags");
      state.flags.toneSolved = true;
      addItem("rust");
      trigger("lobbydoor");
      await wait(260);
      trigger("radio");
      trigger("basket");
      trigger("backdoor");
      await wait(260);
      trigger("altar");
      if (modalRoot.hidden) throw new Error("Name basin modal did not open");
      state.flags.nameRestored = true;
      removeItem("nameTag");
      removeItem("rust");
      removeItem("voice");
      removeItem("vowelSlip");
      closeModal();
      go("lobby", 20);
      await wait(120);
      trigger("exit");
      await wait(260);
      trigger("openRain");
      await wait(120);
      document.body.dataset.selftest = JSON.stringify({ ok: true, ...snapshot() });
    } catch (error) {
      document.body.dataset.selftest = JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        ...snapshot(),
      });
    }
  })();
}
