// ===================== SUPER KART RACING — HẰNG SỐ VÀ DỮ LIỆU =====================
// Đơn vị: mét, giây, radian. Hướng xe: yaw = 0 là nhìn về phía +z, xe tiến theo (sin yaw, cos yaw). Lái phải = yaw giảm.
const KHOA_LUU = 'superkart2_luu';
const DAI_DUONG = 10000;                 // mỗi đường đua dài đúng 10 km (một vòng)
const KM_DUONG = DAI_DUONG / 1000;
const DS = 2;                            // đường tâm chia mỗi 2 m một điểm
const RONG_DUONG = 14;                   // nửa bề rộng mặt đường (đường rộng 28 m)
const RONG_LE = 8;                       // dải lề ngoài mặt đường (chậm hơn), ngoài nữa là rào chắn
const LE_HE = 0.55;                      // chạy trên lề: tốc độ tối đa còn bấy nhiêu phần
const BAN_KINH_XE = 2.1;                 // xe là vòng tròn bán kính này khi va chạm nhau
const KHUC = 250;                        // đường được dựng và dọn theo từng khúc 250 m quanh người chơi
const DAI_VUNG = 1000;                   // cứ 1 km đổi một khung cảnh, ngăn cách bằng đường hầm
const HAM_DAI = 160, HAM_R = RONG_DUONG + RONG_LE + 4;   // đường hầm dài 160 m, bán kính vòm
// ----- chạy xe -----
const V_GOC = 80;                        // tốc độ tối đa xe gốc: 80 m/s = 288 km/h
const V_TRAN = 500 / 3.6;                // không xe nào vượt 500 km/h
const GA_GOC = 30, PHANH = 55, MAT_GA = 7, LUI_MAX = 14;
const TOC_QUAY = 2.2, V_QUAY = 70;       // tốc độ quay thân xe tối đa; càng nhanh càng khó bẻ cua
const BAM_GOC = 6;                       // độ bám ngang
const TRONG_LUC = 28;                    // trọng lực (mạnh hơn thật một chút cho cú nhảy gọn)
// ----- drift, Nitro, cú nhảy, combo -----
const DRIFT_V = 38;                      // phải nhanh hơn chừng này mới drift được
const DRIFT_MOC = [0.9, 1.9, 3.1];        // giữ drift đủ lâu: xanh → cam → tím
const DRIFT_THUONG = [{ giay: 0.6, nitro: 8, mau: 0x4ab4ff }, { giay: 1.0, nitro: 15, mau: 0xff9a2a }, { giay: 1.5, nitro: 25, mau: 0xc05aff }];
const NITRO_MAX = 100, NITRO_TIEU = 26, NITRO_BAN_DAU = 40, NITRO_V = 1.39, NITRO_GA = 2.2;
const NITRO_XU = 3, NITRO_DRIFT = 6, NITRO_BAY = 12;   // nhặt xu +3, đang drift +6/giây, bay xa (> 0,7 s) +12
const XUNG_V = 1.25, XUNG_GIAY = 1.2;    // ô tăng tốc và cú phóng sau drift
const COMBO_GIAY = 1.6;                  // nhặt xu liên tiếp trong khoảng này thì combo tăng
const COMBO_BAC = [[30, 5], [20, 4], [10, 3], [5, 2], [0, 1]];   // [combo từ, nhân xu]
// ----- cuộc đua -----
const GIAY_DEM = 3.2;
const SLOWMO_GIAY = 3.0, SLOWMO_HE = 0.22;   // về đích: chậm lại 3 giây (thời gian chạy bằng 22%)
const XU_HANG = [500, 350, 250, 180, 120, 80, 60];
const NGHI_MAT_GIAY = 900;
const FB = 1 / 120;                      // bước vật lý cố định (120 lần mỗi giây cho mượt ở 500 km/h)

