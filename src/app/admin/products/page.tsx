import { listProducts } from "@/server/actions/products";
import { listVarietyBreeds } from "@/server/actions/species";
import { ProductForm } from "@/components/ProductForm";
import { ProductRow } from "@/components/ProductRow";

export default async function ProductsPage() {
  const [products, varieties] = await Promise.all([listProducts(), listVarietyBreeds()]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-stone-900">Products</h1>
      <ProductForm varieties={varieties} />

      <div className="space-y-2">
        {products.map((product) => (
          <ProductRow key={product.id} product={product} varieties={varieties} />
        ))}
        {products.length === 0 && <p className="text-sm text-stone-500">No products yet.</p>}
      </div>
    </div>
  );
}
