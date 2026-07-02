/**
 * shared_periodic.js — Periodic Table & Element Database for Quantum Lab
 * Provides:
 *   - ELEMENT_DATA: Complete 118-element database with solid-state physics properties
 *   - MATERIAL_DATA: Key solid-state compound materials with full properties
 *   - PeriodicTable: Visual periodic table grid renderer (CSS grid, 18 columns)
 *   - showElementDetail: Detailed property panel for selected element/material
 *   - Utility functions for element/material lookup
 */
'use strict';

/* ─── Constants ─── */

var BLOCK_COLORS = {
  s: '#ff6b6b',
  p: '#ffd93d',
  d: '#6bcbff',
  f: '#6bffb8'
};

var BLOCK_COLORS_DARK = {
  s: '#cc3333',
  p: '#cc9900',
  d: '#2288bb',
  f: '#22bb66'
};

var CATEGORY_COLORS = {
  alkali: '#ff6b6b',
  alkaline: '#ff9f6b',
  transition: '#6bcbff',
  'post-transition': '#6bcbff',
  metalloid: '#ffd93d',
  nonmetal: '#a8e6cf',
  halogen: '#6bffb8',
  'noble-gas': '#dcedc1',
  lanthanide: '#6bffb8',
  actinide: '#6bffb8',
  compound: '#c9b1ff'
};

function blockColor(block) {
  return BLOCK_COLORS[block] || '#888';
}

function blockColorDark(block) {
  return BLOCK_COLORS_DARK[block] || '#666';
}

function categoryColor(cat) {
  return CATEGORY_COLORS[cat] || '#888';
}

/* ─── Element Factory ─── */

function E(z, symbol, name, group, period, block, category, mass, xtal, extra) {
  var el = {
    z: z,
    symbol: symbol,
    name: name,
    group: group,
    period: period,
    block: block,
    category: category,
    mass: mass,
    crystalStructure: xtal,
    covalentRadius: null,
    electronegativity: null,
    bandgap: null,
    bandgapType: null,
    carrierMobility: null,
    holeMobility: null,
    latticeConstant: null,
    density: null,
    meltingPoint: null,
    thermalConductivity: null,
    workFunction: null,
    dielectricConstant: null,
    description: '',
    color: blockColor(block)
  };
  if (extra) {
    var keys = Object.keys(extra);
    for (var i = 0; i < keys.length; i++) {
      el[keys[i]] = extra[keys[i]];
    }
  }
  return el;
}

/* ─── ELEMENT_DATA — All 118 Chemical Elements ─── */