const MAU_XE = [0xff4a2a, 0x2a7aff, 0xffc83a, 0x3acb5a, 0xb05aff, 0xff6ab8, 0xf4f4f4, 0x24242e, 0x2ee6e6, 0xff8a1a];
const TEN_MAU = ['Đỏ', 'Xanh dương', 'Vàng', 'Xanh lá', 'Tím', 'Hồng', 'Trắng', 'Đen', 'Xanh ngọc', 'Cam'];

// ----- mức khó của máy (nhân thêm với độ khó riêng của từng đường) -----
const DO_KHO = {
  de:  { ten: 'Dễ',        v: 0.9,  sai: 1.0, phanUng: 0.4,  nitro: 0.4, hung: 0.25, keo: 0.08, mt: 'Máy chạy chậm hơn và hay sai.' },
  vua: { ten: 'Trung bình', v: 1.0,  sai: 0.5, phanUng: 0.25, nitro: 0.7, hung: 0.55, keo: 0.05, mt: 'Vừa sức, cạnh tranh sòng phẳng.' },
  kho: { ten: 'Khó',        v: 1.06, sai: 0.2, phanUng: 0.12, nitro: 1.0, hung: 0.9,  keo: 0.02, mt: 'Máy chạy sát giới hạn và rất lì.' }
};

// NHAN_VAT (30 nhân vật) nằm ở a1_nhanvat.js
// ----- 2 Boss. Boss mạnh hơn, có tuyệt chiêu "Sóng Sấm" làm chậm xe phía sau gần nó (có cảnh báo trước 1 giây).
const BOSS = {
  bangvuong: { id: 'bangvuong', hinh: 'Vua Chim Cánh Cụt', ten: 'Băng Vương', mau: 0x7ad8ff, phu: 0xffffff, xe: 10, v: 1.06, aga: 1.3, abam: 1.25, anitro: 1.0, axu: 0.2, hung: 0.7, sai: 0.3, chieu: 22 },
  vuatocdo: { id: 'vuatocdo', hinh: 'Vua Sư Tử', ten: 'Vua Tốc Độ', mau: 0xffd23a, phu: 0x2a0a40, xe: 19, v: 1.1, aga: 1.4, abam: 1.3, anitro: 1.3, axu: 0.2, hung: 0.9, sai: 0.2, chieu: 18 }
};

