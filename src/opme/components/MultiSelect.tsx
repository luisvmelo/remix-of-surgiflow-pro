import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@opme/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@opme/components/ui/popover";
import { Button } from "@opme/components/ui/button";

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export const MultiSelect = ({
  label,
  options,
  selected,
  onChange,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const displayText =
    selected.length === 0
      ? label
      : selected.length === 1
      ? selected[0]
      : `${selected.length} selecionados`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 px-4 justify-between min-w-[140px] bg-neutral-100 border-neutral-200 hover:bg-brand-100",
            selected.length > 0 && "border-brand-300 bg-brand-100"
          )}
        >
          <span className="text-paragraph font-semibold text-neutral-600 truncate">{displayText}</span>
          <ChevronDown className="w-5 h-5 text-neutral-500 ml-2 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 bg-neutral-0 border-2 border-neutral-200 shadow-elevation-modal z-[100]" align="start">
        <div className="max-h-80 overflow-y-auto p-2">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => toggleOption(option)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2.5 text-paragraph text-neutral-600 hover:bg-brand-100 transition-colors text-left rounded-lg",
                selected.includes(option) && "bg-brand-100"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 border rounded flex items-center justify-center shrink-0",
                  selected.includes(option)
                    ? "bg-brand-400 border-brand-400"
                    : "border-neutral-300"
                )}
              >
                {selected.includes(option) && (
                  <Check className="w-4 h-4 text-neutral-0" />
                )}
              </div>
              <span className="truncate">{option}</span>
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="border-t border-neutral-200 p-2">
            <button
              onClick={() => onChange([])}
              className="w-full text-paragraph font-semibold text-brand-400 hover:underline text-center"
            >
              Limpar seleção
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
