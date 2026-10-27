/**
 * The voices a workspace can narrate with.
 *
 * Two kinds on one shelf. SwishX voices are stock: there to preview and use,
 * never changed. Team voices are cloned from a real person's recording, so
 * each one carries what was said about whose voice it is and the consent to
 * use it — pharma narrators are usually real doctors and presenters, and the
 * record has to survive an audit, not just a toast.
 *
 * A voice is tagged with the language it was recorded in and a gender, the
 * two things a project picker filters on first.
 */

export type VoiceGender = "Female" | "Male" | "Neutral";

export const VOICE_GENDERS: VoiceGender[] = ["Female", "Male", "Neutral"];

export const VOICE_STYLES = ["Calm", "Warm", "Friendly", "Professional", "Authoritative", "Energetic"] as const;
export type VoiceStyle = (typeof VOICE_STYLES)[number];

export interface VoiceLanguage {
  id: string;
  label: string;
  /** For the browser preview. */
  bcp47: string;
  /** The accent a voice recorded in it is tagged with by default. */
  accent: string;
  /** What the teleprompter shows: a minute or less of plain, even reading. */
  script: string[];
}

/**
 * The languages a voice can be recorded in. English first, then the Indian
 * languages the field teams detail in, then the rest. Each has a short script
 * for the teleprompter: no claims, no product names, nothing that would need
 * review — just sentences that cover the sounds of the language at an even pace.
 */