var ELEMENT_DATA = [
  // ── Period 1 ──
  E(1,'H','Hydrogen',1,1,'s','nonmetal',1.008,null,{
    covalentRadius:31,electronegativity:2.20,density:0.0000899,meltingPoint:14.01,thermalConductivity:0.1805,
    description:'Lightest and most abundant element. Primordial constituent of stars and gas giants.'}),
  E(2,'He','Helium',18,1,'s','noble-gas',4.0026,null,{
    covalentRadius:28,density:0.0001785,meltingPoint:0.95,thermalConductivity:0.1513,
    description:'Noble gas, second lightest. Used as cryogenic coolant and in gas chromatography.'}),

  // ── Period 2 ──
  E(3,'Li','Lithium',1,2,'s','alkali',6.94,'bcc',{
    covalentRadius:128,electronegativity:0.98,density:0.534,meltingPoint:453.65,thermalConductivity:84.8,workFunction:2.93,
    description:'Soft alkali metal. Key component in rechargeable batteries and thermal management.'}),
  E(4,'Be','Beryllium',2,2,'s','alkaline',9.012,'hcp',{
    covalentRadius:96,electronegativity:1.57,density:1.848,meltingPoint:1560,thermalConductivity:200,workFunction:4.98,
    description:'Lightweight alkaline earth metal. Used in aerospace alloys and X-ray windows.'}),
  E(5,'B','Boron',13,2,'p','metalloid',10.81,'tetragonal',{
    covalentRadius:84,electronegativity:2.04,density:2.08,meltingPoint:2349,thermalConductivity:27.4,
    description:'Metalloid with complex crystal structure. Used in neutron detectors and borosilicate glass.'}),
  E(6,'C','Carbon',14,2,'p','nonmetal',12.011,'hexagonal',{
    covalentRadius:76,electronegativity:2.55,density:2.267,meltingPoint:3823,thermalConductivity:140,workFunction:5.0,
    description:'Fundamental to organic chemistry. Exists as graphite, diamond, graphene, and nanotubes.'}),
  E(7,'N','Nitrogen',15,2,'p','nonmetal',14.007,null,{
    covalentRadius:71,electronegativity:3.04,density:0.001251,meltingPoint:63.15,thermalConductivity:0.0258,
    description:'Major component of Earth\'s atmosphere. Essential for ammonia and semiconductor processing.'}),
  E(8,'O','Oxygen',16,2,'p','nonmetal',15.999,null,{
    covalentRadius:66,electronegativity:3.44,density:0.001429,meltingPoint:54.36,thermalConductivity:0.0266,
    description:'Essential for respiration and combustion. Key constituent of oxide semiconductors.'}),
  E(9,'F','Fluorine',17,2,'p','halogen',18.998,null,{
    covalentRadius:64,electronegativity:3.98,density:0.001696,meltingPoint:53.53,thermalConductivity:0.0277,
    description:'Most electronegative element. Used in fluoride glasses and semiconductor etching.'}),
  E(10,'Ne','Neon',18,2,'p','noble-gas',20.180,null,{
    covalentRadius:58,density:0.000900,meltingPoint:24.56,thermalConductivity:0.0491,
    description:'Inert gas used in neon lighting and cryogenic refrigeration.'}),

  // ── Period 3 ──
  E(11,'Na','Sodium',1,3,'s','alkali',22.990,'bcc',{
    covalentRadius:166,electronegativity:0.93,density:0.968,meltingPoint:370.87,thermalConductivity:141,workFunction:2.75,
    description:'Soft alkali metal. Important for sodium-ion batteries and chemical synthesis.'}),
  E(12,'Mg','Magnesium',2,3,'s','alkaline',24.305,'hcp',{
    covalentRadius:141,electronegativity:1.31,density:1.738,meltingPoint:923,thermalConductivity:156,workFunction:3.66,
    description:'Light alkaline earth metal. Used in lightweight alloys and as a dopant in GaN.'}),
  E(13,'Al','Aluminium',13,3,'p','post-transition',26.982,'fcc',{
    covalentRadius:121,electronegativity:1.61,density:2.70,meltingPoint:933.47,thermalConductivity:237,workFunction:4.08,
    dielectricConstant:1.6,
    description:'Light post-transition metal. Widely used in interconnects, mirrors, and AlGaAs/GaAs heterostructures.'}),
  E(14,'Si','Silicon',14,3,'p','metalloid',28.085,'diamond',{
    covalentRadius:111,electronegativity:1.90,bandgap:1.12,bandgapType:'indirect',carrierMobility:1450,holeMobility:450,
    latticeConstant:5.431,density:2.329,meltingPoint:1687,thermalConductivity:149,workFunction:4.85,dielectricConstant:11.7,
    description:'Workhorse of modern electronics. Indirect-bandgap semiconductor; foundation of all integrated circuits.'}),
  E(15,'P','Phosphorus',15,3,'p','nonmetal',30.974,'orthorhombic',{
    covalentRadius:107,electronegativity:2.19,density:1.823,meltingPoint:317.3,thermalConductivity:0.236,
    description:'Essential dopant in silicon (n-type). Exists as white, red, and black allotropes.'}),
  E(16,'S','Sulfur',16,3,'p','nonmetal',32.06,'orthorhombic',{
    covalentRadius:105,electronegativity:2.58,density:2.07,meltingPoint:388.36,thermalConductivity:0.205,
    description:'Chalcogen element. Used in II-VI semiconductors (ZnS, CdS) and as an n-type dopant.'}),
  E(17,'Cl','Chlorine',17,3,'p','halogen',35.45,null,{
    covalentRadius:99,electronegativity:3.16,density:0.003214,meltingPoint:171.6,thermalConductivity:0.0089,
    description:'Reactive halogen. Used in semiconductor etching and water purification.'}),
  E(18,'Ar','Argon',18,3,'p','noble-gas',39.948,null,{
    covalentRadius:71,density:0.001784,meltingPoint:83.8,thermalConductivity:0.0177,
    description:'Inert gas used as a processing atmosphere in semiconductor fabrication.'}),

  // ── Period 4 ──
  E(19,'K','Potassium',1,4,'s','alkali',39.098,'bcc',{
    covalentRadius:203,electronegativity:0.82,density:0.856,meltingPoint:336.53,thermalConductivity:102.5,workFunction:2.29,
    description:'Soft alkali metal. Important electrolyte in biological systems.'}),
  E(20,'Ca','Calcium',2,4,'s','alkaline',40.078,'fcc',{
    covalentRadius:176,electronegativity:1.00,density:1.55,meltingPoint:1115,thermalConductivity:201,workFunction:2.87,
    description:'Alkaline earth metal essential for biological processes. Used in CaF2 optical components.'}),
  E(21,'Sc','Scandium',3,4,'d','transition',44.956,'hcp',{
    covalentRadius:170,electronegativity:1.36,density:2.985,meltingPoint:1814,thermalConductivity:15.8,workFunction:3.5,
    description:'Light transition metal. Used in aerospace alloys and solid oxide fuel cells.'}),
  E(22,'Ti','Titanium',4,4,'d','transition',47.867,'hcp',{
    covalentRadius:160,electronegativity:1.54,density:4.506,meltingPoint:1941,thermalConductivity:21.9,workFunction:4.33,
    description:'Strong, corrosion-resistant transition metal. Key for TiO2 in photocatalysis and high-κ dielectrics.'}),
  E(23,'V','Vanadium',5,4,'d','transition',50.942,'bcc',{
    covalentRadius:153,electronegativity:1.63,density:6.11,meltingPoint:2183,thermalConductivity:30.7,workFunction:4.3,
    description:'Hard transition metal used in steel alloys and vanadium redox flow batteries.'}),
  E(24,'Cr','Chromium',6,4,'d','transition',51.996,'bcc',{
    covalentRadius:139,electronegativity:1.66,density:7.19,meltingPoint:2180,thermalConductivity:93.7,workFunction:4.5,
    description:'Hard, corrosion-resistant metal. Essential for stainless steel and hard coatings.'}),
  E(25,'Mn','Manganese',7,4,'d','transition',54.938,'cubic',{
    covalentRadius:139,electronegativity:1.55,density:7.21,meltingPoint:1519,thermalConductivity:7.81,workFunction:4.1,
    description:'Hard, brittle transition metal. Used in steel production and as a dopant in diluted magnetic semiconductors.'}),
  E(26,'Fe','Iron',8,4,'d','transition',55.845,'bcc',{
    covalentRadius:132,electronegativity:1.83,density:7.874,meltingPoint:1811,thermalConductivity:80.2,workFunction:4.5,
    description:'Most common transition metal. Ferromagnetic; essential for steel and magnetic devices.'}),
  E(27,'Co','Cobalt',9,4,'d','transition',58.933,'hcp',{
    covalentRadius:126,electronegativity:1.88,density:8.90,meltingPoint:1768,thermalConductivity:100,workFunction:5.0,
    description:'Ferromagnetic transition metal. Used in magnetic alloys and Li-ion battery cathodes.'}),
  E(28,'Ni','Nickel',10,4,'d','transition',58.693,'fcc',{
    covalentRadius:124,electronegativity:1.91,density:8.908,meltingPoint:1728,thermalConductivity:90.9,workFunction:5.15,
    description:'Ferromagnetic transition metal. Used in superalloys and as a catalyst.'}),
  E(29,'Cu','Copper',11,4,'d','transition',63.546,'fcc',{
    covalentRadius:132,electronegativity:1.90,density:8.96,meltingPoint:1357.77,thermalConductivity:401,workFunction:4.65,
    description:'Excellent electrical and thermal conductor. Used for interconnects and wiring in electronics.'}),
  E(30,'Zn','Zinc',12,4,'d','transition',65.38,'hcp',{
    covalentRadius:122,electronegativity:1.65,density:7.14,meltingPoint:692.68,thermalConductivity:116,workFunction:4.3,
    description:'Essential for II-VI semiconductors (ZnO, ZnSe, ZnS) used in optoelectronics and phosphors.'}),
  E(31,'Ga','Gallium',13,4,'p','post-transition',69.723,'orthorhombic',{
    covalentRadius:122,electronegativity:1.81,density:5.91,meltingPoint:302.91,thermalConductivity:40.6,workFunction:4.2,
    description:'Key III-V semiconductor constituent (GaAs, GaN, GaSb). Used in LEDs, RF electronics, and solar cells.'}),
  E(32,'Ge','Germanium',14,4,'p','metalloid',72.63,'diamond',{
    covalentRadius:122,electronegativity:2.01,bandgap:0.67,bandgapType:'indirect',carrierMobility:3900,holeMobility:1900,
    latticeConstant:5.658,density:5.323,meltingPoint:1211.4,thermalConductivity:60.2,workFunction:4.5,dielectricConstant:16.0,
    description:'Classic elemental semiconductor. High carrier mobility; used in infrared optics and high-speed transistors.'}),
  E(33,'As','Arsenic',15,4,'p','metalloid',74.922,'trigonal',{
    covalentRadius:119,electronegativity:2.18,density:5.727,meltingPoint:1090,thermalConductivity:50.2,workFunction:3.75,
    description:'Metalloid constituent of III-V semiconductors (GaAs, InAs, AlAs). Used in IR detectors and HEMTs.'}),
  E(34,'Se','Selenium',16,4,'p','nonmetal',78.971,'hexagonal',{
    covalentRadius:120,electronegativity:2.55,density:4.81,meltingPoint:494,thermalConductivity:0.519,workFunction:5.9,
    description:'Photoconductive chalcogen. Used in photocopiers, solar cells, and II-VI semiconductors (ZnSe).'}),
  E(35,'Br','Bromine',17,4,'p','halogen',79.904,null,{
    covalentRadius:114,electronegativity:2.96,density:3.122,meltingPoint:265.8,thermalConductivity:0.12,
    description:'Liquid halogen. Used in flame retardants and bromide-based etching.'}),
  E(36,'Kr','Krypton',18,4,'p','noble-gas',83.798,null,{
    covalentRadius:52,density:0.003749,meltingPoint:115.79,thermalConductivity:0.0094,
    description:'Inert gas used in high-performance lighting and as an ionization detector medium.'}),

  // ── Period 5 ──
  E(37,'Rb','Rubidium',1,5,'s','alkali',85.468,'bcc',{
    covalentRadius:220,electronegativity:0.82,density:1.532,meltingPoint:312.45,thermalConductivity:58.2,workFunction:2.26,
    description:'Soft alkali metal. Used in atomic clocks and quantum optics experiments.'}),
  E(38,'Sr','Strontium',2,5,'s','alkaline',87.62,'fcc',{
    covalentRadius:195,electronegativity:0.95,density:2.64,meltingPoint:1050,thermalConductivity:35.4,workFunction:2.59,
    description:'Alkaline earth metal. Used in SrTiO3 substrates and optical materials.'}),
  E(39,'Y','Yttrium',3,5,'d','transition',88.906,'hcp',{
    covalentRadius:190,electronegativity:1.22,density:4.472,meltingPoint:1799,thermalConductivity:17.2,workFunction:3.1,
    description:'Transition metal used in YAG lasers and YBa2Cu3O7 high-temperature superconductors.'}),
  E(40,'Zr','Zirconium',4,5,'d','transition',91.224,'hcp',{
    covalentRadius:175,electronegativity:1.33,density:6.52,meltingPoint:2128,thermalConductivity:22.6,workFunction:4.05,
    description:'Corrosion-resistant transition metal. Used in nuclear fuel cladding and ZrO2 dielectrics.'}),
  E(41,'Nb','Niobium',5,5,'d','transition',92.906,'bcc',{
    covalentRadius:164,electronegativity:1.60,density:8.57,meltingPoint:2750,thermalConductivity:53.7,workFunction:4.3,
    description:'Superconducting transition metal. Used in NbTi and Nb3Sn superconducting magnets.'}),
  E(42,'Mo','Molybdenum',6,5,'d','transition',95.95,'bcc',{
    covalentRadius:154,electronegativity:2.16,density:10.28,meltingPoint:2896,thermalConductivity:138,workFunction:4.6,
    description:'Refractory metal with high melting point. Used in electronics as a gate electrode.'}),
  E(43,'Tc','Technetium',7,5,'d','transition',98,'hcp',{
    covalentRadius:147,electronegativity:1.9,density:11.5,meltingPoint:2430,thermalConductivity:50.6,
    description:'First synthetic element. Radioactive; used in medical imaging.'}),
  E(44,'Ru','Ruthenium',8,5,'d','transition',101.07,'hcp',{
    covalentRadius:146,electronegativity:2.20,density:12.45,meltingPoint:2607,thermalConductivity:117,workFunction:4.71,
    description:'Platinum-group transition metal. Used in resistors and as a catalyst.'}),
  E(45,'Rh','Rhodium',9,5,'d','transition',102.906,'fcc',{
    covalentRadius:142,electronegativity:2.28,density:12.41,meltingPoint:2237,thermalConductivity:150,workFunction:4.98,
    description:'Precious transition metal. Used in catalytic converters and thermocouples.'}),
  E(46,'Pd','Palladium',10,5,'d','transition',106.42,'fcc',{
    covalentRadius:139,electronegativity:2.20,density:12.02,meltingPoint:1828,thermalConductivity:71.8,workFunction:5.12,
    description:'Transition metal with high hydrogen absorption. Used in catalysis and hydrogen sensors.'}),
  E(47,'Ag','Silver',11,5,'d','transition',107.868,'fcc',{
    covalentRadius:145,electronegativity:1.93,density:10.49,meltingPoint:1234.93,thermalConductivity:429,workFunction:4.26,
    description:'Highest electrical and thermal conductivity of all metals. Used in contacts and plasmonics.'}),
  E(48,'Cd','Cadmium',12,5,'d','transition',112.414,'hcp',{
    covalentRadius:144,electronegativity:1.69,density:8.65,meltingPoint:594.22,thermalConductivity:96.6,workFunction:4.08,
    description:'Toxic transition metal. Key component of II-VI semiconductors (CdTe, CdS) for solar cells.'}),
  E(49,'In','Indium',13,5,'p','post-transition',114.818,'tetragonal',{
    covalentRadius:142,electronegativity:1.78,density:7.31,meltingPoint:429.75,thermalConductivity:81.8,workFunction:4.12,
    description:'Post-transition metal essential for III-V semiconductors (InP, InAs, InSb) and transparent electrodes (ITO).'}),
  E(50,'Sn','Tin',14,5,'p','post-transition',118.71,'tetragonal',{
    covalentRadius:139,electronegativity:1.96,density:7.265,meltingPoint:505.08,thermalConductivity:66.8,workFunction:4.42,
    description:'Post-transition metal used in solders and transparent conducting oxides (SnO2, ITO).'}),
  E(51,'Sb','Antimony',15,5,'p','metalloid',121.76,'trigonal',{
    covalentRadius:133,electronegativity:2.05,density:6.697,meltingPoint:903.78,thermalConductivity:24.4,workFunction:4.55,
    description:'Metalloid constituent of III-V semiconductors (GaSb, InSb). Used in IR detectors.'}),
  E(52,'Te','Tellurium',16,5,'p','metalloid',127.60,'hexagonal',{
    covalentRadius:135,electronegativity:2.10,density:6.24,meltingPoint:722.66,thermalConductivity:2.35,workFunction:4.95,
    description:'Chalcogen metalloid. Used in II-VI semiconductors (CdTe) and thermoelectric compounds.'}),
  E(53,'I','Iodine',17,5,'p','halogen',126.904,'orthorhombic',{
    covalentRadius:133,electronegativity:2.66,density:4.933,meltingPoint:386.85,thermalConductivity:0.449,
    description:'Halogen solid. Used in perovskite solar cells and as a dopant source.'}),
  E(54,'Xe','Xenon',18,5,'p','noble-gas',131.293,null,{
    covalentRadius:58,density:0.005894,meltingPoint:161.4,thermalConductivity:0.0057,
    description:'Heavy noble gas. Used in ion thrusters, flash lamps, and as an anesthesia gas.'}),

  // ── Period 6 ──
  E(55,'Cs','Caesium',1,6,'s','alkali',132.905,'bcc',{
    covalentRadius:235,electronegativity:0.79,density:1.93,meltingPoint:301.59,thermalConductivity:35.9,workFunction:2.14,
    description:'Softest alkali metal. Used in atomic clocks (Cs fountain) and photomultiplier cathodes.'}),
  E(56,'Ba','Barium',2,6,'s','alkaline',137.327,'bcc',{
    covalentRadius:215,electronegativity:0.89,density:3.51,meltingPoint:1000,thermalConductivity:18.4,workFunction:2.7,
    description:'Alkaline earth metal. Used in YBCO superconductors and as a getter in vacuum tubes.'}),
  E(57,'La','Lanthanum',3,6,'f','lanthanide',138.905,'hcp',{
    covalentRadius:207,electronegativity:1.10,density:6.146,meltingPoint:1193,thermalConductivity:13.4,workFunction:3.5,
    description:'First lanthanide. Used in high-κ dielectrics (La2O3) and optical glass.'}),
  E(58,'Ce','Cerium',4,6,'f','lanthanide',140.116,'fcc',{
    covalentRadius:204,electronegativity:1.12,density:6.77,meltingPoint:1068,thermalConductivity:11.3,
    description:'Most abundant lanthanide. Used in CeO2 polishing agents and catalytic converters.'}),
  E(59,'Pr','Praseodymium',5,6,'f','lanthanide',140.908,'hcp',{
    covalentRadius:203,electronegativity:1.13,density:6.77,meltingPoint:1208,thermalConductivity:12.5,
    description:'Lanthanide used in high-strength magnets and fiber optic amplifiers.'}),
  E(60,'Nd','Neodymium',6,6,'f','lanthanide',144.243,'hcp',{
    covalentRadius:201,electronegativity:1.14,density:7.01,meltingPoint:1297,thermalConductivity:16.5,
    description:'Key component of NdFeB permanent magnets and Nd:YAG lasers.'}),
  E(61,'Pm','Promethium',7,6,'f','lanthanide',145,'hcp',{
    covalentRadius:199,electronegativity:1.13,density:7.26,meltingPoint:1315,thermalConductivity:15,
    description:'Radioactive lanthanide. Used in promethium-powered atomic batteries.'}),
  E(62,'Sm','Samarium',8,6,'f','lanthanide',150.36,'trigonal',{
    covalentRadius:198,electronegativity:1.17,density:7.52,meltingPoint:1345,thermalConductivity:13.3,
    description:'Lanthanide used in SmCo permanent magnets and samarium-doped catalysts.'}),
  E(63,'Eu','Europium',9,6,'f','lanthanide',151.964,'bcc',{
    covalentRadius:198,electronegativity:1.20,density:5.264,meltingPoint:1099,thermalConductivity:13.9,
    description:'Lanthanide used in red phosphors for displays and Eu-doped scintillators.'}),
  E(64,'Gd','Gadolinium',10,6,'f','lanthanide',157.25,'hcp',{
    covalentRadius:196,electronegativity:1.20,density:7.90,meltingPoint:1585,thermalConductivity:10.6,
    description:'Lanthanide with highest neutron cross-section. Used in MRI contrast agents.'}),
  E(65,'Tb','Terbium',11,6,'f','lanthanide',158.925,'hcp',{
    covalentRadius:194,electronegativity:1.20,density:8.23,meltingPoint:1629,thermalConductivity:11.1,
    description:'Lanthanide used in green phosphors and magnetostrictive Terfenol-D alloys.'}),
  E(66,'Dy','Dysprosium',12,6,'f','lanthanide',162.5,'hcp',{
    covalentRadius:192,electronegativity:1.22,density:8.55,meltingPoint:1680,thermalConductivity:10.7,
    description:'Lanthanide with high magnetic susceptibility. Used in NdFeB magnet additives.'}),
  E(67,'Ho','Holmium',13,6,'f','lanthanide',164.93,'hcp',{
    covalentRadius:192,electronegativity:1.23,density:8.80,meltingPoint:1734,thermalConductivity:16.2,
    description:'Lanthanide used in Ho:YAG lasers for medical surgery.'}),
  E(68,'Er','Erbium',14,6,'f','lanthanide',167.259,'hcp',{
    covalentRadius:189,electronegativity:1.24,density:9.07,meltingPoint:1802,thermalConductivity:14.5,
    description:'Lanthanide used in Er-doped fiber amplifiers (EDFA) for optical communications.'}),
  E(69,'Tm','Thulium',15,6,'f','lanthanide',168.934,'hcp',{
    covalentRadius:190,electronegativity:1.25,density:9.32,meltingPoint:1818,thermalConductivity:16.9,
    description:'Least abundant lanthanide. Used in Tm:YAG lasers and X-ray sources.'}),
  E(70,'Yb','Ytterbium',16,6,'f','lanthanide',173.045,'fcc',{
    covalentRadius:187,electronegativity:1.10,density:6.57,meltingPoint:1097,thermalConductivity:38.5,
    description:'Lanthanide used in Yb-doped fiber lasers and as a strain gauge material.'}),
  E(71,'Lu','Lutetium',17,6,'f','lanthanide',174.967,'hcp',{
    covalentRadius:187,electronegativity:1.27,density:9.84,meltingPoint:1925,thermalConductivity:16.4,
    description:'Heaviest lanthanide. Used in LuAG scintillators and PET detectors.'}),
  E(72,'Hf','Hafnium',4,6,'d','transition',178.49,'hcp',{
    covalentRadius:175,electronegativity:1.30,density:13.31,meltingPoint:2506,thermalConductivity:23,workFunction:3.9,
    description:'Transition metal used in HfO2 high-κ gate dielectrics and nuclear control rods.'}),
  E(73,'Ta','Tantalum',5,6,'d','transition',180.948,'bcc',{
    covalentRadius:170,electronegativity:1.50,density:16.69,meltingPoint:3290,thermalConductivity:57.5,workFunction:4.25,
    description:'Refractory transition metal. Used in Ta2O5 dielectrics and electrolytic capacitors.'}),
  E(74,'W','Tungsten',6,6,'d','transition',183.84,'bcc',{
    covalentRadius:162,electronegativity:2.36,density:19.25,meltingPoint:3695,thermalConductivity:173,workFunction:4.55,
    description:'Highest melting point of all metals. Used in filaments, X-ray anodes, and W plugs in Si ICs.'}),
  E(75,'Re','Rhenium',7,6,'d','transition',186.207,'hcp',{
    covalentRadius:159,electronegativity:1.90,density:21.02,meltingPoint:3459,thermalConductivity:48,workFunction:4.72,
    description:'Dense refractory transition metal. Used in superalloys and thermocouples.'}),
  E(76,'Os','Osmium',8,6,'d','transition',190.23,'hcp',{
    covalentRadius:158,electronegativity:2.20,density:22.59,meltingPoint:3306,thermalConductivity:87.6,workFunction:5.93,
    description:'Densest naturally occurring element. Used in fountain pen tips and electrical contacts.'}),
  E(77,'Ir','Iridium',9,6,'d','transition',192.217,'fcc',{
    covalentRadius:156,electronegativity:2.20,density:22.56,meltingPoint:2739,thermalConductivity:147,workFunction:5.27,
    description:'Corrosion-resistant platinum-group metal. Used in crucibles and spark plugs.'}),
  E(78,'Pt','Platinum',10,6,'d','transition',195.084,'fcc',{
    covalentRadius:150,electronegativity:2.28,density:21.45,meltingPoint:2041.4,thermalConductivity:71.6,workFunction:5.65,
    description:'Noble transition metal. Used in catalysts, thermocouples, and platinum silicide contacts.'}),
  E(79,'Au','Gold',11,6,'d','transition',196.967,'fcc',{
    covalentRadius:144,electronegativity:2.54,density:19.32,meltingPoint:1337.33,thermalConductivity:318,workFunction:5.1,
    description:'Noble metal with excellent conductivity and corrosion resistance. Used in wire bonding and plasmonics.'}),
  E(80,'Hg','Mercury',12,6,'d','transition',200.59,'trigonal',{
    covalentRadius:149,electronegativity:2.00,density:13.534,meltingPoint:234.32,thermalConductivity:8.34,workFunction:4.49,
    description:'Liquid transition metal. Used in HgCdTe infrared detectors and as a contact metal.'}),
  E(81,'Tl','Thallium',13,6,'p','post-transition',204.38,'hcp',{
    covalentRadius:148,electronegativity:1.80,density:11.85,meltingPoint:577,thermalConductivity:46.1,workFunction:3.7,
    description:'Post-transition metal. Used in TlBr radiation detectors and high-Tc superconductors.'}),
  E(82,'Pb','Lead',14,6,'p','post-transition',207.2,'fcc',{
    covalentRadius:146,electronegativity:2.33,density:11.34,meltingPoint:600.61,thermalConductivity:35.3,workFunction:4.25,
    description:'Post-transition metal. Used in PbS quantum dots, PbTe thermoelectrics, and radiation shielding.'}),
  E(83,'Bi','Bismuth',15,6,'p','post-transition',208.98,'trigonal',{
    covalentRadius:148,electronegativity:2.02,density:9.78,meltingPoint:544.55,thermalConductivity:7.97,workFunction:4.22,
    description:'Heavy post-transition metal with strong spin-orbit coupling. Used in topological insulators.'}),
  E(84,'Po','Polonium',16,6,'p','post-transition',209,'cubic',{
    covalentRadius:140,electronegativity:2.00,density:9.196,meltingPoint:527,thermalConductivity:20,
    description:'Radioactive post-transition metal. Used in alpha particle sources.'}),
  E(85,'At','Astatine',17,6,'p','halogen',210,null,{
    covalentRadius:150,electronegativity:2.20,density:6.35,meltingPoint:575,
    description:'Rarest naturally occurring element. Radioactive halogen.'}),
  E(86,'Rn','Radon',18,6,'p','noble-gas',222,null,{
    covalentRadius:145,density:0.00973,meltingPoint:202,
    description:'Radioactive noble gas. Environmental health hazard from natural decay.'}),

  // ── Period 7 ──
  E(87,'Fr','Francium',1,7,'s','alkali',223,'bcc',{
    covalentRadius:260,electronegativity:0.70,density:1.87,meltingPoint:300,
    description:'Heaviest alkali metal. Highly radioactive with no stable isotopes.'}),
  E(88,'Ra','Radium',2,7,'s','alkaline',226,'bcc',{
    covalentRadius:215,electronegativity:0.90,density:5.5,meltingPoint:973,
    description:'Radioactive alkaline earth metal. Used in radium-based cancer therapy.'}),
  E(89,'Ac','Actinium',3,7,'f','actinide',227,'fcc',{
    covalentRadius:215,electronegativity:1.10,density:10.07,meltingPoint:1323,thermalConductivity:12,
    description:'First actinide. Radioactive; used as a neutron source.'}),
  E(90,'Th','Thorium',4,7,'f','actinide',232.038,'fcc',{
    covalentRadius:206,electronegativity:1.30,density:11.724,meltingPoint:2115,thermalConductivity:54,workFunction:3.41,
    description:'Radioactive actinide. Potential nuclear fuel and ThO2 high-temperature ceramic.'}),
  E(91,'Pa','Protactinium',5,7,'f','actinide',231.036,'tetragonal',{
    covalentRadius:200,electronegativity:1.50,density:15.37,meltingPoint:1841,
    description:'Rare radioactive actinide. Intermediate in thorium fuel cycle.'}),
  E(92,'U','Uranium',6,7,'f','actinide',238.029,'orthorhombic',{
    covalentRadius:196,electronegativity:1.38,density:18.95,meltingPoint:1405.3,thermalConductivity:27.6,workFunction:3.63,
    description:'Primary nuclear fuel element. Used in UO2 fuel pellets and uranium enrichment.'}),
  E(93,'Np','Neptunium',7,7,'f','actinide',237,'orthorhombic',{
    covalentRadius:190,electronegativity:1.36,density:20.25,meltingPoint:912,thermalConductivity:6.3,
    description:'Transuranic actinide. Byproduct of nuclear reactors.'}),
  E(94,'Pu','Plutonium',8,7,'f','actinide',244,'monoclinic',{
    covalentRadius:187,electronegativity:1.28,density:19.84,meltingPoint:912.5,thermalConductivity:6.74,workFunction:3.6,
    description:'Transuranic actinide used in nuclear weapons and RTGs for space probes.'}),
  E(95,'Am','Americium',9,7,'f','actinide',243,'hcp',{
    covalentRadius:180,electronegativity:1.30,density:13.67,meltingPoint:1449,thermalConductivity:10,
    description:'Transuranic actinide used in household smoke detectors (241Am).'}),
  E(96,'Cm','Curium',10,7,'f','actinide',247,'hcp',{
    covalentRadius:174,electronegativity:1.30,density:13.51,meltingPoint:1613,
    description:'Transuranic actinide used as alpha particle source in space missions.'}),
  E(97,'Bk','Berkelium',11,7,'f','actinide',247,'hcp',{
    covalentRadius:170,electronegativity:1.30,density:14.78,meltingPoint:1259,
    description:'Transuranic actinide. Used for basic nuclear chemistry research.'}),
  E(98,'Cf','Californium',12,7,'f','actinide',251,'hcp',{
    covalentRadius:168,electronegativity:1.30,density:15.1,meltingPoint:1173,
    description:'Transuranic actinide. 252Cf used as neutron source in materials analysis.'}),
  E(99,'Es','Einsteinium',13,7,'f','actinide',252,'fcc',{
    covalentRadius:160,electronegativity:1.30,density:8.84,meltingPoint:1133,
    description:'Heavy transuranic actinide. Produced in minute quantities in reactors.'}),
  E(100,'Fm','Fermium',14,7,'f','actinide',257,null,{
    description:'Heavy transuranic actinide. Short half-life, produced in nuclear explosions.'}),
  E(101,'Md','Mendelevium',15,7,'f','actinide',258,null,{
    description:'Transuranic actinide. First element produced one atom at a time.'}),
  E(102,'No','Nobelium',16,7,'f','actinide',259,null,{
    description:'Transuranic actinide. Named after Alfred Nobel.'}),
  E(103,'Lr','Lawrencium',17,7,'f','actinide',262,null,{
    description:'Last actinide. Named after Ernest Lawrence.'}),
  E(104,'Rf','Rutherfordium',4,7,'d','transition',267,'hcp',{
    density:23.2,description:'First transactinide element. Predicted to have hcp crystal structure.'}),
  E(105,'Db','Dubnium',5,7,'d','transition',270,'bcc',{
    description:'Transactinide element. Named after Dubna, Russia.'}),
  E(106,'Sg','Seaborgium',6,7,'d','transition',269,'hcp',{
    description:'Transactinide element. Named after Glenn Seaborg.'}),
  E(107,'Bh','Bohrium',7,7,'d','transition',270,'hcp',{
    description:'Transactinide element. Named after Niels Bohr.'}),
  E(108,'Hs','Hassium',8,7,'d','transition',277,'hcp',{
    description:'Transactinide element. Named after Hassia (Latin for Hesse, Germany).'}),
  E(109,'Mt','Meitnerium',9,7,'d','transition',278,'fcc',{
    description:'Transactinide element. Named after Lise Meitner.'}),
  E(110,'Ds','Darmstadtium',10,7,'d','transition',281,'fcc',{
    description:'Transactinide element. Named after Darmstadt, Germany.'}),
  E(111,'Rg','Roentgenium',11,7,'d','transition',282,'fcc',{
    description:'Transactinide element. Named after Wilhelm Röntgen.'}),
  E(112,'Cn','Copernicium',12,7,'d','transition',285,null,{
    description:'Transactinide element. Named after Nicolaus Copernicus.'}),
  E(113,'Nh','Nihonium',13,7,'p','post-transition',286,null,{
    description:'Transactinide element. Named after Nihon (Japan).'}),
  E(114,'Fl','Flerovium',14,7,'p','post-transition',289,null,{
    description:'Transactinide element. Named after Flerov Laboratory, Russia.'}),
  E(115,'Mc','Moscovium',15,7,'p','post-transition',289,null,{
    description:'Transactinide element. Named after Moscow.'}),
  E(116,'Lv','Livermorium',16,7,'p','post-transition',293,null,{
    description:'Transactinide element. Named after Lawrence Livermore National Laboratory.'}),
  E(117,'Ts','Tennessine',17,7,'p','halogen',294,null,{
    description:'Transactinide element. Named after Tennessee, USA.'}),
  E(118,'Og','Oganesson',18,7,'p','noble-gas',294,null,{
    description:'Heaviest known element. Named after Yuri Oganessian.'})
];

