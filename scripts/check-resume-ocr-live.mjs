import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { createCanvas } from "@napi-rs/canvas";
import OpenAI from "openai";
import { PDFDocument } from "pdf-lib";

if (existsSync(".env.local")) loadEnvFile(".env.local");
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required for the live resume OCR check.");

const canvas = createCanvas(1200, 1600);
const context = canvas.getContext("2d");
context.fillStyle = "white";
context.fillRect(0, 0, 1200, 1600);
context.fillStyle = "black";
context.font = "bold 54px Arial";
context.fillText("Grace Hopper", 90, 170);
context.font = "38px Arial";
context.fillText("Computer Scientist and United States Navy Rear Admiral", 90, 250);
context.fillText("COBOL compiler pioneer", 90, 330);

const pdf = await PDFDocument.create();
const page = pdf.addPage([600, 800]);
const image = await pdf.embedPng(await canvas.encode("png"));
page.drawImage(image, { x: 0, y: 0, width: 600, height: 800 });
const bytes = await pdf.save();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 1, timeout: 45_000 });
const response = await client.responses.create({
  model: process.env.OPENAI_MODEL ?? "gpt-5.6-terra",
  instructions: "Transcribe all visible text exactly. Return only plain text.",
  input: [{
    role: "user",
    content: [
      {
        type: "input_file",
        filename: "synthetic-resume.pdf",
        file_data: `data:application/pdf;base64,${Buffer.from(bytes).toString("base64")}`,
        detail: "high",
      },
      { type: "input_text", text: "Transcribe this resume page." },
    ],
  }],
  store: false,
  max_output_tokens: 1_000,
});

const normalized = response.output_text.toLowerCase();
if (!normalized.includes("grace hopper") || !normalized.includes("cobol")) {
  throw new Error("Live OCR did not return the expected synthetic text.");
}

console.log("Live resume OCR check passed.");
