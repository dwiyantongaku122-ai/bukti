import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";
import { useGames } from "@/hooks/use-games";
import { useButtons } from "@/hooks/use-buttons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGameSchema, insertSettingsSchema, insertButtonSchema, type Game, type SiteButton } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { useState, useRef } from "react";
import {
  Loader2, Plus, Pencil, Trash2, LogOut, Upload, Save, Copy,
  Gamepad2, Settings as SettingsIcon, Palette, LayoutGrid, Type, Link2, Sparkles, Maximize2, Snowflake, Power, ImageIcon,
  MousePointerClick, ArrowUpDown, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

function FileUploadButton({ onUploaded, label }: { onUploaded: (url: string) => void; label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onUploaded(data.url);
    } catch {
      console.error("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} data-testid="input-file-upload" />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="border-slate-300 text-slate-700 bg-white"
        data-testid="button-file-upload"
      >
        {uploading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
        {label || "Upload"}
      </Button>
    </>
  );
}

export default function AdminDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"games" | "buttons" | "settings">("games");

  if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

  if (!user) {
    setLocation("/admin/login");
    return null;
  }

  const tabs = [
    { key: "games" as const, label: "Game", icon: Gamepad2 },
    { key: "buttons" as const, label: "Tombol", icon: MousePointerClick },
    { key: "settings" as const, label: "Pengaturan", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight flex items-center gap-2 shrink-0 text-indigo-600">
            <Gamepad2 className="w-5 h-5" />
            wieproject
          </h1>

          <nav className="flex items-center gap-1 ml-4">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                data-testid={`button-tab-${tab.key}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <Button variant="outline" size="sm" onClick={() => logout()} className="border-red-200 text-red-600 bg-red-50" data-testid="button-logout">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {activeTab === "games" && <GamesManager />}
          {activeTab === "buttons" && <ButtonsManager />}
          {activeTab === "settings" && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
}

function SettingsPanel() {
  const { settings, updateSettings, isUpdating } = useSettings();

  const form = useForm<z.infer<typeof insertSettingsSchema>>({
    resolver: zodResolver(insertSettingsSchema),
    values: settings || {
      logoUrl: "",
      backgroundUrl: "",
      buttonColor: "#3b82f6",
      buttonOutlineColor: "#60a5fa",
      buttonShape: "rounded-full",
      loginUrl: "#",
      registerUrl: "#",
      desktopColumns: 4,
      mobileColumns: 3,
      gameIconSize: 50,
      logoSize: 220,
      siteTitle: "Landing Page",
      outlineAnimation: "pulse",
      outlineAnimationSpeed: 3,
      gameCardSize: 200,
      outlineThickness: 2,
      snowEnabled: false,
      snowSpeed: 5,
      snowAmount: 50,
      snowParticleSize: 20,
      snowImageUrl1: "",
      snowImageUrl2: "",
      snowImageUrl3: "",
      snowImageUrl4: "",
      cardBgColor: "#0c1929",
      buttonHeight: 48,
      buttonWidth: 300,
      bgColor: "#020617",
      siteDescription: "",
      siteDescriptionSize: 16,
      siteDescriptionColor: "#ffffff",
      marqueeText: "",
      marqueeSpeed: 10,
      marqueeColor: "#ffffff",
      marqueeBgColor: "#1e293b",
      marqueeEnabled: false,
    },
  });

  function onSubmit(values: z.infer<typeof insertSettingsSchema>) {
    updateSettings(values);
  }

  if (!settings) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-2xl font-bold text-slate-800">Pengaturan Situs</h2>
          <Button disabled={isUpdating} type="submit" className="bg-indigo-600 text-white font-bold" data-testid="button-save-settings">
            {isUpdating ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Save className="mr-2 w-4 h-4" />}
            Simpan Pengaturan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                <Type className="w-3.5 h-3.5" /> Branding
              </h3>
              <FormField control={form.control} name="siteTitle" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Judul Situs</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" data-testid="input-siteTitle" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="logoUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Logo</FormLabel>
                  <div className="flex gap-1">
                    <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm flex-1" placeholder="URL atau upload" />
                    <FileUploadButton onUploaded={(url) => field.onChange(url)} />
                  </div>
                  {field.value && <img src={field.value} alt="" className="w-16 h-auto mt-1 rounded border border-slate-200" />}
                </FormItem>
              )} />
              <FormField control={form.control} name="logoSize" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Ukuran Logo (px)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? 220} onChange={e => field.onChange(parseInt(e.target.value) || 220)} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="siteDescription" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Deskripsi Situs</FormLabel>
                  <FormControl><Textarea {...field} value={field.value || ""} rows={2} className="bg-slate-50 border-slate-200 text-slate-800 text-sm resize-none" placeholder="Teks deskripsi di bawah logo" data-testid="input-siteDescription" /></FormControl>
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="siteDescriptionSize" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-xs font-medium">Ukuran Deskripsi</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value ?? 16} onChange={e => field.onChange(parseInt(e.target.value) || 16)} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" data-testid="input-siteDescriptionSize" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="siteDescriptionColor" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-xs font-medium">Warna Deskripsi</FormLabel>
                    <div className="flex gap-1">
                      <Input type="color" {...field} value={field.value || "#ffffff"} className="w-10 h-9 p-0.5 bg-slate-50 border-slate-200" />
                      <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm flex-1" />
                    </div>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="backgroundUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Background Gambar</FormLabel>
                  <div className="flex gap-1">
                    <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm flex-1" placeholder="URL atau upload" />
                    <FileUploadButton onUploaded={(url) => field.onChange(url)} />
                  </div>
                  <FormDescription className="text-xs text-slate-500">Gambar akan terlihat jelas tanpa bayangan</FormDescription>
                </FormItem>
              )} />
              <FormField control={form.control} name="bgColor" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Warna Background</FormLabel>
                  <div className="flex gap-1">
                    <Input type="color" {...field} value={field.value || "#020617"} className="w-10 h-9 p-0.5 bg-slate-50 border-slate-200" />
                    <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm flex-1" />
                  </div>
                  <FormDescription className="text-xs text-slate-500">Dipakai jika tidak ada gambar background</FormDescription>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" /> Tombol Global
              </h3>
              <FormField control={form.control} name="buttonColor" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Warna Tombol</FormLabel>
                  <div className="flex gap-1">
                    <Input type="color" {...field} value={field.value || "#3b82f6"} className="w-10 h-9 p-0.5 bg-slate-50 border-slate-200" />
                    <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm flex-1" />
                  </div>
                </FormItem>
              )} />
              <FormField control={form.control} name="buttonOutlineColor" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Warna Outline</FormLabel>
                  <div className="flex gap-1">
                    <Input type="color" {...field} value={field.value || "#60a5fa"} className="w-10 h-9 p-0.5 bg-slate-50 border-slate-200" />
                    <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm flex-1" />
                  </div>
                </FormItem>
              )} />
              <FormField control={form.control} name="buttonShape" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Bentuk Tombol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "rounded-full"}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                      <SelectItem value="rounded-full">Pill (Bulat Penuh)</SelectItem>
                      <SelectItem value="rounded-lg">Bulat Besar</SelectItem>
                      <SelectItem value="rounded-md">Bulat Sedang</SelectItem>
                      <SelectItem value="rounded-sm">Bulat Kecil</SelectItem>
                      <SelectItem value="rounded-none">Kotak</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="buttonWidth" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-xs font-medium">Lebar Tombol (px)</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value ?? 300} onChange={e => field.onChange(parseInt(e.target.value) || 300)} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="buttonHeight" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-xs font-medium">Tinggi Tombol (px)</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value ?? 48} onChange={e => field.onChange(parseInt(e.target.value) || 48)} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs text-slate-400 uppercase tracking-wider">Link Fallback</h4>
                <FormField control={form.control} name="loginUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-xs font-medium">Login URL</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="registerUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-xs font-medium">Register URL</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" /></FormControl>
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                <LayoutGrid className="w-3.5 h-3.5" /> Grid & Kartu
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="mobileColumns" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-xs font-medium">Kolom HP</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value ?? 3} onChange={e => field.onChange(parseInt(e.target.value))} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="desktopColumns" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-xs font-medium">Kolom Desktop</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value ?? 4} onChange={e => field.onChange(parseInt(e.target.value))} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="gameIconSize" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Ukuran Icon Game (px)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? 50} onChange={e => field.onChange(parseInt(e.target.value))} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="gameCardSize" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" /> Ukuran Card (px)
                  </FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? 200} onChange={e => field.onChange(parseInt(e.target.value) || 200)} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" /></FormControl>
                  <FormDescription className="text-[10px] text-slate-400">Lebar minimum card</FormDescription>
                </FormItem>
              )} />
              <FormField control={form.control} name="cardBgColor" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Warna Background Card</FormLabel>
                  <div className="flex gap-1">
                    <Input type="color" {...field} value={field.value || "#0c1929"} className="w-10 h-9 p-0.5 bg-slate-50 border-slate-200" />
                    <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm flex-1" />
                  </div>
                  <FormDescription className="text-[10px] text-slate-400">Warna latar belakang kartu game</FormDescription>
                </FormItem>
              )} />
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Animasi Outline
                </h4>
                <FormField control={form.control} name="outlineAnimation" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-xs font-medium">Tipe Animasi</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "pulse"}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-slate-200 text-slate-800">
                        <SelectItem value="pulse">Pulse (Kedap-kedip)</SelectItem>
                        <SelectItem value="rotate">Rotate (Aurora berputar)</SelectItem>
                        <SelectItem value="none">Tidak ada animasi</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="outlineAnimationSpeed" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-xs font-medium">Kecepatan (detik)</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value ?? 3} onChange={e => field.onChange(parseInt(e.target.value) || 3)} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" /></FormControl>
                    <FormDescription className="text-[10px] text-slate-400">Semakin kecil semakin cepat</FormDescription>
                  </FormItem>
                )} />
                <FormField control={form.control} name="outlineThickness" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-xs font-medium">Ketebalan Outline (px)</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value ?? 2} onChange={e => field.onChange(parseInt(e.target.value) || 2)} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" /></FormControl>
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                <Snowflake className="w-3.5 h-3.5" /> Efek Salju
              </h3>
              <FormField control={form.control} name="snowEnabled" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Status</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "true")} value={field.value ? "true" : "false"}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" data-testid="select-snowEnabled">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                      <SelectItem value="true">
                        <span className="flex items-center gap-1"><Power className="w-3 h-3 text-green-500" /> Aktif</span>
                      </SelectItem>
                      <SelectItem value="false">
                        <span className="flex items-center gap-1"><Power className="w-3 h-3 text-red-400" /> Mati</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="snowSpeed" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Kecepatan (1-20)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? 5} onChange={e => field.onChange(parseInt(e.target.value) || 5)} min={1} max={20} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" data-testid="input-snowSpeed" /></FormControl>
                  <FormDescription className="text-[10px] text-slate-400">Semakin besar semakin cepat</FormDescription>
                </FormItem>
              )} />
              <FormField control={form.control} name="snowAmount" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Jumlah Partikel (10-500)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? 50} onChange={e => field.onChange(parseInt(e.target.value) || 50)} min={10} max={500} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" data-testid="input-snowAmount" /></FormControl>
                  <FormDescription className="text-[10px] text-slate-400">Jumlah butiran salju di layar</FormDescription>
                </FormItem>
              )} />
              <FormField control={form.control} name="snowParticleSize" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Ukuran Partikel (px)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? 20} onChange={e => field.onChange(parseInt(e.target.value) || 20)} min={5} max={100} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" data-testid="input-snowParticleSize" /></FormControl>
                </FormItem>
              )} />
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Gambar Partikel (Opsional)
                </h4>
                <FormDescription className="text-[10px] text-slate-400">Kosongkan untuk menggunakan efek salju default (bulatan putih)</FormDescription>
                {(["snowImageUrl1", "snowImageUrl2", "snowImageUrl3", "snowImageUrl4"] as const).map((name, i) => (
                  <FormField key={name} control={form.control} name={name} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 text-xs font-medium">Gambar {i + 1}</FormLabel>
                      <div className="flex gap-1 items-center">
                        <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm flex-1" placeholder="URL atau upload" />
                        <FileUploadButton onUploaded={(url) => field.onChange(url)} />
                        {field.value && (
                          <img src={field.value} alt="" className="w-8 h-8 rounded object-cover border border-slate-200" />
                        )}
                      </div>
                    </FormItem>
                  )} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Teks Berjalan
              </h3>
              <FormField control={form.control} name="marqueeEnabled" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Status</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "true")} value={field.value ? "true" : "false"}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" data-testid="select-marqueeEnabled">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                      <SelectItem value="true">
                        <span className="flex items-center gap-1"><Power className="w-3 h-3 text-green-500" /> Aktif</span>
                      </SelectItem>
                      <SelectItem value="false">
                        <span className="flex items-center gap-1"><Power className="w-3 h-3 text-red-400" /> Mati</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="marqueeText" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Teks Pengumuman</FormLabel>
                  <FormControl><Textarea {...field} value={field.value || ""} rows={2} className="bg-slate-50 border-slate-200 text-slate-800 text-sm resize-none" placeholder="Tulis teks pengumuman yang akan berjalan..." data-testid="input-marqueeText" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="marqueeSpeed" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Kecepatan (1-10)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? 10} onChange={e => field.onChange(parseInt(e.target.value) || 10)} min={1} max={10} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm" data-testid="input-marqueeSpeed" /></FormControl>
                  <FormDescription className="text-[10px] text-slate-400">Semakin besar semakin cepat</FormDescription>
                </FormItem>
              )} />
              <FormField control={form.control} name="marqueeColor" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Warna Teks</FormLabel>
                  <div className="flex gap-1">
                    <Input type="color" {...field} value={field.value || "#ffffff"} className="w-10 h-9 p-0.5 bg-slate-50 border-slate-200" />
                    <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm flex-1" />
                  </div>
                </FormItem>
              )} />
              <FormField control={form.control} name="marqueeBgColor" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs font-medium">Warna Background</FormLabel>
                  <div className="flex gap-1">
                    <Input type="color" {...field} value={field.value || "#1e293b"} className="w-10 h-9 p-0.5 bg-slate-50 border-slate-200" />
                    <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm flex-1" />
                  </div>
                </FormItem>
              )} />
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}

function ButtonsManager() {
  const { buttons, createButton, updateButton, deleteButton, isLoading } = useButtons();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingButton, setEditingButton] = useState<SiteButton | null>(null);

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-800" data-testid="text-buttons-title">Manajemen Tombol</h2>
          <p className="text-sm text-slate-500">Tambah, edit, atau hapus tombol di halaman utama. Setiap tombol bisa punya URL berbeda.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 text-white" data-testid="button-add-button">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Tombol
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-white border-slate-200 text-slate-800">
            <DialogHeader>
              <DialogTitle className="text-slate-800">Tambah Tombol Baru</DialogTitle>
            </DialogHeader>
            <ButtonForm
              onSubmit={(data) => {
                createButton(data, { onSuccess: () => setIsCreateOpen(false) });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="text-slate-600 font-medium">Label</TableHead>
              <TableHead className="text-slate-600 font-medium">URL</TableHead>
              <TableHead className="text-slate-600 font-medium">Warna</TableHead>
              <TableHead className="text-slate-600 font-medium">Urutan</TableHead>
              <TableHead className="text-slate-600 font-medium">Status</TableHead>
              <TableHead className="text-right text-slate-600 font-medium">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!buttons || buttons.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                  Belum ada tombol. Klik "Tambah Tombol" untuk membuat tombol baru.
                </TableCell>
              </TableRow>
            )}
            {buttons?.map((btn) => (
              <TableRow key={btn.id} className="border-slate-100 hover:bg-slate-50/50">
                <TableCell className="font-medium text-slate-800">{btn.label}</TableCell>
                <TableCell className="text-sm text-slate-500 max-w-[200px] truncate">{btn.url}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border border-slate-200" style={{ backgroundColor: btn.color || '#3b82f6' }} />
                    <span className="text-xs font-mono text-slate-400">{btn.color}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-600">{btn.sortOrder}</span>
                </TableCell>
                <TableCell>
                  {btn.isVisible ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <Eye className="w-3 h-3" /> Tampil
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      <EyeOff className="w-3 h-3" /> Sembunyi
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingButton(btn)}
                      data-testid={`button-edit-btn-${btn.id}`}
                    >
                      <Pencil className="h-4 w-4 text-indigo-500" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-delete-btn-${btn.id}`}>
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-slate-200 text-slate-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Tombol?</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-500">
                            Tombol "{btn.label}" akan dihapus permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-slate-100 border-slate-200 text-slate-700">Batal</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-500 text-white" onClick={() => deleteButton(btn.id)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingButton} onOpenChange={(open) => !open && setEditingButton(null)}>
        <DialogContent className="max-w-lg bg-white border-slate-200 text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Edit Tombol</DialogTitle>
          </DialogHeader>
          {editingButton && (
            <ButtonForm
              defaultValues={editingButton}
              onSubmit={(data) => {
                updateButton({ id: editingButton.id, ...data }, { onSuccess: () => setEditingButton(null) });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ButtonForm({ defaultValues, onSubmit }: { defaultValues?: Partial<SiteButton>; onSubmit: (data: z.infer<typeof insertButtonSchema>) => void }) {
  const form = useForm<z.infer<typeof insertButtonSchema>>({
    resolver: zodResolver(insertButtonSchema),
    defaultValues: defaultValues || {
      label: "Tombol Baru",
      url: "#",
      color: "#3b82f6",
      outlineColor: "#60a5fa",
      width: 300,
      height: 48,
      sortOrder: 0,
      isVisible: true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="label" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-slate-700">Label Tombol</FormLabel>
            <FormControl><Input {...field} className="bg-slate-50 border-slate-200 text-slate-800" placeholder="Contoh: LOGIN, DAFTAR, MAIN" data-testid="input-btn-label" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="url" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-slate-700">URL Tujuan</FormLabel>
            <FormControl><Input {...field} className="bg-slate-50 border-slate-200 text-slate-800" placeholder="https://example.com" data-testid="input-btn-url" /></FormControl>
            <FormDescription className="text-xs text-slate-400">Alamat web yang dituju saat tombol diklik</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="color" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Warna Tombol</FormLabel>
              <div className="flex gap-1">
                <Input type="color" {...field} value={field.value || "#3b82f6"} className="w-10 h-9 p-0.5 bg-slate-50 border-slate-200" />
                <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm flex-1" />
              </div>
            </FormItem>
          )} />
          <FormField control={form.control} name="outlineColor" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Warna Outline</FormLabel>
              <div className="flex gap-1">
                <Input type="color" {...field} value={field.value || "#60a5fa"} className="w-10 h-9 p-0.5 bg-slate-50 border-slate-200" />
                <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 h-9 text-sm flex-1" />
              </div>
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="sortOrder" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Urutan</FormLabel>
              <FormControl><Input type="number" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="bg-slate-50 border-slate-200 text-slate-800" data-testid="input-btn-order" /></FormControl>
              <FormDescription className="text-xs text-slate-400">Angka kecil tampil duluan</FormDescription>
            </FormItem>
          )} />
          <FormField control={form.control} name="isVisible" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Tampilkan</FormLabel>
              <Select onValueChange={(v) => field.onChange(v === "true")} value={field.value ? "true" : "false"}>
                <FormControl>
                  <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800 h-9">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border-slate-200 text-slate-800">
                  <SelectItem value="true">Tampil</SelectItem>
                  <SelectItem value="false">Sembunyi</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )} />
        </div>

        <Button type="submit" className="w-full bg-indigo-600 text-white font-bold" data-testid="button-submit-btn">
          {defaultValues ? "Update Tombol" : "Tambah Tombol"}
        </Button>
      </form>
    </Form>
  );
}

function GamesManager() {
  const { games, createGame, updateGame, deleteGame, isLoading } = useGames();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-2xl font-bold text-slate-800" data-testid="text-games-title">Manajemen Game</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 text-white" data-testid="button-add-game">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Game
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white border-slate-200 text-slate-800 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-slate-800">Tambah Game Baru</DialogTitle>
            </DialogHeader>
            <GameForm
              onSubmit={(data) => {
                createGame(data, { onSuccess: () => setIsCreateOpen(false) });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="text-slate-600 font-medium">Gambar</TableHead>
              <TableHead className="text-slate-600 font-medium">Provider</TableHead>
              <TableHead className="text-slate-600 font-medium">Nama</TableHead>
              <TableHead className="text-slate-600 font-medium">Info</TableHead>
              <TableHead className="text-slate-600 font-medium">Outline</TableHead>
              <TableHead className="text-right text-slate-600 font-medium">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games?.map((game) => (
              <TableRow key={game.id} className="border-slate-100 hover:bg-slate-50/50">
                <TableCell>
                  <img src={game.imageUrl} alt={game.name} className="w-12 h-12 rounded object-cover bg-slate-100" />
                </TableCell>
                <TableCell className="font-medium text-indigo-600">{game.provider}</TableCell>
                <TableCell className="text-slate-800">{game.name}</TableCell>
                <TableCell className="text-xs text-slate-500">
                  <div>Bet: {game.bet}</div>
                  <div>Dep: {game.deposit}</div>
                  <div>WD: {game.withdraw}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4 rounded border border-slate-200" style={{ background: `linear-gradient(90deg, ${game.outlineColor || '#fff'}, ${game.outlineColorEnd || '#f00'})` }} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const { id, createdAt, ...rest } = game;
                        createGame({ ...rest, name: `${game.name} (Copy)` });
                      }}
                      data-testid={`button-duplicate-game-${game.id}`}
                    >
                      <Copy className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingGame(game)}
                      data-testid={`button-edit-game-${game.id}`}
                    >
                      <Pencil className="h-4 w-4 text-indigo-500" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-delete-game-${game.id}`}>
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-slate-200 text-slate-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Game?</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-500">
                            Game "{game.name}" akan dihapus permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-slate-100 border-slate-200 text-slate-700">Batal</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-500 text-white" onClick={() => deleteGame(game.id)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingGame} onOpenChange={(open) => !open && setEditingGame(null)}>
        <DialogContent className="max-w-2xl bg-white border-slate-200 text-slate-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Edit Game</DialogTitle>
          </DialogHeader>
          {editingGame && (
            <GameForm
              defaultValues={editingGame}
              onSubmit={(data) => {
                updateGame({ id: editingGame.id, ...data }, { onSuccess: () => setEditingGame(null) });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GameForm({ defaultValues, onSubmit }: { defaultValues?: Partial<Game>; onSubmit: (data: z.infer<typeof insertGameSchema>) => void }) {
  const form = useForm<z.infer<typeof insertGameSchema>>({
    resolver: zodResolver(insertGameSchema),
    defaultValues: defaultValues || {
      provider: "",
      name: "",
      deposit: "10.000",
      withdraw: "50.000",
      bet: "200",
      dateTime: new Date().toLocaleString(),
      imageUrl: "",
      iconUrl: "",
      iconUrl2: "",
      outlineColor: "#ffffff",
      outlineColorEnd: "#ff0000",
      isPublished: true,
      description: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="provider" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Provider</FormLabel>
              <FormControl><Input {...field} className="bg-slate-50 border-slate-200 text-slate-800" placeholder="e.g. PRAGMATIC PLAY" data-testid="input-provider" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Nama Game</FormLabel>
              <FormControl><Input {...field} className="bg-slate-50 border-slate-200 text-slate-800" placeholder="e.g. Gates of Olympus" data-testid="input-name" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField control={form.control} name="deposit" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Deposit</FormLabel>
              <FormControl><Input {...field} className="bg-slate-50 border-slate-200 text-slate-800" data-testid="input-deposit" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="withdraw" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Withdraw</FormLabel>
              <FormControl><Input {...field} className="bg-slate-50 border-slate-200 text-slate-800" data-testid="input-withdraw" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="bet" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Bet</FormLabel>
              <FormControl><Input {...field} className="bg-slate-50 border-slate-200 text-slate-800" data-testid="input-bet" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="dateTime" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-slate-700">Tanggal & Waktu</FormLabel>
            <FormControl><Input {...field} className="bg-slate-50 border-slate-200 text-slate-800" data-testid="input-datetime" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="space-y-3">
          <FormField control={form.control} name="imageUrl" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Gambar Utama</FormLabel>
              <div className="flex gap-2">
                <Input {...field} className="bg-slate-50 border-slate-200 text-slate-800 flex-1" placeholder="URL atau upload" data-testid="input-imageUrl" />
                <FileUploadButton onUploaded={(url) => field.onChange(url)} />
              </div>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="iconUrl" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Icon Game 1</FormLabel>
              <div className="flex gap-2">
                <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 flex-1" placeholder="URL atau upload" data-testid="input-iconUrl" />
                <FileUploadButton onUploaded={(url) => field.onChange(url)} />
              </div>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="iconUrl2" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Icon Game 2</FormLabel>
              <div className="flex gap-2">
                <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 flex-1" placeholder="URL atau upload" data-testid="input-iconUrl2" />
                <FileUploadButton onUploaded={(url) => field.onChange(url)} />
              </div>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="outlineColor" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Warna Gradient Awal</FormLabel>
              <div className="flex gap-2">
                <Input type="color" {...field} value={field.value || "#ffffff"} className="w-12 p-1 bg-slate-50 border-slate-200 h-9" />
                <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 flex-1" placeholder="#RRGGBB" data-testid="input-outlineColor" />
              </div>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="outlineColorEnd" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Warna Gradient Akhir</FormLabel>
              <div className="flex gap-2">
                <Input type="color" {...field} value={field.value || "#ff0000"} className="w-12 p-1 bg-slate-50 border-slate-200 h-9" />
                <Input {...field} value={field.value || ""} className="bg-slate-50 border-slate-200 text-slate-800 flex-1" placeholder="#RRGGBB" data-testid="input-outlineColorEnd" />
              </div>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-slate-700">Deskripsi (max 200 karakter)</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value || ""}
                maxLength={200}
                rows={3}
                className="bg-slate-50 border-slate-200 text-slate-800 resize-none text-sm"
                placeholder="Deskripsi singkat game..."
                data-testid="input-description"
              />
            </FormControl>
            <FormDescription className="text-xs text-slate-400">
              {(field.value || "").length}/200
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" className="w-full bg-indigo-600 text-white font-bold" data-testid="button-submit-game">
          {defaultValues ? "Update Game" : "Tambah Game"}
        </Button>
      </form>
    </Form>
  );
}
