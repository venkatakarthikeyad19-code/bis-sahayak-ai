"""
Authoritative BIS Knowledge Base Repository for BIS Sahayak AI.
Contains verified metadata, standard codes, safety clauses, and testing schemes.
"""
import re

BIS_STANDARDS_KNOWLEDGE = [
    {
        "id": "laptop",
        "keywords": ["laptop", "notebook", "laptop computer", "macbook", "ultrabook", "thinkpad", "chromebook", "portable computer"],
        "product_name": "Laptop / Notebook Computer",
        "category": "Electronics & Information Technology Goods (MeitY QCO)",
        "intended_use": "Information Processing & Computing",
        "material": "Aluminium / Magnesium alloy chassis, Lithium-ion battery, Polycarbonate, Display panel",
        "standard_number": "IS 13252 (Part 1) : 2010 / IEC 60950-1 : 2005",
        "standard_title": "Information Technology Equipment - Safety - Part 1: General Requirements",
        "relevant_clause": "Clause 1.5 (Components), Clause 2.1 (Protection against electric shock), Clause 4.3 (Batteries / IS 16046), Clause 4.5 (Thermal requirements)",
        "evidence_snippet": "IS 13252 (Part 1) mandates that all laptop and notebook computers introduced into India must be tested for electrical safety, fire enclosure resistance, touch temperature limits, and secondary cell battery protection as per IS 16046 (Part 2) : 2018. Power adapters must independently comply with IS 13252.",
        "testing_requirements": [
            "Electric strength and insulation breakdown resistance test (Clause 5.2)",
            "Earth leakage current and touch current measurement (< 0.25 mA for Class II)",
            "Temperature rise under maximum load operation (Clause 4.5)",
            "Flammability test of plastic enclosures (V-0 / V-1 rating under IS 11731)",
            "Battery pack short-circuit and overcharge protection (IS 16046-2 / IEC 62133-2)"
        ],
        "bis_service": {
            "name": "Compulsory Registration Scheme (CRS Phase-I)",
            "type": "Mandatory Registration under Ministry of Electronics & IT (MeitY)",
            "portal": "CRS BIS Portal (crsbis.in)",
            "description": "Every laptop manufacturer/importer must register each brand and model with BIS after obtaining safety test reports from a BIS-recognized laboratory."
        },
        "checklist": [
            {"id": "lap1", "task": "Verify external AC-DC power adapter possesses its own valid BIS CRS Registration (R-number)", "status": "completed"},
            {"id": "lap2", "task": "Ensure internal rechargeable Lithium-Ion cell and battery pack are certified to IS 16046 (Part 2)", "status": "completed"},
            {"id": "lap3", "task": "Confirm enclosure material meets UL94 V-0/V-1 flame retardancy rating", "status": "warning"},
            {"id": "lap4", "task": "Submit test samples to a BIS-recognized electronics test laboratory (ERTL, ETDC, or accredited lab)", "status": "pending"},
            {"id": "lap5", "task": "Apply for Model Registration and grant of R-Number on the BIS CRS portal (crsbis.in)", "status": "pending"},
            {"id": "lap6", "task": "Affix BIS Standard Mark with R-Number and Website statement on device rating label and packaging", "status": "pending"}
        ]
    },
    {
        "id": "mobile_phone",
        "keywords": ["mobile", "phone", "smartphone", "cellphone", "handset", "android phone", "iphone"],
        "product_name": "Mobile Handset / Smartphone",
        "category": "Electronics & Telecommunication Goods",
        "intended_use": "Mobile telecommunication & data services",
        "material": "Glass, Aluminium, Lithium polymer battery, Silicon PCB",
        "standard_number": "IS 13252 (Part 1) : 2010 & IS 16333 (Part 3) : 2022",
        "standard_title": "Information Technology Equipment - Safety & Indian Language Support for Mobile Phone Handsets",
        "relevant_clause": "Clause 2.1 (Electric Shock), Clause 4.3.8 (Batteries), IS 16333-3 (Mandatory Indian Language Input/Display)",
        "evidence_snippet": "All mobile phones sold in India must conform to IS 13252 (Part 1) for electrical safety and IS 16333 (Part 3) for multi-lingual Indian script input and display. Batteries must be separately certified under IS 16046.",
        "testing_requirements": [
            "Electrical safety & insulation test under IS 13252",
            "Indian Language input (Hindi, English, and regional scripts) verification under IS 16333",
            "Battery mechanical abuse and impact testing under IS 16046-2",
            "SAR (Specific Absorption Rate) regulatory compliance"
        ],
        "bis_service": {
            "name": "Compulsory Registration Scheme (CRS)",
            "type": "Mandatory Registration (MeitY QCO)",
            "portal": "CRS BIS Portal (crsbis.in)",
            "description": "Mandatory R-number generation for domestic sale and custom clearance."
        },
        "checklist": [
            {"id": "m1", "task": "Ensure handset firmware includes official Indian Language font and keyboard layout (IS 16333)", "status": "completed"},
            {"id": "m2", "task": "Obtain separate IS 16046 certification for internal battery", "status": "completed"},
            {"id": "m3", "task": "Test charger/power adapter against IS 13252", "status": "pending"},
            {"id": "m4", "task": "Apply for Registration on crsbis.in", "status": "pending"}
        ]
    },
    {
        "id": "kettle",
        "keywords": ["kettle", "electric kettle", "heating liquids", "water heater", "boiler", "tea kettle", "tea maker"],
        "product_name": "Electric Kettle",
        "category": "Household Electrical Appliances",
        "intended_use": "Domestic / Household liquid heating",
        "material": "Stainless Steel / Food-grade Polypropylene / Borosilicate Glass",
        "standard_number": "IS 302 (Part 2/Sec 15) : 2009",
        "standard_title": "Safety of household and similar electrical appliances: Particular requirements for appliances for heating liquids",
        "relevant_clause": "Clause 7 (Marking & Instructions), Clause 13 (Leakage Current), Clause 19 (Abnormal Operation / Boil-Dry)",
        "evidence_snippet": "Clause 19.101 dictates: Appliances for heating liquids shall incorporate an automatic cut-out device to protect against hazard if the appliance is operated without liquid (boil-dry test) or with insufficient liquid. Insulation resistance shall not drop below 2 MΩ after humidity conditioning.",
        "testing_requirements": [
            "Boiling-dry abnormal operation test (Clause 19)",
            "High voltage electrical insulation strength (Clause 13)",
            "Earth continuity and leakage current test (< 0.75 mA)",
            "Cord anchorage and mechanical drop resistance test"
        ],
        "bis_service": {
            "name": "Product Certification Scheme (Scheme-I / ISI Mark)",
            "type": "Mandatory Quality Control Order (QCO)",
            "portal": "Manakonline (manakonline.in)",
            "description": "Grant of licence for ISI mark on electrical appliances ensuring conformity before domestic sale."
        },
        "checklist": [
            {"id": "k1", "task": "Verify heater wattage rating (typically 1200W - 2200W at 230V AC)", "status": "completed"},
            {"id": "k2", "task": "Ensure dual-safety thermostat / bi-metal cut-out for boil-dry protection", "status": "completed"},
            {"id": "k3", "task": "Confirm food-contact grade material certification (IS 10146 / IS 10151)", "status": "warning"},
            {"id": "k4", "task": "Conduct pre-compliance leakage current and insulation tests in recognized NABL/BIS lab", "status": "pending"},
            {"id": "k5", "task": "Apply for ISI Factory Audit & Licence on Manakonline portal", "status": "pending"}
        ]
    },
    {
        "id": "pressure_cooker",
        "keywords": ["pressure cooker", "cooker", "autoclave", "cooking vessel", "domestic cooker"],
        "product_name": "Domestic Pressure Cooker",
        "category": "Mechanical / Utensils & Kitchenware",
        "intended_use": "Domestic Cooking Under Pressure",
        "material": "Wrought Aluminium Alloy / Stainless Steel / Hard Anodized",
        "standard_number": "IS 2347 : 2017",
        "standard_title": "Domestic Pressure Cookers - Specification (Fifth Revision)",
        "relevant_clause": "Clause 4 (Material), Clause 8 (Safety Devices), Clause 9 (Proof Pressure Test)",
        "evidence_snippet": "IS 2347 specifies that every domestic pressure cooker must withstand a hydraulic hydrostatic proof pressure of not less than twice the nominal working pressure (minimum 200 kPa) without leakage or permanent deformation, and include a fusible safety plug.",
        "testing_requirements": [
            "Hydrostatic proof pressure test (2x operating pressure)",
            "Bursting pressure test of safety release devices",
            "Thermal shock resistance of handles and gaskets",
            "Cooking performance and nominal operating pressure test (100 kPa ± 10 kPa)"
        ],
        "bis_service": {
            "name": "Mandatory ISI Mark Certification (QCO 2020)",
            "type": "Compulsory Certification by Dept. for Promotion of Industry and Internal Trade",
            "portal": "Manakonline (manakonline.in)",
            "description": "Manufacture, import, or sale of pressure cookers without ISI mark is legally prohibited in India."
        },
        "checklist": [
            {"id": "p1", "task": "Verify body and lid minimum thickness standards as per Clause 4", "status": "completed"},
            {"id": "p2", "task": "Integrate primary vent weight and secondary safety release valve", "status": "completed"},
            {"id": "p3", "task": "Perform hydrostatic proof pressure test at 200 kPa", "status": "pending"},
            {"id": "p4", "task": "Procure food-grade rubber gaskets compliant with IS 7466", "status": "pending"},
            {"id": "p5", "task": "Submit test samples to BIS Central Laboratory / Recognized Lab", "status": "pending"}
        ]
    },
    {
        "id": "led_bulb",
        "keywords": ["led", "lamp", "bulb", "lighting", "led bulb", "luminaire", "tube light", "cfl"],
        "product_name": "Self-Ballasted LED Lamp",
        "category": "Electronics & Lighting Equipment",
        "intended_use": "General Lighting Services (GLS)",
        "material": "Polycarbonate housing, Aluminium heat sink, PCB, B22/E27 cap",
        "standard_number": "IS 16102 (Part 1) : 2012 / IS 16102 (Part 2) : 2017",
        "standard_title": "Self-Ballasted LED Lamps for General Lighting Services - Safety & Performance Requirements",
        "relevant_clause": "Clause 6 (Marking), Clause 8 (Insulation Resistance), Clause 9 (Electric Strength)",
        "evidence_snippet": "IS 16102 (Part 1) requires self-ballasted LED lamps to provide insulation resistance of not less than 4 MΩ between live parts and accessible parts after 48h humidity treatment, with cap torque resistance exceeding 3 N·m.",
        "testing_requirements": [
            "High voltage withstand test (4 kV surge protection)",
            "Cap temperature rise and torsion resistance test",
            "Lumen maintenance and luminous efficacy (> 100 lm/W)",
            "Harmonic emissions test as per IS 14700 (Part 3/Sec 2)"
        ],
        "bis_service": {
            "name": "Compulsory Registration Scheme (CRS)",
            "type": "Self-Declaration of Conformity (SDoC)",
            "portal": "CRS BIS Portal (crsbis.in)",
            "description": "Manufacturers register products with BIS based on test reports from BIS-recognized labs."
        },
        "checklist": [
            {"id": "l1", "task": "Finalize LED driver surge protection and power factor specs (> 0.9)", "status": "completed"},
            {"id": "l2", "task": "Verify lamp cap mechanical torque resistance (IS 16102)", "status": "completed"},
            {"id": "l3", "task": "Complete 2,000-hour lumen maintenance pre-testing", "status": "pending"},
            {"id": "l4", "task": "Submit test report through BIS recognized test lab (CRS)", "status": "pending"},
            {"id": "l5", "task": "Obtain R-Number (Registration Number) for packaging label", "status": "pending"}
        ]
    },
    {
        "id": "safety_helmet",
        "keywords": ["helmet", "safety helmet", "industrial helmet", "head protection", "hard hat", "motorcycle helmet"],
        "product_name": "Industrial Safety Helmet",
        "category": "Personal Protective Equipment (PPE)",
        "intended_use": "Head protection against falling objects and impact",
        "material": "High-Density Polyethylene (HDPE) / ABS",
        "standard_number": "IS 2925 : 1984",
        "standard_title": "Specification for Industrial Safety Helmets",
        "relevant_clause": "Clause 5 (Physical requirements), Clause 6 (Shock absorption), Clause 7 (Penetration)",
        "evidence_snippet": "IS 2925 stipulates that the transmitted force through the helmet shell to an anvil shall not exceed 5.0 kN when subjected to a 5 kg striker dropped from a height of 1 metre.",
        "testing_requirements": [
            "Shock absorption test with 5kg drop striker",
            "Penetration resistance test with conical striker",
            "Flammability / flame resistance test (Clause 8)",
            "Electrical insulation test (withstanding 2.2 kV for 1 minute)"
        ],
        "bis_service": {
            "name": "Product Certification Scheme (ISI Mark)",
            "type": "Mandatory PPE Certification",
            "portal": "Manakonline (manakonline.in)",
            "description": "Mandatory ISI marking for industrial safety headgear."
        },
        "checklist": [
            {"id": "h1", "task": "Confirm virgin polymer grade (HDPE or ABS with UV stabilizers)", "status": "completed"},
            {"id": "h2", "task": "Design suspension harness with minimum 30 mm crown clearance", "status": "completed"},
            {"id": "h3", "task": "Conduct impact transmission test (< 5 kN transmitted force)", "status": "pending"},
            {"id": "h4", "task": "Inspect chin-strap retention strength (> 150 N release)", "status": "pending"},
            {"id": "h5", "task": "Apply for ISI certification on Manakonline", "status": "pending"}
        ]
    },
    {
        "id": "drinking_water",
        "keywords": ["water", "packaged water", "mineral water", "drinking water", "bottled water"],
        "product_name": "Packaged Drinking Water",
        "category": "Food & Agriculture / Packaged Beverages",
        "intended_use": "Direct human consumption",
        "material": "Food-grade PET bottles, Polycarbonate 20L jars",
        "standard_number": "IS 14543 : 2004",
        "standard_title": "Packaged Drinking Water (Other Than Packaged Natural Mineral Water) - Specification",
        "relevant_clause": "Clause 4 (Hygienic conditions), Clause 5 (Requirements for water quality), Table 1 (Microbiological parameters)",
        "evidence_snippet": "IS 14543 states that packaged drinking water must be free from coliform bacteria, viral pathogens, heavy metals (lead, cadmium, arsenic), and shall be packed in clean, sterile food-grade containers conforming to IS 12252.",
        "testing_requirements": [
            "Microbiological analysis (absence of E. coli, Salmonella, Yeast & Mould)",
            "Total dissolved solids (TDS) and mineral composition balance",
            "Pesticide residues screening test (gas chromatography)",
            "Container leaching and migration test"
        ],
        "bis_service": {
            "name": "Mandatory ISI Mark Certification (Food Safety Scheme)",
            "type": "Compulsory Certification by FSSAI & BIS",
            "portal": "Manakonline (manakonline.in)",
            "description": "No manufacturer can bottle or sell packaged drinking water in India without an active BIS ISI license."
        },
        "checklist": [
            {"id": "w1", "task": "Install reverse osmosis (RO), ozonation, and UV sterilization plant", "status": "completed"},
            {"id": "w2", "task": "Establish in-house testing laboratory with certified microbiologist and chemist", "status": "warning"},
            {"id": "w3", "task": "Complete 45-day pesticide and heavy metal test protocol", "status": "pending"},
            {"id": "w4", "task": "Apply for ISI mark license via Manakonline", "status": "pending"}
        ]
    },
    {
        "id": "water_heater",
        "keywords": ["geyser", "water heater", "immersion heater", "storage water heater"],
        "product_name": "Stationary Electric Storage Water Heater (Geyser)",
        "category": "Household Electrical Appliances",
        "intended_use": "Domestic sanitary water heating",
        "material": "Copper / Vitreous enamel lined steel tank, Mineral wool insulation",
        "standard_number": "IS 302 (Part 2/Sec 21) : 2011",
        "standard_title": "Safety of household and similar electrical appliances - Particular requirements for stationary storage water heaters",
        "relevant_clause": "Clause 19 (Pressure relief), Clause 22 (Vessel construction), Clause 29 (Creepage distances)",
        "evidence_snippet": "IS 302 (Part 2/Sec 21) requires closed water heaters to be fitted with a non-self-resetting thermal cut-out and pressure relief valve to ensure vessel does not rupture even if thermostats fail.",
        "testing_requirements": [
            "Hydrostatic pressure withstand test on inner tank (1.5x rated pressure)",
            "Standing loss / energy efficiency test (BEE Star rating)",
            "Pressure relief valve discharge test",
            "Earthing continuity and high voltage dielectric strength test"
        ],
        "bis_service": {
            "name": "Product Certification Scheme (Scheme-I / ISI Mark)",
            "type": "Mandatory ISI Mark & BEE Star Labelling",
            "portal": "Manakonline (manakonline.in)",
            "description": "Mandatory ISI mark compliance under Ministry of Power and DPIIT."
        },
        "checklist": [
            {"id": "g1", "task": "Test inner tank pressure rating (minimum 0.6 MPa to 0.8 MPa)", "status": "completed"},
            {"id": "g2", "task": "Install multi-function safety valve (non-return and pressure release)", "status": "completed"},
            {"id": "g3", "task": "Conduct BEE standing loss energy verification", "status": "pending"},
            {"id": "g4", "task": "Apply for ISI marking licence on Manakonline", "status": "pending"}
        ]
    },
    {
        "id": "electric_iron",
        "keywords": ["iron", "electric iron", "steam iron", "dry iron", "clothes iron"],
        "product_name": "Electric Iron (Dry & Steam)",
        "category": "Household Electrical Appliances",
        "intended_use": "Domestic fabric pressing & ironing",
        "material": "Die-cast aluminium soleplate, Non-stick coating, Bakelite handle",
        "standard_number": "IS 302 (Part 2/Sec 3) : 2007",
        "standard_title": "Safety of household and similar electrical appliances - Particular requirements for electric irons",
        "relevant_clause": "Clause 11 (Heating), Clause 19 (Abnormal operation), Clause 22 (Construction)",
        "evidence_snippet": "IS 302 (Part 2/Sec 3) mandates that electric irons must maintain accurate thermostat temperature control across fabric settings (Nylon to Linen) and incorporate thermal fuses to prevent fire when left face-down.",
        "testing_requirements": [
            "Thermal cut-out operation test during abnormal operation",
            "Drop test from 1 metre onto steel plate without live part exposure",
            "Soleplate temperature uniformity and thermostat accuracy test",
            "Cord flexure and flexing endurance test (Clause 25)"
        ],
        "bis_service": {
            "name": "Product Certification Scheme (Scheme-I / ISI Mark)",
            "type": "Mandatory QCO",
            "portal": "Manakonline (manakonline.in)",
            "description": "Mandatory ISI mark for all domestic dry and steam irons."
        },
        "checklist": [
            {"id": "i1", "task": "Verify thermal fuse operates at threshold < 260°C", "status": "completed"},
            {"id": "i2", "task": "Ensure 3-core supply cord with proper earthing (IS 694)", "status": "completed"},
            {"id": "i3", "task": "Conduct 20,000-cycle cord flexing test", "status": "pending"},
            {"id": "i4", "task": "Apply for ISI mark license via Manakonline", "status": "pending"}
        ]
    },
    {
        "id": "ac",
        "keywords": ["ac", "air conditioner", "split ac", "window ac", "cooling"],
        "product_name": "Air Conditioner",
        "category": "Household Electrical Appliances",
        "intended_use": "Domestic cooling and climate control",
        "material": "Compressor, copper coils, plastic chassis",
        "standard_number": "IS 1391 (Part 1 & 2)",
        "standard_title": "Room Air Conditioners - Specification",
        "relevant_clause": "Clause 10 (Cooling Capacity), Clause 15 (Power Consumption)",
        "evidence_snippet": "IS 1391 mandates that air conditioners must meet specific energy efficiency ratings (BEE Star Labeling) and undergo testing for cooling capacity under high ambient temperatures.",
        "testing_requirements": [
            "Cooling capacity and power consumption test",
            "Maximum operating conditions test",
            "Freeze test and enclosure sweat test"
        ],
        "bis_service": {
            "name": "Product Certification Scheme (Scheme-I / ISI Mark)",
            "type": "Mandatory QCO",
            "portal": "Manakonline (manakonline.in)",
            "description": "Mandatory ISI mark and BEE Star Rating required."
        },
        "checklist": [
            {"id": "a1", "task": "Verify compressor energy efficiency ratio (EER)", "status": "completed"},
            {"id": "a2", "task": "Conduct continuous running test at 43°C", "status": "pending"}
        ]
    },
    {
        "id": "fridge",
        "keywords": ["fridge", "refrigerator", "freezer", "deep freezer", "cooling"],
        "product_name": "Refrigerator",
        "category": "Household Electrical Appliances",
        "intended_use": "Food preservation and cooling",
        "material": "Compressor, insulated metal body, refrigerants",
        "standard_number": "IS 15750",
        "standard_title": "Household Frost-Free Refrigerating Appliances",
        "relevant_clause": "Clause 13 (Temperature Performance), Clause 16 (Energy Consumption)",
        "evidence_snippet": "IS 15750 specifies that household refrigerators must maintain safe internal temperatures in varying external climates and strictly comply with BEE energy consumption limits.",
        "testing_requirements": [
            "Pull-down test and temperature performance test",
            "Energy consumption test",
            "Door seal endurance test"
        ],
        "bis_service": {
            "name": "Product Certification Scheme (Scheme-I / ISI Mark)",
            "type": "Mandatory QCO",
            "portal": "Manakonline (manakonline.in)",
            "description": "Mandatory ISI mark and BEE Star Rating required."
        },
        "checklist": [
            {"id": "f1", "task": "Test thermostat calibration and pull-down time", "status": "pending"},
            {"id": "f2", "task": "Ensure refrigerant gas complies with environmental limits", "status": "completed"}
        ]
    },
    {
        "id": "toys",
        "keywords": ["toy", "toys", "electric toy", "kids toy", "plastic toy", "soft toy", "doll"],
        "product_name": "Safety of Toys",
        "category": "Toys & Children Products",
        "intended_use": "Play and recreation by children under 14 years",
        "material": "Plastics, Wood, Textiles, Metal fasteners",
        "standard_number": "IS 9873 (Part 1 to 9) & IS 15644 : 2006",
        "standard_title": "Safety of Toys (Mechanical, Physical, Flammability & Migration of Certain Elements)",
        "relevant_clause": "Part 1 (Physical & Mechanical properties), Part 2 (Flammability), Part 3 (Migration of Toxic Elements), IS 15644 (Electric Toys)",
        "evidence_snippet": "Toys (Quality Control) Order requires 100% mandatory compliance. Toys must have zero sharp edges, no choking hazards for children under 3 years, and phthalates/heavy metals (lead, mercury, cadmium) strictly below permissible migration limits.",
        "testing_requirements": [
            "Drop and impact test for small parts generation",
            "Chemical migration test for 8 toxic elements (Lead, Cadmium, Arsenic)",
            "Flammability test for textile fabrics and plush toys",
            "Electrical safety test (< 24V operating voltage for electric toys)"
        ],
        "bis_service": {
            "name": "Toys Quality Control Order (QCO)",
            "type": "Mandatory ISI Scheme-I (Domestic & Foreign)",
            "portal": "Manakonline (manakonline.in)",
            "description": "Selling uncertified toys is illegal under the Toys QCO. Mandatory factory inspection by BIS."
        },
        "checklist": [
            {"id": "t1", "task": "Ensure non-toxic virgin polymer and food-grade pigments used", "status": "completed"},
            {"id": "t2", "task": "Check compliance with choking tube test for ages 0-3", "status": "completed"},
            {"id": "t3", "task": "Perform heavy metal testing in BIS-approved laboratory", "status": "pending"},
            {"id": "t4", "task": "Schedule BIS factory inspection audit via Manakonline", "status": "pending"}
        ]
    }
]

