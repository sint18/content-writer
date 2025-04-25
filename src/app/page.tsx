"use client";
import type React from "react";

import { useState, useRef } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateContent } from "@/lib/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const contentTypes = {
  "blog-post": "Blog Post",
  "social-media": "Social Media Post",
  "product-description": "Product Description",
  email: "Email",
  "ad-copy": "Ad Copy",
};

const tones = {
  professional: "Professional",
  casual: "Casual",
  humorous: "Humorous",
  formal: "Formal",
  persuasive: "Persuasive",
};

const ageGroups = {
  general: "General Audience",
  children: "Children (7-12)",
  teenagers: "Teenagers (13-17)",
  adults: "Adults (18+)",
  seniors: "Seniors (65+)",
};

const objectives = {
  awareness: "Brand Awareness",
  conversion: "Conversion",
  engagement: "Engagement",
  education: "Education",
  fundraising: "Fundraising",
  loyalty: "Customer Loyalty",
  lead: "Lead Generation",
};

export default function ContentGenerator() {
  // Get the generated content from cookies if available
  // const generatedContent =
  //   (await cookies()).get("generatedContent")?.value || "";
  const generatedContent = ""; // Placeholder for generated content
  const [generatedContentState, setGeneratedContentState] = useState("");
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("blog-post");
  const [tone, setTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [ageGroup, setAgeGroup] = useState("general");
  const [brandVoice, setBrandVoice] = useState("");
  const [objective, setObjective] = useState("awareness");
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setImage(event.target.result);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const copyToClipboardClient = () => {
    navigator.clipboard.writeText(generatedContentState);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);

    const formData = new FormData(e.currentTarget);
    formData.append("topic", topic);
    formData.append("contentType", contentType);
    formData.append("tone", tone);
    formData.append("ageGroup", ageGroup);
    formData.append("brandVoice", brandVoice);
    formData.append("objective", objective);

    if (image) {
      formData.append("image", image);
    }

    try {
      const result = await generateContent(formData);
      console.log(result);
      setGeneratedContentState(result.content || "");

      toast({
        title: "Content generated",
        description: "Your content has been generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error generating content",
        description: "There was an error generating your content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Content Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Generate Content</CardTitle>
            <CardDescription>
              Fill in the details below to generate your content
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="image" value={image || ""} />
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic or Keywords</Label>
                <Textarea
                  id="topic"
                  name="topic"
                  placeholder="Enter your topic or keywords"
                  className="min-h-[80px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandVoice">Brand Voice (Optional)</Label>
                <Textarea
                  id="brandVoice"
                  name="brandVoice"
                  placeholder="Paste examples of your brand voice to clone the style"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Content Objective</Label>
                <Select name="objective" defaultValue="awareness">
                  <SelectTrigger id="objective">
                    <SelectValue placeholder="Select an objective" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(objectives).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Content Type</Label>
                <RadioGroup
                  defaultValue="blog-post"
                  name="contentType"
                  className="grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                  {Object.entries(contentTypes).map(([value, label]) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={value}
                        id={`content-type-${value}`}
                      />
                      <Label htmlFor={`content-type-${value}`}>{label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <RadioGroup
                  defaultValue="professional"
                  name="tone"
                  className="grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                  {Object.entries(tones).map(([value, label]) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`tone-${value}`} />
                      <Label htmlFor={`tone-${value}`}>{label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Target Age Group</Label>
                <RadioGroup
                  defaultValue="general"
                  name="ageGroup"
                  className="grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                  {Object.entries(ageGroups).map(([value, label]) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`age-group-${value}`} />
                      <Label htmlFor={`age-group-${value}`}>{label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUpload">Upload an Image (Optional)</Label>
                <input
                  type="file"
                  id="imageUpload"
                  name="imageUpload"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size > 4 * 1024 * 1024) {
                      toast({
                        title: "File too large",
                        description: "Please upload an image smaller than 4 MB",
                        variant: "destructive",
                      });
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                      return;
                    }
                    handleImageChange(e);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                {image && (
                  <div className="mt-4">
                    <img
                      src={image}
                      alt="Uploaded preview"
                      className="max-w-full h-auto rounded-md"
                    />
                    <Button
                      type="button"
                      onClick={removeImage}
                      className="mt-2"
                      variant="outline"
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </div>

              {/* Note: Image upload requires client-side JavaScript, so we'll omit it in this server component version */}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Generate Content
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>Your content will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[300px] max-h-[500px] overflow-y-auto border rounded-md p-4">
              {generatedContentState ? (
                <div className="whitespace-pre-wrap">{generatedContentState}</div>
              ) : (
                <div className="text-muted-foreground text-center h-full flex items-center justify-center">
                  Generated content will appear here
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={copyToClipboardClient}
              className="w-full"
              disabled={!generatedContentState}
              variant="outline"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
