import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);


export interface ReviewFormData {
  experience: string;
  service: string;
  location: string;
}

export async function generateReview(formData: ReviewFormData): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Retry configuration for handling temporary service outages
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  // Add randomization elements
  const satisfactionWords = ['sangat puas', 'puas banget', 'recommended banget', 'highly recommended', 'sangat memuaskan'];
  const serviceWords = ['pelayanan baik', 'pelayanan sangat ramah', 'service excellent', 'pelayanan memuaskan', 'staff yang ramah'];
  const qualityWords = ['berkualitas', 'bagus banget', 'kualitas terbaik', 'pilihan lengkap', 'variatif'];
  
  const randomSatisfaction = satisfactionWords[Math.floor(Math.random() * satisfactionWords.length)];
  const randomService = serviceWords[Math.floor(Math.random() * serviceWords.length)];
  const randomQuality = qualityWords[Math.floor(Math.random() * qualityWords.length)];
  
  const styleVariations = [
    'casual dan natural',
    'antusias dan bersemangat', 
    'profesional dan informatif',
    'personal dan hangat',
    'singkat dan to the point'
  ];
  const randomStyle = styleVariations[Math.floor(Math.random() * styleVariations.length)];
  
  const openingVariations = [
    'Langsung mulai dengan pengalaman',
    'Mulai dengan menyebut produk/layanan',
    'Awali dengan perasaan kepuasan',
    'Mulai dengan rekomendasi',
    'Langsung ke detail pengalaman'
  ];
  const randomOpening = openingVariations[Math.floor(Math.random() * openingVariations.length)];

  const prompt = `
Tulis review Google UNIK dalam bahasa Indonesia untuk Optik LOOV ${formData.location}.

Data pelanggan:
- Pengalaman: ${formData.experience}
- Layanan/produk UTAMA: ${formData.service}
- Lokasi: Optik LOOV ${formData.location}

VARIASI KATA YANG HARUS DIGUNAKAN:
- Kepuasan: "${randomSatisfaction}"
- Pelayanan: "${randomService}" 
- Kualitas: "${randomQuality}"

GAYA PENULISAN: ${randomStyle}
CARA MEMULAI: ${randomOpening}

FOKUS UTAMA REVIEW:
- Jika produk "softlens" atau "soft lens" atau "kontak lens": Bahas tentang softlens, kenyamanan, pilihan merek, cara pakai
- Jika produk "kacamata baca" atau "reading glasses": Bahas tentang kacamata baca, ketajaman, frame yang cocok untuk baca
- Jika produk "kacamata minus" atau "kacamata miopi": Bahas tentang kacamata minus, lensa yang tepat, frame pilihan
- Jika produk "kacamata plus" atau "presbyopia": Bahas tentang kacamata plus, solusi rabun dekat
- Jika produk "frame" atau "bingkai": Bahas tentang pilihan frame, model, kualitas bingkai
- Jika produk "lensa progresif": Bahas tentang lensa progresif, multifokus, adaptasi
- Jika produk umum "kacamata": Bahas kacamata secara umum tapi sesuai pengalaman

ATURAN KEUNIKAN:
1. FOKUS pada produk spesifik yang disebutkan pelanggan
2. Gunakan struktur kalimat yang berbeda setiap kali
3. Variasikan urutan informasi (produk dulu, pengalaman dulu, atau pelayanan dulu)
4. Tambahkan detail spesifik tentang produk yang dibeli
5. WAJIB sertakan: kata produk utama, "optik di ${formData.location}", dan kata "lensa" atau "kacamata"
6. Maksimal 2-3 kalimat (60 kata)
7. JANGAN gunakan formatting (*bold*, _italic_, dll)
8. Hindari pola yang sama dengan review sebelumnya
9. PENTING: Buat maksimal 2 kata yang sedikit typo untuk terlihat natural (contoh: "baget" bukan "banget", "recomended" bukan "recommended", "baguz" bukan "bagus")

CONTOH VARIASI BERDASARKAN PRODUK:
- Softlens: "Softlens di optik ini nyaman banget, tidak kering mata..."
- Kacamata baca: "Kacamata baca yang saya beli sangat membantu untuk membaca..."  
- Kacamata minus: "Lensa minus yang dipasang sangat tepat, penglihatan jadi jernih..."

PENTING: Tulis dalam format teks biasa tanpa formatting apapun!`;

  // Retry logic for handling service unavailability
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
    
      // Remove common AI prefixes
      const prefixesToRemove = [
        'Tentu, ini drafnya:',
        'Tentu, ini reviewnya:',
        'Berikut reviewnya:',
        'Ini drafnya:',
        'Review:',
        'Tentu,',
        'Baik,',
        'Ok,'
      ];
      
      for (const prefix of prefixesToRemove) {
        if (text.toLowerCase().startsWith(prefix.toLowerCase())) {
          text = text.substring(prefix.length).trim();
        }
      }
      
      // Remove all markdown formatting
      text = text
        .replace(/\*\*/g, '') // Remove bold markdown (**)
        .replace(/\*/g, '')   // Remove italic markdown (*)
        .replace(/\_\_/g, '') // Remove bold underscores (__)
        .replace(/\_/g, '')   // Remove italic underscores (_)
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links [text](url) -> text
        .replace(/`([^`]+)`/g, '$1') // Remove code blocks `text` -> text
        .replace(/#{1,6}\s*/g, '') // Remove headers (# ## ###)
        .trim();
      
      return text;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        // All retries failed, throw special error to trigger redirect
        throw new Error("REDIRECT_TO_GOOGLE");
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  // This should never be reached due to the throw in the last attempt, but TypeScript requires it
  throw new Error("REDIRECT_TO_GOOGLE");
}