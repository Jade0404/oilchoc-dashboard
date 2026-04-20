import { Lang } from "@/types";

const t = {
  en: {
    // Header
    eyebrow: "Earth Engineering Hackathon · Policy Dashboard",
    title: "The Subsidy Volatility Paradox",
    subtitle:
      "Regulated fuel markets suppress prices — but create 1.94× higher shock rates when corrections occur (Mann-Whitney U p=0.0014, Bootstrap CI [1.47×, 2.33×]).",
    toggleLang: "ภาษาไทย",

    // Key findings
    findingsLabel: "Key Findings",
    stat1Value: "1.94×",
    stat1Label: "Higher shock rate: regulated vs deregulated",
    stat2Value: "p = 0.0014",
    stat2Label: "Mann-Whitney U · KS p = 0.0001",
    stat3Value: "[1.47×, 2.33×]",
    stat3Label: "Bootstrap 95% CI — excludes 1.0",
    stat4Value: "207",
    stat4Label: "Countries · 113 months of data",

    // Thailand badge
    caseStudy: "Case Study: Thailand",
    thaiShocks: "4 shock events in 113 months",
    thaiPercentile: "54th percentile of regulated economies",

    // Stress Tester
    toolATitle: "Policy Stress Tester",
    toolADesc:
      "Simulate how subsidy level affects price shock frequency across income groups.",
    subsidyLevel: "Subsidy Level",
    marketType: "Market Type",
    regulated: "Regulated",
    deregulated: "Deregulated",
    monthlyShockProb: "Monthly Shock Probability",
    annualShockProb: "Annual Shock Probability",
    lowIncome: "Low Income",
    middleIncome: "Middle Income",
    highIncome: "High Income",
    shockProbBySubsidy: "Shock Probability vs. Subsidy Level (%)",
    shockProbAxis: "Monthly Shock Prob. (%)",
    subsidyAxis: "Subsidy Level (%)",

    // Reform Optimizer
    toolBTitle: "Reform Roadmap Optimizer",
    toolBDesc:
      "Compare three reform paths and their impact on household cost exposure.",
    currentSubsidy: "Current Subsidy Level",
    fastCut: "Fast Cut",
    gradual: "Gradual Phase-Out",
    cashTransfer: "Cash Transfer Switch",
    compositeScore: "Composite Score",
    fiscalSavings: "Fiscal Savings",
    equityScore: "Equity Score",
    speedScore: "Speed Score",
    fiscalScore: "Fiscal Score",
    maxLowShock: "Peak low-income shock",
    transitionMonths: "Transition months",
    usdBn: "USD bn",
    timeline: "Shock Probability Timeline (%)",
    monthAxis: "Month",

    // Footer
    dataSource: "Data: World Bank Global Fuel Prices & Subsidy Dataset",
    period: "Dec 2015 – Apr 2025",
  },

  th: {
    eyebrow: "Earth Engineering Hackathon · แดชบอร์ดนโยบาย",
    title: "ความขัดแย้งเชิงนโยบายเงินอุดหนุน",
    subtitle:
      "ตลาดน้ำมันที่ควบคุมราคากดราคาไว้ แต่สร้างความเบ้สูงกว่า 14 เท่า และความน่าจะเป็นในการเกิดราคากระชากสูงกว่า 2.3 เท่า",
    toggleLang: "English",

    findingsLabel: "ผลการวิจัยหลัก",
    stat1Value: "1.94×",
    stat1Label: "อัตราราคากระชาก: ตลาดควบคุม vs เสรี",
    stat2Value: "p = 0.0014",
    stat2Label: "Mann-Whitney U · KS p = 0.0001",
    stat3Value: "[1.47×, 2.33×]",
    stat3Label: "Bootstrap 95% CI — ไม่รวม 1.0",
    stat4Value: "207",
    stat4Label: "ประเทศ · ข้อมูล 113 เดือน",

    caseStudy: "กรณีศึกษา: ประเทศไทย",
    thaiShocks: "4 เหตุการณ์ราคากระชากใน 113 เดือน",
    thaiPercentile: "เปอร์เซ็นไทล์ที่ 54 ของเศรษฐกิจควบคุมราคา",

    toolATitle: "เครื่องทดสอบความเครียดนโยบาย",
    toolADesc:
      "จำลองผลกระทบของระดับเงินอุดหนุนต่อความถี่ราคากระชากในแต่ละกลุ่มรายได้",
    subsidyLevel: "ระดับเงินอุดหนุน",
    marketType: "ประเภทตลาด",
    regulated: "ราคาควบคุม",
    deregulated: "ราคาตลาด",
    monthlyShockProb: "ความน่าจะเป็นต่อเดือน",
    annualShockProb: "ความน่าจะเป็นต่อปี",
    lowIncome: "รายได้ต่ำ",
    middleIncome: "รายได้ปานกลาง",
    highIncome: "รายได้สูง",
    shockProbBySubsidy: "ความน่าจะเป็นราคากระชาก vs. ระดับเงินอุดหนุน (%)",
    shockProbAxis: "ความน่าจะเป็น/เดือน (%)",
    subsidyAxis: "ระดับเงินอุดหนุน (%)",

    toolBTitle: "เครื่องมือวางแผนเส้นทางการปฏิรูป",
    toolBDesc:
      "เปรียบเทียบสามเส้นทางการปฏิรูปและผลกระทบต่อค่าใช้จ่ายครัวเรือน",
    currentSubsidy: "ระดับเงินอุดหนุนปัจจุบัน",
    fastCut: "ตัดเร็ว",
    gradual: "ลดแบบค่อยเป็นค่อยไป",
    cashTransfer: "เปลี่ยนเป็นโอนเงินสด",
    compositeScore: "คะแนนรวม",
    fiscalSavings: "ประหยัดงบประมาณ",
    equityScore: "คะแนนความเสมอภาค",
    speedScore: "คะแนนความเร็ว",
    fiscalScore: "คะแนนการคลัง",
    maxLowShock: "ราคากระชากสูงสุดกลุ่มรายได้ต่ำ",
    transitionMonths: "ระยะเวลาเปลี่ยนผ่าน (เดือน)",
    usdBn: "พันล้านดอลลาร์",
    timeline: "ความน่าจะเป็นราคากระชากตามเวลา (%)",
    monthAxis: "เดือน",

    dataSource: "ข้อมูล: World Bank Global Fuel Prices & Subsidy Dataset",
    period: "ธ.ค. 2558 – เม.ย. 2568",
  },
} as const;

export type TranslationKey = keyof (typeof t)["en"];

export function useTranslations(lang: Lang) {
  return (key: TranslationKey): string => t[lang][key] as string;
}

export { t };
