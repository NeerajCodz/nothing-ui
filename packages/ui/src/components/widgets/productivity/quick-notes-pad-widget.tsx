import * as React from 'react';
import { cn } from '../../../lib/cn';
import {
  type NoteChecklistItem,
  serializeNotesToMarkdown,
} from '../../../lib/widgets/utility-widget-logic';

const INITIAL_CHECKLIST: NoteChecklistItem[] = [
  { id: 'n1', text: 'Ship Analog, Flip, Binary, Word, and Radial clocks', done: true },
  { id: 'n2', text: 'Verify 100% React Native spec parity across widgets', done: true },
  { id: 'n3', text: 'Audit dark OLED contrast before release', done: false },
];

export interface QuickNotesPadWidgetProps {
  defaultTitle?: string;
  defaultBody?: string;
  className?: string;
}

export function QuickNotesPadWidget({
  defaultTitle = 'Hardware Release Scratchpad',
  defaultBody = 'Keep dial hands high contrast. Use tabular numerals across every readout.',
  className,
}: QuickNotesPadWidgetProps) {
  const [title, setTitle] = React.useState(defaultTitle);
  const [body, setBody] = React.useState(defaultBody);
  const [pinned, setPinned] = React.useState(true);
  const [checklist, setChecklist] = React.useState<NoteChecklistItem[]>(INITIAL_CHECKLIST);
  const [newTask, setNewTask] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  };

  const addTask = () => {
    const clean = newTask.trim();
    if (!clean) return;
    setChecklist((prev) => [...prev, { id: `task-${Date.now()}`, text: clean, done: false }]);
    setNewTask('');
  };

  const copyMarkdown = () => {
    const md = serializeNotesToMarkdown(title, body, checklist);
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(md).catch(() => {});
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const doneCount = checklist.filter((i) => i.done).length;

  return (
    <section
      aria-label="Sticky Dot-Grid Notes"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Note title"
            className="w-full bg-transparent text-sm font-semibold tracking-tight text-[var(--nt-display)] focus:outline-none"
          />
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 font-mono tabular-nums">
            {doneCount}/{checklist.length} done · {pinned ? 'Pinned to deck' : 'Unpinned'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setPinned((p) => !p)}
            aria-pressed={pinned}
            className={cn(
              'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
              pinned
                ? 'border-[var(--nt-accent)] text-[var(--nt-accent)]'
                : 'border-[var(--nt-line)] text-[var(--nt-muted)]',
            )}
          >
            {pinned ? 'Pinned' : 'Pin'}
          </button>
          <button
            type="button"
            onClick={copyMarkdown}
            className="px-2.5 py-1 text-xs font-mono rounded-lg bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] whitespace-nowrap shrink-0"
          >
            {copied ? 'Copied MD' : 'Copy MD'}
          </button>
        </div>
      </div>

      {/* Dot-grid textured note canvas */}
      <div
        className="mt-4 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-3.5 space-y-3"
        style={{
          backgroundImage: 'radial-gradient(var(--nt-line-2) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          aria-label="Scratchpad note text"
          className="w-full resize-none rounded-lg bg-[var(--nt-surface)]/85 border border-[var(--nt-line)] p-2.5 text-xs leading-relaxed text-[var(--nt-display)] focus:outline-none"
        />

        <div className="space-y-1.5">
          {checklist.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2.5 rounded-lg bg-[var(--nt-surface)]/90 border border-[var(--nt-line)] px-2.5 py-1.5 text-xs cursor-pointer"
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleItem(item.id)}
                className="accent-[var(--nt-accent)]"
              />
              <span className={cn(item.done && 'line-through text-[var(--nt-muted)]')}>
                {item.text}
              </span>
            </label>
          ))}
        </div>

        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addTask();
          }}
        >
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add checklist item..."
            aria-label="New checklist task"
            className="flex-1 min-w-0 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-2.5 py-1.5 text-xs text-[var(--nt-display)] placeholder:text-[var(--nt-muted)]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] text-[var(--nt-display)] whitespace-nowrap shrink-0"
          >
            Add
          </button>
        </form>
      </div>
    </section>
  );
}
