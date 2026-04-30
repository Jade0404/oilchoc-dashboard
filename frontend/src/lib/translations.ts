import { Lang } from "@/types";

const t = {
  en: {
    // Header
    eyebrow: "Earth Engineering Hackathon · Policy Dashboard",
    title: "The Subsidy Volatility Paradox",
    subtitle:
      "Regulated fuel markets suppress prices — but create 1.94× higher shock rates when corrections occur (Mann-Whitney U p=0.0013, Bootstrap CI [1.47×, 2.33×]).",
    toggleLang: "ภาษาไทย",

    // Key findings
    findingsLabel: "Key Findings",
    stat1Value: "1.94×",
    stat1Label: "Higher shock rate: regulated vs deregulated",
    stat2Value: "p = 0.0013",
    stat2Label: "Mann-Whitney U · KS p = 0.0001",
    stat3Value: "[1.47×, 2.33×]",
    stat3Label: "Bootstrap 95% CI — excludes 1.0",
    stat4Value: "207",
    stat4Label: "Countries · 113 months of data",

    // Thailand badge
    caseStudy: "Case Study: Thailand",
    thaiShocks: "4 shock events in 113 months",
    thaiPercentile: "55th percentile of regulated economies — typical, not outlier",

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
    // ── Header ──────────────────────────────────────────────────────────────
    eyebrow: "Earth Engineering Hackathon · แดชบอร์ดวิเคราะห์นโยบายพลังงาน",
    title: "ภาวะขัดแย้งของนโยบายเงินอุดหนุนพลังงาน",
    subtitle:
      "ตลาดพลังงานภายใต้การกำกับดูแลราคาอาจยับยั้งความผันผวนในระยะสั้น แต่ผลพวงสะสมกลับแปรรูปเป็นความเสี่ยงเชิงโครงสร้าง — ข้อมูลเชิงประจักษ์ยืนยันอัตราการกระชากราคาสูงกว่าตลาดเสรีถึง 1.94 เท่า (p = 0.0014)",
    toggleLang: "English",

    // ── ผลการวิจัย ──────────────────────────────────────────────────────────
    findingsLabel: "ผลการวิจัยสำคัญ",
    stat1Value: "1.94×",
    stat1Label: "อัตราการกระชากราคาในตลาดกำกับดูแลสูงกว่าตลาดเสรี",
    stat2Value: "p = 0.0013",
    stat2Label: "นัยสำคัญทางสถิติ · Mann-Whitney U · KS p = 0.0001",
    stat3Value: "[1.47×, 2.33×]",
    stat3Label: "ช่วงความเชื่อมั่น 95% Bootstrap — ยืนยันผลอย่างมีนัยสำคัญ",
    stat4Value: "207",
    stat4Label: "ประเทศทั่วโลก · ฐานข้อมูล 113 เดือน",

    // ── กรณีศึกษาไทย ────────────────────────────────────────────────────────
    caseStudy: "กรณีศึกษา: ประเทศไทย",
    thaiShocks: "พบการกระชากราคา 4 ครั้ง ในช่วง 113 เดือน",
    thaiPercentile: "อยู่ที่เปอร์เซนต์ไทล์ที่ 55 ของเศรษฐกิจที่มีการกำกับดูแลราคา — เศรษฐกิจทั่วไป ไม่ใช่ case สุดขั้ว",

    // ── เครื่องมือ A ─────────────────────────────────────────────────────────
    toolATitle: "เครื่องมือจำลองความเสี่ยงเชิงนโยบาย",
    toolADesc:
      "วิเคราะห์ผลกระทบของระดับเงินอุดหนุนต่อความถี่การกระชากราคา จำแนกตามกลุ่มรายได้ของประชากร",
    subsidyLevel: "ระดับเงินอุดหนุน",
    marketType: "รูปแบบตลาด",
    regulated: "ตลาดที่มีการกำกับดูแลราคา",
    deregulated: "ตลาดราคาเสรี",
    monthlyShockProb: "ความน่าจะเป็นในการกระชากราคา (รายเดือน)",
    annualShockProb: "ความน่าจะเป็นในการกระชากราคา (รายปี)",
    lowIncome: "กลุ่มรายได้น้อย",
    middleIncome: "กลุ่มรายได้ปานกลาง",
    highIncome: "กลุ่มรายได้สูง",
    shockProbBySubsidy: "ความน่าจะเป็นในการกระชากราคา จำแนกตามระดับเงินอุดหนุน (%)",
    shockProbAxis: "ความน่าจะเป็น (%/เดือน)",
    subsidyAxis: "ระดับเงินอุดหนุน (%)",

    // ── เครื่องมือ B ─────────────────────────────────────────────────────────
    toolBTitle: "เครื่องมือวิเคราะห์เส้นทางการปฏิรูปนโยบาย",
    toolBDesc:
      "เปรียบเทียบแนวทางการปฏิรูปเงินอุดหนุนสามรูปแบบ และประเมินผลกระทบต่อภาระค่าใช้จ่ายของครัวเรือนในแต่ละกลุ่มรายได้",
    currentSubsidy: "ระดับเงินอุดหนุนในปัจจุบัน",
    fastCut: "ยกเลิกเงินอุดหนุนโดยทันที",
    gradual: "ปรับลดแบบค่อยเป็นค่อยไป",
    cashTransfer: "เปลี่ยนรูปแบบเป็นการโอนเงินตรงแก่ประชาชน",
    compositeScore: "คะแนนนโยบายรวม",
    fiscalSavings: "การประหยัดงบประมาณภาครัฐ",
    equityScore: "ดัชนีความเป็นธรรมทางสังคม",
    speedScore: "ดัชนีความรวดเร็วในการดำเนินการ",
    fiscalScore: "ดัชนีประสิทธิภาพการคลัง",
    maxLowShock: "การกระชากราคาสูงสุดในกลุ่มรายได้น้อย",
    transitionMonths: "ระยะเวลาเปลี่ยนผ่าน (เดือน)",
    usdBn: "พันล้านดอลลาร์สหรัฐ",
    timeline: "แนวโน้มความน่าจะเป็นในการกระชากราคา (%)",
    monthAxis: "เดือน",

    // ── Footer ───────────────────────────────────────────────────────────────
    dataSource: "แหล่งข้อมูล: World Bank Global Fuel Prices Database · NESDC (สศช.) · DOEB (กรมธุรกิจพลังงาน)",
    period: "ธันวาคม 2558 – เมษายน 2568",
  },
} as const;

export type TranslationKey = keyof (typeof t)["en"];

export function useTranslations(lang: Lang) {
  return (key: TranslationKey): string => t[lang][key] as string;
}

export { t };
