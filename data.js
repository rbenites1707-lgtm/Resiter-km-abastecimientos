/* ══════════════════════════════════════════════════
   RESITER PERÚ — data.js
   Datos maestros: flota, conductores, mantenimiento
   Modificar aquí para agregar/editar unidades
══════════════════════════════════════════════════ */

// ── CONSTANTES ──────────────────────────────────
const DIVISIONS = ['Administracion', 'Aguas', 'Hidro carburos', 'Industrial', 'Mineria'];

const CECOS = [
  'Adm Division Industrial','Administración','Ag-Brocal','Ag-Chinalco',
  'Antamina','Arequipa','Brocal','CERRO VERDE','Chiclayo','Chinalco Cal',
  'Chinalco Residuos','CNPC','Coimolache','Las Bambas','Lima','Lagunas Norte',
  'Marcobre','Minsur San Rafael','Molitalia','Nexa Cajamarquilla','Nexa Pasco',
  'Petroperu lote 192','Pisco','Piura','Preva','Talara','San Gabriel',
  'Sierra Central','Tambomayo','Trapiche','Uchuchacua','Volcan','Volvo'
].sort();

const DIV_COLORS = {
  'Administracion':  '#1B4FD8',
  'Aguas':           '#0D7377',
  'Hidro carburos':  '#B45309',
  'Industrial':      '#7C3AED',
  'Mineria':         '#DC2626'
};

const ESTADOS_UNIDAD = ['EN USO', 'EN REPARACION', 'COMISARIA', 'POR ENTREGAR'];

