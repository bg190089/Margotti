import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Mic, MicOff, Upload, Zap, Copy, Download, Trash2, Filter, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APIConfigModal, type AIProvider } from "@/components/APIConfigModal";
import { CustomPromptsManager } from "@/components/CustomPromptsManager";
import { RichTextEditor } from "@/components/RichTextEditor";
import { SaveReportModal } from "@/components/SaveReportModal";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const EXAM_TYPES = [
  { id: "obstetrico", label: "🤰 Obstétrico", icon: "🤰" },
  { id: "abdome", label: "🫀 Abdome Total", icon: "🫀" },
  { id: "endovaginal", label: "🧬 Endovaginal", icon: "🧬" },
  { id: "tireoide", label: "🦋 Tireoide", icon: "🦋" },
  { id: "urinario", label: "💧 Rins e Vias Urinárias", icon: "💧" },
  { id: "mamas", label: "🎗️ Mamas", icon: "🎗️" },
];

const TEMPLATES: Record<string, string> = {
  obstetrico: `ULTRASSONOGRAFIA OBSTÉTRICA

Descrição Geral:
Imagem uterina gravídica normal, apresentando saco gestacional íntegro em cujo interior nota-se embrião/feto único, em situação e apresentação variáveis, com movimentos espontâneos e estimulados presentes.

Frequência Cardíaca Fetal: ___ bpm

Cavidade Amniótica: Volume normal para a idade gestacional, com maior bolsão de ___ cm.

Biometria Fetal:
• Comprimento crânio-nádegas (CCN): ___ mm
• Diâmetro biparietal (DBP): ___ mm
• Circunferência cefálica (CC): ___ mm
• Circunferência abdominal (CA): ___ mm
• Comprimento femoral (CF): ___ mm
• Peso fetal estimado: ___ g (Percentil ___)

Anexos Uterinos:
Anexos uterinos sem alterações. Vesícula vitelínica bem visualizada de aspecto habitual.

Placentografia:
Placentação ___ (anterior/posterior), homogênea, grau ___ de maturidade.

CONCLUSÃO:
Gestação tópica, única, com vitalidade fetal preservada, de ___ semanas e ___ dias datada pelo exame do dia com ___ semanas. Crescimento fetal adequado para a idade gestacional.`,
  
  abdome: `ULTRASSONOGRAFIA DE ABDOME TOTAL

Fígado:
Dimensões normais, ecogenicidade normal, contornos regulares. Sem dilatação de vias biliares. Sem lesões focais.

Vesícula Biliar:
Vesícula biliar ___, sem cálculos, sem espessamento de parede. Ausência de sinal de Murphy ultrassonográfico.

Pâncreas:
Pâncreas de aspecto normal, dimensões normais, ecogenicidade normal.

Baço:
Dimensões normais, ecogenicidade normal, sem alterações.

Rins e Vias Urinárias:
• Rim direito: Dimensões normais, ecogenicidade normal, sem dilatação pielocalicial
• Rim esquerdo: Dimensões normais, ecogenicidade normal, sem dilatação pielocalicial
• Bexiga: Paredes normais, sem cálculos

Aorta Abdominal:
Aorta abdominal de calibre normal, sem dilatação, sem trombose.

Cavidade Abdominal:
Não há coleção livre em cavidade abdominal.

CONCLUSÃO:
Exame de abdome total sem alterações significativas.`,
  
  endovaginal: `ULTRASSONOGRAFIA ENDOVAGINAL

Útero:
Dimensões normais, ecogenicidade normal, contornos regulares. Posição ___ (anteverso/retroverso).

Endométrio:
Espessura: ___ mm (normal para a fase do ciclo menstrual)
Aspecto: Homogêneo, sem alterações.

Ovários:
• Ovário direito: Dimensões normais, com folículos de aspecto normal
• Ovário esquerdo: Dimensões normais, com folículos de aspecto normal

Fundo de Saco de Douglas:
Sem coleção livre.

CONCLUSÃO:
Exame endovaginal sem alterações significativas.`,
  
  tireoide: `ULTRASSONOGRAFIA DE TIREOIDE

Glândula Tireoide:
Dimensões normais, ecogenicidade normal, contornos regulares e bem definidos.

Nódulos:
Não se visualizam nódulos.

Volume Glandular:
Não há aumento de volume glandular.

Linfonodos Cervicais:
Não há linfonodomegalia cervical.

CONCLUSÃO:
Glândula tireoide sem alterações significativas.`,
  
  urinario: `ULTRASSONOGRAFIA DE RINS E VIAS URINÁRIAS

Rim Direito:
Dimensões: ___ cm
Ecogenicidade: Normal
Contornos: Regulares
Dilatação pielocalicial: Ausente

Rim Esquerdo:
Dimensões: ___ cm
Ecogenicidade: Normal
Contornos: Regulares
Dilatação pielocalicial: Ausente

Bexiga:
Paredes normais, sem cálculos, sem espessamento.

Próstata (quando aplicável):
Dimensões normais, ecogenicidade normal.

CONCLUSÃO:
Exame de rins e vias urinárias sem alterações significativas.`,
  
  mamas: `ULTRASSONOGRAFIA DE MAMAS

Mama Direita:
Glândula mamária de ecogenicidade normal. Não se visualizam nódulos ou áreas de distorção arquitetural. Não há dilatação de ductos. Não há coleção.

Mama Esquerda:
Glândula mamária de ecogenicidade normal. Não se visualizam nódulos ou áreas de distorção arquitetural. Não há dilatação de ductos. Não há coleção.

Linfonodos Axilares:
Sem alterações.

CLASSIFICAÇÃO BI-RADS: ___
CLASSIFICAÇÃO TI-RADS: ___

CONCLUSÃO:
Exame de mamas sem alterações significativas.`
};

