import { useState, useRef } from "react";
import { CustomizationField } from "@/data/products";
import { CustomizationData } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ImageIcon } from "lucide-react";

interface Props {
  fields: CustomizationField[];
  value: CustomizationData;
  onChange: (data: CustomizationData) => void;
}

const CustomizationForm = ({ fields, value, onChange }: Props) => {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const update = (key: string, val: string) => {
    onChange({ ...value, [key]: val });
  };

  const handleFile = (key: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Max 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      update(key, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 p-4 rounded-xl bg-secondary/50 border border-border/50">
      <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
        ✨ Customize Your Order / অর্ডার কাস্টমাইজ করুন
      </h3>

      {fields.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label className="text-sm">
            {field.label} <span className="text-muted-foreground text-xs">({field.labelBn})</span>
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>

          {field.type === "text" && (
            <Input
              placeholder={field.placeholder}
              value={value[field.key] || ""}
              onChange={(e) => update(field.key, e.target.value)}
              className="bg-background"
            />
          )}

          {field.type === "textarea" && (
            <Textarea
              placeholder={field.placeholder}
              value={value[field.key] || ""}
              onChange={(e) => update(field.key, e.target.value)}
              className="bg-background min-h-[70px]"
            />
          )}

          {field.type === "date" && (
            <Input
              type="date"
              value={value[field.key] || ""}
              onChange={(e) => update(field.key, e.target.value)}
              className="bg-background"
            />
          )}

          {field.type === "select" && field.options && (
            <Select value={value[field.key] || ""} onValueChange={(v) => update(field.key, v)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type === "file" && (
            <div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={(el) => { fileInputRefs.current[field.key] = el; }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(field.key, f);
                }}
              />
              {value[field.key] ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group cursor-pointer"
                  onClick={() => fileInputRefs.current[field.key]?.click()}
                >
                  <img src={value[field.key]} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-background text-xs font-medium">Change</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[field.key]?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Upload className="h-4 w-4" /> Upload Photo
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CustomizationForm;