// ----- 20 mẫu xe. than: hop/tron/nhon/det/cao/f1 · canh: cánh gió sau 0-3 · truoc: cánh trước · xa: số ống xả · banh: bán kính bánh
// vay: vây hai bên · long: khung chống lật · soc: sọc dọc · sang: đèn gầm. vmax/ga/bam/nit: hệ số. gia: xu; mo: điều kiện mở khác
const XE = [
  { id: 'x01', ten: 'Tia Chớp Nhí',  than: 'hop',  canh: 1, xa: 2, banh: 0.6,  mau: 0, phu: 0xffffff, vmax: 1.00, ga: 1.00, bam: 1.00, nit: 1.00, gia: 0 },
  { id: 'x02', ten: 'Ong Vàng',      than: 'tron', canh: 0, xa: 1, banh: 0.55, mau: 2, phu: 0x24242e, soc: 1, vmax: 1.02, ga: 1.12, bam: 1.02, nit: 1.00, gia: 600 },
  { id: 'x03', ten: 'Báo Đỏ',        than: 'nhon', canh: 1, xa: 2, banh: 0.58, mau: 0, phu: 0xffd23a, vmax: 1.05, ga: 1.08, bam: 1.05, nit: 1.05, gia: 1200 },
  { id: 'x04', ten: 'Cá Mập Xanh',   than: 'det',  canh: 1, xa: 2, banh: 0.56, mau: 1, phu: 0xffffff, vay: 1, vmax: 1.06, ga: 1.05, bam: 1.10, nit: 1.05, gia: 1800 },
  { id: 'x05', ten: 'Sấm Xanh',      than: 'cao',  canh: 0, xa: 4, banh: 0.7,  mau: 3, phu: 0x24242e, long: 1, vmax: 1.05, ga: 1.18, bam: 1.12, nit: 1.10, gia: 2500 },
  { id: 'x06', ten: 'Bóng Đêm',      than: 'det',  canh: 2, xa: 2, banh: 0.56, mau: 7, phu: 0xff3a4a, sang: 1, vmax: 1.09, ga: 1.10, bam: 1.12, nit: 1.15, gia: 3200 },
  { id: 'x07', ten: 'Hỏa Tiễn',      than: 'f1',   canh: 3, xa: 3, banh: 0.6,  mau: 9, phu: 0x24242e, truoc: 1, vmax: 1.10, ga: 1.15, bam: 1.05, nit: 1.25, gia: 4000 },
  { id: 'x08', ten: 'Kỳ Lân Hồng',   than: 'tron', canh: 1, xa: 2, banh: 0.58, mau: 5, phu: 0xffffff, soc: 1, sang: 1, vmax: 1.10, ga: 1.18, bam: 1.15, nit: 1.10, gia: 4800 },
  { id: 'x09', ten: 'Xe Ủi Mini',    than: 'cao',  canh: 1, xa: 4, banh: 0.78, mau: 2, phu: 0x24242e, long: 1, vmax: 1.08, ga: 1.15, bam: 1.25, nit: 1.10, gia: 5600 },
  { id: 'x10', ten: 'Phượng Lửa',    than: 'nhon', canh: 2, xa: 3, banh: 0.6,  mau: 9, phu: 0xffd23a, vay: 1, vmax: 1.13, ga: 1.20, bam: 1.12, nit: 1.20, gia: 6500 },
  { id: 'x11', ten: 'Băng Tuyết',    than: 'det',  canh: 1, xa: 2, banh: 0.58, mau: 8, phu: 0xffffff, soc: 1, sang: 1, vmax: 1.14, ga: 1.18, bam: 1.20, nit: 1.15, gia: 7500 },
  { id: 'x12', ten: 'Rồng Vàng',     than: 'f1',   canh: 2, xa: 2, banh: 0.6,  mau: 2, phu: 0xff3a3a, truoc: 1, vmax: 1.16, ga: 1.22, bam: 1.15, nit: 1.20, gia: 8600 },
  { id: 'x13', ten: 'Sư Tử Thép',    than: 'hop',  canh: 2, xa: 4, banh: 0.64, mau: 6, phu: 0xffc83a, soc: 1, vmax: 1.16, ga: 1.25, bam: 1.18, nit: 1.25, gia: 9800 },
  { id: 'x14', ten: 'Thiên Thạch',   than: 'nhon', canh: 3, xa: 3, banh: 0.6,  mau: 4, phu: 0x2ee6e6, vay: 1, sang: 1, vmax: 1.18, ga: 1.22, bam: 1.20, nit: 1.30, gia: 11000 },
  { id: 'x15', ten: 'Ninja Tím',     than: 'det',  canh: 2, xa: 2, banh: 0.57, mau: 4, phu: 0x24242e, vay: 1, vmax: 1.19, ga: 1.25, bam: 1.30, nit: 1.25, gia: 12500 },
  { id: 'x16', ten: 'Siêu Xe Bạc',   than: 'f1',   canh: 2, xa: 4, banh: 0.6,  mau: 6, phu: 0x2a7aff, truoc: 1, soc: 1, vmax: 1.21, ga: 1.28, bam: 1.25, nit: 1.30, gia: 14000 },
  { id: 'x17', ten: 'Quái Thú',      than: 'cao',  canh: 2, xa: 4, banh: 0.8,  mau: 7, phu: 0x3acb5a, long: 1, sang: 1, vmax: 1.20, ga: 1.32, bam: 1.30, nit: 1.30, gia: 16000 },
  { id: 'x18', ten: 'Lốc Xoáy',      than: 'tron', canh: 3, xa: 3, banh: 0.6,  mau: 8, phu: 0xff6ab8, sang: 1, vmax: 1.23, ga: 1.30, bam: 1.28, nit: 1.40, gia: 18000 },
  { id: 'x19', ten: 'Huyền Thoại',   than: 'f1',   canh: 3, xa: 4, banh: 0.62, mau: 2, phu: 0x24242e, truoc: 1, vay: 1, sang: 1, vmax: 1.24, ga: 1.34, bam: 1.32, nit: 1.45, gia: 0, mo: { huyVang: 8 } },
  { id: 'x20', ten: 'Ngân Hà Tối Thượng', than: 'nhon', canh: 3, xa: 4, banh: 0.62, mau: 7, phu: 0xc05aff, truoc: 1, vay: 1, sang: 1, soc: 1, vmax: 1.25, ga: 1.35, bam: 1.35, nit: 1.50, gia: 0, mo: { boss: 'vuatocdo' } },
  { id: 'x21', loai: 'moto', kieu: 'phuot', ten: 'Xe Máy Én Nhỏ', banh: 0.62, mau: 8, phu: 0xffffff, vmax: 1.03, ga: 1.15, bam: 0.96, nit: 1.00, gia: 900 },
  { id: 'x22', loai: 'moto', kieu: 'cao', ten: 'Xe Máy Sóc Bùn', banh: 0.7, mau: 9, phu: 0x24242e, vmax: 1.06, ga: 1.20, bam: 1.00, nit: 1.05, gia: 2200 },
  { id: 'x23', loai: 'moto', kieu: 'dua', ten: 'Xe Máy Mũi Tên Đỏ', banh: 0.62, mau: 0, phu: 0xffffff, vmax: 1.12, ga: 1.18, bam: 1.02, nit: 1.15, gia: 4200 },
  { id: 'x24', loai: 'moto', kieu: 'cao', ten: 'Xe Máy Bão Cát', banh: 0.72, mau: 2, phu: 0x24242e, sang: 1, vmax: 1.15, ga: 1.28, bam: 1.10, nit: 1.15, gia: 7000 },
  { id: 'x25', loai: 'moto', kieu: 'dua', ten: 'Xe Máy Ninja Gió', banh: 0.62, mau: 4, phu: 0x2ee6e6, vmax: 1.20, ga: 1.25, bam: 1.14, nit: 1.30, gia: 10500 },
  { id: 'x26', loai: 'moto', kieu: 'dua', ten: 'Xe Máy Bóng Ma', banh: 0.64, mau: 7, phu: 0xff3a4a, sang: 1, vmax: 1.24, ga: 1.30, bam: 1.20, nit: 1.40, gia: 15000 }
];

