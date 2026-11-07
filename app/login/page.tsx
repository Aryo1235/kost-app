import type { Metadata } from "next";
import Image from "next/image";
import { Wordmark } from "@/components/shared/wordmark";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = { title: "Masuk" };

// Halaman masuk dua kolom (shadcn login-02, design.md 6.17).
// Foto hanya tampil di layar ≥1024px. Gambar lazy dalam elemen tersembunyi tidak diunduh di HP.
export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center md:justify-start">
          <Wordmark />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[360px]">
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="hidden flex-col p-2 lg:flex">
        <div className="relative flex-1 overflow-hidden rounded-xl bg-muted">
          {/* Foto stand-in berlisensi CC0, bukan foto kost klien. Ganti file yang sama bila ada foto sendiri. */}
          <Image
            src="/images/photo-m61880133.webp"
            alt=""
            fill
            sizes="50vw"
            className="object-cover"
          />
        </div>
        <p className="px-2 pt-2 text-xs text-muted-foreground">
          Foto: Irene van der Poel ·{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Cozy_bed_by_a_windowsill_(Unsplash).jpg"
            className="underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            CC0, Wikimedia Commons
          </a>
        </p>
      </div>
    </div>
  );
}
