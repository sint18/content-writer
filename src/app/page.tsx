"use client";
import type React from "react";
import { useState, useRef, useTransition } from "react";
import { Copy, Loader2 } from "lucide-react";
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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

const languages = {
  english: "English",
  burmese: "Burmese",
  // spanish: "Spanish",
  // french: "French",
  // german: "German",
  // italian: "Italian",
  // chinese: "Chinese",
  // japanese: "Japanese",
  // korean: "Korean",
};

const formSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  contentType: z.string().min(1, "Content type is required"),
  tone: z.string().min(1, "Tone is required"),
  ageGroup: z.string().min(1, "Age group is required"),
  brandVoice: z.string().optional(),
  objective: z.string().min(1, "Objective is required"),
  language: z.string().min(1, "Language is required"),
});

export default function ContentGenerator() {
  const [isPending, startTransition] = useTransition();
  const [generatedContentState, setGeneratedContentState] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      contentType: "blog-post",
      tone: "professional",
      ageGroup: "general",
      brandVoice: "",
      objective: "awareness",
      language: "english",
    },
  });

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

  const copyToClipboardClient = () => {
    navigator.clipboard.writeText(generatedContentState);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard",
    });
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      if (fileInputRef.current && fileInputRef.current.files?.[0]) {
        const file = fileInputRef.current.files[0];
        formData.append("imageFile", file, file.name);
      }

      try {
        const result = await generateContent(formData);
        setGeneratedContentState(result.content || "");

        toast({
          title: "Content generated",
          description: "Your content has been generated successfully",
        });
      } catch (error) {
        console.error("Error generating content:", error);
        toast({
          title: "Error generating content",
          description: "There was an error generating your content",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Content Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Generate Content</CardTitle>
            <CardDescription>
              Fill in the details below to generate your content
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic or Keywords</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter your topic or keywords"
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandVoice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Voice (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Paste examples of your brand voice to clone the style"
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="objective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Objective</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          defaultValue="awareness"
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an objective" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(objectives).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          {...field}
                          className="grid grid-cols-1 md:grid-cols-2 gap-2"
                        >
                          {Object.entries(contentTypes).map(
                            ([value, label]) => (
                              <div
                                key={value}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={value}
                                  id={`content-type-${value}`}
                                />
                                <Label htmlFor={`content-type-${value}`}>
                                  {label}
                                </Label>
                              </div>
                            )
                          )}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          {...field}
                          className="grid grid-cols-1 md:grid-cols-2 gap-2"
                        >
                          {Object.entries(tones).map(([value, label]) => (
                            <div
                              key={value}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={value}
                                id={`tone-${value}`}
                              />
                              <Label htmlFor={`tone-${value}`}>{label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ageGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Age Group</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          {...field}
                          className="grid grid-cols-1 md:grid-cols-2 gap-2"
                        >
                          {Object.entries(ageGroups).map(([value, label]) => (
                            <div
                              key={value}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={value}
                                id={`age-group-${value}`}
                              />
                              <Label htmlFor={`age-group-${value}`}>
                                {label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          defaultValue="english"
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(languages).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Label htmlFor="imageUpload">
                    Upload an Image (Optional)
                  </Label>
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
                          description:
                            "Please upload an image smaller than 4 MB",
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
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Generating..." : "Generate Content"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>Your content will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[300px] max-h-[75vh] overflow-y-auto border rounded-md p-4">
              {isPending ? (
                <div className="text-muted-foreground text-center h-full flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 size-6" />
                  Generating content...
                </div>
              ) : generatedContentState ? (
                <div className="prose prose-md">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {generatedContentState}
                  </ReactMarkdown>
                </div>
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
