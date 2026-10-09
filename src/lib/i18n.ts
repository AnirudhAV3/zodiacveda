import { useEffect, useState } from "react";
import { LANGUAGES, LANG_KEY } from "./languages";

export type Dict = {
  brandTag: string;
  heroKicker: string;
  heroTitleA: string;
  heroTitleB: string;
  heroBody: string;
  heroCta: string;
  heroNote: string;
  quotesTitle: string;
  calcKicker: string;
  calcTitle: string;
  calcSub: string;
  available: string;
  navSaved: string;
  navBuild: string;
  langAria: string;
  formLegend: string;
  formPerson1: string;
  formPerson2: string;
  formName: string;
  formNamePh: string;
  formDate: string;
  formTime: string;
  formTimeUnknown: string;
  formCity: string;
  formCityPh: string;
  formSample: string;
  formCustom: string;
  formLocate: string;
  formLat: string;
  formLon: string;
  formTz: string;
  formStyle: string;
  formStyleNote: string;
  formPrivacy: string;
  backCalcs: string;
  guideKickerV: string;
  guideKickerW: string;
  guideIncludes: string;
  guideSteps: string;
  guideFaqs: string;
  guideRelated: string;
  disclaimer: string;
  tabOverview: string;
  tabCharts: string;
  tabHouses: string;
  tabDashas: string;
  tabStrength: string;
  tabYogas: string;
  tabDoshas: string;
  tabReading: string;
  tabLife: string;
  tabLove: string;
  tabWork: string;
  tabMoney: string;
  tabHome: string;
  tabMind: string;
  tabPurpose: string;
  tabNow: string;
  savedTitle: string;
  savedEmpty: string;
  footerContact: string;
  footerOnSite: string;
  footerBuild: string;
  footerWestern: string;
  footerJyotirlinga: string;
  footerMatching: string;
  footerCopyrights: string;
  footerRights: string;
  footerNote: string;
  notice: string;
  calcBuild: string;
  calcWestern: string;
  calcJyotirlinga: string;
  calcMatching: string;
  calcYogas: string;
  calcDoshas: string;
  calcGems: string;
  calcVarga: string;
  calcKaal: string;
  calcMangal: string;
  calcNakshatra: string;
  calcDasha: string;
  calcSade: string;
};

const EN: Dict = {
  brandTag: "Vedic Astrology",
  heroKicker: "Vedic Astrology · Jyotiṣa Śāstra",
  heroTitleA: "Decode the sky",
  heroTitleB: "the moment you were born",
  heroBody: "Precise birth charts, divisional charts, dashas and time-tested predictions of your past, present and future — career, marriage, children, wealth and more.",
  heroCta: "Build Chart",
  heroNote: "Free · No sign-up · Takes 30 seconds",
  quotesTitle: "Wisdom of the stars, in the words of the great",
  calcKicker: "Explore your horoscope",
  calcTitle: "Vedic Astrology Calculators",
  calcSub: "13 calculators ready now, including Western horoscope and the six Jyotirlingas of the 1st, 6th and 9th houses.",
  available: "Available",
  navSaved: "Saved",
  navBuild: "Build Chart",
  langAria: "Choose language",
  formLegend: "Your birth",
  formPerson1: "Person 1",
  formPerson2: "Person 2",
  formName: "Name",
  formNamePh: "As you want it on the report",
  formDate: "Birth date",
  formTime: "Birth time, 24-hour",
  formTimeUnknown: "Time unknown — calculate a noon chart and mark the lagna as approximate",
  formCity: "Birth city",
  formCityPh: "Search Delhi, London, Dubai…",
  formSample: "Use sample",
  formCustom: "Custom coordinates",
  formLocate: "Use this device",
  formLat: "Latitude",
  formLon: "Longitude",
  formTz: "Time zone",
  formStyle: "Chart drawing style",
  formStyleNote: "Changes the drawing only, not the calculation.",
  formPrivacy: "Your report is saved in this browser with an unguessable link. Anyone you share that link with, on this device, can see the birth details. A traditional score is guidance — not a medical test or a guarantee.",
  backCalcs: "← Calculators",
  guideKickerV: "Free Vedic astrology calculator guide",
  guideKickerW: "Western astrology calculator guide",
  guideIncludes: "What the report includes",
  guideSteps: "How to calculate it",
  guideFaqs: "Frequently asked questions",
  guideRelated: "Related Vedic astrology calculators",
  disclaimer: "Astrology is a traditional interpretive system. Calculator results are educational guidance and do not replace professional medical, legal, financial or psychological advice.",
  tabOverview: "Overview",
  tabCharts: "Charts",
  tabHouses: "Houses",
  tabDashas: "Dashas",
  tabStrength: "Strength",
  tabYogas: "Yogas",
  tabDoshas: "Doshas",
  tabReading: "Reading",
  tabLife: "Life",
  tabLove: "Love",
  tabWork: "Work",
  tabMoney: "Money",
  tabHome: "Home",
  tabMind: "Mind",
  tabPurpose: "Purpose",
  tabNow: "This chapter",
  savedTitle: "Saved reports",
  savedEmpty: "No reports saved in this browser yet.",
  footerContact: "Contact",
  footerOnSite: "On this site",
  footerBuild: "Build your horoscope",
  footerWestern: "Western horoscope",
  footerJyotirlinga: "Jyotirlingas",
  footerMatching: "Marriage matching",
  footerCopyrights: "Copyrights",
  footerRights: "All rights reserved.",
  footerNote: "Zodiac Veda · Sidereal zodiac, Lahiri ayanamsa · Astrology is a traditional system of interpretation; use predictions for guidance and reflection.",
  notice: "The interface is translated. Detailed results and long readings still appear in English while this translation is completed.",
  calcBuild: "Build Your Horoscope",
  calcWestern: "Western Horoscope",
  calcJyotirlinga: "Jyotirlingas to Visit",
  calcMatching: "Marriage Horoscope Matching",
  calcYogas: "All Yogas",
  calcDoshas: "All Doshas",
  calcGems: "Gemstone Calculator",
  calcVarga: "All Divisional Charts",
  calcKaal: "Kaal Sarp Dosha",
  calcMangal: "Kuja / Mangal Dosha",
  calcNakshatra: "Nakshatra & Rashi",
  calcDasha: "Vimshottari Dasha",
  calcSade: "Sade Sati",
};

