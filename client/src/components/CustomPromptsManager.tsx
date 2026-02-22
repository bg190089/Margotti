'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, Trash2, Edit2, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const EXAM_TYPES = [
  { id: 'geral', label: '⭐ Prompt Geral (Todos os Exames)' },
  { id: 'obstetrico', label: '🤰 Obstétrico' },
  { id: 'abdome', label: '🫀 Abdome Total' },
  { id: 'endovaginal', label: '🧬 Endovaginal' },
  { id: 'tireoide', label: '🦋 Tireoide' },
  { id: 'urinario', label: '💧 Rins e Vias Urinárias' },
  { id: 'mamas', label: '🎗️ Mamas' },
];

interface CustomPrompt {
  id: number;
  examType: string;
  promptText: string;
  createdAt: Date;
}

export function CustomPromptsManager() {
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedExam, setSelectedExam] = useState('geral');
  const [newPrompt, setNewPrompt] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [prompts, setPrompts] = useState<CustomPrompt[]>([]);

  const createPromptMutation = trpc.customPrompts.create.useMutation();
  const listPromptsMutation = trpc.customPrompts.list.useQuery({ examType: selectedExam });
  const deletePromptMutation = trpc.customPrompts.delete.useMutation();
  const updatePromptMutation = trpc.customPrompts.update.useMutation();

  useEffect(() => {
    if (listPromptsMutation.data) {
      setPrompts(listPromptsMutation.data as any);
    }
  }, [listPromptsMutation.data]);

  const handleUnlock = () => {
    if (password === 'margotti') {
      setIsLocked(false);
      setPassword('');
      toast.success('Painel desbloqueado!');
    } else {
      toast.error('Senha incorreta!');
      setPassword('');
    }
  };

  const handleLock = () => {
    setIsLocked(true);
    setPassword('');
    setEditingId(null);
    setEditingText('');
    toast.info('Painel bloqueado');
  };

  const handleAddPrompt = async () => {
    if (!newPrompt.trim()) {
      toast.error('Digite um prompt antes de salvar');
      return;
    }

    try {
      await createPromptMutation.mutateAsync({
        examType: selectedExam,
        prompt: newPrompt,
      });
      setNewPrompt('');
      listPromptsMutation.refetch();
      toast.success('Prompt adicionado com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar prompt');
    }
  };

  const handleDeletePrompt = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este prompt?')) return;

    try {
      await deletePromptMutation.mutateAsync({ promptId: id });
      listPromptsMutation.refetch();
      toast.success('Prompt deletado com sucesso!');
    } catch (error) {
      toast.error('Erro ao deletar prompt');
    }
  };

  const handleUpdatePrompt = async (id: number) => {
    if (!editingText.trim()) {
      toast.error('O prompt não pode estar vazio');
      return;
    }

    try {
      await updatePromptMutation.mutateAsync({
        promptId: id,
        prompt: editingText,
      });
      setEditingId(null);
      setEditingText('');
      listPromptsMutation.refetch();
      toast.success('Prompt atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar prompt');
    }
  };

  return (
    <div className="space-y-6">
      {/* Lock/Unlock Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {isLocked ? <Lock className="w-5 h-5 text-red-500" /> : <Unlock className="w-5 h-5 text-green-500" />}
            Painel de Controle de Prompts
          </CardTitle>
          <CardDescription className="text-gray-400">
            {isLocked ? 'Painel bloqueado por segurança' : 'Painel desbloqueado - você pode editar prompts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLocked ? (
            <div className="space-y-4">
              <Alert className="bg-red-900/20 border-red-700">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-300">
                  Digite a senha para desbloquear o painel de controle
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                    placeholder="Digite a senha..."
                    className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-400 rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button onClick={handleUnlock} className="w-full bg-blue-600 hover:bg-blue-700">
                  🔓 Desbloquear Painel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-green-400 font-semibold">✓ Painel desbloqueado</p>
              <Button onClick={handleLock} variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                🔒 Bloquear Painel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content - Only visible when unlocked */}
      {!isLocked && (
        <>
          {/* Add New Prompt Section */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Adicionar Novo Prompt
              </CardTitle>
              <CardDescription className="text-gray-400">
                Crie instruções personalizadas para a IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Exame</label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {EXAM_TYPES.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id} className="text-white">
                        {exam.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Seu Prompt</label>
                <Textarea
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Ex: Quando houver mioma, descrever como: 'Mioma intramural de ___ cm, sem alterações degenerativas'"
                  className="min-h-32 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-2">
                  💡 Dica: Use ___ para campos que serão preenchidos automaticamente
                </p>
              </div>

              <Button onClick={handleAddPrompt} className="w-full bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Salvar Prompt
              </Button>
            </CardContent>
          </Card>

          {/* Prompts List Section */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                Prompts Salvos para {EXAM_TYPES.find((e) => e.id === selectedExam)?.label}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} salvo{prompts.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prompts.length === 0 ? (
                <Alert className="bg-slate-700 border-slate-600">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  <AlertDescription className="text-gray-400">
                    Nenhum prompt adicionado para este exame ainda. Crie um novo prompt acima!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {prompts.map((prompt: any) => (
                    <div
                      key={prompt.id}
                      className="bg-slate-700 border border-slate-600 rounded p-4 hover:border-slate-500 transition"
                    >
                      {editingId === prompt.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="min-h-24 bg-slate-600 border-slate-500 text-white"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleUpdatePrompt(prompt.id)}
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              ✓ Salvar Edição
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingId(null);
                                setEditingText('');
                              }}
                              size="sm"
                              variant="outline"
                              className="flex-1 border-slate-600 text-white hover:bg-slate-600"
                            >
                              ✕ Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-white text-sm whitespace-pre-wrap mb-3">{prompt.promptText}</p>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setEditingId(prompt.id);
                                setEditingText(prompt.prompt);
                              }}
                              size="sm"
                              variant="outline"
                              className="flex-1 border-slate-600 text-white hover:bg-slate-600"
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleDeletePrompt(prompt.id)}
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Deletar
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Criado em: {new Date(prompt.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Section */}
          <Alert className="bg-blue-900/20 border-blue-700">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              <strong>Como funciona:</strong> Os prompts que você adicionar aqui serão automaticamente incluídos quando a IA
              gerar laudos. Use prompts gerais para instruções que se aplicam a todos os exames, ou específicos para cada tipo.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
