import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductDetailClient from './ProductDetailClient';

interface Product {
  id: string; name: string; price: number; description: string | null;
  image_url: string | null; images: string[]; stock: number; slug: string; status: string;
  categories: { name: string; slug: string } | null;
}

async function getProduct(slug: string): Promise<Product | null> {
  const { data } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  return data as Product | null;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  return <ProductDetailClient product={product!} />;
}
