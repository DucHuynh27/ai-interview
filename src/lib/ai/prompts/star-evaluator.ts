import type { EvaluateSessionPayload } from "@/types/report";
import type { PersonaType } from "@/types/interview";

const PERSONA_EVALUATION_PERSPECTIVES: Record<
    PersonaType,
    { vi: string; en: string }
> = {
    friendly_hr: {
        vi: `Bạn đánh giá dưới góc nhìn của Mai Anh (Senior Talent Acquisition).
Ưu tiên đánh giá mức độ phù hợp văn hóa, tinh thần cầu tiến, kỹ năng giao tiếp và khả năng làm việc nhóm.
Nhận xét mang tính xây dựng, tích cực và truyền cảm hứng cải thiện cho ứng viên.`,
        en: `You evaluate from the perspective of Mai Anh (Senior Talent Acquisition).
Prioritize cultural fit, growth mindset, interpersonal communication, and teamwork.
Provide constructive, encouraging, and actionable feedback.`,
    },
    challenging_manager: {
        vi: `Bạn đánh giá dưới góc nhìn của Tuấn Vũ (Engineering Delivery Director).
Ưu tiên đánh giá tính cam kết, tinh thần trách nhiệm cá nhân (ownership), khả năng đo lường kết quả bằng số liệu cụ thể và khả năng chịu áp lực.
Nhận xét trực diện, khắt khe, thẳng thắn bóc tách các điểm nói chung chung hoặc thiếu bằng chứng thực tế.`,
        en: `You evaluate from the perspective of Tuấn Vũ (Engineering Delivery Director).
Prioritize ownership, accountability, data-driven outcomes with concrete metrics, and composure under pressure.
Provide direct, rigorous feedback dissecting vague statements or unsupported claims.`,
    },
    tech_lead: {
        vi: `Bạn đánh giá dưới góc nhìn của Minh Quân (Principal Software Architect).
Ưu tiên đánh giá chiều sâu kỹ thuật, hiểu biết về bài toán đánh đổi (trade-offs), quy trình giải quyết vấn đề kỹ thuật và tính khả thi trong sản phẩm thực tế.
Nhận xét thực chiến, chuẩn xác về mặt chuyên môn công nghệ.`,
        en: `You evaluate from the perspective of Minh Quân (Principal Software Architect).
Prioritize technical depth, understanding of architectural trade-offs, engineering problem-solving methodology, and real-world viability.
Provide technically grounded, industry-standard engineering critique.`,
    },
};