// ----- 10 đường đua, khó dần. rMin: khúc cua gắt nhất (m); doc: độ cao đồi (m); nhay: số dốc nhảy; vat: chướng ngại mỗi km; ai: hệ số tốc độ máy
// dat/le/xa: màu đất gần đường, màu lề, màu nền xa; dem: đường đêm (nhiều đèn); cay: kiểu cây; boss: có Boss
const DUONG = [
  { id: 'dongco',   ten: 'Đồng Cỏ Xanh',     icon: '🌿', rMin: 900, doc: 6,  nhay: 4,  vat: 0.5, ai: 0.80, troi: 0x6ec8ff, suong: 0xdff4ff, dat: 0x5cc85a, le: 0x86dc6e, xa: 0x4ab04a, duong: '#4d525e', cay: 'tron', mauCay: 0x2f9e44 },
  { id: 'bien',     ten: 'Bờ Biển Nắng',     icon: '🏖️', rMin: 750, doc: 8,  nhay: 6,  vat: 0.6, ai: 0.84, troi: 0x5ac0ff, suong: 0xe8f8ff, dat: 0xf0d896, le: 0xf8e6b0, xa: 0x2a9ad8, duong: '#b89a6a', cay: 'co', mauCay: 0x3fae4a, nuoc: 1 },
  { id: 'samac',    ten: 'Sa Mạc Vàng',      icon: '🏜️', rMin: 600, doc: 12, nhay: 8,  vat: 0.8, ai: 0.87, troi: 0xffc27a, suong: 0xfff0cf, dat: 0xe3be76, le: 0xf0d28f, xa: 0xd8aa60, duong: '#5d5650', cay: 'xuongrong', mauCay: 0x3f9a4a },
  { id: 'rung',     ten: 'Rừng Thông',       icon: '🌲', rMin: 480, doc: 14, nhay: 8,  vat: 1.0, ai: 0.89, troi: 0x8ac8ff, suong: 0xd8ecf4, dat: 0x3f9a4a, le: 0x6ab86a, xa: 0x2f7a3a, duong: '#4a4e58', cay: 'thong', mauCay: 0x1f6a46 },
  { id: 'tuyet',    ten: 'Núi Tuyết',        icon: '🏔️', rMin: 420, doc: 18, nhay: 10, vat: 1.1, ai: 0.90, troi: 0x9ec8ff, suong: 0xeef6ff, dat: 0xeaf2ff, le: 0xffffff, xa: 0xdfe8f5, duong: '#5a606c', cay: 'thong', mauCay: 0x2a5a4a, boss: 'bangvuong' },
  { id: 'thanhpho', ten: 'Thành Phố Đêm',    icon: '🌃', rMin: 360, doc: 14, nhay: 8,  vat: 1.2, ai: 0.92, troi: 0x0a1030, suong: 0x1a2050, dat: 0x30364a, le: 0x40465a, xa: 0x22283a, duong: '#2a2d36', cay: 'nha', mauCay: 0x5a6a9a, dem: 1 },
  { id: 'nuilua',   ten: 'Núi Lửa',          icon: '🌋', rMin: 320, doc: 28, nhay: 14, vat: 1.4, ai: 0.94, troi: 0x6a2a2a, suong: 0x8a4a3a, dat: 0x3a2a2a, le: 0x5a3a30, xa: 0xff5a1a, duong: '#34302e', cay: 'da', mauCay: 0x2a2020, nuoc: 2 },
  { id: 'hemnui',   ten: 'Hẻm Núi Đá',       icon: '⛰️', rMin: 260, doc: 22, nhay: 10, vat: 1.6, ai: 0.95, troi: 0xffb07a, suong: 0xffe0c0, dat: 0xb8704a, le: 0xd08a5a, xa: 0x9a5a3a, duong: '#57504c', cay: 'da', mauCay: 0x8a4a2a },
  { id: 'may',      ten: 'Đảo Mây Cầu Vồng', icon: '🌈', rMin: 270, doc: 26, nhay: 16, vat: 1.4, ai: 0.97, troi: 0x8ad0ff, suong: 0xf4f8ff, dat: 0xb8ecff, le: 0xffffff, xa: 0xffffff, duong: '#6a5a8a', cay: 'may', mauCay: 0xffffff },
  { id: 'nganha',   ten: 'Đại Lộ Ngân Hà',   icon: '🌌', rMin: 230, doc: 30, nhay: 16, vat: 1.8, ai: 1.00, troi: 0x050318, suong: 0x140a3a, dat: 0x1a103a, le: 0x2a1a5a, xa: 0x0a0620, duong: '#1c1830', cay: 'tinhthe', mauCay: 0x8a5aff, dem: 1, boss: 'vuatocdo' }
];

