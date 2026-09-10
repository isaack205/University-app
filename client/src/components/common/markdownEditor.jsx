// Imports
import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BoldIcon,
  ItalicIcon,
  HeadingIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  CodeIcon,
  EyeIcon,
  PenLineIcon,
  SparklesIcon,
} from "lucide-react";

export default function MarkdownEditor({
  id = "markdown-editor",
  label = "Description",
  value = "",
  onChange,
  placeholder = "Write description here… (Markdown supported)",
  disabled = false,
  rows = 4,
  error = null,
}) {
  const [activeTab, setActiveTab] = useState("write");
  const textareaRef = useRef(null);

  // Helper to insert markdown syntax at current cursor position
  const insertMarkdown = (prefix, suffix = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${prefix}${selectedText || "text"}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    // Restore focus & cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 4)
      );
    }, 0);
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        {label && (
          <Label htmlFor={id} className="text-sm font-semibold flex items-center gap-1.5">
            {label}
            <span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              Markdown
            </span>
          </Label>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/40 p-1 rounded-t-lg border border-b-0 border-input">
          {/* Toolbar Buttons */}
          <div className="flex flex-wrap items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Bold (**text**)"
              onClick={() => insertMarkdown("**", "**")}
              disabled={disabled || activeTab === "preview"}
            >
              <BoldIcon className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Italic (*text*)"
              onClick={() => insertMarkdown("*", "*")}
              disabled={disabled || activeTab === "preview"}
            >
              <ItalicIcon className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Heading (### Heading)"
              onClick={() => insertMarkdown("### ", "")}
              disabled={disabled || activeTab === "preview"}
            >
              <HeadingIcon className="h-3.5 w-3.5" />
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Bullet List (- item)"
              onClick={() => insertMarkdown("- ", "")}
              disabled={disabled || activeTab === "preview"}
            >
              <ListIcon className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Numbered List (1. item)"
              onClick={() => insertMarkdown("1. ", "")}
              disabled={disabled || activeTab === "preview"}
            >
              <ListOrderedIcon className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Quote (> quote)"
              onClick={() => insertMarkdown("> ", "")}
              disabled={disabled || activeTab === "preview"}
            >
              <QuoteIcon className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Code (`code`)"
              onClick={() => insertMarkdown("`", "`")}
              disabled={disabled || activeTab === "preview"}
            >
              <CodeIcon className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Tab Switcher */}
          <TabsList className="h-7 bg-muted p-0.5 rounded-md">
            <TabsTrigger value="write" className="h-6 text-xs px-2.5 gap-1">
              <PenLineIcon className="h-3 w-3" /> Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="h-6 text-xs px-2.5 gap-1">
              <EyeIcon className="h-3 w-3" /> Preview
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Write Tab */}
        <TabsContent value="write" className="mt-0">
          <Textarea
            ref={textareaRef}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={`rounded-t-none font-mono text-sm resize-y ${
              error ? "border-destructive focus-visible:ring-destructive" : ""
            }`}
          />
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="mt-0">
          <div
            className={`min-h-[100px] max-h-[300px] overflow-y-auto p-3.5 rounded-b-lg border border-input bg-card text-card-foreground text-sm space-y-2 font-normal leading-relaxed ${
              rows > 4 ? "min-h-[160px]" : "min-h-[100px]"
            }`}
          >
            {value.trim() ? (
              <div className="prose dark:prose-invert prose-sm max-w-none space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h3]:text-base [&_h3]:font-bold [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded text-foreground">
                <ReactMarkdown>{value}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-xs italic">
                <SparklesIcon className="h-5 w-5 mb-1 opacity-40" />
                Nothing to preview yet. Switch to "Write" to add content.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {error && <p className="text-xs font-medium text-destructive mt-1">{error}</p>}
    </div>
  );
}
