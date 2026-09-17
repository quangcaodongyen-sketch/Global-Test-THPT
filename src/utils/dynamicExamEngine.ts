/**
 * ENGINE SINH ĐỀ ĐỘNG NGẪU NHIÊN THEO YÊU CẦU (DYNAMIC EXAM GENERATOR THPT)
 * Chuẩn Chương trình GDPT 2018 & Hướng dẫn Đổi mới Khảo thí THPT của Bộ GD&ĐT
 * Tác giả: Thầy giáo Đinh Văn Thành – Tuyên Quang (Hotline/Zalo: 0915.213.717)
 * 
 * Mỗi lần tạo đề:
 * 1. Ưu tiên nạp khuôn mẫu gốc chuẩn 100% từ kho đề THPT trong public/bo_de_chuan/.
 * 2. Tự chèn thông tin Sở GD&ĐT và Trường THPT của giáo viên.
 * 3. Hoán vị phương án A, B, C, D (chuẩn 4 phương án THPT) và sinh 02 mã đề tương đương.
 * 4. Tự động tính lại Bảng đáp án chính xác 100%.
 * 5. Xuất file Word .docx chuẩn A4, Times New Roman 13pt, Bảng Auto-fit.
 */

import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  Packer,
} from 'docx';
import { generateDynamicExamFromExactTemplate } from './exactExamTemplateEngine';

export interface DynamicExamConfig {
  grade: '10' | '11' | '12';
  term: 'GK1' | 'CK1' | 'GK2' | 'CK2';
  parentAgency: string;
  schoolName: string;
  academicYear?: string;
}

const FONT_FAMILY = 'Times New Roman';
const MARGINS = { top: 1134, bottom: 1134, left: 1701, right: 850 }; // Chuẩn NĐ 30/2020

