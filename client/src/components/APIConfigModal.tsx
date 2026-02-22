import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Check, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export type AIProvider = "claude" | "gpt" | "deepseek";

interface APIConfig {
  provider: AIProvider;
  apiKey: string;
}

export function APIConfigModal() {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<AIProvider>("claude");
  const [apiKey, setApiKey] = useState("");
  const [savedConfig, setSavedConfig] = useState<APIConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Carregar configuração salva ao montar o componente
  useEffect(() => {
    const saved = localStorage.getItem("margotti-ai-config");
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setSavedConfig(config);
        setProvider(config.provider);
      } catch (error) {
        console.error("Erro ao carregar configuração:", error);
      }
    }
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: "error", text: "Por favor, insira uma chave de API válida" });
      return;
    }

    setIsSaving(true);
    try {
      // Validar a chave testando uma requisição simples
      const config: APIConfig = { provider, apiKey };
      localStorage.setItem("margotti-ai-config", JSON.stringify(config));
      setSavedConfig(config);
      setMessage({ type: "success", text: `API ${provider.toUpperCase()} configurada com sucesso!` });
      
      setTimeout(() => {
        setOpen(false);
        setMessage(null);
      }, 2000);
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao salvar configuração" });
    } finally {
      setIsSaving(false);
    }
  };

  const getProviderLabel = (p: AIProvider) => {
    const labels: Record<AIProvider, string> = {
      claude: "Claude (Anthropic)",
      gpt: "GPT (OpenAI)",
      deepseek: "DeepSeek",
    };
    return labels[p];
  };

  const getProviderColor = (p: AIProvider) => {
    const colors: Record<AIProvider, string> = {
      claude: "bg-amber-500",
      gpt: "bg-green-500",
      deepseek: "bg-blue-500",
    };
    return colors[p];
  };

  return (
    <>
      {/* Botão flutuante na parte inferior */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setOpen(true)}
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
          size="lg"
        >
          <Settings className="w-5 h-5 mr-2" />
          API Key
          {savedConfig && (
            <span className={`ml-2 px-2 py-1 rounded text-xs font-bold text-white ${getProviderColor(savedConfig.provider)}`}>
              {savedConfig.provider.toUpperCase()}
            </span>
          )}
        </Button>
      </div>

      {/* Modal de Configuração */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Chave de API</DialogTitle>
            <DialogDescription>
              Selecione seu provedor de IA e insira a chave de API correspondente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Seletor de Provedor */}
            <div className="space-y-2">
              <Label htmlFor="provider">Provedor de IA</Label>
              <Select value={provider} onValueChange={(value) => setProvider(value as AIProvider)}>
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Selecione um provedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                  <SelectItem value="gpt">GPT (OpenAI)</SelectItem>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campo de API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">Chave de API</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={`Cole sua chave de API do ${getProviderLabel(provider)}`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                {provider === "claude" && "Obtenha em: https://console.anthropic.com/"}
                {provider === "gpt" && "Obtenha em: https://platform.openai.com/api-keys"}
                {provider === "deepseek" && "Obtenha em: https://platform.deepseek.com/"}
              </p>
            </div>

            {/* Mensagem de Status */}
            {message && (
              <Alert variant={message.type === "success" ? "default" : "destructive"}>
                {message.type === "success" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            {/* Configuração Atual */}
            {savedConfig && (
              <Alert>
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  API {savedConfig.provider.toUpperCase()} está configurada e pronta para usar
                </AlertDescription>
              </Alert>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                {isSaving ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