# Official Mock Registry mapping Licence Numbers to their officially registered Standards
LICENCE_REGISTRY = {
    "CM/L-1234567": {
        "product_name": "Electric Kettle",
        "standard_number": "IS 302 (Part 2/Sec 15) : 2009",
        "manufacturer": "AquaHeater"
    },
    "R-93010030": {
        "product_name": "Self-Ballasted LED Lamp",
        "standard_number": "IS 16102",
        "manufacturer": "EcoLite"
    },
    "R-41008765": {
        "product_name": "Laptop / Notebook Computer",
        "standard_number": "IS 13252 (Part 1) : 2010",
        "manufacturer": "HP"
    },
    "CM/L-8765432": {
        "product_name": "Domestic Pressure Cooker",
        "standard_number": "IS 2347 : 2017",
        "manufacturer": "TTK Prestige"
    }
}

import difflib

def search_bis_knowledge(query: str):
    """
    Intelligent semantic & keyword matcher against authoritative BIS knowledge base.
    Now includes Fuzzy Matching for spelling mistakes and Synonym Expansion.
    """
    if not query or not query.strip():
        return None, 0.0

    query_lower = query.lower()
    
    # 1. SYNONYM EXPANSION (Handle AC, Fridge, etc.)
    synonyms = {
        "ac": "air conditioner",
        "fridge": "refrigerator",
        "tv": "television",
        "pc": "laptop computer"
    }
    
    # Replace synonyms in the query
    for abbreviation, full_word in synonyms.items():
        # Use regex to replace exact words
        query_lower = re.sub(rf'\b{abbreviation}\b', full_word, query_lower)
    
    # Clean punctuation
    clean_words = set(re.findall(r'\b[a-z0-9\-]+\b', query_lower))

    scored_candidates = []
    
    for item in BIS_STANDARDS_KNOWLEDGE:
        score = 0
        
        # Build a list of valid target words for this item
        target_words = set()
        target_words.add(item["id"])
        target_words.update(re.findall(r'\b[a-z0-9\-]+\b', item["product_name"].lower()))
        for kw in item["keywords"]:
            target_words.update(re.findall(r'\b[a-z0-9\-]+\b', kw.lower()))
            
        # 2. FUZZY MATCHING (Handle spelling mistakes)
        for user_word in clean_words:
            # Skip very short words for fuzzy matching
            if len(user_word) < 3:
                if user_word in target_words:
                    score += 5
                continue
                
            # Find close matches (typo tolerance)
            matches = difflib.get_close_matches(user_word, target_words, n=1, cutoff=0.75)
            if matches:
                # 0.75 cutoff means "refrigrator" will match "refrigerator"
                score += 10
        
        # 1. Exact ID match (e.g. "laptop")
        if item["id"] in clean_words:
            score += 30
            
        # 2. Product Name tokens (Exact)
        prod_words = set(re.findall(r'\b[a-z0-9\-]+\b', item["product_name"].lower()))
        matched_prod_words = clean_words.intersection(prod_words)
        score += len(matched_prod_words) * 15

        # 3. Specific Keywords
        for kw in item["keywords"]:
            kw_clean = kw.lower()
            if kw_clean in query_lower:
                # Longer multi-word keyword match gets higher priority
                score += 10 + (len(kw_clean.split()) * 5)
                
        # 4. Standard Number Match (e.g. "IS 13252", "IS 302", "13252")
        std_clean = item["standard_number"].lower().replace(":", "").replace("(", "").replace(")", "")
        generic_tokens = {"part", "sec", "iec", "and"}
        std_tokens = [tok for tok in std_clean.split() if len(tok) >= 3 and tok not in generic_tokens]
        matched_std_tokens = [tok for tok in std_tokens if tok in query_lower]
        if matched_std_tokens:
            score += len(matched_std_tokens) * 25

        if score > 0:
            scored_candidates.append((score, item))

    if scored_candidates:
        scored_candidates.sort(key=lambda x: x[0], reverse=True)
        top_score, top_item = scored_candidates[0]
        # Calculate normalized relevance score between 0.70 and 0.98
        relevance = min(0.98, max(0.70, 0.65 + (top_score / 100.0)))
        return top_item, relevance

    # No match found -> Return None so Uncertainty Engine can trigger
    return None, 0.0
