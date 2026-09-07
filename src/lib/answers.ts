/** 입력된 텍스트에서 영어 단어 수만 센다. 답변의 품질을 평가하지 않는다. */
export function countEnglishWords(text: string): number {
  return (text.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) ?? []).length;
}
