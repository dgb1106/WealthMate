import Image from "next/image";
import Link from "next/link";
import ProductCard from "./components/ProductCard";

export default function Home() {
  return (
    <main>
      <h1>Hello lmao</h1>
      <Link href="/users"><h2>Click</h2></Link>
      <ProductCard />
    </main>
  );
}
