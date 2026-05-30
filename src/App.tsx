/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertTriangle, 
  Flame, 
  Activity, 
  Award,
  Building, 
  Hospital, 
  School, 
  Briefcase, 
  Utensils, 
  Factory, 
  Home, 
  Dumbbell, 
  Store,
  Compass,
  FileSpreadsheet,
  Layers,
  Leaf,
  DollarSign,
  Droplet,
  Info,
  ChevronRight,
  ShieldCheck,
  Plus,
  Minus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CleaningRequirements, RecommendedProduct, RecommendationResult } from "./types";
import { recommendCleaningProductsRuleBased } from "./utils/ruleEngine";

// Hardcoded industries with their icons for the interactive Bento grid
const INDUSTRIES = [
  { id: "hotel", label: "Hotel", icon: Building, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { id: "hospital", label: "Hospital", icon: Hospital, color: "bg-rose-50 text-rose-600 border-rose-100" },
  { id: "school", label: "School", icon: School, color: "bg-amber-50 text-amber-600 border-amber-100" },
  { id: "office", label: "Office", icon: Briefcase, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { id: "restaurant", label: "Restaurant", icon: Utensils, color: "bg-orange-50 text-orange-600 border-orange-100" },
  { id: "factory", label: "Factory", icon: Factory, color: "bg-sky-50 text-sky-600 border-sky-100" },
  { id: "home", label: "Home", icon: Home, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { id: "gym", label: "Gym / Wellness", icon: Dumbbell, color: "bg-violet-50 text-violet-600 border-violet-100" },
  { id: "retail", label: "Retail / Store", icon: Store, color: "bg-teal-50 text-teal-600 border-teal-100" }
];

export default function App() {
  // Input questionnaire state variables
  const [industryType, setIndustryType] = useState<string>("hotel");
  const [facilitySize, setFacilitySize] = useState<string>("Medium (2,000 - 5,000 sq ft)");
  const [numberRooms, setNumberRooms] = useState<string>("8");
  const [cleaningFrequency, setCleaningFrequency] = useState<string>("Daily");
  const [hygieneLevel, setHygieneLevel] = useState<string>("High Sanitation / Deep Hygienic");
  const [budget, setBudget] = useState<string>("Standard");
  const [ecoFriendly, setEcoFriendly] = useState<string>("Prefer eco-friendly");
  const [areaToClean, setAreaToClean] = useState<string>("Common lobby area, washrooms, guest quarters floor.");
  const [specialRequirements, setSpecialRequirements] = useState<string>("Low odor preferred.");

  // Predefined requirement helper tags
  const SPECIAL_REQUIREMENT_PRESETS = [
    "Scent-free & low allergy",
    "Pet-safe ingredients",
    "Heavy duty oil and grease removal",
    "Low VOC emission",
    "Fast dry formula"
  ];

  // App UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [customKeyWarning, setCustomKeyWarning] = useState<boolean>(false);

  // Procurement planning simulated states
  const [orderPlan, setOrderPlan] = useState<Record<string, number>>({});
  const [checkedProducts, setCheckedProducts] = useState<Record<string, boolean>>({});

  // Apply a special requirement preset tag
  const toggleSpecialPreset = (tag: string) => {
    if (specialRequirements.includes(tag)) {
      setSpecialRequirements(prev => prev.replace(tag, "").replace(/,\s*,/, ",").trim());
    } else {
      setSpecialRequirements(prev => prev ? `${prev}, ${tag}` : tag);
    }
  };

  // Compile full requirements object
  const getRequirementsPayload = (): CleaningRequirements => ({
    industryType,
    facilitySize,
    numberRooms,
    cleaningFrequency,
    hygieneLevel,
    budget,
    ecoFriendly,
    specialRequirements,
    areaToClean
  });

  // Action: Launch AI-Powered Gemini Engine recommendation
  const generateAiRecommendation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setOrderPlan({});
    setCheckedProducts({});

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getRequirementsPayload()),
      });

      if (!response.ok) {
        throw new Error(`Server returned error code ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
      // Initialize default checkout quantities for recommended items
      const initialPlan: Record<string, number> = {};
      const initialChecked: Record<string, boolean> = {};
      data.recommendedProducts.forEach((p: RecommendedProduct) => {
        initialPlan[p.name] = p.priority === "Essential" ? 3 : 1;
        initialChecked[p.name] = p.priority === "Essential";
      });
      setOrderPlan(initialPlan);
      setCheckedProducts(initialChecked);

      // Check if server warned about API key fallback
      if (data.fallbackWarning) {
        setCustomKeyWarning(true);
      } else {
        setCustomKeyWarning(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred contacting the AI recommendation api.");
      // Fallback instantly to the local rules engine on hard crash
      triggerFallbackLocal();
    } finally {
      setLoading(false);
    }
  };

  // Action: Trigger instant Rule-Based Baseline Engine
  const triggerFallbackLocal = () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setOrderPlan({});
    setCheckedProducts({});

    setTimeout(() => {
      const fallbackData = recommendCleaningProductsRuleBased(getRequirementsPayload());
      setResult(fallbackData);
      
      const initialPlan: Record<string, number> = {};
      const initialChecked: Record<string, boolean> = {};
      fallbackData.recommendedProducts.forEach((p: RecommendedProduct) => {
        initialPlan[p.name] = p.priority === "Essential" ? 3 : 1;
        initialChecked[p.name] = p.priority === "Essential";
      });
      setOrderPlan(initialPlan);
      setCheckedProducts(initialChecked);
      setLoading(false);
    }, 450); // Small realistic delay to feel interactive
  };

  // Copy procurement report strictly following the formatted requested Markdown template
  const copyOutputReportMarkdown = () => {
    if (!result) return;

    let text = `## Cleaning Requirement Summary\n${result.summary}\n\n`;
    text += `## Recommended Products\n\n`;

    result.recommendedProducts.forEach((p, idx) => {
      text += `### Product ${idx + 1}\n`;
      text += `- Product Name: ${p.name}\n`;
      text += `- Category: ${p.category}\n`;
      text += `- Purpose: ${p.purpose}\n`;
      text += `- Usage: ${p.usage}\n`;
      text += `- Priority: ${p.priority}\n\n`;
    });

    text += `## Quantity Suggestions\n`;
    text += `${result.quantitySuggestion}\n\n`;

    text += `## Safety Notes\n`;
    result.safetyNotes.forEach(note => {
      text += `- ${note}\n`;
    });
    text += `\n`;

    text += `## Additional Recommendations\n`;
    result.additionalRecommendations.forEach(rec => {
      text += `- ${rec}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Modify procurement planned quantities
  const updateProductQuantity = (name: string, diff: number) => {
    setOrderPlan(prev => {
      const current = prev[name] || 0;
      const next = Math.max(1, current + diff);
      return { ...prev, [name]: next };
    });
  };

  const toggleCheckedProduct = (name: string) => {
    setCheckedProducts(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Helper to retrieve correct icon class for the summarized industry
  const getSelectedIndustryInfo = () => {
    return INDUSTRIES.find(ind => ind.id === industryType) || INDUSTRIES[0];
  };

  const currentIndInfo = getSelectedIndustryInfo();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Humble and Elegant Header Block */}
        <header className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <Droplet className="w-3.5 h-3.5" />
              <span>PureSphere Commercial Formulary</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Professional Cleaning Advisor
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">
              Configure facility parameters to match optimized industrial supplies, safety certifications, and standard quantity suggestions.
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center justify-center space-x-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-xs font-mono">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">Local Time (UTC): 2026-05-30</span>
          </div>
        </header>

        {/* Master Double-Panel Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Input Questionnaire Form (5 Columns wide on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              
              {/* Form Title */}
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Compass className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Facility Assessment</h2>
                  <p className="text-xs text-slate-400">Fill in facility details & industry constraints</p>
                </div>
              </div>

              {/* FIELD 1: Industry Type (Bento clickable cards) */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Select Industry Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {INDUSTRIES.map((ind) => {
                    const IconComponent = ind.icon;
                    const isSelected = industryType === ind.id;
                    return (
                      <button
                        key={ind.id}
                        type="button"
                        onClick={() => setIndustryType(ind.id)}
                        className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                          isSelected 
                            ? "bg-slate-900 border-slate-900 text-white shadow-sm scale-[1.02]" 
                            : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 mb-1.5 ${isSelected ? "text-emerald-400" : "text-slate-400"}`} />
                        <span className="text-[10px] font-medium leading-none truncate w-full">{ind.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FIELD 2: Area to be cleaned */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Areas to be Cleaned</span>
                  <span className="text-[10px] text-slate-400 font-normal normal-case">e.g. Carpets, Tile, Counters</span>
                </label>
                <textarea
                  value={areaToClean}
                  onChange={(e) => setAreaToClean(e.target.value)}
                  placeholder="Identify areas like kitchen surfaces, vinyl floors, restrooms, patient bedrooms..."
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-800 transition-colors h-16 min-h-[50px] resize-none"
                />
              </div>

              {/* ROW 1: Facility Size & Room Count */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Facility Size
                  </label>
                  <select
                    value={facilitySize}
                    onChange={(e) => setFacilitySize(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-800 cursor-pointer"
                  >
                    <option>Small (Under 1,000 sq ft)</option>
                    <option>Medium (2,000 - 5,000 sq ft)</option>
                    <option>Large (10,000 - 25,000 sq ft)</option>
                    <option>Industrial (Over 25,000 sq ft)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Number of Rooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={numberRooms}
                    onChange={(e) => setNumberRooms(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              {/* ROW 2: Cleaning Frequency & Budget Preference */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Cleaning Frequency
                  </label>
                  <select
                    value={cleaningFrequency}
                    onChange={(e) => setCleaningFrequency(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-800 cursor-pointer"
                  >
                    <option>Daily</option>
                    <option>Bi-weekly</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>One-time deep clean</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Budget Level
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                    {["Economy", "Standard", "Premium"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBudget(b)}
                        className={`text-[10px] py-1.5 font-semibold rounded-lg truncate cursor-pointer transition-colors ${
                          budget === b 
                            ? "bg-white text-slate-900 shadow-xs" 
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ROW 3: Hygiene Levels (Standard vs High vs Sterilization) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Hygiene level required
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: "Standard", label: "Standard" },
                    { id: "High Sanitation / Deep Hygienic", label: "Sanitation" },
                    { id: "Full Sterilization / Hospital-Grade", label: "Sterilize" }
                  ].map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setHygieneLevel(h.id)}
                      className={`text-[10px] py-2 font-semibold text-center rounded-lg cursor-pointer transition-colors ${
                        hygieneLevel === h.id 
                          ? "bg-slate-900 text-white shadow-xs" 
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ROW 4: Eco-Friendly Preference */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Eco-Friendly Preference</span>
                </label>
                <select
                  value={ecoFriendly}
                  onChange={(e) => setEcoFriendly(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-800 cursor-pointer"
                >
                  <option>No preference</option>
                  <option>Prefer eco-friendly</option>
                  <option>Eco-friendly ONLY</option>
                </select>
              </div>

              {/* FIELD 7: Special Requirements with fast tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Special Requirements
                </label>
                <input
                  type="text"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="e.g. Skin sensitive, fragrance-free, pet-safe, fast drying"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-800 transition-colors"
                />
                
                {/* Clickable Quick Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {SPECIAL_REQUIREMENT_PRESETS.map(preset => {
                    const isSelected = specialRequirements.includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => toggleSpecialPreset(preset)}
                        className={`text-[9px] px-2 py-1 rounded-md border font-normal cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-emerald-100 border-emerald-300 text-emerald-800 font-medium" 
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected ? "✓  " : "+ "} {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACTION COMPONENT BUTTONS */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Local Instant Rule Engine Option */}
                <button
                  type="button"
                  onClick={triggerFallbackLocal}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-slate-100 text-slate-800 hover:bg-slate-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 select-none transition-colors border border-slate-200 disabled:opacity-50 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Instant Baseline</span>
                </button>

                {/* Gemini AI Powered Advisor */}
                <button
                  type="button"
                  onClick={generateAiRecommendation}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 select-none transition-all duration-150 disabled:opacity-50 cursor-pointer cursor-pointer shadow-xs hover:shadow-md"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>AI Advisor</span>
                </button>

              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Results Section & Interactive Procurement Summary (7 Columns wide on desktop) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Loading/Empty State Display */}
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center flex flex-col items-center justify-center space-y-4"
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
                    <Sparkles className="w-6 h-6 text-emerald-500 absolute top-1/2 left-1/2 -ml-3 -mt-3 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Analyzing Sanitation Requirements</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                      Querying matching chemical solutions, environmental certificates and calculated dosages based on {facilitySize}...
                    </p>
                  </div>
                </motion.div>
              )}

              {!loading && !result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl border border-slate-200 p-12 text-center"
                >
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
                    <Compass className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">Select Parameters and Generate Plan</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5">
                    Select an industry target like "Hospital" or "Restaurant" above and tap <strong className="text-emerald-700 font-semibold">AI Advisor</strong> or <strong className="text-slate-800 font-semibold">Instant Baseline</strong> to inspect custom formulas.
                  </p>
                </motion.div>
              )}

              {/* 2. Full Recommendation Presentation */}
              {!loading && result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  
                  {/* Warning if AI key was not set and we fell back to rule-based automatically */}
                  {customKeyWarning && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-amber-900 text-xs shadow-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Using baseline matching engine:</strong> To enable dynamic AI modeling, make sure to add your real <strong>GEMINI_API_KEY</strong> inside the <strong>Settings &gt; Secrets</strong> tab of Google AI Studio.
                      </div>
                    </div>
                  )}

                  {/* Summary Header Card */}
                  <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-[0.03]">
                      <currentIndInfo.icon className="w-64 h-64" />
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <span className={`p-1.5 rounded-lg text-slate-900 bg-white`}>
                          <currentIndInfo.icon className="w-4 h-4" />
                        </span>
                        <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                          {industryType} Report
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                          result.isAiGenerated 
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800/60" 
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}>
                          {result.isAiGenerated ? "⚡ Gemini Smart Recommended" : "⚙ Local Base Formula"}
                        </span>

                        <button 
                          onClick={copyOutputReportMarkdown}
                          className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg cursor-pointer transition-colors flex items-center space-x-2 text-xs font-bold"
                          title="Copy text following the exact prompt requested structure"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="hidden sm:inline">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-300" />
                              <span className="hidden sm:inline text-xs">Copy Report</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Assessed Summary
                    </h3>
                    <p className="text-sm font-medium leading-relaxed text-slate-200">
                      {result.summary}
                    </p>
                  </div>

                  {/* PRODUCTS RECOMMENDATION CONTAINER */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-base uppercase tracking-wider flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <span>Recommended Products &amp; Procurement Quantities</span>
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        {result.recommendedProducts.length} Items Selected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {result.recommendedProducts.map((product, idx) => {
                        const isChecked = checkedProducts[product.name] ?? false;
                        const qty = orderPlan[product.name] || 1;
                        
                        // Pick color scheme based on Priority Levels
                        let priorityBadge = "bg-rose-50 text-rose-700 border-rose-200";
                        if (product.priority === "Recommended") {
                          priorityBadge = "bg-blue-50 text-blue-700 border-blue-200";
                        } else if (product.priority === "Optional") {
                          priorityBadge = "bg-slate-100 text-slate-600 border-slate-200";
                        }

                        return (
                          <div 
                            key={product.name}
                            className={`bg-white rounded-xl border p-4 transition-all duration-150 ${
                              isChecked 
                                ? "border-emerald-500 shadow-xs ring-1 ring-emerald-500/10" 
                                : "border-slate-200 hover:border-slate-300 shadow-xs"
                            }`}
                          >
                            <div className="flex items-start justify-between space-x-4">
                              <div className="flex items-start space-x-3">
                                
                                <button
                                  type="button"
                                  onClick={() => toggleCheckedProduct(product.name)}
                                  className={`mt-1 h-5 w-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                    isChecked 
                                      ? "bg-emerald-600 border-emerald-600 text-white" 
                                      : "border-slate-300 hover:border-slate-400 text-transparent"
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </button>

                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                    <span className="text-xs uppercase font-semibold text-slate-400">
                                      {product.category}
                                    </span>
                                    <span className="text-slate-300 text-xs">•</span>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                                      {product.priority}
                                    </span>
                                  </div>

                                  <h5 className="font-extrabold text-slate-950 text-sm">
                                    {product.name}
                                  </h5>
                                </div>
                              </div>

                              {/* Quantity selection simulation */}
                              <div className="flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => updateProductQuantity(product.name, -1)}
                                  className="p-1 hover:bg-slate-200 text-slate-600 rounded-md cursor-pointer transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-[11px] font-bold text-slate-800 w-6 text-center">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateProductQuantity(product.name, 1)}
                                  className="p-1 hover:bg-slate-200 text-slate-600 rounded-md cursor-pointer transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                <span className="text-[9px] text-slate-400 font-medium pl-1 pr-0.5 select-none">packs</span>
                              </div>
                            </div>

                            <div className="mt-3 pl-8 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3 text-xs leading-relaxed">
                              <div>
                                <span className="font-bold text-slate-500 uppercase tracking-wide text-[9px] block mb-0.5">
                                  Target Purpose:
                                </span>
                                <p className="text-slate-700 font-medium">
                                  {product.purpose}
                                </p>
                              </div>

                              <div>
                                <span className="font-bold text-slate-500 uppercase tracking-wide text-[9px] block mb-0.5">
                                  Usage &amp; Dilution:
                                </span>
                                <p className="text-slate-600 italic">
                                  {product.usage}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* THREE-CARD OPERATIONAL INFORMATION SECTION */}
                  <div className="grid grid-cols-1 gap-6">

                    {/* Quantity Suggestions Panel */}
                    <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-5 space-y-2.5">
                      <div className="flex items-center space-x-2 text-emerald-800">
                        <FileSpreadsheet className="w-4.5 h-4.5 stroke-[2] shrink-0" />
                        <h4 className="font-extrabold text-sm uppercase tracking-wider">
                          Suggested Storage Quantities
                        </h4>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium pl-6">
                        {result.quantitySuggestion}
                      </p>
                    </div>

                    {/* Safety Considerations Accordions */}
                    <div className="bg-amber-50/40 rounded-xl border border-amber-200/60 p-5 space-y-3">
                      <div className="flex items-center space-x-2 text-amber-800">
                        <ShieldCheck className="w-4.5 h-4.5 stroke-[2] shrink-0" />
                        <h4 className="font-extrabold text-sm uppercase tracking-wider">
                          Chemical Safety Guidelines
                        </h4>
                      </div>
                      <ul className="text-xs text-slate-700 space-y-2 pl-6 list-disc">
                        {result.safetyNotes.map((note, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Additional operational recommendations */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
                      <div className="flex items-center space-x-2 text-slate-700">
                        <Info className="w-4.5 h-4.5 stroke-[2] shrink-0" />
                        <h4 className="font-extrabold text-sm uppercase tracking-wider">
                          Additional Operational Standards
                        </h4>
                      </div>
                      <ul className="text-xs text-slate-700 space-y-2 pl-6 list-disc">
                        {result.additionalRecommendations.map((rec, idx) => (
                          <li key={idx} className="leading-relaxed font-medium">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    </div>
  );
}