/* ─── MATERIAL_DATA — Key Solid-State Materials ─── */

var MATERIAL_DATA = [
  // ~ Key Elemental Materials (enriched beyond ELEMENT_DATA basics) ~
  {z:6,id:'C_diamond',formula:'C (diamond)',type:'elemental',constituents:[6],
   crystalStructure:'diamond',bandgap:5.47,bandgapType:'indirect',
   carrierMobility:2200,holeMobility:1800,latticeConstant:3.567,
   density:3.515,meltingPoint:3823,thermalConductivity:2200,workFunction:5.0,
   dielectricConstant:5.7,
   description:'Ultimate semiconductor — highest known thermal conductivity, high breakdown field, exceptional carrier mobility.'},

  {z:14,id:'Si_enriched',formula:'Si (enriched)',type:'elemental',constituents:[14],
   crystalStructure:'diamond',bandgap:1.12,bandgapType:'indirect',
   carrierMobility:1450,holeMobility:450,latticeConstant:5.431,
   density:2.329,meltingPoint:1687,thermalConductivity:149,workFunction:4.85,
   dielectricConstant:11.7,
   description:'Workhorse semiconductor. Foundation of digital electronics and integrated circuits.'},

  {z:32,id:'Ge_enriched',formula:'Ge (enriched)',type:'elemental',constituents:[32],
   crystalStructure:'diamond',bandgap:0.67,bandgapType:'indirect',
   carrierMobility:3900,holeMobility:1900,latticeConstant:5.658,
   density:5.323,meltingPoint:1211,thermalConductivity:60,workFunction:4.5,
   dielectricConstant:16.0,
   description:'High-mobility elemental semiconductor. Used in high-speed transistors and infrared optics.'},

  // ~ III-V Compound Semiconductors ~
  {id:'GaAs',formula:'GaAs',type:'compound',constituents:[31,33],
   crystalStructure:'zincblende',bandgap:1.424,bandgapType:'direct',
   carrierMobility:8500,holeMobility:400,latticeConstant:5.653,
   density:5.32,meltingPoint:1511,thermalConductivity:55,workFunction:4.07,
   dielectricConstant:12.9,
   description:'III-V direct-bandgap semiconductor. Widely used in optoelectronics (LEDs, lasers), high-frequency electronics (HEMTs), and solar cells.'},

  {id:'InP',formula:'InP',type:'compound',constituents:[49,15],
   crystalStructure:'zincblende',bandgap:1.344,bandgapType:'direct',
   carrierMobility:5400,holeMobility:200,latticeConstant:5.869,
   density:4.81,meltingPoint:1335,thermalConductivity:68,workFunction:4.38,
   dielectricConstant:12.5,
   description:'III-V semiconductor used in high-frequency transistors and photonic integrated circuits (PICs).'},

  {id:'GaN',formula:'GaN',type:'compound',constituents:[31,7],
   crystalStructure:'wurtzite',bandgap:3.44,bandgapType:'direct',
   carrierMobility:1000,holeMobility:200,latticeConstant:3.189,
   density:6.15,meltingPoint:2790,thermalConductivity:130,workFunction:4.10,
   dielectricConstant:8.9,
   description:'Wide-bandgap III-V semiconductor essential for blue/UV LEDs, laser diodes, and high-power transistors.'},

  {id:'InAs',formula:'InAs',type:'compound',constituents:[49,33],
   crystalStructure:'zincblende',bandgap:0.354,bandgapType:'direct',
   carrierMobility:40000,holeMobility:500,latticeConstant:6.058,
   density:5.67,meltingPoint:1210,thermalConductivity:27,workFunction:4.55,
   dielectricConstant:12.3,
   description:'Narrow-bandgap III-V with ultra-high electron mobility for high-speed transistors and IR detectors.'},

  {id:'GaSb',formula:'GaSb',type:'compound',constituents:[31,51],
   crystalStructure:'zincblende',bandgap:0.726,bandgapType:'direct',
   carrierMobility:3000,holeMobility:1000,latticeConstant:6.096,
   density:5.61,meltingPoint:985,thermalConductivity:33,workFunction:4.06,
   dielectricConstant:15.7,
   description:'III-V semiconductor used in infrared photodetectors, thermophotovoltaics, and HBTs.'},

  {id:'InSb',formula:'InSb',type:'compound',constituents:[49,51],
   crystalStructure:'zincblende',bandgap:0.17,bandgapType:'direct',
   carrierMobility:78000,holeMobility:750,latticeConstant:6.479,
   density:5.78,meltingPoint:800,thermalConductivity:18,workFunction:4.09,
   dielectricConstant:16.8,
   description:'Narrowest-bandgap III-V with highest known electron mobility. Used in infrared sensors and magnetoresistive devices.'},

  // ~ II-VI Compound Semiconductors ~
  {id:'CdTe',formula:'CdTe',type:'compound',constituents:[48,52],
   crystalStructure:'zincblende',bandgap:1.5,bandgapType:'direct',
   carrierMobility:1050,holeMobility:100,latticeConstant:6.482,
   density:5.85,meltingPoint:1365,thermalConductivity:7.5,workFunction:5.5,
   dielectricConstant:10.4,
   description:'II-VI semiconductor widely used in thin-film solar cells and X-ray/gamma-ray detectors.'},

  {id:'ZnSe',formula:'ZnSe',type:'compound',constituents:[30,34],
   crystalStructure:'zincblende',bandgap:2.70,bandgapType:'direct',
   carrierMobility:600,holeMobility:28,latticeConstant:5.668,
   density:5.27,meltingPoint:1790,thermalConductivity:19,
   dielectricConstant:9.0,
   description:'II-VI semiconductor used in blue LEDs, laser diodes, and infrared optical components.'},

  {id:'ZnS',formula:'ZnS',type:'compound',constituents:[30,16],
   crystalStructure:'zincblende',bandgap:3.54,bandgapType:'direct',
   carrierMobility:165,holeMobility:5,latticeConstant:5.410,
   density:4.09,meltingPoint:1970,thermalConductivity:27,
   dielectricConstant:8.3,
   description:'II-VI wide-bandgap semiconductor used in electroluminescent displays and phosphors.'},

  {id:'CdS',formula:'CdS',type:'compound',constituents:[48,16],
   crystalStructure:'wurtzite',bandgap:2.42,bandgapType:'direct',
   carrierMobility:350,holeMobility:40,latticeConstant:4.136,
   density:4.83,meltingPoint:2020,thermalConductivity:20,workFunction:4.79,
   dielectricConstant:8.9,
   description:'II-VI semiconductor with high photosensitivity. Used in photoresistors and solar cells.'},

  {id:'ZnO',formula:'ZnO',type:'compound',constituents:[30,8],
   crystalStructure:'wurtzite',bandgap:3.37,bandgapType:'direct',
   carrierMobility:200,holeMobility:5,latticeConstant:3.249,
   density:5.61,meltingPoint:2248,thermalConductivity:54,workFunction:4.45,
   dielectricConstant:8.5,
   description:'Wide-bandgap II-VI semiconductor with large exciton binding energy for UV LEDs and transparent electronics.'},

  // ~ Oxide Semiconductors ~
  {id:'SnO2',formula:'SnO₂',type:'compound',constituents:[50,8],
   crystalStructure:'tetragonal',bandgap:3.6,bandgapType:'direct',
   carrierMobility:240,latticeConstant:4.737,
   density:6.95,meltingPoint:1900,thermalConductivity:33,workFunction:4.70,
   dielectricConstant:9.6,
   description:'Transparent conducting oxide used in gas sensors, flat-panel displays, and thin-film transistors.'},

  {id:'TiO2',formula:'TiO₂',type:'compound',constituents:[22,8],
   crystalStructure:'tetragonal',bandgap:3.05,bandgapType:'indirect',
   carrierMobility:30,latticeConstant:4.593,
   density:4.23,meltingPoint:2116,thermalConductivity:11.7,workFunction:4.20,
   dielectricConstant:86,
   description:'Wide-bandgap semiconductor used in photocatalysis, dye-sensitized solar cells, and high-κ dielectrics.'},

  {id:'SiO2',formula:'SiO₂',type:'compound',constituents:[14,8],
   crystalStructure:'hexagonal',bandgap:8.9,bandgapType:'direct',
   carrierMobility:null,latticeConstant:4.913,
   density:2.65,meltingPoint:1986,thermalConductivity:1.4,
   dielectricConstant:3.9,
   description:'Wide-bandgap insulator, fundamental to MOS device technology as gate dielectric and electrical isolation.'},

  {id:'Al2O3',formula:'Al₂O₃',type:'compound',constituents:[13,8],
   crystalStructure:'trigonal',bandgap:8.8,bandgapType:'direct',
   latticeConstant:4.758,
   density:3.98,meltingPoint:2345,thermalConductivity:35,workFunction:4.70,
   dielectricConstant:9.1,
   description:'Wide-bandgap insulator. Sapphire substrate for epitaxial GaN growth and high-κ dielectric applications.'},

  {id:'SiC',formula:'SiC',type:'compound',constituents:[14,6],
   crystalStructure:'hexagonal',bandgap:3.26,bandgapType:'indirect',
   carrierMobility:900,holeMobility:120,latticeConstant:3.073,
   density:3.21,meltingPoint:3100,thermalConductivity:370,workFunction:4.50,
   dielectricConstant:9.7,
   description:'Wide-bandgap semiconductor for high-power, high-temperature, and high-frequency electronics.'},

  {id:'Ga2O3',formula:'Ga₂O₃',type:'compound',constituents:[31,8],
   crystalStructure:'monoclinic',bandgap:4.85,bandgapType:'direct',
   carrierMobility:300,latticeConstant:12.23,
   density:5.88,meltingPoint:2070,thermalConductivity:27,workFunction:4.50,
   dielectricConstant:10.0,
   description:'Ultra-wide-bandgap semiconductor for next-generation power electronics and deep-UV photodetectors.'}
];