export const VOICE_LANGUAGES: VoiceLanguage[] = [
  {
    id: "en-IN",
    label: "English (India)",
    bcp47: "en-IN",
    accent: "Indian English",
    script: [
      "Hello. This recording is for our team's videos.",
      "I'm speaking clearly and at an even pace, the way I'd explain something to a colleague across the table.",
      "Good evidence deserves a clear voice, so I'll take my time with every word.",
      "A quiet room helps the voice sound natural, and a steady distance from the microphone keeps it even.",
    ],
  },
  {
    id: "en-US",
    label: "English (US)",
    bcp47: "en-US",
    accent: "American English",
    script: [
      "Hello. This recording is for our team's videos.",
      "I'm speaking clearly and at an even pace, the way I'd explain something to a colleague across the table.",
      "Good evidence deserves a clear voice, so I'll take my time with every word.",
      "A quiet room helps the voice sound natural, and a steady distance from the microphone keeps it even.",
    ],
  },
  {
    id: "en-GB",
    label: "English (UK)",
    bcp47: "en-GB",
    accent: "British English",
    script: [
      "Hello. This recording is for our team's videos.",
      "I'm speaking clearly and at an even pace, the way I'd explain something to a colleague across the table.",
      "Good evidence deserves a clear voice, so I'll take my time over every word.",
      "A quiet room helps the voice sound natural, and a steady distance from the microphone keeps it even.",
    ],
  },
  {
    id: "hi",
    label: "Hindi",
    bcp47: "hi-IN",
    accent: "Hindi",
    script: [
      "नमस्ते। यह रिकॉर्डिंग हमारी टीम के वीडियो के लिए है।",
      "साफ़ और एक जैसी गति से बोलें, जैसे किसी साथी को कुछ समझा रहे हों।",
      "हर शब्द को आराम से और स्पष्ट रूप से कहें।",
      "शांत कमरे में आवाज़ सबसे स्वाभाविक लगती है।",
    ],
  },
  {
    id: "bn",
    label: "Bengali",
    bcp47: "bn-IN",
    accent: "Bengali",
    script: [
      "নমস্কার। এই রেকর্ডিং আমাদের দলের ভিডিওর জন্য।",
      "পরিষ্কারভাবে, একই গতিতে কথা বলুন, যেন কোনো সহকর্মীকে কিছু বোঝাচ্ছেন।",
      "শান্ত ঘরে কণ্ঠস্বর সবচেয়ে স্বাভাবিক শোনায়।",
    ],
  },
  {
    id: "mr",
    label: "Marathi",
    bcp47: "mr-IN",
    accent: "Marathi",
    script: [
      "नमस्कार. हे रेकॉर्डिंग आमच्या टीमच्या व्हिडिओसाठी आहे.",
      "स्पष्ट आणि एकसारख्या गतीने बोला, जणू एखाद्या सहकाऱ्याला काही समजावून सांगत आहात.",
      "शांत खोलीत आवाज सर्वात नैसर्गिक वाटतो.",
    ],
  },
  {
    id: "ta",
    label: "Tamil",
    bcp47: "ta-IN",
    accent: "Tamil",
    script: [
      "வணக்கம். இந்தப் பதிவு எங்கள் குழுவின் வீடியோக்களுக்காக.",
      "ஒரு சக ஊழியருக்கு விளக்குவது போல, தெளிவாகவும் சீரான வேகத்திலும் பேசுங்கள்.",
      "அமைதியான அறையில் குரல் இயல்பாக ஒலிக்கும்.",
    ],
  },
  {
    id: "te",
    label: "Telugu",
    bcp47: "te-IN",
    accent: "Telugu",
    script: [
      "నమస్కారం. ఈ రికార్డింగ్ మా బృందం వీడియోల కోసం.",
      "ఒక సహోద్యోగికి వివరిస్తున్నట్లుగా, స్పష్టంగా మరియు ఒకే వేగంతో మాట్లాడండి.",
      "నిశ్శబ్ద గదిలో గొంతు సహజంగా వినిపిస్తుంది.",
    ],
  },
  {
    id: "gu",
    label: "Gujarati",
    bcp47: "gu-IN",
    accent: "Gujarati",
    script: [
      "નમસ્તે. આ રેકોર્ડિંગ અમારી ટીમના વીડિયો માટે છે.",
      "કોઈ સહકર્મીને સમજાવતા હો તેમ, સ્પષ્ટ અને એકસરખી ગતિએ બોલો.",
      "શાંત રૂમમાં અવાજ સૌથી સ્વાભાવિક લાગે છે.",
    ],
  },
  {
    id: "kn",
    label: "Kannada",
    bcp47: "kn-IN",
    accent: "Kannada",
    script: [
      "ನಮಸ್ಕಾರ. ಈ ರೆಕಾರ್ಡಿಂಗ್ ನಮ್ಮ ತಂಡದ ವೀಡಿಯೊಗಳಿಗಾಗಿ.",
      "ಸಹೋದ್ಯೋಗಿಗೆ ವಿವರಿಸುವಂತೆ, ಸ್ಪಷ್ಟವಾಗಿ ಮತ್ತು ಒಂದೇ ವೇಗದಲ್ಲಿ ಮಾತನಾಡಿ.",
      "ಶಾಂತ ಕೋಣೆಯಲ್ಲಿ ಧ್ವನಿ ಸಹಜವಾಗಿ ಕೇಳಿಸುತ್ತದೆ.",
    ],
  },
  {
    id: "ml",
    label: "Malayalam",
    bcp47: "ml-IN",
    accent: "Malayalam",
    script: [
      "നമസ്കാരം. ഈ റെക്കോർഡിംഗ് ഞങ്ങളുടെ ടീമിന്റെ വീഡിയോകൾക്കുള്ളതാണ്.",
      "ഒരു സഹപ്രവർത്തകനോട് വിശദീകരിക്കുന്നതുപോലെ, വ്യക്തമായും ഒരേ വേഗത്തിലും സംസാരിക്കുക.",
      "ശാന്തമായ മുറിയിൽ ശബ്ദം സ്വാഭാവികമായി കേൾക്കും.",
    ],
  },
  {
    id: "pa",
    label: "Punjabi",
    bcp47: "pa-IN",
    accent: "Punjabi",
    script: [
      "ਸਤ ਸ੍ਰੀ ਅਕਾਲ। ਇਹ ਰਿਕਾਰਡਿੰਗ ਸਾਡੀ ਟੀਮ ਦੀਆਂ ਵੀਡੀਓਜ਼ ਲਈ ਹੈ।",
      "ਸਾਫ਼ ਅਤੇ ਇੱਕੋ ਜਿਹੀ ਰਫ਼ਤਾਰ ਨਾਲ ਬੋਲੋ, ਜਿਵੇਂ ਕਿਸੇ ਸਾਥੀ ਨੂੰ ਕੁਝ ਸਮਝਾ ਰਹੇ ਹੋਵੋ।",
      "ਸ਼ਾਂਤ ਕਮਰੇ ਵਿੱਚ ਆਵਾਜ਼ ਸਭ ਤੋਂ ਕੁਦਰਤੀ ਲੱਗਦੀ ਹੈ।",
    ],
  },
  {
    id: "es",
    label: "Spanish",
    bcp47: "es-ES",
    accent: "Spanish",
    script: [
      "Hola. Esta grabación es para los vídeos de nuestro equipo.",
      "Habla con claridad y a un ritmo constante, como si le explicaras algo a un colega.",
      "En una habitación tranquila, la voz suena más natural.",
    ],
  },
  {
    id: "fr",
    label: "French",
    bcp47: "fr-FR",
    accent: "French",
    script: [
      "Bonjour. Cet enregistrement est destiné aux vidéos de notre équipe.",
      "Parlez clairement, à un rythme régulier, comme si vous expliquiez quelque chose à un collègue.",
      "Dans une pièce calme, la voix sonne plus naturelle.",
    ],
  },
  {
    id: "de",
    label: "German",
    bcp47: "de-DE",
    accent: "German",
    script: [
      "Hallo. Diese Aufnahme ist für die Videos unseres Teams.",
      "Sprechen Sie deutlich und in gleichmäßigem Tempo, als würden Sie einem Kollegen etwas erklären.",
      "In einem ruhigen Raum klingt die Stimme am natürlichsten.",
    ],
  },
  {
    id: "pt",
    label: "Portuguese",
    bcp47: "pt-BR",
    accent: "Brazilian Portuguese",
    script: [
      "Olá. Esta gravação é para os vídeos da nossa equipe.",
      "Fale com clareza e num ritmo constante, como se estivesse explicando algo a um colega.",
      "Em um ambiente silencioso, a voz soa mais natural.",
    ],
  },
  {
    id: "ja",
    label: "Japanese",
    bcp47: "ja-JP",
    accent: "Japanese",
    script: [
      "こんにちは。この録音は私たちのチームの動画のためのものです。",
      "同僚に説明するように、はっきりと一定のペースで話してください。",
      "静かな部屋では、声がより自然に聞こえます。",
    ],
  },
];

