import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import {
  Send,
  Sparkles,
  MapPin,
  Users,
  AlertTriangle,
  Phone,
  FileEdit,
  CheckCircle2,
  Mic,
  Camera,
  Layers,
  ArrowRight,
  Shield,
  Activity,
} from 'lucide-react';
import { AIExtractionResult, IncidentCategory, PriorityLevel } from '../../types/emergency';

export const CitizenReportView: React.FC<{ onCaseCreated: (caseId: string) => void }> = ({
  onCaseCreated,
}) => {
  const {
    processAIMessage,
    createEmergencyCase,
    selectedLanguage,
    setSelectedLanguage,
    activeCase,
  } = useEmergency();

  const [inputMode, setInputMode] = useState<'ai' | 'form'>('ai');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text:
        selectedLanguage === 'Urdu'
          ? 'ریسکیو لنک اے آئی میں خوش آمدید۔ آپ کیا ایمرجنسی رپورٹ کرنا چاہتے ہیں؟ اپنی زبان (اردو، انگریزی، یا رومن اردو) میں بتائیں یا نیچے دیئے گئے بٹن پر کلک کریں۔'
          : selectedLanguage === 'Roman Urdu'
          ? 'RescueLink AI mein khushamdeed. Aap ko kya emergency pesh aayi hai? Roman Urdu, Urdu ya English mein batayein (jaise: Flood, accident, aag ya medical emergency).'
          : 'Welcome to RescueLink AI. What emergency do you need assistance with? You can report in English, Urdu (اردو), or Roman Urdu.',
      time: 'Just now',
    },
  ]);

  // Review & Confirmation Modal State (FR-03)
  const [extractedDraft, setExtractedDraft] = useState<AIExtractionResult | null>(null);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);

  // Editable Draft Fields
  const [editCategory, setEditCategory] = useState<IncidentCategory>('flood');
  const [editPriority, setEditPriority] = useState<PriorityLevel>('CRITICAL');
  const [editDistrict, setEditDistrict] = useState('Lahore');
  const [editLandmark, setEditLandmark] = useState('');
  const [editPeopleCount, setEditPeopleCount] = useState(3);
  const [editVulnerabilities, setEditVulnerabilities] = useState<string>('2 Children, 1 Elderly');
  const [editReporterName, setEditReporterName] = useState('Citizen');
  const [editCallbackPhone, setEditCallbackPhone] = useState('+92 300 1234567');
  const [editHazards, setEditHazards] = useState('Submerged electrical wires, Rising water level');

  // Quick Prompt Suggestions
  const promptSuggestions = [
    {
      label: '🌊 Shahdara Flood Trapped (PRD Scenario)',
      lang: 'Roman Urdu',
      text: 'Madad chahiye! Shahdara Ravi bund ke qareeb paani ghar mein dakhil ho gaya hai. 4.5 foot paani hai. Hum chhat par phanse hain. Mere 2 bachay hain aur walid sahib jo chal nahi sakte!',
    },
    {
      label: '🚗 Severe Crash on Canal Bank Road',
      lang: 'English',
      text: 'Multiple vehicle collision on Canal Bank Road near Dharampura Underpass, Lahore. Two victims unconscious with head injuries and fuel leak on road.',
    },
    {
      label: '🔥 Gas Cylinder Fire in Karachi Saddar',
      lang: 'Roman Urdu',
      text: 'Karachi Saddar commercial building mein gas cylinder phat gaya hai, 3rd floor par aag lag gayi hai, dhuwan barh raha hai aur log phanse hue hain.',
    },
    {
      label: '🏥 بے ہوش بچہ اور تیز بخار (Urdu)',
      lang: 'Urdu',
      text: 'میرا 4 سالہ بچہ اچانک بے ہوش ہو گیا ہے، تیز بخار اور سانس لینے میں شدید دقت ہے۔ فوری ایمبولینس چاہیئے، جوہر ٹاؤن لاہور۔',
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isProcessing) return;

    const userMsg = {
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const { extraction, reply } = await processAIMessage(text, undefined, {
        district: editDistrict,
        landmark: editLandmark || 'Reported Incident Area',
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      // Populate draft modal (FR-03)
      setExtractedDraft(extraction);
      setEditCategory(extraction.category);
      setEditPriority(extraction.priority);
      setEditDistrict(extraction.district || 'Lahore');
      setEditLandmark(extraction.landmark || extraction.locationName || 'Near Reported Area');
      setEditPeopleCount(extraction.peopleCount || 1);
      setEditVulnerabilities(extraction.vulnerableGroups.join(', ') || 'None specified');
      setEditHazards(extraction.hazards.join(', ') || 'Environmental exposure');

      // Open editable review modal
      setIsDraftModalOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAndSubmitCase = async () => {
    if (!extractedDraft) return;

    let lat = 31.6212;
    let lng = 74.2828;
    if (editDistrict.toLowerCase().includes('karachi')) {
      lat = 24.8607;
      lng = 67.0011;
    } else if (editDistrict.toLowerCase().includes('rawalpindi')) {
      lat = 33.5900;
      lng = 73.0450;
    } else if (editDistrict.toLowerCase().includes('islamabad')) {
      lat = 33.6844;
      lng = 73.0479;
    } else if (editDistrict.toLowerCase().includes('sukkur')) {
      lat = 27.7052;
      lng = 68.8574;
    }

    const newCase = await createEmergencyCase({
      reporterName: editReporterName,
      callbackPhone: editCallbackPhone,
      language: extractedDraft.language,
      category: editCategory,
      priority: editPriority,
      confidenceScore: extractedDraft.confidenceScore,
      location: {
        latitude: lat,
        longitude: lng,
        district: editDistrict,
        landmark: editLandmark,
        address: `${editLandmark}, ${editDistrict}, Pakistan`,
        recordedAt: new Date().toISOString(),
        accuracy: 5,
      },
      description: messages
        .filter((m) => m.sender === 'user')
        .map((m) => m.text)
        .join(' | '),
      translatedDescription: extractedDraft.englishTranslation,
      peopleInfo: {
        count: editPeopleCount,
        vulnerableCategories: editVulnerabilities.split(',').map((s) => s.trim()),
      },
      hazards: editHazards.split(',').map((s) => s.trim()),
      immediateNeeds: extractedDraft.immediateNeeds,
      aiExtraction: extractedDraft,
      chatHistory: messages.map((m, idx) => ({
        id: `chat-${idx}`,
        sender: m.sender === 'user' ? 'citizen' : 'ai',
        body: m.text,
        timestamp: new Date().toISOString(),
      })),
    });

    setIsDraftModalOpen(false);
    onCaseCreated(newCase.id);
  };

  return (
    <div className="space-y-4">
      {/* Precision Emergency Protocol Banner */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
                Immediate Life-Threatening Crisis?
              </h2>
              <span className="font-mono text-xs font-black text-red-600 bg-red-100 px-2 py-0.5 rounded">
                DIAL 1122
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Call official state emergency services immediately. RescueLink AI coordinates verified team dispatch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <a
            href="tel:1122"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>Call 1122 Now</span>
          </a>
          <a
            href="tel:115"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs px-3.5 py-2.5 rounded-xl transition shadow-xs"
          >
            <span>Edhi 115</span>
          </a>
        </div>
      </div>

      {/* Main Reporting Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Header Tabs */}
        <div className="border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between flex-wrap gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Emergency AI Agent (Urdu / English / Roman Urdu)
              </h3>
              <p className="text-[11px] text-slate-500">
                Natural language emergency triage, urgency detection & dispatcher verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setInputMode('ai')}
              className={`px-3 py-1.5 rounded-md font-bold transition ${
                inputMode === 'ai'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              AI Assistant
            </button>
            <button
              onClick={() => setInputMode('form')}
              className={`px-3 py-1.5 rounded-md font-bold transition ${
                inputMode === 'form'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              Direct Form
            </button>
          </div>
        </div>

        {/* AI Conversation View */}
        {inputMode === 'ai' ? (
          <div className="flex flex-col h-[520px]">
            {/* Quick Prompt Chips */}
            <div className="bg-slate-50 border-b border-slate-200 p-3 overflow-x-auto no-scrollbar">
              <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <span>Select a sample scenario to test triage:</span>
              </div>
              <div className="flex gap-2">
                {promptSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.text)}
                    className="shrink-0 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs px-3 py-2 rounded-xl text-left transition hover:border-red-500 shadow-xs"
                  >
                    <div className="font-bold text-red-600 text-[11px]">{item.label}</div>
                    <div className="text-[10px] text-slate-600 line-clamp-1 max-w-[260px] mt-0.5">{item.text}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/30">
              {messages.map((m, idx) => {
                const isUser = m.sender === 'user';
                const isUrdu = /[\u0600-\u06FF]/.test(m.text);
                return (
                  <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-xs ${
                        isUser
                          ? 'bg-red-600 text-white rounded-br-sm'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1 text-[11px] opacity-80">
                        <span className="font-bold">
                          {isUser ? 'You (Citizen)' : 'RescueLink AI Triage'}
                        </span>
                        <span className="font-mono text-[10px]">{m.time}</span>
                      </div>
                      <p className={`text-xs sm:text-sm leading-relaxed ${isUrdu ? 'font-urdu text-right text-base text-slate-900' : ''}`}>
                        {m.text}
                      </p>
                    </div>
                  </div>
                );
              })}

              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-3.5 flex items-center gap-2.5 text-xs text-red-600 font-bold shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    <span>Analyzing emergency report with Gemini AI...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Describe your emergency in English, Urdu or Roman Urdu..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isProcessing}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold p-2.5 rounded-xl shadow-xs transition active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 px-1 font-mono">
                <span>Dialects: English · Urdu · Roman Urdu</span>
                <span>Editable review before dispatcher dispatch</span>
              </div>
            </div>
          </div>
        ) : (
          /* Direct Form Flow */
          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Emergency Category *
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as IncidentCategory)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                >
                  <option value="flood">Flood / Drowning Emergency (سیلاب)</option>
                  <option value="medical">Medical / Cardiac / Respiratory (طبی امداد)</option>
                  <option value="accident">Traffic Accident / Collision (حادثہ)</option>
                  <option value="fire">Structure Fire / Gas Explosion (آگ)</option>
                  <option value="collapse">Building / Roof Collapse (عمارت گرنا)</option>
                  <option value="trapped">Trapped Individuals (پھنسے ہوئے لوگ)</option>
                  <option value="shelter">Relief & Safe Shelter Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  District / City in Pakistan *
                </label>
                <select
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                >
                  <option value="Lahore">Lahore (لاہور)</option>
                  <option value="Karachi">Karachi (کراچی)</option>
                  <option value="Rawalpindi">Rawalpindi (راولپنڈی)</option>
                  <option value="Islamabad">Islamabad (اسلام آباد)</option>
                  <option value="Peshawar">Peshawar (پشاور)</option>
                  <option value="Multan">Multan (ملتان)</option>
                  <option value="Sukkur">Sukkur (سکھر)</option>
                  <option value="Faisalabad">Faisalabad (فیصل آباد)</option>
                  <option value="Quetta">Quetta (کوئٹہ)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Exact Landmark, Street or House Address *
                </label>
                <input
                  type="text"
                  value={editLandmark}
                  onChange={(e) => setEditLandmark(e.target.value)}
                  placeholder="e.g. Street 4, Behind Shahdara Railway Station, near Old Ravi Bridge"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Number of People Affected / Trapped
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editPeopleCount}
                  onChange={(e) => setEditPeopleCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Vulnerable Groups (Children, Elderly, Disabled)
                </label>
                <input
                  type="text"
                  value={editVulnerabilities}
                  onChange={(e) => setEditVulnerabilities(e.target.value)}
                  placeholder="e.g. 2 children, 1 wheelchair-bound elder"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Reporter Name
                </label>
                <input
                  type="text"
                  value={editReporterName}
                  onChange={(e) => setEditReporterName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Callback Phone Number (+92 3XX-XXXXXXX) *
                </label>
                <input
                  type="text"
                  value={editCallbackPhone}
                  onChange={(e) => setEditCallbackPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={async () => {
                  const fallbackResult = {
                    language: selectedLanguage,
                    category: editCategory,
                    priority: editPriority,
                    confidenceScore: 92,
                    locationName: `${editLandmark}, ${editDistrict}`,
                    district: editDistrict,
                    landmark: editLandmark,
                    peopleCount: editPeopleCount,
                    vulnerableGroups: editVulnerabilities.split(',').map((s) => s.trim()),
                    injurySummary: 'Self-reported emergency direct form',
                    hazards: editHazards.split(',').map((s) => s.trim()),
                    immediateNeeds: ['Rapid Response Rescue Team'],
                    recommendedOrg: 'Rescue 1122 Punjab / Regional',
                    recommendedUnitType: 'Emergency Response Unit',
                    englishTranslation: `Direct citizen emergency report in ${editDistrict}: ${editCategory}`,
                    aiReasoning: 'Form validated by citizen',
                    assistantReply: 'Case submitted successfully.',
                    safetyGuidance: [
                      'Stay calm and in a safe area.',
                      'Keep callback phone active.',
                      'Follow dispatcher instructions.',
                    ],
                    requiresHumanEscalation: false,
                  };
                  setExtractedDraft(fallbackResult);
                  setIsDraftModalOpen(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-xs transition active:scale-95"
              >
                <span>Review & Submit Case</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FR-03: Editable Confirmation Modal Before Submission */}
      {isDraftModalOpen && extractedDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <FileEdit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    FR-03: Review AI Extraction
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Verify life-critical parameters before transmission to 1122 Dispatch
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-bold">
                Confidence: {extractedDraft.confidenceScore}%
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {/* AI Guidance Highlight */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
                <div className="text-xs font-bold text-red-700 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  Life-Safety Guidance (Citizen Instructions):
                </div>
                <ul className="text-xs text-slate-800 space-y-1 list-disc list-inside">
                  {extractedDraft.safetyGuidance.map((guide, i) => (
                    <li key={i}>{guide}</li>
                  ))}
                </ul>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Incident Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as IncidentCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                  >
                    <option value="flood">Flood / Water Rescue</option>
                    <option value="medical">Medical Emergency</option>
                    <option value="accident">Road / Traffic Crash</option>
                    <option value="fire">Fire / Explosion</option>
                    <option value="collapse">Structure Collapse</option>
                    <option value="trapped">Trapped Persons</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Urgency Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                  >
                    <option value="CRITICAL">CRITICAL (P1)</option>
                    <option value="HIGH">HIGH (P2)</option>
                    <option value="MEDIUM">MEDIUM (P3)</option>
                    <option value="LOW">LOW (P4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">District / City</label>
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Landmark / Street</label>
                  <input
                    type="text"
                    value={editLandmark}
                    onChange={(e) => setEditLandmark(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">People Count</label>
                  <input
                    type="number"
                    value={editPeopleCount}
                    onChange={(e) => setEditPeopleCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Vulnerable Groups</label>
                  <input
                    type="text"
                    value={editVulnerabilities}
                    onChange={(e) => setEditVulnerabilities(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Your Name</label>
                  <input
                    type="text"
                    value={editReporterName}
                    onChange={(e) => setEditReporterName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Callback Phone *</label>
                  <input
                    type="text"
                    value={editCallbackPhone}
                    onChange={(e) => setEditCallbackPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Hazards Identified</label>
                  <input
                    type="text"
                    value={editHazards}
                    onChange={(e) => setEditHazards(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                  />
                </div>
              </div>

              {/* Recommended Organization & Dispatch Routing */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
                <div className="font-bold text-slate-700 mb-1">Recommended Organization & Unit:</div>
                <div className="text-emerald-700 font-bold">{extractedDraft.recommendedOrg}</div>
                <div className="text-slate-800 text-[11px] mt-0.5">{extractedDraft.recommendedUnitType}</div>
                <div className="text-slate-500 text-[11px] mt-1 italic">{extractedDraft.aiReasoning}</div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsDraftModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-4 py-2 rounded-lg transition font-bold"
              >
                Back to Edit
              </button>
              <button
                onClick={handleConfirmAndSubmitCase}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-xs transition active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Dispatch Case</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
