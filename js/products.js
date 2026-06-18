/* =========================================================
   TecnoShop - Catálogo central de productos
   Precios en pesos chilenos (CLP) como enteros.
   Cada producto tiene "stock" (límite de unidades disponibles).
   ========================================================= */

const PRODUCTS = [
  // ---------- Smartphones ----------
  {
    id: 1, name: "iPhone 15 Pro Max 256GB Titanio Natural", category: "smartphones",
    price: 999990, oldPrice: 1199990, installments: 12, freeShipping: true, full: true,
    condition: "Nuevo", sold: 250, stock: 15, rating: 5,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/IPhone_15_pro_max.png?width=600",
    gallery: ["https://commons.wikimedia.org/wiki/Special:FilePath/IPhone_15_pro_max.png?width=600", "https://commons.wikimedia.org/wiki/Special:FilePath/IPhone_15_Pro.jpg?width=600", "https://commons.wikimedia.org/wiki/Special:FilePath/Front_of_iPhone_15_Pro_Max.jpg?width=600"],
    description: "El iPhone 15 Pro Max combina el chip A17 Pro, pantalla OLED de 6.7\" y diseño en titanio. Resistencia IP68 y cámara profesional.",
    specs: { "Marca": "Apple", "Sistema operativo": "iOS 17", "Pantalla": "OLED 6.7\"", "Procesador": "A17 Pro", "Almacenamiento": "256 GB", "Garantía": "1 año" }
  },
  {
    id: 2, name: "Samsung Galaxy S24 Ultra 256GB", category: "smartphones",
    price: 999990, oldPrice: 1099990, installments: 12, freeShipping: true, full: true,
    condition: "Nuevo", sold: 180, stock: 10, rating: 5,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/SAMSUNG_Galaxy_S24_Ultra_(2).jpg?width=600",
    gallery: ["https://commons.wikimedia.org/wiki/Special:FilePath/SAMSUNG_Galaxy_S24_Ultra_(2).jpg?width=600", "https://commons.wikimedia.org/wiki/Special:FilePath/Samsung_Galaxy_S24_(webtekno)_008.png?width=600"],
    description: "Galaxy S24 Ultra con S Pen integrado, pantalla Dynamic AMOLED 2X de 6.8\" y cámara de 200 MP potenciada con IA.",
    specs: { "Marca": "Samsung", "Sistema operativo": "Android 14", "Pantalla": "AMOLED 6.8\"", "Procesador": "Snapdragon 8 Gen 3", "Almacenamiento": "256 GB", "Garantía": "1 año" }
  },
  {
    id: 5, name: "Honor Magic 5 Lite 256GB", category: "smartphones",
    price: 500000, oldPrice: 600000, installments: 12, freeShipping: true, full: false,
    condition: "Nuevo", sold: 95, stock: 20, rating: 4,
    image: "assets/honor.jpg", gallery: ["assets/honor.jpg"],
    description: "Honor Magic 5 Lite con pantalla curva AMOLED de 6.67\", batería de 5100 mAh y cámara triple de 64 MP.",
    specs: { "Marca": "Honor", "Sistema operativo": "Android 12", "Pantalla": "AMOLED 6.67\" 120Hz", "Batería": "5100 mAh", "Cámara": "64 MP", "Garantía": "1 año" }
  },
  {
    id: 9, name: "Xiaomi Redmi Note 13 128GB", category: "smartphones",
    price: 199990, oldPrice: 259990, installments: 6, freeShipping: true, full: true,
    condition: "Nuevo", sold: 1450, stock: 40, rating: 5,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Xiaomi_Redmi_Note_10_Pro.jpg?width=600",
    gallery: ["https://commons.wikimedia.org/wiki/Special:FilePath/Xiaomi_Redmi_Note_10_Pro.jpg?width=600"],
    description: "Xiaomi Redmi Note 13 con pantalla AMOLED 6.67\", cámara de 108 MP y carga rápida de 33W.",
    specs: { "Marca": "Xiaomi", "Sistema operativo": "Android 13 / MIUI", "Pantalla": "AMOLED 6.67\"", "Cámara": "108 MP", "Almacenamiento": "128 GB", "Garantía": "1 año" }
  },
  {
    id: 10, name: "Motorola Moto G84 5G 256GB", category: "smartphones",
    price: 249990, oldPrice: 299990, installments: 9, freeShipping: true, full: false,
    condition: "Nuevo", sold: 620, stock: 25, rating: 4,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Motorola_Moto_G.png?width=600",
    gallery: ["https://commons.wikimedia.org/wiki/Special:FilePath/Motorola_Moto_G.png?width=600"],
    description: "Motorola Moto G84 5G con pantalla pOLED de 6.5\", 12 GB de RAM y batería de 5000 mAh.",
    specs: { "Marca": "Motorola", "Conectividad": "5G", "Pantalla": "pOLED 6.5\"", "RAM": "12 GB", "Almacenamiento": "256 GB", "Garantía": "1 año" }
  },

  // ---------- Notebooks ----------
  {
    id: 11, name: "Notebook Lenovo IdeaPad 3 Ryzen 5 8GB", category: "laptops",
    price: 399990, oldPrice: 499990, installments: 12, freeShipping: true, full: true,
    condition: "Nuevo", sold: 340, stock: 12, rating: 4,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=70",
    gallery: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=70"],
    description: "Notebook Lenovo IdeaPad 3 con AMD Ryzen 5, 8 GB de RAM, SSD de 512 GB y pantalla Full HD de 15.6\".",
    specs: { "Marca": "Lenovo", "Procesador": "AMD Ryzen 5", "RAM": "8 GB", "Almacenamiento": "SSD 512 GB", "Pantalla": "15.6\" Full HD", "Garantía": "1 año" }
  },
  {
    id: 12, name: "Notebook Gamer ASUS TUF F15 RTX 4060", category: "laptops",
    price: 1099990, oldPrice: 1299990, installments: 12, freeShipping: true, full: true,
    condition: "Nuevo", sold: 130, stock: 6, rating: 5,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=70",
    gallery: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=70"],
    description: "Notebook gamer ASUS TUF F15 con Intel Core i7, RTX 4060, 16 GB de RAM y pantalla 144Hz.",
    specs: { "Marca": "ASUS", "Procesador": "Intel Core i7", "Gráfica": "RTX 4060", "RAM": "16 GB", "Pantalla": "15.6\" 144Hz", "Garantía": "1 año" }
  },
  {
    id: 13, name: "Apple MacBook Air M2 13\" 256GB", category: "laptops",
    price: 1199990, oldPrice: 1399990, installments: 12, freeShipping: true, full: false,
    condition: "Nuevo", sold: 210, stock: 9, rating: 5,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=70",
    gallery: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=70"],
    description: "MacBook Air con chip M2, pantalla Liquid Retina de 13.6\", diseño ultradelgado y hasta 18 horas de batería.",
    specs: { "Marca": "Apple", "Procesador": "Chip M2", "RAM": "8 GB", "Almacenamiento": "256 GB", "Pantalla": "13.6\" Liquid Retina", "Garantía": "1 año" }
  },

  // ---------- Gamer ----------
  {
    id: 4, name: "Audífonos Gamer HP DHE-8011 con Micrófono", category: "gamer",
    price: 39990, oldPrice: 59990, installments: 6, freeShipping: false, full: true,
    condition: "Nuevo", sold: 1200, stock: 80, rating: 4,
    image: "assets/audifonos.jpg", gallery: ["assets/audifonos.jpg"],
    description: "Audífonos gamer HP DHE-8011 On-Ear con conector Jack 3.5mm, micrófono incorporado y sonido envolvente.",
    specs: { "Marca": "HP", "Tipo": "On-ear gamer", "Conexión": "Jack 3.5 mm", "Micrófono": "Sí", "Garantía": "6 meses" }
  },
  {
    id: 6, name: "Parlantes PC Gamer HP DHE-6005 RGB", category: "gamer",
    price: 45990, oldPrice: 69990, installments: 6, freeShipping: false, full: true,
    condition: "Nuevo", sold: 870, stock: 60, rating: 5,
    image: "assets/hp.jpg", gallery: ["assets/hp.jpg"],
    description: "Parlantes gamer HP DHE-6005 con iluminación LED RGB, sonido estéreo potente y conexión USB + Jack 3.5mm.",
    specs: { "Marca": "HP", "Tipo": "Parlantes 2.0 RGB", "Potencia": "6W", "Conexión": "USB + 3.5 mm", "Garantía": "6 meses" }
  },
  {
    id: 14, name: "Teclado Mecánico Redragon Kumara RGB", category: "gamer",
    price: 34990, oldPrice: 49990, installments: 3, freeShipping: false, full: true,
    condition: "Nuevo", sold: 2300, stock: 50, rating: 5,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=70",
    gallery: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=70"],
    description: "Teclado mecánico Redragon Kumara con switches azules, iluminación RGB y estructura compacta TKL.",
    specs: { "Marca": "Redragon", "Tipo": "Mecánico TKL", "Switch": "Outemu Blue", "Iluminación": "RGB", "Garantía": "1 año" }
  },
  {
    id: 15, name: "Mouse Gamer Logitech G203 LIGHTSYNC", category: "gamer",
    price: 24990, oldPrice: 34990, installments: 3, freeShipping: false, full: true,
    condition: "Nuevo", sold: 3100, stock: 70, rating: 5,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=70",
    gallery: ["https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=70"],
    description: "Mouse gamer Logitech G203 con sensor de 8000 DPI, iluminación RGB LIGHTSYNC y 6 botones programables.",
    specs: { "Marca": "Logitech", "Sensor": "8000 DPI", "Botones": "6 programables", "Iluminación": "RGB", "Garantía": "2 años" }
  },
  {
    id: 16, name: "Silla Gamer Cougar Armor Ergonómica", category: "gamer",
    price: 199990, oldPrice: 259990, installments: 12, freeShipping: true, full: false,
    condition: "Nuevo", sold: 540, stock: 4, rating: 4,
    image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&q=70",
    gallery: ["https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&q=70"],
    description: "Silla gamer Cougar Armor con respaldo reclinable hasta 180°, cojines lumbar y cervical, y apoyabrazos ajustables.",
    specs: { "Marca": "Cougar", "Reclinación": "Hasta 180°", "Material": "Cuero sintético", "Peso máximo": "120 kg", "Garantía": "1 año" }
  },

  // ---------- Audio ----------
  {
    id: 3, name: "Audífonos JBL Tune Inalámbricos Negro", category: "audio",
    price: 399990, oldPrice: 499990, installments: 10, freeShipping: true, full: false,
    condition: "Nuevo", sold: 540, stock: 30, rating: 4,
    image: "https://http2.mlstatic.com/D_NQ_NP_998515-MLC31582106203_072019-O.webp",
    gallery: ["https://http2.mlstatic.com/D_NQ_NP_998515-MLC31582106203_072019-O.webp"],
    description: "Audífonos JBL con sonido JBL Pure Bass, conexión inalámbrica y batería de larga duración.",
    specs: { "Marca": "JBL", "Tipo": "Over-ear inalámbrico", "Conectividad": "Bluetooth 5.0", "Batería": "40 horas", "Garantía": "1 año" }
  },
  {
    id: 7, name: "Parlante Bluetooth Portátil G Resistente al Agua", category: "audio",
    price: 24990, oldPrice: 34990, installments: 3, freeShipping: false, full: false,
    condition: "Nuevo", sold: 2100, stock: 150, rating: 4,
    image: "assets/cargador.jpg", gallery: ["assets/cargador.jpg"],
    description: "Parlante portátil Bluetooth compacto, resistente a salpicaduras, ideal para llevar tu música a todas partes.",
    specs: { "Tipo": "Parlante portátil", "Conectividad": "Bluetooth 5.0", "Batería": "8 horas", "Resistencia": "IPX4", "Garantía": "6 meses" }
  },
  {
    id: 8, name: "Parlante JBL PartyBox 710 800W con Luces", category: "audio",
    price: 709990, oldPrice: 899990, installments: 12, freeShipping: true, full: true,
    condition: "Nuevo", sold: 60, stock: 8, rating: 5,
    image: "assets/jbl.jpg", gallery: ["assets/jbl.jpg"],
    description: "Parlante JBL PartyBox 710 con 800W de potencia, espectáculo de luces dinámico y sonido JBL de alta fidelidad.",
    specs: { "Marca": "JBL", "Potencia": "800 W RMS", "Conectividad": "Bluetooth", "Luces": "Show dinámico", "Garantía": "1 año" }
  },
  {
    id: 22, name: "Audífonos Sony WH-1000XM5 Noise Cancelling", category: "audio",
    price: 329990, oldPrice: 429990, installments: 12, freeShipping: true, full: true,
    condition: "Nuevo", sold: 410, stock: 22, rating: 5,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=70",
    gallery: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=70"],
    description: "Audífonos Sony WH-1000XM5 con cancelación de ruido líder, hasta 30 horas de batería y audio Hi-Res.",
    specs: { "Marca": "Sony", "Tipo": "Over-ear", "Cancelación de ruido": "Sí, adaptativa", "Batería": "30 horas", "Garantía": "1 año" }
  },

  // ---------- Monitores ----------
  {
    id: 17, name: "Monitor Samsung 24\" 144Hz Full HD", category: "monitores",
    price: 149990, oldPrice: 199990, installments: 9, freeShipping: true, full: true,
    condition: "Nuevo", sold: 760, stock: 18, rating: 5,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=70",
    gallery: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=70"],
    description: "Monitor Samsung de 24\" con panel a 144Hz, resolución Full HD y tiempo de respuesta de 1ms, ideal para gaming.",
    specs: { "Marca": "Samsung", "Tamaño": "24\"", "Resolución": "1920 x 1080", "Refresco": "144Hz", "Respuesta": "1 ms", "Garantía": "1 año" }
  },
  {
    id: 18, name: "Monitor LG UltraGear 27\" QHD 165Hz", category: "monitores",
    price: 279990, oldPrice: 349990, installments: 12, freeShipping: true, full: false,
    condition: "Nuevo", sold: 320, stock: 7, rating: 5,
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&q=70",
    gallery: ["https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&q=70"],
    description: "Monitor LG UltraGear de 27\" con resolución QHD, 165Hz, panel IPS y compatibilidad G-Sync.",
    specs: { "Marca": "LG", "Tamaño": "27\"", "Resolución": "2560 x 1440", "Refresco": "165Hz", "Panel": "IPS", "Garantía": "1 año" }
  },

  // ---------- Consolas ----------
  {
    id: 19, name: "Consola PlayStation 5 Slim 1TB", category: "consolas",
    price: 549990, oldPrice: 649990, installments: 12, freeShipping: true, full: true,
    condition: "Nuevo", sold: 980, stock: 5, rating: 5,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/PlayStation_5_and_DualSense_with_transparent_background.png?width=600",
    gallery: ["https://commons.wikimedia.org/wiki/Special:FilePath/PlayStation_5_and_DualSense_with_transparent_background.png?width=600", "https://commons.wikimedia.org/wiki/Special:FilePath/PlayStation_5_and_DualSense_(2).jpg?width=600", "https://commons.wikimedia.org/wiki/Special:FilePath/Black_and_white_Playstation_5_base_edition_with_controller.png?width=600"],
    description: "PlayStation 5 Slim con 1TB de almacenamiento, lector de discos y mando DualSense con respuesta háptica.",
    specs: { "Marca": "Sony", "Almacenamiento": "1 TB SSD", "Resolución": "Hasta 4K", "Incluye": "Mando DualSense", "Garantía": "1 año" }
  },
  {
    id: 20, name: "Consola Xbox Series S 512GB", category: "consolas",
    price: 299990, oldPrice: 349990, installments: 9, freeShipping: true, full: false,
    condition: "Nuevo", sold: 670, stock: 0, rating: 4,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Xbox_Series_S_with_controller_(transparent_background).png?width=600",
    gallery: ["https://commons.wikimedia.org/wiki/Special:FilePath/Xbox_Series_S_with_controller_(transparent_background).png?width=600"],
    description: "Xbox Series S, la consola Xbox más compacta, totalmente digital con 512 GB SSD y juegos a 1440p.",
    specs: { "Marca": "Microsoft", "Almacenamiento": "512 GB SSD", "Resolución": "1440p", "Tipo": "Digital", "Garantía": "1 año" }
  },
  {
    id: 21, name: "Nintendo Switch OLED Blanco", category: "consolas",
    price: 379990, oldPrice: 429990, installments: 12, freeShipping: true, full: true,
    condition: "Nuevo", sold: 1120, stock: 14, rating: 5,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Nintendo_Switch_-_OLED.jpg?width=600",
    gallery: ["https://commons.wikimedia.org/wiki/Special:FilePath/Nintendo_Switch_-_OLED.jpg?width=600", "https://commons.wikimedia.org/wiki/Special:FilePath/Nintendo_Switch_OLED.png?width=600"],
    description: "Nintendo Switch modelo OLED con pantalla de 7\", colores vibrantes, base con puerto LAN y 64 GB de almacenamiento.",
    specs: { "Marca": "Nintendo", "Pantalla": "OLED 7\"", "Almacenamiento": "64 GB", "Modos": "TV / Sobremesa / Portátil", "Garantía": "1 año" }
  },

  // ---------- Accesorios ----------
  {
    id: 23, name: "Cargador GaN 65W USB-C Carga Rápida", category: "accesorios",
    price: 29990, oldPrice: 39990, installments: 3, freeShipping: false, full: true,
    condition: "Nuevo", sold: 1850, stock: 200, rating: 5,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=70",
    gallery: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=70"],
    description: "Cargador GaN de 65W con doble puerto USB-C, carga rápida para notebooks, tablets y smartphones.",
    specs: { "Potencia": "65W", "Puertos": "2x USB-C", "Tecnología": "GaN", "Compatibilidad": "Universal", "Garantía": "1 año" }
  },
  {
    id: 24, name: "Power Bank 20000mAh Carga Rápida 22.5W", category: "accesorios",
    price: 24990, oldPrice: 34990, installments: 3, freeShipping: false, full: false,
    condition: "Nuevo", sold: 2750, stock: 90, rating: 4,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=70",
    gallery: ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=70"],
    description: "Batería externa de 20000mAh con carga rápida de 22.5W, pantalla digital y múltiples puertos de salida.",
    specs: { "Capacidad": "20000 mAh", "Potencia": "22.5W", "Puertos": "USB-C + 2x USB-A", "Pantalla": "Digital LED", "Garantía": "6 meses" }
  },

  // ---------- Más Smartphones ----------
  { id: 25, name: "Google Pixel 8 128GB", category: "smartphones", price: 699990, oldPrice: 799990, installments: 12, freeShipping: true, full: true, condition: "Nuevo", sold: 320, stock: 16, rating: 5,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Google_Pixel_8_Rose_front.jpg?width=600", gallery: ["https://commons.wikimedia.org/wiki/Special:FilePath/Google_Pixel_8_Rose_front.jpg?width=600"],
    description: "Google Pixel 8 con IA de Google, cámara excepcional y actualizaciones por 7 años.",
    specs: { "Marca": "Google", "Pantalla": "OLED 6.2\"", "Almacenamiento": "128 GB", "Cámara": "50 MP", "Garantía": "1 año" } },
  { id: 26, name: "iPhone 14 128GB", category: "smartphones", price: 749990, oldPrice: 849990, installments: 12, freeShipping: true, full: false, condition: "Nuevo", sold: 880, stock: 22, rating: 5,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/IPhone_14_Pro.jpg?width=600", gallery: ["https://commons.wikimedia.org/wiki/Special:FilePath/IPhone_14_Pro.jpg?width=600"],
    description: "iPhone 14 con chip A15 Bionic, pantalla OLED de 6.1\" y sistema de doble cámara avanzado.",
    specs: { "Marca": "Apple", "Pantalla": "OLED 6.1\"", "Procesador": "A15 Bionic", "Almacenamiento": "128 GB", "Garantía": "1 año" } },
  { id: 27, name: "Samsung Galaxy A54 5G 256GB", category: "smartphones", price: 329990, oldPrice: 389990, installments: 12, freeShipping: true, full: true, condition: "Nuevo", sold: 1500, stock: 35, rating: 4,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Back_of_the_Samsung_Galaxy_A54_5G.jpg?width=600", gallery: ["https://commons.wikimedia.org/wiki/Special:FilePath/Back_of_the_Samsung_Galaxy_A54_5G.jpg?width=600"],
    description: "Galaxy A54 5G con pantalla Super AMOLED 120Hz, cámara de 50 MP y batería de 5000 mAh.",
    specs: { "Marca": "Samsung", "Conectividad": "5G", "Pantalla": "AMOLED 6.4\" 120Hz", "Almacenamiento": "256 GB", "Garantía": "1 año" } },
  { id: 28, name: "Realme C55 256GB", category: "smartphones", price: 159990, oldPrice: 199990, installments: 6, freeShipping: false, full: true, condition: "Nuevo", sold: 2400, stock: 60, rating: 4,
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=70"],
    description: "Realme C55 con cámara de 64 MP, carga rápida de 33W y diseño premium.",
    specs: { "Marca": "Realme", "Pantalla": "LCD 6.72\" 90Hz", "Cámara": "64 MP", "Almacenamiento": "256 GB", "Garantía": "1 año" } },

  // ---------- Más Notebooks ----------
  { id: 29, name: "Notebook HP Pavilion 15 Core i5", category: "laptops", price: 549990, oldPrice: 649990, installments: 12, freeShipping: true, full: true, condition: "Nuevo", sold: 410, stock: 14, rating: 4,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=70"],
    description: "Notebook HP Pavilion con Intel Core i5, 16 GB RAM, SSD 512 GB y pantalla Full HD.",
    specs: { "Marca": "HP", "Procesador": "Intel Core i5", "RAM": "16 GB", "Almacenamiento": "SSD 512 GB", "Garantía": "1 año" } },
  { id: 30, name: "Notebook Dell Inspiron 15", category: "laptops", price: 499990, oldPrice: 599990, installments: 12, freeShipping: true, full: false, condition: "Nuevo", sold: 360, stock: 11, rating: 4,
    image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&q=70"],
    description: "Dell Inspiron 15 con Ryzen 5, 8 GB RAM y SSD de 512 GB, ideal para estudio y trabajo.",
    specs: { "Marca": "Dell", "Procesador": "AMD Ryzen 5", "RAM": "8 GB", "Almacenamiento": "SSD 512 GB", "Garantía": "1 año" } },
  { id: 31, name: "Notebook Gamer Lenovo Legion 5 RTX 4070", category: "laptops", price: 1499990, oldPrice: 1699990, installments: 12, freeShipping: true, full: true, condition: "Nuevo", sold: 90, stock: 5, rating: 5,
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=70"],
    description: "Lenovo Legion 5 con Ryzen 7, RTX 4070, 16 GB RAM y pantalla 165Hz para gaming exigente.",
    specs: { "Marca": "Lenovo", "Procesador": "AMD Ryzen 7", "Gráfica": "RTX 4070", "RAM": "16 GB", "Pantalla": "15.6\" 165Hz", "Garantía": "1 año" } },
  { id: 32, name: "Apple MacBook Pro 14\" M3", category: "laptops", price: 1899990, oldPrice: 2099990, installments: 12, freeShipping: true, full: true, condition: "Nuevo", sold: 140, stock: 7, rating: 5,
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=70"],
    description: "MacBook Pro 14\" con chip M3, pantalla Liquid Retina XDR y rendimiento profesional.",
    specs: { "Marca": "Apple", "Procesador": "Chip M3", "RAM": "16 GB", "Almacenamiento": "512 GB", "Pantalla": "14\" Liquid Retina XDR", "Garantía": "1 año" } },

  // ---------- Más Gamer ----------
  { id: 33, name: "Teclado Mecánico HyperX Alloy Origins", category: "gamer", price: 79990, oldPrice: 99990, installments: 6, freeShipping: false, full: true, condition: "Nuevo", sold: 640, stock: 40, rating: 5,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=70"],
    description: "Teclado mecánico HyperX Alloy Origins con switches propios, RGB y estructura de aluminio.",
    specs: { "Marca": "HyperX", "Tipo": "Mecánico full-size", "Switch": "HyperX Red", "Iluminación": "RGB", "Garantía": "2 años" } },
  { id: 34, name: "Mouse Gamer Razer DeathAdder V3", category: "gamer", price: 49990, oldPrice: 69990, installments: 6, freeShipping: false, full: true, condition: "Nuevo", sold: 980, stock: 55, rating: 5,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=70"],
    description: "Mouse gamer Razer DeathAdder V3 con sensor de 30000 DPI y diseño ergonómico ultraligero.",
    specs: { "Marca": "Razer", "Sensor": "30000 DPI", "Peso": "59 g", "Botones": "5 programables", "Garantía": "2 años" } },
  { id: 35, name: "Audífonos Gamer HyperX Cloud II", category: "gamer", price: 69990, oldPrice: 89990, installments: 6, freeShipping: true, full: true, condition: "Nuevo", sold: 1700, stock: 48, rating: 5,
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1599669454699-248893623440?w=600&q=70"],
    description: "Audífonos HyperX Cloud II con sonido envolvente 7.1, micrófono con cancelación de ruido.",
    specs: { "Marca": "HyperX", "Sonido": "Virtual 7.1", "Micrófono": "Desmontable", "Conexión": "USB / 3.5 mm", "Garantía": "2 años" } },
  { id: 36, name: "Control Inalámbrico Xbox Series", category: "gamer", price: 54990, oldPrice: 64990, installments: 6, freeShipping: false, full: true, condition: "Nuevo", sold: 1300, stock: 70, rating: 5,
    image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600&q=70"],
    description: "Control inalámbrico Xbox Series compatible con consola y PC, con gatillos texturizados.",
    specs: { "Marca": "Microsoft", "Conexión": "Bluetooth / USB-C", "Compatibilidad": "Xbox / PC", "Garantía": "1 año" } },
  { id: 37, name: "Mousepad Gamer Razer Goliathus XXL", category: "gamer", price: 19990, oldPrice: 29990, installments: 3, freeShipping: false, full: true, condition: "Nuevo", sold: 2200, stock: 120, rating: 4,
    image: "https://images.unsplash.com/photo-1629429407759-01cd3d7cfb38?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1629429407759-01cd3d7cfb38?w=600&q=70"],
    description: "Mousepad extra grande Razer Goliathus con superficie optimizada e iluminación RGB.",
    specs: { "Marca": "Razer", "Tamaño": "XXL (920x294 mm)", "Superficie": "Tela", "Garantía": "1 año" } },
  { id: 38, name: "Webcam Logitech C920 Full HD", category: "gamer", price: 44990, oldPrice: 59990, installments: 6, freeShipping: false, full: true, condition: "Nuevo", sold: 870, stock: 33, rating: 5,
    image: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&q=70"],
    description: "Webcam Logitech C920 con video Full HD 1080p, ideal para streaming y videollamadas.",
    specs: { "Marca": "Logitech", "Resolución": "1080p 30fps", "Micrófono": "Estéreo", "Conexión": "USB", "Garantía": "2 años" } },
  { id: 39, name: "Volante Logitech G29 Racing", category: "gamer", price: 299990, oldPrice: 349990, installments: 12, freeShipping: true, full: false, condition: "Nuevo", sold: 120, stock: 6, rating: 5,
    image: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=600&q=70"],
    description: "Volante Logitech G29 con pedales, force feedback y compatibilidad PS5/PS4/PC.",
    specs: { "Marca": "Logitech", "Incluye": "Pedales", "Compatibilidad": "PS5/PS4/PC", "Garantía": "2 años" } },

  // ---------- Más Audio ----------
  { id: 40, name: "Apple AirPods Pro 2", category: "audio", price: 199990, oldPrice: 249990, installments: 12, freeShipping: true, full: true, condition: "Nuevo", sold: 1900, stock: 40, rating: 5,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=70"],
    description: "AirPods Pro 2 con cancelación activa de ruido mejorada, audio espacial y estuche MagSafe.",
    specs: { "Marca": "Apple", "Cancelación de ruido": "Activa", "Audio espacial": "Sí", "Batería": "6 h (30 h con estuche)", "Garantía": "1 año" } },
  { id: 41, name: "Parlante Bose SoundLink Flex", category: "audio", price: 149990, oldPrice: 189990, installments: 12, freeShipping: true, full: false, condition: "Nuevo", sold: 330, stock: 20, rating: 5,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=70"],
    description: "Parlante portátil Bose SoundLink Flex resistente al agua con sonido potente y claro.",
    specs: { "Marca": "Bose", "Resistencia": "IP67", "Batería": "12 horas", "Conexión": "Bluetooth", "Garantía": "1 año" } },
  { id: 42, name: "Audífonos JBL Tune 520BT", category: "audio", price: 39990, oldPrice: 54990, installments: 3, freeShipping: false, full: true, condition: "Nuevo", sold: 1450, stock: 65, rating: 4,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=70"],
    description: "Audífonos JBL Tune 520BT inalámbricos con JBL Pure Bass y hasta 57 horas de batería.",
    specs: { "Marca": "JBL", "Tipo": "On-ear inalámbrico", "Batería": "57 horas", "Conexión": "Bluetooth 5.3", "Garantía": "1 año" } },

  // ---------- Más Monitores ----------
  { id: 43, name: "Monitor AOC 27\" 75Hz IPS", category: "monitores", price: 119990, oldPrice: 149990, installments: 9, freeShipping: true, full: true, condition: "Nuevo", sold: 540, stock: 19, rating: 4,
    image: "https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=600&q=70"],
    description: "Monitor AOC de 27\" panel IPS, Full HD y 75Hz, con bordes ultrafinos.",
    specs: { "Marca": "AOC", "Tamaño": "27\"", "Resolución": "1920x1080", "Refresco": "75Hz", "Panel": "IPS", "Garantía": "1 año" } },
  { id: 44, name: "Monitor ASUS ProArt 27\" 4K", category: "monitores", price: 399990, oldPrice: 479990, installments: 12, freeShipping: true, full: false, condition: "Nuevo", sold: 95, stock: 6, rating: 5,
    image: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600&q=70"],
    description: "Monitor ASUS ProArt 27\" 4K UHD con calibración de fábrica, ideal para diseño y edición.",
    specs: { "Marca": "ASUS", "Tamaño": "27\"", "Resolución": "3840x2160 4K", "Panel": "IPS", "Color": "100% sRGB", "Garantía": "2 años" } },

  // ---------- Más Consolas ----------
  { id: 45, name: "Consola Steam Deck 512GB OLED", category: "consolas", price: 599990, oldPrice: 699990, installments: 12, freeShipping: true, full: true, condition: "Nuevo", sold: 70, stock: 4, rating: 5,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Steam_Deck_(front).png?width=600", gallery: ["https://commons.wikimedia.org/wiki/Special:FilePath/Steam_Deck_(front).png?width=600"],
    description: "Steam Deck OLED con 512 GB, pantalla HDR y acceso a tu biblioteca de Steam donde quieras.",
    specs: { "Marca": "Valve", "Pantalla": "OLED 7.4\"", "Almacenamiento": "512 GB", "Sistema": "SteamOS", "Garantía": "1 año" } },
  { id: 46, name: "Consola PlayStation 5 Digital Edition", category: "consolas", price: 499990, oldPrice: 559990, installments: 12, freeShipping: true, full: true, condition: "Nuevo", sold: 540, stock: 9, rating: 5,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/PS5DigitalEdition.png?width=600", gallery: ["https://commons.wikimedia.org/wiki/Special:FilePath/PS5DigitalEdition.png?width=600"],
    description: "PlayStation 5 Digital Edition, totalmente digital, con SSD ultrarrápido y mando DualSense.",
    specs: { "Marca": "Sony", "Tipo": "Digital", "Almacenamiento": "1 TB SSD", "Resolución": "Hasta 4K", "Garantía": "1 año" } },

  // ---------- Más Accesorios ----------
  { id: 47, name: "SSD Externo Samsung T7 1TB", category: "accesorios", price: 89990, oldPrice: 119990, installments: 6, freeShipping: false, full: true, condition: "Nuevo", sold: 1100, stock: 80, rating: 5,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=70"],
    description: "SSD externo portátil Samsung T7 de 1 TB con velocidades de hasta 1050 MB/s.",
    specs: { "Marca": "Samsung", "Capacidad": "1 TB", "Velocidad": "1050 MB/s", "Conexión": "USB-C 3.2", "Garantía": "3 años" } },
  { id: 48, name: "Smartwatch Samsung Galaxy Watch 6", category: "accesorios", price: 249990, oldPrice: 299990, installments: 12, freeShipping: true, full: true, condition: "Nuevo", sold: 380, stock: 26, rating: 4,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=70"],
    description: "Galaxy Watch 6 con monitoreo de salud avanzado, GPS y pantalla AMOLED.",
    specs: { "Marca": "Samsung", "Pantalla": "AMOLED", "Salud": "Ritmo cardíaco, sueño, SpO2", "GPS": "Sí", "Garantía": "1 año" } },
  { id: 49, name: "Router WiFi 6 TP-Link AX1500", category: "accesorios", price: 49990, oldPrice: 69990, installments: 6, freeShipping: false, full: false, condition: "Nuevo", sold: 720, stock: 50, rating: 4,
    image: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&q=70"],
    description: "Router TP-Link con WiFi 6, mayor velocidad y cobertura para toda la casa.",
    specs: { "Marca": "TP-Link", "Estándar": "WiFi 6 (AX1500)", "Bandas": "Doble banda", "Puertos": "4x Gigabit", "Garantía": "2 años" } },
  { id: 50, name: "Disco Duro Externo 2TB USB 3.0", category: "accesorios", price: 64990, oldPrice: 84990, installments: 6, freeShipping: false, full: true, condition: "Nuevo", sold: 1600, stock: 90, rating: 4,
    image: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&q=70"],
    description: "Disco duro externo portátil de 2 TB con conexión USB 3.0, ideal para respaldos.",
    specs: { "Capacidad": "2 TB", "Conexión": "USB 3.0", "Formato": "2.5\"", "Garantía": "2 años" } },
  { id: 51, name: "Memoria USB 128GB USB 3.2", category: "accesorios", price: 12990, oldPrice: 17990, installments: 3, freeShipping: false, full: false, condition: "Nuevo", sold: 3200, stock: 200, rating: 4,
    image: "https://images.unsplash.com/photo-1618410320928-25228d811631?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1618410320928-25228d811631?w=600&q=70"],
    description: "Pendrive de 128 GB con interfaz USB 3.2 para transferencias rápidas.",
    specs: { "Capacidad": "128 GB", "Conexión": "USB 3.2", "Garantía": "1 año" } },
  { id: 52, name: "Hub USB-C 7 en 1", category: "accesorios", price: 29990, oldPrice: 39990, installments: 3, freeShipping: false, full: true, condition: "Nuevo", sold: 950, stock: 110, rating: 4,
    image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&q=70", gallery: ["https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&q=70"],
    description: "Adaptador Hub USB-C 7 en 1 con HDMI 4K, USB 3.0, lector SD y carga PD.",
    specs: { "Puertos": "HDMI, 3x USB, SD/microSD, USB-C PD", "Resolución HDMI": "4K", "Garantía": "1 año" } }
];

// Categorías para filtros y accesos rápidos (clave -> { label, icon })
const CATEGORIES = {
  all: { label: "Todos", icon: "🛍️" },
  smartphones: { label: "Celulares", icon: "📱" },
  laptops: { label: "Notebooks", icon: "💻" },
  gamer: { label: "Gamer", icon: "🎮" },
  audio: { label: "Audio", icon: "🎧" },
  monitores: { label: "Monitores", icon: "🖥️" },
  consolas: { label: "Consolas", icon: "🕹️" },
  accesorios: { label: "Accesorios", icon: "🔌" }
};

// Imagen de respaldo si una URL externa no carga
const IMG_FALLBACK = "assets/placeholder.svg";