/* ─── Lookup Utilities ─── */

function getElementByZ(z) {
  for (var i = 0; i < ELEMENT_DATA.length; i++) {
    if (ELEMENT_DATA[i].z === z) return ELEMENT_DATA[i];
  }
  return null;
}

function getElementBySymbol(sym) {
  var s = sym.toUpperCase();
  for (var i = 0; i < ELEMENT_DATA.length; i++) {
    if (ELEMENT_DATA[i].symbol === s) return ELEMENT_DATA[i];
  }
  return null;
}

function getMaterialById(id) {
  for (var i = 0; i < MATERIAL_DATA.length; i++) {
    if (MATERIAL_DATA[i].id === id) return MATERIAL_DATA[i];
  }
  return null;
}

function findMaterialsForElement(z) {
  var result = [];
  for (var i = 0; i < MATERIAL_DATA.length; i++) {
    var mat = MATERIAL_DATA[i];
    if (mat.constituents && mat.constituents.indexOf(z) >= 0) {
      result.push(mat);
    }
  }
  return result;
}

/**
 * enrichElement — Merge element data with MATERIAL_DATA enrichment if available.
 * Returns a new object combining both.
 */
function enrichElement(element) {
  if (!element) return null;
  var enriched = {};
  var keys = Object.keys(element);
  for (var i = 0; i < keys.length; i++) {
    enriched[keys[i]] = element[keys[i]];
  }
  // Try to find a matching elemental material
  for (var j = 0; j < MATERIAL_DATA.length; j++) {
    var mat = MATERIAL_DATA[j];
    if (mat.type === 'elemental' && mat.z === element.z) {
      var mKeys = Object.keys(mat);
      for (var k = 0; k < mKeys.length; k++) {
        if (mat[mKeys[k]] !== null && mKeys[k] !== 'id' && mKeys[k] !== 'type' && mKeys[k] !== 'z') {
          enriched[mKeys[k]] = mat[mKeys[k]];
        }
      }
      break;
    }
  }
  return enriched;
}

