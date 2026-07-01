export interface FikihArticle {
  id: string;
  title: string;
  arabic?: string;
  translation: string;
}

export interface FikihChapter {
  id: string;
  title: string;
  articles: FikihArticle[];
}

export interface FikihBook {
  id: string;
  title: string;
  author: string;
  description: string;
  chapters: FikihChapter[];
}

export const fikihBooks: FikihBook[] = [
  {
    id: "safinatun_naja",
    title: "Safinatun Naja",
    author: "Syekh Salim bin Sumair Al-Hadhrami",
    description: "Kitab fiqih dasar bermadzhab Syafi'i yang sangat populer di Indonesia, mencakup dasar-dasar ibadah seperti thaharah, shalat, puasa, dan zakat.",
    chapters: [
      {
        id: "safinah_rukun",
        title: "Rukun Islam & Iman",
        articles: [
          {
            id: "rukun_islam",
            title: "Rukun Islam",
            arabic: "أركان الإسلام خمسة: شهادة أن لا إله إلا الله وأن محمداً رسول الله، وإقام الصلاة، وإيتاء الزكاة، وصوم رمضان، وحج البيت من استطاع إليه سبيلاً",
            translation: "Rukun Islam ada 5: 1. Bersaksi bahwa tidak ada Tuhan selain Allah dan Nabi Muhammad utusan Allah, 2. Mendirikan shalat, 3. Menunaikan zakat, 4. Puasa Ramadhan, 5. Haji ke Baitullah bagi yang mampu."
          },
          {
            id: "rukun_iman",
            title: "Rukun Iman",
            arabic: "أركان الإيمان ستة: أن تؤمن بالله، وملائكته، وكتبه، ورسله، وباليوم الآخر، وبالقدر خيره وشره من الله تعالى",
            translation: "Rukun Iman ada 6: 1. Iman kepada Allah, 2. Iman kepada Malaikat-Nya, 3. Iman kepada Kitab-kitab-Nya, 4. Iman kepada Rasul-Nya, 5. Iman kepada Hari Kiamat, 6. Iman kepada Qadha dan Qadar (baik dan buruknya dari Allah)."
          }
        ]
      },
      {
        id: "safinah_thaharah",
        title: "Kitab Thaharah (Bersuci)",
        articles: [
          {
            id: "air",
            title: "Macam-Macam Air",
            arabic: "المياه التي يجوز بها التطهير سبع مياه: ماء السماء، وماء البحر، وماء النهر، وماء البئر، وماء العين، وماء الثلج، وماء البرد",
            translation: "Air yang sah untuk digunakan bersuci ada tujuh macam: Air hujan, air laut, air sungai, air sumur, air mata air, air salju, dan air embun."
          },
          {
            id: "wudhu",
            title: "Fardhu Wudhu",
            arabic: "فروض الوضوء ستة: الأول النية، الثاني غسل الوجه، الثالث غسل اليدين مع المرفقين، الرابع مسح شيء من الرأس، الخامس غسل الرجلين مع الكعبين، السادس الترتيب",
            translation: "Fardhu (Rukun) Wudhu ada enam: 1. Niat, 2. Membasuh wajah, 3. Membasuh kedua tangan beserta kedua siku, 4. Mengusap sebagian kepala, 5. Membasuh kedua kaki beserta kedua mata kaki, 6. Tertib (berurutan)."
          },
          {
            id: "batal_wudhu",
            title: "Hal yang Membatalkan Wudhu",
            translation: "Yang membatalkan wudhu ada empat perkara: 1. Keluarnya sesuatu dari salah satu dua jalan (qubul/dubur), 2. Hilangnya akal karena tidur atau selainnya (kecuali tidur duduk yang menetap pantatnya), 3. Bersentuhan kulit laki-laki dan perempuan bukan mahram tanpa penghalang, 4. Menyentuh kemaluan anak Adam atau lubang duburnya dengan telapak tangan."
          },
          {
            id: "mandi_wajib",
            title: "Hal yang Mewajibkan Mandi",
            arabic: "موجبات الغسل ستة: إيلاج الحشفة في الفرج، وخروج المني، والحيض، والنفاس، والولادة، والموت",
            translation: "Yang mewajibkan mandi ada enam: 1. Masuknya hasyafah (kepala kemaluan) ke dalam farji, 2. Keluarnya air mani, 3. Haid, 4. Nifas, 5. Melahirkan, 6. Meninggal dunia."
          }
        ]
      },
      {
        id: "safinah_salat",
        title: "Kitab Shalat",
        articles: [
          {
            id: "syarat_salat",
            title: "Syarat Sah Shalat",
            translation: "Syarat sah shalat sebelum pelaksanaannya ada lima: 1. Suci badan dari hadats kecil dan besar, 2. Suci pakaian, badan, dan tempat dari najis, 3. Menutup aurat, 4. Mengetahui masuknya waktu shalat, 5. Menghadap kiblat."
          },
          {
            id: "rukun_salat",
            title: "Rukun Shalat",
            translation: "Rukun shalat ada 17: Niat, Takbiratul Ihram, Berdiri bagi yang mampu, Membaca Al-Fatihah, Ruku', Thuma'ninah ruku', I'tidal, Thuma'ninah I'tidal, Sujud dua kali, Thuma'ninah sujud, Duduk di antara dua sujud, Thuma'ninah duduk, Tasyahud akhir, Duduk tasyahud akhir, Shalawat atas Nabi, Salam pertama, Tertib."
          },
          {
            id: "sujud_sahwi",
            title: "Sebab Sujud Sahwi",
            translation: "Sebab sujud sahwi ada empat: 1. Meninggalkan sebagian dari sunnah ab'adl, 2. Mengerjakan sesuatu yang membatalkan jika disengaja tapi tidak batal jika lupa, 3. Memindahkan rukun qauli (ucapan) bukan pada tempatnya, 4. Ragu dalam jumlah rakaat."
          }
        ]
      },
      {
        id: "safinah_jenazah",
        title: "Kitab Pengurusan Jenazah",
        articles: [
          {
            id: "kewajiban_jenazah",
            title: "Kewajiban Terhadap Jenazah",
            translation: "Kewajiban terhadap jenazah muslim ada empat (Fardhu Kifayah): 1. Memandikan, 2. Mengkafani, 3. Menshalatkan, 4. Menguburkan."
          },
          {
            id: "shalat_jenazah",
            title: "Takbir Shalat Jenazah",
            translation: "Shalat jenazah terdiri dari 4 takbir: Setelah takbir ke-1 membaca Al-Fatihah, setelah takbir ke-2 membaca Shalawat Nabi, setelah takbir ke-3 berdoa untuk jenazah, setelah takbir ke-4 berdoa untuk keluarga/umum lalu salam."
          }
        ]
      }
    ]
  },
  {
    id: "abu_syuja",
    title: "Matan Abu Syuja' (Taqrib)",
    author: "Al-Qadhi Abu Syuja'",
    description: "Kitab madzhab Syafi'i yang ringkas namun padat, mencakup ibadah, muamalah, munakahat, hingga jinayat.",
    chapters: [
      {
        id: "taqrib_zakat",
        title: "Kitab Zakat",
        articles: [
          {
            id: "wajib_zakat",
            title: "Harta yang Wajib Dizakati",
            translation: "Harta benda yang wajib dizakati ada lima macam: Binatang ternak, emas dan perak (uang barang berharga), hasil pertanian, buah-buahan, dan harta perniagaan."
          },
          {
            id: "zakat_fitrah",
            title: "Zakat Fitrah",
            arabic: "وتجب زكاة الفطر بثلاثة أشياء: الإسلام، وبغروب الشمس من آخر يوم من شهر رمضان، ووجود الفضل عن قوته وقوت عياله في ذلك اليوم",
            translation: "Zakat fitrah wajib dengan 3 syarat: 1. Islam, 2. Menemui tenggelamnya matahari pada hari terakhir bulan Ramadhan, 3. Memiliki kelebihan makanan untuk dirinya dan keluarganya pada hari dan malam Idul Fitri. Besarannya 1 sha' (kurang lebih 2.5 kg) dari makanan pokok daerah setempat."
          },
          {
            id: "penerima_zakat",
            title: "Delapan Asnaf Penerima Zakat",
            translation: "Zakat diberikan kepada delapan golongan: Fakir, Miskin, Amil (pengurus zakat), Muallaf (yang dibujuk hatinya masuk Islam), Riqab (hamba sahaya yang ingin merdeka), Gharim (yang berhutang bukan untuk maksiat), Fisabilillah (orang yang berjuang di jalan Allah), dan Ibnu Sabil (musafir yang kehabisan bekal)."
          }
        ]
      },
      {
        id: "taqrib_puasa",
        title: "Kitab Puasa (Shaum)",
        articles: [
          {
            id: "syarat_puasa",
            title: "Syarat Wajib Puasa",
            arabic: "وشرائط وجوب الصيام أربعة أشياء: الإسلام والبلوغ والعقل والقدرة على الصوم",
            translation: "Syarat wajib puasa ada empat: 1. Islam, 2. Baligh, 3. Berakal sehat, 4. Mampu berpuasa."
          },
          {
            id: "rukun_puasa",
            title: "Fardhu (Rukun) Puasa",
            arabic: "وفرائض الصوم أربعة أشياء: النية، والإمساك عن الأكل والشرب، والجماع، والتعمد للقيء",
            translation: "Fardhu puasa ada empat: 1. Niat (di malam hari untuk puasa wajib), 2. Menahan diri dari makan dan minum, 3. Menahan diri dari jima' (bersetubuh), 4. Tidak sengaja muntah."
          },
          {
            id: "batal_puasa",
            title: "Hal yang Membatalkan Puasa",
            translation: "Sesuatu yang membatalkan puasa ada sepuluh perkara: 1. Masuknya sesuatu ke rongga dalam dengan sengaja, 2. Masuknya sesuatu ke rongga kepala, 3. Suntikan melalui salah satu dua jalan, 4. Muntah dengan sengaja, 5. Bersetubuh dengan sengaja, 6. Keluar air mani karena sentuhan (sengaja), 7. Haid, 8. Nifas, 9. Gila, 10. Murtad."
          }
        ]
      },
      {
        id: "taqrib_haji",
        title: "Kitab Haji dan Umrah",
        articles: [
          {
            id: "syarat_haji",
            title: "Syarat Wajib Haji",
            translation: "Syarat wajib haji ada lima: Islam, Baligh, Berakal, Merdeka, dan Istitha'ah (mampu secara materi, transportasi, tubuh, dan keamanan jalan)."
          },
          {
            id: "rukun_haji",
            title: "Rukun Haji dan Umrah",
            translation: "Rukun Haji ada 5: Ihram dengan niat, Wukuf di Arafah, Thawaf Ifadhah di Ka'bah, Sa'i antara Shafa dan Marwah, dan Bercukur (Tahallul). Rukun Umrah ada 4, yakni sama dengan haji tetapi tanpa Wukuf di Arafah."
          },
          {
            id: "wajib_haji",
            title: "Wajib Haji",
            translation: "Wajib haji (yang jika ditinggalkan harus membayar dam/denda) ada lima: 1. Ihram dari Miqat, 2. Melempar jumrah, 3. Berkumpul (Mabit) di Muzdalifah, 4. Bermalam di Mina pada hari-hari tasyrik, 5. Thawaf Wada' (perpisahan)."
          }
        ]
      },
      {
        id: "taqrib_jual_beli",
        title: "Kitab Jual Beli (Buyu')",
        articles: [
          {
            id: "syarat_sah_jual_beli",
            title: "Syarat Sah Benda yang Dijual",
            translation: "Syarat benda yang sah diperjualbelikan ada lima: 1. Suci, 2. Ada manfaatnya, 3. Dapat diserahterimakan, 4. Milik penjual atau yang dikuasakan, 5. Diketahui barang dan harganya."
          },
          {
            id: "riba",
            title: "Hukum Riba",
            translation: "Riba itu haram dan hanya terjadi pada emas, perak, dan bahan makanan. Tidak boleh menjual emas dengan emas atau gandum dengan gandum kecuali sama timbangannya dan diserahterimakan secara tunai (di tempat majelis)."
          }
        ]
      }
    ]
  },
  {
    id: "bulughul_maram",
    title: "Bulughul Maram",
    author: "Ibnu Hajar Al-Asqalani",
    description: "Kitab kumpulan hadits-hadits hukum syariat. Rujukan penting untuk mengetahui dalil-dalil hukum Fiqih (Fiqih Hadits).",
    chapters: [
      {
        id: "bulugh_thaharah",
        title: "Kitab Thaharah",
        articles: [
          {
            id: "air_laut",
            title: "Kesucian Air Laut",
            arabic: "عن أبي هريرة رضي الله عنه قال: قال رسول الله صلى الله عليه وسلم في البحر: هو الطهور ماؤه الحل ميتته",
            translation: "Dari Abu Hurairah RA, Rasulullah SAW bersabda tentang laut: 'Laut itu suci airnya dan halal bangkainya.' (HR. Empat Imam Imam dan Ibnu Abi Syaibah)"
          },
          {
            id: "siwak",
            title: "Anjuran Bersiwak",
            arabic: "عن أبي هريرة رضي الله عنه, عن النبي صلى الله عليه وسلم قال: لولا أن أشق على أمتي لأمرتهم بالسواك مع كل وضوء",
            translation: "Dari Abu Hurairah RA, Rasulullah SAW bersabda: 'Seandainya tidak memberatkan umatku, niscaya aku akan perintahkan mereka bersiwak (menyikat gigi) setiap kali wudhu.' (Dikeluarkan oleh Malik, Ahmad dan An-Nasa'i)"
          }
        ]
      },
      {
        id: "bulugh_nikah",
        title: "Kitab Nikah (Munakahat)",
        articles: [
          {
            id: "anjuran_nikah",
            title: "Anjuran Menikah",
            arabic: "عن عبد الله بن مسعود رضي الله عنه قال: قال لنا رسول الله صلى الله عليه وسلم: يا معشر الشباب من استطاع منكم الباءة فليتزوج...",
            translation: "Dari Abdullah bin Mas'ud RA: Rasulullah SAW bersabda: 'Wahai pemuda, barangsiapa yang mampu memberi nafkah maka menikahlah, karena menikah itu lebih dapat menundukkan pandangan dan menjaga kemaluan...' (HR Muttafaq Alaih)"
          },
          {
            id: "syarat_wali",
            title: "Syarat Wali dalam Nikah",
            arabic: "عن أبي موسى الأشعري رضي الله عنه, أن النبي صلى الله عليه وسلم قال: لا نكاح إلا بولي",
            translation: "Dari Abu Musa Al-Asy'ari RA, Nabi SAW bersabda: 'Tidak sah suatu pernikahan kecuali dengan adanya wali.' (HR. Ahmad dan Abu Dawud)"
          },
          {
            id: "mahar",
            title: "Anjuran Meringankan Mahar",
            arabic: "عن عقبة بن عامر رضي الله عنه قال: قال رسول الله صلى الله عليه وسلم: خير الصداق أيسره",
            translation: "Dari Uqbah bin Amir RA, Rasulullah SAW bersabda: 'Sebaik-baik mahar (maskawin) adalah yang paling mudah (tidak memberatkan).' (HR. Abu Dawud)"
          }
        ]
      },
      {
        id: "bulugh_jualbeli",
        title: "Kitab Jual Beli (Muamalah)",
        articles: [
          {
            id: "khiyar",
            title: "Hak Khiyar (Memilih)",
            arabic: "عن ابن عمر رضي الله عنهما, عن رسول الله صلى الله عليه وسلم قال: إذا تبايع الرجلان فكل واحد منهما بالخيار ما لم يتفرقا...",
            translation: "Dari Ibnu Umar RA, Rasulullah SAW bersabda: 'Apabila dua orang melakukan transaksi jual beli, maka masing-masing memiliki hak khiyar (memilih lanjut/batal) selama keduanya belum berpisah dari tempat.'"
          },
          {
            id: "larangan_gharar",
            title: "Larangan Jual Beli Gharar",
            translation: "Dari Abu Hurairah RA: 'Rasulullah SAW melarang jual beli hashat (menggunakan lemparan batu) dan jual beli gharar (yang mengandung ketidakpastian/penipuan).' (HR. Muslim)"
          }
        ]
      },
      {
        id: "bulugh_makanan",
        title: "Kitab Makanan (Al-Ath'imah)",
        articles: [
          {
            id: "hewan_buas",
            title: "Larangan Memakan Hewan Buas",
            arabic: "عن أبي ثعلبة الخشني رضي الله عنه: أن رسول الله صلى الله عليه وسلم نهى عن كل ذي ناب من السباع",
            translation: "Dari Abu Tsa'labah Al-Khusyani RA: 'Bahwa Rasulullah SAW melarang (memakan) setiap binatang buas yang bertaring.' (Muttafaq Alaih)"
          }
        ]
      }
    ]
  }
];
