/**
 * siteContent.js — Static content/copy for the website.
 * Centralizes all text so it's easy to update without hunting through JSX.
 */

export const siteConfig = {
  name: 'R.A.W',
  fullName: 'R.A.W - Resin Art Work',
  tagline: 'Sản phẩm resin handmade cá nhân hóa',
  domain: 'resinartworkshop.id.vn',
  email: 'nghiathce191122@gmail.com',
  social: {
    facebook: 'https://www.facebook.com/share/18PSYAARJV/?mibextid=wwXIfr',
    instagram: '#',
    tiktok: '#',
  },
}

export const heroContent = {
  headline: 'Resin Art Work',
  subHeadline: 'Handmade · Cá nhân hóa · Từ trái tim',
  description:
    'Mỗi sản phẩm resin là một câu chuyện nhỏ — được tạo ra bằng tay, dành riêng cho bạn. Lót ly, móc khóa, bookmark... tất cả đều có thể mang dấu ấn của bạn.',
  ctaText: 'Xem sản phẩm',
  ctaLink: '/san-pham',
  ctaSecondaryText: 'Về chúng tôi',
}

export const aboutContent = {
  label: 'Về R.A.W',
  title: 'Handmade từ tâm huyết',
  description:
    'R.A.W (Resin Art Workshop) được thành lập ngày 12/05/2026 tại 600 Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ. Dự án tập trung thiết kế và sản xuất các sản phẩm nghệ thuật, trang trí và sưu tầm từ resin thủ công giúp nâng cao trải nghiệm thẩm mỹ và độ bền, thể hiện cá tính riêng biệt.',
  highlights: [
    { icon: '✦', title: 'Câu chuyện của nhóm', desc: 'Hình thành từ nhu cầu sở hữu sản phẩm decor thẩm mỹ, nhỏ gọn, độc đáo của giới trẻ nhằm tạo ra giá trị cảm xúc rõ ràng.' },
    { icon: '✦', title: 'Mục tiêu R.A.W', desc: 'Mang lại những vật phẩm vừa có giá trị trang trí vừa thể hiện phong cách cá nhân, đồng thời nâng cao chất lượng nhìn trong đời sống.' },
    { icon: '✦', title: 'Sản phẩm Handmade', desc: 'Được làm thủ công từ nhựa epoxy resin kết hợp hoa khô, trái cây khô nghệ thuật tạo nên nét riêng độc nhất cho từng mẫu.' },
    { icon: '✦', title: 'Định hướng định vị', desc: 'Nghiên cứu sâu, sản xuất thử nghiệm, tối ưu hóa chất lượng resin (giảm bọt khí, mịn bề mặt) và mở rộng bán hàng đa kênh.' },
  ],
}

export const processSteps = [
  {
    step: '01',
    title: 'Tư vấn ý tưởng',
    desc: 'Bạn chỉ cần chia sẻ ý tưởng hoặc màu sắc yêu thích. Chúng mình sẽ đề xuất phong cách phù hợp.',
  },
  {
    step: '02',
    title: 'Chọn màu & vật liệu',
    desc: 'Chọn tone màu, họa tiết hoa khô, glitter, hoặc pigment tùy theo sở thích cá nhân.',
  },
  {
    step: '03',
    title: 'Đổ resin & hoàn thiện',
    desc: 'Sản phẩm được đổ khuôn thủ công, chờ đông cứng và đánh bóng hoàn thiện cẩn thiện.',
  },
  {
    step: '04',
    title: 'Đóng gói & giao hàng',
    desc: 'Sản phẩm được gói cẩn thận, có thể kèm hộp quà và thiệp tay viết nếu bạn muốn.',
  },
]

export const whyUsPoints = [
  { icon: '🎨', title: 'Cá nhân hóa hoàn toàn', desc: 'Tên, màu, họa tiết riêng biệt cho từng đơn hàng.' },
  { icon: '🤲', title: '100% Handmade', desc: 'Không sản xuất hàng loạt — mỗi sản phẩm là duy nhất.' },
  { icon: '🎁', title: 'Quà tặng ý nghĩa', desc: 'Sản phẩm đẹp, nhỏ gọn, phù hợp nhiều dịp tặng quà.' },
  { icon: '💚', title: 'Giá phù hợp HSV', desc: 'Chất lượng tốt, giá cả hợp lý từ 40.000đ — phù hợp mọi ngân sách sinh viên.' },
]

export const galleryItems = [
  { id: 1, label: 'Lót ly hoa khô', category: 'lot-ly', image: '/assets/products/lot-ly-resin-01.jpg' },
  { id: 2, label: 'Móc khóa trái tim', category: 'moc-khoa', image: '/assets/products/moc-khoa-resin-01.jpg' },
  { id: 3, label: 'Bookmark cỏ ba lá', category: 'bookmark', image: '/assets/products/bookmark-resin-01.jpg' },
  { id: 4, label: 'Bộ sưu tập lót ly', category: 'lot-ly', image: '/assets/gallery/lot-ly-collection.png' },
  { id: 5, label: 'Bộ sưu tập móc khóa', category: 'moc-khoa', image: '/assets/gallery/moc-khoa-collection.png' },
  { id: 6, label: 'Bookmark hoa cúc', category: 'bookmark', image: '/assets/products/bookmark-resin-01.jpg' },
  { id: 7, label: 'Flat-lay sản phẩm R.A.W', category: 'lot-ly', image: '/assets/products/lot-ly-resin-01.jpg' },
  { id: 8, label: 'Móc khóa handmade', category: 'moc-khoa', image: '/assets/products/moc-khoa-resin-01.jpg' },
]