export function voiceLanguage(id: string): VoiceLanguage {
  return VOICE_LANGUAGES.find((l) => l.id === id) ?? VOICE_LANGUAGES[0];
}

/** Whose voice it is, and the proof that it may be used. */
export interface VoiceConsent {
  whose: "own" | "other";
  /** The person speaking, when it isn't the person who cloned it. */
  person?: string;
  /** The signed consent form, kept on the record. */
  file?: string;
  /** Who confirmed it, and when. */
  confirmedBy: string;
  confirmedOn: string;
}

export interface Voice {
  id: string;
  name: string;
  source: "team" | "swishx";
  languageId: string;
  gender: VoiceGender;
  accent: string;
  style: VoiceStyle;
  description?: string;
  /** How a team voice was made. */
  method?: "recorded" | "uploaded";
  /** Seconds of audio it was cloned from. */
  seconds?: number;
  /** The recording it was cloned from. Session-only. */
  sampleUrl?: string;
  /** What the clone reads when previewed, set when it was cloned. */
  sampleLine?: string;
  /** How closely the clone matched the recording, 0–100. */
  similarity?: number;
  /** Background noise taken out before cloning. */
  cleaned?: boolean;
  consent?: VoiceConsent;
  createdBy?: string;
  createdOn: string;
  updatedOn: string;
  /** Projects narrated with it. */
  usedIn?: number;
  archived?: boolean;
  /** Seeded, so it reads as reference rather than the team's own. */
  example?: boolean;
}

