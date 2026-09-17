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
import { FullExamSuite, ExamPaper, MatrixItem, SpecificationItem } from '../types';

// Standard Decree 30/2020/NĐ-CP Page Margins (in dxa: 1 mm = 56.7 dxa)
// Top: 20mm (1134 dxa), Bottom: 20mm (1134 dxa), Left: 30mm (1701 dxa), Right: 15mm (850 dxa)
const MARGINS = {
  top: 1134,
  bottom: 1134,
  left: 1701,
  right: 850,
};

const FONT_FAMILY = 'Times New Roman';

/**
 * Creates Matran_Dacta_[Grade]_[ExamType].docx
 */
export async function generateMatrixAndSpecDocx(suite: FullExamSuite, paper: ExamPaper): Promise<Blob> {
  const admin = paper.adminInfo;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: MARGINS,
          },
        },
        children: [
          // Header administrative block
          createHeaderBlock(admin.schoolName, `MA TRẬN VÀ BẢN ĐẶC TẢ ĐỀ KIỂM TRA`),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200, before: 200 },
            children: [
              new TextRun({
                text: `MA TRẬN ĐỀ KIỂM TRA MÔN TIẾNG ANH ${(paper.grade || '').toUpperCase()} - ${(paper.examType || '').toUpperCase()}`,
                bold: true,
                size: 28, // 14pt
                font: FONT_FAMILY,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `Năm học: ${admin.academicYear} | Thời gian làm bài: ${admin.durationMinutes} phút`,
                italics: true,
                size: 24, // 12pt
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Matrix Table
          createMatrixTable(suite.matrix),

          new Paragraph({ spacing: { after: 300 } }),

          // Specification Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200, before: 200 },
            children: [
              new TextRun({
                text: `BẢN ĐẶC TẢ ĐỀ KIỂM TRA MÔN TIẾNG ANH ${(paper.grade || '').toUpperCase()} - ${(paper.examType || '').toUpperCase()}`,
                bold: true,
                size: 28, // 14pt
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Specification Table
          createSpecTable(suite.specifications),

          // Signatures Footer according to Decree 30
          createSignatureBlock(admin.teacherName),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Creates Detap_MaDe[Code].docx
 */
export async function generateExamPaperDocx(paper: ExamPaper, showCognition: boolean = true): Promise<Blob> {
  const admin = paper.adminInfo;

  const children: (Paragraph | Table)[] = [
    // Header block
    createExamHeaderTable(
      admin.schoolName,
      paper.examType,
      paper.grade,
      admin.academicYear,
      paper.code,
      admin.durationMinutes,
      admin.parentAgency
    ),

    new Paragraph({ spacing: { after: 120 } }),

    // Student Info Box & Marks Table
    ...createStudentInfoElements(paper.grade, paper.code),

    new Paragraph({ spacing: { after: 180 } }),
  ];

  // Render Sections
  let globalQuestionIndex = 1;
  const safeSections = Array.isArray(paper.sections) ? paper.sections : [];
  const validSections = safeSections.filter(s => {
    // Prevent AI-generated title header section
    if ((!s.questions || s.questions.length === 0) && s.title && s.title.toUpperCase().includes('ĐỀ KIỂM TRA')) {
      return false;
    }
    return true;
  });

  validSections.forEach((section) => {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: section.title,
            bold: true,
            size: 28, // 14pt
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    if (section.instructions) {
      children.push(
        new Paragraph({
          spacing: { after: 150 },
          children: [
            new TextRun({
              text: section.instructions,
              italics: true,
              size: 26, // 13pt
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    }

    if (section.readingPassage) {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: section.readingPassage,
                          size: 26,
                          font: FONT_FAMILY,
                        }),
                      ],
                    }),
                  ],
                  shading: { fill: 'F8FAFC' },
                  margins: { top: 150, bottom: 150, left: 150, right: 150 },
                }),
              ],
            }),
          ],
        }),
        new Paragraph({ spacing: { after: 150 } })
      );
    }

    // Questions
    (Array.isArray(section.questions) ? section.questions : []).forEach((q) => {
      const isEssay = q.type === 'ESSAY' || q.type === 'WRITING' || (q.prompt && q.prompt.toLowerCase().includes('write a paragraph'));
      
      if (isEssay) {
        let promptLines = (q.prompt || '').split(/(?:\n|(?=- )|(?= - ))/).map(l => l.trim()).filter(l => l.length > 0);
        
        // Strip duplicate instructions if AI still generated them in prompt
        if (promptLines.length > 0 && promptLines[0].toLowerCase().includes('write a paragraph')) {
          promptLines.shift();
        }
        if (promptLines.length > 0 && promptLines[0].toLowerCase().includes('following suggestions')) {
          promptLines.shift();
        }

        if (promptLines.length > 0) {
          promptLines.forEach((line, idx) => {
            let text = line;
            if (!text.startsWith('-') && promptLines.length > 1) {
               text = `- ${text}`;
            }

            children.push(
              new Paragraph({
                spacing: { before: 60, after: 60 },
                indent: { left: 720 }, // Indent bullet points
                children: [
                  new TextRun({
                    text: text,
                    size: 26,
                    font: FONT_FAMILY,
                    italics: true,
                  }),
                  ...(idx === promptLines.length - 1 && showCognition ? [
                    new TextRun({
                      text: ` [${q.points}đ - ${q.cognitionLevel}]`,
                      italics: true,
                      size: 22, // 11pt
                      font: FONT_FAMILY,
                    })
                  ] : [])
                ],
              })
            );
          });
        } else if (showCognition) {
          // If no prompt lines left, still show cognition
          children.push(
            new Paragraph({
              spacing: { before: 60, after: 60 },
              children: [
                new TextRun({
                  text: `[${q.points}đ - ${q.cognitionLevel}]`,
                  italics: true,
                  size: 22,
                  font: FONT_FAMILY,
                })
              ],
            })
          );
        }

        // Add 8 dotted lines for student's writing area
        for (let i = 0; i < 8; i++) {
          children.push(
            new Paragraph({
              spacing: { before: 200, after: 200 },
              children: [
                new TextRun({
                  text: '.........................................................................................................................................................',
                  size: 26,
                  font: FONT_FAMILY,
                  color: '999999',
                }),
              ],
            })
          );
        }
      } else {
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: qNumText,
                bold: true,
                size: 28, // 14pt
                font: FONT_FAMILY,
              }),
              new TextRun({
                text: q.prompt,
                size: 28, // 14pt
                font: FONT_FAMILY,
              }),
              ...(showCognition
                ? [
                    new TextRun({
                      text: ` [${q.points}đ - ${q.cognitionLevel}]`,
                      italics: true,
                      size: 22, // 11pt
                      font: FONT_FAMILY,
                    }),
                  ]
                : []),
            ],
          })
        );
      }
      if (!isEssay) {
        globalQuestionIndex++;
      }

      // Render Options if question has options
      if (q.options && q.options.length > 0) {
        const optionRuns = (q.options || []).map(
          (opt) => `${opt.key || ''}. ${opt.text || ''}`
        );

        // Display 2x2 or 4 across
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            indent: { left: 400 },
            children: [
              new TextRun({
                text: optionRuns.join('       '),
                size: 28,
                font: FONT_FAMILY,
              }),
            ],
          })
        );
      } else if (q.type === 'REWRITE' || q.type === 'FILL_IN') {
        children.push(
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: `👉 Trả lời: ..........................................................................................................................................................`,
                size: 26,
                italics: true,
                font: FONT_FAMILY,
              }),
            ],
          })
        );
      } else if (q.type === 'ESSAY') {
        const dottedLine = '..........................................................................................................................................................................';
        const linesText = Array(8).fill(dottedLine).join('\n');
        children.push(
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: linesText,
                size: 26,
                italics: true,
                font: FONT_FAMILY,
              }),
            ],
          })
        );
      }
    });
  });

  // Render Speaking Topics
  if (paper.speakingTopics && paper.speakingTopics.length > 0) {
    children.push(
      new Paragraph({
        spacing: { before: 250, after: 100 },
        children: [
          new TextRun({
            text: `SECTION E: SPEAKING (2.0 pts - CHẤM RIÊNG)`,
            bold: true,
            size: 28, // 14pt
            font: FONT_FAMILY,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 150 },
        children: [
          new TextRun({
            text: `Choose one of the following topics and talk about it. You have 1 minute to prepare and 2 minutes to speak.`,
            italics: true,
            size: 26, // 13pt
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    (Array.isArray(paper.speakingTopics) ? paper.speakingTopics : []).forEach((topic, idx) => {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 50 },
          children: [
            new TextRun({
              text: `Topic ${idx + 1}: ${topic.topicName}`,
              bold: true,
              size: 26,
              font: FONT_FAMILY,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({
              text: topic.description,
              italics: true,
              size: 24,
              font: FONT_FAMILY,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          indent: { left: 200 },
          children: [
            new TextRun({
              text: `Guide questions:\n` + (topic.guideQuestions || []).map((q) => `- ${q}`).join('\n'),
              size: 24,
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    });
  }

  // End of test note
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 200 },
      children: [
        new TextRun({
          text: `-------------- HẾT --------------`,
          bold: true,
          italics: true,
          size: 24,
          font: FONT_FAMILY,
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: MARGINS },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Creates DapAn_HuongDanCham_[ExamType].docx
 */
export async function generateAnswerKeyDocx(paper: ExamPaper): Promise<Blob> {
  const admin = paper.adminInfo;

  const children: (Paragraph | Table)[] = [
    createHeaderBlock(admin.schoolName, `ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM`),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200, before: 150 },
      children: [
        new TextRun({
          text: `ĐÁP ÁN & HƯỚNG DẪN CHẤM ĐỀ KIỂM TRA MÔN TIẾNG ANH ${(paper.grade || '').toUpperCase()}`,
          bold: true,
          size: 28,
          font: FONT_FAMILY,
        }),
      ],
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `MÃ ĐỀ KIỂM TRA: ${paper.code} | Loại bài: ${paper.examType} | Năm học: ${admin.academicYear}`,
          italics: true,
          size: 24,
          font: FONT_FAMILY,
        }),
      ],
    }),

    // Audio script if Listening section exists
    ...(paper.audioScript
      ? [
          new Paragraph({
            spacing: { before: 150, after: 100 },
            children: [
              new TextRun({
                text: `I. NỘI DUNG BĂNG NGHE (LISTENING AUDIO SCRIPT):`,
                bold: true,
                size: 28,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: paper.audioScript,
                            italics: true,
                            size: 26,
                            font: FONT_FAMILY,
                          }),
                        ],
                      }),
                    ],
                    shading: { fill: 'F1F5F9' },
                    margins: { top: 150, bottom: 150, left: 150, right: 150 },
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 200 } }),
        ]
      : []),

    // Compact MCQ Answer Grid Table
    new Paragraph({
      spacing: { before: 150, after: 100 },
      children: [
        new TextRun({
          text: `II. BẢNG ĐÁP ÁN TRẮC NGHIỆM KHÁCH QUAN (MÃ ĐỀ ${paper.code}):`,
          bold: true,
          size: 28,
          font: FONT_FAMILY,
        }),
      ],
    }),

    createCompactAnswerGridTable(paper),

    new Paragraph({ spacing: { after: 200 } }),

    // Detailed Answer Table
    new Paragraph({
      spacing: { before: 150, after: 100 },
      children: [
        new TextRun({
          text: `III. ĐÁP ÁN CHI TIẾT KÈM GIẢI THÍCH & BIỂU ĐIỂM:`,
          bold: true,
          size: 28,
          font: FONT_FAMILY,
        }),
      ],
    }),

    createAnswerKeyTable(paper),

    new Paragraph({ spacing: { after: 200 } }),

    // Writing Scoring Criteria
    new Paragraph({
      spacing: { before: 150, after: 100 },
      children: [
        new TextRun({
          text: `IV. HƯỚNG DẪN CHẤM PHẦN VIẾT (WRITING MARK SCHEME):`,
          bold: true,
          size: 28,
          font: FONT_FAMILY,
        }),
      ],
    }),

    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: paper.writingMarkScheme || ((paper.examType || '').includes('Cuối kỳ') 
            ? `1. Topic sentence: 0.4 pts.\n2. Supporting sentences: 0.2 pts.\n3. Range of vocabulary use: 0.2 pts.\n4. Accuracy (Grammar, spelling, punctuation): 0.2 pts.`
            : `1. Ý tưởng & Bố cục (Task Fulfillment & Organization): 0.5 điểm\n2. Từ vựng & Ngữ pháp (Vocabulary & Grammar Accuracy): 0.5 điểm\n3. Sự mạch lạc & Liên kết (Coherence & Cohesion): 0.5 điểm`),
          size: 26,
          font: FONT_FAMILY,
        }),
      ],
    }),

    // Dynamically print sample essay from the last question in answer key (Writing Question)
    ...(() => {
      const lastQ = paper.answerKey[paper.answerKey.length - 1];
      if (lastQ && lastQ.explanation) {
        return [
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [
              new TextRun({
                text: `* Bài viết mẫu gợi ý (Sample Writing Essay):`,
                bold: true,
                size: 26,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: lastQ.explanation,
                italics: true,
                size: 26,
                font: FONT_FAMILY,
              }),
            ],
          })
        ];
      }
      return [];
    })(),

    // Speaking Suggested Answers
    ...(paper.speakingTopics && paper.speakingTopics.length > 0
      ? [
          new Paragraph({
            spacing: { before: 150, after: 100 },
            children: [
              new TextRun({
                text: `V. HƯỚNG DẪN CHẤM VÀ GỢI Ý ĐÁP ÁN PHẦN NÓI (SPEAKING GUIDELINES):`,
                bold: true,
                size: 28,
                font: FONT_FAMILY,
              }),
            ],
          }),
          ...paper.speakingTopics.flatMap((topic, idx) => [
            new Paragraph({
              spacing: { before: 100, after: 50 },
              children: [
                new TextRun({
                  text: `Chủ đề nói ${idx + 1}: ${topic.topicName}`,
                  bold: true,
                  size: 26,
                  font: FONT_FAMILY,
                }),
              ],
            }),
            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: `Suggested Answers:\n` + (topic.suggestedAnswers || (topic.guideQuestions || []).map(() => 'N/A')).map((ans, aIdx) => `Q${aIdx+1}: ${ans}`).join('\n'),
                  size: 24,
                  italics: true,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ]),
        ]
      : []),

    createSignatureBlock(admin.teacherName),
  ];

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: MARGINS } },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

