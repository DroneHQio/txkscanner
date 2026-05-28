import { db } from './database';
import { erg_materials, erg_distances, checklist_templates } from './schema';

const ERG_DATA = [
  {
    un_number: 'UN1005', name: 'Ammonia, anhydrous', erg_guide: '125', placard_class: '2.3',
    potential_hazards: 'TOXIC; may be fatal if inhaled. Vapors are irritating and may cause burns to eyes, skin, and respiratory tract. Contact with gas or liquefied gas may cause burns, severe injury, or frostbite.',
    health_hazards: 'Toxic by inhalation. Causes severe irritation to eyes, skin, and mucous membranes. High concentrations can cause pulmonary edema and death. IDLH: 300 ppm.',
    fire_hazards: 'Flammable gas. Flammable range: 15% to 28% in air. Cylinders may BLEVE in fire. Vapor may travel to source of ignition and flash back.',
    public_safety: 'CALL Emergency Response Telephone Number. Isolate spill or leak area immediately. Stay upwind. Many gases are heavier than air and will spread along ground.',
    protective_clothing: 'Wear positive pressure SCBA. Wear chemical protective clothing recommended by the manufacturer.',
    evacuation_guidance: 'Large Spill: Consider initial downwind evacuation for at least 800 meters (1/2 mile). Fire: ISOLATE for 1600 meters in all directions.',
    fire_response: 'Do not extinguish the fire unless the flow can be stopped. Use water spray or fog; do not use straight streams.',
    spill_guidance: 'ELIMINATE all ignition sources. Stop leak if without risk. Do not direct water at spill. Use water spray to reduce vapors. Prevent entry into waterways, sewers, basements.',
    first_aid: 'Move victim to fresh air. Call 911. Give artificial respiration if not breathing. Administer oxygen if breathing is difficult. Flush skin and eyes with water for at least 20 minutes.',
    has_distance_data: true,
    distances: [
      { spill_size: 'small', day_night: 'day', initial_isolation_meters: 30, protective_action_meters: 200 },
      { spill_size: 'small', day_night: 'night', initial_isolation_meters: 30, protective_action_meters: 300 },
      { spill_size: 'large', day_night: 'day', initial_isolation_meters: 95, protective_action_meters: 800 },
      { spill_size: 'large', day_night: 'night', initial_isolation_meters: 150, protective_action_meters: 1900 },
    ],
  },
  {
    un_number: 'UN1017', name: 'Chlorine', erg_guide: '124', placard_class: '2.3',
    potential_hazards: 'TOXIC; may be fatal if inhaled. Vapors are heavier than air. Contact may cause severe burns. Toxic fumes may accumulate in low areas.',
    health_hazards: 'Extremely toxic. IDLH: 10 ppm. Causes severe respiratory tract irritation, pulmonary edema, and death at high concentrations.',
    fire_hazards: 'Non-flammable gas. Strong oxidizer; reacts with many materials. Cylinders may BLEVE in fire.',
    public_safety: 'CALL Emergency Response Telephone Number. Isolate spill or leak area immediately. Stay upwind. Ventilate closed spaces before entering.',
    protective_clothing: 'Wear positive pressure SCBA. Wear chemical protective clothing recommended by the manufacturer.',
    evacuation_guidance: 'Large Spill: Consider initial downwind evacuation for at least 800 meters. Fire: ISOLATE for 1600 meters in all directions.',
    fire_response: 'Do not extinguish the fire unless the flow can be stopped. Use water spray or fog. Move containers from fire area if without risk.',
    spill_guidance: 'Do not touch or walk through spilled material. Stop leak if without risk. Use water spray to reduce vapors. Prevent entry into waterways, sewers.',
    first_aid: 'Move victim to fresh air. Call 911. Give artificial respiration if not breathing. Administer oxygen. Flush skin and eyes with water for at least 20 minutes.',
    has_distance_data: true,
    distances: [
      { spill_size: 'small', day_night: 'day', initial_isolation_meters: 60, protective_action_meters: 400 },
      { spill_size: 'small', day_night: 'night', initial_isolation_meters: 60, protective_action_meters: 1100 },
      { spill_size: 'large', day_night: 'day', initial_isolation_meters: 400, protective_action_meters: 3500 },
      { spill_size: 'large', day_night: 'night', initial_isolation_meters: 400, protective_action_meters: 11000 },
    ],
  },
  {
    un_number: 'UN1203', name: 'Gasoline', erg_guide: '128', placard_class: '3',
    potential_hazards: 'FLAMMABLE; may be ignited by heat, sparks or flames. Vapors may travel to source of ignition and flash back. Vapors heavier than air.',
    health_hazards: 'Vapors may cause dizziness or asphyxiation. Contact may irritate or burn skin and eyes. Fire may produce irritating, corrosive, or toxic gases.',
    fire_hazards: 'Highly flammable liquid and vapor. Flash point: -43°C (-45°F). Flammable range: 1.4% to 7.6%.',
    public_safety: 'CALL Emergency Response Telephone Number. Isolate spill area for at least 50 meters in all directions. Keep unauthorized personnel away. Stay upwind.',
    protective_clothing: 'Wear positive pressure SCBA. Structural firefighters protective clothing will only provide limited protection.',
    evacuation_guidance: 'Large Spill: Consider initial downwind evacuation for at least 300 meters. Fire: Isolate for 800 meters if tank or rail car involved.',
    fire_response: 'Small fires: Dry chemical, CO2, water spray or regular foam. Large fires: Water spray, fog or regular foam. Move containers from fire area if without risk.',
    spill_guidance: 'ELIMINATE all ignition sources. Do not touch or walk through spilled material. Prevent entry into waterways, sewers, basements.',
    first_aid: 'Move victim to fresh air. Call 911. If not breathing, give artificial respiration. Remove contaminated clothing. Flush skin and eyes with water for at least 20 minutes.',
    has_distance_data: false,
    distances: [],
  },
  {
    un_number: 'UN1075', name: 'Liquefied petroleum gas', erg_guide: '115', placard_class: '2.1',
    potential_hazards: 'FLAMMABLE; may be ignited by heat, sparks or flames. Vapors are heavier than air. Cylinders exposed to fire may vent through pressure relief devices. Containers may explode when heated.',
    health_hazards: 'Vapors may cause dizziness or asphyxiation without warning. Contact with liquefied gas may cause burns or frostbite.',
    fire_hazards: 'Extremely flammable gas. May form explosive mixtures with air. Cylinders may BLEVE when exposed to fire.',
    public_safety: 'CALL Emergency Response Telephone Number. Isolate spill or leak area immediately. Keep unauthorized personnel away. Stay upwind.',
    protective_clothing: 'Wear positive pressure SCBA. Structural firefighters protective clothing will only provide limited protection.',
    evacuation_guidance: 'Large Spill: Consider initial downwind evacuation for at least 500 meters. Fire: ISOLATE for 1600 meters in all directions.',
    fire_response: 'Do not extinguish the fire unless the flow can be stopped. Cool exposed containers with water. Risk of BLEVE — withdraw from area.',
    spill_guidance: 'ELIMINATE all ignition sources. Stop leak if without risk. Use water spray to reduce vapors. Prevent entry into confined areas.',
    first_aid: 'Move victim to fresh air. Call 911. Give artificial respiration if not breathing. In case of frostbite, thaw with lukewarm water.',
    has_distance_data: false,
    distances: [],
  },
  {
    un_number: 'UN1978', name: 'Propane', erg_guide: '115', placard_class: '2.1',
    potential_hazards: 'FLAMMABLE; may be ignited by heat, sparks or flames. Vapors heavier than air. Cylinders exposed to fire may BLEVE.',
    health_hazards: 'Vapors may cause dizziness or asphyxiation without warning. Contact with liquefied propane may cause frostbite. Non-toxic but asphyxiant in high concentrations.',
    fire_hazards: 'Extremely flammable gas. Flash point: -104°C. Flammable range: 2.1% to 9.5%. Cylinders may BLEVE when exposed to fire.',
    public_safety: 'CALL Emergency Response Telephone Number. Isolate spill or leak area immediately. Keep unauthorized personnel away. Stay upwind.',
    protective_clothing: 'Wear positive pressure SCBA. Structural firefighters protective clothing will only provide limited protection.',
    evacuation_guidance: 'Large Spill: Consider initial downwind evacuation for at least 500 meters. Fire: ISOLATE for 1600 meters in all directions.',
    fire_response: 'Do not extinguish the fire unless the flow can be stopped. Cool exposed containers with water. Move containers from fire area if without risk.',
    spill_guidance: 'ELIMINATE all ignition sources. Stop leak if without risk. Use water spray to reduce vapors. Prevent entry into confined areas.',
    first_aid: 'Move victim to fresh air. Call 911. Give artificial respiration if not breathing. In case of frostbite from liquid propane, thaw with lukewarm water.',
    has_distance_data: false,
    distances: [],
  },
  {
    un_number: 'UN1824', name: 'Sodium hydroxide solution', erg_guide: '154', placard_class: '8',
    potential_hazards: 'CORROSIVE. Contact with metals may evolve flammable hydrogen gas. Contact may cause burns to skin, eyes, and mucous membranes.',
    health_hazards: 'Corrosive. Causes severe burns to skin, eyes, and respiratory tract. Eye contact may cause permanent damage or blindness.',
    fire_hazards: 'Non-flammable. Contact with metals (aluminum, tin, zinc) may generate flammable hydrogen gas.',
    public_safety: 'CALL Emergency Response Telephone Number. Isolate spill or leak area for at least 50 meters. Keep unauthorized personnel away. Stay upwind.',
    protective_clothing: 'Wear positive pressure SCBA. Wear chemical protective clothing. Rubber gloves and boots recommended.',
    evacuation_guidance: 'Large Spill: Consider initial downwind evacuation for at least 100 meters.',
    fire_response: 'Use water spray, dry chemical, or foam. Move containers from fire area if without risk. Dike fire control water for later disposal.',
    spill_guidance: 'Do not touch or walk through spilled material. Stop leak if without risk. Prevent entry into waterways, sewers, basements. Absorb with dry earth or sand.',
    first_aid: 'Move victim to fresh air. Call 911. Remove contaminated clothing. Flush skin and eyes with large amounts of water for at least 20 minutes.',
    has_distance_data: false,
    distances: [],
  },
  {
    un_number: 'UN1789', name: 'Hydrochloric acid', erg_guide: '157', placard_class: '8',
    potential_hazards: 'CORROSIVE. Toxic by inhalation. Vapors heavier than air. Contact may cause severe burns to skin and eyes. Reacts violently with alkalis and some metals.',
    health_hazards: 'Corrosive and toxic. Causes severe burns. Inhalation can cause pulmonary edema. IDLH: 50 ppm.',
    fire_hazards: 'Non-flammable but reacts with metals to produce flammable hydrogen gas. Corrosive to most metals.',
    public_safety: 'CALL Emergency Response Telephone Number. Isolate spill or leak area for at least 50 meters. Keep unauthorized personnel away. Stay upwind.',
    protective_clothing: 'Wear positive pressure SCBA. Wear chemical protective clothing resistant to acids.',
    evacuation_guidance: 'Large Spill: Consider initial downwind evacuation for at least 300 meters.',
    fire_response: 'Use water spray, dry chemical, CO2, or foam. Move containers from fire area if without risk.',
    spill_guidance: 'Do not touch or walk through spilled material. Stop leak if without risk. Use water spray to reduce vapors. Prevent entry into waterways.',
    first_aid: 'Move victim to fresh air. Call 911. Remove contaminated clothing. Flush skin and eyes with large amounts of water for at least 20 minutes.',
    has_distance_data: false,
    distances: [],
  },
  {
    un_number: 'UN1993', name: 'Flammable liquids, n.o.s.', erg_guide: '128', placard_class: '3',
    potential_hazards: 'FLAMMABLE; may be ignited by heat, sparks or flames. Vapors may travel to source of ignition and flash back. Vapors heavier than air.',
    health_hazards: 'Vapors may cause dizziness or asphyxiation. Contact may irritate or burn skin and eyes. Specific hazards depend on the actual material.',
    fire_hazards: 'Flammable liquid and vapor. Flash point and flammable range depend on specific material.',
    public_safety: 'CALL Emergency Response Telephone Number. Isolate spill area for at least 50 meters. Keep unauthorized personnel away. Stay upwind. Identify specific material if possible.',
    protective_clothing: 'Wear positive pressure SCBA. Structural firefighters protective clothing will only provide limited protection.',
    evacuation_guidance: 'Large Spill: Consider initial downwind evacuation for at least 300 meters. Identify specific material for more precise guidance.',
    fire_response: 'Small fires: Dry chemical, CO2, water spray or regular foam. Large fires: Water spray, fog or regular foam. Do not use straight streams.',
    spill_guidance: 'ELIMINATE all ignition sources. Do not touch or walk through spilled material. Prevent entry into waterways, sewers, or confined areas.',
    first_aid: 'Move victim to fresh air. Call 911. If not breathing, give artificial respiration. Remove contaminated clothing. Flush skin and eyes with running water for at least 20 minutes.',
    has_distance_data: false,
    distances: [],
  },
];

