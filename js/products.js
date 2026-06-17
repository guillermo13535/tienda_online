/* =========================================================
   TecnoShop - Catálogo central de productos
   Precios en pesos chilenos (CLP) como enteros.
   Estructura estilo Mercado Libre: precio anterior (descuento),
   cuotas, envío gratis, vendidos, stock, condición, etc.
   ========================================================= */

const PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro Max 256GB Titanio Natural",
    category: "smartphones",
    price: 999990,
    oldPrice: 1199990,
    installments: 12,
    freeShipping: true,
    full: true,
    condition: "Nuevo",
    sold: 250,
    stock: 15,
    rating: 5,
    image: "https://falabella.scene7.com/is/image/Falabella/127695184_1?wid=800&hei=800&qlt=70",
    gallery: [
      "https://falabella.scene7.com/is/image/Falabella/127695184_1?wid=800&hei=800&qlt=70",
      "https://i.blogs.es/718a10/img_2085/500_333.jpeg"
    ],
    description: "El iPhone 15 Pro Max combina el chip A16 Bionic, pantalla OLED de 6.1\" y Dynamic Island. Resistencia al agua IP68 y cámara profesional.",
    specs: {
      "Marca": "Apple",
      "Sistema operativo": "iOS 17",
      "Pantalla": "OLED 6.1\" - 2556 x 1179 px",
      "Procesador": "Chip A16 Bionic",
      "Almacenamiento": "256 GB",
      "Resistencia": "IP68",
      "Garantía": "1 año"
    }
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra 256GB",
    category: "smartphones",
    price: 999990,
    oldPrice: 1099990,
    installments: 12,
    freeShipping: true,
    full: true,
    condition: "Nuevo",
    sold: 180,
    stock: 10,
    rating: 5,
    image: "https://images.samsung.com/is/image/samsung/p6pim/cl/2401/gallery/cl-galaxy-s24-s928-sm-s928bztultl-thumb-539308401?$344_344_PNG$",
    gallery: [
      "https://images.samsung.com/is/image/samsung/p6pim/cl/2401/gallery/cl-galaxy-s24-s928-sm-s928bztultl-thumb-539308401?$344_344_PNG$"
    ],
    description: "Galaxy S24 Ultra con S Pen integrado, pantalla Dynamic AMOLED 2X de 6.8\" y cámara de 200 MP. Potenciado con IA de Galaxy.",
    specs: {
      "Marca": "Samsung",
      "Sistema operativo": "Android 14 / One UI 6.1",
      "Pantalla": "Dynamic AMOLED 2X 6.8\"",
      "Procesador": "Snapdragon 8 Gen 3",
      "Almacenamiento": "256 GB",
      "Cámara": "200 MP principal",
      "Garantía": "1 año"
    }
  },
  {
    id: 3,
    name: "Audífonos JBL Tune Inalámbricos Negro",
    category: "audio",
    price: 399990,
    oldPrice: 499990,
    installments: 10,
    freeShipping: true,
    full: false,
    condition: "Nuevo",
    sold: 540,
    stock: 30,
    rating: 4,
    image: "https://http2.mlstatic.com/D_NQ_NP_998515-MLC31582106203_072019-O.webp",
    gallery: [
      "https://http2.mlstatic.com/D_NQ_NP_998515-MLC31582106203_072019-O.webp"
    ],
    description: "Audífonos JBL con sonido JBL Pure Bass, conexión inalámbrica y batería de larga duración. Comodidad para todo el día.",
    specs: {
      "Marca": "JBL",
      "Tipo": "Over-ear inalámbrico",
      "Conectividad": "Bluetooth 5.0",
      "Batería": "Hasta 40 horas",
      "Garantía": "1 año"
    }
  },
  {
    id: 4,
    name: "Audífonos Gamer HP DHE-8011 con Micrófono",
    category: "gamer",
    price: 39990,
    oldPrice: 59990,
    installments: 6,
    freeShipping: false,
    full: true,
    condition: "Nuevo",
    sold: 1200,
    stock: 80,
    rating: 4,
    image: "assets/audifonos.jpg",
    gallery: ["assets/audifonos.jpg"],
    description: "Audífonos gamer HP DHE-8011 On-Ear con conector Jack 3.5mm, micrófono incorporado y sonido envolvente para tus partidas.",
    specs: {
      "Marca": "HP",
      "Tipo": "On-ear gamer",
      "Conexión": "Jack 3.5 mm",
      "Micrófono": "Sí, incorporado",
      "Garantía": "6 meses"
    }
  },
  {
    id: 5,
    name: "Honor Magic 5 Lite 256GB",
    category: "smartphones",
    price: 500000,
    oldPrice: 600000,
    installments: 12,
    freeShipping: true,
    full: false,
    condition: "Nuevo",
    sold: 95,
    stock: 20,
    rating: 4,
    image: "assets/honor.jpg",
    gallery: ["assets/honor.jpg"],
    description: "Honor Magic 5 Lite con pantalla curva AMOLED de 6.67\", batería de 5100 mAh y cámara triple de 64 MP.",
    specs: {
      "Marca": "Honor",
      "Sistema operativo": "Android 12 / Magic UI",
      "Pantalla": "AMOLED 6.67\" 120Hz",
      "Batería": "5100 mAh",
      "Cámara": "64 MP triple",
      "Garantía": "1 año"
    }
  },
  {
    id: 6,
    name: "Parlantes PC Gamer HP DHE-6005 RGB",
    category: "gamer",
    price: 45990,
    oldPrice: 69990,
    installments: 6,
    freeShipping: false,
    full: true,
    condition: "Nuevo",
    sold: 870,
    stock: 60,
    rating: 5,
    image: "assets/hp.jpg",
    gallery: ["assets/hp.jpg"],
    description: "Parlantes gamer HP DHE-6005 con iluminación LED RGB, sonido estéreo potente y conexión USB + Jack 3.5mm.",
    specs: {
      "Marca": "HP",
      "Tipo": "Parlantes 2.0 RGB",
      "Potencia": "6W",
      "Conexión": "USB + 3.5 mm",
      "Garantía": "6 meses"
    }
  },
  {
    id: 7,
    name: "Parlante Bluetooth Portátil G Resistente al Agua",
    category: "audio",
    price: 24990,
    oldPrice: 34990,
    installments: 3,
    freeShipping: false,
    full: false,
    condition: "Nuevo",
    sold: 2100,
    stock: 150,
    rating: 4,
    image: "assets/cargador.jpg",
    gallery: ["assets/cargador.jpg"],
    description: "Parlante portátil Bluetooth compacto, resistente a salpicaduras, ideal para llevar tu música a todas partes.",
    specs: {
      "Tipo": "Parlante portátil",
      "Conectividad": "Bluetooth 5.0",
      "Batería": "Hasta 8 horas",
      "Resistencia": "IPX4",
      "Garantía": "6 meses"
    }
  },
  {
    id: 8,
    name: "Parlante JBL PartyBox 710 800W con Luces",
    category: "audio",
    price: 709990,
    oldPrice: 899990,
    installments: 12,
    freeShipping: true,
    full: true,
    condition: "Nuevo",
    sold: 60,
    stock: 8,
    rating: 5,
    image: "assets/jbl.jpg",
    gallery: ["assets/jbl.jpg"],
    description: "Parlante JBL PartyBox 710 con 800W de potencia, espectáculo de luces dinámico y sonido JBL de alta fidelidad para tus fiestas.",
    specs: {
      "Marca": "JBL",
      "Potencia": "800 W RMS",
      "Conectividad": "Bluetooth + entradas para instrumentos",
      "Luces": "Show de luces dinámico",
      "Garantía": "1 año"
    }
  }
];

// Categorías para filtros y accesos rápidos (clave -> { label, icon })
const CATEGORIES = {
  all: { label: "Todos", icon: "🛍️" },
  smartphones: { label: "Celulares", icon: "📱" },
  gamer: { label: "Gamer", icon: "🎮" },
  audio: { label: "Audio", icon: "🎧" }
};
