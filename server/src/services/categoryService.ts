import { eq, asc, sql, ne } from 'drizzle-orm'
import { db, schema } from '@/db/index.js'
import type { Category } from '@/types/index.js'

const { categories, comicCategories, bookCategories } = schema

export const categoryService = {
  async getCategories(includeHidden = false): Promise<Category[]> {
    const rows = includeHidden
      ? await db.select().from(categories).orderBy(asc(categories.order))
      : await db.select().from(categories).where(sql`${categories.hidden} IS NOT TRUE`).orderBy(asc(categories.order))

    const comicCounts = await db
      .select({ categoryId: comicCategories.categoryId, count: sql<number>`count(*)` })
      .from(comicCategories)
      .groupBy(comicCategories.categoryId)

    const bookCounts = await db
      .select({ categoryId: bookCategories.categoryId, count: sql<number>`count(*)` })
      .from(bookCategories)
      .groupBy(bookCategories.categoryId)

    const comicCountMap = new Map(comicCounts.map(c => [c.categoryId, c.count]))
    const bookCountMap = new Map(bookCounts.map(c => [c.categoryId, c.count]))

    const categoryMap = new Map<number, Category>()
    const roots: Category[] = []

    for (const row of rows) {
      const cat: Category = {
        ...row,
        comicCount: comicCountMap.get(row.id) || 0,
        bookCount: bookCountMap.get(row.id) || 0,
        children: [],
      }
      categoryMap.set(row.id, cat)
    }

    for (const row of rows) {
      const cat = categoryMap.get(row.id)!
      if (row.parentId && categoryMap.has(row.parentId)) {
        const parent = categoryMap.get(row.parentId)!
        parent.children = parent.children || []
        parent.children.push(cat)
      } else {
        roots.push(cat)
      }
    }

    return roots
  },

  async createCategory(data: { name: string; description?: string; parentId?: number }): Promise<Category> {
    const maxOrder = await db.select({ maxOrder: sql<number>`COALESCE(MAX(${categories.order}), 0)` }).from(categories)
    const order = (maxOrder[0]?.maxOrder || 0) + 1

    const [result] = await db.insert(categories).values({
      name: data.name,
      description: data.description || null,
      parentId: data.parentId || null,
      order,
    }).returning()

    return result as Category
  },

  async updateCategory(id: number, data: { name?: string; description?: string; order?: number; parentId?: number }): Promise<Category | null> {
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.order !== undefined) updateData.order = data.order
    if (data.parentId !== undefined) updateData.parentId = data.parentId

    await db.update(categories).set(updateData).where(eq(categories.id, id))

    const [result] = await db.select().from(categories).where(eq(categories.id, id))
    return (result as Category) || null
  },

  async toggleHidden(id: number): Promise<Category | null> {
    const [cat] = await db.select().from(categories).where(eq(categories.id, id))
    if (!cat) return null
    const [result] = await db.update(categories)
      .set({ hidden: !cat.hidden })
      .where(eq(categories.id, id))
      .returning()
    return result as Category
  },

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id))
  },
}