/* ─── PeriodicTable Renderer ─── */

function PeriodicTable(containerId, opts) {
  var container = document.getElementById(containerId);
  if (!container) return;

  opts = opts || {};
  var onSelect = opts.onSelect || null;
  var highlightZ = opts.highlightZ || null;
  var showAll = opts.showAll !== false;
  var compact = opts.compact || false;

  container.innerHTML = '';

  // ── Inject styles ──
  var styleId = 'periodic-table-css';
  if (!document.getElementById(styleId)) {
    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
      '.pt-container { display: grid; grid-template-columns: repeat(18, 1fr); gap: 2px; padding: 8px; position: relative; }',
      '.pt-container.compact { gap: 1px; padding: 4px; }',
      '.pt-card { position: relative; border-radius: 6px; padding: 4px 2px; cursor: pointer;',
      '  display: flex; flex-direction: column; align-items: center; justify-content: center;',
      '  border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s ease; user-select: none;',
      '  min-height: 68px; overflow: hidden; }',
      '.pt-container.compact .pt-card { min-height: 48px; padding: 2px 1px; border-radius: 4px; }',
      '.pt-card:hover { transform: scale(1.08); z-index: 10; box-shadow: 0 4px 16px rgba(0,0,0,0.4); }',
      '.pt-card.highlighted { box-shadow: 0 0 0 2px #fff, 0 0 16px rgba(34,211,238,0.6); }',
      '.pt-card .pt-z { position: absolute; top: 2px; left: 4px; font-size: 9px; font-weight: 600; opacity: 0.7; }',
      '.pt-container.compact .pt-card .pt-z { font-size: 7px; }',
      '.pt-card .pt-symbol { font-size: 18px; font-weight: 700; line-height: 1.2; }',
      '.pt-container.compact .pt-card .pt-symbol { font-size: 14px; }',
      '.pt-card .pt-name { font-size: 8px; opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }',
      '.pt-container.compact .pt-card .pt-name { font-size: 6px; }',
      '.pt-card .pt-mass-tip { display: none; position: absolute; bottom: calc(100% + 4px); left: 50%; transform: translateX(-50%);',
      '  background: #1a1a28; color: #e0e0f0; padding: 4px 8px; border-radius: 6px;',
      '  border: 1px solid #3a3a55; font-size: 11px; white-space: nowrap; z-index: 100; pointer-events: none; }',
      '.pt-card:hover .pt-mass-tip { display: block; }',
      '.pt-fblock-label { grid-column: 1 / 3; display: flex; align-items: center; justify-content: flex-end;',
      '  font-size: 10px; font-weight: 600; opacity: 0.5; text-align: right; padding-right: 8px; }',
      '.pt-gap-marker { display: flex; align-items: center; justify-content: center; font-size: 10px;',
      '  opacity: 0.25; border-radius: 6px; background: rgba(255,255,255,0.02); min-height: 68px; }',
      '.pt-container.compact .pt-gap-marker { min-height: 48px; font-size: 8px; }',
      '.pt-fblock-container { margin-top: 6px; display: grid; grid-template-columns: 2fr repeat(15, 1fr) 1fr; gap: 2px; padding: 8px; }',
      '.pt-container.compact + .pt-fblock-container { gap: 1px; padding: 4px; margin-top: 4px; }',
      '.pt-fblock-container .pt-fblock-title { display: flex; align-items: center; font-size: 9px; font-weight: 600; opacity: 0.5; }',
    ].join('\n');
    document.head.appendChild(style);
  }

  // Filter to pure elements only (z <= 118)
  var elements = showAll
    ? ELEMENT_DATA.filter(function(e) { return e.z <= 118; })
    : ELEMENT_DATA.filter(function(e) { return e.z <= 92; });

  // ── Main grid ──
  var grid = document.createElement('div');
  grid.className = 'pt-container' + (compact ? ' compact' : '');

  // Place each element
  for (var i = 0; i < elements.length; i++) {
    var el = elements[i];
    var col, row;
    var isFblock = (el.z >= 57 && el.z <= 71) || (el.z >= 89 && el.z <= 103);

    if (el.z >= 57 && el.z <= 71) {
      col = el.z - 54; // 57→3, 71→17
      row = 8;
    } else if (el.z >= 89 && el.z <= 103) {
      col = el.z - 86; // 89→3, 103→17
      row = 9;
    } else {
      col = el.group;
      row = el.period;
    }

    var card = document.createElement('div');
    card.className = 'pt-card' + (el.z === highlightZ ? ' highlighted' : '');
    card.style.cssText = [
      'grid-column:' + col + ';grid-row:' + row + ';',
      'background:' + el.color + '22;',
      'border-color:' + el.color + '44;'
    ].join('');
    card.setAttribute('data-z', el.z);

    card.innerHTML = [
      '<span class="pt-z">' + el.z + '</span>',
      '<span class="pt-symbol" style="color:' + blockColorDark(el.block) + '">' + el.symbol + '</span>',
      '<span class="pt-name">' + el.name + '</span>',
      '<span class="pt-mass-tip">' + el.name + ' &middot; ' + el.mass + ' amu' + (el.bandgap ? ' &middot; E_g=' + el.bandgap + ' eV' : '') + '</span>'
    ].join('');

    card.addEventListener('click', (function(ev) {
      return function() {
        if (onSelect) onSelect(ev);
      };
    })(el));

    grid.appendChild(card);
  }

  // ── Gap markers for f-block positions in periods 6-7 ──
  var gapPositions = [
    { col: 3, row: 6, label: '57-71' },
    { col: 3, row: 7, label: '89-103' }
  ];
  for (var g = 0; g < gapPositions.length; g++) {
    var gap = document.createElement('div');
    gap.className = 'pt-gap-marker';
    gap.style.cssText = 'grid-column:' + gap.col + ';grid-row:' + gap.row + ';';
    gap.textContent = gap.label;
    grid.appendChild(gap);
  }

  // ── F-block row labels ──
  var fblockLabels = [
    { col: 1, row: 8, label: 'Lanthanides' },
    { col: 1, row: 9, label: 'Actinides' }
  ];
  for (var fl = 0; fl < fblockLabels.length; fl++) {
    var lbl = document.createElement('div');
    lbl.className = 'pt-fblock-label';
    lbl.style.cssText = 'grid-column:' + fblockLabels[fl].col + ';grid-row:' + fblockLabels[fl].row + ';';
    lbl.textContent = fblockLabels[fl].label;
    grid.appendChild(lbl);
  }

  // ── Column labels ──
  var groupLabels = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
  for (var gi = 0; gi < groupLabels.length; gi++) {
    var gl = document.createElement('div');
    gl.style.cssText = [
      'grid-column:' + (gi+1) + ';grid-row:1;',
      'font-size:8px;text-align:center;opacity:0.3;padding-top:2px;font-weight:600;',
      'pointer-events:none;'
    ].join('');
    gl.textContent = groupLabels[gi];
    grid.appendChild(gl);
  }

  container.appendChild(grid);
}

