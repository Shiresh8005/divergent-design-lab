-- Seed daily challenges (run after migration)
INSERT INTO daily_challenges (title, description, prompt_text, category, difficulty, xp_reward, time_limit_minutes, challenge_date)
VALUES
  (
    'Ergonomic Kitchen Tool',
    'Design a hand-held kitchen tool that solves a real ergonomic problem. Focus on grip, proportion, and user flow.',
    'Sketch an ergonomic kitchen tool for elderly users. Show front view, side profile, and one detail of the grip mechanism. Annotate 3 design decisions.',
    'UCEED Part B', 'medium', 50, 45, CURRENT_DATE
  ),
  (
    'Memory in Object Form',
    'Transform an abstract memory into a tangible product concept. NID loves narrative + form exploration.',
    'Design an object that represents ''the last conversation with someone you miss''. Show exploratory sketches, final concept, and material choice.',
    'NID DAT Mains', 'hard', 75, 60, CURRENT_DATE
  ),
  (
    'Modular Storage Unit',
    'NIFT Situation Test classic — build a modular storage solution with limited materials mindset.',
    'Design a modular storage unit using only planes and cylinders. Show isometric view, exploded diagram, and scale reference with a human figure.',
    'NIFT Situation Test', 'medium', 50, 45, CURRENT_DATE
  ),
  (
    'Sustainable Packaging Redesign',
    'Reimagine everyday product packaging with sustainability at the core. CEED values systems thinking.',
    'Redesign packaging for a local snack brand. Show before/after, material breakdown, and user unboxing sequence in 4 panels.',
    'CEED', 'medium', 50, 50, CURRENT_DATE
  ),
  (
    'Urban Micro-Mobility Hub',
    'Design a street-level micro-mobility hub for Indian cities. M.Des level spatial + service thinking.',
    'Design a micro-mobility hub for a 3m × 4m sidewalk plot. Include plan, section, and service flow diagram for e-scooter + cycle parking.',
    'NID M.Des', 'hard', 80, 60, CURRENT_DATE
  )
ON CONFLICT (challenge_date, category) DO NOTHING;
