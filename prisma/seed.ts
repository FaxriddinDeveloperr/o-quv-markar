import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { regions } from "./uzbekistan";

const prisma = new PrismaClient();

type CourseSeed = {
  name: string;
  nameRu: string;
  price: number;
  durationMonths: number;
  description?: string;
};

type CenterSeed = {
  name: string;
  description: string;
  descriptionRu: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  telegramUrl?: string;
  logoUrl: string;
  photos: string[];
  rating: number;
  // Qaysi tumanga tegishli ("Region|District")
  region: string;
  district: string;
  courses: CourseSeed[];
  results: { title: string; imageUrl: string }[];
};

const pic = (id: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${id}/${w}/${h}`;

// ===== Kurs shablonlari =====
const C = {
  ielts: (p = 650000): CourseSeed => ({
    name: "Ingliz tili (IELTS)",
    nameRu: "Английский (IELTS)",
    price: p,
    durationMonths: 6,
    description: "Xalqaro imtihonga tayyorlash",
  }),
  english: (p = 500000): CourseSeed => ({
    name: "Umumiy ingliz tili",
    nameRu: "Общий английский",
    price: p,
    durationMonths: 4,
  }),
  russian: (p = 550000): CourseSeed => ({
    name: "Rus tili",
    nameRu: "Русский язык",
    price: p,
    durationMonths: 4,
  }),
  math: (p = 500000): CourseSeed => ({
    name: "Matematika",
    nameRu: "Математика",
    price: p,
    durationMonths: 6,
  }),
  frontend: (p = 900000): CourseSeed => ({
    name: "Frontend (React)",
    nameRu: "Frontend (React)",
    price: p,
    durationMonths: 6,
  }),
  python: (p = 950000): CourseSeed => ({
    name: "Python backend",
    nameRu: "Python backend",
    price: p,
    durationMonths: 6,
  }),
  design: (p = 700000): CourseSeed => ({
    name: "Grafik dizayn",
    nameRu: "Графический дизайн",
    price: p,
    durationMonths: 4,
  }),
  kids: (p = 400000): CourseSeed => ({
    name: "Bolalar uchun ingliz tili",
    nameRu: "Английский для детей",
    price: p,
    durationMonths: 4,
  }),
  korean: (p = 500000): CourseSeed => ({
    name: "Koreys tili",
    nameRu: "Корейский язык",
    price: p,
    durationMonths: 5,
  }),
  chemistry: (p = 500000): CourseSeed => ({
    name: "Kimyo",
    nameRu: "Химия",
    price: p,
    durationMonths: 6,
  }),
  physics: (p = 500000): CourseSeed => ({
    name: "Fizika",
    nameRu: "Физика",
    price: p,
    durationMonths: 6,
  }),
};

const r = (id: string, title: string) => ({
  title,
  imageUrl: pic(`cert-${id}`, 600, 400),
});

let seq = 0;
function mk(
  c: Omit<CenterSeed, "logoUrl" | "photos"> & {
    logoUrl?: string;
    photos?: string[];
  },
): CenterSeed {
  seq += 1;
  const slug = `c${seq}`;
  return {
    ...c,
    logoUrl: c.logoUrl ?? pic(`${slug}-logo`, 200, 200),
    photos: c.photos ?? [pic(`${slug}-1`), pic(`${slug}-2`), pic(`${slug}-3`)],
  };
}

// ===== Demo markazlar (Toshkent shahri + yirik viloyat shaharlari) =====
const centers: CenterSeed[] = [
  mk({
    region: "Toshkent shahri",
    district: "Chilonzor",
    name: "Everest Education",
    description:
      "Til o'rganish bo'yicha yetakchi markaz. Tajribali o'qituvchilar, kichik guruhlar va zamonaviy metodika.",
    descriptionRu:
      "Ведущий центр изучения языков. Опытные преподаватели, малые группы.",
    address: "Chilonzor tumani, Bunyodkor shoh ko'chasi 12",
    latitude: 41.2756,
    longitude: 69.2034,
    phone: "+998901234567",
    telegramUrl: "https://t.me/everest_edu",
    rating: 4.8,
    courses: [C.ielts(650000), C.russian(600000), C.english(500000)],
    results: [r("ev1", "IELTS 8.0 — Aziz"), r("ev2", "IELTS 7.5 — Malika")],
  }),
  mk({
    region: "Toshkent shahri",
    district: "Chilonzor",
    name: "IT Academy Chilonzor",
    description:
      "Dasturlash va IT yo'nalishlari: frontend, backend, mobil ilovalar va dizayn.",
    descriptionRu: "Программирование и IT: frontend, backend, дизайн.",
    address: "Chilonzor tumani, Qatortol ko'chasi 45",
    latitude: 41.2689,
    longitude: 69.2046,
    phone: "+998901112233",
    telegramUrl: "https://t.me/it_academy_uz",
    rating: 4.6,
    courses: [C.frontend(), C.python(), C.design()],
    results: [r("it1", "Bitiruvchilar 2024")],
  }),
  mk({
    region: "Toshkent shahri",
    district: "Mirobod",
    name: "IELTS Zone",
    description:
      "Faqat IELTS va xalqaro imtihonlarga ixtisoslashgan markaz. Mock testlar har hafta.",
    descriptionRu: "Центр, специализирующийся только на IELTS.",
    address: "Mirobod tumani, Oybek ko'chasi 18",
    latitude: 41.2995,
    longitude: 69.2701,
    phone: "+998935556677",
    telegramUrl: "https://t.me/ielts_zone",
    rating: 4.9,
    courses: [
      C.ielts(800000),
      { ...C.ielts(650000), name: "IELTS Standard", nameRu: "IELTS Standard" },
      {
        name: "Speaking Club",
        nameRu: "Speaking Club",
        price: 300000,
        durationMonths: 2,
      },
    ],
    results: [
      r("iz1", "IELTS 8.5 — Jasur"),
      r("iz2", "IELTS 8.0 — Nigora"),
      r("iz3", "IELTS 7.5 — Sardor"),
    ],
  }),
  mk({
    region: "Toshkent shahri",
    district: "Mirobod",
    name: "Result Academy",
    description:
      "Maktab o'quvchilari uchun aniq fanlar: matematika, fizika, kimyo.",
    descriptionRu: "Точные науки для школьников.",
    address: "Mirobod tumani, Shahrisabz ko'chasi 7",
    latitude: 41.3056,
    longitude: 69.2812,
    phone: "+998977778899",
    rating: 4.7,
    courses: [C.math(550000), C.physics(550000), C.chemistry(500000)],
    results: [r("rs1", "Milliy sertifikat 5+")],
  }),
  mk({
    region: "Toshkent shahri",
    district: "Yunusobod",
    name: "Cambridge School",
    description:
      "Cambridge dasturi bo'yicha bolalar va kattalar uchun ingliz tili.",
    descriptionRu: "Английский по программе Cambridge.",
    address: "Yunusobod tumani, Amir Temur ko'chasi 108",
    latitude: 41.3621,
    longitude: 69.2876,
    phone: "+998901239876",
    telegramUrl: "https://t.me/cambridge_school_uz",
    rating: 4.8,
    courses: [
      C.english(700000),
      C.kids(450000),
      {
        name: "Business English",
        nameRu: "Business English",
        price: 850000,
        durationMonths: 4,
      },
    ],
    results: [r("cb1", "KET/PET natijalar")],
  }),
  mk({
    region: "Toshkent shahri",
    district: "Yunusobod",
    name: "Najot Ta'lim",
    description:
      "IT va dasturlash bo'yicha amaliy kurslar. Loyihaga asoslangan ta'lim.",
    descriptionRu: "Практические IT-курсы. Проектное обучение.",
    address: "Yunusobod tumani, Bobur ko'chasi 24",
    latitude: 41.3548,
    longitude: 69.2891,
    phone: "+998977001122",
    telegramUrl: "https://t.me/najottalim",
    rating: 4.7,
    courses: [
      {
        name: "Full Stack (JS)",
        nameRu: "Full Stack (JS)",
        price: 1000000,
        durationMonths: 8,
      },
      {
        name: "Mobil (Flutter)",
        nameRu: "Мобильная (Flutter)",
        price: 950000,
        durationMonths: 6,
      },
      C.design(750000),
    ],
    results: [r("nj1", "Ishga joylashganlar")],
  }),
  mk({
    region: "Toshkent shahri",
    district: "Shayxontohur",
    name: "Al-Khorezmi Academy",
    description:
      "Aniq fanlar va dasturlash bo'yicha kuchli tayyorgarlik. Olimpiadachilar markazi.",
    descriptionRu: "Сильная подготовка по точным наукам.",
    address: "Shayxontohur tumani, Navoiy ko'chasi 30",
    latitude: 41.3267,
    longitude: 69.235,
    phone: "+998901777888",
    rating: 4.8,
    courses: [C.math(600000), C.physics(580000), C.python(900000)],
    results: [r("ak1", "Olimpiada g'oliblari")],
  }),
  // ===== Viloyatlar =====
  mk({
    region: "Samarqand viloyati",
    district: "Samarqand shahri",
    name: "Registon Til Markazi",
    description:
      "Samarqanddagi yetakchi til markazi. Ingliz, rus va koreys tillari.",
    descriptionRu: "Ведущий языковой центр Самарканда.",
    address: "Samarqand sh., Registon ko'chasi 15",
    latitude: 39.6542,
    longitude: 66.9597,
    phone: "+998902101010",
    rating: 4.7,
    courses: [C.ielts(600000), C.english(450000), C.korean(480000)],
    results: [r("sm1", "IELTS natijalar")],
  }),
  mk({
    region: "Buxoro viloyati",
    district: "Buxoro shahri",
    name: "Buxoro Academy",
    description: "Til va IT kurslari. Buxoro markazida zamonaviy bino.",
    descriptionRu: "Языковые и IT-курсы в центре Бухары.",
    address: "Buxoro sh., Mustaqillik ko'chasi 7",
    latitude: 39.7686,
    longitude: 64.4214,
    phone: "+998902202020",
    rating: 4.6,
    courses: [C.english(420000), C.frontend(800000), C.math(450000)],
    results: [r("bx1", "Bitiruvchilar")],
  }),
  mk({
    region: "Andijon viloyati",
    district: "Andijon shahri",
    name: "Andijon Bilim",
    description: "Andijondagi til va aniq fanlar markazi.",
    descriptionRu: "Центр языков и точных наук в Андижане.",
    address: "Andijon sh., Bobur shoh ko'chasi 22",
    latitude: 40.7821,
    longitude: 72.3442,
    phone: "+998902303030",
    rating: 4.5,
    courses: [C.ielts(550000), C.russian(400000), C.chemistry(420000)],
    results: [r("an1", "O'quvchilar yutuqlari")],
  }),
  mk({
    region: "Farg'ona viloyati",
    district: "Farg'ona shahri",
    name: "Fergana English Hub",
    description: "Ingliz tili va IELTS bo'yicha ixtisoslashgan markaz.",
    descriptionRu: "Центр английского языка и IELTS.",
    address: "Farg'ona sh., Mustaqillik ko'chasi 40",
    latitude: 40.3864,
    longitude: 71.7864,
    phone: "+998902404040",
    rating: 4.6,
    courses: [C.ielts(580000), C.english(440000), C.kids(380000)],
    results: [r("fg1", "IELTS natijalar")],
  }),
  mk({
    region: "Namangan viloyati",
    district: "Namangan shahri",
    name: "Namangan IT School",
    description: "Dasturlash va dizayn kurslari. Amaliyotga yo'naltirilgan.",
    descriptionRu: "Курсы программирования и дизайна.",
    address: "Namangan sh., Navoiy ko'chasi 11",
    latitude: 40.9983,
    longitude: 71.6726,
    phone: "+998902505050",
    rating: 4.5,
    courses: [C.frontend(780000), C.python(820000), C.design(650000)],
    results: [r("nm1", "Loyiha himoyalari")],
  }),
];

async function main() {
  console.log("🌱 Seed boshlandi...");

  await prisma.lead.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.centerResult.deleteMany();
  await prisma.course.deleteMany();
  await prisma.center.deleteMany();
  await prisma.district.deleteMany();
  await prisma.region.deleteMany();

  // district nomi -> id (markazlarni biriktirish uchun) "Region|District"
  const districtId = new Map<string, string>();

  for (const reg of regions) {
    const region = await prisma.region.create({
      data: { name: reg.name, nameRu: reg.nameRu, order: reg.order },
    });
    let order = 1;
    for (const [name, nameRu] of reg.districts) {
      const d = await prisma.district.create({
        data: { name, nameRu, order: order++, regionId: region.id },
      });
      districtId.set(`${reg.name}|${name}`, d.id);
    }
    console.log(`📍 ${reg.name} — ${reg.districts.length} tuman`);
  }

  let centerCount = 0;
  for (const c of centers) {
    const dId = districtId.get(`${c.region}|${c.district}`);
    if (!dId) {
      console.warn(`⚠️  Tuman topilmadi: ${c.region}|${c.district}`);
      continue;
    }
    await prisma.center.create({
      data: {
        name: c.name,
        description: c.description,
        descriptionRu: c.descriptionRu,
        districtId: dId,
        address: c.address,
        latitude: c.latitude,
        longitude: c.longitude,
        phone: c.phone,
        telegramUrl: c.telegramUrl,
        logoUrl: c.logoUrl,
        photos: c.photos,
        rating: c.rating,
        viewsCount: Math.floor(c.rating * 100),
        courses: { create: c.courses },
        results: { create: c.results },
      },
    });
    centerCount += 1;
  }

  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.upsert({
    where: { username },
    update: { passwordHash, role: "SUPERADMIN" },
    create: { username, passwordHash, role: "SUPERADMIN" },
  });
  console.log(`👤 Admin: ${username} / ${password}`);

  const counts = {
    viloyatlar: await prisma.region.count(),
    tumanlar: await prisma.district.count(),
    markazlar: await prisma.center.count(),
    kurslar: await prisma.course.count(),
  };
  console.log(`🏫 ${centerCount} demo markaz qo'shildi`);
  console.log("✅ Seed tugadi:", counts);
}

main()
  .catch((e) => {
    console.error("❌ Seed xatosi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
