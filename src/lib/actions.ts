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

You will be provided with necessary details in the user prompt to create the content for each request.

** OUTPUT FORMAT:**
For every response, follow this markdown format template. 
All output must be nicely formatted in markdown using headings, bullet points, and other formatting elements to enhance readability. 
Do not include any text or explanation before or after this format template.

**Content Type:** [Specify the type of content that was generated, based on the user's request.]\n

### Best Titles
[Brainstorm and provide the best 5 clickable, scroll-stopping, and relevant titles for the generated content.]\n

### Content 
[Write the main content body based on the provided topic, content type, tone, age group, brand voice, and objective. Ensure it is engaging and relevant to the audience and integrates the Image Description if applicable.]\n

**CTA:** [Include a clear call to action that aligns with the content type and objective.]\n
**Image Description:** [Repeat the user-provided description of the image if one was given in the user prompt, or state "Not applicable" if no image description was provided.]\n

**Instructions for Content Generation:**
1.  Generate content based on the provided Topic, Content Type, and Objective from the user prompt.
2.  Ensure the content is tailored to the specified Audience Age and Tone from the user prompt.
3.  Strictly adhere to the described Brand Voice throughout the writing, as provided in the user prompt.
4.  If an Image Description is provided in the user prompt, integrate the content seamlessly with the visual element and repeat the description in the designated field in the output format.
5.  Only the actual content body (**Content:** section) and the information within the other markdown fields should be in the provided language.
6.  Review and refine the output to ensure it is high-quality, engaging, and free of grammatical errors or typos.
7.  Ensure the generated text is human-like and natural sounding.
8.  Avoid using the phrase "As an AI language model" or similar self-referential phrases.
9.  Avoid using AI jargon or similar technical phrases related to AI capabilities.
10. **Strictly adhere to and only provide the content within the specified OUTPUT FORMAT template.** Do not add any introductory or concluding remarks outside of this format.
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
            responseMimeType: "text/plain",
            systemInstruction: [
              {
                text: systemInstruction,
              },
            ],
          },
        });
        revalidatePath("/");
        return { content: response.text };
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: [createUserContent([prompt])],
        config: {
          responseMimeType: "text/plain",
          systemInstruction: [
            {
              text: systemInstruction,
            },
          ],
        },
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

  return prompt;
}
