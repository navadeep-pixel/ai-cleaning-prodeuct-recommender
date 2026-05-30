/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CleaningRequirements, RecommendedProduct, RecommendationResult } from "../types";

export function recommendCleaningProductsRuleBased(req: CleaningRequirements): RecommendationResult {
  const industry = req.industryType.toLowerCase();
  const eco = req.ecoFriendly.toLowerCase();
  const budget = req.budget.toLowerCase();
  const frequency = req.cleaningFrequency.toLowerCase();
  const size = req.facilitySize.toLowerCase();
  const rooms = parseInt(req.numberRooms) || 1;
  const isEcoOnly = eco.includes("only");
  const isEcoPrefer = eco.includes("prefer") || isEcoOnly;

  let products: RecommendedProduct[] = [];

  // Helper to adjust product names based on Eco-Friendly Preference
  const formatProductName = (name: string, isEco: boolean) => {
    if (isEco) {
      if (name.includes("Multi-Purpose") || name.includes("Multi-Surface")) {
        return "Bio-Clean Earth Friendly Multi-Surface Spray (Green Seal)";
      }
      if (name.includes("Glass")) {
        return "GreenShield Ammonia-Free Glass & Mirror Polish";
      }
      if (name.includes("Floor Cleaner") || name.includes("Floor Disinfectant")) {
        return "Eco-Clean Botanical Floor Finish Protector";
      }
      if (name.includes("Bathroom") || name.includes("Washroom")) {
        return "PureNature Organic Acid Washroom & Bowl Descaler";
      }
      if (name.includes("Sanitizer") || name.includes("Sanitation")) {
        return "Botanical Plant-Based Alcohol Sanitizer";
      }
      return `Eco-Choice ${name}`;
    }
    
    // Adjust name based on budget
    if (budget.includes("economy")) {
      return `ValuePack ${name} (Concentrate)`;
    } else if (budget.includes("premium")) {
      return `Signature High-Performance ${name}`;
    }
    return name;
  };

  // Base Products based on Industry (Extending customer request)
  if (industry.includes("hotel")) {
    products = [
      {
        name: formatProductName("Multi-Purpose Surface Cleaner", isEcoPrefer),
        category: "General Cleaning",
        purpose: req.areaToClean ? `General cleaning of ${req.areaToClean}` : "Room and lobby cleaning",
        usage: "Dilute 2 oz per gallon of water for mopping or spray directly for wipe-down.",
        priority: "Essential"
      },
      {
        name: formatProductName("Glass Cleaner", isEcoPrefer),
        category: "Window Cleaning",
        purpose: "Mirrors, glass panels, windows, and display cases",
        usage: "Spray fine mist, wipe with a lint-free microfibre cloth in circular patterns.",
        priority: "Essential"
      },
      {
        name: formatProductName("Bathroom Cleaner", isEcoPrefer),
        category: "Sanitation",
        purpose: "Toilet bowls, sinks, brass fixtures, and bathroom vanity tiles",
        usage: "Apply thoroughly, let sit for 5-10 minutes to dissolve mineral build-up, scrub, and rinse.",
        priority: "Essential"
      },
      {
        name: formatProductName("Floor Disinfectant", isEcoPrefer),
        category: "Floor Care",
        purpose: "Deep sanitization of lobby, room floors, and elevators",
        usage: "Mix 1:64 ratio with warm water. Mop surface and let air dry for full disinfection.",
        priority: "Recommended"
      }
    ];
  } else if (industry.includes("hospital")) {
    products = [
      {
        name: "Hospital Grade Broad-Spectrum Disinfectant",
        category: "Disinfection",
        purpose: "Kill multi-drug resistant pathogens, viruses, and bacteria on hard surfaces",
        usage: "Apply to pre-cleaned surface, ensure wet contact for a minimum of 10 minutes.",
        priority: "Essential"
      },
      {
        name: formatProductName("Surface Sanitizer", isEcoPrefer),
        category: "Sanitation",
        purpose: "Patient bedrails, medical trays, tables, and patient-contact surfaces",
        usage: "Ready-to-use spray. Apply and wipe with sanitizing towel after 1 minute.",
        priority: "Essential"
      },
      {
        name: "Biohazard Spill Cleanup & Waste Kits",
        category: "Waste Management",
        purpose: "Safely collect, gel, and containerize medical secretions and bodily fluids",
        usage: "Sprinkle polymer crystals on spill to solidify, scrape into biohazard disposal bag.",
        priority: "Essential"
      },
      {
        name: formatProductName("Floor Disinfectant", isEcoPrefer),
        category: "Floor Care",
        purpose: "Operating room and hallway floor hygiene control",
        usage: "Dual-bucket wet mopping. Dilute 4 oz per gallon. Do not cross-contaminate buckets.",
        priority: "Recommended"
      }
    ];
  } else if (industry.includes("school")) {
    products = [
      {
        name: formatProductName("Floor Cleaner", isEcoPrefer),
        category: "Floor Care",
        purpose: "Hallway and classroom floor maintenance",
        usage: "Dilute 1:128 in auto-scrubbers or traditional flat mops. Ideal for high traffic.",
        priority: "Essential"
      },
      {
        name: formatProductName("Desk Surface Cleaner & Degreaser", isEcoPrefer),
        category: "Surface Cleaning",
        purpose: "Student desks, cafeteria boards, and plastic chairs",
        usage: "Spray onto surface and wipe clean. Child-safe formula, low VOC.",
        priority: "Essential"
      },
      {
        name: formatProductName("Hand Sanitizer Dispenser Refills", isEcoPrefer),
        category: "Hygiene",
        purpose: "Promote hand hygiene in common corridors and school halls",
        usage: "Load into automated wall dispensers. Rub vigorously over dry hands for 30 seconds.",
        priority: "Recommended"
      },
      {
        name: formatProductName("Washroom Sanitizer", isEcoPrefer),
        category: "Sanitation",
        purpose: "Student restroom floors, toilets, and urinal partitions",
        usage: "Apply concentrated gel under rims, let sit, brush thoroughly, and flush.",
        priority: "Essential"
      }
    ];
  } else if (industry.includes("office")) {
    products = [
      {
        name: formatProductName("Multi-Purpose Surface Cleaner", isEcoPrefer),
        category: "General Cleaning",
        purpose: "Workstations, monitor rims, boardrooms, and reception desks",
        usage: "Spray onto a microfiber cloth and wipe surfaces gently. Avoid direct electronic spraying.",
        priority: "Essential"
      },
      {
        name: formatProductName("Glass Cleaner", isEcoPrefer),
        category: "Window Cleaning",
        purpose: "Glass cubicle partitions, door panels, and picture frames",
        usage: "Apply mist pattern on glass, wipe down with squeegee or clean soft cloth.",
        priority: "Recommended"
      },
      {
        name: formatProductName("Floor Cleaner", isEcoPrefer),
        category: "Floor Care",
        purpose: "Office carpet spot treatment or laminate floors",
        usage: "Extract spots using carpet spotter, or mop hard flooring with a light damp sweep.",
        priority: "Essential"
      },
      {
        name: formatProductName("Disinfectant Spray", isEcoPrefer),
        category: "Sanitation",
        purpose: "Office phones, keyboards, elevator buttons, and door Handles",
        usage: "Spray lightly at a 12-inch distance and allow to air dry for germ eradication.",
        priority: "Recommended"
      }
    ];
  } else if (industry.includes("restaurant") || industry.includes("food")) {
    products = [
      {
        name: "Food-Contact Surface No-Rinse Sanitizer",
        category: "Sanitation/Kitchen",
        purpose: "Sanitizing cutting boards, prep counters, and chef knives",
        usage: "Dilute to 200ppm active quaternary solution, spray surface, and let drain dry without wiping.",
        priority: "Essential"
      },
      {
        name: "Heavy-Duty Citrus Kitchen Degreaser",
        category: "Heavy Duty Cleaning",
        purpose: "Ovens, cooktops, exhaust hoods, and kitchen backsplashes",
        usage: "Apply full strength to grill/exhaust, let penetrate warm grease for 10 minutes, scrape and rinse.",
        priority: "Essential"
      },
      {
        name: formatProductName("Deodorizing Floor Wash", isEcoPrefer),
        category: "Floor Care",
        purpose: "Slippery dining room floors and oily kitchen tiles",
        usage: "Mix with hot water. Mop using deck brush for scrub-down. Squeegee to floor drain.",
        priority: "Essential"
      },
      {
        name: formatProductName("Premium Hand Soap", isEcoPrefer),
        category: "Hygiene",
        purpose: "Kitchen crew sanitization and customer washrooms",
        usage: "Pump once, lather with water for 20 seconds, ensuring fingernails and wrists are cleaned.",
        priority: "Recommended"
      }
    ];
  } else if (industry.includes("factory") || industry.includes("industrial")) {
    products = [
      {
        name: "Heavy-Duty Solvent Degreaser & Industrial Wash",
        category: "Heavy Duty Cleaning",
        purpose: "Oil spill containment, machinery cleanup, and grease stain removal",
        usage: "Dilute 1:10 for general manufacturing floors, or use pure for heavy oil encrustations.",
        priority: "Essential"
      },
      {
        name: "Concrete Floor Alkaline Scrubbing Concentrate",
        category: "Floor Care",
        purpose: "Forklift tire mark removal and dock bay scrubbing",
        usage: "Feed into automatic industrial floor scrubber at 1:40 dilution ratio with warm water.",
        priority: "Essential"
      },
      {
        name: "Industrial Rust & Scale Remover",
        category: "Specialized Maintenance",
        purpose: "Cleaning tooling lines, valves, and rust protection",
        usage: "Soak rusted parts in a vat solution for 30 minutes, rinse, and immediately lubricate.",
        priority: "Recommended"
      },
      {
        name: formatProductName("Multi-Surface Disinfectant", isEcoPrefer),
        category: "Sanitation",
        purpose: "Factory breakroom tables, lockers, and shared workstations",
        usage: "Spray on touch surfaces after shifts. Wipe away after 2 minutes of active contact limit.",
        priority: "Recommended"
      }
    ];
  } else {
    // Default / Home / Others
    products = [
      {
        name: formatProductName("Multi-Purpose Ecological Surface Cleaner", isEcoPrefer),
        category: "General Cleaning",
        purpose: "Kitchen countertops, tables, wood veneer, and general household items",
        usage: "Ready-to-use spray. Spritz and wipe with clean eco-friendly fiber cloths.",
        priority: "Essential"
      },
      {
        name: formatProductName("Heavy Duty Bathroom Concentrate", isEcoPrefer),
        category: "Sanitation",
        purpose: "Shower stalls, toilet bowls, porcelain basins, and drain traps",
        usage: "Apply to tub and tiled walls, let stand for 5 minutes, scrub with non-scratch pad, rinse.",
        priority: "Essential"
      },
      {
        name: formatProductName("Neutral pH Liquid Floor Soap", isEcoPrefer),
        category: "Floor Care",
        purpose: "Living room floors, hardwood, laminate, or porcelain tiling",
        usage: "Mix 1 oz per gallon of clean lukewarm water. Well-wrung damp mop to avoid wood swelling.",
        priority: "Recommended"
      }
    ];
  }

  // Adjust for Special Requirements or budget if needed
  if (req.specialRequirements) {
    const sr = req.specialRequirements.toLowerCase();
    if (sr.includes("scent-free") || sr.includes("allergy") || sr.includes("fragrance")) {
      products.push({
        name: "Zero-Scent Allergen-Safe Air Freshener Neutralizer",
        category: "Deodorizing",
        purpose: "Trap bio-odors inside fibers without introducing artificial chemical fragrance",
        usage: "Spray lightly upwards into center of room or onto clean fabrics from 2 feet.",
        priority: "Recommended"
      });
    }
    if (sr.includes("pet") || sr.includes("dog") || sr.includes("cat")) {
      products.push({
        name: "Enzymatic Multi-Action Urine Cleaner and Odor Destroyer",
        category: "Specialized Spotting",
        purpose: "Eliminate deep uric acid crystals from grout or carpet fibers safely",
        usage: "Saturate soiled area, cover with wet towel to keep bio-active enzymes active for 4 hours, blot dry.",
        priority: "Recommended"
      });
    }
    if (sr.includes("heavy duty") || sr.includes("grease") || sr.includes("rust")) {
      products.push({
        name: "Citrus Booster Fortified Heavy Soil Degreaser Emulsion",
        category: "Heavy Duty Cleaning",
        purpose: "Enhance standard cleaning solutions for exceptionally stubborn grime and oils",
        usage: "Add 4 oz of booster per gallon of standard cleaner to tackle dirty zones.",
        priority: "Recommended"
      });
    }
  }

  // Generate nice Quantity suggestions
  let quantitySuggestion = "";
  let baseMultiplier = 1;
  const areaL = size.toString();
  if (areaL.includes("large") || areaL.includes("10,000") || areaL.includes("10k") || rooms > 15) {
    baseMultiplier = 5;
    quantitySuggestion = `Based on your large facility size with ${rooms} rooms and automated cleaning schedule: Ensure a stock of 10-15 gallons of concentrated cleaning agents, and 24 spray bottle ready-to-use solutions per month. Set up professional dilution controls.`;
  } else if (areaL.includes("medium") || areaL.includes("2,000") || areaL.includes("5,000") || rooms > 5) {
    baseMultiplier = 2;
    quantitySuggestion = `For your medium space and ${frequency} cleaning frequency: We suggest starting with 3-5 gallons of general surface cleanser, 4 gallons of specialized floor disinfectant, and 1 case of ready-to-use spray refills per month.`;
  } else {
    baseMultiplier = 1;
    quantitySuggestion = `Standard small office or home starter set: 1-2 gallons total of concentrated soaps, paired with 3-4 professional spray bottles. This should last 2-3 months on a ${frequency} cleaning pattern.`;
  }

  // Safety considerations
  const safetyNotes = [
    "Always reference the Safety Data Sheet (SDS) before handling chemical mixtures.",
    "Do not mix bleaching agents or chlorine-containing solutions with ammonia-based floor soaps to prevent toxic vapours.",
    "Wear appropriate Personal Protective Equipment (PPE) including safety glasses and heavy nitriding gloves during raw solution diluting."
  ];

  if (industry.includes("hospital") || req.hygieneLevel.includes("Sterilization")) {
    safetyNotes.push("In highly sanitary zones, maintain separate, marked cleaning tools (colour-coded mops) to eliminate cross-contamination.");
  }
  if (industry.includes("school")) {
    safetyNotes.push("Ensure all concentrated fluids are securely locked in maintenance cabinets far from any children's access.");
  }

  // Additional recommendations
  const additionalRecommendations = [
    "Invest in high-quality Microfibre cloths (color-coded: Blue for glass, Red for bathrooms, Yellow for surface touchpoints) to trap 99% of particulate matters.",
    "Implement a routine equipment deep wash system for flat mops and squeegees to prolong life and maintain operational hygiene standards.",
    `Schedule regular deep scrub cycles quarterly depending on your specified ${frequency} cleaning cadence.`
  ];

  // summary string
  const summary = `Tailored cleaning equipment assessment verified for a ${req.industryType} facility of size: ${req.facilitySize} with ${req.numberRooms} rooms. Hygiene target matches: ${req.hygieneLevel}. This custom plan focuses on ${req.ecoFriendly !== "No preference" ? "sustainable eco-friendly" : "cost-effective industry-targeted"} disinfectants and deep-cleaning products mapped directly for ${req.areaToClean || "general workspace surfaces"}.`;

  return {
    summary,
    recommendedProducts: products,
    quantitySuggestion,
    safetyNotes,
    additionalRecommendations,
    isAiGenerated: false
  };
}
