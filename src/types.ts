/**
 * @author Habib Ismail Al Qadri
 * @app Mushola Nur Hidayah
 */
export interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: "Mekah" | "Madinah" | string;
  arti: string;
  deskripsi: string;
  audioFull?: {
    [key: string]: string;
  };
}

export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  tafsir?: string;
  audio: {
    [key: string]: string;
  };
}

export interface SurahDetail extends Surah {
  ayat: Ayat[];
}

export interface TafsirAyat {
  ayat: number;
  teks: string;
}

export interface TafsirDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  tafsir: TafsirAyat[];
}

export interface SholatCity {
  id: string;
  lokasi: string;
}

export interface PrayerSchedule {
  tanggal: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  date: string;
}

export interface Bookmark {
  surahNo: number;
  surahName: string;
  ayatNo: number;
  timestamp: number;
}

export interface Note {
  id: string;
  surahNo: number;
  surahName: string;
  ayatNo: number;
  text: string;
  timestamp: number;
}

export interface DoaItem {
  judul: string;
  arab: string;
  latin: string;
  terjemah: string;
  sumber?: string;
  kategori: string;
}

export interface TilawahProgress {
  currentSurah: number;
  currentSurahName: string;
  currentAyat: number;
  totalAyat: number;
  progressPercentage: number;
}
