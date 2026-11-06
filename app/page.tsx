import { redirect } from "next/navigation";

// Beranda dialihkan. Proxy mengarahkan ke /login bila belum masuk.
export default function Home() {
  redirect("/dashboard");
}
