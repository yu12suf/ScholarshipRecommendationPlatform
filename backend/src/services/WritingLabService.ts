import { groq70b } from "./AssessmentService.js";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export class WritingLabService {
  /**
   * Provides real-time or on-demand feedback for an essay using Groq 70B.
   */
  static async evaluateEssay(essay: string, prompt: string, examType: "IELTS" | "TOEFL" = "IELTS") {
    const evaluationPrompt = PromptTemplate.fromTemplate(`
      Role: Professional ${examType} Writing Examiner
      Task: Provide a detailed, pedagogical evaluation of the following essay.
      
      Writing Prompt: "{prompt}"
      Student's Essay:
      "{essay}"
      
      Evaluation Criteria:
      1. Task Response: How well the student addressed the prompt.
      2. Coherence & Cohesion: Organization and flow.
      3. Lexical Resource: Range and accuracy of vocabulary.
      4. Grammatical Range & Accuracy: Structural variety and correctness.
      
      Return ONLY a valid JSON object with this structure:
      {{
        "overall_band": number,
        "score_breakdown": {{
          "task_response": number,
          "coherence": number,
          "vocabulary": number,
          "grammar": number
        }},
        "detailed_feedback": [
          {{ "type": "grammar | vocabulary | structure", "excerpt": "the offending text", "suggestion": "what to change", "reason": "why" }}
        ],
        "overall_summary": "Encouraging summary of strengths and weaknesses.",
        "enhanced_version": "A version of the essay rewritten by you to be at a Band 9.0 level, while keeping the student's original intent."
      }}
      
      Rules:
      - Be extremely thorough with "detailed_feedback".
      - Ensure scores align with the official ${examType} rubric.
      - NO MARKDOWN in the response.
    `);

    const chain = groq70b.pipe(new StringOutputParser());
    const response = await chain.invoke(await evaluationPrompt.format({
      prompt,
      essay,
      examType
    }));

    try {
      return JSON.parse(response);
    } catch (e) {
      // Basic sanitization if needed
      const sanitized = response.replace(/```json|```/g, "").trim();
      return JSON.parse(sanitized);
    }
  }
}
