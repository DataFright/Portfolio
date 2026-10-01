// Fly By Mouse facts. Every line here is checkable against the package's own
// docs (Assets/FlightControls/START_HERE.md and Documentation/01–12) — if the
// product changes, change it here and both the home card and /fly-by-mouse follow.

export const flyByMouse = {
  name: "Fly By Mouse",
  tagline: "A mouse-aim flight controller for Unity.",
  summary:
    "You move an aim point, and an autopilot flies the aircraft to it — banking to turn, protecting the airframe from over-stressing itself, coordinating its own rudder. Point where you want to go, and it goes there.",
  inspiredBy: "Inspired by War Thunder-style mouse aim.",
  status: "Pre-launch",
  store: "Unity Asset Store — coming soon",

  requirements: [
    ["Unity", "6.3 (built and tested on 6000.3.21f1)"],
    ["Render", "URP"],
    ["Input", "Input System package"],
    ["Step", "Fixed timestep 0.02 s (Unity default)"],
  ],

  structure: `Assets/FlightControls/
|-- START_HERE.md      # master doc: what ships, where to read next
|-- Documentation/     # 12 docs, one per area
|-- Runtime/           # flight core, aim rig, input, config types
|   \\-- Prefabs/       # FlightRig.prefab, Aircraft.prefab
|-- Combat/            # gun, health, crash death, effects
|-- HUD/               # FlightHud
|-- AI/                # EnemyPilot, EnemySquadron
|-- Game/              # pause, respawn, play-area bounds
|-- Configs/           # Earth + trainer handling (default setup)
\\-- Models/            # the trainer and the Nimbus`,

  // Early playtest demos, shown on /fly-by-mouse as proof of concept. The aircraft and
  // scenes in them are not part of the shipped package; the captions say so.
  shotsNote: "Proof of concept from an early playtest. None of this is in the final product.",
  shots: [
    {
      src: "/previews/fly-by-mouse-formation.png",
      title: "Playtest demo: formation",
      alt: "Four low-poly jets in formation over a flat ground plane, seen from behind, with a crosshair at the centre of the view.",
    },
    {
      src: "/previews/fly-by-mouse-propeller.png",
      title: "Playtest demo: propeller aircraft",
      alt: "A bright magenta propeller aircraft seen from behind over a flat ground plane, with scattered orange cubes in the air.",
    },
    {
      src: "/previews/fly-by-mouse-side.png",
      title: "Playtest demo: side view",
      alt: "A dark low-poly jet with a blue tail fin seen from the side against a pale sky with scattered orange cubes.",
    },
    {
      src: "/previews/fly-by-mouse-chase.png",
      title: "Playtest demo: chase camera",
      alt: "A low-poly jet with red tail fins seen from directly behind against a pale sky, with a crosshair above it.",
    },
    {
      src: "/previews/fly-by-mouse-space-hud.png",
      title: "Playtest demo: space and HUD",
      alt: "A magenta propeller aircraft seen from behind in a starfield, with speed, throttle, altitude and G readouts in the corners.",
    },
    {
      src: "/previews/fly-by-mouse-banking.png",
      title: "Playtest demo: banking",
      alt: "A magenta propeller aircraft banking steeply in a starfield above a flat ground plane.",
    },
  ],

  // The home card, in the same Concept / Utility / ... shape as the other projects.
  sections: [
    {
      title: "Concept",
      content:
        "A mouse-aim flight controller for Unity. The mouse never touches the control surfaces: it moves an aim point, and an autopilot — the instructor — flies the aircraft to it. The camera follows the aim, not the aircraft, so it stays calm while the aircraft works hard. Inspired by War Thunder-style mouse aim.",
    },
    {
      title: "Utility",
      content:
        "Gives Unity developers the flight feel plus the scaffolding to hang their own aircraft on it: data-driven airframes, a plane mode and a spaceship mode, configurable worlds, guns, a HUD, a basic enemy AI, pause and respawn. You get the pieces; the game is yours.",
    },
    {
      title: "Development",
      content:
        "C# on Unity 6.3 with URP and the Input System. Five assembly definitions (Runtime, HUD, Combat, AI, Game). Airframe, handling and environment are three separate ScriptableObjects, so one aircraft can fly very differently in different worlds.",
    },
    {
      title: "Structure",
      list: [
        ["Runtime/", "flight core, aim rig, input, config types, FlightRig.prefab"],
        ["Combat/", "gun, health, crash death, tracers, impacts, explosions"],
        ["HUD/ · AI/ · Game/", "flight HUD, basic enemy AI, pause / respawn / play bounds"],
        ["Documentation/", "12 docs plus START_HERE.md, shipped inside the package"],
      ],
    },
    {
      title: "Testing",
      column: "side",
      content:
        "Built against 166 automated tests that fly the real rig with simulated keyboard and mouse input, plus a packaging audit that checks every asset reference points at a file that ships. A tooltip sits on every serialized field.",
    },
    {
      title: "Release",
      column: "side",
      content:
        "Pre-launch. Being prepared for the Unity Asset Store as a single paid package, published by DataFright. The store link will be added here when it is live.",
    },
  ],

  // The six panels on /fly-by-mouse, in the same shape as the home methodology cards.
  features: [
    {
      title: "Mouse-aim flight",
      items: [
        "You move an aim point; an autopilot (the instructor) flies the aircraft to it.",
        "It banks to turn, protects the airframe from over-stressing itself, and coordinates its own rudder.",
        "The camera follows the aim, not the aircraft.",
      ],
    },
    {
      title: "Data-driven aircraft",
      items: [
        "Three assets per aircraft: what it is (AirframeConfig), how it is flown (HandlingConfig), where it is (EnvironmentProfile).",
        "Change one without touching the others.",
        "The G limit sets turn rate — give aircraft different handling to make them turn differently.",
      ],
    },
    {
      title: "Plane and spaceship",
      items: [
        "Aerodynamic mode flies like an aircraft; Thruster mode like a spaceship — same controls, same autopilot.",
        "The world decides which: gravity and air density are parameters.",
        "Earth ships configured; the Moon, Mars, thin air and space are one small asset each, and documented.",
      ],
    },
    {
      title: "Combat and HUD",
      items: [
        "Guns, health, crash death, tracers, impact flashes and explosions.",
        "A flight HUD with every readout documented — restyle it or replace it.",
        "A tooltip on every serialized field.",
      ],
    },
    {
      title: "Game loop and AI",
      items: [
        "Pause, death, respawn and play-area bounds, each replaceable with your own rules.",
        "A deliberately basic enemy AI that flies and fights, with squadron turn-taking.",
        "Anything that can name a point can fly an aircraft.",
      ],
    },
    {
      title: "Built to extend",
      items: [
        "Five assembly definitions: Runtime, HUD, Combat, AI and Game.",
        "Twelve docs and a master START_HERE page ship inside the package.",
        "Drag in FlightRig.prefab and press Play.",
      ],
    },
  ],

  flyInFive: [
    "Unity 6.3, URP and the Input System package, with Active Input Handling set to Input System Package (New) or Both.",
    "Delete the scene's own Main Camera — the rig brings its own.",
    "Drag Runtime/Prefabs/FlightRig.prefab into the scene.",
    "Press Play, click in the Game view, move the mouse. Esc pauses.",
  ],

  notInTheBox:
    "A scene, a ground, an enemy prefab, a space world, other planets. There is no take-off or landing — the ground is something you crash into. The package cannot bring the Ground tag with it, so you create it and tag your own ground.",

  // First-flight troubleshooting, from Documentation/01_FLIGHT_RIG.md §6.
  firstFlightFixes: [
    ["Mouse does nothing", "Click the Game view to give it focus, or set the Input System as the active input handler."],
    ["Console: There are 2 audio listeners in the scene", "The scene's own camera is still there — delete it; the rig brings its own."],
    ["The aircraft drops like a stone at Play", "initialSpeed is 0 on your copy of the rig; the shipped rig starts at 134 m/s."],
    ["It immediately turns round after Play", "You rotated the aircraft instead of the rig root."],
    ["Flying into the ground does nothing (Tag: Ground is not defined.)", "The Ground tag is missing, or not assigned to your ground."],
    ["No cursor and no way out in the editor", "Press Esc — it pauses and unlocks the cursor."],
  ],
}
