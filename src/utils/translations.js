// src/utils/translations.js

export const categoryTranslations = {
  gk: "सामान्य ज्ञान",
  marathi: "मराठी",
  reasoning: "बुद्धिमत्ता",
  math: "गणित",
  other: "इतर",
};

export const subCategoryTranslations = {
  // GK
  politics: "राज्यशास्त्र",
  economics: "अर्थशास्त्र",
  history: "इतिहास",
  geography: "भूगोल",
  computer: "संगणक",
  scienceAndTechnology: "विज्ञान आणि तंत्रज्ञान",
  currentAffairs: "चालू घडामोडी",
  sports: "खेळ",
  nationalMovements: "राष्ट्रीय चळवळी",
  literatureAndTradition: "साहित्य आणि परंपरा",
  // Marathi
  grammar: "व्याकरण",
  idioms: "म्हणी आणि वाक्प्रचार",
  languageUse: "भाषेचा वापर",
  vocabulary: "शब्दसंग्रह",
  synonymsAntonyms: "समानार्थी/विरुद्धार्थी",
  // Math
  lcmHcf: "लसावि आणि मसावि",
  profitAndLoss: "नफा आणि तोटा",
  timeAndWork: "काळ आणि काम",
  percentageDiscount: "शेकडेवारी आणि सूट",
  ratioProportion: "गुणोत्तर आणि प्रमाण",
  mensuration: "भूमिती",
  geometry: "भूमिती",
  areaVolume: "क्षेत्रफळ आणि घनफळ",
  // Reasoning
  verbalNonVerbal: "शाब्दिक/अशाब्दिक",
  codingDecoding: "सांकेतिक भाषा",
  syllogism: "तर्क आणि अनुमान",
  bloodRelation: "नातेसंबंध",
  classification: "वर्गीकरण",
  analogies: "समानता",
  alphabetSeries: "अक्षरमाला",
  wordArrangement: "शब्दरचना",
  sentenceArrangement: "वाक्यरचना",
  dataInterpretation: "माहितीचे विश्लेषण",
  reasonAssertion: "तर्क आणि विधान",
  problemSolving: "समस्या सोडवणे",
  directionTest: "दिशा ज्ञान",
};

export const getCategoryKeys = () => Object.keys(categoryTranslations);

export const getSubCategoryKeysForCategory = (category) => {
  const allSubCategories = {
    gk: [
      "politics",
      "economics",
      "history",
      "geography",
      "computer",
      "scienceAndTechnology",
      "currentAffairs",
      "sports",
      "nationalMovements",
      "literatureAndTradition",
    ],
    marathi: [
      "grammar",
      "idioms",
      "languageUse",
      "vocabulary",
      "synonymsAntonyms",
    ],
    math: [
      "lcmHcf",
      "profitAndLoss",
      "timeAndWork",
      "percentageDiscount",
      "ratioProportion",
      "mensuration",
      "geometry",
      "areaVolume",
    ],
    reasoning: [
      "verbalNonVerbal",
      "codingDecoding",
      "syllogism",
      "bloodRelation",
      "classification",
      "analogies",
      "alphabetSeries",
      "wordArrangement",
      "sentenceArrangement",
      "dataInterpretation",
      "reasonAssertion",
      "problemSolving",
      "directionTest",
    ],
    other: [],
  };
  return allSubCategories[category] || [];
};
