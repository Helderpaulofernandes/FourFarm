"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentFarmId } from "@/lib/farm-context";
import { productSchema, type ProductInput } from "@/schemas/product";

export async function listProducts() {
  const farmId = await getCurrentFarmId();
  return db.product.findMany({
    where: { farmId },
    include: { varietyBreed: { include: { species: true } } },
    orderBy: { name: "asc" },
  });
}

// Public projection — deliberately selects only customer-safe fields. Never
// include InputApplication/cost data here, per the hard rule from the
// original plan: internal cost/margin data must never reach a public route.
export async function listPublicProducts() {
  const farmId = await getCurrentFarmId();
  return db.product.findMany({
    where: { farmId, publicVisible: true, active: true },
    select: {
      id: true,
      name: true,
      category: true,
      saleUnit: true,
      standardPackSize: true,
      price: true,
      primaryMediaUrl: true,
      varietyBreed: { select: { name: true, species: { select: { commonName: true } } } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getPublicProduct(id: string) {
  return db.product.findFirstOrThrow({
    where: { id, publicVisible: true, active: true },
    select: {
      id: true,
      name: true,
      category: true,
      saleUnit: true,
      standardPackSize: true,
      price: true,
      primaryMediaUrl: true,
      varietyBreed: {
        select: { name: true, publicDescription: true, species: { select: { commonName: true } } },
      },
      profile: {
        select: {
          method: { select: { name: true, publicDescription: true } },
        },
      },
    },
  });
}

export async function createProduct(input: ProductInput) {
  const data = productSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const product = await db.product.create({ data: { farmId, ...data } });
  revalidatePath("/admin/products");
  revalidatePath("/store");
  return product;
}

export async function updateProduct(id: string, input: ProductInput) {
  const data = productSchema.parse(input);
  const farmId = await getCurrentFarmId();

  const product = await db.product.update({ where: { id, farmId }, data });
  revalidatePath("/admin/products");
  revalidatePath("/store");
  return product;
}
