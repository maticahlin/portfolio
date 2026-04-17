import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

export type Project = {
  _id: string;
  title: string;
  slug: { current: string };
  client?: string;
  projectType?: string;
  role?: string;
  collaborators?: string;
  design?: string;
  development?: string;
  format: string;
  year: string;
  link?: string;
  subcategory: "client" | "creative" | "personal";
  shortDescription: string;
  longDescription: string;
  images: any[];
  isPinned?: boolean;
}

export async function getProjects(): Promise<Project[]> {
  return client.fetch(`
    *[_type == "project"] | order(order asc) {
      _id,
      title,
      slug,
      client,
      projectType,
      role,
      collaborators,
      design,
      development,
      format,
      year,
      link,
      subcategory,
      shortDescription,
      longDescription,
      "images": images[].asset->,
      isPinned
    }
  `)
}