export default function MargottiAI() {
  const [selectedExam, setSelectedExam] = useState("obstetrico");
  const [inputData, setInputData] = useState("");
  const [generatedReport, setGeneratedReport] = useState("");
  const [editingReport, setEditingReport] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [classification, setClassification] = useState<"normal" | "patologico">("normal");
  const [observation, setObservation] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [activeTab, setActiveTab] = useState("editor");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateReportMutation = trpc.reports.generate.useMutation();
  const listReportsMutation = trpc.reports.list.useQuery({ examType: selectedExam !== "todos" ? selectedExam : undefined });
  const deleteReportMutation = trpc.reports.delete.useMutation();

  const handleGenerateReport = async () => {
    if (!inputData.trim()) {
      toast.error("Por favor, insira dados do exame");
      return;
    }

    const config = localStorage.getItem("margotti-ai-config");
    if (!config) {
      toast.error("Configure uma chave de API primeiro");
      return;
    }

    const { provider, apiKey } = JSON.parse(config);
    setIsGenerating(true);

    try {
      const result = await generateReportMutation.mutateAsync({
        provider: provider as AIProvider,
        apiKey,
        examType: selectedExam,
        data: inputData,
        template: TEMPLATES[selectedExam] || "",
        classification,
        observation: observation || undefined,
      });

      setGeneratedReport(result.content || "");
      setEditingReport(result.content || "");
      setIsEditing(false);
      toast.success("Laudo gerado com sucesso!");
      setInputData("");
    } catch (error) {
      toast.error("Erro ao gerar laudo. Verifique sua API Key.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartRecording = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Seu navegador não suporta gravação de voz");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputData((prev) => prev + " " + transcript);
    };

    recognition.onerror = () => {
      toast.error("Erro na transcrição de voz");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      // Aqui você poderia enviar a imagem para OCR ou análise
      setInputData((prev) => prev + "\n[Arquivo enviado: " + file.name + "]");
      toast.success("Arquivo carregado com sucesso");
    };
    reader.readAsText(file);
  };

  const handleCopyReport = () => {
    const textToCopy = isEditing ? editingReport : generatedReport;
    navigator.clipboard.writeText(textToCopy);
    toast.success("Laudo copiado para a área de transferência");
  };

  const handleSaveEdits = () => {
    setGeneratedReport(editingReport);
    setIsEditing(false);
    toast.success("Laudo atualizado com sucesso!");
  };

  const handleDiscardEdits = () => {
    setEditingReport(generatedReport);
    setIsEditing(false);
  };

  const handleDownloadPDF = () => {
    // Implementar download de PDF
    toast.info("Funcionalidade de PDF em desenvolvimento");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Margotti AI</h1>
          <p className="text-gray-300">Seu Assistente de Laudos Ultrassonográficos</p>
        </div>

        {/* Abas Principais */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700">
            <TabsTrigger value="editor" className="text-white">📝 Editor de Laudos</TabsTrigger>
            <TabsTrigger value="configuracao" className="text-white flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel Esquerdo - Seleção de Exame e Entrada de Dados */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seleção de Tipo de Exame */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Tipo de Exame</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {EXAM_TYPES.map((exam) => (
                    <Button
                      key={exam.id}
                      onClick={() => setSelectedExam(exam.id)}
                      variant={selectedExam === exam.id ? "default" : "outline"}
                      className={selectedExam === exam.id ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      {exam.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Entrada de Dados com Abas */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Dados do Exame</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="digitar" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                    <TabsTrigger value="digitar" className="text-white">✏️ Digitar</TabsTrigger>
                    <TabsTrigger value="gravar" className="text-white">🎙️ Gravar</TabsTrigger>
                    <TabsTrigger value="anexar" className="text-white">📎 Anexar</TabsTrigger>
                  </TabsList>

                  <TabsContent value="digitar" className="mt-4">
                    <Textarea
                      placeholder="Digite ou cole os dados do exame aqui..."
                      value={inputData}
                      onChange={(e) => setInputData(e.target.value)}
                      className="min-h-48 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                    />
                  </TabsContent>

                  <TabsContent value="gravar" className="mt-4">
                    <div className="flex flex-col items-center justify-center min-h-48 gap-4">
                      <Button
                        onClick={handleStartRecording}
                        disabled={isRecording}
                        size="lg"
                        className={isRecording ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="w-5 h-5 mr-2" />
                            Parar Gravação
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5 mr-2" />
                            Iniciar Gravação
                          </>
                        )}
                      </Button>
                      {isRecording && (
                        <p className="text-green-400 animate-pulse">● Gravando...</p>
                      )}
                      <Textarea
                        placeholder="A transcrição aparecerá aqui..."
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                        className="min-h-32 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="anexar" className="mt-4">
                    <div className="flex flex-col items-center justify-center min-h-48 gap-4 border-2 border-dashed border-slate-600 rounded-lg p-8">
                      <Upload className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-300 text-center">Clique para enviar uma imagem ou PDF do aparelho</p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        Selecionar Arquivo
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Botão Gerar Laudo (Fixo) */}
            <div className="sticky top-4 z-30">
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating || !inputData.trim()}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-6 text-lg shadow-lg"
              >
                <Zap className="w-6 h-6 mr-2" />
                {isGenerating ? "Gerando Laudo..." : "⚡ Gerar Laudo"}
              </Button>
            </div>
          </div>

          {/* Painel Direito - Laudo Gerado e Banco de Laudos */}
          <div className="space-y-6">
            {/* Laudo Gerado */}
            {generatedReport && (
              <Card className="bg-slate-800 border-slate-700 max-h-96 overflow-y-auto">
                <CardHeader>
                  <CardTitle className="text-white">Laudo Gerado</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <RichTextEditor
                      value={editingReport}
                      onChange={setEditingReport}
                      onSave={handleSaveEdits}
                      onCancel={handleDiscardEdits}
                    />
                  ) : (
                    <>
                      <div className="bg-slate-700 p-4 rounded text-white text-sm whitespace-pre-wrap mb-4">
                        {generatedReport}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setIsEditing(true)} size="sm" variant="outline" className="flex-1">
                          ✏️ Editar
                        </Button>
                        <Button onClick={handleCopyReport} size="sm" variant="outline" className="flex-1">
                          <Copy className="w-4 h-4 mr-1" />
                          Copiar
                        </Button>
                        <Button onClick={handleDownloadPDF} size="sm" variant="outline" className="flex-1">
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                        <Button onClick={() => setIsSaveModalOpen(true)} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                          Salvar
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Banco de Laudos */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Banco de Laudos</CardTitle>
                <CardDescription className="text-gray-400">Histórico de laudos gerados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setFilterType("todos")}
                    variant={filterType === "todos" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    Todos
                  </Button>
                  <Button
                    onClick={() => setFilterType("normal")}
                    variant={filterType === "normal" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    Normais
                  </Button>
                  <Button
                    onClick={() => setFilterType("patologico")}
                    variant={filterType === "patologico" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    Patológicos
                  </Button>
                </div>

                {listReportsMutation.data && listReportsMutation.data.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {listReportsMutation.data.map((report) => (
                      <div key={report.id} className="bg-slate-700 p-3 rounded text-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-white font-semibold">{report.examType}</p>
                            <p className="text-gray-400 text-xs">{new Date(report.createdAt).toLocaleDateString("pt-BR")}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-bold text-white ${report.classification === "normal" ? "bg-green-600" : "bg-red-600"}`}>
                            {report.classification === "normal" ? "Normal" : "Patológico"}
                          </span>
                        </div>
                        {report.observation && (
                          <p className="text-gray-300 text-xs mb-2">{report.observation}</p>
                        )}
                        <Button
                          onClick={() => deleteReportMutation.mutate({ reportId: report.id })}
                          size="sm"
                          variant="destructive"
                          className="w-full"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Deletar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert className="bg-slate-700 border-slate-600">
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                    <AlertDescription className="text-gray-400">
                      Nenhum laudo salvo ainda
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
            </div>
          </div>
          </TabsContent>

          <TabsContent value="configuracao" className="mt-6">
            <div className="max-w-4xl">
              <CustomPromptsManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Configuração de API */}
      <APIConfigModal />

      {/* Modal de Salvamento de Laudo */}
      <SaveReportModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        reportText={generatedReport}
        examType={selectedExam}
      />
    </div>
  );
}
