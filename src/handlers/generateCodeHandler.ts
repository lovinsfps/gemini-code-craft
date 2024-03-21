import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import getToken from "./tokenHandler";
import * as vscode from "vscode";

const MODEL_NAME = "gemini-pro";

const generateCode = async (
  selectedText: string,
  language: string,
  prePrompt: string,
): Promise<string> => {
  const API_KEY = getToken();
  if (!API_KEY) {
    vscode.window.showErrorMessage(
      "Please set a token before continuing."
    );
    return "";
  }

  const isGenerating = vscode.workspace
    .getConfiguration("generateCodeUsingGemini")
    .get("isGenerating") as boolean;

  if (isGenerating) {
    return "";
  }

  vscode.window.showInformationMessage(prePrompt == "" ? "Executing prompt..." : "Crafting code...");

  vscode.workspace
    .getConfiguration("generateCodeUsingGemini")
    .update("isGenerating", true, true);

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const parts = [
    { text: selectedText },
    { text: prePrompt == "" ? `` : `language: ${language}` },
    {
      text: prePrompt,
    },
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
    safetySettings,
  });
  const response = result.response.text();
  vscode.workspace
    .getConfiguration("generateCodeUsingGemini")
    .update("isGenerating", false, true);
  vscode.window.showInformationMessage(prePrompt == "" ? "Prompt executed" : "Code Crafted!");
  return response;
};

export default generateCode;
