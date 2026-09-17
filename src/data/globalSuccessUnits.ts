import { Grade, UnitInfo, ExamType, AdminInfo } from '../types';

export const GLOBAL_SUCCESS_UNITS: Record<Grade, UnitInfo[]> = {
  'Lớp 10': [
    {
      id: 'g10-u1',
      unitNumber: 1,
      title: 'Unit 1: Family Life',
      topic: 'Family life, household chores and family values',
      grammar: ['Present Simple vs Present Continuous'],
      vocabulary: ['household chores', 'family duties', 'family values', 'breadcrumbs', 'homemaker', 'breadwinner']
    },
    {
      id: 'g10-u2',
      unitNumber: 2,
      title: 'Unit 2: Humans and the Environment',
      topic: 'Human activities, ecological footprint, green living & protecting environment',
      grammar: ['Future with will and be going to', 'Passive voice in present & future'],
      vocabulary: ['carbon footprint', 'eco-friendly', 'renewable energy', 'emission', 'greenhouse effect']
    },
    {
      id: 'g10-u3',
      unitNumber: 3,
      title: 'Unit 3: Music',
      topic: 'Music styles, famous singers, traditional instruments and musical shows',
      grammar: ['To-infinitives and bare infinitives', 'Compound sentences with conjunctions (and, but, so, or)'],
      vocabulary: ['musical instruments', 'talented', 'audience', 'live performance', 'idol', 'composer']
    },
    {
      id: 'g10-u4',
      unitNumber: 4,
      title: 'Unit 4: For a Better Community',
      topic: 'Community services, volunteer work and helping disadvantaged people',
      grammar: ['Past Simple vs Past Continuous with when/while'],
      vocabulary: ['volunteer', 'community service', 'donate', 'charity', 'disadvantaged children', 'non-profit']
    },
    {
      id: 'g10-u5',
      unitNumber: 5,
      title: 'Unit 5: Inventions',
      topic: 'Modern inventions, digital tools, artificial intelligence and technologies',
      grammar: ['Present Perfect', 'Gerunds and Infinitives for purposes'],
      vocabulary: ['invention', 'portable', 'artificial intelligence', 'robotics', 'smart device', 'breakthrough']
    },
    {
      id: 'g10-u6',
      unitNumber: 6,
      title: 'Unit 6: Gender Equality',
      topic: 'Equal opportunities in career, education, rights and eliminating gender bias',
      grammar: ['Passive voice with modal verbs (can, must, should, may)'],
      vocabulary: ['gender equality', 'discrimination', 'career opportunity', 'wage gap', 'fairness', 'equal rights']
    },
    {
      id: 'g10-u7',
      unitNumber: 7,
      title: 'Unit 7: Viet Nam and International Organisations',
      topic: 'Viet Nam integration with UN, UNICEF, WTO, ASEAN and international relations',
      grammar: ['Comparative and Superlative adjectives'],
      vocabulary: ['international organisation', 'peacekeeping', 'cooperation', 'economic growth', 'promote', 'member']
    },
    {
      id: 'g10-u8',
      unitNumber: 8,
      title: 'Unit 8: New Ways to Learn',
      topic: 'Online learning, digital textbooks, mobile apps, blended learning',
      grammar: ['Relative clauses with who, which, that'],
      vocabulary: ['blended learning', 'digital device', 'online courses', 'educational software', 'interactive']
    },
    {
      id: 'g10-u9',
      unitNumber: 9,
      title: 'Unit 9: Protecting the Environment',
      topic: 'Habitat loss, endangered species, global warming, conservation',
      grammar: ['Reported speech with statements and questions'],
      vocabulary: ['endangered animals', 'habitat destruction', 'conservationist', 'biodiversity', 'poaching']
    },
    {
      id: 'g10-u10',
      unitNumber: 10,
      title: 'Unit 10: Ecotourism',
      topic: 'Responsible travel, conserving nature, sustainable tourism and local culture',
      grammar: ['Conditional sentences type 1 and type 2'],
      vocabulary: ['ecotourism', 'sustainable travel', 'eco-friendly tour', 'local culture', 'natural habitat']
    }
  ],

  'Lớp 11': [
    {
      id: 'g11-u1',
      unitNumber: 1,
      title: 'Unit 1: A Long and Healthy Life',
      topic: 'Diet, physical fitness, healthcare, longevity and immune system',
      grammar: ['Past Simple vs Present Perfect'],
      vocabulary: ['longevity', 'immune system', 'nutrient', 'workout', 'dietary habits', 'fitness routine']
    },
    {
      id: 'g11-u2',
      unitNumber: 2,
      title: 'Unit 2: The Generation Gap',
      topic: 'Parent-child conflicts, different viewpoints, cultural values and family rules',
      grammar: ['Modal verbs: must, have to, should, ought to'],
      vocabulary: ['generation gap', 'curfew', 'lifestyle differences', 'open-minded', 'table manners', 'conflict']
    },
    {
      id: 'g11-u3',
      unitNumber: 3,
      title: 'Unit 3: Cities of the Future',
      topic: 'Smart cities, renewable infrastructure, urban sensor networks and green living',
      grammar: ['Stative verbs in continuous form', 'Linking verbs + adjectives'],
      vocabulary: ['smart city', 'sustainable architecture', 'high-speed train', 'sensor', 'infrastructure', 'livable']
    },
    {
      id: 'g11-u4',
      unitNumber: 4,
      title: 'Unit 4: ASEAN and Viet Nam',
      topic: 'ASEAN community, cultural exchange, regional cooperation and youth charter',
      grammar: ['Gerunds as subjects and objects'],
      vocabulary: ['cultural diversity', 'diplomacy', 'scholarship', 'solidarity', 'summit', 'regional partner']
    },
    {
      id: 'g11-u5',
      unitNumber: 5,
      title: 'Unit 5: Global Warming',
      topic: 'Climate change, melting ice caps, carbon dioxide emissions and extreme weather',
      grammar: ['Present participle and past participle clauses'],
      vocabulary: ['global warming', 'deforestation', 'fossil fuels', 'greenhouse gases', 'rising sea levels']
    },
    {
      id: 'g11-u6',
      unitNumber: 6,
      title: 'Unit 6: Preserving Our Heritage',
      topic: 'Historical monuments, folk music, intangible culture and heritage preservation',
      grammar: ['To-infinitive clauses'],
      vocabulary: ['tangible heritage', 'intangible heritage', 'preservation', 'historical relic', 'folk singing']
    },
    {
      id: 'g11-u7',
      unitNumber: 7,
      title: 'Unit 7: Education Options for School-Leavers',
      topic: 'Higher education, vocational schools, apprenticeships and career orientation',
      grammar: ['Perfect gerunds and perfect participles'],
      vocabulary: ['higher education', 'vocational training', 'apprenticeship', 'school-leaver', 'qualification']
    },
    {
      id: 'g11-u8',
      unitNumber: 8,
      title: 'Unit 8: Becoming Independent',
      topic: 'Self-reliance, time management, emotional resilience and problem-solving skills',
      grammar: ['Cleft sentences with It is / was... that'],
      vocabulary: ['independence', 'self-motivation', 'time management', 'coping skills', 'decision making']
    },
    {
      id: 'g11-u9',
      unitNumber: 9,
      title: 'Unit 9: Social Issues',
      topic: 'Bullying, poverty, peer pressure, cybercrime and social equality',
      grammar: ['Linking words and phrases of cause and effect / contrast'],
      vocabulary: ['peer pressure', 'cyberbullying', 'social inequality', 'substance abuse', 'awareness campaign']
    },
    {
      id: 'g11-u10',
      unitNumber: 10,
      title: 'Unit 10: The Ecosystem',
      topic: 'Ecosystem conservation, national parks, flora and fauna preservation',
      grammar: ['Compound nouns and noun phrases'],
      vocabulary: ['ecosystem', 'biodiversity hotspot', 'food chain', 'flora and fauna', 'ecological balance']
    }
  ],

  'Lớp 12': [
    {
      id: 'g12-u1',
      unitNumber: 1,
      title: 'Unit 1: Life Stories We Admire',
      topic: 'Inspiring figures, historical biographies, national heroes and humanitarian deeds',
      grammar: ['Past Simple vs Past Continuous and Past Perfect'],
      vocabulary: ['inspirational', 'biography', 'humanitarian', 'devote', 'perseverance', 'legacy']
    },
    {
      id: 'g12-u2',
      unitNumber: 2,
      title: 'Unit 2: A Multicultural World',
      topic: 'Global cultures, festivals, cuisine, assimilation and cultural identity',
      grammar: ['Articles: a, an, the, and zero article'],
      vocabulary: ['multiculturalism', 'cultural identity', 'customs', 'assimilation', 'taboo', 'global citizen']
    },
    {
      id: 'g12-u3',
      unitNumber: 3,
      title: 'Unit 3: Green Living',
      topic: 'Zero waste, sustainable consumption, recycling habits and renewable tech',
      grammar: ['Adverbial clauses of concession, result and reason'],
      vocabulary: ['zero waste', 'organic farming', 'biodegradable', 'energy conservation', 'carbon neutral']
    },
    {
      id: 'g12-u4',
      unitNumber: 4,
      title: 'Unit 4: Urbanisation',
      topic: 'Rural-to-urban migration, mega-cities, living standards and urban challenges',
      grammar: ['Subjunctive mood (demand, suggest, advise) and compound adjectives'],
      vocabulary: ['urbanisation', 'rural migration', 'slum', 'congestion', 'employment opportunity', 'overcrowded']
    },
    {
      id: 'g12-u5',
      unitNumber: 5,
      title: 'Unit 5: The World of Work',
      topic: 'Modern job market, CV preparation, interviews, soft skills and professional ethics',
      grammar: ['Dependent prepositions and Phrasal verbs in professional context'],
      vocabulary: ['curriculum vitae', 'interviewer', 'job requirement', 'professionalism', 'career advancement']
    },
    {
      id: 'g12-u6',
      unitNumber: 6,
      title: 'Unit 6: Artificial Intelligence',
      topic: 'AI applications, automated driving, machine learning and ethical implications',
      grammar: ['Passive voice with reporting verbs (It is reported that...)'],
      vocabulary: ['artificial intelligence', 'machine learning', 'automation', 'algorithm', 'neural network']
    },
    {
      id: 'g12-u7',
      unitNumber: 7,
      title: 'Unit 7: The World of Mass Media',
      topic: 'Digital media, news literacy, fake news, journalism and social media trends',
      grammar: ['Participle clauses (Present and Past participles)'],
      vocabulary: ['mass media', 'digital journalism', 'fake news', 'sensationalism', 'broadcasting', 'influence']
    },
    {
      id: 'g12-u8',
      unitNumber: 8,
      title: 'Unit 8: Wildlife Conservation',
      topic: 'Poaching prevention, wildlife rescue centers, endangered red-list animals',
      grammar: ['Mixed conditionals and alternatives to If (Unless, Provided that, As long as)'],
      vocabulary: ['poaching', 'extinction', 'wildlife sanctuary', 'endangered species', 'biodiversity']
    },
    {
      id: 'g12-u9',
      unitNumber: 9,
      title: 'Unit 9: Career Paths',
      topic: 'Future workforce trends, lifelong training, entrepreneurship and career mapping',
      grammar: ['Phrasal verbs with multiple particles and Prepositional phrases'],
      vocabulary: ['entrepreneurship', 'career roadmap', 'self-employed', 'corporate culture', 'freelancer']
    },
    {
      id: 'g12-u10',
      unitNumber: 10,
      title: 'Unit 10: Lifelong Learning',
      topic: 'Continuous self-development, upskilling, online degrees and learning agility',
      grammar: ['Inversion with negative adverbs (Never, Seldom, Rarely, Only when)'],
      vocabulary: ['lifelong learning', 'upskilling', 'self-directed', 'knowledge acquisition', 'adaptability']
    }
  ]
};