const CHECKLIST_TEMPLATES = [
  { section: 'Initial Arrival', item_text: 'Stop at safe distance — do not rush in', sort_order: 1 },
  { section: 'Initial Arrival', item_text: 'Approach uphill, upwind, and upstream', sort_order: 2 },
  { section: 'Initial Arrival', item_text: 'Avoid vapor cloud or visible mist', sort_order: 3 },
  { section: 'Initial Arrival', item_text: 'Put on appropriate PPE before exiting apparatus', sort_order: 4 },
  { section: 'Scene Size-Up', item_text: 'Identify container type and shape from safe distance', sort_order: 5 },
  { section: 'Scene Size-Up', item_text: 'Look for placards, UN number, or markings', sort_order: 6 },
  { section: 'Scene Size-Up', item_text: 'Assess release type (vapor, liquid, gas, fire)', sort_order: 7 },
  { section: 'Scene Size-Up', item_text: 'Note wind direction and speed', sort_order: 8 },
  { section: 'Scene Size-Up', item_text: 'Identify victims or persons in hazard zone', sort_order: 9 },
  { section: 'Product Identification', item_text: 'Obtain UN/NA number or placard class', sort_order: 10 },
  { section: 'Product Identification', item_text: 'Consult ERG guide for identified material', sort_order: 11 },
  { section: 'Product Identification', item_text: 'Request shipping papers from driver/conductor', sort_order: 12 },
  { section: 'Product Identification', item_text: 'Request SDS from facility if applicable', sort_order: 13 },
  { section: 'Product Identification', item_text: 'Contact CHEMTREC if product unknown: 1-800-424-9300', sort_order: 14 },
  { section: 'Isolation', item_text: 'Establish initial isolation distance per ERG', sort_order: 15 },
  { section: 'Isolation', item_text: 'Deny entry to isolation zone', sort_order: 16 },
  { section: 'Isolation', item_text: 'Request law enforcement for perimeter control', sort_order: 17 },
  { section: 'Isolation', item_text: 'Begin evacuating people from isolation zone', sort_order: 18 },
  { section: 'Command', item_text: 'Establish Incident Command', sort_order: 19 },
  { section: 'Command', item_text: 'Establish command post at safe location (upwind)', sort_order: 20 },
  { section: 'Command', item_text: 'Designate staging area', sort_order: 21 },
  { section: 'Command', item_text: 'Begin incident log / documentation', sort_order: 22 },
  { section: 'Notifications', item_text: 'Notify dispatch of hazmat incident', sort_order: 23 },
  { section: 'Notifications', item_text: 'Request HazMat team', sort_order: 24 },
  { section: 'Notifications', item_text: 'Request EMS', sort_order: 25 },
  { section: 'Notifications', item_text: 'Request law enforcement', sort_order: 26 },
  { section: 'Notifications', item_text: 'Notify emergency management / EOC if warranted', sort_order: 27 },
  { section: 'Notifications', item_text: 'Contact pipeline/railroad emergency number if applicable', sort_order: 28 },
  { section: 'Evacuation/Shelter', item_text: 'Determine evacuation vs shelter-in-place', sort_order: 29 },
  { section: 'Evacuation/Shelter', item_text: 'Determine protective action distance per ERG', sort_order: 30 },
  { section: 'Evacuation/Shelter', item_text: 'Coordinate evacuation with law enforcement', sort_order: 31 },
  { section: 'Evacuation/Shelter', item_text: 'Notify schools/facilities in evacuation zone', sort_order: 32 },
  { section: 'Evacuation/Shelter', item_text: 'Consider public notification / emergency alert', sort_order: 33 },
  { section: 'Responder Safety', item_text: 'Confirm PPE level appropriate for hazard', sort_order: 34 },
  { section: 'Responder Safety', item_text: 'Establish hot/warm/cold zone boundaries', sort_order: 35 },
  { section: 'Responder Safety', item_text: 'Account for all personnel entering hazard zone', sort_order: 36 },
  { section: 'Responder Safety', item_text: 'Track entry/exit times for all responders in hot zone', sort_order: 37 },
  { section: 'Decon', item_text: 'Establish decon corridor at warm/cold zone boundary', sort_order: 38 },
  { section: 'Decon', item_text: 'Assign personnel to decon operations', sort_order: 39 },
  { section: 'Decon', item_text: 'Confirm water supply for decon', sort_order: 40 },
  { section: 'Decon', item_text: 'Control and contain decon runoff', sort_order: 41 },
  { section: 'Exposure Tracking', item_text: 'Document all persons who may have been exposed', sort_order: 42 },
  { section: 'Exposure Tracking', item_text: 'Record symptoms for all exposed persons', sort_order: 43 },
  { section: 'Exposure Tracking', item_text: 'Arrange EMS evaluation for all exposed persons', sort_order: 44 },
  { section: 'Exposure Tracking', item_text: 'Transport to hospital if indicated', sort_order: 45 },
  { section: 'Environmental Concerns', item_text: 'Identify drainage and waterways near scene', sort_order: 46 },
  { section: 'Environmental Concerns', item_text: 'Contain spill from entering drains/waterways', sort_order: 47 },
  { section: 'Environmental Concerns', item_text: 'Notify state environmental agency if release to environment', sort_order: 48 },
  { section: 'Termination', item_text: 'Confirm product secured / leak stopped', sort_order: 49 },
  { section: 'Termination', item_text: 'Complete all documentation', sort_order: 50 },
  { section: 'Termination', item_text: 'Prepare transfer briefing for incoming command', sort_order: 51 },
  { section: 'Termination', item_text: 'Confirm all responders through decon', sort_order: 52 },
  { section: 'Termination', item_text: 'Scene turned over to appropriate authority', sort_order: 53 },
];

export async function seedDatabase() {
  console.log('Checking seed data...');

  const existingMaterials = await db.select().from(erg_materials).all();
  if (existingMaterials.length === 0) {
    console.log('Seeding ERG materials...');
    for (const mat of ERG_DATA) {
      const { distances, ...matData } = mat;
      const result = await db.insert(erg_materials).values({
        ...matData,
        has_distance_data: matData.has_distance_data ? 1 : 0,
      } as any).returning().get();

      for (const dist of distances) {
        await db.insert(erg_distances).values({ material_id: result.id, ...dist }).run();
      }
    }
    console.log(`Seeded ${ERG_DATA.length} ERG materials`);
  }

  const existingTemplates = await db.select().from(checklist_templates).all();
  if (existingTemplates.length === 0) {
    console.log('Seeding checklist templates...');
    for (const item of CHECKLIST_TEMPLATES) {
      await db.insert(checklist_templates).values(item).run();
    }
    console.log(`Seeded ${CHECKLIST_TEMPLATES.length} checklist items`);
  }

  console.log('Seed complete.');
}
