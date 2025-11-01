export type CharacterSetKey = "traditional" | "simplified";

const CONVERTER_TARGETS: Record<CharacterSetKey, string> = {
  traditional: "Traditional",
  simplified: "Simplified",
};

interface ZhConvertResponse {
  data?: {
    text?: string;
  };
}

export async function convertCharacterSet(
  text: string,
  target: CharacterSetKey
): Promise<string> {
  if (!text) {
    return "";
  }

  const url = new URL("https://api.zhconvert.org/convert");
  url.searchParams.set("converter", CONVERTER_TARGETS[target]);
  url.searchParams.set("text", text);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(
      `Conversion request failed with status ${response.status}`
    );
  }

  const data: ZhConvertResponse = await response.json();
  const convertedText = data?.data?.text;

  if (typeof convertedText !== "string") {
    throw new Error("Unexpected response format from conversion API");
  }

  return convertedText;
}