export const DEFAULT_ADMIN_INFO: Record<Grade, AdminInfo> = {
  'Lớp 10': {
    schoolName: 'THPT Đồng Yên',
    className: 'Lớp 10A1',
    academicYear: '2025-2026',
    teacherName: 'Thầy giáo Đinh Văn Thành',
    durationMinutes: 60,
    examDate: new Date().toLocaleDateString('vi-VN')
  },
  'Lớp 11': {
    schoolName: 'THPT Đồng Yên',
    className: 'Lớp 11A1',
    academicYear: '2025-2026',
    teacherName: 'Thầy giáo Đinh Văn Thành',
    durationMinutes: 60,
    examDate: new Date().toLocaleDateString('vi-VN')
  },
  'Lớp 12': {
    schoolName: 'THPT Đồng Yên',
    className: 'Lớp 12A1',
    academicYear: '2025-2026',
    teacherName: 'Thầy giáo Đinh Văn Thành',
    durationMinutes: 60,
    examDate: new Date().toLocaleDateString('vi-VN')
  }
};

export const EXAM_TYPE_DURATION: Record<ExamType, number> = {
  'Kiểm tra 15 phút': 15,
  'Giữa kỳ 1': 60,
  'Cuối kỳ 1': 60,
  'Giữa kỳ 2': 60,
  'Cuối kỳ 2': 60
};
