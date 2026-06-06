import type { DailyChallenge } from "@/lib/types/database";
import { calibrateChallenge } from "@/lib/challenges/exam-difficulty";
import {
  getTodaysFeaturedChallenge,
  getTodaysChallenges,
  getTodaysChallengeIds,
  isTodaysChallenge,
} from "@/lib/challenges/daily-rotation";

const today = new Date().toISOString().split("T")[0];

/**
 * Full question text — official PYQ wording where available.
 * Each prompt_text is the complete paper students would read in the exam.
 */
const RAW_CHALLENGES: DailyChallenge[] = [
  {
    id: "uceed-2024-garage",
    title: "Garage Scene — Friend's Point of View",
    description:
      "UCEED 2024 Part B Q1. Full narrative perspective drawing from official paper.",
    prompt_text: `Q. 1 Drawing [50 Marks] — UCEED 2024 Part B
Time: 30 minutes · Medium: Pencil only · No colours

On a Sunday morning, 5-year-old Geet, her grandmother and father are cleaning their old garage. It is a big garage with large open windows near the ceiling. It has an old bicycle, a football and other objects. The father is cleaning the cobwebs. The grandmother while cleaning, finds her old guitar which she used to play during her college days. She gets excited and starts playing it as Geet starts dancing around. The garage also has a lot of old memories of Geet's sporty grandmother and her studious father. Geet's school friend stands at the door of the garage watching this whole scene.

Draw this scenario from the friend's point of view.

Note:
• Use only pencil
• Do not use colours

Evaluation Criteria:
• Perspective
• Proportion
• Composition
• Observation
• Imagination
• Quality of sketch
• Attention to detail`,
    category: "UCEED Part B",
    difficulty: "hard",
    xp_reward: 75,
    time_limit_minutes: 30,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "UCEED 2024 Part B",
    exam_marks: 50,
  },
  {
    id: "uceed-2024-lunchbox",
    title: "School Lunch Box — First Day",
    description:
      "UCEED 2024 Part B Q2. Product design for Indian school lunch context.",
    prompt_text: `Q. 2 Design Aptitude [50 Marks] — UCEED 2024 Part B
Time: 30 minutes · Sketch with labels

A six-year old girl is going to school for the first time. She needs to carry a lunch box in her school bag. Her lunch can contain typical Indian food items (both dry as well as liquid food items, such as Roti, Rice, Dosa, Dal, Sambar, etc.).

Design a lunch box for her, considering her needs. Sketch your design, and visually explain the features of your design along with labels.

Evaluation Criteria:
• Aptness for product usability by the user
• Quality of presentation
• Uniqueness of design
• Consideration of dry and liquid food separation
• Ease of opening for a 6-year-old`,
    category: "UCEED Part B",
    difficulty: "medium",
    xp_reward: 50,
    time_limit_minutes: 30,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "UCEED 2024 Part B",
    exam_marks: 50,
  },
  {
    id: "uceed-2025-railway",
    title: "Railway Platform — Holiday Departure",
    description:
      "UCEED 2025 Part B Q1. Scene creation from official question paper.",
    prompt_text: `Q. 1 Scene Creation / Perspective Drawing [50 Marks] — UCEED 2025 Part B
Time: 30 minutes · Pencil sketches only · Do not use colour

The competitive examinations are finally over and you are going on a holiday. You are at the nearest railway station with your family and relatives, waiting for the train that you can see, arriving. The platform is bustling with activity. Other travellers with luggage, vendors and porters (and whatever else you are likely to observe) are also on the platform.

Imagine and draw what you see, giving prominence to your family and relatives.

Note:
• Make pencil sketches only
• Do not use colour
• Show depth, human scale, and platform activity
• Family/relatives must be the visual focus of the composition`,
    category: "UCEED Part B",
    difficulty: "hard",
    xp_reward: 75,
    time_limit_minutes: 30,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "UCEED 2025 Part B",
    exam_marks: 50,
  },
  {
    id: "uceed-2025-portable-seat",
    title: "Portable Seating — Museum / Zoo",
    description:
      "UCEED 2025 Part B Q2. Two-state product design from official paper.",
    prompt_text: `Q. 2 Design Aptitude [50 Marks] — UCEED 2025 Part B
Time: 30 minutes · Label materials and mechanism

A visit to a museum or a zoo is always something we look forward to with much excitement. But such visits are very tiring too; after about an hour or so we look for a place to sit – a chair or bench, that is never nearby. What if we could carry our own chair everywhere?

Design a portable seating device that you could carry in your backpack or hand bag. It should be light enough to carry around, small enough to fit into your bag, easy to use, and good to look at.

Show the seating device when:
1) It has just been taken out of the bag
2) It is ready to sit on

Evaluation Criteria:
• Portability and pack size
• Ease of deployment (how user opens it)
• Structural stability when in use
• Aesthetic quality
• Clarity of labels and materials`,
    category: "UCEED Part B",
    difficulty: "medium",
    xp_reward: 50,
    time_limit_minutes: 30,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "UCEED 2025 Part B",
    exam_marks: 50,
  },
  {
    id: "uceed-kitchen-perspective",
    title: "Kitchen Interior — 5½ ft Eye Level",
    description:
      "UCEED PYQ perspective interior. All listed objects mandatory.",
    prompt_text: `Q. Perspective Drawing [50 Marks] — UCEED Previous Year Pattern
Time: 40 minutes · Freehand · One-point or two-point perspective

Draw a perspective view of a kitchen interior with a stove, kitchen utensils (such as pressure cooker, cooking pans, saucepans, etc.), dining utensils (such as ceramic plates, cups, glasses, etc.), a washbasin, storage racks with stored cooking ingredients (such as spices in small plastic bottles), fresh-cut vegetables kept beside the stove and at least two kitchen gadgets.

Make a freehand perspective drawing of this setup showing all the elements listed above as seen from the point of view of a 5½ feet tall person standing in the kitchen.

Note:
• All listed items must be visible and identifiable
• Show floor plane and eye-level consistency
• Pencil only unless colour is specified in your practice sheet`,
    category: "UCEED Part B",
    difficulty: "hard",
    xp_reward: 75,
    time_limit_minutes: 40,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "UCEED PYQ",
    exam_marks: 50,
  },
  {
    id: "nid-doodle-frames",
    title: "12-Frame Doodle Completion",
    description:
      "NID Studio Test 2025. Complete provided frames with captions.",
    prompt_text: `Doodle Drawing — NID Studio Test 2025 (Section pattern)
Time: 45 minutes

Students are provided a sheet with 12 frames arranged in a grid. Each frame contains random abstract squiggle lines (incomplete curves and strokes) printed on the paper.

Complete each frame into a meaningful visual illustration. Write a one-line caption below every frame explaining the idea — not a description of the line.

Rules:
• All 12 frames must be attempted
• Each frame must communicate a different concept
• Captions must explain the idea, not describe the squiggle
• Keep drawings readable at small frame size
• No digital work — hand-done only`,
    category: "NID DAT Mains",
    difficulty: "medium",
    xp_reward: 50,
    time_limit_minutes: 45,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "NID Studio 2025",
    exam_marks: 50,
  },
  {
    id: "nid-bird-feeder",
    title: "Bird Feeding Nest — Material Handling",
    description:
      "NID Studio Test PYQ. Use only materials provided in the hall.",
    prompt_text: `Material Handling — NID Studio Test (Previous Year)
Time: 45 minutes · No extra materials allowed

You are provided with a PVC pipe, aluminium wire, thread, newspaper, and rubber bands.

Design a bird feeding nest using only these materials.

Submit:
• Photograph or sketch of the final model
• Written explanation (4 lines minimum) covering how birds access feed, which material serves which function, one key structural decision, and how the nest handles rain

Evaluation:
• Creative use of limited materials
• Structural stability
• Clarity of concept
• Craft quality`,
    category: "NID DAT Mains",
    difficulty: "hard",
    xp_reward: 75,
    time_limit_minutes: 45,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "NID Studio PYQ",
    exam_marks: 50,
  },
  {
    id: "nid-cup-holder-route",
    title: "Cup Route A → B → C",
    description:
      "NID Studio Test PYQ. No adhesive — straws, cups, nylon thread only.",
    prompt_text: `Material Handling — NID Studio Test (Previous Year)
Time: 40 minutes

You will have to make a holder which can hold 3 cups at a time in a manner that it starts from point A to B to C.

Materials provided:
• 3 Plastic Cups
• 10 straws that can bend
• Transparent Nylon Thread

Constraint: No adhesive to be used.

Also explain your creation in 4 lines describing the load path from A to B to C and how joints are made without glue.

Submit: photograph of model + written explanation`,
    category: "NID DAT Mains",
    difficulty: "medium",
    xp_reward: 50,
    time_limit_minutes: 40,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "NID Studio PYQ",
    exam_marks: 40,
  },
  {
    id: "nid-rainwater-storyboard",
    title: "Rainwater Journey — 4 Frames",
    description:
      "NID B.Des Studio Test 2026 sample. Sequential storyboard format.",
    prompt_text: `Storyboard Drawing — NID B.Des Studio Test 2026 (Sample)
Time: 30 minutes · 4 frames mandatory

Draw 4 frames showing the journey of rainwater from clouds to rivers.

Illustrate clearly in sequence:
1) Evaporation from water bodies
2) Condensation and cloud formation
3) Precipitation (rain)
4) Collection of water in rivers/lakes

Add minimal labels on each frame. Evaluation focuses on sequence logic and clarity of communication — not decorative rendering.`,
    category: "NID DAT Mains",
    difficulty: "medium",
    xp_reward: 50,
    time_limit_minutes: 30,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "NID Studio 2026",
    exam_marks: 40,
  },
  {
    id: "nift-seed-bank-kiosk",
    title: "Community Seed Bank Kiosk",
    description:
      "NIFT Situation Test. Model + written explanation. Exam-hall materials only.",
    prompt_text: `Situation Test — NIFT Bachelor of Design (Situation Test Pattern)
Time: 50 minutes · 100 marks total for situation test

Design a modular community seed bank kiosk for a neighbourhood park that allows residents to store and exchange seeds.

Materials allowed (exam hall only — no other material):
• Cardboard / ivory board
• Wire
• OHP sheet
• Thread

Your 3D model must demonstrate:
• Modular construction (multiple interlocking units, not one solid block)
• Transparent seed display using OHP sheet as glass/vial windows
• Wire elements for structure or detail
• One abstract human figure (wire or paper) for scale

Also write a short explanation (5 lines) on how you manipulated materials — scoring, folding, peeling corrugated layers, etc.

Photograph model against plain background for submission.`,
    category: "NIFT Situation Test",
    difficulty: "hard",
    xp_reward: 75,
    time_limit_minutes: 50,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "NIFT Situation Test",
    exam_marks: 100,
  },
  {
    id: "nift-street-food-hub",
    title: "Foldable Street Food Hub",
    description:
      "NIFT Situation Test. Futuristic vendor unit — open state with fold logic visible.",
    prompt_text: `Situation Test — NIFT Bachelor of Design (Situation Test Pattern)
Time: 50 minutes

Design a futuristic foldable street food hub for crowded Indian urban streets. The unit must be transportable when folded and operational when open.

Materials allowed (exam hall only):
• Corrugated cardboard
• Wire
• Mount board
• Thread

Build the model in its operational (open) state. The jury must be able to see how it would fold — show hinges, score lines, or crease logic on cardboard.

Requirements:
• Stable base that does not tip
• Scored/curved cardboard surfaces — avoid flat untreated walls
• Wire frame or canopy element
• Abstract human figure for scale and ergonomics
• Clean joints — trim glue strings, neat folds

Evaluation Criteria:
• Material handling (30%)
• Brief interpretation
• Craftsmanship
• Structural stability`,
    category: "NIFT Situation Test",
    difficulty: "hard",
    xp_reward: 75,
    time_limit_minutes: 50,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "NIFT Situation Test",
    exam_marks: 100,
  },
  {
    id: "ceed-fox-pov-bear",
    title: "Forest Chase — Fox's Point of View",
    description:
      "CEED Part B PYQ. Narrative POV sketch — clarity over finish.",
    prompt_text: `Q. 1 Sketching [Part B] — CEED Previous Year Question Paper
Time: 30 minutes · Pencil · Clear readable composition

Two kids, Kaa and Kii, are on an adventure trip in a forest. While exploring, suddenly a bear emerges and starts chasing them. The kids start running in panic through the forest. A fox is watching the whole scene.

Sketch this scene from the fox's point of view. The sketch should be clear and visible.

Note:
• Maintain consistent POV — we see what the fox sees
• Show action and spatial depth
• Human figures and bear must read at exam viewing distance`,
    category: "CEED",
    difficulty: "hard",
    xp_reward: 75,
    time_limit_minutes: 30,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "CEED PYQ",
    exam_marks: 50,
  },
  {
    id: "ceed-sphere-chair",
    title: "Sphere-Inspired Single Seater",
    description:
      "CEED Part B PYQ. Form exploration into furniture.",
    prompt_text: `Q. 2 Design Problem [Part B] — CEED Previous Year Question Paper
Time: 40 minutes

Inspired from the given three-dimensional form (a solid sphere with one segment removed — like a thick bowl or crescent volume), conceptualise, sketch and render a single-seater furniture for a living room.

Your sheet must show:
• The reference form (small) and your derived furniture concept
• Consistency with the visual language of the original form
• Front or 3/4 view with material/texture indication
• One detail (joinery, upholstery, or edge treatment)
• Relevant product details an examiner would need to understand the design

Evaluation:
• Form-function relationship
• Rendering quality
• Creativity
• Clarity of communication`,
    category: "CEED",
    difficulty: "medium",
    xp_reward: 50,
    time_limit_minutes: 40,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "CEED PYQ",
    exam_marks: 50,
  },
  {
    id: "ceed-toothbrush-pain",
    title: "Toothbrush Usability — Pain Points",
    description:
      "CEED 2020 Part B style. Partial anatomy OK — show problems clearly.",
    prompt_text: `Q. User-Centred Sketching — CEED 2020 Part B (Adapted)
Time: 30 minutes

A person is using a standard manual toothbrush. Identify and visually communicate pain points during the brushing process.

Sketch and annotate these five problem areas:
1) Sharp pain at the palm surface where the toothbrush tail end is pressed hard
2) Uncomfortable grip and slip at the mid-level while brushing
3) Pain and rubbing of the brush back on the gums during front and back brushing action
4) Difficulty reaching the backmost teeth — discomfort from opening mouth wide
5) Difficulty stretching the mouth wide when cleaning front-side teeth

Note:
• Do not draw a complete person or complete hand — show only parts needed to express each problem
• Rough clarity is acceptable; highlight the problem zones
• Examiners score problem identification, not illustration beauty`,
    category: "CEED",
    difficulty: "medium",
    xp_reward: 50,
    time_limit_minutes: 30,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "CEED 2020 Part B",
    exam_marks: 50,
  },
  {
    id: "ceed-elderly-travel",
    title: "Srinagar → Chennai — How Can We",
    description:
      "CEED 2026 Part B. Problem statements before solutions.",
    prompt_text: `Q. Design Problem Solving — CEED 2026 Part B (Memory-based)
Time: 50 minutes

An elderly couple must travel from Srinagar to Chennai for medical treatment. They are not familiar with airports, long-distance travel, or navigating medical appointments in an unfamiliar city.

Step 1: Identify and write four distinct "How Can We…" problem statements related to their journey (travel, health, information, comfort, etc.).

Step 2: Select one problem from Step 1. Sketch two different solution concepts for that problem. Add short annotations explaining how each solution helps.

Evaluation Criteria:
• Empathy and problem identification
• Diversity of "How Can We" statements
• Feasibility of solutions
• Clarity of sketches and annotations
• Not judged on rendering perfection`,
    category: "CEED",
    difficulty: "hard",
    xp_reward: 75,
    time_limit_minutes: 50,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "CEED 2026 Part B",
    exam_marks: 50,
  },
  {
    id: "nid-mdes-footpath-vendor",
    title: "School Gate Footpath — 2m Wide",
    description:
      "NID M.Des studio spatial problem. Plan, section, process required.",
    prompt_text: `Spatial Intervention — NID M.Des Studio Test
Time: 60 minutes · One A1/A2 sheet mindset

Redesign the footpath vending zone outside a school gate. The available plot width is 2 metres. Peak-hour congestion involves students, parents, vendors, and through-traffic.

Submit on one sheet:
1) Site context sketch with arrows showing pedestrian and vendor flow
2) Plan drawing at 1:50 scale
3) Section drawing at 1:50 scale
4) Two process iterations (rough thumbnail → resolved concept)
5) Written note (6 lines): stakeholders affected, one trade-off you accepted, and why

Evaluation:
• Spatial thinking over decoration
• Scale and dimension clarity
• Evidence of design process
• Stakeholder awareness`,
    category: "NID M.Des",
    difficulty: "hard",
    xp_reward: 80,
    time_limit_minutes: 60,
    challenge_date: today,
    is_active: true,
    created_at: new Date().toISOString(),
    exam_source: "NID M.Des Studio",
    exam_marks: 100,
  },
];

/** Exam-calibrated pool — difficulty & XP set per entrance exam tier */
export const SEED_CHALLENGES: DailyChallenge[] =
  RAW_CHALLENGES.map(calibrateChallenge);

export function getChallengeById(id: string): DailyChallenge | undefined {
  return SEED_CHALLENGES.find((c) => c.id === id);
}

/** Dashboard featured mock — rotates exam track daily */
export function getTodaysChallenge(): DailyChallenge {
  return getTodaysFeaturedChallenge(SEED_CHALLENGES);
}

export {
  getTodaysChallenges,
  getTodaysFeaturedChallenge,
  getTodaysChallengeIds,
  isTodaysChallenge,
};

export { getTodayDateString } from "@/lib/challenges/daily-rotation";