// ----- 10 thử thách: thắng đường thứ i thì mở thử thách thứ i. loai: xu/nhay/gio/drift/doi/combo/sach
// thời gian giới hạn của thử thách 'gio' = độ dài đường ÷ muc (m/s)
const THU_THACH = [
  { id: 't1', duong: 0, ten: 'Thợ Săn Xu',        loai: 'xu',    muc: 120,  mt: 'Nhặt ít nhất 120 xu trong một cuộc đua và về đích', thuong: 600 },
  { id: 't2', duong: 1, ten: 'Bay Trên Biển',     loai: 'nhay',  muc: 2,    mt: 'Bay lên không ít nhất 2 lần (qua dốc hoặc đỉnh đồi) và về đích', thuong: 700 },
  { id: 't3', duong: 2, ten: 'Đua Với Thời Gian', loai: 'gio',   muc: 70,   mt: 'Chạy một mình, về đích trước thời gian giới hạn', thuong: 800 },
  { id: 't4', duong: 3, ten: 'Vua Drift',         loai: 'drift', muc: 800,  mt: 'Drift tổng cộng ít nhất 800 m và về đích', thuong: 900 },
  { id: 't5', duong: 4, ten: 'Song Đấu Shadow',   loai: 'doi',   muc: 'shadow', mt: 'Đua tay đôi với Shadow (mức Khó). Về trước là thắng', thuong: 1000 },
  { id: 't6', duong: 5, ten: 'Combo Ánh Đèn',     loai: 'combo', muc: 25,   mt: 'Nhặt liên tiếp 25 xu không đứt chuỗi', thuong: 1100 },
  { id: 't7', duong: 6, ten: 'Lái Sạch',          loai: 'sach',  muc: 3,    mt: 'Về trong top 3 mà không chạm rào lần nào', thuong: 1300 },
  { id: 't8', duong: 7, ten: 'Tia Chớp Hẻm Núi',  loai: 'gio',   muc: 76,   mt: 'Chạy một mình, về đích trước thời gian giới hạn', thuong: 1500 },
  { id: 't9', duong: 8, ten: 'Chim Trên Mây',     loai: 'nhay',  muc: 5,    mt: 'Bay lên không ít nhất 5 lần và về đích', thuong: 1700 },
  { id: 't10', duong: 9, ten: 'Tay Đôi Với Vua',  loai: 'doi',   muc: 'vuatocdo', mt: 'Đua tay đôi với Boss Vua Tốc Độ. Về trước là thắng', thuong: 2500 }
];

