import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  // Nota: A configuração no vite.config.ts substitui process.env.API_KEY pelo valor real
  if (!process.env.API_KEY) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateMonitoringReport = async (
  patientName: string,
  month: string,
  occurrences: string,
  hours: number
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Erro: Chave de API não configurada.";

  try {
    const prompt = `
      Atue como um enfermeiro auditor sênior de Home Care.
      Gere um resumo clínico executivo e profissional para o relatório mensal do paciente.
      
      Dados do Paciente: ${patientName}
      Mês de Referência: ${month}
      Horas Totais de Assistência: ${hours}
      
      Ocorrências e Evolução bruta relatada pela equipe:
      "${occurrences}"
      
      O texto deve ser formal, focado na evolução clínica, estabilidade do quadro e intercorrências relevantes. 
      Use português do Brasil culto. Máximo de 1 parágrafo denso.
    `;

    // Correção: Uso correto da SDK @google/genai
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar o relatório.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Erro ao gerar análise com IA. Verifique a conexão.";
  }
};