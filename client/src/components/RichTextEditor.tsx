'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Type, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export function RichTextEditor({ value, onChange, onSave, onCancel }: RichTextEditorProps) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (!selectedText) {
      toast.error('Selecione um texto para formatar');
      return;
    }

    const newValue =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newValue);

    // Restore selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleBold = () => applyFormatting('**', '**');
  const handleItalic = () => applyFormatting('*', '*');
  const handleHeading = () => applyFormatting('\n# ', '\n');
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copiado para a área de transferência!');
  };

  const increaseFontSize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const currentSize = parseInt(window.getComputedStyle(textarea).fontSize);
      textarea.style.fontSize = (currentSize + 2) + 'px';
    }
  };

  const decreaseFontSize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const currentSize = parseInt(window.getComputedStyle(textarea).fontSize);
      if (currentSize > 12) {
        textarea.style.fontSize = (currentSize - 2) + 'px';
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 bg-slate-700 p-3 rounded border border-slate-600">
        <Button
          onClick={handleBold}
          size="sm"
          variant="outline"
          className="border-slate-600 text-white hover:bg-slate-600"
          title="Negrito (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>

        <Button
          onClick={handleItalic}
          size="sm"
          variant="outline"
          className="border-slate-600 text-white hover:bg-slate-600"
          title="Itálico (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Button
          onClick={handleHeading}
          size="sm"
          variant="outline"
          className="border-slate-600 text-white hover:bg-slate-600"
          title="Título"
        >
          <Type className="w-4 h-4" />
        </Button>

        <div className="border-l border-slate-600"></div>

        <Button
          onClick={decreaseFontSize}
          size="sm"
          variant="outline"
          className="border-slate-600 text-white hover:bg-slate-600"
          title="Diminuir tamanho"
        >
          A-
        </Button>

        <Button
          onClick={increaseFontSize}
          size="sm"
          variant="outline"
          className="border-slate-600 text-white hover:bg-slate-600"
          title="Aumentar tamanho"
        >
          A+
        </Button>

        <div className="border-l border-slate-600"></div>

        <Button
          onClick={handleCopy}
          size="sm"
          variant="outline"
          className="border-slate-600 text-white hover:bg-slate-600"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copiar
            </>
          )}
        </Button>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-96 bg-slate-700 border border-slate-600 text-white placeholder-gray-400 rounded p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Edite o laudo aqui..."
      />

      {/* Preview */}
      <div className="bg-slate-700 border border-slate-600 rounded p-4 max-h-64 overflow-y-auto">
        <p className="text-gray-400 text-xs mb-2">PRÉVIA:</p>
        <div className="text-white text-sm whitespace-pre-wrap break-words">
          {value.split('\n').map((line, i) => {
            // Renderizar markdown básico
            let rendered = line;
            rendered = rendered.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            rendered = rendered.replace(/\*(.*?)\*/g, '<em>$1</em>');

            return (
              <div key={i} className="mb-1">
                {rendered.startsWith('# ') ? (
                  <h3 className="font-bold text-lg">{rendered.substring(2)}</h3>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: rendered }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      {(onSave || onCancel) && (
        <div className="flex gap-2">
          {onSave && (
            <Button
              onClick={onSave}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              ✓ Salvar Edições
            </Button>
          )}
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-slate-600 text-white hover:bg-slate-700"
            >
              ✕ Cancelar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