// Helpers for Administrative Layout according to Decree 30/2020/NĐ-CP
function createHeaderBlock(schoolName: string, subTitle: string): Table {
  return new Table({
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
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: (schoolName || '').toUpperCase(),
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: subTitle,
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Độc lập - Tự do - Hạnh phúc',
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function getSavedAgency(schoolName: string): string {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('school_exam_config') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.parentAgency) return parsed.parentAgency.toUpperCase();
    }
  } catch {}
  if (schoolName.toUpperCase().includes('THPT')) return 'SỞ GIÁO DỤC VÀ ĐÀO TẠO';
  return schoolName.toUpperCase().includes('ĐỒNG YÊN') ? 'SỞ GD&ĐT TUYÊN QUANG' : 'SỞ GIÁO DỤC VÀ ĐÀO TẠO';
}

function createExamHeaderTable(
  schoolName: string,
  examType: string,
  grade: string,
  academicYear: string,
  code: string,
  durationMinutes: number,
  parentAgency?: string
): Table {
  const rawSchool = (schoolName || 'THPT Đồng Yên').trim();
  const schoolUpper = rawSchool.toUpperCase().startsWith('TRƯỜNG')
    ? rawSchool.toUpperCase()
    : `TRƯỜNG ${rawSchool.toUpperCase()}`;
  const ubndText = (parentAgency || getSavedAgency(schoolUpper)).trim().toUpperCase();
  const gradeNum = (grade || '').replace(/[^0-9]/g, '') || '10';

  return new Table({
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
            width: { size: 40, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: ubndText,
                    bold: true,
                    size: 23, // 11.5pt
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: schoolUpper,
                    bold: true,
                    underline: {},
                    size: 23, // 11.5pt
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 30 },
                children: [
                  new TextRun({
                    text: `BÀI KIỂM TRA ĐÁNH GIÁ ${(examType || '').toUpperCase()}`,
                    bold: true,
                    size: 25, // 12.5pt
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 30 },
                children: [
                  new TextRun({
                    text: `NĂM HỌC: ${academicYear}`,
                    bold: true,
                    size: 23,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 30 },
                children: [
                  new TextRun({
                    text: `Môn: Tiếng Anh ${gradeNum}`,
                    bold: true,
                    size: 25,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Thời gian: ${durationMinutes} phút`,
                    italics: true,
                    size: 23,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createStudentInfoElements(grade: string = '6', code: string = '001'): (Paragraph | Table)[] {
  const gradeNum = (grade || '').replace(/[^0-9]/g, '') || '6';

  const nameParagraph = new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [
      new TextRun({
        text: 'Full name: ____________________________________,      ',
        size: 26,
        font: FONT_FAMILY,
      }),
      new TextRun({
        text: `Class: ${gradeNum}A___      `,
        size: 26,
        font: FONT_FAMILY,
      }),
      new TextRun({
        text: `Mã đề ${code}`,
        bold: true,
        size: 26,
        font: FONT_FAMILY,
      }),
    ],
  });

  const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
  const cellBorders = {
    top: thinBorder,
    bottom: thinBorder,
    left: thinBorder,
    right: thinBorder,
  };

  const marksTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: thinBorder,
      bottom: thinBorder,
      left: thinBorder,
      right: thinBorder,
      insideHorizontal: thinBorder,
      insideVertical: thinBorder,
    },
    rows: [
      // Row 0: Headers
      new TableRow({
        children: [
          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE },
            columnSpan: 2,
            borders: cellBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text: 'Marks',
                    bold: true,
                    size: 23,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 13, type: WidthType.PERCENTAGE },
            rowSpan: 2,
            borders: cellBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 120 },
                children: [
                  new TextRun({
                    text: 'Total',
                    bold: true,
                    size: 23,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            rowSpan: 2,
            borders: cellBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 120 },
                children: [
                  new TextRun({
                    text: "Teacher's remarks",
                    bold: true,
                    size: 23,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      // Row 1: Sub-headers for Speak / Write
      new TableRow({
        children: [
          new TableCell({
            width: { size: 11, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text: 'Speak',
                    bold: true,
                    size: 23,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 11, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text: 'Write',
                    bold: true,
                    size: 23,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      // Row 2: Empty scores & Teacher's remarks underlines
      new TableRow({
        children: [
          new TableCell({
            width: { size: 11, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            children: [new Paragraph({ spacing: { before: 300, after: 300 } })],
          }),
          new TableCell({
            width: { size: 11, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            children: [new Paragraph({ spacing: { before: 300, after: 300 } })],
          }),
          new TableCell({
            width: { size: 13, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            children: [new Paragraph({ spacing: { before: 300, after: 300 } })],
          }),
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            children: [
              new Paragraph({
                spacing: { before: 80, after: 60 },
                children: [
                  new TextRun({
                    text: '________________________________________________',
                    size: 22,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 40, after: 80 },
                children: [
                  new TextRun({
                    text: '________________________________________________',
                    size: 22,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  return [nameParagraph, marksTable];
}

function createStudentInfoTable(examType?: string, grade: string = '6', code: string = '001'): Table {
  return createStudentInfoElements(grade, code)[1] as Table;
}

function createMatrixTable(matrix: MatrixItem[]): Table {
  const headers = [
    'STT',
    'Kỹ năng / Dạng bài',
    'Mức độ Cognition',
    'Số câu',
    'Tổng điểm',
  ];

  const headerCells = headers.map(
    (h) =>
      new TableCell({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: h, bold: true, size: 24, font: FONT_FAMILY }),
            ],
          }),
        ],
        shading: { fill: 'E2E8F0' },
      })
  );

  const rows = (matrix || []).map((item, idx) => {
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${idx + 1}`,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${item.skill} - ${item.subSkill}`,
                  bold: true,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: item.cognitionLevel,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${item.questionCount}`,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${(item?.points || 0).toFixed(1)}đ`,
                  bold: true,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells }), ...rows],
  });
}

function createSpecTable(specs: SpecificationItem[]): Table {
  const headers = [
    'Kỹ năng',
    'Chủ đề / Đơn vị kiến thức',
    'Yêu cầu cần đạt',
    'Nhận biết',
    'Thông hiểu',
    'Vận dụng',
    'Vận dụng cao',
    'Tổng',
  ];

  const headerCells = headers.map(
    (h) =>
      new TableCell({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: h, bold: true, size: 22, font: FONT_FAMILY }),
            ],
          }),
        ],
        shading: { fill: 'E2E8F0' },
      })
  );

  const rows = (specs || []).map((item) => {
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: item.skill,
                  bold: true,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: item.knowledgeUnit,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: item.performanceIndicator,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${item.recognitionCount}`,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${item.comprehensionCount}`,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${item.applicationCount}`,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${item.highApplicationCount}`,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${item.totalQuestions} câu\n(${(item?.totalPoints || 0).toFixed(1)}đ)`,
                  bold: true,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells }), ...rows],
  });
}

function createCompactAnswerGridTable(paper: ExamPaper): Table {
  const limit = (paper.examType || '').includes('Cuối kỳ') ? 35 : 36;
  const mcqAnswers = (paper.answerKey || []).filter(item => item.questionNumber <= limit);
  const rows: TableRow[] = [];
  const colsCount = 6;
  
  for (let i = 0; i < mcqAnswers.length; i += colsCount) {
    const chunk = mcqAnswers.slice(i, i + colsCount);
    const rowCells = chunk.map(item => 
      new TableCell({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `${item.questionNumber}. `, bold: true, size: 24, font: FONT_FAMILY }),
              new TextRun({ text: `${item.answer}`, bold: true, size: 24, color: '1D4ED8', font: FONT_FAMILY }),
            ]
          })
        ],
        margins: { top: 120, bottom: 120, left: 100, right: 100 }
      })
    );
    while (rowCells.length < colsCount) {
      rowCells.push(new TableCell({ children: [] }));
    }
    rows.push(new TableRow({ children: rowCells }));
  }
  
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows
  });
}

