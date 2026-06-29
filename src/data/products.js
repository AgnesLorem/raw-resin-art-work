/**
 * products.js — Local product data (Phase 1)
 * Future: Replace this file's export with an API call to Cloudflare Pages Functions
 * without touching any component code.
 */

export const products = [
  {
    id: 1,
    slug: 'lot-ly-resin',
    name: 'Lót Ly Resin',
    category: 'Đồ dùng bàn',
    priceVnd: 55000,
    shortDescription: 'Lót ly resin trong suốt, họa tiết độc đáo. Bảo vệ mặt bàn theo cách đẹp nhất.',
    description:
      'Mỗi chiếc lót ly là một tác phẩm nhỏ được đổ thủ công từ resin epoxy trong suốt. Họa tiết hoa khô, vảy cá, hoặc màu đổ tự do — không có hai chiếc nào giống nhau hoàn toàn. Bề mặt bóng mịn, chống thấm nước, an toàn cho mọi loại ly nóng/lạnh.',
    images: ['/assets/products/lot-ly-resin-01.png'],
    materials: ['Epoxy resin', 'Hoa khô / pigment tự nhiên', 'Sợi vàng/bạc trang trí'],
    dimensions: 'Đường kính 9–10 cm, dày ~0.5 cm',
    customizable: true,
    options: [
      { name: 'Thêm tên cá nhân hóa (khắc laser / sticker)', priceDeltaVnd: 10000 },
      { name: 'Hộp quà xinh', priceDeltaVnd: 15000 },
      { name: 'Chọn tone màu riêng', priceDeltaVnd: 5000 },
    ],
    tags: ['lót ly', 'resin', 'trang trí', 'quà tặng', 'handmade'],
  },
  {
    id: 2,
    slug: 'moc-khoa-resin',
    name: 'Móc Khóa Resin',
    category: 'Phụ kiện',
    priceVnd: 35000,
    shortDescription: 'Móc khóa resin mini xinh xắn. Nhỏ gọn, bền, nhiều hình dạng để chọn.',
    description:
      'Móc khóa resin handmade với nhiều hình dạng: trái tim, hoa, gấu, chữ cái đầu tên... Được đổ khuôn silicone tỉ mỉ, phủ lớp UV bảo vệ bề mặt. Là món quà nhỏ gọn, dễ thương phù hợp tặng bạn bè, kỷ niệm sinh nhật, hoặc đính kèm túi xách.',
    images: ['/assets/products/moc-khoa-resin-01.png'],
    materials: ['UV resin', 'Khuôn silicone', 'Móc kim loại mạ vàng/bạc', 'Pigment / hoa khô'],
    dimensions: 'Khoảng 3–5 cm (tùy hình dạng)',
    customizable: true,
    options: [
      { name: 'Thêm tên / chữ cái đầu cá nhân hóa', priceDeltaVnd: 10000 },
      { name: 'Hộp quà kèm thiệp nhỏ', priceDeltaVnd: 12000 },
      { name: 'Chọn màu sắc theo yêu cầu', priceDeltaVnd: 5000 },
    ],
    tags: ['móc khóa', 'resin', 'phụ kiện', 'quà tặng', 'cute'],
  },
  {
    id: 3,
    slug: 'thuoc-resin',
    name: 'Thước Resin',
    category: 'Văn phòng phẩm',
    priceVnd: 65000,
    shortDescription: 'Thước resin trong suốt handmade. Vừa là dụng cụ học tập, vừa là vật trang trí góc bàn.',
    description:
      'Thước resin 15–20 cm được đổ tay từ epoxy resin trong suốt, bên trong nhúng hoa khô, glitter, hoặc pigment màu pastel. Vạch đo rõ ràng, bề mặt phẳng mịn. Không chỉ dùng được mà còn khiến bàn học thêm aesthetic. Được lòng học sinh, sinh viên muốn góc bàn đẹp mà không tốn nhiều tiền.',
    images: ['/assets/products/thuoc-resin-01.png'],
    materials: ['Epoxy resin trong suốt', 'Hoa khô / glitter', 'Khuôn thước silicone'],
    dimensions: '15 cm hoặc 20 cm, dày ~0.8 cm',
    customizable: true,
    options: [
      { name: 'Thêm tên cá nhân hóa lên thước', priceDeltaVnd: 10000 },
      { name: 'Hộp quà kèm dây ruy băng', priceDeltaVnd: 15000 },
      { name: 'Chọn màu / họa tiết bên trong', priceDeltaVnd: 5000 },
      { name: 'Nâng lên 20 cm', priceDeltaVnd: 10000 },
    ],
    tags: ['thước', 'resin', 'văn phòng phẩm', 'học sinh', 'aesthetic'],
  },
]

export const getProductBySlug = (slug) => products.find((p) => p.slug === slug) ?? null

export const getFeaturedProducts = () => products.slice(0, 3)

export const getCategories = () => ['Tất cả', ...new Set(products.map((p) => p.category))]