// NGÂN HÀNG CÂU HỎI MỞ RỘNG CHO TỪNG KHỐI LỚP THPT (LỚP 10, 11, 12)
export const QUESTION_BANKS: Record<string, any> = {
  '10': {
    phonetics: [
      { stem: 'Choose the word whose underlined part is pronounced differently: h<u>e</u>lp, br<u>ea</u>d, h<u>ea</u>vy, cl<u>ea</u>n', opts: ['clean', 'help', 'bread', 'heavy'], ans: 'clean' },
      { stem: 'Choose the word whose underlined part is pronounced differently: liv<u>ed</u>, cook<u>ed</u>, play<u>ed</u>, rain<u>ed</u>', opts: ['cooked', 'lived', 'played', 'rained'], ans: 'cooked' },
      { stem: 'Choose the word that differs from the other three in the position of primary stress: carbon, routine, climate, planet', opts: ['routine', 'carbon', 'climate', 'planet'], ans: 'routine' },
      { stem: 'Choose the word that differs from the other three in the position of primary stress: pollutant, organic, instrument, emission', opts: ['instrument', 'pollutant', 'organic', 'emission'], ans: 'instrument' },
    ],
    language: [
      { stem: 'My mother is a homemaker who takes care of the house, while my father is the ________.', opts: ['breadwinner', 'grocer', 'engineer', 'entertainer'], ans: 'breadwinner' },
      { stem: 'Look at those dark clouds! It ________ heavily soon.', opts: ['is going to rain', 'rains', 'rained', 'was raining'], ans: 'is going to rain' },
      { stem: 'Teenagers should be taught to manage their household ________ to be more responsible.', opts: ['chores', 'hobbies', 'parties', 'holidays'], ans: 'chores' },
      { stem: 'The school youth union encouraged all students to adopt a ________ lifestyle.', opts: ['green', 'dark', 'crowded', 'noisy'], ans: 'green' },
      { stem: 'While Lan was reading a book about endangered animals, the phone ________.', opts: ['rang', 'was ringing', 'rings', 'has rung'], ans: 'rang' },
      { stem: 'Modern digital inventions have made online learning much more ________ than before.', opts: ['effective', 'polluted', 'harmful', 'hopeless'], ans: 'effective' },
      { stem: 'Women and men must ________ equal employment opportunities in all career sectors.', opts: ['be given', 'give', 'giving', 'have given'], ans: 'be given' },
      { stem: 'Viet Nam has become an active member of many international ________ like the UN and WTO.', opts: ['organisations', 'appliances', 'laboratories', 'destinations'], ans: 'organisations' },
    ],
    conversations: [
      {
        stem: 'Mark the letter A, B, C, or D to indicate the best arrangement of utterances to make a meaningful exchange:\na. Tom: Have you decided what to perform in the school music contest?\nb. Tom: Great idea! Acoustic pop is very inspiring.\nc. Mary: I think I will sing a pop song with my acoustic guitar.',
        opts: ['a - c - b', 'b - a - c', 'c - a - b', 'a - b - c'],
        ans: 'a - c - b',
      },
      {
        stem: 'Mark the letter A, B, C, or D to indicate the best arrangement of sentences to make a meaningful paragraph:\na. Firstly, doing household chores teaches teenagers basic life skills.\nb. In conclusion, sharing family duties helps build stronger family bonds.\nc. Secondly, it reduces the burden on parents after a long working day.',
        opts: ['a - c - b', 'b - a - c', 'c - a - b', 'a - b - c'],
        ans: 'a - c - b',
      },
    ],
    clozeText: 'Family life plays a central role in human happiness. When family members share household (1) ________, everyone feels valued and respected. Studies show that children who help their parents with daily chores develop higher self-esteem and better academic (2) ________. Furthermore, participating in green activities such as turning off unnecessary appliances and recycling plastics (3) ________ the whole family together in protecting our planet. Building strong family bonds (4) ________ mutual understanding, patience and love across generations.',
    clozeOpts: [
      { num: '1', opts: ['chores', 'appliances', 'vehicles', 'instruments'], ans: 'chores' },
      { num: '2', opts: ['performance', 'pollution', 'congestion', 'destruction'], ans: 'performance' },
      { num: '3', opts: ['brings', 'takes', 'leads', 'sends'], ans: 'brings' },
      { num: '4', opts: ['requires', 'avoids', 'denies', 'forbids'], ans: 'requires' },
    ],
    readingComp: {
      text: 'Ecotourism is a form of tourism involving responsible travel to natural areas, conserving the environment, and improving the well-being of the local people. Its purpose may be to educate the traveler, to provide funds for ecological conservation, or to directly benefit the economic development of local communities. In Viet Nam, places like Phong Nha - Ke Bang, Cat Ba National Park, and Can Gio Mangrove Forest are top destinations for eco-travelers. Visitors are encouraged to walk or bicycle instead of taking motor vehicles, to avoid littering, and to buy handmade souvenirs made by ethnic minority artisans. By choosing ecotourism, travelers not only gain unforgettable life experiences but also actively support biological diversity preservation.',
      questions: [
        { q: 'What is the main goal of ecotourism according to the passage?', opts: ['To promote responsible travel and conservation', 'To build luxury commercial hotels', 'To test modern high-speed vehicles', 'To clear wild forests for farms'], ans: 'To promote responsible travel and conservation' },
        { q: 'Which of the following is mentioned as an ecotourism site in Viet Nam?', opts: ['Cat Ba National Park', 'Central Shopping Mall', 'Noi Bai Airport', 'Industrial Zone'], ans: 'Cat Ba National Park' },
        { q: 'How are visitors encouraged to travel in eco-friendly destinations?', opts: ['By walking or cycling', 'By hiring private helicopters', 'By driving heavy diesel trucks', 'By riding racing motorbikes'], ans: 'By walking or cycling' },
        { q: 'The word "funds" in paragraph 1 is closest in meaning to:', opts: ['financial support', 'heavy machines', 'wild animals', 'tourist guides'], ans: 'financial support' },
      ],
    },
    transformations: [
      { original: 'They began using renewable solar energy three years ago.', key: 'They have used renewable solar energy for three years.' },
      { original: 'Because Nam was tired, he could not finish the presentation.', key: 'Nam was tired, so he could not finish the presentation.' },
      { original: 'People should plant more green trees along city streets.', key: 'More green trees should be planted along city streets.' },
    ],
    writingTopic: 'Write an opinion paragraph (120 - 150 words) about how high school students can contribute to reducing their ecological carbon footprint.',
  },

  '11': {
    phonetics: [
      { stem: 'Choose the word whose underlined part is pronounced differently: infect<u>ed</u>, want<u>ed</u>, decid<u>ed</u>, play<u>ed</u>', opts: ['played', 'infected', 'wanted', 'decided'], ans: 'played' },
      { stem: 'Choose the word whose underlined part is pronounced differently: v<u>i</u>ral, nutr<u>i</u>ent, l<u>i</u>festyle, f<u>i</u>tness', opts: ['fitness', 'viral', 'nutrient', 'lifestyle'], ans: 'fitness' },
      { stem: 'Choose the word that differs from the other three in the position of primary stress: longevity, preservative, generation, infrastructure', opts: ['longevity', 'generation', 'infrastructure', 'preservative'], ans: 'generation' },
      { stem: 'Choose the word that differs from the other three in the position of primary stress: urban, balance, sensor, mature', opts: ['mature', 'urban', 'balance', 'sensor'], ans: 'mature' },
    ],
    language: [
      { stem: 'Regular exercise and a balanced diet boost your ________ system against seasonal diseases.', opts: ['immune', 'digestive', 'nervous', 'respiratory'], ans: 'immune' },
      { stem: 'Parents and children sometimes experience misunderstandings due to the generation ________.', opts: ['gap', 'space', 'border', 'distance'], ans: 'gap' },
      { stem: 'Smart cities of the future will utilize AI sensors to monitor air ________ in real time.', opts: ['quality', 'flavor', 'appetite', 'ingredient'], ans: 'quality' },
      { stem: 'You ________ drive after drinking alcohol; it is strictly prohibited by law.', opts: ['mustn’t', 'shouldn’t', 'needn’t', 'ought not to'], ans: 'mustn’t' },
      { stem: '________ the cultural heritage site required dedicated efforts from local artisans.', opts: ['Preserving', 'Preserve', 'Preserved', 'To preserve being'], ans: 'Preserving' },
      { stem: 'Having completed their vocational training, the students felt confident entering the ________.', opts: ['workforce', 'playground', 'kindergarten', 'exhibition'], ans: 'workforce' },
      { stem: 'It was Lan ________ suggested the green initiative to clean the village canal.', opts: ['who', 'which', 'whom', 'whose'], ans: 'who' },
      { stem: 'Global warming leads to severe droughts and rising sea ________ worldwide.', opts: ['levels', 'depths', 'lengths', 'widths'], ans: 'levels' },
    ],
    conversations: [
      {
        stem: 'Mark the letter A, B, C, or D to indicate the best arrangement of utterances to make a meaningful conversation:\na. Doctor: You should drink at least two liters of water daily and take brisk walks.\nb. Patient: Good morning doctor. I often feel fatigued in the afternoons.\nc. Patient: Thank you, I will follow your advice starting today.',
        opts: ['b - a - c', 'a - b - c', 'c - a - b', 'b - c - a'],
        ans: 'b - a - c',
      },
      {
        stem: 'Mark the letter A, B, C, or D to indicate the best arrangement of sentences to make an exchange:\na. Nam: Are you planning to apply for university or vocational college?\nb. Nam: Vocational training is a great practical choice for rapid employment.\nc. Mai: I have decided to study culinary arts at a vocational school.',
        opts: ['a - c - b', 'b - a - c', 'c - b - a', 'a - b - c'],
        ans: 'a - c - b',
      },
    ],
    clozeText: 'A long and healthy life is what many people strive to achieve. Modern medical research confirms that physical fitness, wholesome nutrition, and emotional wellness (1) ________ together to build strong immunity. Cutting down on fast food rich in saturated fats and refined sugars can (2) ________ prevent chronic conditions like diabetes. Additionally, engaging in thirty minutes of moderate aerobic exercise every day stimulates cardiovascular (3) ________. Finally, getting adequate sleep enables the brain to recover and strengthens memory retention, ensuring overall vitality for (4) ________ longevity.',
    clozeOpts: [
      { num: '1', opts: ['work', 'take', 'make', 'give'], ans: 'work' },
      { num: '2', opts: ['significantly', 'rarely', 'badly', 'dangerously'], ans: 'significantly' },
      { num: '3', opts: ['health', 'pollution', 'exhaustion', 'injury'], ans: 'health' },
      { num: '4', opts: ['optimum', 'minimum', 'useless', 'harmful'], ans: 'optimum' },
    ],
    readingComp: {
      text: 'Cities of the future are envisioned as high-tech ecosystems designed to maximize sustainability and quality of life. Urban planners are integrating Internet of Things (IoT) technologies into infrastructure, allowing municipal systems to adapt automatically to environmental conditions. For instance, intelligent streetlights dim when streets are empty and brighten as pedestrians approach, saving millions of kilowatt-hours of electrical energy. Furthermore, rooftop vertical gardens and green public parks help absorb carbon emissions, mitigate urban heat island effects, and supply residents with organic vegetables. Automated zero-emission electric buses will eliminate smog, transforming once-polluted metropolitan centers into pleasant, breathable habitats.',
      questions: [
        { q: 'What is the primary theme of the reading passage?', opts: ['The vision and technology behind future smart sustainable cities', 'The history of traditional public transport systems', 'How to cook organic vegetables on modern rooftops', 'The financial cost of installing urban streetlights'], ans: 'The vision and technology behind future smart sustainable cities' },
        { q: 'How do intelligent streetlights save energy in smart cities?', opts: ['By dimming automatically when no one is around', 'By remaining turned off throughout the whole night', 'By using candles instead of electricity', 'By flashing continuously to alert drivers'], ans: 'By dimming automatically when no one is around' },
        { q: 'According to the text, what is one benefit of rooftop vertical gardens?', opts: ['Absorbing carbon emissions and cooling urban heat', 'Attracting wild predators to the city', 'Replacing all local grocery stores', 'Increasing the weight of city buildings'], ans: 'Absorbing carbon emissions and cooling urban heat' },
        { q: 'The word "mitigate" in paragraph 2 is closest in meaning to:', opts: ['alleviate or reduce', 'increase or multiply', 'destroy or ruin', 'neglect or ignore'], ans: 'alleviate or reduce' },
      ],
    },
    transformations: [
      { original: 'Although he was injured, he managed to cross the finish line.', key: 'Despite being injured, he managed to cross the finish line.' },
      { original: 'The generation gap causes conflicts between parents and children.', key: 'Conflicts between parents and children are caused by the generation gap.' },
      { original: 'You ought to consult a doctor before starting this strict workout regime.', key: 'You should consult a doctor before starting this strict workout regime.' },
    ],
    writingTopic: 'Write an essay paragraph (150 - 180 words) discussing the benefits and challenges of smart cities of the future.',
  },

  '12': {
    phonetics: [
      { stem: 'Choose the word whose underlined part is pronounced differently: inspir<u>ed</u>, admir<u>ed</u>, devot<u>ed</u>, achiev<u>ed</u>', opts: ['devoted', 'inspired', 'admired', 'achieved'], ans: 'devoted' },
      { stem: 'Choose the word whose underlined part is pronounced differently: c<u>u</u>lture, m<u>u</u>lticultural, s<u>u</u>stainable, ass<u>i</u>milation', opts: ['assimilation', 'culture', 'multicultural', 'sustainable'], ans: 'assimilation' },
      { stem: 'Choose the word that differs from the other three in the position of primary stress: artificial, humanitarian, biological, urbanisation', opts: ['urbanisation', 'artificial', 'humanitarian', 'biological'], ans: 'urbanisation' },
      { stem: 'Choose the word that differs from the other three in the position of primary stress: career, pursue, lifelong, mature', opts: ['lifelong', 'career', 'pursue', 'mature'], ans: 'lifelong' },
    ],
    language: [
      { stem: 'President Ho Chi Minh devoted his entire life to the ________ of national liberation and independence.', opts: ['cause', 'profit', 'leisure', 'curfew'], ans: 'cause' },
      { stem: 'David Beckham was particularly famous for his exceptional ability to score goals from ________ kicks.', opts: ['free', 'open', 'loose', 'wide'], ans: 'free' },
      { stem: 'By the time the international summit concluded, delegates ________ a consensus on emissions targets.', opts: ['had reached', 'reached', 'reach', 'have reached'], ans: 'had reached' },
      { stem: 'Artificial intelligence is anticipated to revolutionize healthcare by diagnosing ailments with high ________.', opts: ['accuracy', 'hazard', 'slum', 'congestion'], ans: 'accuracy' },
      { stem: 'Had they enacted stricter anti-poaching legislations earlier, those rare rhinos ________ extinct.', opts: ['would not have become', 'will not become', 'are not becoming', 'have not become'], ans: 'would not have become' },
      { stem: 'Rapid urbanisation without adequate planning often gives rise to substandard housing and urban ________.', opts: ['slums', 'resorts', 'sanctuaries', 'reservoirs'], ans: 'slums' },
      { stem: 'The interview board appreciated his impressive credentials and excellent communication ________.', opts: ['skills', 'tools', 'gears', 'weapons'], ans: 'skills' },
      { stem: 'Only by committing to ________ learning can professionals remain competitive in an AI-driven economy.', opts: ['lifelong', 'temporary', 'ancient', 'fragile'], ans: 'lifelong' },
    ],
    conversations: [
      {
        stem: 'Mark the letter A, B, C, or D to indicate the best arrangement of utterances to make a meaningful exchange:\na. Interviewer: Welcome! Could you tell us about your experience in software engineering?\nb. Candidate: Certainly. I have spent three years developing automated web platforms.\nc. Interviewer: Impressive! That aligns directly with our enterprise development roadmap.',
        opts: ['a - b - c', 'b - a - c', 'c - a - b', 'a - c - b'],
        ans: 'a - b - c',
      },
      {
        stem: 'Mark the letter A, B, C, or D to indicate the best arrangement of sentences:\na. Furthermore, AI tools can streamline mundane administrative workflows.\nb. However, human empathy and ethical judgment remain irreplaceable.\nc. First, artificial intelligence accelerates data analysis exponentially.',
        opts: ['c - a - b', 'a - b - c', 'b - c - a', 'c - b - a'],
        ans: 'c - a - b',
      },
    ],
    clozeText: 'Artificial Intelligence (AI) has emerged as one of the defining technologies of the 21st century. Across diverse sectors, from genomic medicine to algorithmic finance, machine learning models analyze petabytes of information with breathtaking (1) ________. In the educational sphere, adaptive algorithms personalize learning trajectories, identifying gaps in student understanding and suggesting targeted (2) ________. Nonetheless, the widespread adoption of automated systems also brings profound ethical dilemmas, notably data privacy vulnerabilities and potential algorithmic (3) ________. Navigating this technological revolution requires a collaborative approach between software innovators and policy (4) ________.',
    clozeOpts: [
      { num: '1', opts: ['precision', 'pollution', 'ignorance', 'hesitation'], ans: 'precision' },
      { num: '2', opts: ['remedies', 'penalties', 'disasters', 'protests'], ans: 'remedies' },
      { num: '3', opts: ['bias', 'kindness', 'charity', 'purity'], ans: 'bias' },
      { num: '4', opts: ['makers', 'destroyers', 'deniers', 'refugees'], ans: 'makers' },
    ],
    readingComp: {
      text: 'Life stories of remarkable humanitarians remind us of the immense potential of the individual spirit to effect positive global transformation. Figures such as Mother Teresa, Nelson Mandela, and Dr. Alexandre Yersin transcended personal comfort to serve disadvantaged communities. Dr. Yersin, for example, spent decades in Nha Trang researching infectious tropical diseases, discovering the plague bacillus, and pioneering rubber cultivation in Viet Nam. His modest, self-effacing lifestyle won the profound veneration of generations of Vietnamese citizens. Contemporary students draw immense inspiration from such historical role models, realizing that genuine triumph in life is measured not merely by personal wealth, but by one\'s enduring legacy of compassion and service to humanity.',
      questions: [
        { q: 'What is the primary message conveyed by the reading passage?', opts: ['True triumph in life is measured by dedication to humanitarian service', 'Accumulating material fortune is the sole measure of success', 'Scientists must avoid interacting with rural residents', 'Medical discoveries are only possible in European laboratories'], ans: 'True triumph in life is measured by dedication to humanitarian service' },
        { q: 'According to the text, what did Dr. Alexandre Yersin discover?', opts: ['The plague bacillus', 'High-speed internet algorithms', 'Solar powered engines', 'Digital camera sensors'], ans: 'The plague bacillus' },
        { q: 'Where did Dr. Yersin spend decades conducting scientific research?', opts: ['Nha Trang, Viet Nam', 'London, England', 'Tokyo, Japan', 'Berlin, Germany'], ans: 'Nha Trang, Viet Nam' },
        { q: 'The word "veneration" in paragraph 2 is closest in meaning to:', opts: ['deep respect and admiration', 'jealousy and resentment', 'indifference and neglect', 'fear and terror'], ans: 'deep respect and admiration' },
      ],
    },
    transformations: [
      { original: 'If governments do not ban wildlife trade, endangered animals will disappear.', key: 'Unless governments ban wildlife trade, endangered animals will disappear.' },
      { original: 'People report that artificial intelligence creates novel career opportunities.', key: 'Artificial intelligence is reported to create novel career opportunities.' },
      { original: 'He had never witnessed such a breathtaking natural landscape before.', key: 'Never before had he witnessed such a breathtaking natural landscape.' },
    ],
    writingTopic: 'Write an essay paragraph (150 - 180 words) giving your opinion on how Artificial Intelligence will impact future employment opportunities for high school graduates.',
  },
};

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createP(text: string, bold = false, italic = false, align = AlignmentType.LEFT, size = 26): Paragraph {
  return new Paragraph({
    alignment: align,
    spacing: { before: 80, after: 80 },
    children: [
      new TextRun({
        text,
        bold,
        italics: italic,
        font: FONT_FAMILY,
        size,
      }),
    ],
  });
}

