import React, { useState } from 'react';
import { ShieldCheck, Waves, Flame, HeartPulse, Zap, AlertOctagon, ChevronDown, ChevronUp } from 'lucide-react';

interface Guide {
  id: string;
  icon: any;
  titleEn: string;
  titleUrdu: string;
  category: string;
  stepsEn: string[];
  stepsUrdu: string[];
}

export const CitizenSafetyGuidesView: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('flood');

  const guides: Guide[] = [
    {
      id: 'flood',
      icon: Waves,
      titleEn: 'Urban Flood & Inundation Survival',
      titleUrdu: 'سیلاب اور پانی میں گھر جانے کی صورت میں احتیاطی تدابیر',
      category: 'Natural Disaster',
      stepsEn: [
        'Move to the highest stable structure (upper floor or concrete rooftop). Avoid tin roofs if water flow is rapid.',
        'Shut off main electrical breaker immediately before water reaches outlet levels to prevent electrocution.',
        'Do not attempt to walk or drive through moving water. Even 6 inches of fast water can knock down an adult.',
        'Tie bright colored cloth or signal with flashlight to attract rescue boats and drones.',
        'Sterilize drinking water: Boil for at least 3 minutes or use halogen water purification tablets.',
      ],
      stepsUrdu: [
        'فوری طور پر گھر کی سب سے اونچی محفوظ جگہ (اوپری منزل یا پکی چھت) پر منتقل ہو جائیں۔',
        'پانی میں اترنے سے پہلے گھر کا مین الیکٹرک سوئچ فوری بند کریں تاکہ کرنٹ لگنے سے بچا جا سکے۔',
        'بہتے ہوئے پانی میں چلنے یا گاڑی چلانے کی ہرگز کوشش نہ کریں۔ چند انچ تیز بہاؤ بھی بہا لے جا سکتا ہے۔',
        'ریسکیو 1122 کی کشتیوں کو متوجہ کرنے کے لیے چھت سے چمکیلا کپڑا یا ٹارچ لہرائیں۔',
        'پینے کے لیے صرف ابلا ہوا یا کلورین والی گولیوں سے صاف کیا گیا پانی استعمال کریں۔',
      ],
    },
    {
      id: 'collapse',
      icon: AlertOctagon,
      titleEn: 'Building & Structural Collapse',
      titleUrdu: 'عمارت یا چھت گرنے کی صورت میں زندگی بچانے کے طریقے',
      category: 'Structural Hazard',
      stepsEn: [
        'If trapped under debris: Protect your mouth and nose with cloth to prevent inhaling dust and silica.',
        'Do not light matches or lighters due to potential fractured gas lines. Use flashlight only.',
        'Tap on pipes or wall beams periodically in intervals of 3 taps so acoustic search equipment can detect you.',
        'Shout only when you hear rescue teams nearby to conserve energy and oxygen.',
        'If you are uninjured outside, stay clear of standing leaning walls which can collapse during aftershocks.',
      ],
      stepsUrdu: [
        'ملبے کے نیچے پھنس جائیں تو ناک اور منہ کو کپڑے سے ڈھانپیں تاکہ گرد اور دھوئیں سے سانس نہ رکے۔',
        'گیس لیکج کے خدشے کی وجہ سے ماچس یا لائٹر ہرگز نہ جلائیں، صرف موبائل ٹارچ استعمال کریں۔',
        'کسی پائپ یا لوہے کے گارڈر پر مسلسل تین ضربیں لگائیں تاکہ ریسکیو ٹیم کے سینسر آپ کی آواز سن سکیں۔',
        'اپنی توانائی اور آکسیجن بچائیں، چیخیں صرف اس وقت جب ریسکیو ٹیم بالکل قریب محسوس ہو۔',
      ],
    },
    {
      id: 'burns',
      icon: Flame,
      titleEn: 'Fire Escape & Severe Burns First-Aid',
      titleUrdu: 'آگ سے بچاؤ اور جھلس جانے کی صورت میں فوری مرہم پٹی',
      category: 'Fire & Thermal',
      stepsEn: [
        'Stay low under smoke: Toxic combustion gases rise to ceiling levels. Crawl on hands and knees.',
        'Check door handles with the back of your hand before opening. If hot, seek an alternative window exit.',
        'If clothes catch fire: Stop, Drop, and Roll immediately. Never run as airflow fans the flames.',
        'For 1st/2nd degree burns: Cool under clean running water for 15 minutes. Never apply ice, butter, or paste.',
        'Cover burns with clean, sterile, non-adherent dressing until Rescue 1122 arrives.',
      ],
      stepsUrdu: [
        'دھوئیں سے بچنے کے لیے فرش کے قریب رہ کر رینگیں۔ زہریلی گیسیں اوپر اٹھتی ہیں۔',
        'دروازہ کھولنے سے پہلے ہاتھ کی الٹی طرف سے ہینڈل چیک کریں، گرم ہو تو ہرگز نہ کھولیں۔',
        'کپڑوں میں آگ لگ جائے تو فوری رکیں، زمین پر لیٹیں اور لڑھکیں، بھاگنے سے آگ تیز ہوتی ہے۔',
        'جلے ہوئے حصے پر 15 منٹ تک صاف ٹھنڈا پانی بہائیں۔ برف، گھی یا ٹوتھ پیسٹ ہرگز نہ لگائیں۔',
        'جلی ہوئی جلد کو صاف خشک کپڑے سے ڈھانپ کر فوری ریسکیو 1122 ایمبولینس کا انتظار کریں۔',
      ],
    },
    {
      id: 'cpr',
      icon: HeartPulse,
      titleEn: 'CPR & Unconscious Victim Care',
      titleUrdu: 'بے ہوشی اور دل بند ہونے پر سی پی آر (CPR) کا طریقہ',
      category: 'Medical Life Support',
      stepsEn: [
        'Check victim responsiveness: Tap shoulders firmly and ask "Aap theek hain?" loudly.',
        'Call 1122 immediately and put the operator on speakerphone.',
        'If victim is not breathing normally: Place hands in center of chest and push hard and fast (100-120 bpm).',
        'Compress chest at least 2 inches deep, allowing complete chest recoil between each push.',
        'Continue CPR without pausing until EMS responders take over or AED defibrillator arrives.',
      ],
      stepsUrdu: [
        'مریض کو کندھوں سے ہلا کر زور سے پوچھیں "کیا آپ ٹھیک ہیں؟" اور ہوش چیک کریں۔',
        'فوری طور پر 1122 پر کال کریں اور موبائل کو اسپیکر پر رکھ کر آپریٹر کی ہدایات سنیں۔',
        'اگر سانس بند ہو تو سینے کے بالکل درمیان میں دونوں ہاتھوں سے تیز اور گہرے دباؤ دیں (100 فی منٹ)۔',
        'ہر دباؤ کے بعد سینے کو واپس اوپر آنے دیں اور مسلسل دباؤ جاری رکھیں۔',
        'جب تک ریسکیو 1122 کی ٹیم نہ پہنچ جائے سی پی آر کا عمل ہرگز نہ روکیں۔',
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Intro */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-zinc-950">
              Verified Emergency Action Guides (اردو اور انگریزی)
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Field-tested first-aid & survival protocols curated for Pakistani domestic environments.
            </p>
          </div>
        </div>
      </div>

      {/* Accordion Guides */}
      <div className="space-y-3">
        {guides.map((guide) => {
          const Icon = guide.icon;
          const isExpanded = expandedId === guide.id;

          return (
            <div
              key={guide.id}
              className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs transition"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : guide.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-zinc-50 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 text-black flex items-center justify-center border border-zinc-200 shrink-0">
                    <Icon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-zinc-500 font-black tracking-wider">
                      {guide.category}
                    </span>
                    <h3 className="font-black text-sm text-zinc-950">{guide.titleEn}</h3>
                    <div className="font-urdu text-xs text-red-600 font-bold mt-0.5">{guide.titleUrdu}</div>
                  </div>
                </div>

                <div className="text-zinc-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-black" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-5 pt-0 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-5 bg-zinc-50/50">
                  {/* English Column */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-black text-zinc-950 uppercase tracking-wider mb-2 font-mono">
                      English Protocol
                    </div>
                    {guide.stepsEn.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-800 bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                        <span className="w-5 h-5 rounded-lg bg-black text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 font-mono">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed font-medium">{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* Urdu Column */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-black text-red-600 uppercase tracking-wider mb-2 text-right font-mono">
                      اردو رہنمائی
                    </div>
                    {guide.stepsUrdu.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-sm text-zinc-950 bg-white p-3 rounded-xl border border-zinc-200 font-urdu justify-end text-right shadow-xs">
                        <span className="leading-relaxed">{step}</span>
                        <span className="w-5 h-5 rounded-lg bg-red-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-1 font-sans">
                          {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