/** SwishX's own voices: preview and use, nothing to change. */
export const STOCK_VOICES: Voice[] = [
  { id: "sx-rohan", name: "Rohan", source: "swishx", languageId: "en-IN", gender: "Male", accent: "Indian English", style: "Authoritative", description: "Clear and measured.", createdOn: "", updatedOn: "" },
  { id: "sx-riya", name: "Riya", source: "swishx", languageId: "en-IN", gender: "Female", accent: "Indian English", style: "Friendly", description: "Friendly and clear.", createdOn: "", updatedOn: "" },
  { id: "sx-dev", name: "Dev", source: "swishx", languageId: "en-IN", gender: "Male", accent: "Indian English", style: "Warm", description: "Warm and conversational.", createdOn: "", updatedOn: "" },
  { id: "sx-sarah", name: "Sarah", source: "swishx", languageId: "en-US", gender: "Female", accent: "American English", style: "Calm", description: "Calm and reassuring.", createdOn: "", updatedOn: "" },
  { id: "sx-marcus", name: "Marcus", source: "swishx", languageId: "en-US", gender: "Male", accent: "American English", style: "Professional", description: "Deep and steady.", createdOn: "", updatedOn: "" },
  { id: "sx-elena", name: "Elena", source: "swishx", languageId: "es", gender: "Female", accent: "Spanish", style: "Warm", description: "Warm and expressive.", createdOn: "", updatedOn: "" },
  { id: "sx-liam", name: "Liam", source: "swishx", languageId: "en-GB", gender: "Male", accent: "British English", style: "Professional", description: "Crisp and precise.", createdOn: "", updatedOn: "" },
  { id: "sx-priya", name: "Priya", source: "swishx", languageId: "hi", gender: "Female", accent: "Hindi", style: "Calm", description: "Soft and empathetic.", createdOn: "", updatedOn: "" },
];

/** What this workspace has already cloned, so the shelf isn't empty on day one. */
export const EXAMPLE_TEAM_VOICES: Voice[] = [
  {
    id: "tv-maya",
    name: "Dr. Maya Kapoor",
    source: "team",
    languageId: "en-IN",
    gender: "Female",
    accent: "Indian English",
    style: "Warm",
    description: "Our dermatology KOL. Used for patient explainers.",
    method: "uploaded",
    seconds: 42,
    cleaned: true,
    consent: { whose: "other", person: "Dr. Maya Kapoor", file: "Maya-Kapoor-voice-consent.pdf", confirmedBy: "Siva Gnanam", confirmedOn: "Sep 12, 2026" },
    createdBy: "Siva Gnanam",
    createdOn: "Sep 12, 2026",
    updatedOn: "Sep 12, 2026",
    usedIn: 4,
    example: true,
  },
  {
    id: "tv-anita",
    name: "Anita Rao · Hindi",
    source: "team",
    languageId: "hi",
    gender: "Female",
    accent: "Hindi",
    style: "Calm",
    description: "Hindi narration for field-force videos.",
    method: "recorded",
    seconds: 24,
    consent: { whose: "own", confirmedBy: "Anita Rao", confirmedOn: "Oct 3, 2026" },
    createdBy: "Anita Rao",
    createdOn: "Oct 3, 2026",
    updatedOn: "Oct 3, 2026",
    usedIn: 2,
    example: true,
  },
  {
    id: "tv-arjun",
    name: "Arjun Mehta",
    source: "team",
    languageId: "en-IN",
    gender: "Male",
    accent: "Indian English",
    style: "Professional",
    description: "Brand manager. HCP updates and internal launches.",
    method: "recorded",
    seconds: 31,
    consent: { whose: "own", confirmedBy: "Arjun Mehta", confirmedOn: "Oct 15, 2026" },
    createdBy: "Arjun Mehta",
    createdOn: "Oct 15, 2026",
    updatedOn: "Oct 15, 2026",
    usedIn: 1,
    example: true,
  },
  {
    id: "tv-launch-2025",
    name: "2025 launch narrator",
    source: "team",
    languageId: "en-US",
    gender: "Male",
    accent: "American English",
    style: "Energetic",
    description: "Agency voice from last year's launch. Contract ended.",
    method: "uploaded",
    seconds: 58,
    consent: { whose: "other", person: "James Holt", file: "Holt-agency-release-2025.pdf", confirmedBy: "Siva Gnanam", confirmedOn: "Jan 20, 2025" },
    createdBy: "Siva Gnanam",
    createdOn: "Jan 20, 2025",
    updatedOn: "Aug 2, 2026",
    usedIn: 6,
    archived: true,
    example: true,
  },
];
