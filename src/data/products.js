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
    category: 'Dòng quà tặng',
    priceVnd: 120000,
    shortDescription: 'Lót ly resin thủ công nghệ thuật. Bề mặt bóng trong suốt, độ cứng cao, chống thấm nước, đế xử lý nhám hạn chế trơn trượt.',
    description:
      'Đặc điểm: Thiết kế trang trí nghệ thuật với nhiều mẫu họa tiết khác nhau. Bề mặt bóng trong suốt, có độ cứng và độ bền cao. Có thể sử dụng để trang trí hoặc làm vật dụng hằng ngày.\n\nPhần đế chống trượt: Đế được xử lý nhám để hạn chế trơn trượt (bằng cách chà nhám mặt đáy hoặc dán miếng chống trượt chuyên dụng).',
    images: ['/assets/products/lot-ly-resin-01.jpg'],
    materials: ['Epoxy resin', 'Hoa khô / trái cây khô', 'Hạt nhựa trang trí', 'Kim tuyến / vàng lá', 'Màu pha resin', 'Miếng chống trượt EVA'],
    dimensions: 'Đường kính khoảng 10 cm, độ dày/chiều cao khoảng 1-2 cm',
    customizable: true,
    options: [
      { name: 'Thêm tên cá nhân hóa', priceDeltaVnd: 10000 },
      { name: 'Hộp quà xinh', priceDeltaVnd: 15000 },
      { name: 'Chọn tone màu riêng', priceDeltaVnd: 5000 },
    ],
    tags: ['lót ly', 'resin', 'trang trí', 'quà tặng', 'handmade'],
  },
  {
    id: 2,
    slug: 'moc-khoa-resin',
    name: 'Móc Khóa Resin',
    category: 'Dòng cơ bản',
    priceVnd: 40000,
    shortDescription: 'Móc khóa resin handmade nhỏ gọn, nhẹ, dễ mang theo. Phù hợp làm phụ kiện cá nhân hoặc quà tặng.',
    description:
      'Đặc điểm: Thiết kế nhỏ gọn, nhẹ và dễ mang theo. Trang trí bằng hoa khô, trái cây khô hoặc màu resin nghệ thuật. Phù hợp làm phụ kiện cá nhân hoặc quà tặng.\n\nThiết kế sử dụng: Được làm mỏng nhẹ để không gây nặng hoặc vướng khi sử dụng. Có khoen móc tiện lợi để gắn chìa khóa hoặc phụ kiện.',
    images: ['/assets/products/moc-khoa-resin-01.jpg'],
    materials: ['Epoxy resin', 'Hoa khô / trái cây khô', 'Hạt nhựa trang trí', 'Kim tuyến / vàng lá', 'Màu pha resin', 'Khoen móc kim loại'],
    dimensions: 'Chiều dài khoảng 5 – 7 cm, chiều ngang khoảng 3 cm, độ dày khoảng 0.5 – 1 cm',
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
    slug: 'bookmark-resin',
    name: 'Bookmark Resin',
    category: 'Dòng cơ bản',
    priceVnd: 50000,
    shortDescription: 'Bookmark (Thẻ kẹp giấy) resin trong suốt handmade. Dùng làm vật dụng trang trí hoặc đánh dấu sách vở, tài liệu.',
    description:
      'Đặc điểm: Sử dụng như vật dụng trang trí hoặc đánh dấu giấy tờ, sách vở. Thiết kế thủ công với nhiều họa tiết nghệ thuật độc đáo.\n\nThiết kế sử dụng: Trọng lượng nhẹ, dễ sử dụng. Bề mặt được xử lý mịn để đảm bảo tính thẩm mỹ và an toàn khi cầm nắm.',
    images: ['/assets/products/bookmark-resin-01.jpg'],
    materials: ['Epoxy resin', 'Hoa khô / trái cây khô', 'Hạt nhựa trang trí', 'Kim tuyến / vàng lá', 'Màu pha resin'],
    dimensions: 'Dạng thanh chữ nhật nhỏ gọn. Chiều dài khoảng 5 – 7 cm, chiều ngang khoảng 3 cm, độ dày khoảng 0.5 cm',
    customizable: true,
    options: [
      { name: 'Thêm tên cá nhân hóa', priceDeltaVnd: 10000 },
      { name: 'Hộp quà kèm thiệp nhỏ', priceDeltaVnd: 12000 },
      { name: 'Chọn tone màu / họa tiết riêng', priceDeltaVnd: 5000 },
    ],
    tags: ['bookmark', 'resin', 'thẻ kẹp giấy', 'đọc sách', 'aesthetic'],
  },
]

export const getProductBySlug = (slug) => products.find((p) => p.slug === slug) ?? null

export const getFeaturedProducts = () => products.slice(0, 3)

export const getCategories = () => ['Tất cả', ...new Set(products.map((p) => p.category))]
