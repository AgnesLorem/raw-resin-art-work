/**
 * siteContent.js — Static content/copy for the website.
 * Centralizes all text so it's easy to update without hunting through JSX.
 */

export const siteConfig = {
  name: 'R.A.W',
  fullName: 'R.A.W - Resin Art Work',
  tagline: 'Sản phẩm resin handmade cá nhân hóa',
  domain: 'resinartworkshop.id.vn',
  email: 'tainh.ce190387@gmail.com',
  social: {
    facebook: '#',
    instagram: '#',
    tiktok: '#',
  },
}

export const heroContent = {
  headline: 'Resin Art Work',
  subHeadline: 'Handmade · Cá nhân hóa · Từ trái tim',
  description:
    'Mỗi sản phẩm resin là một câu chuyện nhỏ — được tạo ra bằng tay, dành riêng cho bạn. Lót ly, móc khóa, thước học tập... tất cả đều có thể mang dấu ấn của bạn.',
  ctaText: 'Xem sản phẩm',
  ctaLink: '/san-pham',
  ctaSecondaryText: 'Về chúng tôi',
}

export const aboutContent = {
  label: 'Về R.A.W',
  title: 'Handmade từ tâm huyết',
  description:
    'R.A.W — Resin Art Work — là một dự án nhỏ sinh ra từ niềm đam mê với resin và nghề thủ công. Chúng mình tin rằng mỗi vật dụng nhỏ hằng ngày đều có thể trở thành một tác phẩm nghệ thuật khi được tạo ra bằng tay và bằng tình yêu.',
  highlights: [
    { icon: '✦', title: 'Hoàn toàn thủ công', desc: 'Từng sản phẩm được đổ tay, không sản xuất hàng loạt.' },
    { icon: '✦', title: 'Cá nhân hóa 100%', desc: 'Tên, màu sắc, họa tiết — theo ý bạn hoàn toàn.' },
    { icon: '✦', title: 'Chất liệu an toàn', desc: 'Resin epoxy và UV đã qua kiểm định, an toàn sử dụng.' },
    { icon: '✦', title: 'Giá thân thiện', desc: 'Được thiết kế cho học sinh, sinh viên và mọi ngân sách.' },
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
    desc: 'Sản phẩm được đổ khuôn thủ công, chờ đông cứng và đánh bóng hoàn thiện cẩn thận.',
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
  { icon: '💚', title: 'Giá phù hợp HSV', desc: 'Chất lượng tốt, giá từ 35.000đ — phù hợp mọi ngân sách sinh viên.' },
]

export const galleryItems = [
  { id: 1, label: 'Lót ly hoa khô', category: 'lot-ly' },
  { id: 2, label: 'Móc khóa trái tim', category: 'moc-khoa' },
  { id: 3, label: 'Thước pastel', category: 'thuoc' },
  { id: 4, label: 'Lót ly glitter vàng', category: 'lot-ly' },
  { id: 5, label: 'Móc khóa chữ cái', category: 'moc-khoa' },
  { id: 6, label: 'Lót ly ocean wave', category: 'lot-ly' },
  { id: 7, label: 'Thước hoa cúc', category: 'thuoc' },
  { id: 8, label: 'Móc khóa gấu', category: 'moc-khoa' },
]
