"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ai } from "./gemini";
import { createPartFromUri, createUserContent } from "@google/genai";

export async function clearGeneratedContent() {
  //   cookies().delete("generatedContent")
  revalidatePath("/");
}

export async function generateContent(formData: FormData) {
  // Get form data
  const topic = formData.get("topic") as string;
  const contentType = formData.get("contentType") as string;
  const tone = formData.get("tone") as string;
  const ageGroup = formData.get("ageGroup") as string;
  const brandVoice = formData.get("brandVoice") as string;
  const objective = formData.get("objective") as string;
  const imageFile = formData.get("imageFile") as File; // Get the File image

  // Validate required fields
  if (!topic) {
    return { error: "Topic is required" };
  }

  try {
    // Use generateContentWithGemini to generate content
    const prompt = createContentPrompt({
      topic,
      contentType,
      tone,
      ageGroup,
      brandVoice,
      objective,
    });

    // console.log(prompt);
    console.log(imageFile);

    try {
      if (imageFile) {
        const file = await ai.files.upload({
          file: imageFile,
          config: {
            mimeType: imageFile.type,
          },
        });
        if (!file || !file.uri || !file.mimeType)
          return { error: "File upload failed" };
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-04-17",
          contents: [
            createUserContent([
              prompt,
              createPartFromUri(file.uri, file.mimeType),
            ]),
          ],
        });
        revalidatePath("/");
        return { content: response.text };
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: [createUserContent([prompt])],
      });
      revalidatePath("/");
      return { content: response.text };
    } catch (error) {
      console.error("Error generating content with Gemini API:", error);
      throw new Error("Failed to generate content.");
    }
  } catch (error) {
    console.error("Error generating content:", error);
    return { error: "Failed to generate content." };
  }
}

function createContentPrompt({
  topic,
  contentType,
  tone,
  ageGroup,
  brandVoice,
  objective,
}: {
  topic: string;
  contentType: string;
  tone: string;
  ageGroup?: string;
  brandVoice?: string;
  objective?: string;
}): string {
  let prompt = `
        [START_PROMPT]

        **Role:** You are an expert content writer specializing in ${contentType} for the ${topic}. Your goal is to create compelling content that achieves the specified objective while adhering to the defined brand voice and targeting the intended audience.

        **Topic:** ${topic}

        **Content Type:** ${contentType}

        **Image (if applicable):** If the content is intended to accompany an image or if an image is a central part of the topic, analyse the image. Evaluate its relevance to the topic and how the content should relate to it. Then write the content accordingly.

        **Language:** Burmese.
    `;
  //   let prompt = `Create a ${contentType} on the topic of "${topic}".`;

  if (tone) {
    prompt += `* **Tone:** ${tone}.`;
    // prompt += `* **Tone:** [Describe the desired emotional and attitudinal style of the writing. Examples: Informative, persuasive, casual, formal, enthusiastic, empathetic, humorous, serious.]`;
  }

  if (ageGroup) {
    prompt += ` * **Age:** ${ageGroup}.`;
  }

  if (brandVoice) {
    prompt += ` **Brand Voice:** ${brandVoice}.`;
  }

  if (objective) {
    prompt += `**Objective:** ${objective}.`;
  }

  prompt += `

        ** OUTPUT FORMAT:**
        * **Title:** [Create 5 clickable, scroll-stopping and relevant titles for the content.]
        * **Content:** [Write the content based on the provided topic, content type, tone, age group, brand voice, and objective. Ensure it is engaging and relevant to the audience.]
        * **Image Description:** [If applicable, provide a description of the image and how it relates to the content.]
        
          **Instructions:**
        1.  Generate content based on the provided Topic, Content Type, and Objective.
        2.  Ensure the content is tailored to the specified Audience Age and Tone.
        3.  Strictly adhere to the described Brand Voice throughout the writing.
        4.  If an Image Description is provided, integrate the content seamlessly with the visual element.
        5.  The content should be [Specify any additional constraints or requirements, e.g., word count range, inclusion of specific keywords, call to action, structure (headings, bullet points), internal or external links to include (provide URLs if necessary)].
        6.  Review and refine the output to ensure it is high-quality, engaging, and free of grammatical errors or typos.

        [END_PROMPT]
  `;

  return prompt;
}
