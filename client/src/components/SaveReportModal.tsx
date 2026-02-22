'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Save, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface SaveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportText: string;
  examType: string;
}

export function SaveReportModal({ isOpen, onClose, reportText, examType }: SaveReportModalProps) {
  const [classification, setClassification] = useState<'normal' | 'patologico'>('normal');
  const [title, setTitle] = useState('');
  const [observation, setObservation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const saveReportMutation = trpc.reports.save.useMutation();

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Digite um título para o laudo');
      return;
    }

    setIsSaving(true);
    try {
      await saveReportMutation.mutateAsync({
        examType,
        reportText,
        classification,
        title,
        observation,
      });

      toast.success('Laudo salvo com sucesso no Supabase!');
      setTitle('');
      setObservation('');
      setClassification('normal');
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar laudo');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Save className="w-5 h-5" />
              Salvar Laudo no Banco de Dados
            </CardTitle>
            <CardDescription className="text-gray-400">
              Salve este laudo no Supabase para aprimorar a IA
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info Alert */}
          <Alert className="bg-blue-900/20 border-blue-700">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              Cada laudo que você salva ajuda a IA a aprender seus padrões e melhorar continuamente
            </AlertDescription>
          </Alert>

          {/* Classification */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Classificação do Laudo
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="classification"
                  value="normal"
                  checked={classification === 'normal'}
                  onChange={(e) => setClassification(e.target.value as 'normal' | 'patologico')}
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-white">
                  ✓ Normal
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="classification"
                  value="patologico"
                  checked={classification === 'patologico'}
                  onChange={(e) => setClassification(e.target.value as 'normal' | 'patologico')}
                  className="w-4 h-4 accent-red-500"
                />
                <span className="text-white">
                  ⚠️ Patológico
                </span>
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título do Laudo *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Obstétrico 28 semanas - Crescimento adequado"
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-400 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Este título aparecerá no seu Banco de Laudos
            </p>
          </div>

          {/* Observation */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Observações (Opcional)
            </label>
            <Textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ex: Paciente com antecedente de mioma, acompanhamento de crescimento fetal..."
              className="min-h-24 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prévia do Laudo
            </label>
            <div className="bg-slate-700 border border-slate-600 rounded p-4 max-h-48 overflow-y-auto">
              <p className="text-white text-sm whitespace-pre-wrap break-words">
                {reportText}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar no Banco de Dados
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-600 text-white hover:bg-slate-700"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