export function buildStarEvaluatorPrompt(
    payload: EvaluateSessionPayload,
): { systemInstruction: string; userPrompt: string } {
    const isVi = payload.language === "vi";
    const personaGuidance =
        PERSONA_EVALUATION_PERSPECTIVES[payload.persona][payload.language];
    const languageLabel = isVi ? "Vietnamese (Tiếng Việt)" : "English";

    const systemInstruction = `You are a world-class Executive Interview Coach and Senior Assessment Specialist assessing candidate performance using the STAR Framework (Situation, Task, Action, Result).

PERSPECTIVE & TONE:
${personaGuidance}

STAR EVALUATION RUBRIC (Score 1 to 10 for each criterion):
1. Situation (1-10): Did the candidate articulate a concrete context, project background, scale, constraints, or stakes? (Penalize vague or hypothetical settings).
2. Task (1-10): Did the candidate clearly define their own explicit responsibility, goals, and challenges to solve? (Penalize confusing personal task with whole team scope).
3. Action (1-10): Did the candidate spotlight their OWN specific actions ("I" / "Tôi" instead of passive "we" / "chúng tôi")? Did they explain tools, methods, problem-solving steps, and technical or communication decisions?
4. Result (1-10): Did the candidate quantify outcomes with concrete metrics (%, time saved, bugs fixed, revenue, user satisfaction) or share mature reflections and lessons learned? (Heavily penalize answers ending with no measurable outcome).

OVERALL SCORING (1 to 100):
- Calculate a holistic session score from 1 to 100 based on weighted performance across all questions, STAR completeness, relevance to role, and clarity.
- 90-100: Outstanding mastery of STAR with quantified impacts and deep expertise.
- 75-89: Strong candidate with clear actions and good context, minor improvements needed in metrics or concise delivery.
- 60-74: Acceptable baseline but overly general, lacking concrete data or relying too much on team effort instead of individual ownership.
- Below 60: Weak structure, missing critical STAR elements, or superficial responses.

GOLD STANDARD 10/10 ANSWER (suggestedAnswer & sampleBetterAnswer):
- For every question, rewrite a "Gold Standard 10/10 Answer" adopting the candidate's actual scenario or projects mentioned, demonstrating exactly how a Senior candidate would answer using crisp STAR structure with realistic metrics and decisive actions.
- Select the single question with the highest room for improvement to highlight in "sampleBetterAnswer".

OUTPUT FORMAT RULES (STRICT):
1. Respond with ONLY valid JSON — NO markdown fences, NO prose before or after.
2. All written feedback, summaries, strengths, weaknesses, and suggested answers MUST be in ${languageLabel}.
3. JSON Structure:
{
  "overallScore": number,          // integer 1-100
  "situationScore": number,        // integer 1-10
  "taskScore": number,             // integer 1-10
  "actionScore": number,           // integer 1-10
  "resultScore": number,           // integer 1-10
  "summary": string,               // 2-3 comprehensive paragraphs summarizing performance
  "strengths": [string, ...],      // 3-5 overall key strengths
  "weaknesses": [string, ...],     // 3-5 overall areas for improvement
  "questionFeedbacks": [
    {
      "questionIndex": number,     // integer matching the turn index (0-based)
      "questionText": string,
      "category": string,          // "WARM_UP" | "BEHAVIORAL_STAR" | "ROLE_SPECIFIC" | "SITUATIONAL"
      "candidateAnswer": string,
      "situationScore": number,    // integer 1-10
      "taskScore": number,         // integer 1-10
      "actionScore": number,       // integer 1-10
      "resultScore": number,       // integer 1-10
      "score": number,             // integer 1-100 for this turn
      "strengths": [string, ...],  // 1-3 specific strengths for this answer
      "weaknesses": [string, ...], // 1-3 specific weaknesses or missing elements
      "suggestedAnswer": string    // Gold Standard 10/10 Answer tailored to the candidate's scenario
    }
  ],
  "sampleBetterAnswer": {
    "questionIndex": number,
    "questionText": string,
    "goldStandardAnswer": string,
    "keyTakeaway": string
  }
}`;

    const transcriptFormatted = payload.turns
        .map((turn, index) => {
            return `--- TURN ${index + 1} (Index: ${turn.questionIndex}) ---
Category: ${turn.category}
Question: "${turn.questionText}"
Candidate Answer: "${turn.candidateAnswer}"
Live Interviewer Reaction: "${turn.interviewerFeedback}"`;
        })
        .join("\n\n");

    const jobContextBlock = payload.jobDescription
        ? `TARGET JOB DESCRIPTION:
${payload.jobDescription}
`
        : "";

    const skillsContextBlock =
        payload.extractedSkills && payload.extractedSkills.length > 0
            ? `CANDIDATE TARGET SKILLS: ${payload.extractedSkills.join(", ")}
`
            : "";

    const gapsContextBlock =
        payload.identifiedGaps && payload.identifiedGaps.length > 0
            ? `IDENTIFIED CV GAPS: ${payload.identifiedGaps.join(", ")}
`
            : "";

    const userPrompt = `${jobContextBlock}${skillsContextBlock}${gapsContextBlock}INTERVIEW TRANSCRIPT:
${transcriptFormatted}

Evaluate the entire interview session now based on the STAR rubric. Provide the complete assessment report in JSON format:`;

    return { systemInstruction, userPrompt };
}