function createAnswerKeyTable(paper: ExamPaper): Table {
  const headers = ['Câu', 'Phần kiểm tra', 'Đáp án chuẩn', 'Điểm', 'Giải thích chi tiết'];

  const headerCells = headers.map(
    (h) =>
      new TableCell({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: h, bold: true, size: 24, font: FONT_FAMILY }),
            ],
          }),
        ],
        shading: { fill: 'E2E8F0' },
      })
  );

  const rows = (paper.answerKey || []).map((item) => {
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${item.questionNumber}`,
                  bold: true,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: item.sectionTitle,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: item.answer,
                  bold: true,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${(item?.points || 0).toFixed(2)}đ`,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: item.explanation,
                  italics: true,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells }), ...rows],
  });
}

function createSignatureBlock(teacherName: string): Table {
  return new Table({
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
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'DUYỆT CỦA BẢN GIÁM HIỆU / TỔ TRƯỞNG',
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '(Ký và ghi rõ họ tên)',
                    italics: true,
                    size: 22,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'GIÁO VIÊN RA ĐỀ',
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '(Ký và ghi rõ họ tên)',
                    italics: true,
                    size: 22,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({ spacing: { before: 600 } }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: teacherName,
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/**
 * Xuất 1 file Word (.docx) DUY NHẤT trọn bộ gồm:
 * - Section 1: Ma trận & Bản đặc tả kỹ thuật
 * - Section 2: Đề kiểm tra Mã 001
 * - Section 3: Đề kiểm tra Mã 002 (nếu có)
 * - Section 4: Hướng dẫn chấm & Đáp án
 */
export async function generateFullExamPackageDocx(
  suite: FullExamSuite,
  showCognition: boolean = true
): Promise<Blob> {
  const paper0 = suite.papers[0];
  const admin = paper0?.adminInfo || {
    schoolName: 'THPT Đồng Yên',
    academicYear: '2026 - 2027',
    teacherName: 'Thầy giáo Đinh Văn Thành',
    durationMinutes: 60,
  };

  const sections: any[] = [];

  // 1. SECTION 1: MA TRẬN & BẢN ĐẶC TẢ
  sections.push({
    properties: { page: { margin: MARGINS } },
    children: [
      createHeaderBlock(admin.schoolName, 'MA TRẬN VÀ BẢN ĐẶC TẢ ĐỀ KIỂM TRA'),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200, before: 200 },
        children: [
          new TextRun({
            text: `MA TRẬN ĐỀ KIỂM TRA MÔN TIẾNG ANH ${(paper0?.grade || '').toUpperCase()} - ${(paper0?.examType || '').toUpperCase()}`,
            bold: true,
            size: 28,
            font: FONT_FAMILY,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: `Năm học: ${admin.academicYear} | Thời gian: ${admin.durationMinutes} phút`,
            italics: true,
            size: 24,
            font: FONT_FAMILY,
          }),
        ],
      }),
      createMatrixTable(suite.matrix),
      new Paragraph({ spacing: { after: 300 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200, before: 200 },
        children: [
          new TextRun({
            text: `BẢN ĐẶC TẢ KỸ THUẬT ĐỀ KIỂM TRA MÔN TIẾNG ANH ${(paper0?.grade || '').toUpperCase()}`,
            bold: true,
            size: 28,
            font: FONT_FAMILY,
          }),
        ],
      }),
      createSpecTable(suite.specifications),
      createSignatureBlock(admin.teacherName),
    ],
  });

  // 2. CÁC SECTION ĐỀ KIỂM TRA (MÃ 001, 002,...)
  suite.papers.forEach((paper) => {
    const examChildren: (Paragraph | Table)[] = [
      createExamHeaderTable(
        admin.schoolName,
        paper.examType,
        paper.grade,
        admin.academicYear,
        paper.code,
        admin.durationMinutes,
        admin.parentAgency
      ),
      new Paragraph({ spacing: { after: 120 } }),
      ...createStudentInfoElements(paper.grade, paper.code),
      new Paragraph({ spacing: { after: 180 } }),
    ];

    const safeSections = Array.isArray(paper.sections) ? paper.sections : [];
    safeSections.forEach((section) => {
      examChildren.push(
        new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: section.title,
              bold: true,
              size: 26, // 13pt chuẩn
              font: FONT_FAMILY,
            }),
          ],
        })
      );

      if (section.instructions) {
        examChildren.push(
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: section.instructions,
                italics: true,
                size: 26,
                font: FONT_FAMILY,
              }),
            ],
          })
        );
      }

      if (section.readingPassage) {
        examChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: section.readingPassage,
                            size: 26,
                            font: FONT_FAMILY,
                          }),
                        ],
                      }),
                    ],
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 150, bottom: 150, left: 150, right: 150 },
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 150 } })
        );
      }

      (Array.isArray(section.questions) ? section.questions : []).forEach((q) => {
        const isEssay = q.type === 'ESSAY' || q.type === 'WRITING' || (q.prompt && q.prompt.toLowerCase().includes('write a paragraph'));

        examChildren.push(
          new Paragraph({
            spacing: { before: 80, after: 60 },
            children: [
              new TextRun({
                text: `Question ${q.questionNumber}. `,
                bold: true,
                size: 26,
                font: FONT_FAMILY,
              }),
              new TextRun({
                text: q.prompt,
                size: 26,
                font: FONT_FAMILY,
              }),
              ...(showCognition && !isEssay
                ? [
                    new TextRun({
                      text: ` [${q.points}đ - ${q.cognitionLevel}]`,
                      italics: true,
                      size: 22,
                      font: FONT_FAMILY,
                    }),
                  ]
                : []),
            ],
          })
        );

        if (q.options && q.options.length > 0) {
          const optTexts = q.options.map(o => `${o.key}. ${o.text}`).join('       ');
          examChildren.push(
            new Paragraph({
              spacing: { after: 100 },
              indent: { left: 400 },
              children: [
                new TextRun({
                  text: optTexts,
                  size: 26,
                  font: FONT_FAMILY,
                }),
              ],
            })
          );
        }

        // Nếu là câu viết tự luận: Thêm 10 dòng kẻ chấm dot lines chuẩn đề mẫu
        if (isEssay) {
          for (let d = 0; d < 10; d++) {
            examChildren.push(
              new Paragraph({
                spacing: { before: 50, after: 50 },
                children: [
                  new TextRun({
                    text: '.........................................................................................................................................................',
                    size: 24,
                    font: FONT_FAMILY,
                    color: '666666',
                  }),
                ],
              })
            );
          }
        }
      });
    });

    examChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 200 },
        children: [
          new TextRun({
            text: `------The end------`,
            bold: true,
            size: 26,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    sections.push({
      properties: { page: { margin: MARGINS } },
      children: examChildren,
    });
  });

  // 3. SECTION ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM
  if (paper0) {
    const answerChildren: (Paragraph | Table)[] = [
      createHeaderBlock(admin.schoolName, 'HƯỚNG DẪN ĐÁP ÁN VÀ BIỂU ĐIỂM'),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200, before: 200 },
        children: [
          new TextRun({
            text: `ĐÁP ÁN VÀ BIỂU ĐIỂM - MÔN TIẾNG ANH ${(paper0.grade || '').toUpperCase()}`,
            bold: true,
            size: 28,
            font: FONT_FAMILY,
          }),
        ],
      }),
    ];

    // Bổ sung Audio Scripts nếu có
    if (paper0.audioScript) {
      answerChildren.push(
        new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: 'NỘI DUNG BÀI NGHE (AUDIO SCRIPTS - DÙNG CHO CÁC MÃ ĐỀ):',
              bold: true,
              size: 26,
              font: FONT_FAMILY,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: paper0.audioScript,
              italics: true,
              size: 24,
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    }

    // Bảng đáp án trắc nghiệm
    answerChildren.push(
      new Paragraph({
        spacing: { before: 150, after: 100 },
        children: [
          new TextRun({
            text: `I. BẢNG ĐÁP ÁN TRẮC NGHIỆM KHÁCH QUAN (MÃ ĐỀ ${paper0.code}):`,
            bold: true,
            size: 26,
            font: FONT_FAMILY,
          }),
        ],
      }),
      createCompactAnswerGridTable(paper0),
      new Paragraph({ spacing: { after: 200 } }),
      new Paragraph({
        spacing: { before: 150, after: 100 },
        children: [
          new TextRun({
            text: `II. ĐÁP ÁN CHI TIẾT KÈM GIẢI THÍCH:`,
            bold: true,
            size: 26,
            font: FONT_FAMILY,
          }),
        ],
      }),
      createAnswerKeyTable(paper0)
    );

    // Bổ sung Speaking Test guidelines nếu có
    if (paper0.speakingTopics && paper0.speakingTopics.length > 0) {
      answerChildren.push(
        new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: 'III. HƯỚNG DẪN CHẤM VÀ GỢI Ý ĐÁP ÁN PHẦN THI NÓI (SPEAKING TEST):',
              bold: true,
              size: 26,
              font: FONT_FAMILY,
            }),
          ],
        }),
        ...paper0.speakingTopics.flatMap((topic, idx) => [
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [
              new TextRun({
                text: `Chủ đề ${idx + 1}: ${topic.topicName}`,
                bold: true,
                size: 24,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: (topic.suggestedAnswers || (topic.guideQuestions || []).map(() => 'N/A')).map((ans, aIdx) => `Q${aIdx+1}: ${ans}`).join('\n'),
                size: 22,
                italics: true,
                font: FONT_FAMILY,
              }),
            ],
          }),
        ])
      );
    }

    // Chữ ký phê duyệt chuẩn
    answerChildren.push(createSignatureBlock(admin.teacherName));

    sections.push({
      properties: { page: { margin: MARGINS } },
      children: answerChildren,
    });
  }

  const doc = new Document({ sections });
  return await Packer.toBlob(doc);
}