// ----- nhiệm vụ dài hạn (không có nhiệm vụ hằng ngày, không ép đăng nhập). dk(tk, LUU) trả về [đã đạt, cần]
const NHIEM_VU = [
  { id: 'n1', ten: 'Tay Lái Mới',       mt: 'Lái tổng cộng 50 km',            dk: (t) => [t.km, 50], thuong: 300 },
  { id: 'n2', ten: 'Đường Trường',      mt: 'Lái tổng cộng 300 km',           dk: (t) => [t.km, 300], thuong: 1000 },
  { id: 'n3', ten: 'Vạn Dặm',           mt: 'Lái tổng cộng 1000 km',          dk: (t) => [t.km, 1000], thuong: 3000 },
  { id: 'n4', ten: 'Nghệ Sĩ Drift',     mt: 'Drift tổng cộng 10 km',          dk: (t) => [t.drift / 1000, 10], thuong: 800 },
  { id: 'n5', ten: 'Chim Sắt',          mt: 'Bay lên không 100 lần',          dk: (t) => [t.nhay, 100], thuong: 800 },
  { id: 'n6', ten: 'Cú Bay Thế Kỷ',     mt: 'Một cú bay xa 250 m',            dk: (t) => [t.nhayXa, 250], thuong: 1000 },
  { id: 'n7', ten: 'Tốc Độ Ánh Sáng',   mt: 'Đạt 500 km/h',                   dk: (t) => [t.vMax, 500], thuong: 1200 },
  { id: 'n8', ten: 'Chuỗi Vàng',        mt: 'Combo 50 xu liên tiếp',          dk: (t) => [t.combo, 50], thuong: 900 },
  { id: 'n9', ten: 'Hũ Xu Khổng Lồ',    mt: 'Nhặt tổng cộng 5000 xu',         dk: (t) => [t.xuTong, 5000], thuong: 1500 },
  { id: 'n10', ten: 'Nhà Vô Địch',      mt: 'Về nhất 5 cuộc đua',             dk: (t) => [t.thang, 5], thuong: 1500 },
  { id: 'n11', ten: 'Hạ Gục Boss',      mt: 'Về đích trước Boss một lần',    dk: (t) => [t.boss, 1], thuong: 1500 },
  { id: 'n12', ten: 'Nhà Thám Hiểm',    mt: 'Tìm 10 hộp quà bí mật',          dk: (t) => [t.qua, 10], thuong: 1200 },
  { id: 'n13', ten: 'Chinh Phục',       mt: 'Hoàn thành 5 thử thách',         dk: (t) => [t.thuThach, 5], thuong: 2000 },
  { id: 'n14', ten: 'Nhà Sưu Tập',      mt: 'Sở hữu 6 chiếc xe',              dk: (t, L) => [L.xe.length, 6], thuong: 1500 },
  { id: 'n15', ten: 'Không Cần Nitro',  mt: 'Về nhất mà không dùng Nitro',    dk: (t) => [t.thangKhongNitro, 1], thuong: 1200 },
  { id: 'n16', ten: 'Bậc Thầy Vượt',    mt: 'Vượt đối thủ tổng cộng 200 lượt', dk: (t) => [t.vuot, 200], thuong: 1000 },
  { id: 'n17', ten: 'Huyền Thoại Đường Đua', mt: 'Về nhất cả 10 đường đua',       dk: (t, L) => [DUONG.filter(d => (L.duong[d.id] || {}).hang === 1).length, 10], thuong: 5000 }
];
// Phần thưởng bất ngờ nhưng KHÔNG ngẫu nhiên: hộp quà bí mật đặt cố định trên đường (luôn ở đúng chỗ đó),
// quà cột mốc mỗi 100 km, quà lần đầu làm được kỳ tích. Không có vòng quay, không có hộp may rủi.
const QUA_BI_MAT = [300, 500, 800];
const QUA_MOC_KM = 100, QUA_MOC_XU = 500;