// ── FLOTA COMPLETA — 181 UNIDADES ────────────────
// Formato: [n, placa, marca, anio, comb, gps, estado, division, ceco]
const FLEET_RAW = [
  [1,'BZF-802','Maxus',2025,'DIESEL','CLS','EN USO','Administracion','Adm Division Industrial'],
  [2,'BDH-728','Mazda',2020,'DIESEL','CLS','EN USO','Administracion','Administración'],
  [3,'BKN-847','Mitsubishi',2022,'DIESEL','CLS','EN USO','Administracion','Administración'],
  [4,'BCZ-818','Mazda',2020,'DIESEL','CLS','EN USO','Administracion','Administración'],
  [5,'BMV-722','Toyota',2022,'DIESEL','CLS','EN USO','Administracion','Administración'],
  [6,'AUE-927','Volkswagen',2017,'DIESEL','CLS','EN USO','Administracion','Administración'],
  [7,'BFJ-759','Mazda',2020,'DIESEL','CLS/DASCAM','EN USO','Administracion','Administración'],
  [8,'BXM-309','Mazda',2021,'—','No tiene','EN USO','Administracion','Administración'],
  [9,'BEO-894','Toyota',2020,'DIESEL','CLS','EN USO','Aguas','Ag-Chinalco'],
  [10,'BRZ-768','Toyota',2023,'DIESEL','CLS','EN USO','Aguas','Ag-Chinalco'],
  [11,'BWI-811','Mercedes benz',2023,'DIESEL','CLS','EN USO','Aguas','Ag-Chinalco'],
  [12,'BME-827','Toyota',2022,'DIESEL','CLS','EN USO','Aguas','Marcobre'],
  [13,'BWJ-864','Toyota',2024,'DIESEL','CLS/DASCAM','EN USO','Aguas','Ag-Chinalco'],
  [14,'BWJ-915','Toyota',2024,'DIESEL','HUNTER','EN USO','Aguas','Ag-Brocal'],
  [15,'BWJ-770','Toyota',2024,'DIESEL','HUNTER','EN USO','Aguas','Ag-Brocal'],
  [16,'BMU-913','Toyota',2022,'DIESEL','HUNTER','EN USO','Hidro carburos','Petroperu lote 192'],
  [17,'AUG-754','Freightliner',2018,'DIESEL','CLS','EN USO','Industrial','Chiclayo'],
  [18,'BEJ-863','Isuzu',2020,'DIESEL','CLS','EN USO','Industrial','Chiclayo'],
  [19,'BKP-898','Mitsubishi',2021,'DIESEL','CLS','EN USO','Industrial','Chiclayo'],
  [20,'BFL-824','Kia',2020,'DIESEL','CLS','EN USO','Industrial','Chiclayo'],
  [21,'BSE-737','Mercedes benz',2022,'DIESEL','CLS','EN USO','Industrial','Chiclayo'],
  [22,'D9M-780','Freightliner',2013,'DIESEL','CLS','EN USO','Industrial','Chiclayo'],
  [23,'ADF-811','Freightliner',2013,'DIESEL','CLS','EN USO','Industrial','Chiclayo'],
  [24,'F1N-923','Freightliner',2014,'DIESEL','CLS','EN USO','Industrial','Chiclayo'],
  [25,'ALI-720','Freightliner',2015,'DIESEL','CLS','EN USO','Industrial','CNPC'],
  [26,'BKL-753','Toyota',2022,'DIESEL','CLS','EN USO','Industrial','CNPC'],
  [27,'BSC-724','Mercedes benz',2023,'DIESEL','CLS','EN USO','Industrial','CNPC'],
  [28,'F6X-813','Volvo',2014,'DIESEL','CLS','EN USO','Industrial','CNPC'],
  [29,'CKI-853','Volvo',2027,'DIESEL','CLS','EN USO','Industrial','Lima'],
  [30,'APX-766','Hino',2016,'DIESEL','CLS','EN USO','Industrial','Lima'],
  [31,'BJS-792','Volkswagen',2022,'DIESEL','CLS','EN USO','Industrial','Lima'],
  [32,'BFL-727','Dongfeng',2020,'DIESEL','CLS','EN USO','Industrial','Lima'],
  [33,'BFJ-945','Mazda',2020,'DIESEL','CLS','EN USO','Industrial','Lima'],
  [34,'BNJ-903','Mercedes benz',2022,'DIESEL','CLS','EN USO','Industrial','Lima'],
  [35,'ALE-869','Volkswagen',2016,'DIESEL','CLS','EN USO','Industrial','Lima'],
  [36,'BPA-899','Hyundai',2022,'DIESEL','CLS','EN USO','Industrial','Lima'],
  [37,'BNZ-769','Mercedes benz',2022,'DIESEL','CLS','EN USO','Industrial','Lima'],
  [38,'BLY-881','Volkswagen',2022,'DIESEL','CLS','EN USO','Industrial','Lima'],
  [39,'BJC-945','Volkswagen',2020,'DIESEL','CLS','EN USO','Industrial','Lima'],
  [40,'ATD-790','Freightliner',2018,'DIESEL','CLS','EN USO','Industrial','Lima'],
  [41,'AVY-890','Volvo',2016,'DIESEL','CLS','EN USO','Industrial','Lima'],
  [42,'CAS-924','Mercedes benz',2025,'DIESEL','CLS','EN USO','Industrial','Lima'],
  [43,'APX-880','Hino',2016,'DIESEL','CLS','EN USO','Industrial','Molitalia'],
  [44,'F1N-941','Freightliner',2014,'DIESEL','CLS','EN USO','Industrial','Molitalia'],
  [45,'CFK-805','Dongfeng',2026,'GNV','CLS','EN USO','Industrial','Pisco'],
  [46,'CHL-918','Dongfeng',2026,'GNV','CLS','EN USO','Industrial','Pisco'],
  [47,'CEF-863','Dongfeng',2026,'GNV','CLS','EN USO','Industrial','Pisco'],
  [48,'BJG-708','Isuzu',2021,'DIESEL','CLS','EN USO','Industrial','Pisco'],
  [49,'BLB-713','Volkswagen',2022,'DIESEL','CLS','EN USO','Industrial','Pisco'],
  [50,'AJT-805','Hino',2015,'DIESEL','CLS','EN USO','Industrial','Piura'],
  [51,'D9M-781','Freightliner',2014,'DIESEL','CLS','EN USO','Industrial','Piura'],
  [52,'V7Z-719','Internacional',2015,'DIESEL','CLS','EN USO','Industrial','Piura'],
  [53,'BJF-820','Isuzu',2021,'DIESEL','CLS','EN USO','Industrial','Piura'],
  [54,'BSM-738','Mercedes benz',2023,'DIESEL','CLS','EN USO','Industrial','Preva'],
  [55,'AUJ-943','Hino',2017,'DIESEL','CLS','EN USO','Industrial','Talara'],
  [56,'ALE-767','Volkswagen',2016,'DIESEL','CLS','EN USO','Industrial','Talara'],
  [57,'ALH-909','Volkswagen',2016,'DIESEL','CLS','EN USO','Industrial','Volvo'],
  [58,'AMH-726','Freightliner',2016,'DIESEL','CLS','EN REPARACION','Industrial','Chiclayo'],
  [59,'BLY-880','Volkswagen',2022,'DIESEL','CLS','COMISARIA','Industrial','Pisco'],
  [60,'BTC-740','Isuzu',2023,'DIESEL','CLS','EN USO','Mineria','Antamina'],
  [61,'BES-886','Isuzu',2020,'DIESEL','CLS','EN USO','Mineria','Arequipa'],
  [62,'BEO-735','Toyota',2020,'DIESEL','CLS','EN USO','Mineria','Arequipa'],
  [63,'D1X-778','Hino',2012,'DIESEL','CLS','EN USO','Mineria','Arequipa'],
  [64,'BKU-713','Volkswagen',2022,'DIESEL','CLS','EN USO','Mineria','Arequipa'],
  [65,'BMB-838','Toyota',2022,'DIESEL','CLS','EN USO','Mineria','Arequipa'],
  [66,'BJJ-800','Volkswagen',2021,'DIESEL','CLS','EN USO','Mineria','Arequipa'],
  [67,'BET-766','Isuzu',2020,'DIESEL','CLS','EN USO','Mineria','Arequipa'],
  [68,'BSZ-828','Toyota',2023,'DIESEL','CLS','EN USO','Mineria','Arequipa'],
  [69,'CBY-807','Volvo',2025,'DIESEL','CLS','EN USO','Mineria','CERRO VERDE'],
  [70,'CFB-882','Freightliner',2025,'DIESEL','CLS','EN USO','Mineria','Chinalco Cal'],
  [71,'BPG-726','Mercedes benz',2022,'DIESEL','CLS','EN USO','Mineria','Chinalco Residuos'],
  [72,'BVU-849','Mercedes benz',2024,'DIESEL','CLS','EN USO','Mineria','Chinalco Residuos'],
  [73,'BVS-718','Mercedes benz',2023,'DIESEL','CLS','EN USO','Mineria','Chinalco Residuos'],
  [74,'BHK-939','Volkswagen',2021,'DIESEL','CLS','EN USO','Mineria','Nexa Cajamarquilla'],
  [75,'BSO-785','Mercedes benz',2022,'DIESEL','CLS','EN USO','Mineria','Lagunas Norte'],
  [76,'BTA-809','Toyota',2023,'DIESEL','CLS','EN USO','Mineria','Lagunas Norte'],
  [77,'BDT-850','Hino',2020,'DIESEL','CLS','EN USO','Mineria','Lagunas Norte'],
  [78,'BPJ-859','Mercedes benz',2022,'DIESEL','CLS','EN USO','Mineria','Lagunas Norte'],
  [79,'AUJ-931','Hino',2017,'DIESEL','CLS','EN USO','Mineria','Lagunas Norte'],
  [80,'BVS-799','Mercedes benz',2024,'DIESEL','CLS','EN USO','Mineria','Lagunas Norte'],
  [81,'BWY-778','Toyota',2024,'DIESEL','CLS','EN USO','Mineria','Las Bambas'],
  [82,'CJO-757','HINO',2026,'DIESEL','CLS','EN USO','Mineria','Minsur San Rafael'],
  [83,'BEL-830','Isuzu',2020,'DIESEL','CLS','EN USO','Mineria','Minsur San Rafael'],
  [84,'BSA-733','Mercedes benz',2023,'DIESEL','CLS','EN USO','Mineria','Minsur San Rafael'],
  [85,'CCI-929','Freightliner',2025,'DIESEL','CLS','EN USO','Mineria','Minsur San Rafael'],
  [86,'CCH-827','Freightliner',2025,'DIESEL','CLS','EN USO','Mineria','Minsur San Rafael'],
  [87,'CCJ-876','Isuzu',2025,'DIESEL','CLS','EN USO','Mineria','Minsur San Rafael'],
  [88,'CDT-740','Mercedes benz',2025,'DIESEL','CLS','EN USO','Mineria','Minsur San Rafael'],
  [89,'BNJ-701','Mitsubishi',2022,'DIESEL','CLS','EN USO','Mineria','Nexa Pasco'],
  [90,'BMC-806','Toyota',2022,'DIESEL','CLS','EN USO','Mineria','Nexa Cajamarquilla'],
  [91,'BPD-858','Isuzu',2022,'DIESEL','CLS','EN USO','Mineria','Nexa Pasco'],
  [92,'BSZ-921','Toyota',2023,'DIESEL','CLS','EN USO','Mineria','Nexa Pasco'],
  [93,'BPB-744','Isuzu',2022,'DIESEL','CLS','EN USO','Mineria','Nexa Pasco'],
  [94,'BVU-900','Freightliner',2023,'DIESEL','CLS','EN USO','Mineria','Nexa Pasco'],
  [95,'BLB-879','Hyundai',2022,'DIESEL','CLS','EN USO','Mineria','San Gabriel'],
  [96,'BKJ-946','Freightliner',2022,'DIESEL','CLS','EN USO','Mineria','San Gabriel'],
  [97,'BMC-912','Toyota',2022,'DIESEL','CLS','EN USO','Mineria','Sierra Central'],
  [98,'BSZ-920','Toyota',2023,'DIESEL','CLS','EN USO','Mineria','Tambomayo'],
  [99,'BJF-793','Isuzu',2021,'DIESEL','CLS','EN USO','Mineria','Volcan'],
  [100,'CEY-803','Freightliner',2025,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Cal'],
  [101,'CFB-760','Freightliner',2025,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Cal'],
  [102,'CEW-804','Toyota',2026,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Cal'],
  [103,'CEY-741','Freightliner',2025,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Cal'],
  [104,'CEY-742','Freightliner',2025,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Cal'],
  [105,'CEY-795','Freightliner',2025,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Cal'],
  [106,'BTA-810','Toyota',2023,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Residuos'],
  [107,'BVM-774','Mercedes benz',2024,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Residuos'],
  [108,'BVM-741','Mercedes benz',2024,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Residuos'],
  [109,'BVM-891','Mercedes benz',2022,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Residuos'],
  [110,'BVU-730','Toyota',2024,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Residuos'],
  [111,'BVU-760','Toyota',2024,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Residuos'],
  [112,'BVY-801','Mercedes benz',2022,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Residuos'],
  [113,'BVX-927','Mercedes benz',2022,'—','CLS/DASCAM','EN USO','Mineria','Chinalco Residuos'],
  [114,'CTQ-470','Mercedes benz',2025,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Cal'],
  [115,'BVR-939','Freightliner',2023,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Residuos'],
  [116,'BVS-757','Mercedes benz',2023,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Residuos'],
  [117,'CHF-231','Mitsubishi fuso',2023,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Residuos'],
  [118,'BYE-708','Mercedes benz',2024,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Residuos'],
  [119,'BXZ-731','Mercedes benz',2024,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Residuos'],
  [120,'BVM-793','Mercedes benz',2024,'DIESEL','CLS/DASCAM','EN USO','Mineria','Minsur San Rafael'],
  [121,'VAN-804','Dongfeng',2021,'DIESEL','CLS/DASCAM','EN USO','Mineria','Nexa Cajamarquilla'],
  [122,'F1N-919','Freightliner',2014,'DIESEL','CLS/DASCAM','EN USO','Mineria','Nexa Cajamarquilla'],
  [123,'BKP-940','Volkswagen',2022,'DIESEL','CLS/DASCAM','EN USO','Mineria','Nexa Cajamarquilla'],
  [124,'BVU-871','Freightliner',2023,'DIESEL','CLS/DASCAM','EN USO','Mineria','Chinalco Residuos'],
  [125,'BSZ-901','Toyota',2023,'DIESEL','CLS/DASCAM','EN USO','Mineria','Sierra Central'],
  [126,'BMI-751','Toyota',2022,'DIESEL','CLS/HUNTER','EN USO','Mineria','Uchuchacua'],
  [127,'BVS-703','Mercedes benz',2023,'DIESEL','CLS/DASCAM','EN USO','Mineria','Tambomayo'],
  [128,'CJP-815','Hino',2026,'DIESEL','GOLDCAR','EN USO','Mineria','Las Bambas'],
  [129,'CJO-758','Hino',2026,'DIESEL','GOLDCAR','EN USO','Mineria','Las Bambas'],
  [130,'CJN-893','Hino',2026,'DIESEL','GOLDCAR','EN USO','Mineria','Las Bambas'],
  [131,'CJP-946','Hino',2026,'DIESEL','GOLDCAR','EN USO','Mineria','Las Bambas'],
  [132,'CJQ-750','Hino',2026,'DIESEL','GOLDCAR','EN USO','Mineria','Las Bambas'],
  [133,'CJO-724','Volvo',2026,'DIESEL','GOLDCAR','EN USO','Mineria','Las Bambas'],
  [134,'CJN-820','Volvo',2026,'DIESEL','GOLDCAR','EN USO','Mineria','Las Bambas'],
  [135,'CJN-945','Volvo',2026,'DIESEL','GOLDCAR','EN USO','Mineria','Las Bambas'],
  [136,'CJN-822','Volvo',2026,'DIESEL','GOLDCAR','EN USO','Mineria','Las Bambas'],
  [137,'BSO-702','Mercedes benz',2023,'DIESEL','HUNTER','EN USO','Mineria','Brocal'],
  [138,'BSM-882','Mercedes benz',2023,'DIESEL','HUNTER','EN USO','Mineria','Brocal'],
  [139,'BSM-800','Freightliner',2023,'DIESEL','HUNTER','EN USO','Mineria','Brocal'],
  [140,'BSM-860','Mercedes benz',2023,'DIESEL','HUNTER','EN USO','Mineria','Brocal'],
  [141,'BSZ-900','Toyota',2023,'DIESEL','HUNTER','EN USO','Mineria','Brocal'],
  [142,'BSM-785','Mercedes benz',2023,'DIESEL','HUNTER','EN USO','Mineria','Coimolache'],
  [143,'BSM-720','Mercedes benz',2023,'DIESEL','HUNTER','EN USO','Mineria','Coimolache'],
  [144,'BSO-784','Mercedes benz',2022,'DIESEL','HUNTER','EN USO','Mineria','Coimolache'],
  [145,'BSM-732','Freightliner',2023,'DIESEL','HUNTER','EN USO','Mineria','Coimolache'],
  [146,'BDQ-834','Freightliner',2020,'DIESEL','HUNTER','EN USO','Mineria','Minsur San Rafael'],
  [147,'BJZ-904','Volkswagen',2022,'DIESEL','HUNTER','EN USO','Mineria','San Gabriel'],
  [148,'BTA-739','Toyota',2023,'DIESEL','HUNTER','EN USO','Mineria','San Gabriel'],
  [149,'BTC-793','Isuzu',2023,'DIESEL','HUNTER','EN USO','Mineria','San Gabriel'],
  [150,'BSM-839','Mercedes benz',2023,'DIESEL','HUNTER','EN USO','Mineria','San Gabriel'],
  [151,'BSM-881','Mercedes benz',2023,'DIESEL','HUNTER','EN USO','Mineria','San Gabriel'],
  [152,'BSZ-782','Toyota',2023,'DIESEL','HUNTER','EN USO','Mineria','San Gabriel'],
  [153,'BYE-760','Freightliner',2024,'DIESEL','HUNTER','EN USO','Mineria','San Gabriel'],
  [154,'BSL-943','Mercedes benz',2023,'DIESEL','HUNTER','EN USO','Mineria','Sierra Central'],
  [155,'BWF-913','Mercedes benz',2022,'DIESEL','HUNTER','EN USO','Mineria','Sierra Central'],
  [156,'BSL-944','Freightliner',2023,'DIESEL','HUNTER','EN USO','Mineria','Tambomayo'],
  [157,'BSZ-848','Toyota',2023,'DIESEL','HUNTER','EN USO','Mineria','Trapiche'],
  [158,'BJE-869','Isuzu',2021,'DIESEL','HUNTER','EN USO','Mineria','Uchuchacua'],
  [159,'BSD-905','Isuzu',2023,'DIESEL','HUNTER','EN USO','Mineria','Uchuchacua'],
  [160,'BLW-774','Volkswagen',2022,'DIESEL','HUNTER','EN USO','Mineria','Uchuchacua'],
  [161,'BPH-909','Freightliner',2022,'DIESEL','HUNTER','EN USO','Mineria','Uchuchacua'],
  [162,'AZG-891','Hyundai',2018,'DIESEL','RRV','EN USO','Mineria','Antamina'],
  [163,'BVS-635','Hyundai',2021,'GASOLINA','RRV','EN USO','Mineria','Antamina'],
  [164,'BKW-934','Toyota',2022,'DIESEL','RRV','EN USO','Mineria','Antamina'],
  [165,'BMS-721','Mercedes benz',2022,'DIESEL','RRV','EN USO','Mineria','Antamina'],
  [166,'BKR-761','Volkswagen',2020,'DIESEL','RRV','EN USO','Mineria','Antamina'],
  [167,'BJD-845','Volkswagen',2021,'DIESEL','RRV','EN USO','Mineria','Antamina'],
  [168,'BVM-852','Mercedes benz',2024,'DIESEL','RRV','EN USO','Mineria','Antamina'],
  [169,'BVR-875','Mercedes benz',2024,'DIESEL','RRV','EN USO','Mineria','Antamina'],
  [170,'BVM-742','Mercedes benz',2024,'DIESEL','RRV','EN USO','Mineria','Antamina'],
  [171,'BVS-722','Mercedes benz',2024,'DIESEL','RRV','EN USO','Mineria','Antamina'],
  [172,'CBF-721','Volvo',2025,'DIESEL','RRV','EN USO','Mineria','Antamina'],
  [173,'CBQ-895','Zna',2024,'ELECTRICO','RRV','EN USO','Mineria','Antamina'],
  [174,'CBZ-772','Volvo',2025,'DIESEL','RRV','EN USO','Mineria','Antamina'],
  [175,'CJP-776','Volvo',2026,'DIESEL','TRACKLOG','EN USO','Mineria','Las Bambas'],
  [176,'CJN-865','Volvo',2026,'DIESEL','TRACKLOG','EN USO','Mineria','Las Bambas'],
  [177,'CJO-773','Volvo',2026,'DIESEL','TRACKLOG','EN USO','Mineria','Las Bambas'],
  [178,'CJM-938','Volvo',2026,'DIESEL','TRACKLOG','EN USO','Mineria','Las Bambas'],
  [226,'UTV-001','Kawasaki',2021,'DIESEL','—','EN USO','Administracion','Administración'],
  [283,'BWE-977','Lima Traylers',2026,'—','—','POR ENTREGAR','Mineria','Las Bambas'],
  [284,'BWF-977','Lima Traylers',2026,'—','—','POR ENTREGAR','Mineria','Las Bambas'],
];

// Construir objetos de flota
let fleet = FLEET_RAW.map(r => ({
  n: r[0], placa: r[1], marca: r[2], anio: r[3],
  comb: r[4], gps: r[5], estado: r[6],
  division: r[7], ceco: r[8],
  lastKm: null, lastRend: null,
  hist: [], editMode: false
}));

// ── CONDUCTORES INICIALES ────────────────────────
let conductores = [
  { id:1, nombre:'Mamani Roque, Carlos',   dni:'43218765', lic:'A-IIIb', venc:'2026-03-15', tel:'987654321', div:'Mineria',   unidad:'BSA-733', estado:'Activo' },
  { id:2, nombre:'López Flores, Juan',     dni:'29876543', lic:'A-IIb',  venc:'2025-08-20', tel:'976543210', div:'Industrial', unidad:'AUG-754', estado:'Activo' },
  { id:3, nombre:'Torres Mendoza, Pedro',  dni:'55432198', lic:'A-IIIb', venc:'2025-06-10', tel:'965432109', div:'Mineria',   unidad:'CBF-721', estado:'Activo' },
  { id:4, nombre:'Quispe Huanca, Jorge',   dni:'41987654', lic:'A-IIb',  venc:'2026-11-05', tel:'954321098', div:'Mineria',   unidad:'BWY-778', estado:'Activo' },
  { id:5, nombre:'Flores Arce, Antonio',   dni:'38654321', lic:'A-IIb',  venc:'2025-07-30', tel:'943210987', div:'Aguas',     unidad:'BEO-894', estado:'Vacaciones' },
  { id:6, nombre:'Gómez Paredes, Luis',    dni:'47321654', lic:'A-IIIb', venc:'2027-01-20', tel:'932109876', div:'Industrial', unidad:'CFK-805', estado:'Activo' },
  { id:7, nombre:'Ramos Vidal, Eduardo',   dni:'52198765', lic:'A-IIb',  venc:'2025-05-28', tel:'921098765', div:'Mineria',   unidad:'AZG-891', estado:'Activo' },
  { id:8, nombre:'Huanca Díaz, Roberto',   dni:'61234567', lic:'A-IIIb', venc:'2026-09-14', tel:'910987654', div:'Mineria',   unidad:'BPG-726', estado:'Activo' },
  { id:9, nombre:'Vargas Campos, Miguel',  dni:'33456789', lic:'A-IIb',  venc:'2026-04-22', tel:'909876543', div:'Mineria',   unidad:'CJO-724', estado:'Activo' },
  { id:10,nombre:'Salinas Torre, Luis',    dni:'45678901', lic:'A-IIIb', venc:'2025-12-01', tel:'998877665', div:'Industrial', unidad:'BJS-792', estado:'Activo' },
];
let drvIdCounter = 11;

// ── MANTENIMIENTOS INICIALES ─────────────────────
let mantenimientos = [
  { id:1, placa:'AUG-754', tipo:'Cambio de aceite',       kmAct:118000, kmProx:120000, fecha:'2025-05-20', taller:'Taller Central Lima',    costo:450,  obs:'Aceite 15W40', est:'prox' },
  { id:2, placa:'ALI-720', tipo:'Mantenimiento preventivo', kmAct:142000, kmProx:145000, fecha:'2025-06-01', taller:'Taller Chiclayo Norte',  costo:1200, obs:'',             est:'prox' },
  { id:3, placa:'BSO-785', tipo:'Cambio de llantas',       kmAct:72400,  kmProx:75000,  fecha:'2025-05-25', taller:'Llantera Minera Sur',    costo:3200, obs:'4 llantas eje trasero', est:'prox' },
  { id:4, placa:'AMH-726', tipo:'Mantenimiento correctivo', kmAct:135000, kmProx:null,   fecha:'2025-05-10', taller:'Freightliner Service',   costo:8500, obs:'Falla en caja de cambios', est:'venc' },
  { id:5, placa:'BWY-778', tipo:'Cambio de filtros',       kmAct:19800,  kmProx:25000,  fecha:'2025-07-01', taller:'Toyota SAC',             costo:320,  obs:'Filtro aire, aceite y combustible', est:'ok' },
  { id:6, placa:'D1X-778', tipo:'Revisión técnica',        kmAct:210000, kmProx:null,   fecha:'2025-06-15', taller:'MTC Arequipa',           costo:180,  obs:'Revisión anual obligatoria', est:'prox' },
  { id:7, placa:'CBF-721', tipo:'Mantenimiento preventivo', kmAct:11200,  kmProx:15000,  fecha:'2025-08-01', taller:'Volvo SAC Antamina',     costo:950,  obs:'',             est:'ok' },
];
let mntIdCounter = 8;

// ── DOCUMENTOS INICIALES ─────────────────────────
let docs = [
  { id:1, placa:'BWY-778', division:'Mineria', ceco:'Las Bambas',          tipo:'SOAT',              numero:'SOAT-2025-001', emision:'2025-01-10', venc:'2026-01-09', entidad:'Rimac',       costo:320,  obs:'' },
  { id:2, placa:'BSA-733', division:'Mineria', ceco:'Minsur San Rafael',   tipo:'Revisión técnica',  numero:'RT-2025-144',  emision:'2025-02-15', venc:'2026-02-14', entidad:'MTC',         costo:180,  obs:'' },
  { id:3, placa:'AUG-754', division:'Industrial', ceco:'Chiclayo',         tipo:'SOAT',              numero:'SOAT-2024-789', emision:'2024-06-01', venc:'2025-05-31', entidad:'La Positiva', costo:290,  obs:'' },
  { id:4, placa:'AUG-754', division:'Industrial', ceco:'Chiclayo',         tipo:'Póliza de seguro',  numero:'POL-44821',    emision:'2024-07-01', venc:'2025-06-30', entidad:'Mapfre',       costo:1850, obs:'' },
  { id:5, placa:'ALI-720', division:'Industrial', ceco:'CNPC',             tipo:'Revisión técnica',  numero:'RT-2024-088',  emision:'2024-04-10', venc:'2025-04-09', entidad:'MTC',         costo:180,  obs:'' },
  { id:6, placa:'CBF-721', division:'Mineria', ceco:'Antamina',            tipo:'SOAT',              numero:'SOAT-2025-442', emision:'2025-03-01', venc:'2026-02-28', entidad:'Rimac',       costo:320,  obs:'' },
  { id:7, placa:'BEO-894', division:'Aguas', ceco:'Ag-Chinalco',           tipo:'Permiso de operación', numero:'PO-2025-019', emision:'2025-01-01', venc:'2025-12-31', entidad:'MTC',      costo:450,  obs:'' },
  { id:8, placa:'D1X-778', division:'Mineria', ceco:'Arequipa',            tipo:'Revisión técnica',  numero:'RT-2024-201',  emision:'2024-05-20', venc:'2025-05-19', entidad:'MTC',         costo:180,  obs:'VENCIDA - Renovar urgente' },
  { id:9, placa:'BMU-913', division:'Hidro carburos', ceco:'Petroperu lote 192', tipo:'Póliza de seguro', numero:'POL-55102', emision:'2024-09-01', venc:'2025-08-31', entidad:'Rimac',  costo:2100, obs:'' },
  { id:10,placa:'CFK-805', division:'Industrial', ceco:'Pisco',            tipo:'SOAT',              numero:'SOAT-2025-890', emision:'2025-04-15', venc:'2026-04-14', entidad:'La Positiva', costo:310,  obs:'' },
];
let docIdCounter = 11;

// ── RUTAS ────────────────────────────────────────
let rutas = [];
let rutaIdCounter = 1;

// ── REGISTROS (odómetro + abastecimiento) ────────
let records = [];

// ── CONTADORES PARA IA ───────────────────────────
let iaHistory = [];

// ══════════════════════════════════════════════════
// HELPERS DE DATOS — usados por app.js
// ══════════════════════════════════════════════════

function getUnit(placa) {
  return fleet.find(f => f.placa === placa);
}

function getDocState(venc) {
  if (!venc || venc === '—') return 'ok';
  const today = new Date();
  const d = new Date(venc);
  const diff = (d - today) / 86400000;
  if (diff < 0) return 'venc';
  if (diff < 60) return 'prox';
  return 'ok';
}

function getDaysLeft(venc) {
  if (!venc || venc === '—') return null;
  return Math.round((new Date(venc) - new Date()) / 86400000);
}

function rendChip(r) {
  if (!r || isNaN(r)) return '—';
  const v = +r;
  if (v >= 35) return `<span class="chip-good">${v.toFixed(1)}</span>`;
  if (v >= 25) return `<span class="chip-avg">${v.toFixed(1)}</span>`;
  return `<span class="chip-bad">${v.toFixed(1)}</span>`;
}

function stateBadge(e) {
  const m = { 'EN USO':'b-uso','EN REPARACION':'b-rep','COMISARIA':'b-com','POR ENTREGAR':'b-ent' };
  return `<span class="badge ${m[e] || 'b-gray'}">${e}</span>`;
}

function combBadge(c) {
  if (!c || c === '—') return '—';
  const m = { DIESEL:'b-info', GNV:'b-ok', GASOLINA:'b-warn', ELECTRICO:'b-purple' };
  return `<span class="badge ${m[c] || 'b-gray'}">${c}</span>`;
}

function divBadge(d) {
  return `<span class="badge b-purple" style="font-size:10px">${d}</span>`;
}

function buildFleetContext() {
  const rends = fleet.filter(f => f.lastRend);
  const avg = rends.length ? (rends.reduce((s,f) => s+f.lastRend, 0)/rends.length).toFixed(1) : 'sin datos';
  const criticos = fleet.filter(f => f.lastRend && f.lastRend < 25).map(f => `${f.placa}(${f.lastRend.toFixed(1)},${f.ceco})`);
  const optimos  = fleet.filter(f => f.lastRend && f.lastRend >= 35).map(f => `${f.placa}(${f.lastRend.toFixed(1)},${f.ceco})`);
  const today = new Date();
  const mntAlert = mantenimientos.filter(m => m.est !== 'ok').map(m => `${m.placa}:${m.tipo}(${m.est})`);
  const licAlert = conductores.filter(c => c.venc && c.venc !== '—' && (new Date(c.venc)-today) < 30*86400000).map(c => `${c.nombre}(vence:${c.venc})`);
  const docsVenc = docs.filter(d => getDaysLeft(d.venc) !== null && getDaysLeft(d.venc) < 0).length;
  const docsProx = docs.filter(d => { const dl=getDaysLeft(d.venc); return dl!==null && dl>=0 && dl<60; }).length;

  return `RESITER PERÚ — SISTEMA DE CONTROL DE FLOTA (${today.toLocaleDateString('es-PE')})
Flota total: ${fleet.length} unidades | En uso: ${fleet.filter(f=>f.estado==='EN USO').length} | En reparación: ${fleet.filter(f=>f.estado==='EN REPARACION').length} | Comisaría: ${fleet.filter(f=>f.estado==='COMISARIA').length} | Por entregar: ${fleet.filter(f=>f.estado==='POR ENTREGAR').length}
Divisiones: Administracion(${fleet.filter(f=>f.division==='Administracion').length}u) | Aguas(${fleet.filter(f=>f.division==='Aguas').length}u) | Hidro carburos(${fleet.filter(f=>f.division==='Hidro carburos').length}u) | Industrial(${fleet.filter(f=>f.division==='Industrial').length}u) | Mineria(${fleet.filter(f=>f.division==='Mineria').length}u)
Rendimiento promedio global: ${avg} km/gal | Unidades con datos: ${rends.length}
Unidades críticas (<25 km/gal): ${criticos.join(', ') || 'ninguna'}
Unidades óptimas (≥35 km/gal): ${optimos.join(', ') || 'ninguna'}
Combustibles: DIESEL(mayoría), GNV(3 Dongfeng 2026 en Pisco), ELECTRICO(1 Zna 2024 en Antamina)
GPS disponibles: CLS, CLS/DASCAM, HUNTER, RRV, GOLDCAR, TRACKLOG
Conductores: ${conductores.length} registrados | Licencias por vencer/vencidas: ${licAlert.join(', ') || 'ninguna'}
Mantenimientos urgentes: ${mntAlert.join(', ') || 'ninguno'}
Documentos vencidos: ${docsVenc} | Por vencer (60d): ${docsProx}
Rutas: ${rutas.length} total | ${rutas.filter(r=>r.estado==='En ruta').length} activas | ${rutas.filter(r=>r.estado==='Completado').length} completadas
Registros en sistema: ${records.length} (${records.filter(r=>r.type==='fuel').length} abastecimientos, ${records.filter(r=>r.type==='km').length} odómetros)
CECOs principales: Las Bambas, Chinalco Residuos, Antamina, San Gabriel, Minsur San Rafael, Brocal, Arequipa, Chinalco Cal`;
}
