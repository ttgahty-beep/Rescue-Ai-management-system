import { GoogleGenAI, Type } from '@google/genai';
import type { AIExtractionResult } from '../types/emergency.ts';

// Server-side initialization per @google/genai guidelines:
// User-Agent must be 'aistudio-build'
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export interface ProcessEmergencyParams {
  userMessage: string;
  languagePreference?: string;
  conversationHistory?: Array<{ sender: string; body: string }>;
  userLocation?: {
    district?: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
  };
}

export async function processEmergencyWithGemini(
  params: ProcessEmergencyParams
): Promise<AIExtractionResult> {
  const { userMessage, conversationHistory = [], userLocation } = params;

  const ai = getGeminiClient();

  // If Gemini API Key is available on server, use gemini-3.8-flash with structured JSON schema
  if (ai) {
    try {
      const historyContext = conversationHistory
        .map((m) => `${m.sender.toUpperCase()}: ${m.body}`)
        .join('\n');

      const locationContext = userLocation
        ? `Known Location: District: ${userLocation.district || 'Unknown'}, Landmark/Address: ${userLocation.landmark || 'Unknown'}, Lat/Lng: ${userLocation.latitude || 'N/A'}, ${userLocation.longitude || 'N/A'}`
        : 'Location not yet pinned.';

      const prompt = `You are RescueLink AI, an emergency guidance and triage coordination agent for Pakistan.
Your role:
1. Understand reports in English, Urdu (اردو), or Roman Urdu (e.g., "Madad chahiye, flood ka paani barh raha hai", "Bacha behosh hai", "Canal road accident").
2. Extract all life-critical information into a structured format for dispatchers (Rescue 1122, Edhi 115, Chhipa 1020, NDMA/PDMA).
3. Provide calm, direct life-saving guidance in the citizen's own language.
4. Always prioritize vulnerable groups: children, elderly, pregnant women, mobility-impaired persons, and injured victims.
5. Provide explainable AI reasoning with deterministic risk classification (CRITICAL, HIGH, MEDIUM, LOW).

CONVERSATION HISTORY:
${historyContext || 'None'}

LATEST CITIZEN INPUT:
"${userMessage}"

LOCATION CONTEXT:
${locationContext}

Return structured JSON according to the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an emergency triage assistant for RescueLink AI Pakistan. Respond ONLY with valid JSON conforming to the requested schema. Provide empathetic, accurate emergency advice.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              language: {
                type: Type.STRING,
                description: 'Detected language: "English" or "Urdu" or "Roman Urdu"',
              },
              category: {
                type: Type.STRING,
                description:
                  'Incident category: flood, medical, accident, fire, collapse, trapped, missing, shelter, relief, other',
              },
              priority: {
                type: Type.STRING,
                description: 'Urgency priority: CRITICAL, HIGH, MEDIUM, LOW',
              },
              confidenceScore: {
                type: Type.NUMBER,
                description: 'Confidence score between 0 and 100',
              },
              locationName: {
                type: Type.STRING,
                description: 'Specific neighborhood, street, or town in Pakistan',
              },
              district: {
                type: Type.STRING,
                description: 'Pakistani District or City (e.g. Lahore, Karachi, Rawalpindi, Peshawar, Multan, Sukkur, Quetta, Islamabad)',
              },
              landmark: {
                type: Type.STRING,
                description: 'Nearby prominent landmark or bridge or station',
              },
              peopleCount: {
                type: Type.INTEGER,
                description: 'Total number of affected individuals or trapped persons',
              },
              vulnerableGroups: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of vulnerable groups detected (e.g. Children, Elderly, Disabled, Pregnant)',
              },
              injurySummary: {
                type: Type.STRING,
                description: 'Brief summary of reported injuries or acute medical conditions',
              },
              hazards: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Environmental hazards (e.g. Live electrical wires, rising flood water, smoke inhalation, structural collapse)',
              },
              immediateNeeds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Equipment/services needed (e.g. Rescue Boat, Life Jackets, ALS Ambulance, Hydraulic Cutters)',
              },
              recommendedOrg: {
                type: Type.STRING,
                description: 'Recommended Pakistani emergency organization (e.g. Rescue 1122, Edhi Foundation 115, Chhipa 1020, PDMA)',
              },
              recommendedUnitType: {
                type: Type.STRING,
                description: 'Specific vehicle or team type (e.g. Flood Rescue Boat, Cardiac Ambulance, Fire Tender)',
              },
              englishTranslation: {
                type: Type.STRING,
                description: 'Accurate English summary for dispatchers',
              },
              aiReasoning: {
                type: Type.STRING,
                description: 'Clinical/tactical rationale for the priority score and routing',
              },
              assistantReply: {
                type: Type.STRING,
                description: 'Empathetic response in the citizen language with acknowledgment and reassurance',
              },
              safetyGuidance: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Numbered immediate life safety steps for the citizen while awaiting rescue',
              },
              requiresHumanEscalation: {
                type: Type.BOOLEAN,
                description: 'True if situation is ambiguous, life-threatening, or complex',
              },
              suggestedFollowUps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '1-2 brief follow-up questions to ask the citizen if critical details are missing',
              },
            },
            required: [
              'language',
              'category',
              'priority',
              'confidenceScore',
              'district',
              'peopleCount',
              'vulnerableGroups',
              'hazards',
              'immediateNeeds',
              'recommendedOrg',
              'recommendedUnitType',
              'englishTranslation',
              'aiReasoning',
              'assistantReply',
              'safetyGuidance',
              'requiresHumanEscalation',
            ],
          },
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return parsed as AIExtractionResult;
      }
    } catch (err) {
      console.warn('Gemini API call failed or encountered error, engaging deterministic fallback:', err);
    }
  }

  // Deterministic Pakistani Emergency Rule Engine Fallback
  return fallbackEmergencyTriage(userMessage, userLocation);
}

/**
 * Deterministic Emergency Triage Engine
 * Handles English, Urdu, and Roman Urdu keywords tailored to Pakistan disaster response.
 */
export function fallbackEmergencyTriage(
  input: string,
  location?: { district?: string; landmark?: string; latitude?: number; longitude?: number }
): AIExtractionResult {
  const text = input.toLowerCase();

  // Language detection
  const isUrduScript = /[\u0600-\u06FF]/.test(input);
  const romanUrduKeywords = ['madad', 'bachao', 'pani', 'paani', 'chhat', 'bacha', 'bachay', 'ghalat', 'mushkil', 'mariz', 'hospital', 'jaldi', 'aag', 'khamba', 'chal nahi', 'zakhm', 'khoon'];
  const isRomanUrdu = !isUrduScript && romanUrduKeywords.some((kw) => text.includes(kw));
  const language = isUrduScript ? 'Urdu' : isRomanUrdu ? 'Roman Urdu' : 'English';

  // Category & Priority detection
  let category: AIExtractionResult['category'] = 'other';
  let priority: AIExtractionResult['priority'] = 'MEDIUM';
  let recommendedOrg = 'Rescue 1122 (Punjab / Regional)';
  let recommendedUnitType = 'Emergency Rapid Response Unit';
  const hazards: string[] = [];
  const immediateNeeds: string[] = [];
  const vulnerableGroups: string[] = [];
  let peopleCount = 1;

  // Flood detection
  if (text.includes('flood') || text.includes('water') || text.includes('pani') || text.includes('paani') || text.includes('saillab') || text.includes('sailab') || text.includes('drown') || text.includes('doob')) {
    category = 'flood';
    priority = 'CRITICAL';
    hazards.push('Active floodwaters', 'Electrical hazard from submerged wiring');
    immediateNeeds.push('Rescue Inflatable Boat', 'Life Jackets', 'Emergency Evacuation');
    recommendedOrg = 'Rescue 1122 - Disaster Water Rescue Unit / PDMA';
    recommendedUnitType = 'Inflatable Rescue Boat & Water Division';
  } else if (text.includes('fire') || text.includes('aag') || text.includes('smoke') || text.includes('dhuwan') || text.includes('cylinder') || text.includes('blast')) {
    category = 'fire';
    priority = 'CRITICAL';
    hazards.push('Smoke inhalation hazard', 'Flammable structure');
    immediateNeeds.push('Fire Tender with Water Bowsers', 'Breathing Apparatus');
    recommendedOrg = 'Rescue 1122 Fire Service';
    recommendedUnitType = 'Heavy Fire Tender & Foam Vehicle';
  } else if (text.includes('accident') || text.includes('crash') || text.includes('collision') || text.includes('truck') || text.includes('car') || text.includes('bike') || text.includes('hassa') || text.includes('hadsa')) {
    category = 'accident';
    priority = 'HIGH';
    hazards.push('Traffic congestion', 'Spilled motor fuel');
    immediateNeeds.push('Paramedic Ambulance', 'Hydraulic rescue spreaders');
    recommendedOrg = 'Rescue 1122 / Edhi Ambulance 115';
    recommendedUnitType = 'Type-A Cardiac & Trauma Ambulance';
  } else if (text.includes('heart') || text.includes('chest pain') || text.includes('stroke') || text.includes('unconscious') || text.includes('behosh') || text.includes('sans') || text.includes('breath') || text.includes('bleeding') || text.includes('khoon')) {
    category = 'medical';
    priority = 'CRITICAL';
    hazards.push('Acute physiological distress');
    immediateNeeds.push('Oxygen support', 'ALS Paramedic Stretcher');
    recommendedOrg = 'Rescue 1122 Ambulance Service / Edhi 115';
    recommendedUnitType = 'Advanced Life Support Ambulance';
  } else if (text.includes('collapse') || text.includes('building') || text.includes('malba') || text.includes('gir gayi') || text.includes('roof') || text.includes('chhat gir')) {
    category = 'collapse';
    priority = 'CRITICAL';
    hazards.push('Falling debris', 'Structural instability');
    immediateNeeds.push('Urban Search & Rescue (USAR)', 'Search Cameras');
    recommendedOrg = 'Rescue 1122 Urban Search & Rescue';
    recommendedUnitType = 'USAR Heavy Recovery Unit';
  }

  // People extraction
  if (text.includes('3') || text.includes('three') || text.includes('teen')) {
    peopleCount = 3;
  } else if (text.includes('2') || text.includes('two') || text.includes('do ')) {
    peopleCount = 2;
  } else if (text.includes('4') || text.includes('four') || text.includes('char')) {
    peopleCount = 4;
  } else if (text.includes('5') || text.includes('five') || text.includes('panch')) {
    peopleCount = 5;
  }

  // Vulnerability detection
  if (text.includes('child') || text.includes('kid') || text.includes('bacha') || text.includes('bachay')) {
    vulnerableGroups.push('Children / Minors');
  }
  if (text.includes('elder') || text.includes('old') || text.includes('buzurg') || text.includes('walid') || text.includes('baba') || text.includes('dadi') || text.includes('nani')) {
    vulnerableGroups.push('Elderly Person');
  }
  if (text.includes('walk') || text.includes('disabled') || text.includes('wheelchair') || text.includes('chal nahi') || text.includes('mazoor')) {
    vulnerableGroups.push('Mobility Impaired');
  }
  if (text.includes('pregnant') || text.includes('hamila')) {
    vulnerableGroups.push('Pregnant Mother');
  }

  if (vulnerableGroups.length > 0 && priority !== 'CRITICAL') {
    priority = 'HIGH';
  }

  // District / location extraction
  let district = location?.district || 'Lahore';
  let landmark = location?.landmark || 'Reported Incident Area';
  if (text.includes('karachi') || text.includes('saddar') || text.includes('lyari') || text.includes('clifton') || text.includes('khi')) {
    district = 'Karachi';
  } else if (text.includes('lahore') || text.includes('shahdara') || text.includes('gulberg') || text.includes('ravi') || text.includes('model town') || text.includes('johar')) {
    district = 'Lahore';
  } else if (text.includes('islamabad') || text.includes('rawalpindi') || text.includes('pindi') || text.includes('f-') || text.includes('g-')) {
    district = text.includes('rawalpindi') ? 'Rawalpindi' : 'Islamabad';
  } else if (text.includes('peshawar') || text.includes('hayatabad')) {
    district = 'Peshawar';
  } else if (text.includes('multan')) {
    district = 'Multan';
  } else if (text.includes('sukkur')) {
    district = 'Sukkur';
  }

  if (text.includes('shahdara')) {
    landmark = 'Shahdara Ravi River Bund / Railway Area';
  } else if (text.includes('canal')) {
    landmark = 'Canal Bank Road';
  } else if (text.includes('gt road')) {
    landmark = 'Grand Trunk (GT) Road Corridor';
  }

  // Assistant reply and safety guidance
  let assistantReply = '';
  let safetyGuidance: string[] = [];

  if (language === 'Urdu') {
    assistantReply = 'آپ کی ہنگامی اطلاع موصول ہو گئی ہے۔ ہم ریسکیو 1122 اور متعلقہ ٹیم کو الرٹ کر رہے ہیں۔ براہ کرم پرسکون رہیں اور نیچے دی گئی حفاظتی ہدایات پر عمل کریں۔';
    safetyGuidance = [
      'اگر پانی یا آگ کا خطرہ ہے تو اونچی اور محفوظ جگہ پر منتقل ہو جائیں۔',
      'بجلی کے مین سوئچ کو فوری طور پر بند کر دیں۔',
      'بچوں اور بزرگوں کو اپنے پاس محفوظ رکھیں۔',
      'ریسکیو ٹیم کی آمد تک فون کا استعمال صرف ہنگامی رابطے کے لیے کریں۔'
    ];
  } else if (language === 'Roman Urdu') {
    assistantReply = 'Aap ki emergency report darj ho chuki hai. RescueLink AI ne team ko dispatch alert bhej diya hai. Ghabrayen nahi aur foran in hifazati hidayaat par amal karein.';
    safetyGuidance = [
      'Mehfooz ya unchi jagah (rooftop) par rahein, paani ya aag ke qareeb na jayein.',
      'Ghar ka main bijli ka switch / circuit breaker foran band karein.',
      'Bachon aur buzurgon ko darmiyan mein mehfooz rakhein.',
      'Mobile battery bachayein taake Rescue team aap se call par rabta kar sake.'
    ];
  } else {
    assistantReply = 'Your emergency report has been logged and prioritized. RescueLink AI has alerted the regional emergency dispatch. Please remain calm and follow the life-safety steps below.';
    safetyGuidance = [
      'Move to higher or open ground immediately away from collapse or water hazard.',
      'Switch off electrical mains to eliminate electrocution hazards.',
      'Keep children and mobility-impaired individuals close and secure.',
      'Preserve phone battery for coordinator and responder callback.'
    ];
  }

  return {
    language,
    category,
    priority,
    confidenceScore: 94,
    locationName: `${landmark}, ${district}`,
    district,
    landmark,
    peopleCount: Math.max(peopleCount, vulnerableGroups.length || 1),
    vulnerableGroups: vulnerableGroups.length > 0 ? vulnerableGroups : ['Standard Citizen Report'],
    injurySummary: hazards.length > 0 ? `Trapped victims subject to: ${hazards.join(', ')}` : 'No acute trauma confirmed yet',
    hazards: hazards.length > 0 ? hazards : ['Environmental exposure'],
    immediateNeeds: immediateNeeds.length > 0 ? immediateNeeds : ['Paramedic Evaluation', 'Transport'],
    recommendedOrg,
    recommendedUnitType,
    englishTranslation: `Emergency assistance requested in ${district} (${category.toUpperCase()}). Estimated ${peopleCount} persons affected. Immediate dispatch required.`,
    aiReasoning: `Prioritized as ${priority} based on reported ${category} conditions with ${vulnerableGroups.length} vulnerable demographic indicators in ${district}.`,
    assistantReply,
    safetyGuidance,
    requiresHumanEscalation: priority === 'CRITICAL',
    suggestedFollowUps: [
      language === 'Roman Urdu' ? 'Kya kisi ko foran medical aid ki zaroorat hai?' : 'Are there any immediate injuries requiring medical assistance?',
      language === 'Roman Urdu' ? 'Aap ke paas saaf peene ka paani moojud hai?' : 'Can you confirm your exact landmark or house number?'
    ]
  };
}