function createCell(text: string, bold = false, align = AlignmentType.CENTER, widthPercent = 20, fill?: string): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: fill ? { fill } : undefined,
    children: [
      new Paragraph({
        alignment: align,
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text,
            bold,
            font: FONT_FAMILY,
            size: 22,
          }),
        ],
      }),
    ],
  });
}

/**
 * Sinh đề thi động ngẫu nhiên THPT
 */
export async function generateDynamicExamDocx(cfg: DynamicExamConfig): Promise<{
  blob: Blob;
  fileName: string;
  code1: string;
  code2: string;
}> {
  const grade = cfg.grade || '10';
  const term = cfg.term || 'GK1';
  const parentAgency = (cfg.parentAgency || 'SỞ GD&ĐT TUYÊN QUANG').toUpperCase();
  const rawSchool = (cfg.schoolName || 'THPT Đồng Yên').trim();
  const schoolName = rawSchool.toUpperCase().startsWith('TRƯỜNG')
    ? rawSchool.toUpperCase()
    : `TRƯỜNG ${rawSchool.toUpperCase()}`;
  const academicYear = cfg.academicYear || '2025 - 2026';

  // ƯU TIÊN SỐ 1: Nạp khuôn mẫu gốc chuẩn 100% từ kho đề THPT trong public/bo_de_chuan/
  try {
    const exactResult = await generateDynamicExamFromExactTemplate({
      grade,
      term,
      parentAgency,
      schoolName,
    });
    return exactResult;
  } catch (templateErr) {
    console.warn('Không thể nạp đề từ template gốc, fallback sang engine docx nội tại:', templateErr);
  }

  const bank = QUESTION_BANKS[grade] || QUESTION_BANKS['10'];
  const gradeDigit = grade === '10' ? '1' : grade === '11' ? '2' : '3';
  const baseNum = Number(gradeDigit) * 100 + (Math.floor(Math.random() * 40) * 2 + 1);
  const code1 = String(baseNum).padStart(3, '0');
  const code2 = String(baseNum + 1).padStart(3, '0');

  const termNames: Record<string, string> = {
    GK1: 'GIỮA HỌC KỲ I',
    CK1: 'CUỐI HỌC KỲ I',
    GK2: 'GIỮA HỌC KỲ II',
    CK2: 'CUỐI HỌC KỲ II',
  };
  const termTitle = termNames[term] || 'ĐỊNH KỲ';

  // Trộn câu hỏi MCQ 4 phương án
  const phoneticsShuffled = shuffleArray(bank.phonetics).slice(0, 4);
  const languageShuffled = shuffleArray(bank.language).slice(0, 8);
  const convShuffled = shuffleArray(bank.conversations || []).slice(0, 2);
  const mcqPool = [...phoneticsShuffled, ...languageShuffled, ...convShuffled];

  // Mã đề 1
  const code1Questions: Array<{ qNum: number; prompt: string; options: string[]; answerLetter: string }> = [];
  mcqPool.forEach((item, idx) => {
    const shuffledOpts = shuffleArray(item.opts);
    const correctIdx = shuffledOpts.indexOf(item.ans);
    const letter = String.fromCharCode(65 + correctIdx);
    code1Questions.push({
      qNum: idx + 1,
      prompt: item.stem,
      options: shuffledOpts,
      answerLetter: letter,
    });
  });

  // Mã đề 2
  const code2Pool = shuffleArray(mcqPool);
  const code2Questions: Array<{ qNum: number; prompt: string; options: string[]; answerLetter: string }> = [];
  code2Pool.forEach((item, idx) => {
    const shuffledOpts = shuffleArray(item.opts);
    const correctIdx = shuffledOpts.indexOf(item.ans);
    const letter = String.fromCharCode(65 + correctIdx);
    code2Questions.push({
      qNum: idx + 1,
      prompt: item.stem,
      options: shuffledOpts,
      answerLetter: letter,
    });
  });

  const trans = shuffleArray(bank.transformations).slice(0, 3);

  // Xây dựng văn bản Word hoàn chỉnh
  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: MARGINS } },
        children: [
          // Header 2 cột
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    children: [
                      createP(parentAgency, true, false, AlignmentType.CENTER, 22),
                      createP(schoolName, true, false, AlignmentType.CENTER, 22),
                      createP('(Đề kiểm tra có 04 trang)', false, true, AlignmentType.CENTER, 20),
                    ],
                  }),
                  new TableCell({
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    children: [
                      createP(`ĐỀ KIỂM TRA ${termTitle} NĂM HỌC ${academicYear}`, true, false, AlignmentType.CENTER, 22),
                      createP(`Môn: Tiếng Anh ${grade} (Global Success)`, true, false, AlignmentType.CENTER, 22),
                      createP(`Thời gian: 60 phút (không kể thời gian giao đề)`, false, true, AlignmentType.CENTER, 20),
                      createP(`Mã đề: ${code1}`, true, false, AlignmentType.CENTER, 22),
                    ],
                  }),
                ],
              }),
            ],
          }),

          createP('Họ và tên thí sinh: ................................................................ SBD: ...................... Phòng thi: .................', false, false, AlignmentType.LEFT, 22),
          createP('------------------------------------------------------------------------------------------------------------------', false, false, AlignmentType.CENTER, 18),

          // Phần Language Focus & Phonetics
          createP('I. PHONETICS & LEXICO-GRAMMAR (4.0 points)', true, false, AlignmentType.LEFT, 24),
          createP('Mark the letter A, B, C, or D on your answer sheet to indicate the best answer to each of the following questions.', false, true, AlignmentType.LEFT, 22),
          ...code1Questions.flatMap((q) => [
            createP(`Question ${q.qNum}. ${q.prompt}`, false, false, AlignmentType.LEFT, 22),
            createP(
              q.options.map((opt, oIdx) => `${String.fromCharCode(65 + oIdx)}. ${opt}`).join('     '),
              false,
              false,
              AlignmentType.LEFT,
              22
            ),
          ]),

          // Phần Reading
          createP('II. READING COMPREHENSION (3.0 points)', true, false, AlignmentType.LEFT, 24),
          createP('Read the following passage and choose the best answer A, B, C, or D for each question.', false, true, AlignmentType.LEFT, 22),
          createP(bank.readingComp.text, false, false, AlignmentType.JUSTIFIED, 22),
          ...bank.readingComp.questions.flatMap((item: any, idx: number) => [
            createP(`Question ${code1Questions.length + idx + 1}. ${item.q}`, true, false, AlignmentType.LEFT, 22),
            createP(
              item.opts.map((opt: string, oIdx: number) => `${String.fromCharCode(65 + oIdx)}. ${opt}`).join('     '),
              false,
              false,
              AlignmentType.LEFT,
              22
            ),
          ]),

          // Phần Writing
          createP('III. WRITING (3.0 points)', true, false, AlignmentType.LEFT, 24),
          createP('Rewrite the following sentences so that the meaning stays the same as the original.', false, true, AlignmentType.LEFT, 22),
          ...trans.map((t: any, idx: number) =>
            createP(`Question ${code1Questions.length + bank.readingComp.questions.length + idx + 1}. ${t.original}\n-> .........................................................................................................................`, false, false, AlignmentType.LEFT, 22)
          ),

          createP(`Topic: ${bank.writingTopic}`, true, false, AlignmentType.LEFT, 22),
          createP('....................................................................................................................................................................', false, false, AlignmentType.LEFT, 22),
          createP('....................................................................................................................................................................', false, false, AlignmentType.LEFT, 22),
          createP('....................................................................................................................................................................', false, false, AlignmentType.LEFT, 22),

          // BẢNG ĐÁP ÁN SONG SONG
          createP('BẢNG ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM (MÃ ĐỀ ' + code1 + ' & ' + code2 + ')', true, false, AlignmentType.CENTER, 26),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Câu', true, AlignmentType.CENTER, 20, 'E2E8F0'),
                  createCell(`Mã đề ${code1}`, true, AlignmentType.CENTER, 40, 'E2E8F0'),
                  createCell(`Mã đề ${code2}`, true, AlignmentType.CENTER, 40, 'E2E8F0'),
                ],
              }),
              ...code1Questions.map((q, idx) =>
                new TableRow({
                  children: [
                    createCell(String(idx + 1), false, AlignmentType.CENTER, 20),
                    createCell(q.answerLetter, true, AlignmentType.CENTER, 40),
                    createCell(code2Questions[idx]?.answerLetter || 'A', true, AlignmentType.CENTER, 40),
                  ],
                })
              ),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const outFileName = `${term} - Tiếng Anh ${grade} THPT (Mã ${code1}-${code2}).docx`;

  return { blob, fileName: outFileName, code1, code2 };
}
