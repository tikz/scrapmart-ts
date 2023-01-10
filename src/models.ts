
import { Table, Column, Model, HasMany, BelongsTo, ForeignKey, Unique, BelongsToMany, Index } from 'sequelize-typescript'
import { logProduct } from './logging.js'

@Table
export class Market extends Model {
  @Index
  @Column
  declare name: string

  @HasMany(() => Product)
  declare products: Product[]
}

@Table
export class Product extends Model {
  @Unique
  @Index
  @Column
  declare ean: number

  @Index
  @Column
  declare name: string

  @Column
  declare url: string

  @Column
  declare imageUrl: string

  @ForeignKey(() => Market)
  @Column
  declare marketId: number

  @BelongsTo(() => Market)
  declare market: Market

  @HasMany(() => Price)
  declare prices: Price[]

  @BelongsToMany(() => Category, () => ProductCategory)
  declare categories: Category[]
}

@Table
export class Price extends Model {
  @Column
  declare price: number

  @Column
  declare discountPrice: number

  @Column
  declare discountDetails: string

  @ForeignKey(() => Product)
  @Column
  declare productId: number

  @BelongsTo(() => Product)
  declare product: Product
}

@Table
export class Category extends Model {
  @Index
  @Column
  declare name: string

  @BelongsToMany(() => Product, () => ProductCategory)
  declare products: Product[]
}

@Table
export class ProductCategory extends Model {
  @ForeignKey(() => Product)
  @Column
  declare productId: number

  @ForeignKey(() => Category)
  @Column
  declare categoryId: number
}

export const store = async (market: Market, ean: number, name: string | null, url: string, imageUrl: string | null,
  price: number, discountPrice: number, discountDetails: string | null, categories: string[]) => {
  const categoriesIds = []
  for (const name of categories) {
    const [category] = await Category.findOrCreate({
      where: { name }
    })
    categoriesIds.push(category.id)
  }

  const [product] = await Product.findOrCreate({
    where: { ean },
    defaults: { ean, name, url, imageUrl, marketId: market.id }
  })

  for (const categoryId of categoriesIds) {
    await ProductCategory.findOrCreate({
      where: { productId: product.id, categoryId },
      defaults: { productId: product.id, categoryId }
    })
  }

  await Price.create({ price, discountPrice, discountDetails, productId: product.id })

  logProduct(product, market.name)
}