export const DICTS: Record<string, Partial<Dict>> = {
  hi: {
    brandTag: "वैदिक ज्योतिष", heroKicker: "वैदिक ज्योतिष · ज्योतिष् शास्त्र", heroTitleA: "आकाश को पढ़ें", heroTitleB: "जिस क्षण आप जन्मे",
    heroBody: "सटीक जन्म कुंडली, डिवीज़नल चार्ट, दशाएँ और आपके अतीत, वर्तमान और भविष्य की परखी हुई भविष्यवाणियाँ — करियर, विवाह, संतान, धन और बहुत कुछ।",
    heroCta: "कुंडली बनाएँ", heroNote: "निःशुल्क · कोई साइन-अप नहीं · 30 सेकंड में", quotesTitle: "महान लोगों की आवाज़ में तारों का ज्ञान",
    calcKicker: "अपनी कुंडली देखें", calcTitle: "वैदिक ज्योतिष कैलकुलेटर", calcSub: "13 कैलकुलेटर तैयार — पश्चिमी राशि चक्र और पहले, छठे तथा नौवें भाव के छह ज्योतिर्लिंग के साथ।",
    available: "उपलब्ध", navSaved: "सहेजे गए", navBuild: "कुंडली बनाएँ", langAria: "भाषा चुनें",
    formLegend: "आपका जन्म", formPerson1: "व्यक्ति 1", formPerson2: "व्यक्ति 2", formName: "नाम", formNamePh: "रिपोर्ट पर जैसा दिखे",
    formDate: "जन्म तिथि", formTime: "जन्म समय, 24-घंटे", formTimeUnknown: "समय अज्ञात — दोपहर 12 बजे की कुंडली बनाएँ और लग्न को अनुमानित बताएँ",
    formCity: "जन्म स्थान", formCityPh: "दिल्ली, लंदन, दुबाई खोजें…", formSample: "नमूना भरें", formCustom: "निर्देशांक स्वयं डालें", formLocate: "इस डिवाइस का उपयोग करें",
    formLat: "अक्षांश", formLon: "देशांतर", formTz: "समय क्षेत्र", formStyle: "चार्ट बनाने का तरीका", formStyleNote: "यह केवल चित्र बदलता है, गणना नहीं।",
    formPrivacy: "आपकी रिपोर्ट इस ब्राउज़र में एक अनुमान-रहित लिंक के साथ सहेजी जाती है। जिसे आप वह लिंक देंगे, वही जन्म विवरण देख सकेगा। पारंपरिक स्कोर मार्गदर्शन है — कोई चिकित्सा परीक्षा या विवाह की गारंटी नहीं।",
    backCalcs: "← कैलकुलेटर", guideKickerV: "निःशुल्क वैदिक ज्योतिष कैलकुलेटर गाइड", guideKickerW: "पश्चिमी ज्योतिष कैलकुलेटर गाइड",
    guideIncludes: "रिपोर्ट में क्या शामिल है", guideSteps: "गणना कैसे करें", guideFaqs: "अक्सर पूछे जाने वाले प्रश्न", guideRelated: "संबंधित वैदिक ज्योतिष कैलकुलेटर",
    disclaimer: "ज्योतिष एक पारंपरिक व्याख्या पद्धति है। कैलकुलेटर के परिणाम शैक्षिक मार्गदर्शन हैं और पेशेवर चिकित्सा, कानूनी, वित्तीय या मनोवैज्ञानिक सलाह का विकल्प नहीं हैं।",
    tabOverview: "सारांश", tabCharts: "चार्ट", tabHouses: "भाव", tabDashas: "दशाएँ", tabStrength: "बल", tabYogas: "योग", tabDoshas: "दोष", tabReading: "पठन",
    tabLife: "जीवन", tabLove: "प्रेम", tabWork: "कार्य", tabMoney: "धन", tabHome: "गृह", tabMind: "मन", tabPurpose: "उद्देश्य", tabNow: "यह अध्याय",
    savedTitle: "सहेजी गई रिपोर्ट", savedEmpty: "इस ब्राउज़र में अभी कोई रिपोर्ट सहेजी नहीं गई।",
    footerContact: "संपर्क", footerOnSite: "इस साइट पर", footerBuild: "अपनी कुंडली बनाएँ", footerWestern: "पश्चिमी राशि चक्र", footerJyotirlinga: "ज्योतिर्लिंग",
    footerMatching: "विवाह मिलान", footerCopyrights: "कॉपीराइट", footerRights: "सर्वाधिकार सुरक्षित।",
    footerNote: "जोडियाक वेदा · निरयन राशि, लाहिरी अयनांश · ज्योतिष पारंपरिक व्याख्या पद्धति है; भविष्यवाणी का उपयोग मार्गदर्शन और आत्मचिंतन के लिए करें।",
    notice: "इंटरफ़ेस अनुवादित है। विस्तृत परिणाम और लंबे पठन अभी अंग्रेज़ी में हैं।",
    calcBuild: "अपनी कुंडली बनाएँ", calcWestern: "पश्चिमी राशि चक्र", calcJyotirlinga: "भेटने योग्य ज्योतिर्लिंग", calcMatching: "विवाह कुंडली मिलान",
    calcYogas: "सभी योग", calcDoshas: "सभी दोष", calcGems: "रत्न कैलकुलेटर", calcVarga: "सभी डिवीज़नल चार्ट", calcKaal: "काल सर्प दोष",
    calcMangal: "कुज / मंगल दोष", calcNakshatra: "नक्षत्र और राशि", calcDasha: "विंशोत्तरी दशा", calcSade: "साढ़े साती",
  },
  bn: {
    brandTag: "বৈদিক জ্যোতিষ", heroKicker: "বৈদিক জ্যোতিষ · জ্যোতিষ্ শাস্ত্র", heroTitleA: "আকাশ পড়ুন", heroTitleB: "আপনি জন্মিয়েছিলেন সেই মুহূর্তে",
    heroBody: "নিখুঁত জন্মকুণ্ডলী, বিভাজন চার্ট, দশা এবং অতীত, বর্তমান ও ভবিষ্যৎের পরীক্ষিত পূর্বাভাস — কর্মজীবন, বিবাহ, সন্তান, সম্পদ ও আরও অনেক কিছু।",
    heroCta: "কুণ্ডলী বানান", heroNote: "বিনামূল্যে · কোনো সাইন-আপ নেই · ৩০ সেকেন্ডে", quotesTitle: "মহাপুরুষদের কথায় তারাের জ্ঞান",
    calcKicker: "আপনার কুণ্ডলী দেখুন", calcTitle: "বৈদিক জ্যোতিষ ক্যালকুলেটর", calcSub: "১৩টি ক্যালকুলেটর প্রস্তুত — পশ্চিমী রাশিচক্র এবং প্রথম, ষষ্ঠ ও নবম ভাবের ছয়টি জ্যোতির্লিংসহ।",
    available: "উপলব্ধ", navSaved: "সংরক্ষিত", navBuild: "কুণ্ডলী বানান", langAria: "ভাষা নির্বাচন করুন",
    formLegend: "আপনার জন্ম", formPerson1: "ব্যক্তি ১", formPerson2: "ব্যক্তি ২", formName: "নাম", formNamePh: "রিপোর্টে যেভাবে দেখাতে চান",
    formDate: "জন্ম তারিখ", formTime: "জন্ম সময়, ২৪-ঘণ্টা", formTimeUnknown: "সময় অজানা — দুপুর ১২টায় কুণ্ডলী বানান এবং লগ্নকে আনুমানিক ধরুন",
    formCity: "জন্ম শহর", formCityPh: "দিল্লি, লন্ডন, দুবাই খুঁজুন…", formSample: "নমুনা ভরুন", formCustom: "নির্দেশাংক নিজে লিখুন", formLocate: "এই ডিভাইস ব্যবহার করুন",
    formLat: "অক্ষাংশ", formLon: "দ্রাঘিমাংশ", formTz: "সময় অঞ্চল", formStyle: "চার্ট আঁকার ধরন", formStyleNote: "এটি কেবল চিত্র বদলায়, হিসাব নয়।",
    formPrivacy: "আপনার রিপোর্ট এই ব্রাউজারে অনুমান-কঠিন একটি লিংকে সংরক্ষিত হয়। যে লিংকটি আপনি দেবেন, তিনিই জন্মের বিবরণ দেখতে পারবেন। পারম্পরিক স্কোর দিশনির্দেশ — কোনো চিকিৎসা পরীক্ষা বা বিবাহের নিশ্চয়তা নয়।",
    backCalcs: "← ক্যালকুলেটর", guideKickerV: "বিনামূল্যে বৈদিক জ্যোতিষ ক্যালকুলেটর গাইড", guideKickerW: "পশ্চিমী জ্যোতিষ ক্যালকুলেটর গাইড",
    guideIncludes: "রিপোর্টে যা থাকছে", guideSteps: "কীভাবে হিসাব করবেন", guideFaqs: "প্রায়শই জিজ্ঞাসিত প্রশ্ন", guideRelated: "সম্পর্কিত বৈদিক জ্যোতিষ ক্যালকুলেটর",
    disclaimer: "জ্যোতিষ একটি পারম্পরিক ব্যাখ্যাপদ্ধতি। ক্যালকুলেটরের ফলাফল শিক্ষামূলক দিশনির্দেশ এবং পেশাদার চিকিৎসা, আইনি, আর্থিক বা মানসিক পরামর্শের বিকল্প নয়।",
    tabOverview: "সারসংক্ষেপ", tabCharts: "চার্ট", tabHouses: "ভাব", tabDashas: "দশা", tabStrength: "বল", tabYogas: "যোগ", tabDoshas: "দোষ", tabReading: "পঠন",
    tabLife: "জীবন", tabLove: "প্রেম", tabWork: "কর্ম", tabMoney: "সম্পদ", tabHome: "গৃহ", tabMind: "মন", tabPurpose: "উদ্দেশ্য", tabNow: "এই অধ্যায়",
    savedTitle: "সংরক্ষিত রিপোর্ট", savedEmpty: "এই ব্রাউজারে এখনও কোনো রিপোর্ট সংরক্ষিত হয়নি।",
    footerContact: "যোগাযোগ", footerOnSite: "এই সাইটে", footerBuild: "আপনার কুণ্ডলী বানান", footerWestern: "পশ্চিমী রাশিচক্র", footerJyotirlinga: "জ্যোতির্লিং",
    footerMatching: "বিবাহ মিলন", footerCopyrights: "কপিরাইট", footerRights: "সর্বস্বত্ব সংরক্ষিত।",
    footerNote: "জোডিয়াক বেদা · নিরয়ন রাশি, লাহিরি অয়নাংশ · জ্যোতিষ পারম্পরিক ব্যাখ্যাপদ্ধতি; পূর্বাভাস দিশানির্দেশ ও আত্মচিন্তণের জন্য ব্যবহার করুন।",
    notice: "ইন্টারফেস অনুবাদিত। বিস্তারিত ফলাফল ও দীর্ঘ পঠন এখনও ইংরেজিতে দেখানো হচ্ছে।",
    calcBuild: "আপনার কুণ্ডলী বানান", calcWestern: "পশ্চিমী রাশিচক্র", calcJyotirlinga: "দর্শনীয় জ্যোতির্লিং", calcMatching: "বিবাহ কুণ্ডলী মিলন",
    calcYogas: "সব যোগ", calcDoshas: "সব দোষ", calcGems: "রত্ন ক্যালকুলেটর", calcVarga: "সব বিভাজন চার্ট", calcKaal: "কাল সর্প দোষ",
    calcMangal: "কুজ / মঙ্গল দোষ", calcNakshatra: "নক্ষত্র ও রাশি", calcDasha: "বিংশোত্তরী দশা", calcSade: "সাড়ে সাতি",
  },
  te: {
    brandTag: "వైదిక జ్యోతిష్యం", heroKicker: "వైదిక జ్యోతిష్యం · జ్యోతిష్షాస్త్రం", heroTitleA: "ఆకాశాన్ని చదవండి", heroTitleB: "మీరు పుట్టిన ఆ క్షణంలో",
    heroBody: "కృత్రిమ జన్మ కుండలి, విభాజన చార్టులు, దశలు మరియు మీ గత, వర్తమాన, భవిష్యత్తు యొక్క పరీక్షించిన ఫలితాలు — కెరీర్, వివాహం, సంతానం, ధనం మరియు మరిన్ని.",
    heroCta: "కుండలి రూపొందించు", heroNote: "ఉచితం · సైన్-అప్ అవసరం లేదు · 30 సెకన్లలో", quotesTitle: "మహానుభవుల మాటల్లో నక్షత్రాల జ్ఞానం",
    calcKicker: "మీ జాతకం చూడండి", calcTitle: "వైదిక జ్యోతిష్య కాలిక్యులేటర్లు", calcSub: "13 కాలిక్యులేటర్లు సిద్ధం — పాశ్చాత్య రాశి చక్రం మరియు మొదటి, ఆరో, తొమ్మిదో భావాల ఆరు జ్యోతిర్లింగాలతో సహా.",
    available: "అందుబాటులో", navSaved: "సేవ్ చేసినవి", navBuild: "కుండలి రూపొందించు", langAria: "భాషను ఎంచుకోండి",
    formLegend: "మీ జన్మం", formPerson1: "వ్యక్తి 1", formPerson2: "వ్యక్తి 2", formName: "పేరు", formNamePh: "రిపోర్ట్‌లో కనిపించే విధంగా",
    formDate: "జన్మ తేదీ", formTime: "జన్మ సమయం, 24-గంటలు", formTimeUnknown: "సమయం తెలియదు — మధ్యాహ్నం 12 గంటల కుండలి రూపొందించి, లగ్నాన్ని సుమారుగా గుర్తించు",
    formCity: "జన్మ నగరం", formCityPh: "ఢిల్లీ, లండన్, దుబాయ్ వెతకండి…", formSample: "నమూనా నింపు", formCustom: "నిర్దేశాంకాలు నింపు", formLocate: "ఈ పరికరాన్ని వాడు",
    formLat: "అక్షాంశం", formLon: "రేఖాంశం", formTz: "సమయ మండలం", formStyle: "చార్ట్ గీయడం శైలి", formStyleNote: "ఇది చిత్రాన్ని మాత్రమే మారుస్తుంది, లెక్కలను కాదు.",
    formPrivacy: "మీ రిపోర్ట్ ఈ బ్రౌజర్‌లో ఊహించలేని లింక్‌తో సేవ్ అవుతుంది. మీరు ఆ లింక్ ఇచ్చిన వారు జన్మ వివరాలు చూడవచ్చు. సాంప్రదాయ స్కోర్ మార్గదర్శకం — వైద్య పరీక్ష లేదా వివాహ హామీ కాదు.",
    backCalcs: "← కాలిక్యులేటర్లు", guideKickerV: "ఉచిత వైదిక జ్యోతిష్య కాలిక్యులేటర్ గైడ్", guideKickerW: "పాశ్చాత్య జ్యోతిష్య కాలిక్యులేటర్ గైడ్",
    guideIncludes: "రిపోర్ట్‌లో ఉన్నవి", guideSteps: "ఎలా లెక్కించాలి", guideFaqs: "తరచుగా అడిగే ప్రశ్నలు", guideRelated: "సంబంధిత వైదిక జ్యోతిష్య కాలిక్యులేటర్లు",
    disclaimer: "జ్యోతిష్యం సాంప్రదాయ వ్యాఖ్యాన పద్ధతి. కాలిక్యులేటర్ ఫలితాలు విద్యా మార్గదర్శకాలు మాత్రమే; వైద్య, న్యాయ, ఆర్థిక లేదా మానసిక సలహా ప్రత్యామ్నాయం కావు.",
    tabOverview: "సారాంశం", tabCharts: "చార్టులు", tabHouses: "భావాలు", tabDashas: "దశలు", tabStrength: "బలం", tabYogas: "యోగాలు", tabDoshas: "దోషాలు", tabReading: "వ్యాఖ్యానం",
    tabLife: "జీవితం", tabLove: "ప్రేమ", tabWork: "కెరీర్", tabMoney: "ధనం", tabHome: "గృహం", tabMind: "మనస్", tabPurpose: "లక్ష్యం", tabNow: "ఈ అధ్యాయం",
    savedTitle: "సేవ్ చేసిన రిపోర్టులు", savedEmpty: "ఈ బ్రౌజర్‌లో ఇంకా రిపోర్టులు సేవ్ కాలేదు.",
    footerContact: "సంప్రదింపు", footerOnSite: "ఈ సైట్‌లో", footerBuild: "మీ కుండలి రూపొందించు", footerWestern: "పాశ్చాత్య రాశి చక్రం", footerJyotirlinga: "జ్యోతిర్లింగాలు",
    footerMatching: "వివాహ మిలనం", footerCopyrights: "కాపీరైట్", footerRights: "అన్ని హక్కులు నిల్వ చేయబడ్డాయి.",
    footerNote: "జోడియాక్ వేదా · నిరయన రాశి, లాహిరి అయనాంశం · జ్యోతిష్యం సాంప్రదాయ వ్యాఖ్యాన పద్ధతి; ఫలితాలను మార్గదర్శకంగా వాడండి.",
    notice: "ఇంటర్‌ఫేస్ అనువాదం చేయబడింది. వివరణాత్మక ఫలితాలు మరియు పొడవు వ్యాఖ్యానాలు ఇంకా ఆంగ్లంలోనే ఉంటాయి.",
    calcBuild: "మీ కుండలి రూపొందించు", calcWestern: "పాశ్చాత్య రాశి చక్రం", calcJyotirlinga: "సందర్శించాల్సిన జ్యోతిర్లింగాలు", calcMatching: "వివాహ కుండలి మిలనం",
    calcYogas: "అన్ని యోగాలు", calcDoshas: "అన్ని దోషాలు", calcGems: "రత్న కాలిక్యులేటర్", calcVarga: "అన్ని విభాజన చార్టులు", calcKaal: "కాల సర్ప దోషం",
    calcMangal: "కుజ / మంగల దోషం", calcNakshatra: "నక్షత్రం & రాశి", calcDasha: "వింశోత్తరీ దశ", calcSade: "సాడే సాతి",
  },
  mr: {
    brandTag: "वैदिक ज्योतिष", heroKicker: "वैदिक ज्योतिष · ज्योतिष्शास्त्र", heroTitleA: "आकाश वाचा", heroTitleB: "तुम्ही जन्माला आला तो क्षण",
    heroBody: "अचूक जन्मकुंडली, विभाजन चार्ट, दशा आणि तुमच्या भूत, वर्तमान व भविष्याचे तपासलेले भविष्यवाणी — करिअर, विवाह, संतती, धन आणि बरेच काही.",
    heroCta: "कुंडली बनवा", heroNote: "मोफत · कोणतीही साइन-अप नाही · 30 सेकंदात", quotesTitle: "मोठ्यांच्या शब्दांत ताऱ्यांचे ज्ञान",
    calcKicker: "तुमची कुंडली पाहा", calcTitle: "वैदिक ज्योतिष कॅल्क्युलेटर", calcSub: "13 कॅल्क्युलेटर तयार — पाश्चात्त्य राशीचक्र व पहिल्या, सहाव्या व नवव्या भावाचे सहा ज्योतिर्लिंगसह.",
    available: "उपलब्ध", navSaved: "जतन केलेले", navBuild: "कुंडली बनवा", langAria: "भाषा निवडा",
    formLegend: "तुमचा जन्म", formPerson1: "व्यक्ती १", formPerson2: "व्यक्ती २", formName: "नाव", formNamePh: "अहवालावर जसे दिसावे",
    formDate: "जन्मतारीख", formTime: "जन्मवेळ, 24-तास", formTimeUnknown: "वेळ अज्ञात — दुपारी 12 वाजताची कुंडली बनवा व लग्न अंदाजे असल्याचे सांगा",
    formCity: "जन्मस्थान", formCityPh: "दिल्ली, लंडन, दुबई शोधा…", formSample: "नमुना भरा", formCustom: "निर्देशांक स्वतः भरा", formLocate: "हे डिव्हाइस वापरा",
    formLat: "अक्षांश", formLon: "रेखांश", formTz: "वेळक्षेत्र", formStyle: "चार्ट काढण्याची पद्धत", formStyleNote: "हे केवळ चित्र बदलते, गणना नाही.",
    formPrivacy: "तुमचा अहवाल या ब्राउझरमध्ये ओळखण्यास अवघड लिंकसह जतन केला जातो. ज्याला तुम्ही ती लिंक देऊ शकाल तोच जन्मतपशील पाहू शकतो. पारंपरिक गुण मिलान मार्गदर्शक आहे — वैद्यकीय चाचणी किंवा विवाहाची हमी नाही.",
    backCalcs: "← कॅल्क्युलेटर", guideKickerV: "मोफत वैदिक ज्योतिष कॅल्क्युलेटर मार्गदर्शक", guideKickerW: "पाश्चात्त्य ज्योतिष कॅल्क्युलेटर मार्गदर्शक",
    guideIncludes: "अहवालात काय आहे", guideSteps: "कसे मोजावे", guideFaqs: "वारंवार विचारले जाणारे प्रश्न", guideRelated: "संबंधित वैदिक ज्योतिष कॅल्क्युलेटर",
    disclaimer: "ज्योतिष हा पारंपरिक व्याख्या पद्धत आहे. कॅल्क्युलेटरचे निष्कर्ष शैक्षणिक मार्गदर्शक आहेत आणि व्यावसायिक वैद्यकीय, कायदेशीर, आर्थिक किंवा मानसोपचाराचा पर्याय नाहीत.",
    tabOverview: "आढावा", tabCharts: "चार्ट", tabHouses: "भाव", tabDashas: "दशा", tabStrength: "बळ", tabYogas: "योग", tabDoshas: "दोष", tabReading: "वाचन",
    tabLife: "जीवन", tabLove: "प्रेम", tabWork: "काम", tabMoney: "धन", tabHome: "घर", tabMind: "मन", tabPurpose: "उद्दिष्ट", tabNow: "हा अध्याय",
    savedTitle: "जतन केलेले अहवाल", savedEmpty: "या ब्राउझरमध्ये अद्याप अहवाल जतन केलेले नाहीत.",
    footerContact: "संपर्क", footerOnSite: "या साइटवर", footerBuild: "तुमची कुंडली बनवा", footerWestern: "पाश्चात्त्य राशीचक्र", footerJyotirlinga: "ज्योतिर्लिंग",
    footerMatching: "विवाह जुळणी", footerCopyrights: "कॉपीराइट", footerRights: "सर्व हक्क राखीव.",
    footerNote: "झोडियॅक वेदा · निरयन राशी, लाहिरी अयनांश · ज्योतिष पारंपरिक व्याख्या पद्धत आहे; भविष्यवाणी मार्गदर्शनासाठी वापरा.",
    notice: "इंटरफेस भाषांतरित आहे. तपशीलवार निष्कर्ष आणि मोठे वाचन अजून इंग्रजीत दिसतात.",
    calcBuild: "तुमची कुंडली बनवा", calcWestern: "पाश्चात्त्य राशीचक्र", calcJyotirlinga: "भेट देण्यासारखी ज्योतिर्लिंग", calcMatching: "विवाह कुंडली जुळणी",
    calcYogas: "सर्व योग", calcDoshas: "सर्व दोष", calcGems: "रत्न कॅल्क्युलेटर", calcVarga: "सर्व विभाजन चार्ट", calcKaal: "कालसर्प दोष",
    calcMangal: "कुज / मंगल दोष", calcNakshatra: "नक्षत्र व राशी", calcDasha: "विंशोत्तरी दशा", calcSade: "साडेसाती",
  },
  ta: {
    brandTag: "வேத ஜோதிடம்", heroKicker: "வேத ஜோதிடம் · ஜோதிஷ்ஷாஸ்த்ரம்", heroTitleA: "வானத்தை படியுங்கள்", heroTitleB: "நீங்கள் பிறந்த அந்த நொடியில்",
    heroBody: "துல்லியமான ஜாதகம், பிரிவு விளக்கப்படங்கள், தசைகள் மற்றும் உங்கள் கடந்த காலம், நிகழ்காலம், எதிர்காலத்தின் சோதிக்கப்பட்ட கணிப்புகள் — தொழில், திருமணம், குழந்தை, செல்வம் மற்றும் பல.",
    heroCta: "ஜாதகம் உருவாக்கு", heroNote: "இலவசம் · பதிவு இல்லை · 30 வினாடிகளில்", quotesTitle: "மகான்களின் வார்த்தையில் நட்சத்திர அறிவு",
    calcKicker: "உங்கள் ஜாதகத்தை பாருங்கள்", calcTitle: "வேத ஜோதிட கணிப்பான்கள்", calcSub: "13 கணிப்பான்கள் தயார் — மேற்கத்திய ராசி சக்கரம் மற்றும் முதல், ஆறாம், ஒன்பதாம் இடத்துகளின் ஆறு ஜோதிர்லிங்கங்களுடன்.",
    available: "கிடைக்கிறது", navSaved: "சேமித்தவை", navBuild: "ஜாதகம் உருவாக்கு", langAria: "மொழியைத் தேர்வுசெய்க",
    formLegend: "உங்கள் பிறப்பு", formPerson1: "நபர் 1", formPerson2: "நபர் 2", formName: "பெயர்", formNamePh: "அறிக்கையில் தெரியும் விதமாக",
    formDate: "பிறந்த தேதி", formTime: "பிறந்த நேரம், 24 மணி", formTimeUnknown: "நேரம் தெரியவில்லை — நண்பகல் 12 மணி ஜாதகம் உருவாக்கி, லக்னத்தை தோராயமாக குறி",
    formCity: "பிறந்த ஊர்", formCityPh: "டெல்லி, லண்டன், துபாய் தேடுங்கள்…", formSample: "மாதிரி நிரப்பு", formCustom: "ஆயத்தொலைவுகளை நிரப்பு", formLocate: "இந்த சாதனத்தைப் பயன்படுத்து",
    formLat: "அட்சரேகை", formLon: "தீர்க்கரேகை", formTz: "நேர மண்டலம்", formStyle: "விளக்கப்படம் வரையும் முறை", formStyleNote: "இது படத்தை மட்டும் மாற்றும், கணக்கை அல்ல.",
    formPrivacy: "உங்கள் அறிக்கை இந்த உலாவியில் ஊகிக்க முடியாத இணைப்புடன் சேமிக்கப்படுகிறது. நீங்கள் அந்த இணைப்பைக் கொடுத்தவரால் பிறப்பு விவரங்களைப் பார்க்க முடியும். பாரம்பரிய மதிப்பெண் வழிகாட்டுதலின் ஒரு பகுதி — மருத்த்வ பரிசோதனை அல்லது திருமண உறுதிமொழி அல்ல.",
    backCalcs: "← கணிப்பான்கள்", guideKickerV: "இலவச வேத ஜோதிட கணிப்பான் வழிகாட்டி", guideKickerW: "மேற்கத்திய ஜோதிட கணிப்பான் வழிகாட்டி",
    guideIncludes: "அறிக்கையில் உள்ளவை", guideSteps: "எப்படி கணக்கிடுவது", guideFaqs: "அடிக்கடி கேட்கப்படும் கேள்விகள்", guideRelated: "தொடர்புடைய வேத ஜோதிட கணிப்பான்கள்",
    disclaimer: "ஜோதிடம் ஒரு பாரம்பரிய விளக்க முறை. கணிப்பான் முடிவுகள் கல்வி வழிகாட்டுதலாகும்; தொழில்முறை மருத்துவ, சட்ட, நிதி அல்லது உளவியல் ஆலோசனையின் மாற்று அல்ல.",
    tabOverview: "சுருக்கம்", tabCharts: "விளக்கப்படங்கள்", tabHouses: "இடங்கள்", tabDashas: "தசைகள்", tabStrength: "பலம்", tabYogas: "யோகங்கள்", tabDoshas: "தோஷங்கள்", tabReading: "விளக்கம்",
    tabLife: "வாழ்க்கை", tabLove: "காதல்", tabWork: "வேலை", tabMoney: "பணம்", tabHome: "வீடு", tabMind: "மனம்", tabPurpose: "நோக்கம்", tabNow: "இந்த அத்தியாயம்",
    savedTitle: "சேமித்த அறிக்கைகள்", savedEmpty: "இந்த உலாவியில் இன்னும் அறிக்கை சேமிக்கப்படவில்லை.",
    footerContact: "தொடர்பு", footerOnSite: "இந்த தளத்தில்", footerBuild: "உங்கள் ஜாதகத்தை உருவாக்கு", footerWestern: "மேற்கத்திய ராசி சக்கரம்", footerJyotirlinga: "ஜோதிர்லிங்கங்கள்",
    footerMatching: "திருமண பொருத்தம்", footerCopyrights: "பதிப்புரிமை", footerRights: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
    footerNote: "ஜோடியாக் வேடா · நிலையான ராசி, லாஹிரி அயனாம்சம் · ஜோதிடம் பாரம்பரிய விளக்க முறை; கணிப்புகளை வழிகாட்டுதலாக பயன்படுத்துங்கள்.",
    notice: "இடைமுகம் மொழிபெயர்க்கப்பட்டது. விரிவான முடிவுகள் மற்றும் நீண்ட விளக்கங்கள் இன்னும் ஆங்கிலத்தில் தெரியும்.",
    calcBuild: "உங்கள் ஜாதகத்தை உருவாக்கு", calcWestern: "மேற்கத்திய ராசி சக்கரம்", calcJyotirlinga: "போக வேண்டிய ஜோதிர்லிங்கங்கள்", calcMatching: "திருமண ஜாதக பொருத்தம்",
    calcYogas: "அனைத்து யோகங்கள்", calcDoshas: "அனைத்து தோஷங்கள்", calcGems: "ரத்தினக் கணிப்பான்", calcVarga: "அனைத்து பிரிவு விளக்கப்படங்கள்", calcKaal: "கால சர்ப்ப தோஷம்",
    calcMangal: "குஜ / மங்கல தோஷம்", calcNakshatra: "நட்சத்திரம் & ராசி", calcDasha: "விம்ஷோத்தரி தசா", calcSade: "சாடே சாதி",
  },
  gu: {
    brandTag: "વૈદિક જ્યોતિષ", heroKicker: "વૈદિક જ્યોતિષ · જ્યોતિષ શાસ્ત્ર", heroTitleA: "આકાશ વાંચો", heroTitleB: "તમે જન્મ્યાં તે ક્ષણે",
    heroBody: "ચોક્કસ જન્મકુંડળી, ડિવિઝનલ ચાર્ટ, દશાઓ અને તમારા ભૂત, વર્તમાન અને ભવિષ્યની પરીક્ષિત ભવિષ્યવાણીઓ — કારકિર્દી, લગ્ન, સંતાન, ધન અને ઘણું બધું.",
    heroCta: "કુંડળી બનાવો", heroNote: "મફત · કોઈ સાઇન-અપ નહીં · 30 સેકંડમાં", quotesTitle: "મહાન વ્યક્તિઓના શબ્દોમાં તારાઓનું જ્ઞાન",
    calcKicker: "તમારી કુંડળી જુઓ", calcTitle: "વૈદિક જ્યોતિષ કૅલ્ક્યુલેટર", calcSub: "13 કૅલ્ક્યુલેટર તૈયાર — પશ્ચિમી રાશિ ચક્ર અને પ્રથમ, છઠ્ઠ, નવમ ભાવના છ જ્યોતિર્લિંગ સહિત.",
    available: "ઉપલબ્ધ", navSaved: "સાચવેલાં", navBuild: "કુંડળી બનાવો", langAria: "ભાષા પસંદ કરો",
    formLegend: "તમારું જન્મ", formPerson1: "વ્યક્તિ 1", formPerson2: "વ્યક્તિ 2", formName: "નામ", formNamePh: "રિપોર્ટ પર જેમ દેખાય તેમ",
    formDate: "જન્મ તારીખ", formTime: "જન્મ સમય, 24-કલાક", formTimeUnknown: "સમય અજ્ઞાત — બપોર 12 વાગ્યાની કુંડળી બનાવો અને લગ્ન અંદાજિત ગણો",
    formCity: "જન્મ શહેર", formCityPh: "દિલ્હી, લંડન, દુબઈ શોધો…", formSample: "નમૂના ભરો", formCustom: "અક્ષાંશ-રેખાંશ ભરો", formLocate: "આ ઉપકરણ વાપરો",
    formLat: "અક્ષાંશ", formLon: "રેખાંશ", formTz: "સમય ઝોન", formStyle: "ચાર્ટ વેવવાની શૈલી", formStyleNote: "આ ફક્ત ચિત્ર બદલે છે, ગણતરી નહીં.",
    formPrivacy: "તમારો રિપોર્ટ આ બ્રાઉઝરમાં અનુમાન-કઠિન લિંક સાથે સચવાય છે. જેને તમે તે લિંક આપો તે જન્મ વિગતો જોઈ શકે. પારંપરિક સ્કોર માર્ગદર્શન છે — કોઈ તબીબી પરીક્ષા કે લગ્નની ગેરંટી નહીં.",
    backCalcs: "← કૅલ્ક્યુલેટર", guideKickerV: "મફત વૈદિક જ્યોતિષ કૅલ્ક્યુલેટર માર્ગદર્શિકા", guideKickerW: "પશ્ચિમી જ્યોતિષ કૅલ્ક્યુલેટર માર્ગદર્શિકા",
    guideIncludes: "રિપોર્ટમાં શું છે", guideSteps: "કેવી રીતે ગણવું", guideFaqs: "વારંવાર પુછાતા પ્રશ્નો", guideRelated: "સંબંધિત વૈદિક જ્યોતિષ કૅલ્ક્યુલેટર",
    disclaimer: "જ્યોતિષ પારંપરિક વ્યાખ્યા પદ્ધતિ છે. કૅલ્ક્યુલેટર પરિણામ શૈક્ષણિક માર્ગદર્શન છે અને વ્યાવસાયિક તબીબી, કાનૂની, નાણાકીય કે માનસિક સલાહનો વિકલ્પ નથી.",
    tabOverview: "સારાંશ", tabCharts: "ચાર્ટ", tabHouses: "ભાવ", tabDashas: "દશાઓ", tabStrength: "બળ", tabYogas: "યોગ", tabDoshas: "દોષ", tabReading: "વાંચન",
    tabLife: "જીવન", tabLove: "પ્રેમ", tabWork: "કામ", tabMoney: "ધન", tabHome: "ઘર", tabMind: "મન", tabPurpose: "ઉદ્દેશ્ય", tabNow: "આ અધ્યાય",
    savedTitle: "સચવેલી રિપોર્ટ", savedEmpty: "આ બ્રાઉઝરમાં હજી કોઈ રિપોર્ટ સચવાયો નથી.",
    footerContact: "સંપર્ક", footerOnSite: "આ સાઇટ પર", footerBuild: "તમારી કુંડળી બનાવો", footerWestern: "પશ્ચિમી રાશિ ચક્ર", footerJyotirlinga: "જ્યોતિર્લિંગ",
    footerMatching: "લગ્ન મેળાપક", footerCopyrights: "કોપીરાઇટ", footerRights: "બધા હક અમારી પાસે.",
    footerNote: "ઝોડિયાક વેદા · નિરયન રાશિ, લાહિરી અયનાંશ · જ્યોતિષ પારંપરિક વ્યાખ્યા પદ્ધતિ છે; ભવિષ્યવાણીનો ઉપયોગ માર્ગદર્શન માટે કરો.",
    notice: "ઇન્ટરફેસ ભાષાંતરિત છે. વિગતવાર પરિણામ અને લાંબા વાંચન હજી અંગ્રેજીમાં દેખાય છે.",
    calcBuild: "તમારી કુંડળી બનાવો", calcWestern: "પશ્ચિમી રાશિ ચક્ર", calcJyotirlinga: "દર્શન કરવા યોગ્ય જ્યોતિર્લિંગ", calcMatching: "લગ્ન કુંડળી મેળાપક",
    calcYogas: "બધા યોગ", calcDoshas: "બધા દોષ", calcGems: "રત્ન કૅલ્ક્યુલેટર", calcVarga: "બધા ડિવિઝનલ ચાર્ટ", calcKaal: "કાલ સર્પ દોષ",
    calcMangal: "કુજ / મંગલ દોષ", calcNakshatra: "નક્ષત્ર અને રાશિ", calcDasha: "વિંશોત્તરી દશા", calcSade: "સાડેસાતી",
  },
  kn: {
    brandTag: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ", heroKicker: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ · ಜ್ಯೋತಿಷ್ಷಾಸ್ತ್ರ", heroTitleA: "ಆಕಾಶವನ್ನು ಓದಿ", heroTitleB: "ನೀವು ಹುಟ್ಟಿದ ಆ ಕ್ಷಣದಲ್ಲಿ",
    heroBody: "ನಿಖರವಾದ ಜನ್ಮ ಕುಂಡಲಿ, ವಿಭಾಜನ ಚಾರ್ಟ್‌ಗಳು, ದಶೆಗಳು ಮತ್ತು ನಿಮ್ಮ ಭೂತ, ವರ್ತಮಾನ ಮತ್ತು ಭವಿಷ್ಯದ ಪರೀಕ್ಷಿಸಿದ ಭವಿಷ್ಯವಾಣಿಗಳು — ವೃತ್ತಿ, ವಿವಾಹ, ಸಂತಾನ, ಧನ ಮತ್ತು ಇನ್ನೂ ಹೆಚ್ಚು.",
    heroCta: "ಕುಂಡಲಿ ರಚಿಸಿ", heroNote: "ಉಚಿತ · ಸೈನ್-ಅಪ್ ಇಲ್ಲ · 30 ಸೆಕೆಂಡುಗಳಲ್ಲಿ", quotesTitle: "ಮಹಾನ್‌ವರ ಮಾತಿನಲ್ಲಿ ನಕ್ಷತ್ರಗಳ ಜ್ಞಾನ",
    calcKicker: "ನಿಮ್ಮ ಜಾತಕವನ್ನು ನೋಡಿ", calcTitle: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು", calcSub: "13 ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು ಸಿದ್ಧ — ಪಾಶ್ಚಾತ್ಯ ರಾಶಿ ಚಕ್ರ ಮತ್ತು ಒಂದನೇ, ಆರನೇ, ಒಂಬತ್ತನೇ ಭಾವಗಳ ಆರು ಜ್ಯೋತಿರ್ಲಿಂಗಗಳೊಂದಿಗೆ.",
    available: "ಲಭ್ಯ", navSaved: "ಉಳಿಸಿದವು", navBuild: "ಕುಂಡಲಿ ರಚಿಸಿ", langAria: "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
    formLegend: "ನಿಮ್ಮ ಜನ್ಮ", formPerson1: "ವ್ಯಕ್ತಿ 1", formPerson2: "ವ್ಯಕ್ತಿ 2", formName: "ಹೆಸರು", formNamePh: "ವರದಿಯಲ್ಲಿ ಕಾಣುವಂತೆ",
    formDate: "ಜನ್ಮ ದಿನಾಂಕ", formTime: "ಜನ್ಮ ಸಮಯ, 24-ಗಂಟೆ", formTimeUnknown: "ಸಮಯ ತಿಳಿದಿಲ್ಲ — ಮಧ್ಯಾಹ್ನ 12 ಗಂಟೆಯ ಕುಂಡಲಿ ರಚಿಸಿ, ಲಗ್ನವನ್ನು ಅಂದಾಜಾಗಿ ಗುರುತಿಸಿ",
    formCity: "ಜನ್ಮ ಸ್ಥಳ", formCityPh: "ದೆಹಲಿ, ಲಂಡನ್, ದುಬಾಯಿ ಹುಡುಕಿ…", formSample: "ನಮೂನೆ ಭರ್ತಿ", formCustom: "ನಿರ್ದೇಶಾಂಕಗಳನ್ನು ಭರ್ತಿ", formLocate: "ಈ ಸಾಧನ ಬಳಸಿ",
    formLat: "ಅಕ್ಷಾಂಶ", formLon: "ರೇಖಾಂಶ", formTz: "ಸಮಯ ವಲಯ", formStyle: "ಚಾರ್ಟ್ ಬರೆಯುವ ಶೈಲಿ", formStyleNote: "ಇದು ಕೇವಲ ಚಿತ್ರವನ್ನು ಬದಲಿಸುತ್ತದೆ, ಲೆಕ್ಕವನ್ನು ಅಲ್ಲ.",
    formPrivacy: "ನಿಮ್ಮ ವರದಿ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಊಹಿಸಲು ಕಷ್ಟದ ಲಿಂಕ್‌ನೊಂದಿಗೆ ಉಳಿಸಲಾಗುತ್ತದೆ. ನೀವು ಆ ಲಿಂಕ್ ಕೊಟ್ಟವರು ಜನ್ಮ ವಿವರಗಳನ್ನು ನೋಡಬಹುದು. ಸಾಂಪ್ರದಾಯಿಕ ಸ್ಕೋರು ಮಾರ್ಗದರ್ಶಿಯ ಭಾಗ — ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆ ಅಥವಾ ವಿವಾಹದ ಖಾತರಿ ಅಲ್ಲ.",
    backCalcs: "← ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು", guideKickerV: "ಉಚಿತ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಮಾರ್ಗದರ್ಶಿ", guideKickerW: "ಪಾಶ್ಚಾತ್ಯ ಜ್ಯೋತಿಷ್ಯ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಮಾರ್ಗದರ್ಶಿ",
    guideIncludes: "ವರದಿಯಲ್ಲಿ ಏನಿದೆ", guideSteps: "ಹೇಗೆ ಲೆಕ್ಕ ಹಾಕುವುದು", guideFaqs: "ಪದೇ ಪದೇ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು", guideRelated: "ಸಂಬಂಧಿತ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು",
    disclaimer: "ಜ್ಯೋತಿಷ್ಯ ಪಾರಂಪರಿಕ ವ್ಯಾಖ್ಯಾ ವಿಧಾನ. ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಫಲಿತಾಂಶಗಳು ಶೈಕ್ಷಣಿಕ ಮಾರ್ಗದರ್ಶಿ ಮಾತ್ರ; ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ, ಕಾನೂನು, ಹಣಕಾಸು ಅಥವಾ ಮಾನಸಿಕ ಸಲಹೆಯ ಪರ್ಯಾಯವಲ್ಲ.",
    tabOverview: "ಸಾರಾಂಶ", tabCharts: "ಚಾರ್ಟ್‌ಗಳು", tabHouses: "ಭಾವಗಳು", tabDashas: "ದಶೆಗಳು", tabStrength: "ಬಲ", tabYogas: "ಯೋಗಗಳು", tabDoshas: "ದೋಷಗಳು", tabReading: "ವ್ಯಾಖ್ಯಾನ",
    tabLife: "ಜೀವನ", tabLove: "ಪ್ರೀತಿ", tabWork: "ಕೆಲಸ", tabMoney: "ಧನ", tabHome: "ಮನೆ", tabMind: "ಮನಸ್", tabPurpose: "ಉದ್ದೇಶ", tabNow: "ಈ ಅಧ್ಯಾಯ",
    savedTitle: "ಉಳಿಸಿದ ವರದಿಗಳು", savedEmpty: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಇನ್ನೂ ಯಾವ ವರದಿ ಉಳಿಸಿಲ್ಲ.",
    footerContact: "ಸಂಪರ್ಕ", footerOnSite: "ಈ ತಾಣದಲ್ಲಿ", footerBuild: "ನಿಮ್ಮ ಕುಂಡಲಿ ರಚಿಸಿ", footerWestern: "ಪಾಶ್ಚಾತ್ಯ ರಾಶಿ ಚಕ್ರ", footerJyotirlinga: "ಜ್ಯೋತಿರ್ಲಿಂಗ",
    footerMatching: "ವಿವಾಹ ಹೊಂದಾಣಿಕೆ", footerCopyrights: "ಹಕ್ಕುಸ್ವಾಮ್ಯ", footerRights: "ಎಲ್ಲಾ ಹಕ್ಕುಗಳು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
    footerNote: "ಝೋಡಿಯಾಕ್ ವೇದಾ · ನಿರಯಣ ರಾಶಿ, ಲಾಹಿರಿ ಅಯನಾಂಶ · ಜ್ಯೋತಿಷ್ಯ ಪಾರಂಪರಿಕ ವ್ಯಾಖ್ಯಾ ವಿಧಾನ; ಫಲಿತಾಂಶಗಳನ್ನು ಮಾರ್ಗದರ್ಶನವಾಗಿ ಬಳಸಿ.",
    notice: "ಇಂಟರ್ಫೇಸ್ ಅನುವಾದಿಸಲಾಗಿದೆ. ವಿವರವಾದ ಫಲಿತಾಂಶಗಳು ಮತ್ತು ದೀರ್ಘ ವ್ಯಾಖ್ಯಾನಗಳು ಇನ್ನೂ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    calcBuild: "ನಿಮ್ಮ ಕುಂಡಲಿ ರಚಿಸಿ", calcWestern: "ಪಾಶ್ಚಾತ್ಯ ರಾಶಿ ಚಕ್ರ", calcJyotirlinga: "ಭೇಟಿ ನೀಡಬೇಕಾದ ಜ್ಯೋತಿರ್ಲಿಂಗ", calcMatching: "ವಿವಾಹ ಕುಂಡಲಿ ಹೊಂದಾಣಿಕೆ",
    calcYogas: "ಎಲ್ಲಾ ಯೋಗಗಳು", calcDoshas: "ಎಲ್ಲಾ ದೋಷಗಳು", calcGems: "ರತ್ನ ಕ್ಯಾಲ್ಕುಲೇಟರ್", calcVarga: "ಎಲ್ಲಾ ವಿಭಾಜನ ಚಾರ್ಟ್‌ಗಳು", calcKaal: "ಕಾಲ ಸರ್ಪ ದೋಷ",
    calcMangal: "ಕುಜ / ಮಂಗಳ ದೋಷ", calcNakshatra: "ನಕ್ಷತ್ರ ಮತ್ತು ರಾಶಿ", calcDasha: "ವಿಂಶೋತ್ತರಿ ದಶೆ", calcSade: "ಸಾಡೇ ಸಾತಿ",
  },
  ml: {
    brandTag: "വൈദിക ജ്യോതിഷം", heroKicker: "വൈദിക ജ്യോതിഷം · ജ്യോതിഷ ശാസ്ത്രം", heroTitleA: "ആകാശം വായിക്കുക", heroTitleB: "നിങ്ങൾ ജനിച്ച ആ നിമിഷത്തിൽ",
    heroBody: "കൃത്യമായ ജനനകുണ്ഡലി, ഡിവിഷനൽ ചാർട്ടുകൾ, ദശകൾ, നിങ്ങളുടെ ഭൂതകാലം, വർത്തമാനം, ഭാവിയിലെ പരിശോധിച്ച പ്രവചനങ്ങൾ — തൊഴിൽ, വിവാഹം, സന്താനം, സമ്പത്ത് മുതൽ ഒരുപോലും.",
    heroCta: "കുണ്ഡലി ഉണ്ടാക്കുക", heroNote: "സൗജന്യം · സൈൻ അപ്പ് ഇല്ല · 30 സെക്കൻഡിൽ", quotesTitle: "മഹാന്മാരുടെ വാക്കുകളിൽ നക്ഷത്ര ജ്ഞാനം",
    calcKicker: "നിങ്ങളുടെ ജാതകം കാണുക", calcTitle: "വൈദിക ജ്യോതിഷ കാൽക്കുലേറ്ററുകൾ", calcSub: "13 കാൽക്കുലേറ്ററുകൾ തയ്യാർ — പശ്ചിമ രാശിചക്രവും ഒന്നാം, ആറാം, ഒൻപതാം ഭാവങ്ങളുടെ ആറ് ജ്യോതിര്ലിംഗങ്ങളും ഉൾപ്പെടെ.",
    available: "ലഭ്യമാണ്", navSaved: "സേവ് ചെയ്തവ", navBuild: "കുണ്ഡലി ഉണ്ടാക്കുക", langAria: "ഭാഷ തിരഞ്ഞെടുക്കുക",
    formLegend: "നിങ്ങളുടെ ജനനം", formPerson1: "വ്യക്തി 1", formPerson2: "വ്യക്തി 2", formName: "പേര്", formNamePh: "റിപ്പോർട്ടിൽ കാണുന്ന രീതിയിൽ",
    formDate: "ജനന തീയതി", formTime: "ജനന സമയം, 24 മണിക്കൂർ", formTimeUnknown: "സമയം അജ്ഞാതം — ഉച്ചയ്ക്ക് 12 മണിക്ക് കുണ്ഡലി ഉണ്ടാക്കി ലഗ്നം ഏകദേശമാണെന്ന് നൽകുക",
    formCity: "ജനന നഗരം", formCityPh: "ഡൽഹി, ലണ്ടൻ, ദുബായ് തിരയുക…", formSample: "സാമ്പിൾ പൂരിപ്പിക്കുക", formCustom: "കോർഡിനേറ്റുകൾ നൽകുക", formLocate: "ഈ ഉപകരണം ഉപയോഗിക്കുക",
    formLat: "അക്ഷാംശം", formLon: "രേഖാംശം", formTz: "സമയ മേഖല", formStyle: "ചാർട്ട് വരയ്ക്കുന്ന രീതി", formStyleNote: "ഇത് ചിത്രം മാത്രം മാറ്റുന്നു, കണക്കുകൾ അല്ല.",
    formPrivacy: "നിങ്ങളുടെ റിപ്പോർട്ട് ഈ ബ്രൗസറിൽ ഊഹിക്കാൻ പ്രയാസമായ ഒരു ലിങ്കിൽ സൂക്ഷിക്കുന്നു. ആ ലിങ്ക് നൽകുന്നവർക്ക് ജനന വിവരങ്ങൾ കാണാൻ കഴിയും. പാരമ്പര്യ സ്കോർ വഴികാട്ടലാണ് — വൈദ്യ പരിശോധനയോ വിവാഹ ഗ്യാരന്റിയോ അല്ല.",
    backCalcs: "← കാൽക്കുലേറ്ററുകൾ", guideKickerV: "സൗജന്യ വൈദിക ജ്യോതിഷ കാൽക്കുലേറ്റർ ഗൈഡ്", guideKickerW: "പശ്ചിമ ജ്യോതിഷ കാൽക്കുലേറ്റർ ഗൈഡ്",
    guideIncludes: "റിപ്പോർട്ടിൽ എന്തുണ്ട്", guideSteps: "എങ്ങനെ കണക്കാക്കാം", guideFaqs: "പതിവ് ചോദ്യങ്ങൾ", guideRelated: "ബന്ധപ്പെട്ട വൈദിക ജ്യോതിഷ കാൽക്കുലേറ്ററുകൾ",
    disclaimer: "ജ്യോതിഷം ഒരു പാരമ്പര്യ വ്യാഖ്യാന രീതിയാണ്. കാൽക്കുലേറ്റർ ഫലങ്ങൾ വിദ്യാഭ്യാസ വഴികാട്ടലാണ്; പ്രൊഫഷണൽ വൈദ്യ, നിയമ, സാമ്പത്തിക അല്ലെങ്കിൽ മാനസിക ഉപദേശത്തിന്റെ പകരക്കായി അല്ല.",
    tabOverview: "സംഗ്രഹം", tabCharts: "ചാർട്ടുകൾ", tabHouses: "ഭാവങ്ങൾ", tabDashas: "ദശകൾ", tabStrength: "ശക്തി", tabYogas: "യോഗങ്ങൾ", tabDoshas: "ദോഷങ്ങൾ", tabReading: "വ്യാഖ്യാനം",
    tabLife: "ജീവിതം", tabLove: "സ്നേഹം", tabWork: "ജോലി", tabMoney: "സമ്പാദ്‌വ്യം", tabHome: "വീട്", tabMind: "മനസ്", tabPurpose: "ലക്ഷ്യം", tabNow: "ഈ അധ്യായം",
    savedTitle: "സേവ് ചെയ്ത റിപ്പോർട്ടുകൾ", savedEmpty: "ഈ ബ്രൗസറിൽ ഇതുവരെ റിപ്പോർട്ട് സേവ് ചെയ്തിട്ടില്ല.",
    footerContact: "ബന്ധപ്പെടാൻ", footerOnSite: "ഈ സൈറ്റിൽ", footerBuild: "കുണ്ഡലി ഉണ്ടാക്കുക", footerWestern: "പശ്ചിമ രാശിചക്രം", footerJyotirlinga: "ജ്യോതിര്ലിംഗങ്ങൾ",
    footerMatching: "വിവാഹ പൊരുത്തം", footerCopyrights: "പകർപ്പവകാശം", footerRights: "എല്ലാ അവകാശങ്ങളും സംരക്ഷിതം.",
    footerNote: "സോഡിയാക് വേദ · സിദീരിയൽ രാശി, ലാഹിരി അയനാംശം · ജ്യോതിഷം പാരമ്പര്യ വ്യാഖ്യാന രീതി; ഫലങ്ങൾ വഴികാട്ടലായി ഉപയോഗിക്കുക.",
    notice: "ഇന്റർഫേസ് വിവർത്തനം ചെയ്‌തു. വിശദ ഫലങ്ങളും നീണ്ട വ്യാഖ്യാനങ്ങളും ഇപ്പോഴും ഇംഗ്ലീഷിലാണ്.",
    calcBuild: "കുണ്ഡലി ഉണ്ടാക്കുക", calcWestern: "പശ്ചിമ രാശിചക്രം", calcJyotirlinga: "സന്ദർശിക്കേണ്ട ജ്യോതിര്ലിംഗങ്ങൾ", calcMatching: "വിവാഹ കുണ്ഡലി പൊരുത്തം",
    calcYogas: "എല്ലാ യോഗങ്ങൾ", calcDoshas: "എല്ലാ ദോഷങ്ങൾ", calcGems: "രത്ന കാൽക്കുലേറ്റർ", calcVarga: "എല്ലാ ഡിവിഷനൽ ചാർട്ടുകൾ", calcKaal: "കാല സർപ്പ ദോഷം",
    calcMangal: "കുജ / മംഗള ദോഷം", calcNakshatra: "നക്ഷത്രവും രാശിയും", calcDasha: "വിംശോത്തരി ദശ", calcSade: "സാഡേ സാതി",
  },
  pa: {
    brandTag: "ਵੈਦਿਕ ਜੋਤਿਸ਼", heroKicker: "ਵੈਦਿਕ ਜੋਤਿਸ਼ · ਜੋਤਿਸ਼ ਸ਼ਾਸਤਰ", heroTitleA: "ਆਸਮਾਨ ਨੂੰ ਪੜ੍ਹੋ", heroTitleB: "ਜਦੋਂ ਤੁਸੀਂ ਜੰਮੇ ਸੀ",
    heroBody: "ਸਹੀ ਜਨਮ ਕੁੰਡਲੀ, ਡਿਵੀਜ਼ਨਲ ਚਾਰਟ, ਦਸ਼ਾਵਾਂ ਅਤੇ ਤੁਹਾਡੇ ਅਤੀਤ, ਵਰਤਮਾਨ ਤੇ ਭਵਿੱਖ ਦੀਆਂ ਪਰਖੀਆਂ ਭਵਿਖਬਾਣੀਆਂ — ਕਰੀਅਰ, ਵਿਆਹ, ਸੰਤਾਨ, ਧਨ ਅਤੇ ਹੋਰ ਬਹੁਤ ਕੁਝ।",
    heroCta: "ਕੁੰਡਲੀ ਬਣਾਓ", heroNote: "ਮੁਫ਼ਤ · ਕੋਈ ਸਾਈਨ-ਅਪ ਨਹੀਂ · 30 ਸਕਿੰਟਾਂ ਵਿੱਚ", quotesTitle: "ਮਹਾਨ ਵਿਅਕਤੀਆਂ ਦੇ ਸ਼ਬਦਾਂ ਵਿੱਚ ਤਾਰਿਆਂ ਦਾ ਗਿਆਨ",
    calcKicker: "ਆਪਣੀ ਕੁੰਡਲੀ ਦੇਖੋ", calcTitle: "ਵੈਦਿਕ ਜੋਤਿਸ਼ ਕੈਲਕੁਲੇਟਰ", calcSub: "13 ਕੈਲਕੁਲੇਟਰ ਤਿਆਰ — ਪੱਛਮੀ ਰਾਸ਼ੀ ਚੱਕਰ ਅਤੇ ਪਹਿਲੇ, ਛੇਵੇਂ, ਨੌਵੇਂ ਭਾਵ ਦੇ ਛੇ ਜੋਤਿਰਲਿੰਗ ਸਮੇਤ।",
    available: "ਉਪਲਬਧ", navSaved: "ਸੰਭਾਲੀਆਂ", navBuild: "ਕੁੰਡਲੀ ਬਣਾਓ", langAria: "ਭਾਸ਼ਾ ਚੁਣੋ",
    formLegend: "ਤੁਹਾਡਾ ਜਨਮ", formPerson1: "ਵਿਅਕਤੀ 1", formPerson2: "ਵਿਅਕਤੀ 2", formName: "ਨਾਮ", formNamePh: "ਰਿਪੋਰਟ ਉੱਤੇ ਜਿਵੇਂ ਦਿਖੇ",
    formDate: "ਜਨਮ ਤਾਰੀਖ", formTime: "ਜਨਮ ਸਮਾਂ, 24-ਘੰਟੇ", formTimeUnknown: "ਸਮਾਂ ਅਣਜਾਣ — ਦੁਪਹਿਰ 12 ਵਜੇ ਦੀ ਕੁੰਡਲੀ ਬਣਾਓ ਅਤੇ ਲਗਨ ਨੂੰ ਅਨੁਮਾਨਿਤ ਦੱਸੋ",
    formCity: "ਜਨਮ ਸਥਾਨ", formCityPh: "ਦਿੱਲੀ, ਲੰਡਨ, ਦੁਬਈ ਲੱਭੋ…", formSample: "ਨਮੂਨਾ ਭਰੋ", formCustom: "ਕੋਆਰਡੀਨੇਟ ਭਰੋ", formLocate: "ਇਸ ਡਿਵਾਈਸ ਦੀ ਵਰਤੋਂ ਕਰੋ",
    formLat: "ਅਕਸ਼ਾਂਸ਼", formLon: "ਲੰਬਕੋਟ", formTz: "ਸਮਾਂ ਖੇਤਰ", formStyle: "ਚਾਰਟ ਬਣਾਉਣ ਦਾ ਤਰੀਕਾ", formStyleNote: "ਇਹ ਸਿਰਫ਼ ਚਿੱਤਰ ਬਦਲਦਾ ਹੈ, ਗਿਣਤੀ ਨਹੀਂ।",
    formPrivacy: "ਤੁਹਾਡੀ ਰਿਪੋਰਟ ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਇੱਕ ਲਿੰਕ ਨਾਲ ਸੰਭਾਲੀ ਜਾਂਦੀ ਹੈ। ਜਿਸ ਨੂੰ ਤੁਸੀਂ ਉਹ ਲਿੰਕ ਦਿਓ, ਉਹੀ ਜਨਮ ਵੇਰਵੇ ਦੇਖ ਸਕਦਾ ਹੈ। ਪਰੰਪਰਾਵਾਂ ਸਕੋਰ ਮਾਰਗਦਰਸ਼ਨ ਹੈ — ਕੋਈ ਦਵਾਈ ਜਾਂਚ ਜਾਂ ਵਿਆਹ ਦੀ ਗਰੰਟੀ ਨਹੀਂ।",
    backCalcs: "← ਕੈਲਕੁਲੇਟਰ", guideKickerV: "ਮੁਫ਼ਤ ਵੈਦਿਕ ਜੋਤਿਸ਼ ਕੈਲਕੁਲੇਟਰ ਗਾਈਡ", guideKickerW: "ਪੱਛਮੀ ਜੋਤਿਸ਼ ਕੈਲਕੁਲੇਟਰ ਗਾਈਡ",
    guideIncludes: "ਰਿਪੋਰਟ ਵਿੱਚ ਕੀ ਹੈ", guideSteps: "ਕਿਵੇਂ ਗਿਣੀਏ", guideFaqs: "ਆਮ ਸਵਾਲ", guideRelated: "ਸੰਬੰਧਿਤ ਵੈਦਿਕ ਜੋਤਿਸ਼ ਕੈਲਕੁਲੇਟਰ",
    disclaimer: "ਜੋਤਿਸ਼ ਇੱਕ ਪਰੰਪਰਾਵਾਂ ਵਿਆਖਿਆ ਤਰੀਕਾ ਹੈ। ਕੈਲਕੁਲੇਟਰ ਨਤੀਜੇ ਸਿੱਖਿਆਵਾਂ ਮਾਰਗਦਰਸ਼ਨ ਹਨ ਅਤੇ ਪੇਸ਼ੇਵਰ ਦਵਾਈ, ਕਾਨੂੰਨੀ, ਵਿੱਤੀ ਜਾਂ ਮਾਨਸਿਕ ਸਲਾਹ ਦਾ ਬਦਲ ਨਹੀਂ।",
    tabOverview: "ਸਾਰ", tabCharts: "ਚਾਰਟ", tabHouses: "ਭਾਵ", tabDashas: "ਦਸ਼ਾਵਾਂ", tabStrength: "ਸ਼ਕਤੀ", tabYogas: "ਯੋਗ", tabDoshas: "ਦੋਸ਼", tabReading: "ਵਾਚਨ",
    tabLife: "ਜੀਵਨ", tabLove: "ਪਿਆਰ", tabWork: "ਕੰਮ", tabMoney: "ਧਨ", tabHome: "ਘਰ", tabMind: "ਮਨ", tabPurpose: "ਮਕਸਦ", tabNow: "ਇਹ ਅਧਿਆਇ",
    savedTitle: "ਸੰਭਾਲੀਆਂ ਰਿਪੋਰਟਾਂ", savedEmpty: "ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਹਾਲੇ ਕੋਈ ਰਿਪੋਰਟ ਨਹੀਂ ਸੰਭਾਲੀ ਗਈ।",
    footerContact: "ਸੰਪਰਕ", footerOnSite: "ਇਸ ਸਾਈਟ ਉੱਤੇ", footerBuild: "ਆਪਣੀ ਕੁੰਡਲੀ ਬਣਾਓ", footerWestern: "ਪੱਛਮੀ ਰਾਸ਼ੀ ਚੱਕਰ", footerJyotirlinga: "ਜੋਤਿਰਲਿੰਗ",
    footerMatching: "ਵਿਆਹ ਮੇਲ", footerCopyrights: "ਕਾਪੀਰਾਈਟ", footerRights: "ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ।",
    footerNote: "ਜੋਡੀਐਕ ਵੇਦਾ · ਨਿਰਯਨ ਰਾਸ਼ੀ, ਲਾਹਿਰੀ ਅਯਨਾਂਸ਼ · ਜੋਤਿਸ਼ ਪਰੰਪਰਾਵਾਂ ਵਿਆਖਿਆ ਹੈ; ਭਵਿਖਬਾਣੀ ਨੂੰ ਮਾਰਗਦਰਸ਼ਨ ਵਜੋਂ ਵਰਤੋ।",
    notice: "ਇੰਟਰਫੇਸ ਅਨੁਵਾਦ ਹੈ। ਵਿਸਤ੍ਰਿਤ ਨਤੀਜੇ ਅਤੇ ਲੰਬੇ ਵਾਚਨ ਹਾਲੇ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਹਨ।",
    calcBuild: "ਆਪਣੀ ਕੁੰਡਲੀ ਬਣਾਓ", calcWestern: "ਪੱਛਮੀ ਰਾਸ਼ੀ ਚੱਕਰ", calcJyotirlinga: "ਦੇਖਣ ਯੋਗ ਜੋਤਿਰਲਿੰਗ", calcMatching: "ਵਿਆਹ ਕੁੰਡਲੀ ਮੇਲ",
    calcYogas: "ਸਾਰੇ ਯੋਗ", calcDoshas: "ਸਾਰੇ ਦੋਸ਼", calcGems: "ਰਤਨ ਕੈਲਕੁਲੇਟਰ", calcVarga: "ਸਾਰੇ ਡਿਵੀਜ਼ਨਲ ਚਾਰਟ", calcKaal: "ਕਾਲ ਸਰਪ ਦੋਸ਼",
    calcMangal: "ਕੁਜ / ਮੰਗਲ ਦੋਸ਼", calcNakshatra: "ਨਕਸ਼ਤਰ ਅਤੇ ਰਾਸ਼ੀ", calcDasha: "ਵਿਸ਼ੋਤਰੀ ਦਸ਼ਾ", calcSade: "ਸਾਡੇ ਸਾਤੀ",
  },
  or: {
    brandTag: "ବୈଦିକ ଜ୍ୟୋତିଷ", heroKicker: "ବୈଦିକ ଜ୍ୟୋତିଷ · ଜ୍ୟୋତିଷ ଶାସ୍ତ୍ର", heroTitleA: "ଆକାଶ ପଢନ୍ତୁ", heroTitleB: "ଆପଣ ଜନ୍ମିଥିଲେ ଯେ ମୁହୂର୍ତ୍ତରେ",
    heroBody: "ସଠିକ ଜନ୍ମ କୁଣ୍ଡଳୀ, ଡିଭିଜନାଲ ଚାର୍ଟ, ଦଶା ଏବଂ ଆପଣଙ୍କ ଅତୀତ, ବର୍ତ୍ତମାନ ଓ ଭବିଷ୍ୟତର ପରୀକ୍ଷିତ ପୂର୍ବାନୁମାନ — କରିଅର, ବିବାହ, ସନ୍ତାନ, ଧନ ଏବଂ ଅନେକ ଅନ୍ୟାନ୍ୟ।",
    heroCta: "କୁଣ୍ଡଳୀ ତିଆରି କରନ୍ତୁ", heroNote: "ମାଗଣା · ସାଇନ୍-ଅପ୍ ନାହିଁ · 30 ସେକେଣ୍ଡରେ", quotesTitle: "ମହାନ ବ୍ୟକ୍ତିମାନଙ୍କ କଥାରେ ତାରାଗଣର ଜ୍ଞାନ",
    calcKicker: "ଆପଣଙ୍କ କୁଣ୍ଡଳୀ ଦେଖନ୍ତୁ", calcTitle: "ବୈଦିକ ଜ୍ୟୋତିଷ କ୍ୟାଲକୁଲେଟର", calcSub: "13ଟି କ୍ୟାଲକୁଲେଟର ପ୍ରସ୍ତୁତ — ପାଶ୍ଚାତ୍ୟ ରାଶିଚକ୍ର ଏବଂ ପ୍ରଥମ, ଷଷ୍ଠ, ନବମ ଭାବର 6ଟି ଜ୍ୟୋତିର୍ଲିଙ୍ଗ ସହିତ।",
    available: "ଉପଲବ୍ଧ", navSaved: "ସଞ୍ଚିତ", navBuild: "କୁଣ୍ଡଳୀ ତିଆରି କରନ୍ତୁ", langAria: "ଭାଷା ବାଛନ୍ତୁ",
    formLegend: "ଆପଣଙ୍କ ଜନ୍ମ", formPerson1: "ବ୍ୟକ୍ତି ୧", formPerson2: "ବ୍ୟକ୍ତି ୨", formName: "ନାମ", formNamePh: "ରିପୋର୍ଟରେ ଯେପରି ଦେଖାୟାଏ",
    formDate: "ଜନ୍ମ ତାରିଖ", formTime: "ଜନ୍ମ ସମୟ, 24-ଘଣ୍ଟା", formTimeUnknown: "ସମୟ ଅଜଣା — ଦୁପର 12 ବଜା କୁଣ୍ଡଳୀ ତିଆରି କରି ଲଗ୍ନକୁ ଆନୁମାନିକ କୁହନ୍ତୁ",
    formCity: "ଜନ୍ମ ସ୍ଥଳ", formCityPh: "ଦିଲ୍ଲୀ, ଲଣ୍ଡନ, ଦୁବାଇ ଖୋଜନ୍ତୁ…", formSample: "ନମୁନା ପୂରଣ କରନ୍ତୁ", formCustom: "କୋର୍ଡିନେଟ ଦିଅନ୍ତୁ", formLocate: "ଏହି ଡିଭାଇସ ବ୍ୟବହାର କରନ୍ତୁ",
    formLat: "ଅକ୍ଷାଂଶ", formLon: "ଦ୍ରାଘିମାଂଶ", formTz: "ସମୟ ଅଞ୍ଚଳ", formStyle: "ଚାର୍ଟ ଆଙ୍କିବା ଶୈଳୀ", formStyleNote: "ଏହା କେବଳ ଚିତ୍ର ବଦଳାଏ, ଗଣନା ନୁହେଁ।",
    formPrivacy: "ଆପଣଙ୍କ ରିପୋର୍ଟ ଏହି ବ୍ରାଉଜରରେ ଅନୁମାନ କଠିନ ଏକ ଲିଙ୍କରେ ସଞ୍ଚିତ ହୁଏ। ଆପଣ ଯାହାକୁ ଲିଙ୍କ ଦେବେ ସେ ଜନ୍ମ ବିବରଣୀ ଦେଖିପାରିବେ। ପାରମ୍ପାରିକ ସ୍କୋର ମାର୍ଗଦର୍ଶନ — କୌଣସି ଚିକିତ୍ସା ପରୀକ୍ଷା କିମ୍ବା ବିବାହ ଗ୍ୟାରେଣ୍ଟି ନୁହେଁ।",
    backCalcs: "← କ୍ୟାଲକୁଲେଟର", guideKickerV: "ମାଗଣା ବୈଦିକ ଜ୍ୟୋତିଷ କ୍ୟାଲକୁଲେଟର ଗାଇଡ୍", guideKickerW: "ପାଶ୍ଚାତ୍ୟ ଜ୍ୟୋତିଷ କ୍ୟାଲକୁଲେଟର ଗାଇଡ୍",
    guideIncludes: "ରିପୋର୍ଟରେ କଣ ଅଛି", guideSteps: "କିପରି ଗଣନା କରିବେ", guideFaqs: "ପ୍ରାୟଶଃ ପଚରାଯାଉଥିବା ପ୍ରଶ୍ନ", guideRelated: "ସମ୍ପର୍କିତ ବୈଦିକ ଜ୍ୟୋତିଷ କ୍ୟାଲକୁଲେଟର",
    disclaimer: "ଜ୍ୟୋତିଷ ଏକ ପାରମ୍ପାରିକ ବ୍ୟାଖ୍ୟା ପଦ୍ଧତି। କ୍ୟାଲକୁଲେଟର ଫଳାଫଳ ଶିକ୍ଷାଗତ ମାର୍ଗଦର୍ଶନ; ବୃତ୍ତିଗତ ଚିକିତ୍ସା, ଆଇନ, ଆର୍ଥିକ କିମ୍ବା ମାନସିକ ପରାମର୍ଶର ବିକଳ୍ପ ନୁହେଁ।",
    tabOverview: "ସାରାଂଶ", tabCharts: "ଚାର୍ଟ", tabHouses: "ଭାଵ", tabDashas: "ଦଶା", tabStrength: "ବଳ", tabYogas: "ଯୋଗ", tabDoshas: "ଦୋଷ", tabReading: "ପଠନ",
    tabLife: "ଜୀବନ", tabLove: "ପ୍ରେମ", tabWork: "କାମ", tabMoney: "ଧନ", tabHome: "ଘର", tabMind: "ମନ", tabPurpose: "ଉଦ୍ଦେଶ୍ୟ", tabNow: "ଏହି ଅଧ୍ୟାୟ",
    savedTitle: "ସଞ୍ଚିତ ରିପୋର୍ଟ", savedEmpty: "ଏହି ବ୍ରାଉଜରରେ ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ରିପୋର୍ଟ ସଞ୍ଚିତ ହୋଇନାହିଁ।",
    footerContact: "ଯୋଗାଯୋଗ", footerOnSite: "ଏହି ସାଇଟରେ", footerBuild: "ଆପଣଙ୍କ କୁଣ୍ଡଳୀ ତିଆରି କରନ୍ତୁ", footerWestern: "ପାଶ୍ଚାତ୍ୟ ରାଶିଚକ୍ର", footerJyotirlinga: "ଜ୍ୟୋତିର୍ଲିଙ୍ଗ",
    footerMatching: "ବିବାହ ମେଳ", footerCopyrights: "କପିରାଇଟ୍", footerRights: "ସମସ୍ତ ଅଧିକାର ସଂରକ୍ଷିତ।",
    footerNote: "ଜୋଡିଆକ୍ ୱେଦା · ନିରୟଣ ରାଶି, ଲାହିରି ଅୟନାଂଶ · ଜ୍ୟୋତିଷ ପାରମ୍ପାରିକ ବ୍ୟାଖ୍ୟା ପଦ୍ଧତି; ପୂର୍ବାନୁମାନକୁ ମାର୍ଗଦର୍ଶନ ଭାବେ ବ୍ୟବହାର କରନ୍ତୁ।",
    notice: "ଇଣ୍ଟରଫେସ୍ ଅନୁବାଦିତ। ବିସ୍ତୃତ ଫଳାଫଳ ଓ ଦୀର୍ଘ ପଠନ ଏପର୍ଯ୍ୟନ୍ତ ଇଂରାଜୀରେ ଦେଖାଯାଏ।",
    calcBuild: "ଆପଣଙ୍କ କୁଣ୍ଡଳୀ ତିଆରି କରନ୍ତୁ", calcWestern: "ପାଶ୍ଚାତ୍ୟ ରାଶିଚକ୍ର", calcJyotirlinga: "ଦର୍ଶନ ଯୋଗ୍ୟ ଜ୍ୟୋତିର୍ଲିଙ୍ଗ", calcMatching: "ବିବାହ କୁଣ୍ଡଳୀ ମେଳ",
    calcYogas: "ସମସ୍ତ ଯୋଗ", calcDoshas: "ସମସ୍ତ ଦୋଷ", calcGems: "ରତ୍ନ କ୍ୟାଲକୁଲେଟର", calcVarga: "ସମସ୍ତ ଡିଭିଜନାଲ ଚାର୍ଟ", calcKaal: "କାଲ ସର୍ପ ଦୋଷ",
    calcMangal: "କୁଜ / ମଙ୍ଗଳ ଦୋଷ", calcNakshatra: "ନକ୍ଷତ୍ର ଓ ରାଶି", calcDasha: "ବିଂଶୋତରୀ ଦଶା", calcSade: "ସାଢ଼େ ସାତି",
  },
  as: {
    brandTag: "বৈদিক জ্যোতিষ", heroKicker: "বৈদিক জ্যোতিষ · জ্যোতিষ শাস্ত্ৰ", heroTitleA: "আকাশ পঢ়ক", heroTitleB: "আপুনি জন্মিছিল সেই মুহূৰ্ত্তত",
    heroBody: "নিখুঁত জন্মকুণ্ডলী, ডিভিজনল চাৰ্ট, দশা আৰু আপোনাৰ অতীত, বৰ্তমান আৰু ভৱিষ্যতৰ পৰীক্ষিত পূৰ্বানুমান — কেৰিয়াৰ, বিবাহ, সন্তান, সম্পদ আৰু অধিক।",
    heroCta: "কুণ্ডলী বনাওক", heroNote: "বিনামূলীয়া · সাইন-আপ নাই · 30 ছেকেণ্ডত", quotesTitle: "মহান ব্যক্তিসকলৰ শব্দত তাৰাৰ জ্ঞান",
    calcKicker: "আপোনাৰ কুণ্ডলী চাওক", calcTitle: "বৈদিক জ্যোতিষ কেলকুলেটৰ", calcSub: "13টা কেলকুলেটৰ সাজু — পাশ্চাত্য ৰাশি চক্ৰ আৰু প্ৰথম, ষষ্ঠ, নবম ভাৱৰ ছয়টা জ্যোতিৰ্লিঙসহ।",
    available: "উপলব্ধ", navSaved: "সঞ্চিত", navBuild: "কুণ্ডলী বনাওক", langAria: "ভাষা বাছনি কৰক",
    formLegend: "আপোনাৰ জন্ম", formPerson1: "ব୍য়ক্তি ১", formPerson2: "ব্�ক্তি ২", formName: "নাম", formNamePh: "ৰিপৰ্টত যেনিয়া দেখা যায়",
    formDate: "জন্ম তাৰিখ", formTime: "জন্ম সময়, 24-ঘণ্টা", formTimeUnknown: "সময় অজ্ঞাত — দুপৰীয়া 12 বজাত কুণ্ডলী বনাওক আৰু লগ্নক আনুমানিক ধৰক",
    formCity: "জন্ম ঠাই", formCityPh: "দিল্লী, লন্ডন, দুবাই সন্ধান কৰক…", formSample: "নমুনা ভৰা", formCustom: "নিৰ্দেশাংক ভৰক", formLocate: "এই ডিভাইচ ব্যৱহাৰ কৰক",
    formLat: "অক্ষাংশ", formLon: "দ্রাঘিমাংশ", formTz: "সময় ক্ষেত্ৰ", formStyle: "চাৰ্ট আঁকাৰ ধৰণ", formStyleNote: "এইটো কেৱল চিত্ৰ সলনি কৰে, গণনা নহয়।",
    formPrivacy: "আপোনাৰ ৰিপৰ্ট এই ব্ৰাউজাৰত অনুমান-কঠিন এটা লিংকত সঞ্চিত হয়। আপুনি যাক লিংকটো দিব সেই জনে জন্মৰ বিৱৰণ দেখিব পাৰে। পাৰম্পৰিক স্ক'ৰ এটা নিৰ্দেশনা — কোনো চিকিৎসা পৰীক্ষা বা বিবাহৰ হামী নহয়।",
    backCalcs: "← কেলকুলেটৰ", guideKickerV: "বিনামূলীয়া বৈদিক জ্যোতিষ কেলকুলেটৰ গাইড", guideKickerW: "পাশ্চাত্য জ্যোতিষ কেলকুলেটৰ গাইড",
    guideIncludes: "ৰিপৰ্টত কি আছে", guideSteps: "কেনেকৈ গণনা কৰিব", guideFaqs: "সঘনাই সোধা প্ৰশ্ন", guideRelated: "সম্পৰ্কিত বৈদিক জ্যোতিষ কেলকুলেটৰ",
    disclaimer: "জ্যোতিষ এটা পাৰম্পৰিক ব্যাখ্যা পদ্ধতি। কেলকুলেটৰৰ ফলাফল শিক্ষাগত নিৰ্দেশনা; ব্যৱসায়িক চিকিৎসা, আইন, আৰ্থিক বা মানসিক পৰামৰ্শৰ বিকল্প নহয়।",
    tabOverview: "সাৰাংশ", tabCharts: "চাৰ্ট", tabHouses: "ভাৱ", tabDashas: "দশা", tabStrength: "বল", tabYogas: "যোগ", tabDoshas: "দোষ", tabReading: "প৥ন",
    tabLife: "জীৱন", tabLove: "প্ৰেম", tabWork: "কাৰ্য", tabMoney: "সম্পদ", tabHome: "ঘৰ", tabMind: "মন", tabPurpose: "উদ্দেশ্য", tabNow: "এই অধ্যায়",
    savedTitle: "সঞ্চিত ৰিপৰ্ট", savedEmpty: "এই ব্ৰাউজাৰত এতিয়ালৈকে কোনো ৰিপৰ্ট সঞ্চিত হোৱা নাই।",
    footerContact: "যোগাযোগ", footerOnSite: "এই ছাইটত", footerBuild: "আপোনাৰ কুণ্ডলী বনাওক", footerWestern: "পাশ্চাত্য ৰাশি চক্ৰ", footerJyotirlinga: "জ্যোতিৰ্লিঙ",
    footerMatching: "বিবাহ মিলন", footerCopyrights: "কপিৰাইট", footerRights: "সৰ্বস্বত্ব সংৰক্ষিত।",
    footerNote: "জডিয়াক বেদা · নিৰয়ন ৰাশি, লাহিৰি অয়নাংশ · জ্যোতিষ পাৰম্পৰিক ব্যাখ্যা পদ্ধতি; পূৰ্বানুমানক নিৰ্দেশনা হিচাপে ব্যৱহাৰ কৰক।",
    notice: "ইণ্টাৰফেছ অনুবাদ কৰা হৈছে। বিৱৰণপূৰ্ণ ফলাফল আৰু দীঘলীয়া প৥ন এতিয়াও ইংৰাজীত দেখায়।",
    calcBuild: "আপোনাৰ কুণ্ডলী বনাওক", calcWestern: "পাশ্চাত্য ৰাশি চক্ৰ", calcJyotirlinga: "দৰ্শন যোগ্য জ্যোতিৰ্লিঙ", calcMatching: "বিবাহ কুণ্ডলী মিলন",
    calcYogas: "সকলো যোগ", calcDoshas: "সকলো দোষ", calcGems: "ৰত্ন কেলকুলেটৰ", calcVarga: "সকলো ডিভিজনল চাৰ্ট", calcKaal: "কাল সৰ্প দোষ",
    calcMangal: "কুজ / মঙ্গল দোষ", calcNakshatra: "নক্ষত্ৰ আৰু ৰাশি", calcDasha: "বিংশোত্তৰী দশা", calcSade: "সাডে সাতী",
  },
  ur: {
    brandTag: "ویدک جیوتیش", heroKicker: "ویدک جیوتیش · جیوتیش شاستر", heroTitleA: "آسمان کو پڑھیں", heroTitleB: "جس لمحہ آپ پیدا ہوئے",
    heroBody: "درست جنم کنڈلی، ڈویژنل چارٹ، دشائیں اور آپ کے ماضی، حال اور مستقبل کی جانچی ہوئی پیش گوئیاں — کیریئر، شادی، اولاد، دولت اور مزید۔",
    heroCta: "کنڈلی بنائیں", heroNote: "مفت · کوئی سائن اپ نہیں · 30 سیکنڈ میں", quotesTitle: "بزرگوں کے الفاظ میں ستاروں کا علم",
    calcKicker: "اپنی کنڈلی دیکھیں", calcTitle: "ویدک جیوتیش کیلکولیٹر", calcSub: "13 کیلکولیٹر تیار — مغربی راسی چکر اور پہلے، چھٹے، نویں گھر کے چھ جیوترلنگ سمیت۔",
    available: "دستیاب", navSaved: "محفوظ", navBuild: "کنڈلی بنائیں", langAria: "زبان منتخب کریں",
    formLegend: "آپ کی پیدائش", formPerson1: "شخص 1", formPerson2: "شخص 2", formName: "نام", formNamePh: "رپورٹ پر جیسا دکھے",
    formDate: "تاریخ پیدائش", formTime: "وقت پیدائش، 24 گھنٹے", formTimeUnknown: "وقت نامعلوم — دوپہر 12 بجے کی کنڈلی بنائیں اور لگن کو تخمینی بتائیں",
    formCity: "مقام پیدائش", formCityPh: "دہلی، لندن، دبئی تلاش کریں…", formSample: "نمونہ بھریں", formCustom: "کوآرڈینیٹ درج کریں", formLocate: "اس ڈیوائس کا استعمال کریں",
    formLat: "عرض بلد", formLon: "طول بلد", formTz: "منطقۂ وقت", formStyle: "چارٹ بنانے کا انداز", formStyleNote: "یہ صرف تصویر بدلتا ہے، حساب نہیں۔",
    formPrivacy: "آپ کی رپورٹ اس براؤزر میں ایک ناقابلِ اندازہ لنک کے ساتھ محفوظ ہوتی ہے۔ جسے آپ وہ لنک دیں گے وہی پیدائشی تفصیلات دیکھ سکے گا۔ روایتی اسکور رہنمائی ہے — کوئی طبی جانچ یا شادی کی ضمانت نہیں۔",
    backCalcs: "← کیلکولیٹر", guideKickerV: "مفت ویدک جیوتیش کیلکولیٹر گائیڈ", guideKickerW: "مغربی جیوتیش کیلکولیٹر گائیڈ",
    guideIncludes: "رپورٹ میں کیا ہے", guideSteps: "حساب کیسے کریں", guideFaqs: "عام سوالات", guideRelated: "متعلقہ ویدک جیوتیش کیلکولیٹر",
    disclaimer: "جیوتیش ایک روایتی تفسیری نظام ہے۔ کیلکولیٹر کے نتائج تعلیمی رہنمائی ہیں اور پیشہ ورانہ طبی، قانونی، مالی یا نفسیاتی مشورے کا متبادل نہیں۔",
    tabOverview: "خلاصہ", tabCharts: "چارٹ", tabHouses: "گھر", tabDashas: "دشائیں", tabStrength: "طاقت", tabYogas: "یوگ", tabDoshas: "دوش", tabReading: "تفسیر",
    tabLife: "زندگی", tabLove: "محبت", tabWork: "کام", tabMoney: "دولت", tabHome: "گھر", tabMind: "ذہن", tabPurpose: "مقصد", tabNow: "یہ باب",
    savedTitle: "محفوظ رپورٹیں", savedEmpty: "اس براؤزر میں ابھی تک کوئی رپورٹ محفوظ نہیں۔",
    footerContact: "رابطہ", footerOnSite: "اس سائٹ پر", footerBuild: "اپنی کنڈلی بنائیں", footerWestern: "مغربی راسی چکر", footerJyotirlinga: "جیوترلنگ",
    footerMatching: "شادی کی مطابقت", footerCopyrights: "کاپی رائٹ", footerRights: "جملہ حقوق محفوظ ہیں۔",
    footerNote: "زوڈایک ویدا · نیران راشی، لاہیری ایانامشا · جیوتیش ایک روایتی تفسیری نظام ہے؛ پیش گوئیوں کو رہنمائی کے لیے استعمال کریں۔",
    notice: "انٹرفیس ترجمہ شدہ ہے۔ تفصیلی نتائج اور طویل تفسیریں ابھی انگریزی میں دکھائی جاتی ہیں۔",
    calcBuild: "اپنی کنڈلی بنائیں", calcWestern: "مغربی راسی چکر", calcJyotirlinga: "دیکھنے کے قابل جیوترلنگ", calcMatching: "شادی کی کنڈلی مطابقت",
    calcYogas: "تمام یوگ", calcDoshas: "تمام دوش", calcGems: "رتن کیلکولیٹر", calcVarga: "تمام ڈویژنل چارٹ", calcKaal: "کال سرپ دوش",
    calcMangal: "کوج / منگل دوش", calcNakshatra: "نکھتر اور راشی", calcDasha: "وِمشوتری دشا", calcSade: "ساڑھے سات",
  },
  es: {
    brandTag: "Astrología védica", heroKicker: "Astrología védica · Jyotiṣa Śāstra", heroTitleA: "Descifra el cielo", heroTitleB: "en el instante en que naciste",
    heroBody: "Cartas natales precisas, cartas divisionales, dashas y predicciones probadas de tu pasado, presente y futuro: carrera, matrimonio, hijos, riqueza y más.",
    heroCta: "Crear carta", heroNote: "Gratis · Sin registro · En 30 segundos", quotesTitle: "La sabiduría de las estrellas, en palabras de los grandes",
    calcKicker: "Explora tu horóscopo", calcTitle: "Calculadoras de astrología védica", calcSub: "13 calculadoras listas, con horóscopo occidental y los seis Jyotirlingas de las casas 1, 6 y 9.",
    available: "Disponible", navSaved: "Guardados", navBuild: "Crear carta", langAria: "Elegir idioma",
    formLegend: "Tu nacimiento", formPerson1: "Persona 1", formPerson2: "Persona 2", formName: "Nombre", formNamePh: "Como quieras que aparezca",
    formDate: "Fecha de nacimiento", formTime: "Hora de nacimiento, 24 h", formTimeUnknown: "Hora desconocida: calcular carta del mediodía y marcar el ascendente como aproximado",
    formCity: "Ciudad de nacimiento", formCityPh: "Busca Delhi, Londres, Dubái…", formSample: "Usar ejemplo", formCustom: "Coordenadas propias", formLocate: "Usar este dispositivo",
    formLat: "Latitud", formLon: "Longitud", formTz: "Zona horaria", formStyle: "Estilo de dibujo", formStyleNote: "Solo cambia el dibujo, no el cálculo.",
    formPrivacy: "Tu informe se guarda en este navegador con un enlace difícil de adivinar. Quien reciba ese enlace podrá ver los datos de nacimiento. La puntuación tradicional es orientación, no una prueba médica ni una garantía.",
    backCalcs: "← Calculadoras", guideKickerV: "Guía gratuita de astrología védica", guideKickerW: "Guía de astrología occidental",
    guideIncludes: "Qué incluye el informe", guideSteps: "Cómo calcularlo", guideFaqs: "Preguntas frecuentes", guideRelated: "Calculadoras relacionadas",
    disclaimer: "La astrología es un sistema tradicional de interpretación. Los resultados son orientación educativa y no sustituyen consejo médico, legal, financiero o psicológico profesional.",
    tabOverview: "Resumen", tabCharts: "Cartas", tabHouses: "Casas", tabDashas: "Dashas", tabStrength: "Fuerza", tabYogas: "Yogas", tabDoshas: "Doshas", tabReading: "Lectura",
    tabLife: "Vida", tabLove: "Amor", tabWork: "Trabajo", tabMoney: "Dinero", tabHome: "Hogar", tabMind: "Mente", tabPurpose: "Propósito", tabNow: "Este capítulo",
    savedTitle: "Informes guardados", savedEmpty: "Aún no hay informes en este navegador.",
    footerContact: "Contacto", footerOnSite: "En este sitio", footerBuild: "Crea tu horóscopo", footerWestern: "Horóscopo occidental", footerJyotirlinga: "Jyotirlingas",
    footerMatching: "Compatibilidad de pareja", footerCopyrights: "Derechos de autor", footerRights: "Todos los derechos reservados.",
    footerNote: "Zodiac Veda · Zodíaco sideral, ayanamsa Lahiri · La astrología es un sistema tradicional de interpretación; usa las predicciones como guía.",
    notice: "La interfaz está traducida. Los resultados detallados y las lecturas largas siguen en inglés mientras se completa la traducción.",
    calcBuild: "Crea tu horóscopo", calcWestern: "Horóscopo occidental", calcJyotirlinga: "Jyotirlingas para visitar", calcMatching: "Compatibilidad matrimonial",
    calcYogas: "Todos los yogas", calcDoshas: "Todos los doshas", calcGems: "Calculadora de gemas", calcVarga: "Todas las cartas divisionales", calcKaal: "Dosha Kaal Sarp",
    calcMangal: "Dosha Kuja / Mangal", calcNakshatra: "Nakshatra y Rashi", calcDasha: "Dasha Vimshottari", calcSade: "Sade Sati",
  },
  fr: {
    brandTag: "Astrologie védique", heroKicker: "Astrologie védique · Jyotiṣa Śāstra", heroTitleA: "Décode le ciel", heroTitleB: "à l'instant de ta naissance",
    heroBody: "Thèmes de naissance précis, cartes divisionnelles, dashas et prédictions éprouvées de ton passé, présent et futur : carrière, mariage, enfants, richesse et plus.",
    heroCta: "Créer le thème", heroNote: "Gratuit · Sans inscription · En 30 secondes", quotesTitle: "La sagesse des étoiles, dans les mots des grands",
    calcKicker: "Explore ton horoscope", calcTitle: "Calculatrices d'astrologie védique", calcSub: "13 calculatrices prêtes, avec horoscope occidental et les six Jyotirlingas des maisons 1, 6 et 9.",
    available: "Disponible", navSaved: "Enregistrés", navBuild: "Créer le thème", langAria: "Choisir la langue",
    formLegend: "Ta naissance", formPerson1: "Personne 1", formPerson2: "Personne 2", formName: "Nom", formNamePh: "Comme tu veux le voir",
    formDate: "Date de naissance", formTime: "Heure de naissance, 24 h", formTimeUnknown: "Heure inconnue : calculer un thème de midi et marquer l'ascendant comme approximatif",
    formCity: "Ville de naissance", formCityPh: "Cherche Delhi, Londres, Dubaï…", formSample: "Utiliser un exemple", formCustom: "Coordonnées", formLocate: "Utiliser cet appareil",
    formLat: "Latitude", formLon: "Longitude", formTz: "Fuseau horaire", formStyle: "Style de dessin", formStyleNote: "Change seulement le dessin, pas le calcul.",
    formPrivacy: "Ton rapport est enregistré dans ce navigateur avec un lien difficile à deviner. Quiconque reçoit ce lien peut voir les données de naissance. Le score traditionnel est une orientation, pas un test médical ni une garantie.",
    backCalcs: "← Calculatrices", guideKickerV: "Guide gratuit d'astrologie védique", guideKickerW: "Guide d'astrologie occidentale",
    guideIncludes: "Ce que contient le rapport", guideSteps: "Comment le calculer", guideFaqs: "Questions fréquentes", guideRelated: "Calculatrices associées",
    disclaimer: "L'astrologie est un système traditionnel d'interprétation. Les résultats sont une orientation éducative et ne remplacent pas un avis médical, juridique, financier ou psychologique professionnel.",
    tabOverview: "Aperçu", tabCharts: "Cartes", tabHouses: "Maisons", tabDashas: "Dashas", tabStrength: "Force", tabYogas: "Yogas", tabDoshas: "Doshas", tabReading: "Lecture",
    tabLife: "Vie", tabLove: "Amour", tabWork: "Travail", tabMoney: "Argent", tabHome: "Foyer", tabMind: "Esprit", tabPurpose: "But", tabNow: "Ce chapitre",
    savedTitle: "Rapports enregistrés", savedEmpty: "Aucun rapport enregistré dans ce navigateur.",
    footerContact: "Contact", footerOnSite: "Sur ce site", footerBuild: "Crée ton horoscope", footerWestern: "Horoscope occidental", footerJyotirlinga: "Jyotirlingas",
    footerMatching: "Compatibilité conjugale", footerCopyrights: "Droits d'auteur", footerRights: "Tous droits réservés.",
    footerNote: "Zodiac Veda · Zodiaque sidéral, ayanamsa Lahiri · L'astrologie est un système traditionnel d'interprétation ; utilise les prédictions comme guide.",
    notice: "L'interface est traduite. Les résultats détaillés et les longues lectures restent en anglais le temps de terminer la traduction.",
    calcBuild: "Crée ton horoscope", calcWestern: "Horoscope occidental", calcJyotirlinga: "Jyotirlingas à visiter", calcMatching: "Compatibilité matrimoniale",
    calcYogas: "Tous les yogas", calcDoshas: "Tous les doshas", calcGems: "Calculatrice de pierres", calcVarga: "Toutes les cartes divisionnelles", calcKaal: "Dosha Kaal Sarp",
    calcMangal: "Dosha Kuja / Mangal", calcNakshatra: "Nakshatra et Rashi", calcDasha: "Dasha Vimshottari", calcSade: "Sade Sati",
  },
  ar: {
    brandTag: "الفلك الفيدي", heroKicker: "الفلك الفيدي · جيوتيش شاسترا", heroTitleA: "اقرأ السماء", heroTitleB: "في اللحظة التي وُلدت فيها",
    heroBody: "مخططات ميلاد دقيقة، مخططات تقسيمية، دهشات، وتنبؤات مُجرَّبة عن ماضيك وحاضرك ومستقبلك — العمل، الزواج، الأبناء، الثروة والمزيد.",
    heroCta: "ابنِ المخطط", heroNote: "مجاني · بلا تسجيل · في 30 ثانية", quotesTitle: "حكمة النجوم، بكبار القول",
    calcKicker: "استكشف برجك", calcTitle: "حاسبات الفلك الفيدي", calcSub: "13 حاسبة جاهزة، مع الأبراج الغربية وستة جيوتيرلينجا للبيوت الأولى والسادسة والتاسعة.",
    available: "متاح", navSaved: "المحفوظة", navBuild: "ابنِ المخطط", langAria: "اختر اللغة",
    formLegend: "ميلادك", formPerson1: "الشخص 1", formPerson2: "الشخص 2", formName: "الاسم", formNamePh: "كما تريده في التقرير",
    formDate: "تاريخ الميلاد", formTime: "وقت الميلاد، 24 ساعة", formTimeUnknown: "الوقت مجهول — احسب مخطط الظهر واجعل الطالع تقديريًا",
    formCity: "مدينة الميلاد", formCityPh: "ابحث عن دلهي، لندن، دبي…", formSample: "استخدم مثالًا", formCustom: "إحداثيات مخصصة", formLocate: "استخدم هذا الجهاز",
    formLat: "خط العرض", formLon: "خط الطول", formTz: "المنطقة الزمنية", formStyle: "نمط الرسم", formStyleNote: "يغيّر الرسم فقط، لا الحساب.",
    formPrivacy: "يُحفظ تقريرك في هذا المتصفح برابط يصعب تخمينه. من يحصل على الرابط يستطيع رؤية بيانات الميلاد. النتيجة التقليدية إرشاد، وليس فحصًا طبيًا أو ضمانًا للزواج.",
    backCalcs: "← الحاسبات", guideKickerV: "دليل مجاني للفلك الفيدي", guideKickerW: "دليل الفلك الغربي",
    guideIncludes: "ما يتضمنه التقرير", guideSteps: "كيف تحسبه", guideFaqs: "أسئلة شائعة", guideRelated: "حاسبات ذات صلة",
    disclaimer: "الفلك نظام تقليدي للتفسير. نتائج الحاسبات إرشاد تعليمي ولا تُغني عن استشارة طبية أو قانونية أو مالية أو نفسية مهنية.",
    tabOverview: "نظرة عامة", tabCharts: "المخططات", tabHouses: "البيوت", tabDashas: "الدهشات", tabStrength: "القوة", tabYogas: "اليوغات", tabDoshas: "الدوشات", tabReading: "القراءة",
    tabLife: "الحياة", tabLove: "الحب", tabWork: "العمل", tabMoney: "المال", tabHome: "المنزل", tabMind: "العقل", tabPurpose: "الغاية", tabNow: "هذا الفصل",
    savedTitle: "التقارير المحفوظة", savedEmpty: "لا توجد تقارير محفوظة في هذا المتصفح.",
    footerContact: "تواصل", footerOnSite: "في هذا الموقع", footerBuild: "ابنِ برجك", footerWestern: "الأبراج الغربية", footerJyotirlinga: "جيوتيرلينجا",
    footerMatching: "توافق الزواج", footerCopyrights: "حقوق النشر", footerRights: "جميع الحقوق محفوظة.",
    footerNote: "زوڈیک ویدا · البرج النجمي، أيانمشا لاهيري · الفلك نظام تقليدي للتفسير؛ استخدم التنبؤات للإرشاد والتأمل.",
    notice: "الواجهة مترجمة. النتائج التفصيلية والقراءات الطويلة تظهر بالإنجليزية حتى تكتمل الترجمة.",
    calcBuild: "ابنِ برجك", calcWestern: "الأبراج الغربية", calcJyotirlinga: "جيوتيرلينجا للزيارة", calcMatching: "توافق أبراج الزواج",
    calcYogas: "كل اليوغات", calcDoshas: "كل الدوشات", calcGems: "حاسبة الأحجار", calcVarga: "كل المخططات التقسيمية", calcKaal: "دوشا كال سارب",
    calcMangal: "دوشا كوجا / مانجال", calcNakshatra: "النجمة والبرج", calcDasha: "دهشا فيمشوتاري", calcSade: "ساده ساتي",
  },
};

export function useI18n() {
  const [lang, setLang] = useState("en");
  useEffect(() => {
    const readLanguage = () => {
      let saved = "en";
      try {
        saved = localStorage.getItem(LANG_KEY) ?? "en";
      } catch {
        saved = "en";
      }
      setLang(LANGUAGES.some((language) => language.code === saved) ? saved : "en");
    };
    readLanguage();
    const onStorage = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === "string") {
        const selected = event.detail;
        setLang(LANGUAGES.some((language) => language.code === selected) ? selected : "en");
      } else {
        readLanguage();
      }
    };
    window.addEventListener("zv-lang", onStorage);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("zv-lang", onStorage);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const t = (key: keyof Dict): string => DICTS[lang]?.[key] ?? EN[key];
  return { lang, t, isEnglish: lang === "en" };
}