/* ─── Element Detail Panel ─── */

function showElementDetail(element, containerId, opts) {
  var container = document.getElementById(containerId);
  if (!container || !element) return;

  opts = opts || {};
  var onLoadSimulator = opts.onLoadSimulator || null;

  // Enrich the element data with MATERIAL_DATA if available
  var enriched = enrichElement(element);

  container.innerHTML = '';

  // ── Inject detail styles ──
  var styleId = 'element-detail-css';
  if (!document.getElementById(styleId)) {
    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
      '.ed-panel { background: rgba(16,16,28,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; }',
      '.ed-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }',
      '.ed-symbol { font-size: 48px; font-weight: 800; line-height: 1; }',
      '.ed-info { flex: 1; }',
      '.ed-name { font-size: 22px; font-weight: 600; }',
      '.ed-z { font-size: 14px; opacity: 0.6; font-family: var(--font-mono, monospace); }',
      '.ed-category { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; margin-top: 4px; }',
      '.ed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }',
      '.ed-prop { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; padding: 10px 12px; }',
      '.ed-prop-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; margin-bottom: 2px; }',
      '.ed-prop-value { font-size: 15px; font-weight: 600; }',
      '.ed-prop-unit { font-size: 11px; opacity: 0.5; margin-left: 4px; }',
      '.ed-description { font-size: 13px; line-height: 1.6; opacity: 0.7; margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 8px; }',
      '.ed-load-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: var(--grad-hero); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }',
      '.ed-load-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(34,211,238,0.3); }',
      '.ed-related { margin-top: 16px; }',
      '.ed-related-title { font-size: 12px; font-weight: 600; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }',
      '.ed-related-list { display: flex; flex-wrap: wrap; gap: 6px; }',
      '.ed-related-chip { padding: 4px 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 999px; font-size: 11px; cursor: pointer; transition: all 0.2s ease; }',
      '.ed-related-chip:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); }',
    ].join('\n');
    document.head.appendChild(style);
  }

  var panel = document.createElement('div');
  panel.className = 'ed-panel';

  var col = blockColor(enriched.block || 's');
  var colDark = blockColorDark(enriched.block || 's');

  // ── Header ──
  var header = document.createElement('div');
  header.className = 'ed-header';

  var symEl = document.createElement('div');
  symEl.className = 'ed-symbol';
  symEl.style.color = colDark;
  symEl.textContent = enriched.symbol || enriched.formula || '--';

  var infoEl = document.createElement('div');
  infoEl.className = 'ed-info';
  infoEl.innerHTML = [
    '<div class="ed-name">' + (enriched.name || '') + '</div>',
    '<div class="ed-z">Z = ' + enriched.z + (enriched.mass ? ' &middot; M = ' + enriched.mass + ' amu' : '') + '</div>',
    '<span class="ed-category" style="background:' + col + '33;color:' + colDark + '">' + (enriched.category || 'material') + '</span>'
  ].join('');

  header.appendChild(symEl);
  header.appendChild(infoEl);
  panel.appendChild(header);

  // ── Property Grid ──
  var propDefs = [
    { key: 'bandgap', label: 'Bandgap', unit: 'eV', fmt: function(v) { return v; } },
    { key: 'bandgapType', label: 'Bandgap Type', unit: '', fmt: function(v) { return v; } },
    { key: 'crystalStructure', label: 'Crystal Structure', unit: '', fmt: function(v) { return v || '—'; } },
    { key: 'carrierMobility', label: 'Electron Mobility', unit: 'cm²/V·s', fmt: function(v) { return v; } },
    { key: 'holeMobility', label: 'Hole Mobility', unit: 'cm²/V·s', fmt: function(v) { return v; } },
    { key: 'latticeConstant', label: 'Lattice Constant', unit: 'Å', fmt: function(v) { return v; } },
    { key: 'density', label: 'Density', unit: 'g/cm³', fmt: function(v) { return v; } },
    { key: 'meltingPoint', label: 'Melting Point', unit: 'K', fmt: function(v) { return v; } },
    { key: 'thermalConductivity', label: 'Thermal Conductivity', unit: 'W/(m·K)', fmt: function(v) { return v; } },
    { key: 'workFunction', label: 'Work Function', unit: 'eV', fmt: function(v) { return v; } },
    { key: 'dielectricConstant', label: 'Dielectric Constant', unit: '', fmt: function(v) { return v; } },
    { key: 'covalentRadius', label: 'Covalent Radius', unit: 'pm', fmt: function(v) { return v; } },
    { key: 'electronegativity', label: 'Electronegativity', unit: '', fmt: function(v) { return v; } },
    { key: 'mass', label: 'Atomic Mass', unit: 'amu', fmt: function(v) { return v; } },
  ];

  var propGrid = document.createElement('div');
  propGrid.className = 'ed-grid';

  var shown = 0;
  for (var p = 0; p < propDefs.length; p++) {
    var def = propDefs[p];
    var val = enriched[def.key];
    if (val === null || val === undefined || val === '') continue;
    var propEl = document.createElement('div');
    propEl.className = 'ed-prop';
    propEl.innerHTML = [
      '<div class="ed-prop-label">' + def.label + '</div>',
      '<div class="ed-prop-value">' + def.fmt(val) + '<span class="ed-prop-unit">' + def.unit + '</span></div>'
    ].join('');
    propGrid.appendChild(propEl);
    shown++;
  }

  if (shown > 0) panel.appendChild(propGrid);

  // ── Description ──
  if (enriched.description) {
    var desc = document.createElement('div');
    desc.className = 'ed-description';
    desc.textContent = enriched.description;
    panel.appendChild(desc);
  }

  // ── Related Materials (for pure elements) ──
  if (enriched.z && enriched.z <= 118) {
    var related = findMaterialsForElement(enriched.z);
    // Filter out self
    related = related.filter(function(m) { return !(m.type === 'elemental' && m.z === enriched.z); });
    if (related.length > 0) {
      var relDiv = document.createElement('div');
      relDiv.className = 'ed-related';
      var relTitle = document.createElement('div');
      relTitle.className = 'ed-related-title';
      relTitle.textContent = 'Related Materials';
      relDiv.appendChild(relTitle);

      var relList = document.createElement('div');
      relList.className = 'ed-related-list';
      for (var r = 0; r < related.length; r++) {
        (function(mat) {
          var chip = document.createElement('span');
          chip.className = 'ed-related-chip';
          chip.textContent = mat.formula || mat.id;
          chip.addEventListener('click', function() {
            showElementDetail(mat, containerId, opts);
          });
          relList.appendChild(chip);
        })(related[r]);
      }
      relDiv.appendChild(relList);
      panel.appendChild(relDiv);
    }
  }

  // ── Load in Simulator Button ──
  if (onLoadSimulator) {
    var btnDiv = document.createElement('div');
    btnDiv.style.marginTop = '16px';
    var btn = document.createElement('button');
    btn.className = 'ed-load-btn';
    btn.innerHTML = '<span>&#9889;</span> Load in Simulator';
    btn.addEventListener('click', function() {
      onLoadSimulator(enriched);
    });
    btnDiv.appendChild(btn);
    panel.appendChild(btnDiv);
  }

  container.appendChild(panel);
}

/* ─── Window Exports ─── */

window.ELEMENT_DATA = ELEMENT_DATA;
window.MATERIAL_DATA = MATERIAL_DATA;
window.PeriodicTable = PeriodicTable;
window.showElementDetail = showElementDetail;
window.getElementByZ = getElementByZ;
window.getElementBySymbol = getElementBySymbol;
window.getMaterialById = getMaterialById;
window.findMaterialsForElement = findMaterialsForElement;
window.enrichElement = enrichElement;