// ----- 3 mức đồ họa. xa: tầm nhìn (m); cay: số cây mỗi khúc 400 m; co: khóm cỏ mỗi khúc
const DO_HOA = {
  nhe:   { ten: 'Nhẹ',    pr: 1,   bong: 0,    vungBong: 50, msaa: 0, phatSang: false, xa: 900,  cay: 14, co: 0,    trangTri: false, mt: 'Cho máy yếu: tầm nhìn gần, không bóng đổ.' },
  dep:   { ten: 'Đẹp',    pr: 1.5, bong: 2048, vungBong: 60, msaa: 4, phatSang: true,  xa: 1600, cay: 30, co: 300,  trangTri: true,  mt: 'Bóng đổ, phát sáng, cỏ hoa.' },
  toida: { ten: 'Tối đa', pr: 2,   bong: 4096, vungBong: 80, msaa: 8, phatSang: true,  xa: 2600, cay: 55, co: 1100, trangTri: true,  mt: 'Mạnh nhất: nhìn xa 2,6 km, bóng đổ sắc, rất nhiều cây cỏ.' }
};

const LUU_MAC_DINH = {
  xu: 0, xe: ['x01'], xeDang: 'x01', mau: {}, nhanVat: 'speedy', kho: 'vua', doHoa: null, gaTuDong: null, tat: false, camXa: false, daXemHD: false, nvMo: ['speedy', 'luna', 'turbo', 'flash', 'robo', 'fox'],
  duong: {}, thuThach: {}, nhiemVu: {}, mocKm: 0, kyTich: {},
  tk: { km: 0, giay: 0, dua: 0, thang: 0, bucVinh: 0, boss: 0, vMax: 0, nhayXa: 0, nhay: 0, drift: 0, combo: 0, xuTong: 0, vuot: 0, qua: 0, thuThach: 0, thangKhongNitro: 0, tuong: 0 }
};
