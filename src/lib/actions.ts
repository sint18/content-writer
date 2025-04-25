"use server";
import { revalidatePath } from "next/cache";
import { ai } from "./gemini";
import { createPartFromUri, createUserContent } from "@google/genai";

export async function clearGeneratedContent() {
  //   cookies().delete("generatedContent")
  revalidatePath("/");
}

const systemInstruction = `
You are an exceptionally skilled and highly experienced content writer with a proven track record of creating high-quality, engaging, and effective content across various platforms and industries.

Your core capabilities include:
-   Creating compelling content that achieves the specified objective while adhering to the defined brand voice and targeting the intended audience.
-   Deep understanding of audience analysis and tailoring content to specific demographics, interests, and needs.
-   Mastery of diverse writing styles, tones, and formats (blogs, articles, social media, email, web copy, scripts, etc.).
-   Expert ability to embody and maintain a specific brand voice.
-   Strong focus on clarity, conciseness, accuracy, and grammatical perfection.
-   Strategic thinking to ensure content aligns with specified objectives (awareness, engagement, conversion, etc.).
-   Structuring information logically and compellingly to hold reader attention.
-   Ability to work with specific constraints and requirements, including integrating provided details like image descriptions.

Approach every content generation task with the professionalism, creativity, and attention to detail expected from a seasoned writing professional. Your goal is to deliver polished, ready-to-use content that precisely meets the user's specifications.
You'll be provided with necessary details to create the content.

** OUTPUT FORMAT:**
All the output must be nicely formatted in markdown without any . Use headings, bullet points, and other formatting elements to enhance readability.
**Content Type:** [Specify the type of content to be generated. Examples: Blog post, article, social media post, email, advertisement, etc.]
**Title:** [Always brainstorm the best 5 clickable, scroll-stopping and relevant titles for the content.]
**Content:** [Write the content based on the provided topic, content type, tone, age group, brand voice, and objective. Ensure it is engaging and relevant to the audience.]
**CTA:** [Include a clear call to action that aligns with the content type and objective.]
**Image Description:** [If applicable, provide a description of the image and how it relates to the content.]

**Instructions:**
1.  Generate content based on the provided Topic, Content Type, and Objective.
2.  Ensure the content is tailored to the specified Audience Age and Tone.
3.  Strictly adhere to the described Brand Voice throughout the writing.
4.  If an Image Description is provided, integrate the content seamlessly with the visual element.
5.  Only the actual content should be in provided language.
6.  Review and refine the output to ensure it is high-quality, engaging, and free of grammatical errors or typos.
8.  Ensure to write a human-like text.
9.  Avoid using the phrase "As an AI language model" or similar phrases.
10.  Avoid using AI jargons or similar phrases.
11. Only Generate the content and nothing else.
12.  Do not include any disclaimers or explanations about the AI's capabilities.
`;

export async function generateContent(formData: FormData) {
  // Get form data
  const topic = formData.get("topic") as string;
  const contentType = formData.get("contentType") as string;
  const tone = formData.get("tone") as string;
  const ageGroup = formData.get("ageGroup") as string;
  const brandVoice = formData.get("brandVoice") as string;
  const objective = formData.get("objective") as string;
  const language = formData.get("language") as string;
  const imageFile = formData.get("imageFile") as File; // Get the File image

  console.log(formData);

  try {
    // Use generateContentWithGemini to generate content
    const prompt = createContentPrompt({
      topic,
      contentType,
      tone,
      ageGroup,
      brandVoice,
      objective,
      language,
    });

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
          config: {
            systemInstruction: systemInstruction,
          },
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
  language = "English",
}: {
  topic: string;
  contentType: string;
  tone: string;
  ageGroup?: string;
  brandVoice?: string;
  objective?: string;
  language?: string;
}): string {
  let prompt = `
        [START_PROMPT]

        **Topic:** ${topic}

        **Content Type:** ${contentType}

        **Image (if applicable):** If the content is intended to accompany an image or if an image is a central part of the topic, analyse the image. Evaluate its relevance to the topic and how the content should relate to it. Then write the content accordingly.

        **Language:** ${language}.
    `;
  //   let prompt = `Create a ${contentType} on the topic of "${topic}".`;

  if (tone) {
    prompt += `**Tone:** ${tone}.`;
    // prompt += `* **Tone:** [Describe the desired emotional and attitudinal style of the writing. Examples: Informative, persuasive, casual, formal, enthusiastic, empathetic, humorous, serious.]`;
  }

  if (ageGroup) {
    prompt += `**Age:** ${ageGroup}.`;
  }

  if (brandVoice) {
    prompt += ` **Brand Voice:** ${brandVoice}.`;
  }

  if (objective) {
    prompt += `**Objective:** ${objective}.`;
  }

  prompt += `
        [END_PROMPT]
  `;

  return prompt;
}
